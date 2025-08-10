import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "ADMIN":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-normal">
          Admin
        </Badge>
      );
    case "TEACHER":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-normal">
          Teacher
        </Badge>
      );
    case "ATEACHER":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 font-normal">
          ATTENDANCE
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-gray-600 font-normal">
          {role}
        </Badge>
      );
  }
}
