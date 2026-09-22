import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const forms = await prisma.dynamicForm.findMany({
            include: {
                _count: {
                    select: { submissions: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ forms });
    } catch (error: any) {
        console.error("GET Forms Error:", error);
        return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await request.json();
        const { title, slug, description, type = "form", fieldsJson, active } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const formSlug = (slug || title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        // Check unique slug
        const existing = await prisma.dynamicForm.findUnique({ where: { slug: formSlug } });
        const finalSlug = existing ? `${formSlug}-${Date.now().toString().slice(-4)}` : formSlug;

        // Default schemas tailored per type (Form / Poll / Quiz)
        let defaultSchema = fieldsJson;
        if (!defaultSchema) {
            if (type === "poll") {
                defaultSchema = JSON.stringify([
                    {
                        id: "poll_q1",
                        type: "radio",
                        label: title,
                        description: "Select your vote preference below",
                        options: ["Option A: Artificial Intelligence & LLMs", "Option B: Web Development & Next.js", "Option C: UI/UX Product Design"],
                        required: true,
                    },
                ]);
            } else if (type === "quiz") {
                defaultSchema = JSON.stringify([
                    {
                        id: "quiz_q1",
                        type: "radio",
                        label: "Question 1: What does LLM stand for in Artificial Intelligence?",
                        description: "Select the correct definition choice",
                        options: ["Large Language Model", "Long Learning Module", "Linear Logic Machine"],
                        correctAnswer: "Large Language Model",
                        points: 10,
                        explanation: "LLM stands for Large Language Model, an AI model trained on large datasets.",
                        required: true,
                    },
                ]);
            } else {
                defaultSchema = JSON.stringify([
                    {
                        id: "field_fullname",
                        type: "text",
                        label: "Full Name",
                        placeholder: "Enter full name",
                        colSpan: 6,
                        required: true,
                    },
                    {
                        id: "field_email",
                        type: "email",
                        label: "Email Address",
                        placeholder: "name@sindhanai.in",
                        colSpan: 6,
                        required: true,
                    },
                ]);
            }
        }

        const form = await prisma.dynamicForm.create({
            data: {
                title,
                slug: finalSlug,
                description: description || null,
                type,
                fields: typeof defaultSchema === "string" ? defaultSchema : JSON.stringify(defaultSchema),
                active: active ?? true,
            } as any,
        });

        return NextResponse.json({ success: true, form });
    } catch (error: any) {
        console.error("POST Form Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create dynamic form" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await prisma.dynamicForm.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete form" }, { status: 500 });
    }
}
