import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/students — List with search, filters, pagination, & soft delete toggle
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const searchParams = new URL(req.url).searchParams;
        const search = searchParams.get("search") || "";
        const departmentId = searchParams.get("departmentId");
        const batchId = searchParams.get("batchId");
        const classGroupId = searchParams.get("classGroupId");
        const slotTimingId = searchParams.get("slotTimingId");
        const soiDomainId = searchParams.get("soiDomainId");
        const domainPlacementId = searchParams.get("domainPlacementId");
        const yearOfPassing = searchParams.get("yearOfPassing");
        const isTrashView = searchParams.get("trash") === "true";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Where condition building
        const whereCondition: any = {
            role: { name: "STUDENT" },
            deletedAt: isTrashView ? { not: null } : null,
        };

        if (search) {
            whereCondition.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { personalEmail: { contains: search } },
                { rollNumber: { contains: search } },
                { registrationNumber: { contains: search } },
            ];
        }

        if (departmentId) whereCondition.departmentId = departmentId;
        if (batchId) whereCondition.batchId = batchId;
        if (classGroupId) whereCondition.classGroupId = classGroupId;
        if (slotTimingId) whereCondition.slotTimingId = slotTimingId;
        if (soiDomainId) whereCondition.soiDomainId = soiDomainId;
        if (domainPlacementId) whereCondition.domainPlacementId = domainPlacementId;
        if (yearOfPassing) whereCondition.yearOfPassing = parseInt(yearOfPassing);

        const [total, students] = await Promise.all([
            prisma.user.count({ where: whereCondition }),
            prisma.user.findMany({
                where: whereCondition,
                include: {
                    department: true,
                    batch: true,
                    classGroup: true,
                    slotTiming: true,
                    soiDomain: true,
                    domainPlacement: true,
                    interestedRoles: true,
                    skills: {
                        include: { endorsedByInstructor: { select: { name: true, email: true } } },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return NextResponse.json({
            data: students,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET Students API Error:", error);
        return NextResponse.json({ error: "Failed to fetch student directory" }, { status: 500 });
    }
}

// POST /api/admin/students — Create new student
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

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
            interestedRoleIds,
            interestedRoleId,
            statusNote,
            skills,
        } = body;

        // Support either interestedRoleIds array or single legacy interestedRoleId
        const rolesToConnect = Array.isArray(interestedRoleIds)
            ? interestedRoleIds
            : interestedRoleId
                ? [interestedRoleId]
                : [];

        // Validation for mandatory fields
        if (!name || !email || !rollNumber || !registrationNumber) {
            return NextResponse.json(
                { error: "Name, Institutional Email, Roll Number, and Registration Number are mandatory" },
                { status: 400 }
            );
        }

        // Check if institutional email or roll number already exists
        const existingEmail = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (existingEmail) {
            return NextResponse.json({ error: "Institutional email address already registered" }, { status: 400 });
        }

        // Ensure STUDENT role exists
        const studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });
        if (!studentRole) {
            return NextResponse.json({ error: "STUDENT role entity not initialized" }, { status: 500 });
        }

        // Generate default temporary password if not provided
        const generatedTempPassword = body.tempPassword || `Sindhanai@${Math.floor(1000 + Math.random() * 9000)}`;

        const student = await (prisma as any).user.create({
            data: {
                name,
                email: email.trim().toLowerCase(),
                personalEmail: personalEmail || null,
                tempPassword: generatedTempPassword,
                mustChangePassword: true,
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
                roleId: studentRole.id,
                slotTimingId: slotTimingId || null,
                departmentId: departmentId || null,
                batchId: batchId || null,
                classGroupId: classGroupId || null,
                soiDomainId: soiDomainId || null,
                domainPlacementId: domainPlacementId || null,
                interestedRoles: rolesToConnect.length > 0
                    ? { connect: rolesToConnect.map((id: string) => ({ id })) }
                    : undefined,
                statusNote: statusNote || null,
                skills: skills && Array.isArray(skills)
                    ? {
                        create: skills.map((s: any) => ({
                            skillName: typeof s === "string" ? s : s.skillName,
                            category: typeof s === "string" ? "General" : s.category || "General",
                        })),
                    }
                    : undefined,
            },
            include: {
                department: true,
                classGroup: true,
                slotTiming: true,
                soiDomain: true,
                domainPlacement: true,
                interestedRoles: true,
                skills: true,
            },
        });

        return NextResponse.json({ success: true, data: student });
    } catch (error: any) {
        console.error("POST Student API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create student record" }, { status: 500 });
    }
}
