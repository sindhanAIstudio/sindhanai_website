import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// PUT /api/admin/admins/[id] — Update Admin Profile or Demote to Instructor (Super Admin Only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized access — Super Admin only" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const {
            action, // "UPDATE" | "DEMOTE"
            name,
            email,
            password,
            personalEmail,
            mobileNumber,
            designation,
            instructorType,
            soiDomainId,
            departmentId,
            experienceYears,
            bio,
            profilePicUrl,
            linkedinUrl,
            githubUrl,
            statusNote,
        } = body;

        const adminUser = await prisma.user.findUnique({ where: { id } });
        if (!adminUser) {
            return NextResponse.json({ error: "Admin record not found" }, { status: 404 });
        }

        // Action: Demote Admin back to Instructor role
        if (action === "DEMOTE") {
            const instructorRole = await prisma.role.findUnique({ where: { name: "INSTRUCTOR" } });
            if (!instructorRole) {
                return NextResponse.json({ error: "INSTRUCTOR role not found" }, { status: 500 });
            }

            const demotedUser = await prisma.user.update({
                where: { id },
                data: { roleId: instructorRole.id },
                include: { role: true, soiDomain: true, department: true },
            });

            return NextResponse.json({
                success: true,
                message: `Successfully demoted ${demotedUser.name} to Instructor.`,
                data: demotedUser,
            });
        }

        // Action: Update Admin details
        const updateData: any = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.trim().toLowerCase();
        if (personalEmail !== undefined) updateData.personalEmail = personalEmail ? personalEmail.trim() : null;
        if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber ? mobileNumber.trim() : null;
        if (designation !== undefined) updateData.designation = designation ? designation.trim() : null;
        if (instructorType !== undefined) updateData.instructorType = instructorType;
        if (soiDomainId !== undefined) updateData.soiDomainId = soiDomainId || null;
        if (departmentId !== undefined) updateData.departmentId = departmentId || null;
        if (experienceYears !== undefined) updateData.experienceYears = experienceYears ? parseFloat(experienceYears) : null;
        if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
        if (profilePicUrl !== undefined) updateData.profilePicUrl = profilePicUrl || null;
        if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl ? linkedinUrl.trim() : null;
        if (githubUrl !== undefined) updateData.githubUrl = githubUrl ? githubUrl.trim() : null;
        if (statusNote !== undefined) updateData.statusNote = statusNote || null;

        if (password && password.trim()) {
            updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
        }

        const updatedAdmin = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                role: true,
                soiDomain: true,
                department: true,
            },
        });

        return NextResponse.json({ success: true, data: updatedAdmin });
    } catch (error: any) {
        console.error("PUT Admin API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update admin record" }, { status: 500 });
    }
}

// DELETE /api/admin/admins/[id] — Soft Delete or Restore Admin (Super Admin Only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized access — Super Admin only" }, { status: 403 });
        }

        const { id } = await params;
        const searchParams = new URL(req.url).searchParams;
        const restore = searchParams.get("restore") === "true";

        const adminUser = await prisma.user.findUnique({ where: { id } });
        if (!adminUser) {
            return NextResponse.json({ error: "Admin record not found" }, { status: 404 });
        }

        const updatedAdmin = await prisma.user.update({
            where: { id },
            data: {
                deletedAt: restore ? null : new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: restore ? "Admin account restored" : "Admin account moved to trash",
            data: updatedAdmin,
        });
    } catch (error: any) {
        console.error("DELETE Admin API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update admin status" }, { status: 500 });
    }
}
