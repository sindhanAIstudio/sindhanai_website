import scopeFacultyRaw from "./scopeFacultyData.json";

export interface ScopeFacultyMember {
    id: string;
    sNo: string;
    empId: string;
    name: string;
    slug: string;
    role: string;
    about: string;
    category: string;
    email: string;
    phone: string;
    onePageCv: string;
    workExperience: string;
    pythonExperience: string;
    cProgrammingExperience: string;
    dsaDesignThinkingExperience: string;
    linkedin: string;
    github: string;
    xId: string;
    leetcode: string;
    hackerrank: string;
    medium: string;
    slack: string;
    kaggle: string;
    selfIntroVideo: string;
    avatar: string;
}

export interface TeamMember {
    id: string;
    slug: string;
    name: string;
    role: string;
    category: "Leadership & Mentors" | "AI & GenAI Engineers" | "Software Solutions" | "Student Innovators" | "SCOPE Team";
    lab: string;
    avatar: string;
    bio: string;
    fullBio: string;
    quote?: string;
    skills: string[];
    experience: string;
    location: string;
    email?: string;
    social: {
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
    stats: {
        projectsCount: number;
        papersOrPatents?: number;
        studentsMentored?: number;
        yearsExp: string;
    };
    highlights: {
        title: string;
        description: string;
    }[];
    scopeData?: ScopeFacultyMember;
}

export const SCOPE_FACULTY_LIST: ScopeFacultyMember[] = scopeFacultyRaw as ScopeFacultyMember[];

const mappedScopeMembers: TeamMember[] = SCOPE_FACULTY_LIST.map((fac) => {
    const skills: string[] = [];
    if (fac.pythonExperience && fac.pythonExperience !== "-") skills.push(`Python (${fac.pythonExperience})`);
    if (fac.cProgrammingExperience && fac.cProgrammingExperience !== "-") skills.push(`C Prog (${fac.cProgrammingExperience})`);
    if (fac.dsaDesignThinkingExperience && fac.dsaDesignThinkingExperience !== "-") skills.push(`DSA (${fac.dsaDesignThinkingExperience})`);
    if (fac.workExperience) skills.push(`Exp: ${fac.workExperience}`);
    if (skills.length === 0) skills.push("Faculty Mentor", "Programming Excellence");

    const fallbackBio = `${fac.name} is a SCOPE Faculty Mentor at KGISL Institute of Technology specializing in core programming, technical training, and student mentorship.`;
    const cleanBio = fac.about && fac.about.trim().length > 0 ? fac.about : fallbackBio;

    return {
        id: fac.id,
        slug: fac.slug,
        name: fac.name,
        role: fac.role || "SCOPE Faculty Mentor",
        category: "SCOPE Team",
        lab: "School of Computer Science & Engineering (SCOPE)",
        avatar: fac.avatar,
        bio: cleanBio.length > 140 ? cleanBio.substring(0, 140) + "..." : cleanBio,
        fullBio: cleanBio,
        quote: "Empowering students through applied technical excellence and industry-aligned mentorship.",
        skills: skills,
        experience: fac.workExperience || "Faculty Mentor",
        location: "Coimbatore, TN",
        email: fac.email,
        social: {
            linkedin: fac.linkedin && fac.linkedin !== "-" ? fac.linkedin : undefined,
            github: fac.github && fac.github !== "-" ? fac.github : undefined,
            twitter: fac.xId && fac.xId !== "-" ? fac.xId : undefined,
        },
        stats: {
            projectsCount: 12,
            studentsMentored: 300,
            yearsExp: fac.workExperience || "5+"
        },
        highlights: [
            {
                title: "Academic & Project Mentorship",
                description: cleanBio
            }
        ],
        scopeData: fac
    };
});

export const TEAM_MEMBERS: TeamMember[] = mappedScopeMembers;

export function mapUserToTeamMember(user: any): TeamMember {
    const skills: string[] = [];
    if (user.pythonExperience && user.pythonExperience !== "-") skills.push(`Python (${user.pythonExperience})`);
    if (user.cProgrammingExperience && user.cProgrammingExperience !== "-") skills.push(`C Prog (${user.cProgrammingExperience})`);
    if (user.dsaDesignThinkingExperience && user.dsaDesignThinkingExperience !== "-") skills.push(`DSA (${user.dsaDesignThinkingExperience})`);
    if (user.workExperience) skills.push(`Exp: ${user.workExperience}`);
    if (skills.length === 0) skills.push("Faculty Mentor", "Programming Excellence");

    const fallbackBio = `${user.name} is a SCOPE Faculty Mentor at KGISL Institute of Technology specializing in core programming, technical training, and student mentorship.`;
    const cleanBio = user.bio && user.bio.trim().length > 0 ? user.bio : fallbackBio;

    const scopeData: ScopeFacultyMember = {
        id: user.id,
        sNo: user.empId || "1",
        empId: user.empId || "",
        name: user.name,
        slug: user.slug || user.id,
        role: user.designation || "SCOPE Faculty Mentor",
        about: user.bio || "",
        category: "SCOPE Team",
        email: user.email || "",
        phone: user.mobileNumber || "",
        onePageCv: user.onePageCv || "",
        workExperience: user.workExperience || "",
        pythonExperience: user.pythonExperience || "",
        cProgrammingExperience: user.cProgrammingExperience || "",
        dsaDesignThinkingExperience: user.dsaDesignThinkingExperience || "",
        linkedin: user.linkedinUrl || "",
        github: user.githubUrl || "",
        xId: user.xUrl || "",
        leetcode: user.leetcodeUrl || "",
        hackerrank: user.hackerrankUrl || "",
        medium: user.mediumUrl || "",
        slack: user.slackUrl || "",
        kaggle: user.kaggleUrl || "",
        selfIntroVideo: user.selfIntroVideoUrl || "",
        avatar: user.profilePicUrl || "/sindhanai-logo.png",
    };

    return {
        id: user.id,
        slug: user.slug || user.id,
        name: user.name,
        role: user.designation || "SCOPE Faculty Mentor",
        category: "SCOPE Team",
        lab: user.soiDomain?.name || "School of Computer Science & Engineering (SCOPE)",
        avatar: user.profilePicUrl || "/sindhanai-logo.png",
        bio: cleanBio.length > 140 ? cleanBio.substring(0, 140) + "..." : cleanBio,
        fullBio: cleanBio,
        quote: "Empowering students through applied technical excellence and industry-aligned mentorship.",
        skills: skills,
        experience: user.workExperience || (user.experienceYears ? `${user.experienceYears} Years` : "Faculty Mentor"),
        location: "Coimbatore, TN",
        email: user.email,
        social: {
            linkedin: user.linkedinUrl || undefined,
            github: user.githubUrl || undefined,
            twitter: user.xUrl || undefined,
        },
        stats: {
            projectsCount: 12,
            studentsMentored: 300,
            yearsExp: user.workExperience || (user.experienceYears ? `${user.experienceYears}+` : "5+"),
        },
        highlights: [
            {
                title: "Academic & Project Mentorship",
                description: cleanBio,
            },
        ],
        scopeData: scopeData,
    };
}

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
    return TEAM_MEMBERS.find((m) => m.slug === slug);
}

