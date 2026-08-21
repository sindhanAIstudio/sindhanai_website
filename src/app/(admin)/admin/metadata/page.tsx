import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MetadataManagementClient from "./MetadataManagementClient";

export const revalidate = 0;

export default async function MetadataPage() {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
        redirect("/login");
    }

    const [
        departments,
        classGroups,
        slotTimings,
        soiDomains,
        domainPlacements,
        batches,
        interestedRoles,
    ] = await Promise.all([
        prisma.department.findMany({ orderBy: { name: "asc" } }),
        prisma.classGroup.findMany({ orderBy: { name: "asc" } }),
        prisma.slotTiming.findMany({ orderBy: { name: "asc" } }),
        prisma.soiDomain.findMany({ orderBy: { name: "asc" } }),
        prisma.domainPlacement.findMany({ orderBy: { name: "asc" } }),
        prisma.batch.findMany({ orderBy: { name: "asc" } }),
        prisma.interestedRole.findMany({ orderBy: { name: "asc" } }),
    ]);

    return (
        <MetadataManagementClient
            initialData={{
                departments,
                classGroups,
                slotTimings,
                soiDomains,
                domainPlacements,
                batches,
                interestedRoles,
            }}
        />
    );
}
