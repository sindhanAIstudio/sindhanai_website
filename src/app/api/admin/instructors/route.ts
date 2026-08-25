import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/instructors — List instructors with search, filters, pagination, & trash view
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const searchParams = new URL(req.url).searchParams;
        const search = searchParams.get("search") || "";
        const soiDomainId = searchParams.get("soiDomainId");
        const instructorType = searchParams.get("instructorType");
        const departmentId = searchParams.get("departmentId");
        const isTrashView = searchParams.get("trash") === "true";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const whereCondition: any = {
            deletedAt: isTrashView ? { not: null } : null,
            OR: [
                { role: { name: "INSTRUCTOR" } },
                { role: { name: "ADMIN" } },
                { instructorType: { not: null } },
            ],
        };

        // Strict SOI Lab Scoping for regular ADMIN role (Lab Admins see ONLY their lab instructors)
        if (session.role === "ADMIN") {
            const adminUser = await (prisma as any).user.findUnique({
                where: { id: session.userId },
                select: { soiDomainId: true },
            });
            if (adminUser?.soiDomainId) {
                whereCondition.soiDomainId = adminUser.soiDomainId;
            }
        } else if (soiDomainId) {
            whereCondition.soiDomainId = soiDomainId;
        }

        if (search) {
            whereCondition.AND = [
                {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                        { personalEmail: { contains: search } },
                        { mobileNumber: { contains: search } },
                        { designation: { contains: search } },
                    ],
                },
            ];
        }

        if (instructorType) whereCondition.instructorType = instructorType;
        if (departmentId) whereCondition.departmentId = departmentId;

        const [total, instructors] = await Promise.all([
            prisma.user.count({ where: whereCondition }),
            prisma.user.findMany({
                where: whereCondition,
                include: {
                    role: true,
                    soiDomain: true,
                    department: true,
                    classroomSessions: {
                        select: { id: true, title: true, status: true, createdAt: true },
                        orderBy: { createdAt: "desc" },
                        take: 5,
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return NextResponse.json({
            data: instructors,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET Instructors API Error:", error);
        return NextResponse.json({ error: "Failed to fetch instructor directory" }, { status: 500 });
    }
}

// POST /api/admin/instructors — Create new instructor profile
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
        } = body;

        // Validation for mandatory fields
        if (!name || !email || !profilePicUrl) {
            return NextResponse.json(
                { error: "Instructor Name, Login Email, and Profile Picture are mandatory" },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existingUser) {
            return NextResponse.json({ error: "Email address already registered in system" }, { status: 400 });
        }

        const targetRoleName = roleName === "ADMIN" ? "ADMIN" : "INSTRUCTOR";
        const assignedRole = await prisma.role.findUnique({ where: { name: targetRoleName } });
        if (!assignedRole) {
            return NextResponse.json({ error: `${targetRoleName} role entity not found in system` }, { status: 500 });
        }

        // Set password: custom or default "InstructorPass123!"
        const rawPassword = password && password.trim() ? password.trim() : "InstructorPass123!";
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        const instructor = await prisma.user.create({
            data: {
                name: name.trim(),
                email: cleanEmail,
                passwordHash,
                personalEmail: personalEmail ? personalEmail.trim() : null,
                mobileNumber: mobileNumber ? mobileNumber.trim() : null,
                designation: designation ? designation.trim() : "Instructor",
                instructorType: instructorType || "SOI",
                roleId: assignedRole.id,
                soiDomainId: soiDomainId || null,
                departmentId: departmentId || null,
                experienceYears: experienceYears ? parseFloat(experienceYears) : null,
                bio: bio ? bio.trim() : null,
                profilePicUrl: profilePicUrl || null,
                linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
                githubUrl: githubUrl ? githubUrl.trim() : null,
                statusNote: statusNote || null,
            },
            include: {
                role: true,
                soiDomain: true,
                department: true,
            },
        });

        return NextResponse.json({ success: true, data: instructor });
    } catch (error: any) {
        console.error("POST Instructor API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create instructor record" }, { status: 500 });
    }
}
