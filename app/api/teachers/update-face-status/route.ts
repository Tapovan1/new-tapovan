import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, isFaceRegistered } = body;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Update teacher's Isface field
    await prisma.teacher.update({
      where: { id: teacherId },
      data: { Isface: isFaceRegistered },
    });

    return NextResponse.json({
      success: true,
      message: "Face status updated successfully",
    });
  } catch (error) {
    console.error("Error updating face status:", error);
    return NextResponse.json(
      { error: "Failed to update face status" },
      { status: 500 }
    );
  }
}
