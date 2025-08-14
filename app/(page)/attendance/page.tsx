import { getUser } from "@/lib/actions/getUser";
import { redirect } from "next/navigation";
import AttendanceClient from "./Attendance-Client";
import {
  getTeacherAssignedClasses,
  getAttendanceHistory,
} from "@/lib/actions/attendnace.action";

// Sample student data for attendance marking

export default async function AttendancePage() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  // Check if user has permission to mark attendance
  // For now, we'll allow all teachers to mark attendance
  // You can modify this logic based on your requirements
  const hasPermission = user.role === "ATEACHER" || user.role === "ADMIN";

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-400">
            You don't have permission to mark attendance.
          </p>
        </div>
      </div>
    );
  }

  const assignedClasses = await getTeacherAssignedClasses(user.id);
  const attendanceHistory = await getAttendanceHistory(user.id, 2);

  return (
    <AttendanceClient
      teacher={user}
      assignedClasses={assignedClasses}
      attendanceHistory={attendanceHistory}
    />
  );
}
