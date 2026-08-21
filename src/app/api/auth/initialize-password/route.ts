import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth/session";

export async function POST(req: Request) {
    try {
        const { email, password, deviceFingerprint } = await req.json();

        if (!email || !password || typeof password !== "string" || password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { role: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User record not found" }, { status: 404 });
        }

        if (user.passwordHash) {
            return NextResponse.json(
                { error: "Account password already initialized. Please login with existing credentials." },
                { status: 400 }
            );
        }

        // Hash strong password with bcrypt
        const passwordHash = await bcrypt.hash(password, 10);

        // Save password and device fingerprint to DB
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                deviceFingerprint: deviceFingerprint || null,
            },
        });

        // Issue 30-day HttpOnly cookie session immediately
        await createSessionCookie({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            deviceFingerprint: deviceFingerprint || user.deviceFingerprint,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
            },
        });
    } catch (error) {
        console.error("Initialize Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
