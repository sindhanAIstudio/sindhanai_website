import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyDynamicQrToken, isIpInSubnet } from "@/lib/attendance/totp";
import os from "os";

function getClientIp(req: Request): string {
    // Only trust X-Forwarded-For if explicitly running behind a verified reverse proxy (Nginx, Cloudflare, etc.)
    if (process.env.TRUSTED_PROXY === "true") {
        const forwarded = req.headers.get("x-forwarded-for");
        if (forwarded) return forwarded.split(",")[0].trim();
        const realIp = req.headers.get("x-real-ip");
        if (realIp) return realIp.trim();
    }

    // Default to direct socket connection or local IPv4 fallback
    try {
        const interfaces = os.networkInterfaces();
        for (const name in interfaces) {
            const iface = interfaces[name];
            if (!iface) continue;
            for (const alias of iface) {
                const isIpv4 = alias.family === "IPv4" || (alias.family as any) === 4;
                if (isIpv4 && !alias.internal && alias.address !== "127.0.0.1") {
                    return alias.address;
                }
            }
        }
    } catch { }

    return "127.0.0.1";
}

export async function POST(req: Request) {
    try {
        const userSession = await getSession();
        if (!userSession) {
            return NextResponse.json({ error: "Authentication required to submit attendance" }, { status: 401 });
        }

        const body = await req.json();
        const { token, deviceFingerprint } = body;

        if (!token || !deviceFingerprint) {
            return NextResponse.json(
                { error: "Security token and device fingerprint are required" },
                { status: 400 }
            );
        }

        // 1. Decode token to extract sessionId without verification first to lookup secret
        let payload: any;
        try {
            const decodedJson = Buffer.from(token.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
            payload = JSON.parse(decodedJson);
        } catch {
            return NextResponse.json({ error: "Malformed security token format" }, { status: 400 });
        }

        if (!payload || !payload.sessionId) {
            return NextResponse.json({ error: "Invalid QR code payload structure" }, { status: 400 });
        }

        // Fetch classroom session
        const classroomSession = await prisma.classroomSession.findUnique({
            where: { id: payload.sessionId },
        });

        if (!classroomSession) {
            return NextResponse.json({ error: "Classroom session not found" }, { status: 404 });
        }

        if (classroomSession.status !== "ACTIVE") {
            return NextResponse.json({ error: "Attendance session has closed or expired" }, { status: 400 });
        }

        // 2. Perform 5-Second HMAC TOTP Security Check
        const totpResult = verifyDynamicQrToken(token, classroomSession.sessionSecret);
        if (!totpResult.valid) {
            return NextResponse.json(
                { error: totpResult.error || "QR code expired. Please scan live code from display screen." },
                { status: 400 }
            );
        }

        // 3. Wi-Fi Whitelist Security Check
        const clientIp = getClientIp(req);
        const activeWhitelists = await prisma.wifiWhitelist.findMany({
            where: { isActive: true },
        });

        if (activeWhitelists.length > 0) {
            const isIpAllowed = activeWhitelists.some((w) =>
                isIpInSubnet(clientIp, w.ipAddressOrSubnet)
            );

            if (!isIpAllowed) {
                return NextResponse.json(
                    {
                        error: `Location Security Error: You must be connected to authorized Lab Wi-Fi network. Your IP: (${clientIp}) is not whitelisted.`,
                    },
                    { status: 403 }
                );
            }
        }

        // 4. Hardware Device Binding Check & Anti-Proxy Security Rule
        const student = await prisma.user.findUnique({
            where: { id: userSession.userId },
        });

        if (!student) {
            return NextResponse.json({ error: "Student user account not found" }, { status: 404 });
        }

        // Anti-Proxy Rule: Ensure this device fingerprint is not already registered to ANOTHER student in the DB
        const otherStudentWithSameDevice = await prisma.user.findFirst({
            where: {
                deviceFingerprint,
                id: { not: student.id },
                deletedAt: null,
            },
            select: { name: true, rollNumber: true, email: true },
        });

        if (otherStudentWithSameDevice) {
            return NextResponse.json(
                {
                    error: `Anti-Proxy Security Warning: This device (${deviceFingerprint.substring(0, 12)}) is registered to another student (${otherStudentWithSameDevice.name}). Proxy attendance is strictly prohibited. Ask your lab instructor to reset device binding if you changed devices.`,
                },
                { status: 403 }
            );
        }

        const isLegacyFingerprint = student.deviceFingerprint && !student.deviceFingerprint.startsWith("DEV-");
        if (!student.deviceFingerprint || isLegacyFingerprint) {
            // First time scanning or upgrading legacy Mozilla userAgent fingerprint — lock stable DEV-xxxx device ID to student profile
            await prisma.user.update({
                where: { id: student.id },
                data: { deviceFingerprint },
            });
        } else if (student.deviceFingerprint !== deviceFingerprint) {
            return NextResponse.json(
                {
                    error: `Device Security Error: Your account is registered to device (${student.deviceFingerprint.substring(0, 12)}). You are scanning from (${deviceFingerprint.substring(0, 12)}). Please scan from your registered phone or ask faculty to reset device binding.`,
                },
                { status: 403 }
            );
        }

        // Determine Attendance Category automatically by current time or session type
        let category = "REGULAR";
        if (classroomSession.sessionType === "EVENT") {
            category = "EVENT";
        } else {
            // Check Special Activity threshold time (Default 16:30)
            const config = await prisma.specialActivityConfig.findFirst();
            const thresholdTime = config?.startTime || "16:30";
            const [tHour, tMin] = thresholdTime.split(":").map(Number);

            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const thresholdMinutes = tHour * 60 + tMin;

            if (currentMinutes >= thresholdMinutes) {
                category = "SPECIAL_ACTIVITY";
            }
        }

        // 5. Check if already scanned for this category today
        const existingRecord = await prisma.attendanceRecord.findFirst({
            where: {
                sessionId: classroomSession.id,
                studentId: student.id,
                category,
            },
        });

        if (existingRecord) {
            return NextResponse.json({
                success: true,
                message: `Attendance already verified and recorded for ${category} category!`,
                record: existingRecord,
            });
        }

        const nowTime = new Date();

        // Record Attendance as PRESENT (No LATE status)
        const newRecord = await prisma.attendanceRecord.create({
            data: {
                sessionId: classroomSession.id,
                studentId: student.id,
                inTime: nowTime,
                category,
                deviceFingerprint,
                requestIp: clientIp,
                verifiedBy: "QR_SCAN",
                status: "PRESENT",
            },
        });

        return NextResponse.json({
            success: true,
            message: `Attendance marked successfully (${category}) for ${student.name}!`,
            record: newRecord,
        });
    } catch (error: any) {
        console.error("POST Attendance Scan Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process attendance scan" }, { status: 500 });
    }
}
