import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query || typeof query !== "string") {
            return NextResponse.json(
                { success: false, message: "Query string is required" },
                { status: 400 }
            );
        }

        const lowerQuery = query.toLowerCase().trim();
        const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 2);

        // 1. Fetch matching syllabus items
        const syllabi = await prisma.syllabusItem.findMany({
            where: {
                OR: tokens.length > 0 ? [
                    ...tokens.map((t) => ({ title: { contains: t } })),
                    ...tokens.map((t) => ({ topicsOutline: { contains: t } })),
                ] : undefined,
            },
            take: 6,
            include: {
                department: true,
                classGroup: true,
            },
        });

        // 2. Fetch matching mini projects
        const miniProjects = await prisma.miniProjectSyllabus.findMany({
            where: {
                OR: tokens.length > 0 ? [
                    ...tokens.map((t) => ({ title: { contains: t } })),
                    ...tokens.map((t) => ({ description: { contains: t } })),
                    ...tokens.map((t) => ({ language: { contains: t } })),
                ] : undefined,
            },
            take: 6,
            include: {
                department: true,
                classGroup: true,
            },
        });

        // 3. Fetch matching daily plans / worklogs
        const dailyPlans = await prisma.scopeDailyPlan.findMany({
            where: {
                OR: tokens.length > 0 ? [
                    ...tokens.map((t) => ({ notes: { contains: t } })),
                    ...tokens.map((t) => ({ user: { name: { contains: t } } })),
                ] : undefined,
            },
            take: 6,
            include: {
                user: { select: { name: true, designation: true } },
                department: true,
                classGroup: true,
                syllabusItem: true,
                miniProjectSyllabus: true,
            },
            orderBy: { date: "desc" },
        });

        // 4. Synthesize context response
        let answer = "";
        let sources: any[] = [];

        if (syllabi.length > 0 || miniProjects.length > 0 || dailyPlans.length > 0) {
            answer = `Here is what I found in the academic repository for **"${query}"**:\n\n`;

            if (syllabi.length > 0) {
                answer += `### 📚 Theory & Lab Syllabus Topics (${syllabi.length} matches):\n`;
                syllabi.forEach((s) => {
                    answer += `- **Session ${s.sessionNumber}: ${s.title}** (${s.courseType})\n`;
                    answer += `  - *Duration*: ${s.duration || "N/A"}\n`;
                    answer += `  - *Topics*: ${s.topicsOutline || "N/A"}\n`;
                    if (s.pptResourceUrl) answer += `  - [PPT Resource](${s.pptResourceUrl})\n`;
                    if (s.pptPublishedUrl) answer += `  - [Published PPT](${s.pptPublishedUrl})\n`;
                    if (s.quizLink) answer += `  - [Quiz Link](${s.quizLink})\n`;
                    if (s.activityLink) answer += `  - [Activity Link](${s.activityLink})\n`;
                    answer += `\n`;

                    sources.push({
                        title: `Session ${s.sessionNumber}: ${s.title}`,
                        type: s.courseType,
                        ppt: s.pptResourceUrl || s.pptPublishedUrl,
                        quiz: s.quizLink,
                        activity: s.activityLink,
                    });
                });
            }

            if (miniProjects.length > 0) {
                answer += `### 💻 Mini Projects (${miniProjects.length} matches):\n`;
                miniProjects.forEach((m) => {
                    answer += `- **${m.title}** (Language: ${m.language})\n`;
                    answer += `  - *Description*: ${m.description || "N/A"}\n`;
                    if (m.link) answer += `  - [Project Link](${m.link})\n`;
                    answer += `\n`;

                    sources.push({
                        title: m.title,
                        type: "MINI_PROJECT",
                        link: m.link,
                    });
                });
            }

            if (dailyPlans.length > 0) {
                answer += `### 🗓️ Faculty Daily Executions (${dailyPlans.length} matches):\n`;
                dailyPlans.forEach((dp) => {
                    answer += `- **${dp.user.name}** | Period ${dp.periodNumber} (${dp.date})\n`;
                    answer += `  - *Status*: \`${dp.status}\` | *Course Type*: ${dp.courseType}\n`;
                    if (dp.syllabusItem) answer += `  - *Topic*: Session ${dp.syllabusItem.sessionNumber} - ${dp.syllabusItem.title}\n`;
                    if (dp.miniProjectSyllabus) answer += `  - *Project*: ${dp.miniProjectSyllabus.title}\n`;
                    if (dp.notes) answer += `  - *Notes*: ${dp.notes}\n`;
                    answer += `\n`;
                });
            }
        } else {
            // General query fallback or overall status summary
            const totalSyllabusCount = await prisma.syllabusItem.count();
            const totalMiniProjectsCount = await prisma.miniProjectSyllabus.count();
            const totalExecutionsCount = await prisma.scopeDailyPlan.count({ where: { status: "COMPLETED" } });

            answer = `I checked the SCOPE Academic Database for **"${query}"**.\n\nCurrently, our academic database tracks:\n- **${totalSyllabusCount}** Theory & Lab Sessions\n- **${totalMiniProjectsCount}** Mini Project Specifications\n- **${totalExecutionsCount}** Verified Completed Classroom Sessions\n\nTry searching for topics like *"Binary Search Trees"*, *"Python Mini Projects"*, *"Maruthupandi"*, or specific section schedules!`;
        }

        return NextResponse.json({
            success: true,
            data: {
                query,
                answer,
                sources,
                matches: {
                    syllabiCount: syllabi.length,
                    miniProjectsCount: miniProjects.length,
                    dailyPlansCount: dailyPlans.length,
                },
            },
        });
    } catch (err: any) {
        console.error("Academic RAG Error:", err);
        return NextResponse.json(
            { success: false, message: "RAG query failed: " + err.message },
            { status: 500 }
        );
    }
}
