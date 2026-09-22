import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

// GET /api/admin/profile - Return full profile of logged in user
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                role: { select: { id: true, name: true, description: true } },
                department: { select: { id: true, name: true, code: true } },
                classGroup: { select: { id: true, name: true, code: true } },
                soiDomain: { select: { id: true, name: true, code: true } },
                batch: { select: { id: true, name: true } },
                academicYear: { select: { id: true, name: true } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // Hide sensitive hash
        const { passwordHash, ...profile } = user;

        return NextResponse.json({ success: true, data: profile });
    } catch (error: any) {
        console.error("GET Profile Error:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

// PUT /api/admin/profile - Update profile info or password
export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action, name, mobileNumber, bio, currentPassword, newPassword } = body;

        if (action === "CHANGE_PASSWORD") {
            if (!currentPassword || !newPassword) {
                return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 });
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
            }

            const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
            if (!currentUser || !currentUser.passwordHash) {
                return NextResponse.json({ error: "User account invalid" }, { status: 400 });
            }

            const isValid = bcrypt.compareSync(currentPassword, currentUser.passwordHash);
            if (!isValid) {
                return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
            }

            const newHash = bcrypt.hashSync(newPassword, 10);
            await prisma.user.update({
                where: { id: session.userId },
                data: {
                    passwordHash: newHash,
                    mustChangePassword: false,
                },
            });

            return NextResponse.json({ success: true, message: "Password updated successfully!" });
        }

        // Update profile info
        const updated = await prisma.user.update({
            where: { id: session.userId },
            data: {
                ...(name && { name }),
                ...(mobileNumber !== undefined && { mobileNumber }),
                ...(bio !== undefined && { bio }),
            },
        });

        return NextResponse.json({ success: true, message: "Profile updated successfully!", data: updated });
    } catch (error: any) {
        console.error("PUT Profile Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
