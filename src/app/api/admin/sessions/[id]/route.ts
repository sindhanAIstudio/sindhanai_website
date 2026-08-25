import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/sessions/[id] — Live roster data with server-side pagination & lightweight polling
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const sessionUser = await getSession();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);

        const statsOnly = searchParams.get("statsOnly") === "true";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

        const session = await prisma.classroomSession.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                sessionType: true,
                status: true,
                sessionSecret: true,
                soiDomainId: true,
                activeFrom: true,
                activeUntil: true,
                instructor: { select: { id: true, name: true, email: true } },
            },
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Fetch attendance records for this session
        const attendanceRecords = await (prisma as any).attendanceRecord.findMany({
            where: { sessionId: id },
            select: {
                studentId: true,
                status: true,
                scannedAt: true,
                verifiedBy: true,
                requestIp: true,
            },
        });

        const scannedCount = attendanceRecords.length;

        // Total active students count in this SOI Lab
        const totalStudentsCount = await prisma.user.count({
            where: {
                role: { name: "STUDENT" },
                deletedAt: null,
                ...((session as any).soiDomainId ? { soiDomainId: (session as any).soiDomainId } : {}),
            },
        });

        // 1. LIGHTWEIGHT POLLING OPTIMIZATION: Return tiny 50-byte stats payload
        if (statsOnly) {
            return NextResponse.json({
                sessionId: session.id,
                status: session.status,
                scannedCount,
                totalStudents: totalStudentsCount,
                pendingCount: Math.max(0, totalStudentsCount - scannedCount),
            });
        }

        // Map scanned records by studentId
        const recordMap = new Map();
        attendanceRecords.forEach((r: any) => {
            recordMap.set(r.studentId, r);
        });

        // 2. SERVER-SIDE PAGINATION & FILTERING
        const filter = searchParams.get("filter") || "SCANNED"; // "SCANNED" | "ALL" | "UNSCANNED"
        const scannedIds = Array.from(recordMap.keys());

        const studentWhere: any = {
            role: { name: "STUDENT" },
            deletedAt: null,
            ...((session as any).soiDomainId ? { soiDomainId: (session as any).soiDomainId } : {}),
        };

        if (filter === "SCANNED") {
            studentWhere.id = { in: scannedIds.length > 0 ? scannedIds : ["NO_SCANNED_STUDENTS"] };
        } else if (filter === "UNSCANNED") {
            studentWhere.id = { notIn: scannedIds };
        }

        const totalFiltered = await prisma.user.count({ where: studentWhere });

        const pagedStudents = await prisma.user.findMany({
            where: studentWhere,
            select: {
                id: true,
                name: true,
                rollNumber: true,
                registrationNumber: true,
                profilePicUrl: true,
                deviceFingerprint: true,
                email: true,
            },
            orderBy: { name: "asc" },
            skip: (page - 1) * limit,
            take: limit,
        });

        const roster = pagedStudents.map((s) => {
            const record = recordMap.get(s.id);
            return {
                student: s,
                isScanned: !!record,
                status: record ? record.status : "NOT SCANNED",
                scanTime: record ? record.scannedAt : null,
                verifiedBy: record ? record.verifiedBy : null,
                requestIp: record ? record.requestIp : null,
            };
        });

        return NextResponse.json({
            session,
            roster,
            pagination: {
                page,
                limit,
                totalStudents: totalStudentsCount,
                scannedCount,
                pendingCount: Math.max(0, totalStudentsCount - scannedCount),
                totalFilteredCount: totalFiltered,
                totalPages: Math.ceil(totalFiltered / limit) || 1,
            },
        });
    } catch (error) {
        console.error("GET Live Session Error:", error);
        return NextResponse.json({ error: "Failed to load live session roster" }, { status: 500 });
    }
}

// PUT /api/admin/sessions/[id] — Close session or 1-Click Bulk Mark Absent
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const sessionUser = await getSession();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { action } = body; // "CLOSE_SESSION" | "BULK_MARK_ABSENT"

        const session = await prisma.classroomSession.findUnique({
            where: { id },
            include: { attendanceRecords: true },
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (action === "CLOSE_SESSION") {
            const updated = await prisma.classroomSession.update({
                where: { id },
                data: { status: "CLOSED" },
            });
            return NextResponse.json({ success: true, message: "Session closed", data: updated });
        }

        if (action === "BULK_MARK_ABSENT") {
            // Find all un-scanned students
            const allStudents = await prisma.user.findMany({
                where: {
                    role: { name: "STUDENT" },
                    deletedAt: null,
                    ...((session as any).soiDomainId ? { soiDomainId: (session as any).soiDomainId } : {}),
                },
            });

            const scannedStudentIds = new Set(session.attendanceRecords.map((r) => r.studentId));
            const absentStudents = allStudents.filter((s) => !scannedStudentIds.has(s.id));

            // Create ABSENT records for all un-scanned students
            const createPromises = absentStudents.map((student) =>
                (prisma as any).attendanceRecord.create({
                    data: {
                        sessionId: session.id,
                        studentId: student.id,
                        deviceFingerprint: student.deviceFingerprint || "UNBOUND",
                        verifiedBy: "MANUAL_INSTRUCTOR",
                        status: "ABSENT",
                    },
                })
            );

            await Promise.all(createPromises);

            // Also mark session as CLOSED
            await prisma.classroomSession.update({
                where: { id },
                data: { status: "CLOSED" },
            });

            return NextResponse.json({
                success: true,
                message: `Bulk marked ${absentStudents.length} students as ABSENT and closed session.`,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("PUT Live Session Action Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update session" }, { status: 500 });
    }
}

// POST /api/admin/sessions/[id] — Manual Instructor Override (Mark Present/Absent or Reset Device)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const sessionUser = await getSession();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { studentId, status, resetDevice } = body;

        if (!studentId) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        if (resetDevice) {
            await prisma.user.update({
                where: { id: studentId },
                data: { deviceFingerprint: null },
            });
            return NextResponse.json({ success: true, message: "Student device fingerprint reset successfully!" });
        }

        if (status) {
            // Upsert attendance record
            await (prisma as any).attendanceRecord.upsert({
                where: {
                    sessionId_studentId: {
                        sessionId: id,
                        studentId,
                    },
                },
                update: {
                    status,
                    verifiedBy: "MANUAL_INSTRUCTOR",
                },
                create: {
                    sessionId: id,
                    studentId,
                    deviceFingerprint: "MANUAL_OVERRIDE",
                    verifiedBy: "MANUAL_INSTRUCTOR",
                    status,
                },
            });

            return NextResponse.json({ success: true, message: `Student status set to ${status}` });
        }

        return NextResponse.json({ error: "No valid operation provided" }, { status: 400 });
    } catch (error: any) {
        console.error("POST Live Session Override Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process manual override" }, { status: 500 });
    }
}
