// import UnderDevelopment from "@/components/UnderDevelopment";
// import React from "react";

// const Attendnace = () => {
//   return (
//     <div>
//       <UnderDevelopment />
//     </div>
//   );
// };

// export default Attendnace;

// import { getUser } from "@/lib/actions/getUser";
import { redirect } from "next/navigation";
import AttendanceReportClient from "./Attendnace";

export default async function AdminAttendancePage() {
  // const user = await getUser();

  // if (!user) {
  //   redirect("/");
  // }

  // if (user.role !== "ADMIN") {
  //   redirect("/dashboard");
  // }

  return <AttendanceReportClient />;
}
