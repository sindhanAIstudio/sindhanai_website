import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST /api/admin/syllabus/import — Bulk import syllabus sessions or mini projects for a Subject
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { items, kind, subjectId } = body;

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No valid syllabus items provided for import" }, { status: 400 });
        }

        let importedCount = 0;

        if (kind === "MINI_PROJECT") {
            const recordsToInsert = items.map((item: any) => ({
                title: item.title || item["Project Title"] || item["title"] || "Untitled Mini Project",
                language: item.language || item["Programming Language"] || item["language"] || "Python",
                description: item.description || item["Description"] || null,
                link: item.link || item["Project Link"] || item["link"] || null,
                subjectId: subjectId || item.subjectId || null,
                isDeleted: false,
            }));

            const result = await prisma.miniProjectSyllabus.createMany({
                data: recordsToInsert,
            });
            importedCount = result.count;
        } else {
            const recordsToInsert = items.map((raw: any, idx: number) => {
                // Normalize keys for flexibility
                const item: Record<string, any> = {};
                Object.keys(raw).forEach((k) => {
                    const cleanKey = k.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    item[cleanKey] = raw[k];
                });

                const rawTitle = item["title"] || item["sessionnumbertitle"] || item["sessiontitle"] || raw["Session Number / Title"] || raw["title"] || `Session ${idx + 1}`;
                
                // Extract session number if present in title e.g. "Session 1: Introduction to Python"
                let sessNum = idx + 1;
                if (item["sessionnumber"]) {
                    sessNum = parseInt(item["sessionnumber"]);
                } else {
                    const match = rawTitle.match(/session\s*(\d+)/i);
                    if (match) sessNum = parseInt(match[1]);
                }

                const topics = item["topicsoutline"] || item["topicscontentoutline"] || item["topics"] || item["outline"] || raw["Topics / Content Outline"] || null;
                const pptResource = item["pptresourceurl"] || item["pptresource"] || item["ppturl"] || item["ppt"] || raw["PPT Resouce"] || raw["PPT Resource"] || null;
                const pptPub = item["pptpublishedurl"] || item["pptresourcepublishedurl"] || item["publishedppturl"] || item["publishedppt"] || raw["PPT Resouce (Published URL)"] || null;
                const duration = item["duration"] || raw["Duration"] || "1 Hour";
                const quiz = item["quizlink"] || item["quiz"] || null;
                const activity = item["activitylink"] || item["activity"] || null;
                let courseType = "THEORY";
                if (kind === "LAB") {
                    courseType = "LAB";
                } else if (kind === "THEORY") {
                    courseType = "THEORY";
                } else {
                    courseType = (item["coursetype"] || item["type"] || "THEORY").toString().toUpperCase().includes("LAB") ? "LAB" : "THEORY";
                }

                return {
                    sessionNumber: isNaN(sessNum) ? idx + 1 : sessNum,
                    title: rawTitle.trim(),
                    duration: duration ? duration.toString().trim() : "1 Hour",
                    topicsOutline: topics ? topics.toString().trim() : null,
                    pptResourceUrl: pptResource ? pptResource.toString().trim() : null,
                    pptPublishedUrl: pptPub ? pptPub.toString().trim() : null,
                    quizLink: quiz ? quiz.toString().trim() : null,
                    activityLink: activity ? activity.toString().trim() : null,
                    courseType,
                    subjectId: subjectId || raw.subjectId || null,
                    isDeleted: false,
                };
            });

            const result = await prisma.syllabusItem.createMany({
                data: recordsToInsert,
            });
            importedCount = result.count;
        }

        return NextResponse.json({
            success: true,
            importedCount,
            message: `Successfully imported ${importedCount} items into ${kind === "MINI_PROJECT" ? "Mini Projects" : "Syllabus"}.`,
        });
    } catch (error: any) {
        console.error("Bulk Import API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process bulk syllabus import" }, { status: 500 });
    }
}
