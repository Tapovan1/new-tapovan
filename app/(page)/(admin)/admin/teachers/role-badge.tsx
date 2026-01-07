import { Badge } from "@/components/ui/badge";
import { Shield, GraduationCap, UserCheck } from "lucide-react";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "ADMIN":
      return (
        <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-semibold border-0 px-3 py-1 shadow-sm">
          Super Admin
        </Badge>
      );
    case "TEACHER":
      return (
        <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 font-semibold border-0 px-3 py-1 shadow-sm">
          Teacher
        </Badge>
      );
    case "ATEACHER":
      return (
        <Badge className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 font-semibold border-0 px-3 py-1 shadow-sm">
          Attendance
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground font-medium border-border shadow-sm px-3 py-1"
        >
          {role}
        </Badge>
      );
  }
}
