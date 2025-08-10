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
  ArrowLeft,
  Search,
  Users,
  GraduationCap,
  Filter,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Teacher Management
                </h1>
                <p className="text-slate-400">
                  Manage faculty accounts and permissions
                </p>
              </div>
            </div>
          </div>
          <AddTeacherDialog />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    Total Teachers
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {filteredTeachers.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    Administrators
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {roleStats.admin}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Faculty</p>
                  <p className="text-2xl font-bold text-white">
                    {roleStats.teacher}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    Attendance Staff
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {roleStats.attendance}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, username, or role..."
                  value={currentSearchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white pl-10 h-11"
                />
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white min-w-[120px] text-center">
                <span className="text-sm font-medium">
                  {filteredTeachers.length}
                </span>
                <span className="text-slate-400 text-sm ml-1">
                  {filteredTeachers.length === 1 ? "teacher" : "teachers"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Faculty Directory
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage teacher accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Teacher Information
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Contact Details
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Role & Permissions
                    </th>
                    <th className="text-center py-4 px-4 text-slate-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-lg font-medium">
                              {currentSearchTerm
                                ? `No teachers found matching "${currentSearchTerm}"`
                                : "No teachers found"}
                            </p>
                            <p className="text-slate-500 text-sm mt-1">
                              {currentSearchTerm
                                ? "Try adjusting your search criteria"
                                : "Add your first teacher to get started"}
                            </p>
                          </div>
                          {currentSearchTerm && (
                            <Button
                              variant="outline"
                              onClick={() => handleSearch("")}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
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
                        className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${
                          index % 2 === 0 ? "bg-slate-800/20" : ""
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {teacher.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {teacher.name}
                              </p>
                              <p className="text-slate-400 text-sm">
                                @{teacher.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-slate-300 font-medium">
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
