import { redirect } from "next/navigation";
import { getAdminDashboardData } from "@/lib/actions/admin.action";
import AdminDashboardClient from "./Dashboard-Client";

export default async function AdminDashboard() {
  const dashboardData = await getAdminDashboardData();

  return <AdminDashboardClient dashboardData={dashboardData} />;
}
