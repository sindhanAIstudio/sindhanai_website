import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const posts = await prisma.newsPost.findMany({
        orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json(posts);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, slug, summary, content, category, published } = body;

        if (!title || !summary || !content) {
            return NextResponse.json({ error: "Title, summary, and content are required" }, { status: 400 });
        }

        const postSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const post = await prisma.newsPost.create({
            data: {
                title,
                slug: postSlug,
                summary,
                content,
                category: category || "Announcement",
                published: published ?? true,
            },
        });

        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create news post" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await prisma.newsPost.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
    }
}
