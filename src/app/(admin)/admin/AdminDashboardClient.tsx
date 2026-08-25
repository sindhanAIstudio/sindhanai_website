"use client";

import { Sparkle } from "@phosphor-icons/react";

interface AdminDashboardClientProps {
    session?: any;
    roles?: any[];
    permissions?: any[];
    metadata?: any;
    users?: any[];
}

export default function AdminDashboardClient({ session }: AdminDashboardClientProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                    <Sparkle className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                    Dashboard overview modules are currently cleared and will be added later. Use the navigation sidebar to access management modules.
                </p>
            </div>
        </div>
    );
}
