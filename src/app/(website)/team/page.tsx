import { prisma } from "@/lib/prisma";
import TeamClientView from "./TeamClientView";

export const revalidate = 0;

export default async function TeamPage() {
    const teamMembers = await prisma.teamMember.findMany({
        orderBy: { order: "asc" },
    });

    return <TeamClientView initialMembers={teamMembers} />;
}
