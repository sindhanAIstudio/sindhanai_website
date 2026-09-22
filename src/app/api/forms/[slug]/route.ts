import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const form = await prisma.dynamicForm.findUnique({
            where: { slug },
        });

        if (!form || !form.active) {
            return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
        }

        // Increment view count asynchronously
        prisma.dynamicForm.update({
            where: { id: form.id },
            data: { viewsCount: { increment: 1 } },
        }).catch((err) => console.warn("Failed to increment viewsCount:", err));

        return NextResponse.json({
            id: form.id,
            title: form.title,
            slug: form.slug,
            description: form.description,
            fields: form.fields,
        });
    } catch (error: any) {
        console.error("Public GET Form Error:", error);
        return NextResponse.json({ error: "Failed to load form" }, { status: 500 });
    }
}
