import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuthPermission } from "@/lib/rbac/guard";

export async function POST(req: Request) {
    try {
        const session = await requireAuthPermission("attendance:create");
        const { title, durationMinutes } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Session title is required" }, { status: 400 });
        }

        const duration = parseInt(durationMinutes) || 60;
        const activeFrom = new Date();
        const activeUntil = new Date(activeFrom.getTime() + duration * 60 * 1000);
        const sessionSecret = crypto.randomBytes(16).toString("hex");

        const classroomSession = await prisma.classroomSession.create({
            data: {
                title,
                instructorId: session.userId,
                sessionSecret,
                activeFrom,
                activeUntil,
                status: "ACTIVE",
            },
        });

        return NextResponse.json({
            success: true,
            sessionId: classroomSession.id,
            title: classroomSession.title,
            activeUntil: classroomSession.activeUntil,
        });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Insufficient permissions to create session" }, { status: 403 });
        }
        console.error("Create Session Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
