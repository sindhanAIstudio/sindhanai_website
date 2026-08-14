import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const forms = await prisma.dynamicForm.findMany({
        include: {
            submissions: {
                orderBy: { createdAt: "desc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const generalSubmissions = await prisma.formSubmission.findMany({
        where: { formId: null },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ forms, generalSubmissions });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, slug, description, fieldsJson, active } = body;

        if (!title || !fieldsJson) {
            return NextResponse.json({ error: "Title and fields JSON are required" }, { status: 400 });
        }

        const formSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const form = await prisma.dynamicForm.create({
            data: {
                title,
                slug: formSlug,
                description,
                fields: fieldsJson,
                active: active ?? true,
            },
        });

        return NextResponse.json(form);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create dynamic form" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await prisma.dynamicForm.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete form" }, { status: 500 });
    }
}
