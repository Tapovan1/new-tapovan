"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  School,
  Target,
} from "lucide-react";
import Link from "next/link";

// Mock data for the dashboard
// const mockDashboardData = {
//   quickStats: [
//     {
//       label: "Total Students",
//       value: "1,247",
//       trend: "+12%",
//       color: "blue",
//     },
//     {
//       label: "Active Classes",
//       value: "42",
//       trend: "+3%",
//       color: "green",
//     },
//     {
//       label: "Attendance Rate",
//       value: "94.2%",
//       trend: "+2.1%",
//       color: "purple",
//     },
//     {
//       label: "Pending Tasks",
//       value: "8",
//       trend: "-5",
//       color: "cyan",
//     },
//   ],
//   systemStats: {
//     totalActiveClasses: 42,
//     totalPossibleClasses: 45,
//     attendanceMarkedToday: 38,
//   },
//   recentActivity: [
//     {
//       message: "New student registration: John Doe (Class 10A)",
//       time: "2 minutes ago",
//     },
//     {
//       message: "Attendance marked for Class 9B by Mrs. Smith",
//       time: "15 minutes ago",
//     },
//     {
//       message: "Report generated: Monthly Performance Summary",
//       time: "1 hour ago",
//     },
//     {
//       message: "Bulk import completed: 45 new students added",
//       time: "3 hours ago",
//     },
//   ],
// };

interface AdminDashboardClientProps {
  dashboardData?: any;
}

export default function AdminDashboardClient({
  dashboardData,
}: AdminDashboardClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  const handleActionClick = (action: any) => {
    setSelectedAction(action);
    setModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-300";
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950/50 dark:border-gray-800 dark:text-gray-300";
    }
  };

  const getStatColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400";
      case "green":
        return "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400";
      case "purple":
        return "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400";
      case "cyan":
        return "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 lg:pl-6 pl-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your school system efficiently
              </p>
            </div>
            {/* Quick Action Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/admin/students">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </Button>
              </Link>
              <Link href="/admin/bulk-import">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* System Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                System Overview
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  <span>
                    Active Classes:{" "}
                    {dashboardData.systemStats?.totalActiveClasses || 0}/
                    {dashboardData.systemStats?.totalPossibleClasses || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>
                    Attendance Today:{" "}
                    {dashboardData.systemStats?.attendanceMarkedToday || 0}{" "}
                    marked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {dashboardData.quickStats?.map((stat: any, index: number) => (
              <Card
                key={index}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${getStatColor(stat.color)}`}
                    >
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {stat.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 dark:text-white text-xl font-bold">
                          {stat.value}
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 text-xs"
                        >
                          {stat.trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>

          {/* Pending Actions & Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Pending Actions - Under Development */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Actions
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  This section is under development.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8 text-gray-600 dark:text-gray-400">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>Pending Actions feature is coming soon!</p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Latest system activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentActivity?.length > 0 ? (
                  dashboardData.recentActivity.map(
                    (activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-950/50">
                          <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {activity.message}
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/students">
                  <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white flex-col gap-2 transition-all duration-200 hover:scale-105">
                    <Users className="h-6 w-6" />
                    <span>Manage Students</span>
                  </Button>
                </Link>
                <Link href="/admin/marks">
                  <Button className="w-full h-20 bg-green-600 hover:bg-green-700 text-white flex-col gap-2 transition-all duration-200 hover:scale-105">
                    <BookOpen className="h-6 w-6" />
                    <span>View Marks</span>
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col gap-2 transition-all duration-200 hover:scale-105">
                    <Download className="h-6 w-6" />
                    <span>Download Reports</span>
                  </Button>
                </Link>
                <Link href="/admin/bulk-import">
                  <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 text-white flex-col gap-2 transition-all duration-200 hover:scale-105">
                    <Upload className="h-6 w-6" />
                    <span>Bulk Import</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
