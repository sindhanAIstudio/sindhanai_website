import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category") || "departments";
        const status = searchParams.get("status") || "active"; // active, inactive, trashed

        let whereClause: any = {};
        if (status === "active") {
            whereClause = { isActive: true, deletedAt: null };
        } else if (status === "inactive") {
            whereClause = { isActive: false, deletedAt: null };
        } else if (status === "trashed") {
            whereClause = { deletedAt: { not: null } };
        }

        let data: any[] = [];
        switch (category) {
            case "departments":
                data = await prisma.department.findMany({ where: whereClause, orderBy: { name: "asc" } });
                break;
            case "classGroups":
                data = await prisma.classGroup.findMany({ where: whereClause, orderBy: { name: "asc" } });
                break;
            case "slotTimings":
                data = await prisma.slotTiming.findMany({ where: whereClause, orderBy: { name: "asc" } });
                break;
            case "soiDomains":
                data = await prisma.soiDomain.findMany({ where: whereClause, orderBy: { name: "asc" } });
                break;
            case "domainPlacements":
                data = await prisma.domainPlacement.findMany({ where: whereClause, orderBy: { name: "asc" } });
                break;
            case "batches":
                data = await prisma.batch.findMany({ where: whereClause, orderBy: { name: "asc" } });
                break;
            case "interestedRoles":
                data = await prisma.interestedRole.findMany({ where: whereClause, orderBy: { name: "asc" } });
                break;
            default:
                return NextResponse.json({ error: "Invalid metadata category" }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}

async function getBoundStudentCount(category: string, id: string): Promise<number> {
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
        const { category, id, name, code, isActive = true, action, startYear, endYear } = body;

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        // Action: Restore from trash
        if (action === "restore" && id) {
            let restored;
            const updatePayload = { deletedAt: null, isActive: true };
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
                    result = await prisma.classGroup.update({ where: { id }, data: { name: trimmedName, code: generatedCode, isActive } as any });
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
            }
        } else {
            // Create new
            switch (category) {
                case "departments":
                    result = await prisma.department.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
                    break;
                case "classGroups":
                    result = await prisma.classGroup.create({ data: { name: trimmedName, code: generatedCode, isActive } as any });
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
                }
            } catch (err: any) {
                if (err.code === "P2003") {
                    return NextResponse.json(
                        { error: "Cannot permanently purge this metadata because it is referenced by student records." },
                        { status: 400 }
                    );
                }
                throw err;
            }
        } else {
            // Soft Delete
            const softPayload = { deletedAt: new Date(), isActive: false };
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
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Delete Error:", err);
        return NextResponse.json({ error: err.message || "Failed to delete metadata record" }, { status: 500 });
    }
}
