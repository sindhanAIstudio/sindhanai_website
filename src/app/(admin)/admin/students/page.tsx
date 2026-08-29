import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentManagementClient from "./StudentManagementClient";

export const revalidate = 0;

export default async function StudentManagementPage() {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
        redirect("/login");
    }

    const activeWhere = { isActive: true, deletedAt: null } as const;
    const orderBy = { name: "asc" } as const;

    const [
        departments,
        batches,
        classGroups,
        slotTimings,
        soiDomains,
        domainPlacements,
        interestedRoles,
    ] = await Promise.all([
        prisma.department.findMany({ where: activeWhere, orderBy }),
        prisma.batch.findMany({ where: activeWhere, orderBy }),
        prisma.classGroup.findMany({ where: activeWhere, orderBy }),
        prisma.slotTiming.findMany({ where: activeWhere, orderBy }),
        prisma.soiDomain.findMany({ where: activeWhere, orderBy }),
        prisma.domainPlacement.findMany({ where: activeWhere, orderBy }),
        prisma.interestedRole.findMany({ where: activeWhere, orderBy }),
    ]);

    return (
        <StudentManagementClient
            session={session}
            metadata={{
                departments,
                batches,
                classGroups,
                slotTimings,
                soiDomains,
                domainPlacements,
                interestedRoles,
            }}
        />
    );
}

