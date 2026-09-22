import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TEAM_MEMBERS, mapUserToTeamMember, TeamMember } from "@/data/teamData";
import TeamClientView from "./TeamClientView";

export const revalidate = 0;

export const metadata: Metadata = {
    title: "SCOPE Faculty & Mentors",
    description: "Explore the SCOPE Faculty Mentors and technical experts at KGiSL Institute of Technology driving hands-on software development, AI engineering, and industry training.",
    openGraph: {
        title: "SCOPE Faculty & Mentors | SindhanAI",
        description: "Meet the SCOPE Faculty Mentors driving programming excellence and AI development at KGiSL Institute of Technology.",
        images: ["/sindhanai-logo.png"]
    }
};

export default async function TeamPage() {
    let scopeMembers: TeamMember[] = [];

    try {
        const scopeUsers = await prisma.user.findMany({
            where: {
                instructorType: "Scope",
                deletedAt: null,
            },
            include: {
                soiDomain: true,
                department: true,
            },
            orderBy: { createdAt: "asc" },
        });

        if (scopeUsers.length > 0) {
            scopeMembers = scopeUsers.map(mapUserToTeamMember);
        } else {
            scopeMembers = TEAM_MEMBERS;
        }
    } catch (err) {
        console.error("Failed to query Scope faculty from database:", err);
        scopeMembers = TEAM_MEMBERS;
    }

    return <TeamClientView initialMembers={scopeMembers} />;
}
