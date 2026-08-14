import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { formId, name, email, data } = body;

        const submission = await prisma.formSubmission.create({
            data: {
                formId: formId || null,
                name: name || "Anonymous",
                email: email || null,
                responses: JSON.stringify(data || body),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Thank you for reaching out! We have received your inquiry.",
            submissionId: submission.id,
        });
    } catch (error: any) {
        console.error("Form submission API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to submit form. Please try again." },
            { status: 500 }
        );
    }
}
