import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import crypto from "crypto";

// GET /api/admin/sessions — List classroom attendance sessions with strict tenant scoping
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await (prisma as any).user.findUnique({
            where: { id: session.userId },
            select: { id: true, soiDomainId: true, role: { select: { name: true } } },
        });

        const userRole = user?.role?.name || session.role;
        const userLabId = user?.soiDomainId;

        const { searchParams } = new URL(req.url);
        const soiDomainIdParam = searchParams.get("soiDomainId") || undefined;
        const status = searchParams.get("status") || undefined;
        const todayOnlyParam = searchParams.get("todayOnly");
        const allParam = searchParams.get("all") === "true";

        // Auto-expire active sessions created on past calendar days
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        await (prisma as any).classroomSession.updateMany({
            where: {
                status: "ACTIVE",
                createdAt: { lt: todayStart },
            },
            data: { status: "COMPLETED" },
        });

        let whereClause: any = {
            ...(status ? { status } : {}),
            ...(todayOnlyParam === "true" || (!allParam && todayOnlyParam !== "false")
                ? { createdAt: { gte: todayStart } }
                : {}),
        };

        if (userRole === "ADMIN" || userRole === "INSTRUCTOR") {
            if (userLabId) {
                // Include sessions created for this lab OR created by instructors belonging to this lab
                whereClause.OR = [
                    { soiDomainId: userLabId },
                    { instructorId: session.userId },
                    { instructor: { soiDomainId: userLabId } },
                ];
            } else {
                whereClause.instructorId = session.userId;
            }
        } else if (userRole === "SUPER_ADMIN" && soiDomainIdParam) {
            whereClause.soiDomainId = soiDomainIdParam;
        }

        const sessions = await prisma.classroomSession.findMany({
            where: whereClause,
            include: {
                instructor: { select: { id: true, name: true, email: true, soiDomainId: true } },
                attendanceRecords: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                rollNumber: true,
                                registrationNumber: true,
                                profilePicUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ data: sessions });
    } catch (error) {
        console.error("GET Sessions Error:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

// POST /api/admin/sessions — Start new Classroom Attendance Session
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await (prisma as any).user.findUnique({
            where: { id: session.userId },
            select: { id: true, soiDomainId: true, soiDomain: { select: { name: true } } },
        });

        const body = await req.json();
        let { title, description, sessionType, soiDomainId, departmentId, durationMinutes } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: "Session Title is required" }, { status: 400 });
        }

        // Determine final soiDomainId (fallback to user's assigned lab)
        const finalSoiDomainId = soiDomainId || user?.soiDomainId || null;

        // Enrich generic titles with Lab Domain Name
        if (user?.soiDomain?.name && title.includes("Regular SOI Lab Attendance")) {
            title = `${user.soiDomain.name} Attendance — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        }

        // Check for existing session launched TODAY for this specific lab
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const existingSession = await (prisma as any).classroomSession.findFirst({
            where: {
                createdAt: { gte: todayStart },
                soiDomainId: finalSoiDomainId,
            },
            include: {
                instructor: { select: { id: true, name: true, email: true } },
                attendanceRecords: true,
            },
        });

        if (existingSession) {
            // Return existing active session so client automatically attaches to it
            return NextResponse.json({ success: true, data: existingSession, message: "Attached to existing daily session" });
        }

        // Generate a random high-entropy secret for TOTP HMAC signing
        const sessionSecret = crypto.randomBytes(32).toString("hex");

        const duration = parseInt(durationMinutes || "120", 10);
        const activeFrom = new Date();
        const activeUntil = new Date(activeFrom.getTime() + duration * 60 * 1000);

        const classroomSession = await (prisma as any).classroomSession.create({
            data: {
                title: title.trim(),
                description: description ? description.trim() : null,
                sessionType: sessionType || "REGULAR",
                soiDomainId: finalSoiDomainId,
                departmentId: departmentId || null,
                instructorId: session.userId,
                sessionSecret,
                activeFrom,
                activeUntil,
                status: "ACTIVE",
            },
            include: {
                instructor: { select: { id: true, name: true, email: true } },
                attendanceRecords: true,
            },
        });

        return NextResponse.json({ success: true, data: classroomSession });
    } catch (error: any) {
        console.error("POST Session Error:", error);
        return NextResponse.json({ error: error.message || "Failed to start session" }, { status: 500 });
    }
}
