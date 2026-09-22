import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/subjects — List all active subjects
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const subjectDelegate = (prisma as any).subject;
        if (!subjectDelegate || typeof subjectDelegate.findMany !== "function") {
            return NextResponse.json({ success: true, data: [] });
        }

        const subjects = await subjectDelegate.findMany({
            where: { isActive: true, deletedAt: null },
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: {
                        syllabi: { where: { NOT: { isDeleted: true } } },
                        miniProjects: { where: { NOT: { isDeleted: true } } },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: subjects });
    } catch (error: any) {
        console.error("GET Subjects Error:", error);
        return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
    }
}

// POST /api/admin/subjects — Create new subject
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { name, code, description } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Subject Name is required" }, { status: 400 });
        }

        const subjectDelegate = (prisma as any).subject;
        if (!subjectDelegate || typeof subjectDelegate.create !== "function") {
            return NextResponse.json({ error: "Subject model initializing, please retry." }, { status: 500 });
        }

        const subject = await subjectDelegate.create({
            data: {
                name: name.trim(),
                code: code ? code.trim() : null,
                description: description ? description.trim() : null,
            },
        });

        return NextResponse.json({ success: true, data: subject });
    } catch (error: any) {
        console.error("POST Subject Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create subject" }, { status: 500 });
    }
}

// PUT /api/admin/subjects — Update subject
export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { id, name, code, description } = body;

        if (!id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const subjectDelegate = (prisma as any).subject;
        const updated = await subjectDelegate.update({
            where: { id },
            data: {
                name: name ? name.trim() : undefined,
                code: code !== undefined ? (code ? code.trim() : null) : undefined,
                description: description !== undefined ? (description ? description.trim() : null) : undefined,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
    }
}

// DELETE /api/admin/subjects — Soft delete subject
export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const subjectDelegate = (prisma as any).subject;
        await subjectDelegate.update({
            where: { id },
            data: { isDeleted: true },
        });

        return NextResponse.json({ success: true, message: "Subject soft deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
    }
}
