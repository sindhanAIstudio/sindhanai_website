import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthPermission } from "@/lib/rbac/guard";

export async function POST(req: Request) {
    try {
        // Enforce RBAC permission guard
        await requireAuthPermission("rbac:manage");

        const { roleId, permissionKeys } = await req.json();

        if (!roleId || !Array.isArray(permissionKeys)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        if (role.name === "SUPER_ADMIN") {
            return NextResponse.json({ error: "Cannot modify SUPER_ADMIN role permissions" }, { status: 400 });
        }

        // Fetch permission IDs matching keys
        const permissions = await prisma.permission.findMany({
            where: { key: { in: permissionKeys } },
            select: { id: true },
        });

        // Transactionally sync RolePermission matrix
        await prisma.$transaction([
            prisma.rolePermission.deleteMany({ where: { roleId } }),
            prisma.rolePermission.createMany({
                data: permissions.map((p) => ({
                    roleId,
                    permissionId: p.id,
                })),
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Access Denied: Insufficient dynamic permissions" }, { status: 403 });
        }
        console.error("RBAC Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
