import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTOTPToken, TOTP_WINDOW_SECONDS } from "@/lib/attendance/totp";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        const session = await prisma.classroomSession.findUnique({
            where: { id: sessionId },
            select: { id: true, title: true, sessionSecret: true, activeUntil: true, status: true },
        });

        if (!session || session.status !== "ACTIVE") {
            return NextResponse.json({ error: "Session inactive or not found" }, { status: 404 });
        }

        const now = Date.now();
        if (new Date(session.activeUntil).getTime() < now) {
            return NextResponse.json({ error: "Session expired" }, { status: 410 });
        }

        const token = generateTOTPToken(session.sessionSecret, now);
        const secondsRemaining = TOTP_WINDOW_SECONDS - (Math.floor(now / 1000) % TOTP_WINDOW_SECONDS);

        return NextResponse.json({
            token,
            secondsRemaining,
            sessionId: session.id,
            title: session.title,
        });
    } catch (error) {
        console.error("Token Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
