import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import StudentDashboardClient from "./StudentDashboardClient";

export const revalidate = 0;

export default async function StudentDashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            role: true,
            batch: true,
            academicYear: true,
            department: true,
            soiDomain: true,
            domainPlacement: true,
            classGroup: true,
            platformProfile: true,
            attendanceRecords: {
                include: {
                    session: true,
                },
                orderBy: { scannedAt: "desc" },
                take: 10,
            },
        },
    });

    if (!user) {
        redirect("/login");
    }

    return <StudentDashboardClient user={user} session={session} />;
}
