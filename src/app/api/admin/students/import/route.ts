import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST /api/admin/students/import — Bulk insert students from CSV data
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { records } = await req.json();

        if (!records || !Array.isArray(records) || records.length === 0) {
            return NextResponse.json({ error: "No records provided for import" }, { status: 400 });
        }

        const studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });
        if (!studentRole) {
            return NextResponse.json({ error: "STUDENT role entity not found" }, { status: 500 });
        }

        // Pre-fetch metadata caches for code resolution
        const [departments, classGroups, slotTimings, interestedRoles] = await Promise.all([
            prisma.department.findMany(),
            prisma.classGroup.findMany(),
            prisma.slotTiming.findMany(),
            prisma.interestedRole.findMany(),
        ]);

        const deptMap = new Map(departments.map((d) => [d.code.toUpperCase(), d.id]));
        const classMap = new Map(classGroups.map((c) => [c.code.toUpperCase(), c.id]));
        const slotMap = new Map(slotTimings.map((s) => [s.code.toUpperCase(), s.id]));
        const roleMap = new Map(interestedRoles.map((r) => [r.code.toUpperCase(), r.id]));

        let successCount = 0;
        let failCount = 0;
        const errors: { row: number; email: string; reason: string }[] = [];

        for (let i = 0; i < records.length; i++) {
            const r = records[i];
            const rowNum = i + 1;

            if (!r.name || !r.email || !r.rollNumber || !r.registrationNumber) {
                failCount++;
                errors.push({ row: rowNum, email: r.email || "N/A", reason: "Missing mandatory fields (name, email, rollNumber, registrationNumber)" });
                continue;
            }

            const cleanEmail = r.email.trim().toLowerCase();
            const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
            if (existing) {
                failCount++;
                errors.push({ row: rowNum, email: cleanEmail, reason: "Email already exists in system" });
                continue;
            }

            try {
                await prisma.user.create({
                    data: {
                        name: r.name.trim(),
                        email: cleanEmail,
                        personalEmail: r.personalEmail ? r.personalEmail.trim() : null,
                        rollNumber: r.rollNumber ? r.rollNumber.trim() : null,
                        registrationNumber: r.registrationNumber ? r.registrationNumber.trim() : null,
                        yearOfPassing: r.yearOfPassing ? parseInt(r.yearOfPassing) : null,
                        mobileNumber: r.mobileNumber ? r.mobileNumber.trim() : null,
                        tenthPercentage: r.tenthPercentage ? parseFloat(r.tenthPercentage) : null,
                        twelfthPercentage: r.twelfthPercentage ? parseFloat(r.twelfthPercentage) : null,
                        currentCgpa: r.currentCgpa ? parseFloat(r.currentCgpa) : null,
                        githubUrl: r.githubUrl ? r.githubUrl.trim() : null,
                        kaggleUrl: r.kaggleUrl ? r.kaggleUrl.trim() : null,
                        leetcodeUrl: r.leetcodeUrl ? r.leetcodeUrl.trim() : null,
                        linkedinUrl: r.linkedinUrl ? r.linkedinUrl.trim() : null,
                        residentialStatus: r.residentialStatus ? r.residentialStatus.trim() : null,
                        address: r.address ? r.address.trim() : null,
                        roleId: studentRole.id,
                        departmentId: r.departmentCode ? deptMap.get(r.departmentCode.toUpperCase()) : null,
                        classGroupId: r.classGroupCode ? classMap.get(r.classGroupCode.toUpperCase()) : null,
                        slotTimingId: r.slotTimingCode ? slotMap.get(r.slotTimingCode.toUpperCase()) : null,
                        interestedRoles: r.interestedRoleCode
                            ? {
                                connect: r.interestedRoleCode
                                    .split(",")
                                    .map((c: string) => roleMap.get(c.trim().toUpperCase()))
                                    .filter((id: string | undefined): id is string => Boolean(id))
                                    .map((id: string) => ({ id })),
                            }
                            : undefined,
                    },
                });
                successCount++;
            } catch (err: any) {
                failCount++;
                errors.push({ row: rowNum, email: cleanEmail, reason: err.message || "Database insert failed" });
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: records.length,
                successCount,
                failCount,
            },
            errors,
        });
    } catch (error) {
        console.error("Import Students API Error:", error);
        return NextResponse.json({ error: "Bulk import process failed" }, { status: 500 });
    }
}
