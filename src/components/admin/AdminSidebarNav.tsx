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
    FileText,
    BookOpen,
} from "@phosphor-icons/react";

interface AdminSidebarNavProps {
    userRole?: string;
    instructorType?: string | null;
}

export default function AdminSidebarNav({ userRole, instructorType }: AdminSidebarNavProps) {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleMouseEnter = (menuKey: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpenDropdown(menuKey);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 200);
    };

    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isInstructor = userRole === "INSTRUCTOR";
    const isScopeFaculty = instructorType?.toLowerCase() === "scope";
    const isSoiInstructor = isInstructor && !isScopeFaculty;

    const allManagementItems = [
        { name: "Student Management", href: "/admin/students", icon: Users, superAdminOnly: false },
        { name: "Instructor Management", href: "/admin/instructors", icon: ChalkboardTeacher, superAdminOnly: false },
        { name: "Dynamic Forms", href: "/admin/forms", icon: FileText, superAdminOnly: false },
        { name: "Admin Management", href: "/admin/admins", icon: ShieldCheck, superAdminOnly: true },
        { name: "Metadata Settings", href: "/admin/metadata", icon: SlidersHorizontal, superAdminOnly: true },
        { name: "Dynamic RBAC", href: "/admin/rbac", icon: ShieldCheck, superAdminOnly: true },
    ];

    const managementItems = allManagementItems.filter((item) => {
        if (isScopeFaculty || isSoiInstructor) return false;
        return !item.superAdminOnly || isSuperAdmin;
    });

    const rawAttendanceItems = [
        { name: "Attendance Portal", href: "/admin/attendance", icon: Clock },
        { name: "Fair Attendance Report", href: "/admin/reports/attendance", icon: ChartPie },
        { name: "Calendar", href: "/admin/calendar", icon: CalendarCheck },
        { name: "Wi-Fi Whitelist", href: "/admin/wifi-whitelist", icon: WifiHigh },
    ];

    const attendanceItems = rawAttendanceItems.filter((item) => {
        if (isScopeFaculty) return false;
        if (isSoiInstructor) return item.href === "/admin/attendance";
        if (isSuperAdmin && item.href === "/admin/attendance") return false;
        return true;
    });

    const rawAcademicItems = [
        { name: "Academic Scheduler", href: "/admin/scheduler", icon: CalendarCheck },
        { name: "Syllabus Management", href: "/admin/syllabus", icon: FileText },
    ];

    const academicItems = rawAcademicItems.filter((item) => {
        if (isSoiInstructor) return false;
        return true;
    });

    const isManagementActive = managementItems.some((item) => pathname.startsWith(item.href));
    const isAttendanceActive = attendanceItems.some((item) => pathname.startsWith(item.href));
    const isAcademicActive = academicItems.some((item) => pathname.startsWith(item.href));
    const isOverviewActive = pathname === "/admin";

    // Determine console home link based on instructor type
    const overviewHomeHref = isScopeFaculty
        ? "/admin/scheduler"
        : isSoiInstructor
            ? "/admin/attendance"
            : "/admin";

    const overviewLabel = isScopeFaculty
        ? "Academic Scheduler"
        : isSoiInstructor
            ? "Attendance Portal"
            : "Overview";

    return (
        <nav ref={navRef} className="flex items-center gap-2 overflow-visible py-1">
            {/* Overview / Console Home */}
            <Link
                href={overviewHomeHref}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isOverviewActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
            >
                <SquaresFour className={`w-4 h-4 ${isOverviewActive ? "text-white" : "text-slate-400"}`} />
                <span>{overviewLabel}</span>
            </Link>

            {/* Academic Suite Dropdown */}
            {academicItems.length > 0 && (
                <div
                    className="relative group"
                    onMouseEnter={() => handleMouseEnter("ACADEMIC")}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        onClick={() => {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                            setOpenDropdown(openDropdown === "ACADEMIC" ? null : "ACADEMIC");
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isAcademicActive || openDropdown === "ACADEMIC"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                    >
                        <CalendarCheck className={`w-4 h-4 ${isAcademicActive ? "text-indigo-600" : "text-slate-400"}`} />
                        <span>Academic Suite</span>
                        <CaretDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === "ACADEMIC" ? "rotate-180 text-indigo-600" : "text-slate-400"
                                }`}
                        />
                    </button>

                    {openDropdown === "ACADEMIC" && (
                        <div className="absolute left-0 top-full pt-1.5 w-56 z-50">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                {academicItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpenDropdown(null)}
                                            className={`flex items-center gap-3 px-3.5 py-2 hover:bg-slate-50 transition-colors ${isActive ? "bg-indigo-50/70 text-indigo-600 font-bold" : "text-slate-700 font-semibold"
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                                            <span className="text-xs">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Management Dropdown (Hidden for SCOPE faculty) */}
            {managementItems.length > 0 && (
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
                        <div className="absolute left-0 top-full pt-1.5 w-56 z-50">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                {managementItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpenDropdown(null)}
                                            className={`flex items-center gap-3 px-3.5 py-2 hover:bg-slate-50 transition-colors ${isActive ? "bg-indigo-50/70 text-indigo-600 font-bold" : "text-slate-700 font-semibold"
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                                            <span className="text-xs">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Attendance & Operations Dropdown (Hidden for SCOPE faculty) */}
            {attendanceItems.length > 0 && (
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
                        <div className="absolute left-0 top-full pt-1.5 w-56 z-50">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                {attendanceItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpenDropdown(null)}
                                            className={`flex items-center gap-3 px-3.5 py-2 hover:bg-slate-50 transition-colors ${isActive ? "bg-indigo-50/70 text-indigo-600 font-bold" : "text-slate-700 font-semibold"
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                                            <span className="text-xs">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
