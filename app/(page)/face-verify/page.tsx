import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/getUser";
import FaceVerifyClient from "@/components/face-verify/face-verify-client";

export default async function FaceVerifyPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/");
  }

  return <FaceVerifyClient />;
}
