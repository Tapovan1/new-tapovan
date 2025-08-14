"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Users, GraduationCap, BarChart3, FileText } from "lucide-react"
import Link from "next/link"

// Sample report data
const reportData = {
  classReports: [
    {
      id: "CR001",
      className: "8-Dhruv Mathematics",
      standard: 8,
      class: "Dhruv",
      subject: "Mathematics",
      totalStudents: 25,
      testsCompleted: 3,
      avgMarks: 78.5,
      attendance: 92.1,
      lastUpdated: "2024-01-25",
    },
    {
      id: "CR002",
      className: "9-Nachiketa Mathematics",
      standard: 9,
      class: "Nachiketa",
      subject: "Mathematics",
      totalStudents: 28,
      testsCompleted: 2,
      avgMarks: 75.3,
      attendance: 89.7,
      lastUpdated: "2024-01-24",
    },
    {
      id: "CR003",
      className: "8-Dhruv Science",
      standard: 8,
      class: "Dhruv",
      subject: "Science",
      totalStudents: 25,
      testsCompleted: 2,
      avgMarks: 82.1,
      attendance: 92.1,
      lastUpdated: "2024-01-23",
    },
  ],
  testReports: [
    {
      id: "TR001",
      testName: "Mathematics Unit Test 1",
      class: "8-Dhruv",
      subject: "Mathematics",
      date: "2024-01-15",
      totalStudents: 25,
      avgMarks: 78.5,
      highestMarks: 95,
      lowestMarks: 45,
      passPercentage: 88,
    },
    {
      id: "TR002",
      testName: "Science Practical Test",
      class: "8-Dhruv",
      subject: "Science",
      date: "2024-01-18",
      totalStudents: 25,
      avgMarks: 42.8,
      highestMarks: 48,
      lowestMarks: 32,
      passPercentage: 92,
    },
  ],
}

export default function Reports() {
  const [teacher, setTeacher] = useState<any>(null)
  const [selectedReportType, setSelectedReportType] = useState("class")
  const [selectedClass, setSelectedClass] = useState("all")

  useEffect(() => {
    const teacherData = localStorage.getItem("teacher")
    if (teacherData) {
      setTeacher(JSON.parse(teacherData))
    } else {
      window.location.href = "/"
    }
  }, [])

  const handleDownloadReport = (reportId: string, type: string) => {
    console.log(`Downloading ${type} report:`, reportId)
    alert(`${type} report download started!`)
  }

  if (!teacher) return <div>Loading...</div>

  const filteredClassReports =
    selectedClass === "all"
      ? reportData.classReports
      : reportData.classReports.filter((report) => `${report.standard}-${report.class}` === selectedClass)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">My Reports</h1>
                <p className="text-slate-400 text-sm">View and download class and test reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Report Type Selection */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Report Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-slate-200 text-sm">Report Type</label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="class" className="text-white">
                      Class Reports
                    </SelectItem>
                    <SelectItem value="test" className="text-white">
                      Test Reports
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-200 text-sm">Filter by Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      All Classes
                    </SelectItem>
                    <SelectItem value="8-Dhruv" className="text-white">
                      8-Dhruv
                    </SelectItem>
                    <SelectItem value="9-Nachiketa" className="text-white">
                      9-Nachiketa
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Reports */}
        {selectedReportType === "class" && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Class Performance Reports
              </CardTitle>
              <CardDescription className="text-slate-400">Overall performance summary for your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClassReports.map((report) => (
                  <div key={report.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-medium text-lg">{report.className}</h3>
                        <p className="text-slate-400 text-sm">
                          Standard {report.standard} • Class {report.class} • {report.subject}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDownloadReport(report.id, "class")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Students</p>
                        <p className="text-white text-xl font-bold">{report.totalStudents}</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Tests</p>
                        <p className="text-white text-xl font-bold">{report.testsCompleted}</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Avg Marks</p>
                        <p className="text-white text-xl font-bold">{report.avgMarks}%</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Attendance</p>
                        <p className="text-white text-xl font-bold">{report.attendance}%</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Last Updated</p>
                        <p className="text-white text-sm font-medium">{report.lastUpdated}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Reports */}
        {selectedReportType === "test" && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Test Performance Reports
              </CardTitle>
              <CardDescription className="text-slate-400">
                Detailed analysis of individual test performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.testReports.map((report) => (
                  <div key={report.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-medium text-lg">{report.testName}</h3>
                        <p className="text-slate-400 text-sm">
                          {report.class} • {report.subject} • {report.date}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDownloadReport(report.id, "test")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Students</p>
                        <p className="text-white text-xl font-bold">{report.totalStudents}</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Average</p>
                        <p className="text-white text-xl font-bold">{report.avgMarks}%</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Highest</p>
                        <p className="text-white text-xl font-bold">{report.highestMarks}</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Lowest</p>
                        <p className="text-white text-xl font-bold">{report.lowestMarks}</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Pass %</p>
                        <p className="text-white text-xl font-bold">{report.passPercentage}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
