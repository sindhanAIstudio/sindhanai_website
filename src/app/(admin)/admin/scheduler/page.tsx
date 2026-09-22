import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import ScopeSmartCalendar from "@/components/admin/ScopeSmartCalendar";

export const metadata = {
    title: "Academic Scheduler | Admin Console",
    description: "Academic Scheduler and daily topic completion tracking.",
};

export default async function SchedulerPage() {
    const session = await getSession();

    const [departments, classGroups, scopeFaculty, syllabi, miniProjects, subjects, batches] = await Promise.all([
        prisma.department.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
        prisma.classGroup.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
        prisma.user.findMany({
            where: { instructorType: "Scope", deletedAt: null },
            select: { id: true, name: true, empId: true, designation: true, profilePicUrl: true },
            orderBy: { name: "asc" },
        }),
        prisma.syllabusItem.findMany({
            where: { NOT: { isDeleted: true } },
            include: { department: true, classGroup: true, subject: true },
            orderBy: [{ sessionNumber: "asc" }, { createdAt: "asc" }],
        }),
        prisma.miniProjectSyllabus.findMany({
            where: { NOT: { isDeleted: true } },
            include: { department: true, classGroup: true, subject: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.subject.findMany({
            where: { isActive: true, deletedAt: null, NOT: { isDeleted: true } },
            select: { id: true, name: true, code: true },
            orderBy: { name: "asc" },
        }),
        prisma.batch.findMany({
            where: { isActive: true, deletedAt: null },
            select: { id: true, name: true, code: true, startYear: true, endYear: true },
            orderBy: { startYear: "desc" },
        }),
    ]);

    return (
        <main className="max-w-7xl mx-auto space-y-6">
            <ScopeSmartCalendar
                currentUser={{
                    id: session?.userId || "",
                    name: session?.name || "Faculty Member",
                    role: session?.role || "INSTRUCTOR",
                    instructorType: session?.instructorType || null,
                }}
                metadata={{
                    departments,
                    classGroups,
                    scopeFaculty,
                    syllabi,
                    miniProjects,
                    subjects,
                    batches,
                }}
            />
        </main>
    );
}
