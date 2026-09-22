import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/syllabus — List Theory/Lab sessions & Mini Projects by Subject with server-side pagination & search
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const kind = searchParams.get("kind") || "SYLLABUS"; // "SYLLABUS" | "MINI_PROJECT"
        const courseType = searchParams.get("courseType") || "ALL"; // "THEORY" | "LAB" | "ALL"
        const subjectId = searchParams.get("subjectId");
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");
        const skip = (page - 1) * pageSize;

        if (kind === "MINI_PROJECT") {
            const whereMP: any = {
                NOT: { isDeleted: true },
            };
            if (subjectId) whereMP.subjectId = subjectId;
            if (search) {
                whereMP.OR = [
                    { title: { contains: search } },
                    { description: { contains: search } },
                    { language: { contains: search } },
                ];
            }

            const [total, items] = await Promise.all([
                prisma.miniProjectSyllabus.count({ where: whereMP }),
                prisma.miniProjectSyllabus.findMany({
                    where: whereMP,
                    include: { subject: true },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize,
                }),
            ]);

            return NextResponse.json({
                success: true,
                data: items,
                pagination: {
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize) || 1,
                },
            });
        }

        // SYLLABUS (Theory & Lab)
        const whereSyllabus: any = {
            NOT: { isDeleted: true },
        };
        if (subjectId) whereSyllabus.subjectId = subjectId;
        if (kind === "THEORY") {
            whereSyllabus.courseType = "THEORY";
        } else if (kind === "LAB") {
            whereSyllabus.courseType = "LAB";
        } else if (courseType && courseType !== "ALL") {
            whereSyllabus.courseType = courseType;
        }
        if (search) {
            whereSyllabus.OR = [
                { title: { contains: search } },
                { topicsOutline: { contains: search } },
            ];
        }

        const [total, items] = await Promise.all([
            prisma.syllabusItem.count({ where: whereSyllabus }),
            prisma.syllabusItem.findMany({
                where: whereSyllabus,
                include: { subject: true },
                orderBy: [{ sessionNumber: "asc" }, { createdAt: "asc" }],
                skip,
                take: pageSize,
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize) || 1,
            },
        });
    } catch (error: any) {
        console.error("GET Syllabus API Error:", error);
        return NextResponse.json({ error: "Failed to fetch syllabus directory" }, { status: 500 });
    }
}

// POST /api/admin/syllabus — Add single syllabus item or mini project for a Subject
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const {
            kind, // "SYLLABUS" | "MINI_PROJECT"
            sessionNumber,
            title,
            duration,
            topicsOutline,
            pptResourceUrl,
            pptPublishedUrl,
            quizLink,
            activityLink,
            courseType, // "THEORY" | "LAB"
            subjectId,
            language,
            description,
            link,
        } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        if (kind === "MINI_PROJECT") {
            const miniProject = await prisma.miniProjectSyllabus.create({
                data: {
                    title: title.trim(),
                    language: language ? language.trim() : "Python",
                    description: description ? description.trim() : null,
                    link: link ? link.trim() : null,
                    subjectId: subjectId || null,
                    isDeleted: false,
                },
                include: { subject: true },
            });
            return NextResponse.json({ success: true, data: miniProject, kind: "MINI_PROJECT" });
        }

        const syllabusItem = await prisma.syllabusItem.create({
            data: {
                sessionNumber: sessionNumber ? parseInt(sessionNumber) : null,
                title: title.trim(),
                duration: duration ? duration.trim() : "1 Hour",
                topicsOutline: topicsOutline ? topicsOutline.trim() : null,
                pptResourceUrl: pptResourceUrl ? pptResourceUrl.trim() : null,
                pptPublishedUrl: pptPublishedUrl ? pptPublishedUrl.trim() : null,
                quizLink: quizLink ? quizLink.trim() : null,
                activityLink: activityLink ? activityLink.trim() : null,
                courseType: courseType || "THEORY",
                subjectId: subjectId || null,
                isDeleted: false,
            },
            include: { subject: true },
        });

        return NextResponse.json({ success: true, data: syllabusItem, kind: "SYLLABUS" });
    } catch (error: any) {
        console.error("POST Syllabus API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create syllabus item" }, { status: 500 });
    }
}

