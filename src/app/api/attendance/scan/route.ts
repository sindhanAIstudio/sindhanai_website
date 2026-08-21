import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthPermission } from "@/lib/rbac/guard";
import { verifyTOTPToken } from "@/lib/attendance/totp";

export async function POST(req: Request) {
    try {
        const session = await requireAuthPermission("attendance:mark");
        const { sessionId, token, deviceFingerprint } = await req.json();

        if (!sessionId || !token) {
            return NextResponse.json({ error: "Session ID and TOTP token required" }, { status: 400 });
        }

        // 1. Fetch classroom session
        const classroomSession = await prisma.classroomSession.findUnique({
            where: { id: sessionId },
        });

        if (!classroomSession || classroomSession.status !== "ACTIVE") {
            return NextResponse.json({ error: "Classroom session is closed or inactive" }, { status: 400 });
        }

        if (new Date(classroomSession.activeUntil).getTime() < Date.now()) {
            return NextResponse.json({ error: "Classroom session has expired" }, { status: 400 });
        }

        // 2. Validate TOTP Token
        const isTotpValid = verifyTOTPToken(classroomSession.sessionSecret, token);
        if (!isTotpValid) {
            return NextResponse.json(
                { error: "Invalid or expired QR Code. Please scan the refreshed QR on screen." },
                { status: 400 }
            );
        }

        // 3. Client Device Fingerprint Anti-Spoofing Check
        const student = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, deviceFingerprint: true },
        });

        const activeFingerprint = deviceFingerprint || session.deviceFingerprint;

        if (student?.deviceFingerprint && activeFingerprint && student.deviceFingerprint !== activeFingerprint) {
            // Log anti-spoofing rejection
            await prisma.attendanceRecord.create({
                data: {
                    sessionId,
                    studentId: session.userId,
                    deviceFingerprint: activeFingerprint,
                    status: "REJECTED_FINGERPRINT_MISMATCH",
                },
            }).catch(() => { }); // Ignore duplicate error on rejected log

            return NextResponse.json(
                {
                    error: "Unrecognized Device Signature. Attendance rejected due to device mismatch.",
                    rejected: true,
                },
                { status: 403 }
            );
        }

        // Save device fingerprint if not set
        if (student && !student.deviceFingerprint && activeFingerprint) {
            await prisma.user.update({
                where: { id: student.id },
                data: { deviceFingerprint: activeFingerprint },
            });
        }

        // 4. Create Attendance Record
        const record = await prisma.attendanceRecord.create({
            data: {
                sessionId,
                studentId: session.userId,
                deviceFingerprint: activeFingerprint || "UNKNOWN",
                status: "VERIFIED",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Attendance verified successfully!",
            recordId: record.id,
            scannedAt: record.scannedAt,
            sessionTitle: classroomSession.title,
        });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Attendance already recorded for this session." }, { status: 400 });
        }
        if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Insufficient permissions to mark attendance" }, { status: 403 });
        }
        console.error("Scan Attendance Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
