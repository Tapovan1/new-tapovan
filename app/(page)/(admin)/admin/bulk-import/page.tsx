"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { bulkCreateStudents } from "@/lib/actions/student.action";
import { isValidStandardClassCombination } from "@/lib/constants/index";



function parseCSV(csvText: string): any[] {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";
      const normalizedHeader = header
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");

      // Map common field variations
      let fieldName = normalizedHeader;
      if (
        normalizedHeader.includes("roll") &&
        normalizedHeader.includes("number")
      ) {
        fieldName = "rollnumber";
      }

      // Convert numeric fields
      if (fieldName.includes("roll") || fieldName.includes("standard")) {
        row[fieldName] = value ? Number.parseInt(value) : "";
      } else {
        row[fieldName] = value;
      }
    });

    if (Object.values(row).some((v) => v !== "")) {
      data.push(row);
    }
  }

  return data;
}

async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        if (file.name.endsWith(".csv")) {
          resolve(parseCSV(data));
        } else {
          // For Excel files, we'll treat them as CSV for now
          // In a real app, you'd use a library like xlsx
          resolve(parseCSV(data));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export default function BulkImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateData = (data: any[]) => {
    const errors: any[] = [];
    const grNumbers = new Set();
    const rollNumbers = new Map(); // standard-class -> Set of roll numbers

    data.forEach((row, index) => {
      const rowNum = index + 1;
      const id = row.id || row.ID || "";

      // Required field validation with better field mapping
      if (!row.name)
        errors.push({ row: rowNum, field: "name", error: "Name is required" });

      const rollNo = row.rollNo || row.rollnumber || row.roll || "";
      const standard = row.standard?.toString() || "";
      const className = row.class || row.classname || "";
      const subClass = row.subclass || row.subclass || "";
      if (!rollNo)
        errors.push({
          row: rowNum,
          field: "rollNo",
          error: "Roll Number is required",
        });
      if (!standard)
        errors.push({
          row: rowNum,
          field: "standard",
          error: "Standard is required",
        });
      if (!className)
        errors.push({
          row: rowNum,
          field: "class",
          error: "Class is required",
        });



      // Standard-Class combination validation
      if (
        standard &&
        className &&
        !isValidStandardClassCombination(standard, className)
      ) {
        errors.push({
          row: rowNum,
          field: "combination",
          error: `Invalid standard-class combination: ${standard} - ${className}`,
        });
      }
      // if (!subClass)
      //   errors.push({
      //     row: rowNum,
      //     field: "subClass",
      //     error: "SubClass is required",
      //   });

      // Duplicate Roll Number in same standard-class
      if (standard && className && rollNo) {
        const key = `${standard}-${className}`;
        if (!rollNumbers.has(key)) {
          rollNumbers.set(key, new Set());
        }
        const rollSet = rollNumbers.get(key)!;
        if (rollSet.has(rollNo)) {
          errors.push({
            row: rowNum,
            field: "rollNo",
            error: `Duplicate roll number ${rollNo} in ${standard}-${className}`,
          });
        } else {
          rollSet.add(rollNo);
        }
      }


    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setShowPreview(false);

    try {
      const parsedData = await parseExcelFile(file);

      if (parsedData.length === 0) {
        alert("No valid data found in the file.");
        setIsProcessing(false);
        return;
      }

      // Normalize data structure for students only
      const normalizedData = parsedData.map((row) => ({
        id: row.id || row.ID || "",
        name: row.name || "",
        rollNo: row.rollno || row.rollnumber || row.roll || "",
        standard: row.standard?.toString() || "",
        class: row.class || row.classname || "",
        subclass: row.subclass || row.subclass || "",
      }));

      setPreviewData(normalizedData);
      validateData(normalizedData);
      setShowPreview(true);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert(
        "Error parsing file. Please ensure it's a valid CSV or Excel file."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validateData(previewData)) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Prepare data for bulk creation
      const studentsData = previewData.map((row) => ({
        id: row.id,
        name: row.name,
        rollNo: Number.parseInt(row.rollNo),
        standard: row.standard,
        className: row.class,
        subclass: row.subclass,
      }));

      // Update progress to 30%
      setUploadProgress(30);

      // Call the real server action
      const result = await bulkCreateStudents(studentsData);

      // Update progress to 70%
      setUploadProgress(70);

      if (result.error) {
        throw new Error(result.error);
      }

      // Process results
      const successful =
        result.results?.filter((r: any) => r.success).length || 0;
      const failed = result.results?.filter((r: any) => r.error).length || 0;
      const errors =
        result.results
          ?.filter((r: any) => r.error)
          .map((r: any, index: number) => ({
            row: index + 1,
            error: r.error,
          })) || [];

      // Update progress to 100%
      setUploadProgress(100);

      setImportResults({
        total: studentsData.length,
        successful,
        failed,
        errors,
      });
    } catch (error) {
      console.error("Error importing students:", error);
      setImportResults({
        total: previewData.length,
        successful: 0,
        failed: previewData.length,
        errors: [
          {
            row: 1,
            error: error instanceof Error ? error.message : "Import failed",
          },
        ],
      });
      setUploadProgress(100);
    } finally {
      setIsUploading(false);
    }
  };

  const generateTemplate = () => {
    const headers = ["Name", "Roll Number", "Standard", "Class"];
    const sampleData = [
      ["Alex Johnson", "3", "8", "Nachiketa"],
      ["Jane Smith", "2", "8", "Dhruv"],
      ["Thakkar Smit", "1", "4", "Dhruv"],
    ];

    const csvContent = [headers, ...sampleData]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportResults(null);
    setUploadProgress(0);
    setValidationErrors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bulk Import Students
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Import multiple students from CSV or Excel files
              </p>
            </div>
            <Button
              onClick={generateTemplate}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Select your CSV/Excel file to import student data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <FileSpreadsheet className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium mb-2">
                        {selectedFile
                          ? selectedFile.name
                          : "Choose CSV/Excel file to upload"}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Supported formats: .csv, .xlsx, .xls (Max size: 10MB)
                      </p>
                      {isProcessing && (
                        <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
                          <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" />
                          Processing file...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={isProcessing}
                      />
                      <Label htmlFor="file-upload">
                        <Button
                          variant="outline"
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-transparent"
                          asChild
                          disabled={isProcessing}
                        >
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Select File
                          </span>
                        </Button>
                      </Label>
                      {selectedFile && (
                        <Button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewData([]);
                            setShowPreview(false);
                            setValidationErrors([]);
                          }}
                          variant="outline"
                          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 bg-transparent"
                          disabled={isProcessing}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {uploadProgress < 30
                          ? "Preparing data..."
                          : uploadProgress < 70
                          ? "Creating students..."
                          : uploadProgress < 100
                          ? "Finalizing..."
                          : "Complete!"}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {validationErrors.length > 0 && showPreview && (
            <Card className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 mb-6">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Validation Errors ({validationErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div
                      key={index}
                      className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-50 dark:bg-red-500/10 rounded"
                    >
                      Row {error.row}, {error.field}: {error.error}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Preview */}
          {showPreview && previewData.length > 0 && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Data Preview
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Preview of data to be imported ({previewData.length} records)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-2 font-medium text-gray-900 dark:text-white">
                          Name
                        </th>
                        <th className="text-left p-2 font-medium text-gray-900 dark:text-white">
                          Roll No
                        </th>
                        <th className="text-left p-2 font-medium text-gray-900 dark:text-white">
                          Standard
                        </th>
                        <th className="text-left p-2 font-medium text-gray-900 dark:text-white">
                          Class
                        </th>
                        <th className="text-left p-2 font-medium text-gray-900 dark:text-white">
                          SubClass
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="p-2 text-gray-900 dark:text-white">
                            {row.name}
                          </td>
                          <td className="p-2 text-gray-900 dark:text-white">
                            {row.rollNo}
                          </td>
                          <td className="p-2 text-gray-900 dark:text-white">
                            {row.standard}
                          </td>
                          <td className="p-2 text-gray-900 dark:text-white">
                            {row.class}
                          </td>
                          <td className="p-2 text-gray-900 dark:text-white">
                            {row.subclass}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {validationErrors.length === 0 ? (
                        <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          Ready to import {previewData.length} students
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          Fix {validationErrors.length} validation errors before
                          importing
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleImport}
                      disabled={validationErrors.length > 0 || isUploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import {previewData.length} Students
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResults && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Results
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Summary of the import operation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Total Records
                          </p>
                          <p className="text-gray-900 dark:text-white text-xl font-bold">
                            {importResults.total}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Successful
                          </p>
                          <p className="text-gray-900 dark:text-white text-xl font-bold">
                            {importResults.successful}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Failed
                          </p>
                          <p className="text-gray-900 dark:text-white text-xl font-bold">
                            {importResults.failed}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <h4 className="text-red-600 dark:text-red-400 font-medium">
                          Import Errors
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {importResults.errors.map(
                          (error: any, index: number) => (
                            <div
                              key={index}
                              className="text-red-600 dark:text-red-400 text-sm"
                            >
                              Row {error.row}: {error.error}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={resetImport}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Import More Data
                    </Button>
                    <Link href="/admin/students">
                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                      >
                        View Students
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
