import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/getUser";
import { getTeacherTests, getTestById } from "@/lib/actions/marks.action";
import MarksClient from "./Marks-Client";
import { EXAM_TYPES } from "@/lib/constants/exam";

export default async function MarksPage() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }


  const tests = await getTestById(user.id);

  return (
    <MarksClient teacher={user} initialTests={tests} examTypes={EXAM_TYPES} />
  );
}
