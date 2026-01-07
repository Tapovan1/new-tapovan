"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma  from "../prisma"; // Declare the prisma variable
import { comparePassword } from "@/utils/password";
import { createSession } from "../session";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const user = await prisma.teacher.findUnique({
    where: {
      email: username,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    return {
      success: false,
      message: "Invalid password",
    };
  }

  const userId = user.id;

  await createSession(userId, user.role);
}

export async function faceLogin(teacherId: string) {
  console.log("🔐 Face login action called for teacher:", teacherId);

  if (!teacherId) {
    return {
      success: false,
      message: "Teacher ID is required",
    };
  }

  const teacher = await prisma.teacher.findUnique({
    where: {
      id: teacherId,
    },
  });

  if (!teacher) {
    console.error("❌ Teacher not found:", teacherId);
    return {
      success: false,
      message: "Teacher not found",
    };
  }

  console.log("✅ Teacher found:", teacher.name);

  // Create session (same as email/password login)
  await createSession(teacher.id, teacher.role);

  console.log("✅ Session created for face login");

  return {
    success: true,
  };
}

export async function logout() {
  (await cookies()).delete("session");
  redirect("/");
}

// export async function logoutAction() {
//   (await cookies()).delete("auth-token");
//   redirect("/");
// }

// export async function getCurrentUser() {
//   const token = (await cookies()).get("auth-token")?.value;

//   if (!token) {
//     return null;
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as {
//       userId: string;
//       role: string;
//     };

//     const user = await prisma.teacher.findUnique({
//       where: { id: decoded.userId },
//       select: {
//         id: true,
//         username: true,
//         name: true,
//         email: true,
//         role: true,
//         status: true,
//       },
//     });

//     return user?.status === "ACTIVE" ? user : null;
//   } catch {
//     return null;
//   }
// }
