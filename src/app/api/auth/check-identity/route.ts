import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { role: true },
        });

        if (!user) {
            return NextResponse.json({ error: "Email address not found in system directory" }, { status: 404 });
        }

        return NextResponse.json({
            exists: true,
            isExistingUser: Boolean(user.passwordHash),
            requiresPasswordSetup: !user.passwordHash,
            name: user.name,
            email: user.email,
            role: user.role.name,
        });
    } catch (error) {
        console.error("Check Identity Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
