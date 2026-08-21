import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import InstructorDashboardClient from "./InstructorDashboardClient";

export const revalidate = 0;

export default async function InstructorPage() {
    const session = await getSession();

    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
        redirect("/login");
    }

    const sessions = await prisma.classroomSession.findMany({
        where: { instructorId: session.userId },
        include: {
            attendanceRecords: {
                include: {
                    student: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return <InstructorDashboardClient session={session} initialSessions={sessions} />;
}