// PUT /api/admin/syllabus — Update syllabus item or mini project
export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { id, kind, ...updateFields } = body;

        if (!id) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        if (kind === "MINI_PROJECT") {
            const updatedMiniProject = await prisma.miniProjectSyllabus.update({
                where: { id },
                data: {
                    title: updateFields.title ? updateFields.title.trim() : undefined,
                    language: updateFields.language ? updateFields.language.trim() : undefined,
                    description: updateFields.description !== undefined ? (updateFields.description ? updateFields.description.trim() : null) : undefined,
                    link: updateFields.link !== undefined ? (updateFields.link ? updateFields.link.trim() : null) : undefined,
                    subjectId: updateFields.subjectId !== undefined ? (updateFields.subjectId || null) : undefined,
                },
                include: { subject: true },
            });
            return NextResponse.json({ success: true, data: updatedMiniProject });
        }

        const updatedSyllabus = await prisma.syllabusItem.update({
            where: { id },
            data: {
                sessionNumber: updateFields.sessionNumber !== undefined ? (updateFields.sessionNumber ? parseInt(updateFields.sessionNumber) : null) : undefined,
                title: updateFields.title ? updateFields.title.trim() : undefined,
                duration: updateFields.duration !== undefined ? (updateFields.duration ? updateFields.duration.trim() : null) : undefined,
                topicsOutline: updateFields.topicsOutline !== undefined ? (updateFields.topicsOutline ? updateFields.topicsOutline.trim() : null) : undefined,
                pptResourceUrl: updateFields.pptResourceUrl !== undefined ? (updateFields.pptResourceUrl ? updateFields.pptResourceUrl.trim() : null) : undefined,
                pptPublishedUrl: updateFields.pptPublishedUrl !== undefined ? (updateFields.pptPublishedUrl ? updateFields.pptPublishedUrl.trim() : null) : undefined,
                quizLink: updateFields.quizLink !== undefined ? (updateFields.quizLink ? updateFields.quizLink.trim() : null) : undefined,
                activityLink: updateFields.activityLink !== undefined ? (updateFields.activityLink ? updateFields.activityLink.trim() : null) : undefined,
                courseType: updateFields.courseType || undefined,
                subjectId: updateFields.subjectId !== undefined ? (updateFields.subjectId || null) : undefined,
            },
            include: { subject: true },
        });

        return NextResponse.json({ success: true, data: updatedSyllabus });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update syllabus item" }, { status: 500 });
    }
}

// DELETE /api/admin/syllabus — Soft Delete single or multiple items
export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const idsParam = searchParams.get("ids"); // Comma-separated IDs for bulk soft delete
        const kind = searchParams.get("kind") || "SYLLABUS";

        const idsToDelete = idsParam ? idsParam.split(",").map(i => i.trim()).filter(Boolean) : (id ? [id] : []);

        if (idsToDelete.length === 0) {
            return NextResponse.json({ error: "At least one ID is required for deletion" }, { status: 400 });
        }

        if (kind === "MINI_PROJECT") {
            await prisma.miniProjectSyllabus.updateMany({
                where: { id: { in: idsToDelete } },
                data: { isDeleted: true },
            });
        } else {
            await prisma.syllabusItem.updateMany({
                where: { id: { in: idsToDelete } },
                data: { isDeleted: true },
            });
        }

        return NextResponse.json({
            success: true,
            deletedCount: idsToDelete.length,
            message: `Successfully deleted ${idsToDelete.length} item(s).`,
        });
    } catch (error: any) {
        console.error("DELETE Syllabus API Error:", error);
        return NextResponse.json({ error: "Failed to delete syllabus item(s)" }, { status: 500 });
    }
}
