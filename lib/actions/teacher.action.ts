"use server";
import { saltAndHashPassword } from "@/utils/password";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export async function getAllTeacher() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true,
        Isface: true,
      },
    });

    if (!teachers) {
      return {
        success: true,
        message: "No teachers found",
      };
    }

    return {
      success:true,
      data:teachers
    }
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return {
      success: false,
      message: "An error occurred while fetching teachers",
    };
  }
}

export async function addTeacher(
  name: string,
  email: string,
  username: string,
  password: string,
  role: "ADMIN" | "TEACHER" | "ATEACHER"
) {
  try {
    const hashedPassword = await saltAndHashPassword(password);
    const newTeacher = await prisma?.teacher.create({
      data: {
        name,
        email,
        username,
        role,
        password: hashedPassword,
      },
    });

    revalidatePath("/admin/teachers");

    return {
      success: true,
      message: "Teacher added successfully",
      teacher: newTeacher,
    };
  } catch (error) {
    console.error("Error adding teacher:", error);
    return {
      success: false,
      message: "An error occurred while adding the teacher",
    };
  }
}

//update teacher

export async function updateTeacher(
  id: string,
  name: string,
  email: string,
  username: string,
  role: "ADMIN" | "TEACHER" | "ATEACHER"
) {
  try {
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: { name, email, username, role },
    });

    revalidatePath("/admin/teachers");

    return {
      success: true,
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    };
  } catch (error) {
    console.error("Error updating teacher:", error);
    return {
      success: false,
      message: "An error occurred while updating the teacher",
    };
  }
}

export async function deleteTeacher(id: string) {
  try {
    await prisma?.teacher.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Teacher deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return {
      success: false,
      message: "An error occurred while deleting the teacher",
    };
  }
}
