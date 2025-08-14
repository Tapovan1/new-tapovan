import { Badge } from "@/components/ui/badge";
import { Shield, GraduationCap, UserCheck } from "lucide-react";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "ADMIN":
      return (
        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium border-blue-200 dark:border-blue-800 shadow-sm">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    case "TEACHER":
      return (
        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 font-medium border-green-200 dark:border-green-800 shadow-sm">
          <GraduationCap className="h-3 w-3 mr-1" />
          Teacher
        </Badge>
      );
    case "ATEACHER":
      return (
        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 font-medium border-purple-200 dark:border-purple-800 shadow-sm">
          <UserCheck className="h-3 w-3 mr-1" />
          Attendance
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground font-medium border-border shadow-sm"
        >
          {role}
        </Badge>
      );
  }
}
