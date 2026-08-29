import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (session.role === "INSTRUCTOR") {
        redirect("/admin/attendance");
    }

    if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
        redirect("/login");
    }

    // Fetch dynamic RBAC matrix & metadata
    const roles = await prisma.role.findMany({
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    });

    const permissions = await prisma.permission.findMany({
        orderBy: { category: "asc" },
    });

    const batches = await prisma.batch.findMany({ orderBy: { startYear: "desc" } });
    const academicYears = await prisma.academicYear.findMany();
    const departments = await prisma.department.findMany();
    const soiDomains = await prisma.soiDomain.findMany();
    const domainPlacements = await prisma.domainPlacement.findMany();
    const classGroups = await prisma.classGroup.findMany();

    const users = await prisma.user.findMany({
        take: 20,
        include: {
            role: true,
            batch: true,
            department: true,
            soiDomain: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <AdminDashboardClient
            session={session}
            roles={roles}
            permissions={permissions}
            metadata={{
                batches,
                academicYears,
                departments,
                soiDomains,
                domainPlacements,
                classGroups,
            }}
            users={users}
        />
    );
}
