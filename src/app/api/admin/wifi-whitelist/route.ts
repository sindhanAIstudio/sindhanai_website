import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// Helper to extract client IP from headers
function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    return "127.0.0.1";
}

// GET /api/admin/wifi-whitelist — List active & inactive whitelisted IP subnets
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const detectedIp = getClientIp(req);
        const whitelists = await prisma.wifiWhitelist.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            detectedIp,
            data: whitelists,
        });
    } catch (error) {
        console.error("GET Wifi Whitelist Error:", error);
        return NextResponse.json({ error: "Failed to fetch Wi-Fi whitelist" }, { status: 500 });
    }
}

// POST /api/admin/wifi-whitelist — Add new Wi-Fi subnet / IP
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { name, ipAddressOrSubnet, description } = body;

        if (!name || !ipAddressOrSubnet) {
            return NextResponse.json(
                { error: "Router/Network Name and IP Subnet are mandatory" },
                { status: 400 }
            );
        }

        const entry = await prisma.wifiWhitelist.create({
            data: {
                name: name.trim(),
                ipAddressOrSubnet: ipAddressOrSubnet.trim(),
                description: description ? description.trim() : null,
                isActive: true,
            },
        });

        return NextResponse.json({ success: true, data: entry });
    } catch (error: any) {
        console.error("POST Wifi Whitelist Error:", error);
        return NextResponse.json({ error: error.message || "Failed to add Wi-Fi whitelist" }, { status: 500 });
    }
}
