import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const student = await (prisma as any).user.findUnique({
            where: { id: session.userId },
            include: {
                soiDomain: true,
                batch: true,
                department: true,
                attendanceRecords: {
                    include: {
                        session: true,
                    },
                    orderBy: { scannedAt: "desc" },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Fetch Holidays from Calendar
        const holidays = await (prisma as any).calendarEvent.findMany({
            where: { type: "HOLIDAY" },
        });

        return NextResponse.json({
            success: true,
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                rollNumber: student.rollNumber,
                deviceFingerprint: student.deviceFingerprint,
                soiDomain: student.soiDomain?.name,
                batch: student.batch?.name,
            },
            attendanceRecords: student.attendanceRecords.map((r: any) => ({
                id: r.id,
                date: r.scannedAt ? r.scannedAt.toISOString().split("T")[0] : r.createdAt.toISOString().split("T")[0],
                inTime: r.inTime ? new Date(r.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00 AM",
                outTime: r.outTime ? new Date(r.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "05:00 PM",
                status: r.status,
                category: r.category || "REGULAR",
                sessionTitle: r.session?.title || "Classroom Session",
            })),
            holidays: holidays.map((h: any) => ({
                date: h.date,
                title: h.title,
            })),
        });
    } catch (error) {
        console.error("GET Student Attendance Error:", error);
        return NextResponse.json({ error: "Failed to load student attendance" }, { status: 500 });
    }
}
