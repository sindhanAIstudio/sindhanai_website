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

        // Helper to normalize date string (e.g. DD-MM-YYYY or YYYY-MM-DD -> YYYY-MM-DD)
        const normalizeDateStr = (input?: string | null): string | undefined => {
            if (!input || !input.trim()) return undefined;
            const clean = input.trim();
            if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(clean)) {
                const parts = clean.split(/[-\/]/);
                return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
            }
            if (/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/.test(clean)) {
                const parts = clean.split(/[-\/]/);
                return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
            }
            return clean;
        };

        // Date Range Filters (Optional — Cumulative by default if empty)
        const startDate = normalizeDateStr(searchParams.get("startDate"));
        const endDate = normalizeDateStr(searchParams.get("endDate"));

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

        // Helper to check if a record scan timestamp is at or after 4:30 PM (16:30 local time)
        const isAfter430PM = (rec: any): boolean => {
            if (rec.category === "SPECIAL_ACTIVITY") return true;
            const scanTime = rec.inTime || rec.scannedAt || rec.createdAt;
            if (!scanTime) return false;
            const d = new Date(scanTime);
            const hours = d.getHours();
            const minutes = d.getMinutes();
            return hours > 16 || (hours === 16 && minutes >= 30);
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

        // 4. Map valid dates and categorize based on actual record/session timestamps within [startDate, endDate]
        const regularValidDatesSet = new Set<string>();
        const specialValidDatesSet = new Set<string>();
        const eventValidDatesSet = new Set<string>();

        classroomSessions.forEach((s: any) => {
            const sessDate = toLocalDateString(s.activeFrom);
            const isSessAfter430 = s.activeFrom && isAfter430PM({ inTime: s.activeFrom });

            // Check session date
            if (!startDate || sessDate >= startDate) {
                if (!endDate || sessDate <= endDate) {
                    const dateObj = new Date(sessDate);
                    const isSunday = dateObj.getDay() === 0;
                    const isHoliday = holidayDateSet.has(sessDate);

                    if (!isSunday && !isHoliday) {
                        if (s.sessionType === "EVENT") {
                            eventValidDatesSet.add(sessDate);
                        } else if (s.sessionType === "SPECIAL_ACTIVITY" || isSessAfter430) {
                            specialValidDatesSet.add(sessDate);
                        } else {
                            regularValidDatesSet.add(sessDate);
                        }
                    }
                }
            }

            // Also check individual attendance record timestamps (in case scans took place on a date inside range)
            s.attendanceRecords.forEach((rec: any) => {
                const recDate = toLocalDateString(rec.inTime || rec.scannedAt || rec.createdAt || s.activeFrom);
                if (!startDate || recDate >= startDate) {
                    if (!endDate || recDate <= endDate) {
                        const dateObj = new Date(recDate);
                        const isSunday = dateObj.getDay() === 0;
                        const isHoliday = holidayDateSet.has(recDate);

                        if (!isSunday && !isHoliday) {
                            const isScanAfter430 = isAfter430PM(rec);
                            if (rec.category === "EVENT" || s.sessionType === "EVENT") {
                                eventValidDatesSet.add(recDate);
                            } else if (rec.category === "SPECIAL_ACTIVITY" || isScanAfter430 || s.sessionType === "SPECIAL_ACTIVITY" || isSessAfter430) {
                                specialValidDatesSet.add(recDate);
                            } else {
                                regularValidDatesSet.add(recDate);
                            }
                        }
                    }
                }
            });
        });

        const totalRegularDays = regularValidDatesSet.size;
        const totalSpecialDays = specialValidDatesSet.size;
        const totalEventDays = eventValidDatesSet.size;

        // 5. Calculate attendance per student with record-level date matching
        const studentReports = students.map((student: any) => {
            const regularAttendedDates = new Set<string>();
            const specialAttendedDates = new Set<string>();
            const eventAttendedDates = new Set<string>();

            classroomSessions.forEach((sess: any) => {
                const studentRecords = sess.attendanceRecords.filter(
                    (rec: any) => rec.studentId === student.id && (rec.status === "PRESENT" || rec.status === "VERIFIED")
                );

                studentRecords.forEach((rec: any) => {
                    const recDate = toLocalDateString(rec.inTime || rec.scannedAt || rec.createdAt || sess.activeFrom);
                    const isWithinStart = !startDate || recDate >= startDate;
                    const isWithinEnd = !endDate || recDate <= endDate;

                    if (isWithinStart && isWithinEnd) {
                        const isScanAfter430 = isAfter430PM(rec);
                        const isSessAfter430 = sess.activeFrom && isAfter430PM({ inTime: sess.activeFrom });

                        if (rec.category === "EVENT" || sess.sessionType === "EVENT") {
                            eventAttendedDates.add(recDate);
                        } else if (rec.category === "SPECIAL_ACTIVITY" || isScanAfter430 || isSessAfter430 || sess.sessionType === "SPECIAL_ACTIVITY") {
                            specialAttendedDates.add(recDate);
                        } else {
                            regularAttendedDates.add(recDate);
                        }
                    }
                });
            });

            const regularAttendedDays = regularAttendedDates.size;
            const specialActivityAttendedDays = specialAttendedDates.size;
            const eventAttendedDays = eventAttendedDates.size;

            // Primary Percentage is strictly REGULAR class attendance
            const regularPercentage = totalRegularDays > 0 ? Math.min(100, Math.round((regularAttendedDays / totalRegularDays) * 100)) : 0;
            const specialActivityPercentage = totalSpecialDays > 0 ? Math.min(100, Math.round((specialActivityAttendedDays / totalSpecialDays) * 100)) : 0;
            const eventPercentage = totalEventDays > 0 ? Math.min(100, Math.round((eventAttendedDays / totalEventDays) * 100)) : 0;

            const isDefaulter = totalRegularDays > 0 ? regularPercentage < 75 : false;

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
