import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST /api/admin/permanent-delete — Permanently purge entity from database
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized access — Super Admin only" }, { status: 403 });
        }

        const body = await req.json();
        const { type, id } = body;

        if (!id || !type) {
            return NextResponse.json({ error: "Type and ID are required" }, { status: 400 });
        }

        if (type === "USER") {
            await prisma.user.delete({ where: { id } });
            return NextResponse.json({ success: true, message: "User permanently deleted!" });
        }

        if (type === "SUBJECT") {
            await prisma.subject.delete({ where: { id } });
            return NextResponse.json({ success: true, message: "Subject permanently deleted!" });
        }

        return NextResponse.json({ error: "Unsupported entity type" }, { status: 400 });
    } catch (error: any) {
        console.error("POST Permanent Delete Error:", error);
        return NextResponse.json({ error: error.message || "Failed to permanently delete item" }, { status: 500 });
    }
}
