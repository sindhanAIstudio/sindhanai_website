import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
            {/* Top Navigation Bar Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs overflow-visible">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/admin" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                                <Image src="/logo.png" alt="Logo" width={20} height={20} className="brightness-0 invert object-contain" />
                            </div>
                            <span className="font-bold text-base text-slate-900 tracking-tight">
                                SindhanAI Hub <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 ml-1">Console</span>
                            </span>
                        </Link>
                    </div>

                    {/* Horizontal Navigation Items */}
                    <div className="flex-1 flex justify-center overflow-visible">
                        <AdminSidebarNav userRole={session.role} />
                    </div>

                    {/* User Profile & Sign Out */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-900">{session.name || "Administrator"}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{session.email} ({session.role})</p>
                        </div>
                        <SignOutButton />
                    </div>
                </div>
            </header>

            {/* Main Full-Width Content Container */}
            <main className="flex-1 max-w-[1440px] w-full mx-auto p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}

