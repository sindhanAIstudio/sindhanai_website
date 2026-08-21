import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/students/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;

        const student = await prisma.user.findUnique({
            where: { id },
            include: {
                department: true,
                batch: true,
                classGroup: true,
                slotTiming: true,
                soiDomain: true,
                domainPlacement: true,
                interestedRole: true,
                skills: {
                    include: { endorsedByInstructor: { select: { name: true, email: true } } },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: student });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 });
    }
}

// PUT /api/admin/students/[id] — Update student details
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
            personalEmail,
            rollNumber,
            registrationNumber,
            yearOfPassing,
            mobileNumber,
            tenthPercentage,
            twelfthPercentage,
            currentCgpa,
            githubUrl,
            kaggleUrl,
            leetcodeUrl,
            linkedinUrl,
            residentialStatus,
            address,
            resumeUrl,
            profilePicUrl,
            slotTimingId,
            departmentId,
            batchId,
            classGroupId,
            soiDomainId,
            domainPlacementId,
            interestedRoleId,
            statusNote,
        } = body;

        const updatedStudent = await prisma.user.update({
            where: { id },
            data: {
                name,
                email: email ? email.trim().toLowerCase() : undefined,
                personalEmail: personalEmail || null,
                rollNumber: rollNumber || null,
                registrationNumber: registrationNumber || null,
                yearOfPassing: yearOfPassing ? parseInt(yearOfPassing) : null,
                mobileNumber: mobileNumber || null,
                tenthPercentage: tenthPercentage ? parseFloat(tenthPercentage) : null,
                twelfthPercentage: twelfthPercentage ? parseFloat(twelfthPercentage) : null,
                currentCgpa: currentCgpa ? parseFloat(currentCgpa) : null,
                githubUrl: githubUrl || null,
                kaggleUrl: kaggleUrl || null,
                leetcodeUrl: leetcodeUrl || null,
                linkedinUrl: linkedinUrl || null,
                residentialStatus: residentialStatus || null,
                address: address || null,
                resumeUrl: resumeUrl || null,
                profilePicUrl: profilePicUrl || null,
                slotTimingId: slotTimingId || null,
                departmentId: departmentId || null,
                batchId: batchId || null,
                classGroupId: classGroupId || null,
                soiDomainId: soiDomainId || null,
                domainPlacementId: domainPlacementId || null,
                interestedRoleId: interestedRoleId || null,
                statusNote: statusNote || null,
            },
            include: {
                department: true,
                batch: true,
                classGroup: true,
                slotTiming: true,
                soiDomain: true,
                domainPlacement: true,
                interestedRole: true,
                skills: true,
            },
        });

        return NextResponse.json({ success: true, data: updatedStudent });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update student profile" }, { status: 500 });
    }
}

// DELETE /api/admin/students/[id] — Soft Delete or Restore
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const restore = searchParams.get("restore") === "true";

        if (restore) {
            // Restore from soft delete
            await prisma.user.update({
                where: { id },
                data: { deletedAt: null },
            });
            return NextResponse.json({ success: true, message: "Student record restored successfully" });
        } else {
            // Soft delete by setting deletedAt timestamp
            await prisma.user.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return NextResponse.json({ success: true, message: "Student record moved to Trash (soft-deleted)" });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to perform soft delete action" }, { status: 500 });
    }
}
