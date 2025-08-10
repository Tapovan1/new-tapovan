import { getAllHolidays } from "@/lib/actions/holiday.action";
import HolidayManagementClient from "./Holiday-client";

export default async function HolidaysPage() {
  const holidays = await getAllHolidays();

  return <HolidayManagementClient initialHolidays={holidays} />;
}
