"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    return (
        <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
            <SignOut className="w-4 h-4 text-slate-600" />
            <span>Sign Out</span>
        </button>
    );
}
