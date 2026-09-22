import { prisma } from "@/lib/prisma";
import AcademicTrackerPublicClient from "@/components/website/AcademicTrackerPublicClient";

export const metadata = {
    title: "Academic Syllabus Tracker & RAG Database | SCOPE Management",
    description: "Public real-time academic scheduler, syllabus completion velocity tracker, and grounded RAG chatbot for SCOPE faculty and students.",
};

export default async function AcademicTrackerPage() {
    const departments = await prisma.department.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
    });

    const classGroups = await prisma.classGroup.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
    });

    return (
        <AcademicTrackerPublicClient
            metadata={{
                departments,
                classGroups,
            }}
        />
    );
}
