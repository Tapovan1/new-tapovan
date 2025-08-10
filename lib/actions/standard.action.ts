"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";

export async function getStandards() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.standard.findMany({
    include: {
      classes: {
        include: {
          students: {
            where: { status: "ACTIVE" },
          },
        },
      },
      subjects: true,
    },
    orderBy: { level: "asc" },
  });
}

export async function createStandard(formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const level = Number.parseInt(formData.get("level") as string);

  try {
    await prisma.standard.create({
      data: { name, level },
    });
    revalidatePath("/admin/standards");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Standard name or level already exists" };
    }
    return { error: "Failed to create standard" };
  }
}

export async function updateStandard(id: string, formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const level = Number.parseInt(formData.get("level") as string);

  try {
    await prisma.standard.update({
      where: { id },
      data: { name, level },
    });
    revalidatePath("/admin/standards");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Standard name or level already exists" };
    }
    return { error: "Failed to update standard" };
  }
}

export async function deleteStandard(id: string) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.standard.delete({ where: { id } });
    revalidatePath("/admin/standards");
    return { success: true };
  } catch (error) {
    return {
      error:
        "Failed to delete standard. Make sure no students or classes are assigned to it.",
    };
  }
}
