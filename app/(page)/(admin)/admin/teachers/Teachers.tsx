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
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  GraduationCap,
  Filter,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import AddTeacherDialog from "./Add-Teacher-Dialog";
import EditTeacherDialog from "./Edit-Teacher-Dialog";
import DeleteTeacher from "./Delete";
import { RoleBadge } from "./role-badge";

interface Teacher {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  password?: string;
}

interface TeacherManagementProps {
  initialTeachers: Teacher[];
}

export default function TeacherManagement({
  initialTeachers,
}: TeacherManagementProps) {
  const [filteredTeachers, setFilteredTeachers] = useState(initialTeachers);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

  // Client-side filtering for immediate feedback
  const handleSearch = (term: string) => {
    setCurrentSearchTerm(term);
    if (term.trim() === "") {
      setFilteredTeachers(initialTeachers);
    } else {
      const search = term.toLowerCase();
      const filtered = initialTeachers.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(search) ||
          teacher.email.toLowerCase().includes(search) ||
          teacher.username.toLowerCase().includes(search) ||
          teacher.role.toLowerCase().includes(search)
      );
      setFilteredTeachers(filtered);
    }
  };

  // Get role statistics
  const roleStats = {
    admin: filteredTeachers.filter((t) => t.role === "ADMIN").length,
    teacher: filteredTeachers.filter((t) => t.role === "TEACHER").length,
    attendance: filteredTeachers.filter((t) => t.role === "ATEACHER").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Teacher Management
                </h1>
                <p className="text-muted-foreground">
                  Manage faculty accounts and permissions
                </p>
              </div>
            </div>
          </div>
          <AddTeacherDialog />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Teachers
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {filteredTeachers.length}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500 font-medium">
                      Active
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Administrators
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {roleStats.admin}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      System access
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Faculty
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {roleStats.teacher}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Teaching staff
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Attendance Staff
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {roleStats.attendance}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Support staff
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, username, or role..."
                  value={currentSearchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="bg-muted/50 border border-border/50 rounded-lg px-4 py-2.5 text-foreground min-w-[140px] text-center">
                <span className="text-sm font-medium">
                  {filteredTeachers.length}
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  {filteredTeachers.length === 1 ? "teacher" : "teachers"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Faculty Directory
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage teacher accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">
                      Teacher Information
                    </th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">
                      Contact Details
                    </th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">
                      Role & Permissions
                    </th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-foreground text-lg font-medium">
                              {currentSearchTerm
                                ? `No teachers found matching "${currentSearchTerm}"`
                                : "No teachers found"}
                            </p>
                            <p className="text-muted-foreground text-sm mt-1">
                              {currentSearchTerm
                                ? "Try adjusting your search criteria"
                                : "Add your first teacher to get started"}
                            </p>
                          </div>
                          {currentSearchTerm && (
                            <Button
                              variant="outline"
                              onClick={() => handleSearch("")}
                              className="mt-2"
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher, index) => (
                      <tr
                        key={teacher.id}
                        className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                          index % 2 === 0 ? "bg-muted/5" : ""
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-primary-foreground font-semibold text-sm">
                                {teacher.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="text-foreground font-semibold">
                                {teacher.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                @{teacher.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-foreground font-medium">
                              {teacher.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <RoleBadge role={teacher.role} />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2">
                            <EditTeacherDialog teacher={teacher} />
                            <DeleteTeacher
                              teacherId={teacher.id}
                              teacherName={teacher.name}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
