import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import fs from "fs";
import path from "path";

// GET /api/admin/syllabus/export — Download CSV template or export existing syllabus
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const format = searchParams.get("format") || "csv"; // "csv" | "template"
        const kind = searchParams.get("kind") || "THEORY"; // "THEORY" | "LAB" | "MINI_PROJECT"

        if (format === "template") {
            if (kind === "MINI_PROJECT") {
                const sampleCsv = `title,language,description,link\n"Mini Project 1: AI Chatbot","Python","Build a RAG based chatbot using LangChain","https://github.com/example/rag-bot"\n"Mini Project 2: Smart Vision","Python","Realtime object detection using OpenCV","https://github.com/example/vision-app"`;
                return new NextResponse(sampleCsv, {
                    headers: {
                        "Content-Type": "text/csv; charset=utf-8",
                        "Content-Disposition": 'attachment; filename="mini_project_syllabus_template.csv"',
                    },
                });
            } else if (kind === "LAB") {
                const sampleCsv = `sessionNumber,title,duration,courseType,topicsOutline,pptResourceUrl,pptPublishedUrl,quizLink,activityLink\n1,"Lab Session 1: Development Environment Setup","2 Hours","LAB","1. Install Python 3.11\n2. Setup Virtual Environment\n3. Install Required Libraries","https://docs.google.com","http://tiny.cc","",""`;
                return new NextResponse(sampleCsv, {
                    headers: {
                        "Content-Type": "text/csv; charset=utf-8",
                        "Content-Disposition": 'attachment; filename="lab_syllabus_template.csv"',
                    },
                });
            } else {
                const sampleFilePath = path.join(process.cwd(), "public", "sample_python_syllabus.csv");
                let sampleCsv = "";
                if (fs.existsSync(sampleFilePath)) {
                    sampleCsv = fs.readFileSync(sampleFilePath, "utf-8");
                } else {
                    sampleCsv = `sessionNumber,title,duration,courseType,topicsOutline,pptResourceUrl,pptPublishedUrl,quizLink,activityLink\n1,"Session 1: Introduction to Python","1 Hour","THEORY","Python basics","https://docs.google.com","http://tiny.cc","",""`;
                }

                return new NextResponse(sampleCsv, {
                    headers: {
                        "Content-Type": "text/csv; charset=utf-8",
                        "Content-Disposition": 'attachment; filename="theory_syllabus_template.csv"',
                    },
                });
            }
        }

        // Export active data
        if (kind === "MINI_PROJECT") {
            const items = await prisma.miniProjectSyllabus.findMany({
                where: { NOT: { isDeleted: true } },
                include: { subject: true },
                orderBy: { createdAt: "desc" },
            });

            const headers = "id,title,language,description,link,subject\n";
            const rows = items.map(i =>
                `"${i.id}","${(i.title || "").replace(/"/g, '""')}","${(i.language || "").replace(/"/g, '""')}","${(i.description || "").replace(/"/g, '""')}","${i.link || ""}","${i.subject?.name || ""}"`
            ).join("\n");

            return new NextResponse(headers + rows, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": 'attachment; filename="mini_projects_export.csv"',
                },
            });
        } else {
            const whereCourseType = kind === "LAB" ? "LAB" : "THEORY";
            const items = await prisma.syllabusItem.findMany({
                where: { courseType: whereCourseType, NOT: { isDeleted: true } },
                include: { subject: true },
                orderBy: [{ sessionNumber: "asc" }, { createdAt: "asc" }],
            });

            const headers = "sessionNumber,title,duration,courseType,topicsOutline,pptResourceUrl,pptPublishedUrl,quizLink,activityLink,subject\n";
            const rows = items.map(i =>
                `"${i.sessionNumber || ""}","${(i.title || "").replace(/"/g, '""')}","${i.duration || ""}","${i.courseType}","${(i.topicsOutline || "").replace(/"/g, '""')}","${i.pptResourceUrl || ""}","${i.pptPublishedUrl || ""}","${i.quizLink || ""}","${i.activityLink || ""}","${i.subject?.name || ""}"`
            ).join("\n");

            return new NextResponse(headers + rows, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="${kind.toLowerCase()}_syllabus_export.csv"`,
                },
            });
        }
    } catch (error: any) {
        console.error("Export API Error:", error);
        return NextResponse.json({ error: "Failed to export syllabus data" }, { status: 500 });
    }
}
