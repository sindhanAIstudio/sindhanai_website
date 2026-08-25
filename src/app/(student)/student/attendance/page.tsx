import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentAttendanceClient from "./StudentAttendanceClient";

export default async function StudentAttendancePage() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const student = await (prisma as any).user.findUnique({
        where: { id: session.userId },
        include: {
            soiDomain: true,
            batch: true,
            attendanceRecords: {
                include: { session: true },
                orderBy: { scannedAt: "desc" },
            },
        },
    });

    if (!student) {
        redirect("/login");
    }

    const holidays = await (prisma as any).calendarEvent.findMany({
        where: { type: "HOLIDAY" },
    });

    const formattedRecords = student.attendanceRecords.map((r: any) => ({
        id: r.id,
        date: r.scannedAt ? r.scannedAt.toISOString().split("T")[0] : r.createdAt.toISOString().split("T")[0],
        inTime: r.inTime ? new Date(r.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00 AM",
        outTime: r.outTime ? new Date(r.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "05:00 PM",
        status: r.status,
        category: r.category || "REGULAR",
        sessionTitle: r.session?.title || "Classroom Session",
    }));

    return (
        <StudentAttendanceClient
            student={{
                id: student.id,
                name: student.name,
                email: student.email,
                rollNumber: student.rollNumber,
                deviceFingerprint: student.deviceFingerprint,
                soiDomain: student.soiDomain?.name,
                batch: student.batch?.name,
            }}
            records={formattedRecords}
            holidays={holidays.map((h: any) => ({ date: h.date, title: h.title }))}
        />
    );
}
