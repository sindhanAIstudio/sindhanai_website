import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST /api/admin/restore — Restore a trashed user or metadata entity
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { type, id } = body; // type: "USER" | "SUBJECT" | "DEPARTMENT" | "CLASS_GROUP"

        if (!id || !type) {
            return NextResponse.json({ error: "Type and ID are required" }, { status: 400 });
        }

        if (type === "USER") {
            await prisma.user.update({
                where: { id },
                data: { deletedAt: null },
            });
            return NextResponse.json({ success: true, message: "User restored successfully!" });
        }

        if (type === "SUBJECT") {
            await prisma.subject.update({
                where: { id },
                data: { isDeleted: false },
            });
            return NextResponse.json({ success: true, message: "Subject restored successfully!" });
        }

        if (type === "DEPARTMENT") {
            await prisma.department.update({
                where: { id },
                data: { deletedAt: null, isActive: true },
            });
            return NextResponse.json({ success: true, message: "Department restored successfully!" });
        }

        if (type === "CLASS_GROUP") {
            await prisma.classGroup.update({
                where: { id },
                data: { deletedAt: null, isActive: true },
            });
            return NextResponse.json({ success: true, message: "Class Group restored successfully!" });
        }

        return NextResponse.json({ error: "Unsupported entity type" }, { status: 400 });
    } catch (error: any) {
        console.error("POST Restore API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to restore entity" }, { status: 500 });
    }
}
