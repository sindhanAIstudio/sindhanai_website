import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// PUT /api/admin/wifi-whitelist/[id] — Update or Toggle Active status
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, ipAddressOrSubnet, description, isActive } = body;

        const updated = await prisma.wifiWhitelist.update({
            where: { id },
            data: {
                name: name ? name.trim() : undefined,
                ipAddressOrSubnet: ipAddressOrSubnet ? ipAddressOrSubnet.trim() : undefined,
                description: description !== undefined ? (description ? description.trim() : null) : undefined,
                isActive: typeof isActive === "boolean" ? isActive : undefined,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("PUT Wifi Whitelist Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update Wi-Fi entry" }, { status: 500 });
    }
}

// DELETE /api/admin/wifi-whitelist/[id] — Remove entry
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        await prisma.wifiWhitelist.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Wi-Fi entry removed" });
    } catch (error: any) {
        console.error("DELETE Wifi Whitelist Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete Wi-Fi entry" }, { status: 500 });
    }
}
