// import UnderDevelopment from "@/components/UnderDevelopment";
// import React from "react";

// const BulkImport = () => {
//   return (
//     <div>
//       <UnderDevelopment />
//     </div>
//   );
// };

// export default BulkImport;
"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

// Sample data for preview
const sampleStudentData = [
  {
    name: "John Doe",
    rollNo: 1,
    standard: 8,
    class: "Dhruv",
    phone: "9876543210",
    email: "john@email.com",
    parentName: "Robert Doe",
  },
  {
    name: "Jane Smith",
    rollNo: 2,
    standard: 8,
    class: "Dhruv",
    phone: "9876543211",
    email: "jane@email.com",
    parentName: "Michael Smith",
  },
  {
    name: "Alex Johnson",
    rollNo: 3,
    standard: 8,
    class: "Nachiketa",
    phone: "9876543212",
    email: "alex@email.com",
    parentName: "David Johnson",
  },
];

const sampleTeacherData = [
  {
    name: "Dr. Sarah Wilson",
    email: "sarah@school.com",
    phone: "9876543220",
    subjects: "Mathematics,Physics",
    standards: "9,10",
    classes: "Dhruv,Arjun",
  },
  {
    name: "Mr. James Brown",
    email: "james@school.com",
    phone: "9876543221",
    subjects: "English,Literature",
    standards: "8,9",
    classes: "Nachiketa,Krishna",
  },
];

export default function BulkImport() {
  const [admin, setAdmin] = useState<any>(null);
  const [importType, setImportType] = useState("students");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In real app, this would parse the Excel file
      // For demo, we'll show sample data
      if (importType === "students") {
        setPreviewData(sampleStudentData);
      } else {
        setPreviewData(sampleTeacherData);
      }
      setShowPreview(true);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Simulate import results
          setImportResults({
            total: previewData.length,
            successful: previewData.length - 1,
            failed: 1,
            errors: [{ row: 2, error: "Duplicate roll number found" }],
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = () => {
    // In real app, this would download an actual Excel template
    if (importType === "students") {
      alert(
        "Student template downloaded! Template includes columns: Name, Roll No, Standard, Class, Phone, Email, Parent Name, Address"
      );
    } else {
      alert(
        "Teacher template downloaded! Template includes columns: Name, Email, Phone, Subjects (comma-separated), Standards (comma-separated), Classes (comma-separated), Experience"
      );
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportResults(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Bulk Import</h1>
            <p className="text-slate-400">
              Import students and teachers using Excel files
            </p>
          </div>
        </div>

        {/* Import Type Selection */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Import Type</CardTitle>
            <CardDescription className="text-slate-400">
              Select what type of data you want to import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  importType === "students"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onClick={() => setImportType("students")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Students</h3>
                    <p className="text-slate-400 text-sm">
                      Import student records with personal details
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  importType === "teachers"
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onClick={() => setImportType("teachers")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <UserPlus className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Teachers</h3>
                    <p className="text-slate-400 text-sm">
                      Import teacher profiles with assignments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Download */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription className="text-slate-400">
              Download the Excel template for {importType} import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Download className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {importType === "students"
                      ? "Student Import Template"
                      : "Teacher Import Template"}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Excel file with required columns and sample data
                  </p>
                </div>
              </div>
              <Button
                onClick={downloadTemplate}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select your Excel file to import {importType} data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-full">
                    <FileSpreadsheet className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-2">
                      {selectedFile
                        ? selectedFile.name
                        : "Choose Excel file to upload"}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Supported formats: .xlsx, .xls (Max size: 10MB)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent cursor-pointer"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Select File
                        </span>
                      </Button>
                    </Label>
                    {selectedFile && (
                      <Button
                        onClick={resetImport}
                        variant="outline"
                        className="border-red-600 text-red-300 hover:bg-red-600/20 bg-transparent"
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
                    <span className="text-slate-300">Uploading...</span>
                    <span className="text-slate-300">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Preview */}
        {showPreview && !importResults && (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Preview
              </CardTitle>
              <CardDescription className="text-slate-400">
                Preview of data to be imported ({previewData.length} records)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {importType === "students" ? (
                        <>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Name
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Roll No
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Standard
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Class
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Phone
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Parent
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Name
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Email
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Phone
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Subjects
                          </th>
                          <th className="text-left py-2 px-3 text-slate-300 font-medium">
                            Standards
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-b border-slate-700/50">
                        {importType === "students" ? (
                          <>
                            <td className="py-2 px-3 text-white">{row.name}</td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.rollNo}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.standard}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.class}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.phone}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.parentName}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3 text-white">{row.name}</td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.email}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.phone}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.subjects}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {row.standards}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 5 && (
                <p className="text-slate-400 text-sm mb-4">
                  Showing first 5 records. Total: {previewData.length} records
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  onClick={resetImport}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResults && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Import Results
              </CardTitle>
              <CardDescription className="text-slate-400">
                Summary of the import operation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Records</p>
                        <p className="text-white text-xl font-bold">
                          {importResults.total}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Successful</p>
                        <p className="text-white text-xl font-bold">
                          {importResults.successful}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Failed</p>
                        <p className="text-white text-xl font-bold">
                          {importResults.failed}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <h4 className="text-red-300 font-medium">
                        Import Errors
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {importResults.errors.map((error: any, index: number) => (
                        <div key={index} className="text-red-300 text-sm">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={resetImport}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Import More Data
                  </Button>
                  <Link
                    href={
                      importType === "students"
                        ? "/admin/students"
                        : "/admin/teachers"
                    }
                  >
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    >
                      View {importType === "students" ? "Students" : "Teachers"}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
