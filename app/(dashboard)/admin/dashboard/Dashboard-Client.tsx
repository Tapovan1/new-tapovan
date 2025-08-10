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
  ChevronRight,
  School,
  Target,
} from "lucide-react";
import Link from "next/link";
// import PendingActionsModal from "@/components/PendingActionModel";

interface AdminDashboardClientProps {
  dashboardData: any;
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
        return "bg-red-500/10 border-red-500/20 text-red-300";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";
      case "low":
        return "bg-blue-500/10 border-blue-500/20 text-blue-300";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-300";
    }
  };

  const getStatColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500/20 text-blue-400";
      case "green":
        return "bg-green-500/20 text-green-400";
      case "purple":
        return "bg-purple-500/20 text-purple-400";
      case "cyan":
        return "bg-cyan-500/20 text-cyan-400";
      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 lg:pl-6 pl-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-slate-400">
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
              <h2 className="text-xl font-semibold text-white">
                System Overview
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  <span>
                    Active Classes:{" "}
                    {dashboardData.systemStats?.totalActiveClasses}/
                    {dashboardData.systemStats?.totalPossibleClasses}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>
                    Attendance Today:{" "}
                    {dashboardData.systemStats?.attendanceMarkedToday} marked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Standards Grid */}

          {/* System Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {dashboardData.quickStats.map((stat: any, index: number) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${getStatColor(stat.color)}`}
                    >
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-xl font-bold">
                          {stat.value}
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/20 text-green-300 text-xs"
                        >
                          {stat.trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Actions */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  Pending Actions
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Items requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.pendingActions.length > 0 ? (
                  dashboardData.pendingActions.map(
                    (action: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getPriorityColor(
                          action.priority
                        )}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{action.title}</h4>
                              <Badge
                                variant="secondary"
                                className="bg-slate-700 text-slate-300 text-xs"
                              >
                                {action.count}
                              </Badge>
                            </div>
                            <p className="text-sm opacity-80">
                              {action.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-3"
                            onClick={() => handleActionClick(action)}
                          >
                            {action.action}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <p>All tasks completed!</p>
                  </div>
                )}
              </CardContent>
            </Card> */}
            {/* under develoment message write */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  Pending Actions
                </CardTitle>
                <CardDescription className="text-slate-400">
                  This section is under development.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8 text-slate-400">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>Pending Actions feature is coming soon!</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Latest system activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map(
                    (activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-blue-500/20">
                          <CheckCircle className="h-3 w-3 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">
                            {activity.message}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/students">
                  <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span>Manage Students</span>
                  </Button>
                </Link>
                <Link href="/admin/marks">
                  <Button className="w-full h-20 bg-green-600 hover:bg-green-700 text-white flex-col gap-2">
                    <BookOpen className="h-6 w-6" />
                    <span>View Marks</span>
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700 text-white flex-col gap-2">
                    <Download className="h-6 w-6" />
                    <span>Download Reports</span>
                  </Button>
                </Link>
                <Link href="/admin/bulk-import">
                  <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 text-white flex-col gap-2">
                    <Upload className="h-6 w-6" />
                    <span>Bulk Import</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Actions Modal */}
      {/* <PendingActionsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={selectedAction?.type || ""}
        actionTitle={selectedAction?.title || ""}
      /> */}
    </div>
  );
}
