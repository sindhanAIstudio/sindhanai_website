import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const revalidate = 0;

export default async function InstructorPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (session.instructorType?.toLowerCase() === "scope") {
        redirect("/admin/scheduler");
    }

    redirect("/admin/attendance");
}
