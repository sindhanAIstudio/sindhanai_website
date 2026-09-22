import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    return "127.0.0.1";
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const form = await prisma.dynamicForm.findUnique({
            where: { slug },
        });

        if (!form || !form.active) {
            return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
        }

        const body = await req.json();
        const dataPayload = body.data || body;

        // Extract name & email if present in payload keys
        const name = dataPayload.fullName || dataPayload.name || dataPayload.nameField || null;
        const email = dataPayload.emailAddress || dataPayload.email || dataPayload.emailField || null;

        const requestIp = getClientIp(req);
        const userAgent = req.headers.get("user-agent") || null;

        const submission = await prisma.formSubmission.create({
            data: {
                formId: form.id,
                name: typeof name === "string" ? name : null,
                email: typeof email === "string" ? email : null,
                responses: typeof dataPayload === "string" ? dataPayload : JSON.stringify(dataPayload),
                requestIp,
                userAgent,
            },
        });

        // Increment submission count
        await prisma.dynamicForm.update({
            where: { id: form.id },
            data: { submissionsCount: { increment: 1 } },
        });

        return NextResponse.json({
            success: true,
            message: "Form submitted successfully!",
            submissionId: submission.id,
        });
    } catch (error: any) {
        console.error("Public POST Form Submission Error:", error);
        return NextResponse.json({ error: error.message || "Failed to submit form" }, { status: 500 });
    }
}
