"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";

export async function getClasses() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.class.findMany({
    include: {
      standard: true,
      students: {
        where: { status: "ACTIVE" },
      },
      teachers: {
        include: {
          teacher: true,
        },
      },
    },
    orderBy: [{ standard: { level: "asc" } }, { name: "asc" }],
  });
}

export async function createClass(formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const standardId = formData.get("standardId") as string;

  try {
    await prisma.class.create({
      data: { name, standardId },
    });
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Class name already exists for this standard" };
    }
    return { error: "Failed to create class" };
  }
}

export async function updateClass(id: string, formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const standardId = formData.get("standardId") as string;

  try {
    await prisma.class.update({
      where: { id },
      data: { name, standardId },
    });
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Class name already exists for this standard" };
    }
    return { error: "Failed to update class" };
  }
}

export async function deleteClass(id: string) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return {
      error:
        "Failed to delete class. Make sure no students are assigned to it.",
    };
  }
}

export async function getTeacherClasses() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const teacherClasses = await prisma.teacherClass.findMany({
    where: { teacherId: user.id },
    include: {
      class: {
        include: {
          standard: true,
          students: {
            where: { status: "ACTIVE" },
            orderBy: { rollNo: "asc" },
          },
        },
      },
    },
  });

  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { teacherId: user.id },
    include: {
      subject: true,
    },
  });

  return teacherClasses.map((tc) => ({
    id: tc.classId,
    name: `${tc.class.standard.name}-${tc.class.name}`,
    standard: Number.parseInt(tc.class.standard.name) || 0,
    class: tc.class.name,
    students: tc.class.students,
    isClassTeacher: tc.isClassTeacher,
    subjects: teacherSubjects
      .filter((ts) => ts.subject.standardId === tc.class.standardId)
      .map((ts) => ts.subject),
  }));
}

export async function getClassStudents(classId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify teacher has access to this class
  const hasAccess = await prisma.teacherClass.findFirst({
    where: {
      teacherId: user.id,
      classId: classId,
    },
  });

  if (!hasAccess && user.role !== "ADMIN") {
    throw new Error("Unauthorized access to class");
  }

  const students = await prisma.student.findMany({
    where: {
      classId: classId,
      status: "ACTIVE",
    },
    include: {
      standard: true,
      class: true,
    },
    orderBy: { rollNo: "asc" },
  });

  return students;
}

export async function getAvailableClasses() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  if (user.role === "ADMIN") {
    // Admin can see all classes
    return await prisma.class.findMany({
      include: {
        standard: true,
      },
      orderBy: [{ standard: { level: "asc" } }, { name: "asc" }],
    });
  } else {
    // Teachers can only see their assigned classes
    const teacherClasses = await prisma.teacherClass.findMany({
      where: { teacherId: user.id },
      include: {
        class: {
          include: {
            standard: true,
          },
        },
      },
    });

    return teacherClasses.map((tc) => tc.class);
  }
}
