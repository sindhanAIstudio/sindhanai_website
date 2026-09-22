import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTeamMemberBySlug, TEAM_MEMBERS, mapUserToTeamMember, TeamMember } from "@/data/teamData";
import TeamProfileClientView from "./TeamProfileClientView";

export const revalidate = 0;

export async function generateStaticParams() {
    try {
        const scopeUsers = await prisma.user.findMany({
            where: {
                instructorType: "Scope",
                deletedAt: null,
            },
            select: { slug: true },
        });

        if (scopeUsers.length > 0) {
            return scopeUsers
                .filter((u) => u.slug)
                .map((u) => ({ slug: u.slug as string }));
        }
    } catch (e) { }

    return TEAM_MEMBERS.map((member) => ({
        slug: member.slug,
    }));
}

export default async function TeamProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let member: TeamMember | undefined = undefined;

    try {
        const dbUser = await prisma.user.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
            include: {
                soiDomain: true,
                department: true,
            },
        });

        if (dbUser) {
            member = mapUserToTeamMember(dbUser);
        }
    } catch (err) {
        console.error("Error finding faculty by slug from DB:", err);
    }

    if (!member) {
        member = getTeamMemberBySlug(slug);
    }

    if (!member) {
        notFound();
    }

    return <TeamProfileClientView member={member} />;
}
