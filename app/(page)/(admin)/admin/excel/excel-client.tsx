"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  FileSpreadsheet,
  Download,
  Users,
  CheckCircle,
  Trash2,
  Filter,
  Calendar,
  Loader2,
  ClipboardList,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  getStandardsList,
  getClassesForStandard,
  getSubjectsForStandard,
  type StandardKey,
} from "@/lib/constants/index";
import { getTestByStdClassSubject } from "@/lib/actions/test.action";
import { getSelectedTestsDataForExcel } from "@/lib/actions/export-test";
import { exportTestDataToExcel } from "@/lib/excel/excel-test";

// Test data interface based on your action file
interface TestEntry {
  id: string;
  testName: string;
  testType: string;
  subject: string;
  date: string;
  status: "Active" | "Completed" | "Scheduled" | "Cancelled";
}

export default function ExcelManagementClient() {
  const [selectedStandard, setSelectedStandard] = useState<StandardKey | "">(
    ""
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [entries, setEntries] = useState<TestEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get available standards and classes
  const availableStandards = getStandardsList();
  const availableClasses = selectedStandard
    ? getClassesForStandard(selectedStandard)
    : [];
  const availableSubjects = selectedStandard
    ? getSubjectsForStandard(selectedStandard)
    : [];

  // Reset class when standard changes
  useEffect(() => {
    if (selectedStandard && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    } else {
      setSelectedClass("");
    }
  }, [selectedStandard, availableClasses]);

  // Generate report data using real API
  const handleGenerateReport = useCallback(async () => {
    if (!selectedStandard || !selectedClass) {
      toast({
        title: "Missing Selection",
        description: "Please select both standard and class",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSelectedEntries(new Set());

    try {
      // Use real API call
      const subjectFilter =
        selectedSubject === "all" ? undefined : selectedSubject;
      const testData = await getTestByStdClassSubject(
        selectedStandard,
        selectedClass,
        subjectFilter
      );

      // Transform the data to match our interface
      const transformedData: TestEntry[] = testData.map((test: any) => ({
        id: test.id,
        testName: test.name,
        testType: test.examType || "Regular",
        subject: test.subject,
        date: test.date,
        status: test.status || "Active",
      }));

      setEntries(transformedData);
      setHasGenerated(true);

      toast({
        title: "Report Generated",
        description: `Generated ${transformedData.length} test entries for Standard ${selectedStandard} - ${selectedClass}`,
      });
    } catch (error) {
      console.error("Error fetching test data:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to fetch test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedStandard, selectedClass, selectedSubject]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map((entry) => entry.id)));
    }
  }, [entries, selectedEntries]);

  // Handle individual selection
  const handleSelectEntry = useCallback(
    (entryId: string) => {
      const newSelected = new Set(selectedEntries);
      if (newSelected.has(entryId)) {
        newSelected.delete(entryId);
      } else {
        newSelected.add(entryId);
      }
      setSelectedEntries(newSelected);
    },
    [selectedEntries]
  );

  // Handle delete selected
  const handleDeleteSelected = useCallback(() => {
    if (selectedEntries.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select entries to delete",
        variant: "destructive",
      });
      return;
    }
    setShowDeleteDialog(true);
  }, [selectedEntries]);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    const remainingEntries = entries.filter(
      (entry) => !selectedEntries.has(entry.id)
    );
    setEntries(remainingEntries);
    setSelectedEntries(new Set());
    setShowDeleteDialog(false);

    toast({
      title: "Entries Deleted",
      description: `Successfully deleted ${selectedEntries.size} test entries`,
    });
  }, [entries, selectedEntries]);

  // Export to Excel
  const handleExportToExcel = async () => {
    if (selectedEntries.size === 0) {
      toast({
        title: "No Tests Selected",
        description: "Please select tests to export",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStandard || !selectedClass) {
      toast({
        title: "Missing Information",
        description: "Standard and class information is required",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    try {
      // Get selected test IDs
      const testIds = Array.from(selectedEntries);

      // Fetch test data with student marks
      const testData = await getSelectedTestsDataForExcel(
        selectedStandard,
        selectedClass,
        testIds
      );

      if (!testData || testData.students.length === 0) {
        toast({
          title: "No Data Found",
          description: "No student data found for the selected tests",
          variant: "destructive",
        });
        return;
      }

      // Generate Excel file
      const buffer = await exportTestDataToExcel(
        testData,
        selectedStandard,
        selectedClass
      );

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Test_Marks_Report_Std${selectedStandard}_${selectedClass}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Excel report exported with ${testData.students.length} students and ${testIds.length} tests`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export Excel report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Get test type badge color
  const getTestTypeBadgeColor = (testType: string) => {
    const colors: Record<string, string> = {
      unit_test:
        "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400",
      weekly_test:
        "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400",
      mid_term:
        "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400",
      purak_exam:
        "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400",
      final:
        "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400",
      Quiz: "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400",
      Assignment:
        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400",
      Regular:
        "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400",
    };
    return (
      colors[testType] ||
      "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400"
    );
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      Active:
        "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400",
      COMPLETED:
        "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400",
      PENDING:
        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400",
    };
    return (
      colors[status] ||
      "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Excel Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Advanced test data management and Excel export with student
                  marks
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedEntries.size > 0 && (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                size="sm"
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedEntries.size})
              </Button>
            )}
            {selectedEntries.size > 0 && (
              <Button
                onClick={handleExportToExcel}
                disabled={exporting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected ({selectedEntries.size})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Generate Report Section */}
        <Card className="bg-card/60 backdrop-blur-sm border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Generate Report
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Select standard, class, and optional subject to generate test data
              with student marks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Standard</Label>
                <Select
                  value={selectedStandard}
                  onValueChange={(value) =>
                    setSelectedStandard(value as StandardKey)
                  }
                >
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder="Select Standard" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableStandards.map((standard) => (
                      <SelectItem
                        key={standard}
                        value={standard}
                        className="hover:bg-accent focus:bg-accent"
                      >
                        Standard {standard}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Class</Label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={!selectedStandard}
                >
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue
                      placeholder={
                        selectedStandard
                          ? "Select Class"
                          : "Select Standard First"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableClasses.map((cls) => (
                      <SelectItem
                        key={cls}
                        value={cls}
                        className="hover:bg-accent focus:bg-accent"
                      >
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Subject (Optional)
                </Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem
                      value="all"
                      className="hover:bg-accent focus:bg-accent"
                    >
                      All Subjects
                    </SelectItem>
                    {availableSubjects.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        className="hover:bg-accent focus:bg-accent"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-transparent">Action</Label>
                <Button
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedStandard || !selectedClass}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {hasGenerated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Tests
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {entries.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Selected
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {selectedEntries.size}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Class
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      Standard {selectedStandard} - {selectedClass}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        {hasGenerated && (
          <Card className="bg-card/60 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Test Entries Overview
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Select tests to export with student marks and performance
                    data
                  </CardDescription>
                </div>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-accent bg-transparent"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {selectedEntries.size === entries.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-foreground font-medium mb-2">
                    Fetching Test Data
                  </h3>
                  <p className="text-muted-foreground">
                    Please wait while we fetch the test data...
                  </p>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-foreground font-medium mb-2">
                    No Test Data Found
                  </h3>
                  <p className="text-muted-foreground">
                    No tests found for Standard {selectedStandard} -{" "}
                    {selectedClass}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          <Checkbox
                            checked={
                              selectedEntries.size === entries.length &&
                              entries.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Test Name
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Test Type
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Subject
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr
                          key={entry.id}
                          className={`border-b border-border hover:bg-accent/50 transition-colors ${
                            selectedEntries.has(entry.id) ? "bg-accent/30" : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            <Checkbox
                              checked={selectedEntries.has(entry.id)}
                              onCheckedChange={() =>
                                handleSelectEntry(entry.id)
                              }
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                                  {index + 1}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">
                                  {entry.testName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className={`${getTestTypeBadgeColor(
                                entry.testType
                              )} border`}
                            >
                              {entry.testType}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className={`${getStatusBadgeColor(
                                entry.status
                              )} border`}
                            >
                              {entry.subject || "N/A"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {entry.date}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className={`${getStatusBadgeColor(
                                entry.status
                              )} border`}
                            >
                              {entry.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Selected Test Entries
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete {selectedEntries.size} selected
              test entries? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Entries
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
