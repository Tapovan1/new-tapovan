import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/getUser";
import { getTeacherTests } from "@/lib/actions/test.action";
import TestsClient from "./tests-client";

// Sample test data with enhanced details

export default async function MyTests() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  const tests = await getTeacherTests(user.id);

  return <TestsClient tests={tests} teacher={user} />;
}
