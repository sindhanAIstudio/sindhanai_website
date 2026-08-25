import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const revalidate = 0;

export default async function InstructorPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    redirect("/admin/attendance");
}
