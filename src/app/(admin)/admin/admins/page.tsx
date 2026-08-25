import { prisma } from "@/lib/prisma";
import AdminManagementClient from "./AdminManagementClient";

export const metadata = {
    title: "Admin Management — SindhanAI Studio",
    description: "Manage Lab Administrators, assign SOI Labs, and promote Instructors to Admin role",
};

export default async function AdminsPage() {
    const [soiDomains, departments, instructors] = await Promise.all([
        prisma.soiDomain.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.user.findMany({
            where: { role: { name: "INSTRUCTOR" }, deletedAt: null },
            select: { id: true, name: true, email: true, designation: true, soiDomainId: true },
            orderBy: { name: "asc" },
        }),
    ]);

    return (
        <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <AdminManagementClient
                metadata={{
                    soiDomains,
                    departments,
                    instructors,
                }}
            />
        </main>
    );
}
