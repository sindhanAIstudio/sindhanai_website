import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/scheduler — Fetch period configs & daily plans
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get("facultyId") || session.userId;
        const date = searchParams.get("date") || searchParams.get("dateStr") || new Date().toISOString().split("T")[0];

        // 1. Fetch or initialize 8 dynamic period configs
        let periodConfigs = await prisma.academicPeriodConfig.findMany({
            orderBy: { periodNumber: "asc" },
        });

        if (periodConfigs.length === 0) {
            const defaultPeriods = [
                { periodNumber: 1, periodName: "Period 1", startTime: "08:30", endTime: "09:30" },
                { periodNumber: 2, periodName: "Period 2", startTime: "09:30", endTime: "10:30" },
                { periodNumber: 3, periodName: "Period 3", startTime: "10:30", endTime: "11:30" },
                { periodNumber: 4, periodName: "Period 4", startTime: "11:30", endTime: "12:30" },
                { periodNumber: 5, periodName: "Period 5", startTime: "13:30", endTime: "14:30" },
                { periodNumber: 6, periodName: "Period 6", startTime: "14:30", endTime: "15:30" },
                { periodNumber: 7, periodName: "Period 7", startTime: "15:30", endTime: "16:30" },
                { periodNumber: 8, periodName: "Period 8", startTime: "16:30", endTime: "17:30" },
            ];

            for (const p of defaultPeriods) {
                await prisma.academicPeriodConfig.create({ data: p });
            }
            periodConfigs = await prisma.academicPeriodConfig.findMany({ orderBy: { periodNumber: "asc" } });
        }

        // 2. Fetch daily plans for specified faculty and date
        const dailyPlans = await prisma.scopeDailyPlan.findMany({
            where: {
                userId: facultyId,
                date: date,
            },
            include: {
                subject: true,
                syllabusItem: true,
                miniProjectSyllabus: true,
                department: true,
                classGroup: true,
                batch: true,
            },
            orderBy: { periodNumber: "asc" },
        });

        // 3. Map to 8 period slots
        const planMap: Record<number, any> = {};
        dailyPlans.forEach((p) => {
            planMap[p.periodNumber] = p;
        });

        return NextResponse.json({
            success: true,
            date,
            periodConfigs,
            dailyPlans: planMap,
        });
    } catch (error: any) {
        console.error("GET Scheduler API Error:", error);
        return NextResponse.json({ error: "Failed to fetch academic schedule" }, { status: 500 });
    }
}

// POST /api/admin/scheduler — Save or update daily topic plan & completion status
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const {
            facultyId,
            date,
            dateStr,
            periodNumber,
            courseType, // "THEORY" | "LAB" | "MINI_PROJECT"
            subjectId,
            syllabusItemId,
            syllabusItemIds,
            miniProjectSyllabusId,
            departmentId,
            classGroupId,
            batchId,
            plannedTopicTitle,
            status, // "PLANNED" | "COMPLETED" | "PARTIALLY_COMPLETED" | "NOT_COMPLETED"
            completedTopicIds,
            notes,
        } = body;

        const targetUserId = (session.role === "SUPER_ADMIN" || session.role === "ADMIN") && facultyId ? facultyId : session.userId;
        const targetDate = date || dateStr;

        if (!targetDate || !periodNumber) {
            return NextResponse.json({ error: "Date and Period Number are required" }, { status: 400 });
        }

        const formattedItemIds = Array.isArray(syllabusItemIds) ? JSON.stringify(syllabusItemIds) : (typeof syllabusItemIds === "string" ? syllabusItemIds : null);
        const formattedCompletedIds = Array.isArray(completedTopicIds) ? JSON.stringify(completedTopicIds) : (typeof completedTopicIds === "string" ? completedTopicIds : null);

        const plan = await prisma.scopeDailyPlan.upsert({
            where: {
                userId_date_periodNumber: {
                    userId: targetUserId,
                    date: targetDate,
                    periodNumber: parseInt(periodNumber),
                },
            },
            update: {
                courseType: courseType || "THEORY",
                subjectId: subjectId || null,
                syllabusItemId: syllabusItemId || null,
                syllabusItemIds: formattedItemIds,
                miniProjectSyllabusId: miniProjectSyllabusId || null,
                departmentId: departmentId || null,
                classGroupId: classGroupId || null,
                batchId: batchId || null,
                plannedTopicTitle: plannedTopicTitle ? plannedTopicTitle.trim() : null,
                status: status || "PLANNED",
                completedTopicIds: formattedCompletedIds,
                notes: notes ? notes.trim() : null,
            },
            create: {
                userId: targetUserId,
                date: targetDate,
                periodNumber: parseInt(periodNumber),
                courseType: courseType || "THEORY",
                subjectId: subjectId || null,
                syllabusItemId: syllabusItemId || null,
                syllabusItemIds: formattedItemIds,
                miniProjectSyllabusId: miniProjectSyllabusId || null,
                departmentId: departmentId || null,
                classGroupId: classGroupId || null,
                batchId: batchId || null,
                plannedTopicTitle: plannedTopicTitle ? plannedTopicTitle.trim() : null,
                status: status || "PLANNED",
                completedTopicIds: formattedCompletedIds,
                notes: notes ? notes.trim() : null,
            },
            include: {
                subject: true,
                syllabusItem: true,
                miniProjectSyllabus: true,
                department: true,
                classGroup: true,
                batch: true,
            },
        });

        return NextResponse.json({ success: true, data: plan });
    } catch (error: any) {
        console.error("POST Scheduler API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update daily plan" }, { status: 500 });
    }
}
