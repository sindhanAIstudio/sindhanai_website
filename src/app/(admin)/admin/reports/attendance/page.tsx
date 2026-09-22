import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AttendanceReportClient from "./AttendanceReportClient";

export const metadata = {
    title: "Fair Attendance & Defaulters Dashboard | Admin Console",
    description: "View automated attendance percentages excluding Sundays, Holidays, and Zero-Attendance Days",
};

export default async function AttendanceReportPage() {
    const session = await getSession();
    if (session?.instructorType?.toLowerCase() === "scope") {
        redirect("/admin/scheduler");
    }
    return <AttendanceReportClient session={session} />;
}
