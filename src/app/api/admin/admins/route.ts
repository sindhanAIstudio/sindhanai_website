import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/admins — List Lab Administrators (Super Admin Only)
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized access — Super Admin only" }, { status: 403 });
        }

        const searchParams = new URL(req.url).searchParams;
        const search = searchParams.get("search") || "";
        const soiDomainId = searchParams.get("soiDomainId");
        const departmentId = searchParams.get("departmentId");
        const isTrashView = searchParams.get("trash") === "true";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const whereCondition: any = {
            deletedAt: isTrashView ? { not: null } : null,
            role: { name: "ADMIN" },
        };

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

        if (soiDomainId) whereCondition.soiDomainId = soiDomainId;
        if (departmentId) whereCondition.departmentId = departmentId;

        const [total, admins] = await Promise.all([
            prisma.user.count({ where: whereCondition }),
            prisma.user.findMany({
                where: whereCondition,
                include: {
                    role: true,
                    soiDomain: true,
                    department: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return NextResponse.json({
            data: admins,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET Admins API Error:", error);
        return NextResponse.json({ error: "Failed to fetch admin directory" }, { status: 500 });
    }
}

// POST /api/admin/admins — Create New Admin OR Promote Instructor to Admin (Super Admin Only)
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized access — Super Admin only" }, { status: 403 });
        }

        const body = await req.json();
        const {
            action, // "CREATE" | "PROMOTE"
            instructorId, // For promotion
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

        const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
        if (!adminRole) {
            return NextResponse.json({ error: "ADMIN role entity not found in database" }, { status: 500 });
        }

        // Action: Promote Existing Instructor
        if (action === "PROMOTE") {
            if (!instructorId) {
                return NextResponse.json({ error: "Instructor ID is required for promotion" }, { status: 400 });
            }

            const existingInstructor = await prisma.user.findUnique({ where: { id: instructorId } });
            if (!existingInstructor) {
                return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
            }

            const promotedUser = await prisma.user.update({
                where: { id: instructorId },
                data: {
                    roleId: adminRole.id,
                    ...(designation ? { designation: designation.trim() } : {}),
                    ...(soiDomainId ? { soiDomainId } : {}),
                },
                include: { role: true, soiDomain: true, department: true },
            });

            return NextResponse.json({
                success: true,
                message: `Successfully promoted ${promotedUser.name} to Lab Administrator!`,
                data: promotedUser,
            });
        }

        // Action: Create Brand New Admin Account
        if (!name || !email || !profilePicUrl) {
            return NextResponse.json(
                { error: "Admin Name, Login Email, and Profile Picture are mandatory" },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existingUser) {
            return NextResponse.json({ error: "Email address already registered in system" }, { status: 400 });
        }

        const rawPassword = password && password.trim() ? password.trim() : "Sindhanai@2026";
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        const newAdmin = await prisma.user.create({
            data: {
                name: name.trim(),
                email: cleanEmail,
                passwordHash,
                personalEmail: personalEmail ? personalEmail.trim() : null,
                mobileNumber: mobileNumber ? mobileNumber.trim() : null,
                designation: designation ? designation.trim() : "Lab Administrator",
                instructorType: instructorType || "SOI",
                roleId: adminRole.id,
                soiDomainId: soiDomainId || null,
                departmentId: departmentId || null,
                experienceYears: experienceYears ? parseFloat(experienceYears) : null,
                bio: bio ? bio.trim() : null,
                profilePicUrl: profilePicUrl || null,
                linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
                githubUrl: githubUrl ? githubUrl.trim() : null,
                statusNote: statusNote || null,
                mustChangePassword: false,
            },
            include: {
                role: true,
                soiDomain: true,
                department: true,
            },
        });

        return NextResponse.json({ success: true, data: newAdmin });
    } catch (error: any) {
        console.error("POST Admin API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create administrator record" }, { status: 500 });
    }
}
