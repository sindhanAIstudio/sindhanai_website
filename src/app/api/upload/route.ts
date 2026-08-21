import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const type = (formData.get("type") as string) || "profilePic";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const folder = type === "resume" ? "resumes" : "profiles";
        const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        const sanitizeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}_${sanitizeFilename}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${folder}/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: file.name,
            size: file.size,
        });
    } catch (err: any) {
        console.error("File upload error:", err);
        return NextResponse.json({ error: err.message || "Failed to upload file" }, { status: 500 });
    }
}
