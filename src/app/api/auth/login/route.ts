import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth/session";

export async function POST(req: Request) {
    try {
        const { email, password, deviceFingerprint } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { role: true },
        });

        if (!user || !user.role || !user.passwordHash) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Issue 30-day HttpOnly cookie session
        await createSessionCookie({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            deviceFingerprint: user.deviceFingerprint,
        });

        return NextResponse.json({
            success: true,
            mustChangePassword: !!user.mustChangePassword,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                mustChangePassword: !!user.mustChangePassword,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
