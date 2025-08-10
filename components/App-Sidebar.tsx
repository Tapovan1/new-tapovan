"use client";

import type * as React from "react";
import {
  BookOpen,
  FileText,
  Home,
  LogOut,
  GraduationCap,
  Users,
  UserCheck,
  ClipboardList,
  BarChart3,
  Calendar,
  Settings,
  Award,
  BookMarked,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/actions/auth.action";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  // Admin navigation items
  const adminNavigationItems: Omit<NavigationItem, "current">[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: Users,
    },
    {
      name: "Teachers",
      href: "/admin/teachers",
      icon: UserCheck,
    },
    {
      name: "Teacher Assignment",
      href: "/admin/teacher-assignment",
      icon: ClipboardList,
    },
    {
      name: "Attendance",
      href: "/admin/attendance",
      icon: Calendar,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      name: "Holiday",
      href: "/admin/Holiday",
      icon: Calendar,
    },
  ];

  // Teacher navigation items
  const teacherNavigationItems: Omit<NavigationItem, "current">[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "My Tests",
      href: "/tests",
      icon: FileText,
    },
    {
      name: "Marks Entry",
      href: "/marks",
      icon: BookOpen,
    },
  ];

  const ateacher = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "My Tests",
      href: "/tests",
      icon: FileText,
    },
    {
      name: "Marks Entry",
      href: "/marks",
      icon: BookOpen,
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: Calendar,
    },
  ];

  // Function to get navigation items based on user role
  const getNavigationItems = (
    role: string
  ): Omit<NavigationItem, "current">[] => {
    switch (role.toLowerCase()) {
      case "admin":
        return adminNavigationItems;
      case "teacher":
        return teacherNavigationItems;
      case "ateacher":
        return ateacher;
      default:
        return [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: Home,
          },
        ];
    }
  };

  // Get navigation items for current user and add current state
  const navigation: NavigationItem[] = user
    ? getNavigationItems(user.role).map((item) => ({
        ...item,
        current:
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href)),
      }))
    : [];

  const handleLogout = async () => {
    await logout();
  };

  // Get portal title based on role
  const getPortalTitle = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "Admin Portal";
      case "teacher":
      case "ateacher":
        return "Teacher Portal";
      case "student":
        return "Student Portal";
      default:
        return "Portal";
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "teacher":
      case "ateacher":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "student":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Show loading state if user is null
  if (!user) {
    return (
      <Sidebar
        {...props}
        className="!w-64 bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700"
      >
        <SidebarHeader>
          <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar
      {...props}
      className="!w-64 bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 shadow-2xl"
    >
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {getPortalTitle(user.role)}
            </p>
            <Badge className={`text-xs mt-1 ${getRoleBadgeColor(user.role)}`}>
              {user.role.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* User Info */}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <nav className="flex-1 p-4 space-y-2">
          {navigation.length > 0 ? (
            navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    item.current
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      item.current
                        ? "text-white"
                        : "group-hover:scale-110 transition-transform duration-200"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })
          ) : (
            <div className="text-slate-400 text-sm px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              No navigation items available for your role.
            </div>
          )}
        </nav>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            © 2024 Student Portal
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
