import { Metadata } from "next";
import { TEAM_MEMBERS } from "@/data/teamData";
import TeamClientView from "./team/TeamClientView";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "SCOPE Faculty & Mentors | KGiSL Institute of Technology",
  description: "Explore the SCOPE Faculty Mentors and technical experts at KGiSL Institute of Technology driving hands-on software development, AI engineering, and industry training.",
  openGraph: {
    title: "SCOPE Faculty & Mentors | SindhanAI",
    description: "Meet the SCOPE Faculty Mentors driving programming excellence and AI development at KGiSL Institute of Technology.",
    images: ["/sindhanai-logo.png"]
  }
};

export default function HomePage() {
  return <TeamClientView initialMembers={TEAM_MEMBERS} />;
}
