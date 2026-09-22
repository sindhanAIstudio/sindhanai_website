import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        const form = await prisma.dynamicForm.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { submissions: true },
                },
            },
        });

        if (!form) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        return NextResponse.json({ form });
    } catch (error: any) {
        console.error("GET Single Form Error:", error);
        return NextResponse.json({ error: "Failed to fetch form details" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { title, slug, description, type, fields, active } = body;

        const existing = await prisma.dynamicForm.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        const updatedForm = await prisma.dynamicForm.update({
            where: { id },
            data: {
                title: title || existing.title,
                slug: slug || existing.slug,
                description: description !== undefined ? description : existing.description,
                type: type || (existing as any).type,
                fields: fields ? (typeof fields === "string" ? fields : JSON.stringify(fields)) : existing.fields,
                active: active !== undefined ? active : existing.active,
            } as any,
        });

        return NextResponse.json({ success: true, form: updatedForm });
    } catch (error: any) {
        console.error("PUT Form Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update form" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = await params;
        await prisma.dynamicForm.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Form Error:", error);
        return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
    }
}
