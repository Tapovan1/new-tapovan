"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { GraduationCap } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MobileHeaderProps {
  user: User | null;
}

export function MobileHeader({ user }: MobileHeaderProps) {
  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900 lg:hidden">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger className="text-white hover:bg-slate-800 hover:text-white -ml-1" />

        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {user.role.toLowerCase() === "admin"
                ? "Admin Portal"
                : user.role.toLowerCase() === "teacher"
                ? "Teacher Portal"
                : "Student Portal"}
            </h1>
          </div>
        </div>

        <div className="ml-auto">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
