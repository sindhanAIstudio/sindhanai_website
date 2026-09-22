import { prisma } from "@/lib/prisma";
import SyllabusManagementClient from "@/components/admin/SyllabusManagementClient";

export const metadata = {
    title: "Syllabus Management — SCOPE Academic Engine",
    description: "Manage Theory, Lab, and Mini Project syllabus sessions by Subject with PPT, Quiz, Activity resources and bulk import/export.",
};

export default async function SyllabusPage() {
    let subjects: any[] = [];

    try {
        const subjectDelegate = (prisma as any).subject;
        if (subjectDelegate && typeof subjectDelegate.findMany === "function") {
            subjects = await subjectDelegate.findMany({
                where: { isActive: true, deletedAt: null },
                select: { id: true, name: true, code: true, description: true },
                orderBy: { name: "asc" },
            });
        }
    } catch (err) {
        console.error("SyllabusPage Error fetching subjects:", err);
    }

    return (
        <main className="max-w-7xl mx-auto space-y-6">
            <SyllabusManagementClient
                subjects={subjects}
            />
        </main>
    );
}
