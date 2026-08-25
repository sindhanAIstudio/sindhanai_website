import { prisma } from "@/lib/prisma";
import InstructorManagementClient from "./InstructorManagementClient";

export const metadata = {
    title: "Instructor Management — SindhanAI Studio",
    description: "Manage faculty directory, domain allocations, and device registrations",
};

export default async function InstructorsPage() {
    const [soiDomains, departments] = await Promise.all([
        prisma.soiDomain.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);

    return (
        <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <InstructorManagementClient
                metadata={{
                    soiDomains,
                    departments,
                }}
            />
        </main>
    );
}
