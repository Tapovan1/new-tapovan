export const dynamic = "force-dynamic";
import { getAllTeacher } from "@/lib/actions/teacher.action";
import TeacherManagement from "./Teachers";

export default async function Page() {
  // Server-side data fetching
  const teachers = await getAllTeacher();

  if (Array.isArray(teachers.data)) {
    return <TeacherManagement initialTeachers={teachers.data} />;
  } else {
    // Handle error case, e.g., show an error message or pass an empty array
    return <div>Error: {teachers.message}</div>;
  }
}
