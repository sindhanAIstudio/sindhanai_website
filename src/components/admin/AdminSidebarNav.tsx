"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquaresFour, Users, Clock, ShieldCheck, SlidersHorizontal } from "@phosphor-icons/react";

export default function AdminSidebarNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview", href: "/admin", icon: SquaresFour, exact: true },
        { name: "Student Management", href: "/admin/students", icon: Users },
        { name: "Attendance Portal", href: "/admin/attendance", icon: Clock },
        { name: "Dynamic RBAC", href: "/admin/rbac", icon: ShieldCheck },
        { name: "Metadata Settings", href: "/admin/metadata", icon: SlidersHorizontal },
    ];

    return (
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

