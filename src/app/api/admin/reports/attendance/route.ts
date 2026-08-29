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
        const searchQuery = searchParams.get("search")?.trim() || undefined;
        let soiDomainId = searchParams.get("soiDomainId") || undefined;
        const batchId = searchParams.get("batchId") || undefined;
        const categoryFilter = searchParams.get("category") || undefined; // REGULAR | SPECIAL_ACTIVITY | EVENT
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        // Date Range Filters (Default to Today's Local Date)
        const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
        const startDate = searchParams.get("startDate") || todayStr;
        const endDate = searchParams.get("endDate") || todayStr;

        // Fetch current user details from DB to check domain/department association
        const currentUser = await (prisma as any).user.findUnique({
            where: { id: session.userId },
            select: { soiDomainId: true, departmentId: true },
        });

        // Role-based default scoping if no search or explicit domain filter is selected
        if (!searchQuery && !soiDomainId && currentUser) {
            if ((session.role === "INSTRUCTOR" || session.role === "ADMIN") && currentUser.soiDomainId) {
                soiDomainId = currentUser.soiDomainId;
            }
        }

        // 1. Build student search filter
        const studentWhere: any = {
            role: { name: "STUDENT" },
            deletedAt: null,
            ...(soiDomainId ? { soiDomainId } : {}),
            ...(batchId ? { batchId } : {}),
        };

        if (searchQuery) {
            studentWhere.OR = [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { rollNumber: { contains: searchQuery, mode: "insensitive" } },
                { registrationNumber: { contains: searchQuery, mode: "insensitive" } },
                { email: { contains: searchQuery, mode: "insensitive" } },
            ];
        }

        // Fetch students matching filter
        const students = await (prisma as any).user.findMany({
            where: studentWhere,
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

        // Helper to format local date string YYYY-MM-DD without UTC timezone offset errors
        const toLocalDateString = (dInput: Date | string): string => {
            const d = new Date(dInput);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        // 2. Fetch classroom sessions with attendance records
        const classroomSessions = await (prisma as any).classroomSession.findMany({
            include: {
                attendanceRecords: true,
            },
        });

        // 3. Fetch admin-marked holidays
        const holidays = await (prisma as any).calendarEvent.findMany({
            where: { type: "HOLIDAY" },
        });
        const holidayDateSet = new Set(holidays.map((h: any) => h.date));

        // 4. Filter sessions strictly within [startDate, endDate] & identify valid dates per category
        const filteredSessions = classroomSessions.filter((s: any) => {
            const dateStr = toLocalDateString(s.activeFrom);
            return dateStr >= startDate && dateStr <= endDate;
        });

        const dateSessionMap = new Map<string, typeof classroomSessions>();
        filteredSessions.forEach((s: any) => {
            const dateStr = toLocalDateString(s.activeFrom);
            if (!dateSessionMap.has(dateStr)) {
                dateSessionMap.set(dateStr, []);
            }
            dateSessionMap.get(dateStr)!.push(s);
        });

        const regularValidDates: string[] = [];
        const specialValidDates: string[] = [];
        const eventValidDates: string[] = [];

        dateSessionMap.forEach((sessionsOnDate, dateStr) => {
            const dateObj = new Date(dateStr);
            const isSunday = dateObj.getDay() === 0;
            const isHoliday = holidayDateSet.has(dateStr);

            if (!isSunday && !isHoliday) {
                const regSessions = sessionsOnDate.filter((s: any) => !s.sessionType || s.sessionType === "REGULAR");
                const specSessions = sessionsOnDate.filter((s: any) => s.sessionType === "SPECIAL_ACTIVITY");
                const evtSessions = sessionsOnDate.filter((s: any) => s.sessionType === "EVENT");

                if (regSessions.length > 0) regularValidDates.push(dateStr);
                if (specSessions.length > 0) specialValidDates.push(dateStr);
                if (evtSessions.length > 0) eventValidDates.push(dateStr);
            }
        });

        const totalRegularDays = regularValidDates.length || (startDate === endDate ? 1 : 1);
        const totalSpecialDays = specialValidDates.length || (startDate === endDate ? 1 : 1);
        const totalEventDays = eventValidDates.length || (startDate === endDate ? 1 : 1);

        // 5. Calculate attendance per student with distinct category percentages
        const studentReports = students.map((student: any) => {
            let regularAttendedDays = 0;
            let specialActivityAttendedDays = 0;
            let eventAttendedDays = 0;

            filteredSessions.forEach((sess: any) => {
                const sessCategory = sess.sessionType || "REGULAR";
                const isAttended = sess.attendanceRecords.some(
                    (rec: any) => rec.studentId === student.id && (rec.status === "PRESENT" || rec.status === "VERIFIED")
                );

                if (isAttended) {
                    if (sessCategory === "SPECIAL_ACTIVITY") {
                        specialActivityAttendedDays += 1;
                    } else if (sessCategory === "EVENT") {
                        eventAttendedDays += 1;
                    } else {
                        regularAttendedDays += 1;
                    }
                }
            });

            // Primary Percentage is strictly REGULAR class attendance
            const regularPercentage = Math.min(100, Math.round((regularAttendedDays / totalRegularDays) * 100));
            const specialActivityPercentage = totalSpecialDays > 0 && specialActivityAttendedDays > 0
                ? Math.min(100, Math.round((specialActivityAttendedDays / totalSpecialDays) * 100))
                : 0;
            const eventPercentage = totalEventDays > 0 && eventAttendedDays > 0
                ? Math.min(100, Math.round((eventAttendedDays / totalEventDays) * 100))
                : 0;

            const isDefaulter = regularPercentage < 75;

            return {
                student,
                totalRegularDays,
                regularAttendedDays,
                regularPercentage,

                totalSpecialDays,
                specialActivityAttendedDays,
                specialActivityPercentage,

                totalEventDays,
                eventAttendedDays,
                eventPercentage,

                // Primary fields for table display & cards
                attendancePercentage: regularPercentage,
                isDefaulter,
            };
        });

        const totalStudentsCount = studentReports.length;
        const defaultersCount = studentReports.filter((r: any) => r.isDefaulter).length;
        const avgAttendancePercentage =
            totalStudentsCount > 0
                ? Math.round(studentReports.reduce((acc: number, r: any) => acc + r.regularPercentage, 0) / totalStudentsCount)
                : 0;

        const totalPages = Math.ceil(totalStudentsCount / limit) || 1;
        const paginatedReports = studentReports.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            summary: {
                totalRegularDays,
                totalSpecialDays,
                totalEventDays,
                totalStudents: totalStudentsCount,
                defaultersCount,
                avgAttendancePercentage,
                startDate,
                endDate,
            },
            pagination: {
                total: totalStudentsCount,
                page,
                limit,
                totalPages,
            },
            data: paginatedReports,
            allData: studentReports,
        });
    } catch (error) {
        console.error("GET Attendance Report Error:", error);
        return NextResponse.json({ error: "Failed to generate attendance report" }, { status: 500 });
    }
}
