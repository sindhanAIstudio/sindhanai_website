import { notFound } from "next/navigation";
import { getTeamMemberBySlug, TEAM_MEMBERS } from "@/data/teamData";
import TeamProfileClientView from "./TeamProfileClientView";

export const revalidate = 0;

export function generateStaticParams() {
    return TEAM_MEMBERS.map((member) => ({
        slug: member.slug,
    }));
}

export default async function TeamProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const member = getTeamMemberBySlug(slug);

    if (!member) {
        notFound();
    }

    return <TeamProfileClientView member={member} />;
}
