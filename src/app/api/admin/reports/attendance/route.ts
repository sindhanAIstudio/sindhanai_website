import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/reports/attendance — Categorized Attendance Engine
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const soiDomainId = searchParams.get("soiDomainId") || undefined;
        const batchId = searchParams.get("batchId") || undefined;
        const categoryFilter = searchParams.get("category") || undefined; // REGULAR | SPECIAL_ACTIVITY | EVENT

        // 1. Fetch all active students
        const students = await (prisma as any).user.findMany({
            where: {
                role: { name: "STUDENT" },
                deletedAt: null,
                ...(soiDomainId ? { soiDomainId } : {}),
                ...(batchId ? { batchId } : {}),
            },
            select: {
                id: true,
                name: true,
                rollNumber: true,
                registrationNumber: true,
                email: true,
                profilePicUrl: true,
                soiDomain: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
            },
            orderBy: { name: "asc" },
        });

        // 2. Fetch classroom sessions
        const classroomSessions = await (prisma as any).classroomSession.findMany({
            where: {
                ...(soiDomainId ? { soiDomainId } : {}),
            },
            include: {
                attendanceRecords: true,
            },
        });

        // 3. Fetch admin-marked holidays
        const holidays = await (prisma as any).calendarEvent.findMany({
            where: { type: "HOLIDAY" },
        });
        const holidayDateSet = new Set(holidays.map((h: any) => h.date));

        // 4. Identify distinct session dates and filter out Sundays, Holidays & Zero-Attendance Days
        const dateSessionMap = new Map<string, typeof classroomSessions>();

        classroomSessions.forEach((s: any) => {
            const dateStr = new Date(s.activeFrom).toISOString().split("T")[0];
            if (!dateSessionMap.has(dateStr)) {
                dateSessionMap.set(dateStr, []);
            }
            dateSessionMap.get(dateStr)!.push(s);
        });

        const validSessionDates: string[] = [];
        dateSessionMap.forEach((sessionsOnDate, dateStr) => {
            const dateObj = new Date(dateStr);
            const isSunday = dateObj.getDay() === 0;
            const isHoliday = holidayDateSet.has(dateStr);
            const totalScansOnDate = sessionsOnDate.reduce((acc: number, sess: any) => acc + sess.attendanceRecords.length, 0);

            // EXCLUSION RULE: Exclude Sundays, Exclude Admin Holidays, Exclude Zero-Attendance Days
            if (!isSunday && !isHoliday && totalScansOnDate > 0) {
                validSessionDates.push(dateStr);
            }
        });

        const totalValidDaysCount = validSessionDates.length || 1;

        // 5. Calculate attendance per student with category breakdowns
        const studentReports = students.map((student: any) => {
            let attendedDaysCount = 0;
            let regularCount = 0;
            let specialActivityCount = 0;
            let eventCount = 0;

            validSessionDates.forEach((dateStr) => {
                const sessionsOnDate = dateSessionMap.get(dateStr) || [];
                sessionsOnDate.forEach((sess: any) => {
                    sess.attendanceRecords.forEach((rec: any) => {
                        if (rec.studentId === student.id && (rec.status === "PRESENT" || rec.status === "VERIFIED")) {
                            if (!categoryFilter || rec.category === categoryFilter) {
                                attendedDaysCount += 1;
                            }
                            if (rec.category === "SPECIAL_ACTIVITY") specialActivityCount += 1;
                            else if (rec.category === "EVENT") eventCount += 1;
                            else regularCount += 1;
                        }
                    });
                });
            });

            const attendancePercentage = Math.round((attendedDaysCount / totalValidDaysCount) * 100);
            const isDefaulter = attendancePercentage < 75;

            return {
                student,
                totalValidDays: totalValidDaysCount,
                attendedDays: attendedDaysCount,
                regularCount,
                specialActivityCount,
                eventCount,
                attendancePercentage,
                isDefaulter,
            };
        });

        const totalStudentsCount = studentReports.length;
        const defaultersCount = studentReports.filter((r: any) => r.isDefaulter).length;
        const avgAttendancePercentage =
            totalStudentsCount > 0
                ? Math.round(studentReports.reduce((acc: number, r: any) => acc + r.attendancePercentage, 0) / totalStudentsCount)
                : 0;

        return NextResponse.json({
            summary: {
                totalValidDays: totalValidDaysCount,
                totalStudents: totalStudentsCount,
                defaultersCount,
                avgAttendancePercentage,
            },
            data: studentReports,
        });
    } catch (error) {
        console.error("GET Attendance Report Error:", error);
        return NextResponse.json({ error: "Failed to generate attendance report" }, { status: 500 });
    }
}
