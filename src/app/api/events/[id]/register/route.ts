import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { name, email, phone, institution, role, additionalInfo } = body;

        if (!name || !email || !phone || !institution || !role) {
            return NextResponse.json(
                { error: "Please fill in all required fields." },
                { status: 400 }
            );
        }

        // Verify event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return NextResponse.json(
                { error: "Event not found." },
                { status: 404 }
            );
        }

        const registration = await prisma.eventRegistration.create({
            data: {
                eventId,
                name,
                email,
                phone,
                institution,
                role,
                additionalInfo: additionalInfo || "",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Registration successful! Our team will contact you shortly.",
            registrationId: registration.id,
        });
    } catch (error) {
        console.error("Event registration API error:", error);
        return NextResponse.json(
            { error: "Failed to submit registration. Please try again." },
            { status: 500 }
        );
    }
}
