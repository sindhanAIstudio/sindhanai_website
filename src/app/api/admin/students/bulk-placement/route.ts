import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST /api/admin/students/bulk-placement — Bulk update domainPlacementId for multiple students
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { studentIds, domainPlacementId } = body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json({ error: "Validation Error: Select at least one student." }, { status: 400 });
        }

        // Mass update domainPlacementId
        const updatedCount = await prisma.user.updateMany({
            where: {
                id: { in: studentIds },
                role: { name: "STUDENT" },
            },
            data: {
                domainPlacementId: domainPlacementId || null,
            },
        });

        return NextResponse.json({
            message: `Successfully updated domain placement for ${updatedCount.count} students.`,
            count: updatedCount.count,
        });
    } catch (error) {
        console.error("Bulk Placement API Error:", error);
        return NextResponse.json({ error: "Failed to perform bulk domain placement assignment" }, { status: 500 });
    }
}
