import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// Standard Hourly Time Slots from 08:30 to 19:00
export const DEFAULT_TIME_SLOTS = [
    "08:30-09:30",
    "09:30-10:30",
    "10:30-11:30",
    "11:30-12:30",
    "12:30-13:30",
    "13:30-14:30",
    "14:30-15:30",
    "15:30-16:30",
    "16:30-17:30",
    "17:30-18:30",
    "18:30-19:00",
];

// GET /api/admin/worklog — Fetch faculty worklog
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
        const targetUserId = searchParams.get("userId") || session.userId;

        // If targetUserId is different from current user, verify ADMIN/SUPER_ADMIN role
        if (targetUserId !== session.userId && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden access to other faculty worklogs" }, { status: 403 });
        }

        const worklogs = await (prisma as any).facultyWorklog.findMany({
            where: {
                userId: targetUserId,
                date,
            },
        });

        // Map entries over standard 11 time slots
        const timeSlotMap: Record<string, { id?: string; activity: string; mergedSpan: number }> = {};
        DEFAULT_TIME_SLOTS.forEach((slot) => {
            timeSlotMap[slot] = { activity: "", mergedSpan: 1 };
        });

        worklogs.forEach((w: any) => {
            timeSlotMap[w.timeSlot] = { id: w.id, activity: w.activity, mergedSpan: w.mergedSpan || 1 };
        });

        // Also fetch faculty members list for Admin view switcher dropdown
        const facultyList = await (prisma as any).user.findMany({
            where: { role: { name: { in: ["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] } } },
            select: { id: true, name: true, email: true, designation: true, role: { select: { name: true } } },
        });

        return NextResponse.json({
            date,
            targetUserId,
            worklogs: timeSlotMap,
            facultyList,
        });
    } catch (error) {
        console.error("GET Worklog Error:", error);
        return NextResponse.json({ error: "Failed to load faculty worklog" }, { status: 500 });
    }
}

// POST /api/admin/worklog — Upsert worklog entry
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { date, timeSlot, activity, mergedSpan, targetUserId } = body;

        const userIdToSave = targetUserId || session.userId;

        if (userIdToSave !== session.userId && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!date || !timeSlot) {
            return NextResponse.json({ error: "Date and Time Slot are required" }, { status: 400 });
        }

        const updated = await (prisma as any).facultyWorklog.upsert({
            where: {
                userId_date_timeSlot: {
                    userId: userIdToSave,
                    date,
                    timeSlot,
                },
            },
            update: {
                activity: activity || "",
                mergedSpan: mergedSpan ? parseInt(mergedSpan) : 1,
            },
            create: {
                userId: userIdToSave,
                date,
                timeSlot,
                activity: activity || "",
                mergedSpan: mergedSpan ? parseInt(mergedSpan) : 1,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("POST Worklog Error:", error);
        return NextResponse.json({ error: error.message || "Failed to save worklog" }, { status: 500 });
    }
}
