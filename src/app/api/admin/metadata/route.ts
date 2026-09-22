import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function getModelDelegate(category: string) {
    switch (category) {
        case "departments": return prisma.department;
        case "classGroups": return prisma.classGroup;
        case "slotTimings": return prisma.slotTiming;
        case "soiDomains": return prisma.soiDomain;
        case "domainPlacements": return prisma.domainPlacement;
        case "batches": return prisma.batch;
        case "interestedRoles": return prisma.interestedRole;
        case "subjects": return prisma.subject;
        default: return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category") || "departments";
        const status = searchParams.get("status") || "active"; // active, inactive, trashed, all
        const search = (searchParams.get("search") || "").trim();
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "5"); // Default 5 per page
        const isAll = searchParams.get("all") === "true";

        const model: any = getModelDelegate(category);
        if (!model) {
            return NextResponse.json({ error: "Invalid metadata category" }, { status: 400 });
        }

        let whereClause: any = {};
        if (status === "active") {
            whereClause = { isActive: true, deletedAt: null };
        } else if (status === "inactive") {
            whereClause = { isActive: false, deletedAt: null };
        } else if (status === "trashed") {
            whereClause = { deletedAt: { not: null } };
        }

        if (search) {
            whereClause.AND = [
                {
                    OR: [
                        { name: { contains: search } },
                        { code: { contains: search } },
                    ],
                },
            ];
        }

        const queryOptions: any = {
            where: whereClause,
            orderBy: { name: "asc" },
            skip: isAll ? undefined : (page - 1) * pageSize,
            take: isAll ? undefined : pageSize,
        };
        if (category === "classGroups") {
            queryOptions.include = {
                batch: true,
                department: true,
            };
        }

        const [activeCount, inactiveCount, trashedCount, total, items] = await Promise.all([
            model.count({ where: { isActive: true, deletedAt: null } }),
            model.count({ where: { isActive: false, deletedAt: null } }),
            model.count({ where: { deletedAt: { not: null } } }),
            model.count({ where: whereClause }),
            model.findMany(queryOptions),
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            pagination: {
                total,
                page,
                pageSize: isAll ? total : pageSize,
                totalPages: isAll ? 1 : (Math.ceil(total / pageSize) || 1),
            },
            counts: {
                active: activeCount,
                inactive: inactiveCount,
                trashed: trashedCount,
            },
        });
    } catch (err: any) {
        console.error("GET Metadata API Error:", err);
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}

