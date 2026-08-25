import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/calendar — Fetch calendar events, holidays, worklogs & attendance stats
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
        const year = searchParams.get("year") || new Date().getFullYear().toString();
        const month = searchParams.get("month") || (new Date().getMonth() + 1).toString().padStart(2, "0");
        const filterDomainId = searchParams.get("soiDomainId") || undefined;

        // Date prefix "YYYY-MM"
        const datePrefix = `${year}-${month.padStart(2, "0")}`;

        // 1. Event Scoping Rules:
        // - ADMIN or INSTRUCTOR: see Global Holidays (soiDomainId: null) + their assigned lab events/holidays
        // - SUPER_ADMIN: see all events or filter by specific soiDomainId
        let eventWhereClause: any = {
            deletedAt: null,
            date: { startsWith: datePrefix },
        };

        if (userRole === "ADMIN" || userRole === "INSTRUCTOR") {
            if (!userLabId) {
                // If user has no lab assigned, show global holidays only
                eventWhereClause.type = "HOLIDAY";
                eventWhereClause.soiDomainId = null;
            } else {
                // Global Holidays OR Events/Holidays scoped specifically to this user's lab
                eventWhereClause.OR = [
                    { type: "HOLIDAY", soiDomainId: null },
                    { soiDomainId: userLabId },
                ];
            }
        } else if (userRole === "SUPER_ADMIN" && filterDomainId) {
            eventWhereClause.OR = [
                { type: "HOLIDAY", soiDomainId: null },
                { soiDomainId: filterDomainId },
            ];
        }

        // Fetch calendar events
        const events = await (prisma as any).calendarEvent.findMany({
            where: eventWhereClause,
            orderBy: { date: "asc" },
        });

        // Enrich events with creator info
        const creatorIds = Array.from(new Set(events.map((e: any) => e.createdById).filter(Boolean)));
        const creators = await (prisma as any).user.findMany({
            where: { id: { in: creatorIds } },
            select: {
                id: true,
                name: true,
                role: { select: { name: true } },
            },
        });
        const creatorMap = new Map(creators.map((c: any) => [c.id, c]));

        const enrichedEvents = events.map((e: any) => ({
            ...e,
            creator: e.createdById ? creatorMap.get(e.createdById) || null : null,
        }));

        // 2. Instructor Scoping Rules:
        // - ADMIN / INSTRUCTOR: fetch instructors ONLY in their assigned lab
        // - SUPER_ADMIN: fetch all instructors
        let instructorWhereClause: any = {
            role: { name: { in: ["INSTRUCTOR", "ADMIN"] } },
        };
        if ((userRole === "ADMIN" || userRole === "INSTRUCTOR") && userLabId) {
            instructorWhereClause.soiDomainId = userLabId;
        }

        const instructors = await (prisma as any).user.findMany({
            where: instructorWhereClause,
            select: { id: true, name: true, email: true, designation: true, soiDomainId: true },
        });

        // Fetch session counts per date in this month
        const sessions = await (prisma as any).classroomSession.findMany({
            where: {
                ...(userRole === "ADMIN" || userRole === "INSTRUCTOR"
                    ? { soiDomainId: userLabId }
                    : filterDomainId
                        ? { soiDomainId: filterDomainId }
                        : {}),
            },
            include: {
                attendanceRecords: true,
            },
        });

        // Group attendance metrics by date "YYYY-MM-DD"
        const attendanceStatsByDate: Record<string, { totalSessions: number; totalScans: number }> = {};

        sessions.forEach((s: any) => {
            const dateStr = new Date(s.activeFrom).toISOString().split("T")[0];
            if (dateStr.startsWith(datePrefix)) {
                if (!attendanceStatsByDate[dateStr]) {
                    attendanceStatsByDate[dateStr] = { totalSessions: 0, totalScans: 0 };
                }
                attendanceStatsByDate[dateStr].totalSessions += 1;
                attendanceStatsByDate[dateStr].totalScans += s.attendanceRecords.length;
            }
        });

        const soiDomains = await prisma.soiDomain.findMany({
            where: { isActive: true },
            select: { id: true, name: true, code: true },
        });

        return NextResponse.json({
            events: enrichedEvents,
            attendanceStatsByDate,
            soiDomains,
            instructors,
        });
    } catch (error) {
        console.error("GET Calendar Error:", error);
        return NextResponse.json({ error: "Failed to load calendar events" }, { status: 500 });
    }
}

