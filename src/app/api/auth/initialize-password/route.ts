import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth/session";

export async function POST(req: Request) {
    try {
        const { email, tempPassword, password } = await req.json();

        if (!email || !password || typeof password !== "string" || password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await (prisma as any).user.findUnique({
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

        // Security Check: Verify temporary password assigned during onboarding
        if (user.tempPassword && user.tempPassword !== tempPassword) {
            return NextResponse.json(
                { error: "Invalid temporary password. Please enter the temporary password assigned to your profile." },
                { status: 401 }
            );
        }

        // Hash strong password with bcrypt
        const passwordHash = await bcrypt.hash(password, 10);

        // Save permanent password and clear temporary password
        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                tempPassword: null,
            },
        });

        // Issue 30-day HttpOnly cookie session immediately
        await createSessionCookie({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            deviceFingerprint: user.deviceFingerprint,
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