async function getBoundStudentCount(category: string, id: string): Promise<number> {
    if (category === "subjects") {
        const syllabusCount = await prisma.syllabusItem.count({ where: { subjectId: id, isDeleted: false } });
        const miniProjectCount = await prisma.miniProjectSyllabus.count({ where: { subjectId: id, isDeleted: false } });
        return syllabusCount + miniProjectCount;
    }

    const fieldMap: Record<string, string> = {
        departments: "departmentId",
        classGroups: "classGroupId",
        slotTimings: "slotTimingId",
        soiDomains: "soiDomainId",
        domainPlacements: "domainPlacementId",
        batches: "batchId",
        interestedRoles: "interestedRoleId",
    };

    const fieldName = fieldMap[category];
    if (!fieldName) return 0;

    return await prisma.user.count({
        where: {
            [fieldName]: id,
            deletedAt: null,
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { category, id, name, code, isActive = true, action, startYear, endYear, batchId, departmentId } = body;

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        // Action: Restore from trash
        if (action === "restore" && id) {
            let restored;
            const updatePayload = { deletedAt: null, isActive: true, isDeleted: false };
            switch (category) {
                case "departments":
                    restored = await prisma.department.update({ where: { id }, data: updatePayload });
                    break;
                case "classGroups":
                    restored = await prisma.classGroup.update({ where: { id }, data: updatePayload });
                    break;
                case "slotTimings":
                    restored = await prisma.slotTiming.update({ where: { id }, data: updatePayload });
                    break;
                case "soiDomains":
                    restored = await prisma.soiDomain.update({ where: { id }, data: updatePayload });
                    break;
                case "domainPlacements":
                    restored = await prisma.domainPlacement.update({ where: { id }, data: updatePayload });
                    break;
                case "batches":
                    restored = await prisma.batch.update({ where: { id }, data: updatePayload });
                    break;
                case "interestedRoles":
                    restored = await prisma.interestedRole.update({ where: { id }, data: updatePayload });
                    break;
                case "subjects":
                    restored = await prisma.subject.update({ where: { id }, data: updatePayload });
                    break;
            }
            return NextResponse.json({ success: true, data: restored });
        }

        // Action: Toggle Active / Inactive status
        if (action === "toggle-status" && id) {
            if (isActive === false) {
                const boundCount = await getBoundStudentCount(category, id);
                if (boundCount > 0) {
                    return NextResponse.json(
                        { error: `Cannot deactivate metadata bound to ${boundCount} active student record(s). Reassign those students first.` },
                        { status: 400 }
                    );
                }
            }

            let toggled;
            switch (category) {
                case "departments":
                    toggled = await prisma.department.update({ where: { id }, data: { isActive } as any });
                    break;
                case "classGroups":
                    toggled = await prisma.classGroup.update({ where: { id }, data: { isActive } as any });
                    break;
                case "slotTimings":
                    toggled = await prisma.slotTiming.update({ where: { id }, data: { isActive } as any });
                    break;
                case "soiDomains":
                    toggled = await prisma.soiDomain.update({ where: { id }, data: { isActive } as any });
                    break;
                case "domainPlacements":
                    toggled = await prisma.domainPlacement.update({ where: { id }, data: { isActive } as any });
                    break;
                case "batches":
                    toggled = await prisma.batch.update({ where: { id }, data: { isActive } as any });
                    break;
                case "interestedRoles":
                    toggled = await prisma.interestedRole.update({ where: { id }, data: { isActive } as any });
                    break;
                case "subjects":
                    toggled = await prisma.subject.update({ where: { id }, data: { isActive } as any });
                    break;
            }
            return NextResponse.json({ success: true, data: toggled });
        }

        const trimmedName = (name || "").trim();
        const trimmedCode = (code || "").toUpperCase().trim().replace(/[^A-Z0-9_]/g, "_");

        if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
            return NextResponse.json({ error: "Display Name is required (2-100 characters)" }, { status: 400 });
        }

        let generatedCode = trimmedCode;
        let sYear = parseInt(startYear);
        let eYear = parseInt(endYear);

        if (category === "batches") {
            if (isNaN(sYear) || sYear < 2015 || sYear > 2099) {
                return NextResponse.json({ error: "Start Year must be a valid 4-digit year between 2015 and 2099" }, { status: 400 });
            }
            if (isNaN(eYear) || eYear < 2016 || eYear > 2100) {
                return NextResponse.json({ error: "End Year must be a valid 4-digit year between 2016 and 2100" }, { status: 400 });
            }
            if (eYear <= sYear) {
                return NextResponse.json({ error: "End Year must be strictly greater than Start Year" }, { status: 400 });
            }
            if (eYear - sYear > 6) {
                return NextResponse.json({ error: "Batch duration cannot exceed 6 years" }, { status: 400 });
            }

            if (!generatedCode) {
                generatedCode = `BATCH_${sYear}_${eYear}`;
            }
        }

        if (!generatedCode || generatedCode.length < 2 || generatedCode.length > 20) {
            return NextResponse.json({ error: "Unique Code must be 2-20 uppercase alphanumeric characters" }, { status: 400 });
        }

        let result;
        if (id) {
            // Update existing
            switch (category) {
                case "departments":
                    result = await prisma.department.update({ where: { id }, data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "classGroups":
                    result = await prisma.classGroup.update({
                        where: { id },
                        data: {
                            name: trimmedName,
                            code: generatedCode,
                            batchId: batchId || null,
                            departmentId: departmentId || null,
                            isActive,
                        } as any,
                        include: { batch: true, department: true },
                    });
                    break;
                case "slotTimings":
                    result = await prisma.slotTiming.update({ where: { id }, data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "soiDomains":
                    result = await prisma.soiDomain.update({ where: { id }, data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "domainPlacements":
                    result = await prisma.domainPlacement.update({ where: { id }, data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "batches":
                    result = await prisma.batch.update({
                        where: { id },
                        data: { name: trimmedName, code: generatedCode, startYear: sYear, endYear: eYear, isActive } as any,
                    });
                    break;
                case "interestedRoles":
                    result = await prisma.interestedRole.update({ where: { id }, data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "subjects":
                    result = await prisma.subject.update({ where: { id }, data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
            }
        } else {
            // Create new
            switch (category) {
                case "departments":
                    result = await prisma.department.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "classGroups":
                    result = await prisma.classGroup.create({
                        data: {
                            name: trimmedName,
                            code: generatedCode,
                            batchId: batchId || null,
                            departmentId: departmentId || null,
                            isActive,
                        } as any,
                        include: { batch: true, department: true },
                    });
                    break;
                case "slotTimings":
                    result = await prisma.slotTiming.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "soiDomains":
                    result = await prisma.soiDomain.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "domainPlacements":
                    result = await prisma.domainPlacement.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "batches":
                    result = await prisma.batch.create({
                        data: { name: trimmedName, code: generatedCode, startYear: sYear, endYear: eYear, isActive } as any,
                    });
                    break;
                case "interestedRoles":
                    result = await prisma.interestedRole.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "subjects":
                    result = await prisma.subject.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
            }
        }

        return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
        if (err.code === "P2002") {
            return NextResponse.json({ error: "Code or Name already exists. Must be unique." }, { status: 400 });
        }
        return NextResponse.json({ error: err.message || "Failed to save metadata" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const id = searchParams.get("id");
        const permanent = searchParams.get("permanent") === "true";

        if (!category || !id) {
            return NextResponse.json({ error: "Category and ID are required" }, { status: 400 });
        }

        // Relation Guard: Check if metadata is bound to any active student records
        const boundCount = await getBoundStudentCount(category, id);
        if (boundCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete metadata bound to ${boundCount} active student record(s). Please reassign those students first.` },
                { status: 400 }
            );
        }

        if (permanent) {
            // Hard Delete
            try {
                switch (category) {
                    case "departments":
                        await prisma.department.delete({ where: { id } });
                        break;
                    case "classGroups":
                        await prisma.classGroup.delete({ where: { id } });
                        break;
                    case "slotTimings":
                        await prisma.slotTiming.delete({ where: { id } });
                        break;
                    case "soiDomains":
                        await prisma.soiDomain.delete({ where: { id } });
                        break;
                    case "domainPlacements":
                        await prisma.domainPlacement.delete({ where: { id } });
                        break;
                    case "batches":
                        await prisma.batch.delete({ where: { id } });
                        break;
                    case "interestedRoles":
                        await prisma.interestedRole.delete({ where: { id } });
                        break;
                    case "subjects":
                        await prisma.subject.delete({ where: { id } });
                        break;
                }
            } catch (err: any) {
                if (err.code === "P2003") {
                    return NextResponse.json(
                        { error: "Cannot permanently purge this metadata because it is referenced by other records." },
                        { status: 400 }
                    );
                }
                throw err;
            }
        } else {
            // Soft Delete
            const softPayload = { deletedAt: new Date(), isActive: false, isDeleted: true };
            switch (category) {
                case "departments":
                    await prisma.department.update({ where: { id }, data: softPayload });
                    break;
                case "classGroups":
                    await prisma.classGroup.update({ where: { id }, data: softPayload });
                    break;
                case "slotTimings":
                    await prisma.slotTiming.update({ where: { id }, data: softPayload });
                    break;
                case "soiDomains":
                    await prisma.soiDomain.update({ where: { id }, data: softPayload });
                    break;
                case "domainPlacements":
                    await prisma.domainPlacement.update({ where: { id }, data: softPayload });
                    break;
                case "batches":
                    await prisma.batch.update({ where: { id }, data: softPayload });
                    break;
                case "interestedRoles":
                    await prisma.interestedRole.update({ where: { id }, data: softPayload });
                    break;
                case "subjects":
                    await prisma.subject.update({ where: { id }, data: softPayload });
                    break;
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Delete Error:", err);
        return NextResponse.json({ error: err.message || "Failed to delete metadata record" }, { status: 500 });
    }
}
