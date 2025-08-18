import { redirect } from "next/navigation";
import { getTeacherDashboardData } from "@/lib/actions/dashboard.action";
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
  BookOpen,
  Calendar,
  Plus,
  Clock,
  Award,
  FileText,
  Users,
  GraduationCap,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/actions/getUser";
// import { ThemeToggle } from "@/components/theme-toggle";

export default async function TeacherDashboard() {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  const dashboardData = await getTeacherDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="flex-1">
        {/* Enhanced Top Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome back, {user.name.split(" ")[1] || user.name}!{" "}
                  <span className="ml-2">👋</span>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* <ThemeToggle /> */}
                <Link href="/tests">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Tests
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8">
          {/* My Classes Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Classes
              </h2>
            </div>

            {dashboardData.myClasses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {dashboardData.myClasses.flatMap((classItem) =>
                  classItem.subjects.map((subject, index) => (
                    <Card
                      key={`${classItem.id}-${subject}-${index}`}
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {classItem.name} - {subject}
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-300">
                              Standard {classItem.standard} • Class{" "}
                              {classItem.class}
                            </CardDescription>
                          </div>
                          <Badge className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Users className="w-3 h-3" />
                            {classItem.students} students
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Link
                          href={`/marks?standard=${classItem.standard}&class=${
                            classItem.class
                          }&subject=${encodeURIComponent(subject)}`}
                          className="block"
                        >
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 group-hover:shadow-xl transition-all duration-300">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Enter Marks
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Classes Assigned
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    You haven't been assigned to any classes yet. Contact your
                    administrator.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Recent Activity & Teaching Summary */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity Card */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      Your recent actions and updates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-700/70 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        {activity.type === "test_created" && (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                        {activity.type === "attendance_marked" && (
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {activity.title}
                          </span>
                          <Badge
                            className={`${
                              activity.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      No recent activity
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teaching Summary Card */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      Teaching Summary
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      Overview of your teaching activities
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-700/70 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Active Classes
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {dashboardData.stats.totalClasses}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-700/70 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Total Students
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {dashboardData.stats.totalStudents}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-700/70 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Tests Created
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {dashboardData.stats.testsCreated}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Common tasks for your classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/marks">
                  <Button className="w-full h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex-col gap-2 shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all duration-300 group">
                    <BookOpen className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Marks Entry</span>
                  </Button>
                </Link>
                <Link href="/tests">
                  <Button className="w-full h-20 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-col gap-2 shadow-lg shadow-green-600/25 hover:shadow-xl transition-all duration-300 group">
                    <FileText className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">My Tests</span>
                  </Button>
                </Link>
                {dashboardData.teacher.permissions?.canMarkAttendance && (
                  <Link href="/attendance">
                    <Button className="w-full h-20 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white flex-col gap-2 shadow-lg shadow-purple-600/25 hover:shadow-xl transition-all duration-300 group">
                      <Calendar className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Mark Attendance</span>
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
