import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST /api/admin/students/[id]/endorse-skill
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { id: studentId } = await params;
        const { skillId, skillName, category } = await req.json();

        if (skillId) {
            // Endorse an existing skill
            const updatedSkill = await prisma.studentSkill.update({
                where: { id: skillId },
                data: {
                    endorsedByInstructorId: session.userId,
                },
                include: {
                    endorsedByInstructor: { select: { name: true, email: true } },
                },
            });
            return NextResponse.json({ success: true, data: updatedSkill });
        } else if (skillName) {
            // Add & endorse new skill
            const newSkill = await prisma.studentSkill.create({
                data: {
                    studentId,
                    skillName,
                    category: category || "General",
                    endorsedByInstructorId: session.userId,
                },
                include: {
                    endorsedByInstructor: { select: { name: true, email: true } },
                },
            });
            return NextResponse.json({ success: true, data: newSkill });
        } else {
            return NextResponse.json({ error: "Skill ID or Skill Name is required" }, { status: 400 });
        }
    } catch (error) {
        console.error("Endorse Skill API Error:", error);
        return NextResponse.json({ error: "Failed to endorse skill" }, { status: 500 });
    }
}