// POST /api/admin/calendar — Add Holiday or Special Event
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { date, type, title, description, time, soiDomainId, instructorIds } = body;

        if (!date || !type || !title) {
            return NextResponse.json(
                { error: "Date, Event Type, and Title are mandatory" },
                { status: 400 }
            );
        }

        const user = await (prisma as any).user.findUnique({
            where: { id: session.userId },
            select: { soiDomainId: true, role: { select: { name: true } } },
        });

        const userRole = user?.role?.name || session.role;

        let targetDomainId: string | null = null;

        if (userRole === "SUPER_ADMIN") {
            // Super Admin CANNOT create Events (workshops)
            if (type === "EVENT") {
                return NextResponse.json(
                    { error: "Super Admin cannot create Special Events. Event creation is restricted to Lab Admins." },
                    { status: 403 }
                );
            }
            // Super Admin CAN create Holidays with optional lab scope (null = All Labs)
            targetDomainId = soiDomainId || null;
        } else if (userRole === "ADMIN") {
            if (!user?.soiDomainId) {
                return NextResponse.json(
                    { error: "Your account is not assigned to any SOI Lab." },
                    { status: 400 }
                );
            }
            // Lab Admin creation (Holiday or Event) is locked to their lab
            targetDomainId = user.soiDomainId;
        } else {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const newEvent = await (prisma as any).calendarEvent.create({
            data: {
                date,
                type, // "HOLIDAY" | "EVENT"
                title: title.trim(),
                description: description ? description.trim() : null,
                time: time || null,
                soiDomainId: targetDomainId,
                instructorIds: Array.isArray(instructorIds) ? instructorIds.join(",") : instructorIds || null,
                createdById: session.userId,
            },
        });

        return NextResponse.json({ success: true, data: newEvent });
    } catch (error: any) {
        console.error("POST Calendar Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create calendar event" }, { status: 500 });
    }
}

// DELETE /api/admin/calendar — Soft-Delete Calendar Event with Hierarchical RBAC
export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const event = await (prisma as any).calendarEvent.findUnique({
            where: { id },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Fetch creator's role if createdById exists
        let creatorRole = "SUPER_ADMIN";
        if (event.createdById) {
            const creator = await (prisma as any).user.findUnique({
                where: { id: event.createdById },
                select: { role: { select: { name: true } } },
            });
            if (creator?.role?.name) {
                creatorRole = creator.role.name;
            }
        }

        // Hierarchical Deletion Rules:
        // 1. If created by SUPER_ADMIN -> Only SUPER_ADMIN can delete
        // 2. If created by ADMIN -> ADMIN or SUPER_ADMIN can delete
        // 3. If created by INSTRUCTOR -> INSTRUCTOR (creator), ADMIN, or SUPER_ADMIN can delete
        const currentRole = session.role;
        let canDelete = false;

        if (currentRole === "SUPER_ADMIN") {
            canDelete = true;
        } else if (currentRole === "ADMIN") {
            if (creatorRole === "ADMIN" || creatorRole === "INSTRUCTOR") {
                canDelete = true;
            }
        } else if (currentRole === "INSTRUCTOR") {
            if (creatorRole === "INSTRUCTOR" && event.createdById === session.userId) {
                canDelete = true;
            }
        }

        if (!canDelete) {
            return NextResponse.json(
                { error: "Access denied. You do not have permission to delete this event based on role hierarchy." },
                { status: 403 }
            );
        }

        // Soft Delete
        await (prisma as any).calendarEvent.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: "Calendar entry soft deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Calendar Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete calendar event" }, { status: 500 });
    }
}
