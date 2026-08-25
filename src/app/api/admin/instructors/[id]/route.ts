import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/instructors/[id] — Single instructor profile
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;

        const instructor = await prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                soiDomain: true,
                department: true,
                classroomSessions: {
                    select: { id: true, title: true, status: true, activeFrom: true, activeUntil: true },
                    orderBy: { createdAt: "desc" },
                },
                endorsedSkills: {
                    include: { student: { select: { name: true, email: true, rollNumber: true } } },
                },
            },
        });

        if (!instructor || (instructor.role.name !== "INSTRUCTOR" && instructor.role.name !== "ADMIN" && !instructor.instructorType)) {
            return NextResponse.json({ error: "Instructor record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: instructor });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch instructor details" }, { status: 500 });
    }
}

// PUT /api/admin/instructors/[id] — Update instructor profile
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();

        const {
            name,
            email,
            password,
            personalEmail,
            mobileNumber,
            designation,
            instructorType,
            roleName, // "INSTRUCTOR" | "ADMIN"
            soiDomainId,
            departmentId,
            experienceYears,
            bio,
            profilePicUrl,
            linkedinUrl,
            githubUrl,
            statusNote,
            resetDevice,
        } = body;

        const dataToUpdate: any = {
            name: name ? name.trim() : undefined,
            email: email ? email.trim().toLowerCase() : undefined,
            personalEmail: personalEmail !== undefined ? (personalEmail ? personalEmail.trim() : null) : undefined,
            mobileNumber: mobileNumber !== undefined ? (mobileNumber ? mobileNumber.trim() : null) : undefined,
            designation: designation !== undefined ? (designation ? designation.trim() : null) : undefined,
            instructorType: instructorType || undefined,
            soiDomainId: soiDomainId !== undefined ? (soiDomainId || null) : undefined,
            departmentId: departmentId !== undefined ? (departmentId || null) : undefined,
            experienceYears: experienceYears !== undefined ? (experienceYears ? parseFloat(experienceYears) : null) : undefined,
            bio: bio !== undefined ? (bio ? bio.trim() : null) : undefined,
            profilePicUrl: profilePicUrl !== undefined ? (profilePicUrl || null) : undefined,
            linkedinUrl: linkedinUrl !== undefined ? (linkedinUrl ? linkedinUrl.trim() : null) : undefined,
            githubUrl: githubUrl !== undefined ? (githubUrl ? githubUrl.trim() : null) : undefined,
            statusNote: statusNote !== undefined ? (statusNote || null) : undefined,
        };

        if (password && password.trim()) {
            dataToUpdate.passwordHash = await bcrypt.hash(password.trim(), 10);
        }

        if (roleName) {
            const targetRole = roleName === "ADMIN" ? "ADMIN" : "INSTRUCTOR";
            const roleObj = await prisma.role.findUnique({ where: { name: targetRole } });
            if (roleObj) {
                dataToUpdate.roleId = roleObj.id;
            }
        }

        if (resetDevice === true) {
            dataToUpdate.deviceFingerprint = null;
        }

        const updatedInstructor = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: {
                role: true,
                soiDomain: true,
                department: true,
            },
        });

        return NextResponse.json({ success: true, data: updatedInstructor });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update instructor record" }, { status: 500 });
    }
}

// DELETE /api/admin/instructors/[id] — Soft Delete or Restore
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const restore = searchParams.get("restore") === "true";

        const updatedInstructor = await prisma.user.update({
            where: { id },
            data: {
                deletedAt: restore ? null : new Date(),
                statusNote: restore ? "Restored from trash" : "Moved to trash",
            },
        });

        return NextResponse.json({
            success: true,
            message: restore ? "Instructor restored successfully" : "Instructor moved to trash",
            data: updatedInstructor,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete/restore instructor record" }, { status: 500 });
    }
}
