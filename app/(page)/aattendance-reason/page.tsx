import { Suspense } from "react";
import type { Metadata } from "next";
import AttendanceReasonsClient from "./attendance-reasons-client";

export const metadata: Metadata = {
  title: "Attendance Reasons | School Management",
  description:
    "Manage absent student reasons and track attendance explanations",
};

export default function AttendanceReasonsPage() {
  return (
    <div className="min-h-screen">
      <AttendanceReasonsClient />
    </div>
  );
}
