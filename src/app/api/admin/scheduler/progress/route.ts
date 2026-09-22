import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET /api/admin/scheduler/progress — Calculate syllabus completion % strictly based on database items
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const [subjects, scopeFaculty, allPlans, allSyllabusItems] = await Promise.all([
            prisma.subject.findMany({
                where: { NOT: { isDeleted: true } },
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
                orderBy: { name: "asc" },
            }),
            prisma.user.findMany({
                where: { instructorType: "Scope", deletedAt: null },
                select: { id: true, name: true, designation: true },
                orderBy: { name: "asc" },
            }),
            prisma.scopeDailyPlan.findMany({
                select: {
                    id: true,
                    userId: true,
                    subjectId: true,
                    departmentId: true,
                    classGroupId: true,
                    batchId: true,
                    status: true,
                    syllabusItemId: true,
                    syllabusItemIds: true,
                    completedTopicIds: true,
                },
            }),
            prisma.syllabusItem.findMany({
                where: { isDeleted: false },
                select: {
                    id: true,
                    subjectId: true,
                },
            }),
        ]);

        // Map subjectId -> Total active syllabus items count & set of syllabus item IDs
        const subjectTotalSyllabusMap: Record<string, number> = {};
        const subjectItemIdsMap: Record<string, Set<string>> = {};

        allSyllabusItems.forEach((item) => {
            if (item.subjectId) {
                subjectTotalSyllabusMap[item.subjectId] = (subjectTotalSyllabusMap[item.subjectId] || 0) + 1;
                if (!subjectItemIdsMap[item.subjectId]) {
                    subjectItemIdsMap[item.subjectId] = new Set();
                }
                subjectItemIdsMap[item.subjectId].add(item.id);
            }
        });

        // Parse helper
        const parseIds = (raw: any): string[] => {
            if (!raw) return [];
            if (Array.isArray(raw)) return raw;
            if (typeof raw === "string") {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                } catch {
                    return raw.split(",").map((s) => s.trim()).filter(Boolean);
                }
            }
            return [];
        };

        const classCompletedItemsMap: Record<string, Set<string>> = {};
        const subjectCompletedItemsMap: Record<string, Set<string>> = {};

        allPlans.forEach((plan) => {
            if (!plan.subjectId) return;
            const sid: string = plan.subjectId;

            const validSubjectItemIds = subjectItemIdsMap[sid] || new Set();
            const completedIds = parseIds(plan.completedTopicIds);
            let planTopicIds = parseIds(plan.syllabusItemIds);
            if (planTopicIds.length === 0 && plan.syllabusItemId) {
                planTopicIds = [plan.syllabusItemId];
            }

            const topicsToMark = new Set<string>();
            completedIds.forEach((id) => {
                if (validSubjectItemIds.has(id)) topicsToMark.add(id);
            });

            if (plan.status === "COMPLETED") {
                planTopicIds.forEach((id) => {
                    if (validSubjectItemIds.has(id)) topicsToMark.add(id);
                });
            }

            const classKey = `${sid}_${plan.departmentId || ""}_${plan.classGroupId || ""}_${plan.batchId || ""}`;

            if (!classCompletedItemsMap[classKey]) classCompletedItemsMap[classKey] = new Set();
            if (!subjectCompletedItemsMap[sid]) subjectCompletedItemsMap[sid] = new Set();

            topicsToMark.forEach((id) => {
                classCompletedItemsMap[classKey].add(id);
                subjectCompletedItemsMap[sid].add(id);
            });
        });

        // 1. Subject Completion Stats
        const subjectStats = subjects.map((subj) => {
            const total = subjectTotalSyllabusMap[subj.id] || 0;
            const completedSet = subjectCompletedItemsMap[subj.id] || new Set();
            const completed = completedSet.size;
            const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

            return {
                id: subj.id,
                name: subj.name,
                code: subj.code,
                total,
                completed,
                percentage,
            };
        });

        // 2. Class & Subject Progress Lookup Map
        const classSubjectProgressMap: Record<string, { total: number; completed: number; percentage: number }> = {};

        Object.keys(subjectTotalSyllabusMap).forEach((subjId) => {
            const total = subjectTotalSyllabusMap[subjId] || 0;
            const completedSet = subjectCompletedItemsMap[subjId] || new Set();
            const completed = completedSet.size;
            const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
            classSubjectProgressMap[subjId] = { total, completed, percentage };
        });

        Object.keys(classCompletedItemsMap).forEach((classKey) => {
            const subjId = classKey.split("_")[0];
            const total = subjectTotalSyllabusMap[subjId] || 0;
            const completedSet = classCompletedItemsMap[classKey] || new Set();
            const completed = completedSet.size;
            const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
            classSubjectProgressMap[classKey] = { total, completed, percentage };
        });

        // 3. Faculty Completion Stats
        const facultyStats = scopeFaculty.map((fac) => {
            const facPlans = allPlans.filter((p) => p.userId === fac.id);
            const totalCount = facPlans.length;
            const completedCount = facPlans.filter((p) => p.status === "COMPLETED").length;

            const percentage = totalCount > 0
                ? Math.min(100, Math.round((completedCount / totalCount) * 100))
                : 0;

            return {
                id: fac.id,
                name: fac.name,
                designation: fac.designation || "Faculty",
                completed: completedCount,
                percentage,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                subjects: subjectStats,
                faculty: facultyStats,
                classSubjectProgressMap,
            },
        });
    } catch (error: any) {
        console.error("GET Progress API Error:", error);
        return NextResponse.json({ error: "Failed to calculate syllabus progress" }, { status: 500 });
    }
}
