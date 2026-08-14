import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const events = await prisma.event.findMany({
        include: {
            registrations: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(events);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, slug, date, time, venue, description, isPast } = body;

        if (!title || !date || !venue || !description) {
            return NextResponse.json({ error: "Title, date, venue, and description are required" }, { status: 400 });
        }

        const eventSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const event = await prisma.event.create({
            data: {
                title,
                slug: eventSlug,
                date,
                time: time || "09:30 AM - 04:30 PM IST",
                venue,
                description,
                isPast: isPast ?? false,
            },
        });

        return NextResponse.json(event);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await prisma.event.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
    }
}
