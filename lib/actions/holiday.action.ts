"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const currentUtcTime = new Date();
const indiaOffset = 330;
const indiaTime = new Date(currentUtcTime.getTime() + indiaOffset * 60000);
const indiaDateOnly = new Date(indiaTime);
indiaDateOnly.setHours(0, 0, 0, 0);

// console.log("indiaDateOnly", indiaDateOnly);
const indianDateString = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

export interface Holiday {
  id: string;
  date: Date;
  name: string;

  createdAt: Date;
  updatedAt: Date;
}

// Get all holidays
export async function getAllHolidays(): Promise<Holiday[]> {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: {
        date: "asc",
      },
    });
    return holidays;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw new Error("Failed to fetch holidays");
  }
}

// Get holidays for a specific month/year
export async function getHolidaysForMonth(
  month: number,
  year: number
): Promise<Holiday[]> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return holidays;
  } catch (error) {
    console.error("Error fetching holidays for month:", error);
    throw new Error("Failed to fetch holidays");
  }
}

// Check if a date is a holiday
export async function isHoliday(
  date: Date
): Promise<{ isHoliday: boolean; holiday?: Holiday }> {
  try {
    // Check for Sunday
    if (date.getDay() === 0) {
      return {
        isHoliday: true,
        holiday: {
          id: "sunday",
          date: date,
          name: "Sunday",

          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }

    // Check for saved holidays
    const holiday = await prisma.holiday.findUnique({
      where: {
        date: date,
      },
    });

    return {
      isHoliday: !!holiday,
      holiday: holiday || undefined,
    };
  } catch (error) {
    console.error("Error checking holiday:", error);
    return { isHoliday: false };
  }
}

// Add a new holiday
export async function addHoliday(date: string, name: string) {
  try {
    const holidayDate = new Date(date);

    // Check if holiday already exists
    const existingHoliday = await prisma.holiday.findUnique({
      where: {
        date: holidayDate,
      },
    });

    if (existingHoliday) {
      return {
        success: false,
        error: "Holiday already exists for this date",
      };
    }

    await prisma.holiday.create({
      data: {
        date: holidayDate,
        name,
      },
    });

    revalidatePath("/admin/holidays");
    return {
      success: true,
      message: "Holiday added successfully",
    };
  } catch (error) {
    console.error("Error adding holiday:", error);
    return {
      success: false,
      error: "Failed to add holiday",
    };
  }
}

// Update a holiday
export async function updateHoliday(id: string, date: string, name: string) {
  try {
    const holidayDate = new Date(date);

    // Check if another holiday exists for this date (excluding current one)
    const existingHoliday = await prisma.holiday.findFirst({
      where: {
        date: holidayDate,
        NOT: {
          id: id,
        },
      },
    });

    if (existingHoliday) {
      return {
        success: false,
        error: "Another holiday already exists for this date",
      };
    }

    await prisma.holiday.update({
      where: { id },
      data: {
        date: holidayDate,
        name,
      },
    });

    revalidatePath("/admin/holidays");
    return {
      success: true,
      message: "Holiday updated successfully",
    };
  } catch (error) {
    console.error("Error updating holiday:", error);
    return {
      success: false,
      error: "Failed to update holiday",
    };
  }
}

// Delete a holiday
export async function deleteHoliday(id: string) {
  try {
    await prisma.holiday.delete({
      where: { id },
    });

    revalidatePath("/admin/holidays");
    return {
      success: true,
      message: "Holiday deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return {
      success: false,
      error: "Failed to delete holiday",
    };
  }
}
