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
        const { searchParams } = new URL(req.url);
        const isCsv = searchParams.get("format") === "csv";

        const form = await prisma.dynamicForm.findUnique({
            where: { id },
        });

        if (!form) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        const submissions = await prisma.formSubmission.findMany({
            where: { formId: id },
            orderBy: { createdAt: "desc" },
        });

        if (isCsv) {
            // Generate CSV string
            let csvRows: string[] = [];
            
            // Extract all unique field keys across submissions
            const allKeys = new Set<string>();
            submissions.forEach((s) => {
                try {
                    const parsed = JSON.parse(s.responses);
                    Object.keys(parsed).forEach((k) => allKeys.add(k));
                } catch {}
            });

            const headers = ["Submission ID", "Submitted At", "Name", "Email", ...Array.from(allKeys)];
            csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

            submissions.forEach((s) => {
                let parsed: Record<string, any> = {};
                try {
                    parsed = JSON.parse(s.responses);
                } catch {}

                const rowValues = [
                    s.id,
                    new Date(s.createdAt).toLocaleString(),
                    s.name || "",
                    s.email || "",
                    ...Array.from(allKeys).map((k) => {
                        const val = parsed[k];
                        if (typeof val === "object") return JSON.stringify(val);
                        return val !== undefined && val !== null ? String(val) : "";
                    }),
                ];

                csvRows.push(rowValues.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
            });

            const csvContent = csvRows.join("\n");
            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="${form.slug}-submissions.csv"`,
                },
            });
        }

        return NextResponse.json({ form, submissions });
    } catch (error: any) {
        console.error("GET Submissions Error:", error);
        return NextResponse.json({ error: "Failed to fetch form submissions" }, { status: 500 });
    }
}
