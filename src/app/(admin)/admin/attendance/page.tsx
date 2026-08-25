import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AttendanceConsoleClient from "./AttendanceConsoleClient";

export const metadata = {
    title: "Live Attendance Portal | Admin Console",
    description: "Host anti-malpractice 5s dynamic QR attendance sessions and monitor real-time class rosters",
};

export default async function AttendancePage() {
    const session = await getSession();
    if (session?.role === "SUPER_ADMIN") {
        redirect("/admin");
    }

    return <AttendanceConsoleClient />;
}
