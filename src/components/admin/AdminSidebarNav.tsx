"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    SquaresFour,
    Users,
    ChalkboardTeacher,
    Clock,
    ShieldCheck,
    SlidersHorizontal,
    WifiHigh,
    CalendarCheck,
    ChartPie,
    CaretDown,
    Briefcase,
    QrCode,
} from "@phosphor-icons/react";

interface AdminSidebarNavProps {
    userRole?: string;
}

export default function AdminSidebarNav({ userRole }: AdminSidebarNavProps) {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown when route changes
    useEffect(() => {
        setOpenDropdown(null);
    }, [pathname]);

    const handleMouseEnter = (menuKey: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpenDropdown(menuKey);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 200);
    };

    const allManagementItems = [
        { name: "Student Management", href: "/admin/students", icon: Users, desc: "Manage student profiles & rosters", superAdminOnly: false },
        { name: "Instructor Management", href: "/admin/instructors", icon: ChalkboardTeacher, desc: "Manage instructors & domain allocations", superAdminOnly: false },
        { name: "Admin Management", href: "/admin/admins", icon: ShieldCheck, desc: "Manage Lab Administrators & promotions", superAdminOnly: true },
        { name: "Metadata Settings", href: "/admin/metadata", icon: SlidersHorizontal, desc: "Batches, Class Groups, Domains", superAdminOnly: true },
        { name: "Dynamic RBAC", href: "/admin/rbac", icon: ShieldCheck, desc: "Role-based access permissions", superAdminOnly: true },
    ];

    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isInstructor = userRole === "INSTRUCTOR";

    const managementItems = allManagementItems.filter((item) => {
        if (isInstructor) {
            return item.href === "/admin/students";
        }
        return !item.superAdminOnly || isSuperAdmin;
    });

    const rawAttendanceItems = [
        { name: "Attendance Portal", href: "/admin/attendance", icon: Clock, desc: "Host live dynamic QR sessions" },
        { name: "Fair Attendance Report", href: "/admin/reports/attendance", icon: ChartPie, desc: "Defaulter reports & CSV export" },
        { name: "Smart Calendar", href: "/admin/calendar", icon: CalendarCheck, desc: "Holidays, events & worklogs" },
        { name: "Wi-Fi Whitelist", href: "/admin/wifi-whitelist", icon: WifiHigh, desc: "Authorized lab IP subnets" },
    ];

    const attendanceItems = rawAttendanceItems.filter((item) => {
        if (isInstructor && item.href === "/admin/wifi-whitelist") return false;
        if (isSuperAdmin && item.href === "/admin/attendance") return false;
        return true;
    });

    const isManagementActive = managementItems.some((item) => pathname.startsWith(item.href));
    const isAttendanceActive = attendanceItems.some((item) => pathname.startsWith(item.href));
    const isOverviewActive = pathname === "/admin";

    return (
        <nav ref={navRef} className="flex items-center gap-2 overflow-visible py-1">
            {/* Overview */}
            <Link
                href="/admin"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isOverviewActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
            >
                <SquaresFour className={`w-4 h-4 ${isOverviewActive ? "text-white" : "text-slate-400"}`} />
                <span>Overview</span>
            </Link>

            {/* Management Dropdown */}
            <div
                className="relative group"
                onMouseEnter={() => handleMouseEnter("MANAGEMENT")}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    onClick={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        setOpenDropdown(openDropdown === "MANAGEMENT" ? null : "MANAGEMENT");
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isManagementActive || openDropdown === "MANAGEMENT"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                >
                    <Briefcase className={`w-4 h-4 ${isManagementActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>Management</span>
                    <CaretDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === "MANAGEMENT" ? "rotate-180 text-indigo-600" : "text-slate-400"
                            }`}
                    />
                </button>

                {openDropdown === "MANAGEMENT" && (
                    <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-3 py-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                Core Administration
                            </div>
                            {managementItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpenDropdown(null)}
                                        className={`flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors ${isActive ? "bg-indigo-50/70" : ""
                                            }`}
                                    >
                                        <div
                                            className={`p-2 rounded-xl border shrink-0 mt-0.5 ${isActive
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-slate-100 text-slate-600 border-slate-200/80"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p
                                                className={`text-xs font-bold ${isActive ? "text-indigo-600" : "text-slate-800"
                                                    }`}
                                            >
                                                {item.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium leading-tight">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Attendance & Operations Dropdown */}
            <div
                className="relative group"
                onMouseEnter={() => handleMouseEnter("ATTENDANCE")}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    onClick={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        setOpenDropdown(openDropdown === "ATTENDANCE" ? null : "ATTENDANCE");
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isAttendanceActive || openDropdown === "ATTENDANCE"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                >
                    <QrCode className={`w-4 h-4 ${isAttendanceActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>Attendance & Labs</span>
                    <CaretDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === "ATTENDANCE" ? "rotate-180 text-indigo-600" : "text-slate-400"
                            }`}
                    />
                </button>

                {openDropdown === "ATTENDANCE" && (
                    <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-3 py-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                Attendance & Lab Suite
                            </div>
                            {attendanceItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpenDropdown(null)}
                                        className={`flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors ${isActive ? "bg-indigo-50/70" : ""
                                            }`}
                                    >
                                        <div
                                            className={`p-2 rounded-xl border shrink-0 mt-0.5 ${isActive
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-slate-100 text-slate-600 border-slate-200/80"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p
                                                className={`text-xs font-bold ${isActive ? "text-indigo-600" : "text-slate-800"
                                                    }`}
                                            >
                                                {item.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium leading-tight">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
