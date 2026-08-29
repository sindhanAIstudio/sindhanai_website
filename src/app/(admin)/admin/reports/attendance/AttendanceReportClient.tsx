"use client";

import { useState, useEffect, useCallback } from "react";
import {
    TrendUp,
    Users,
    Flask,
    FileCsv,
    User,
    CheckCircle,
    Warning,
    Clock,
    Star,
    MagnifyingGlass,
} from "@phosphor-icons/react";

interface AttendanceReportClientProps {
    session?: any;
}

export default function AttendanceReportClient({ session }: AttendanceReportClientProps) {
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);

    const [reports, setReports] = useState<any[]>([]);
    const [allReports, setAllReports] = useState<any[]>([]);
    const [summary, setSummary] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [soiDomains, setSoiDomains] = useState<any[]>([]);
    const [soiDomainId, setSoiDomainId] = useState("");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [filterTab, setFilterTab] = useState<"ALL" | "DEFAULTERS">("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 15;

    const isSuperAdmin = session?.role === "SUPER_ADMIN";

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);
            if (soiDomainId && isSuperAdmin) params.set("soiDomainId", soiDomainId);
            if (search.trim()) params.set("search", search.trim());
            if (categoryFilter) params.set("category", categoryFilter);
            params.set("page", currentPage.toString());
            params.set("limit", limit.toString());

            const res = await fetch(`/api/admin/reports/attendance?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setReports(data.data || []);
                setAllReports(data.allData || data.data || []);
                setSummary(data.summary || null);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages || 1);
                    setTotalItems(data.pagination.total || 0);
                }
            }
        } catch (err) {
            console.error("Failed to load attendance report:", err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, soiDomainId, isSuperAdmin, search, categoryFilter, currentPage, limit]);

    useEffect(() => {
        fetch("/api/admin/calendar")
            .then((r) => r.json())
            .then((d) => setSoiDomains(d.soiDomains || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleExportCsv = () => {
        const selectedDomainName = soiDomains.find((d) => d.id === soiDomainId)?.name || "Lab_Report";
        let csvContent = "data:text/csv;charset=utf-8,Student Name,Roll Number,Email,SOI Lab,Regular Attended,Regular Valid Days,Regular %,Special Activity (After 4:30PM),Special Activity %,Special Event,Special Event %,Status\n";

        const exportList = allReports.length > 0 ? allReports : reports;
        exportList.forEach((item) => {
            const s = item.student;
            const statusStr = item.isDefaulter ? "DEFAULTER (<75%)" : "REGULAR";
            csvContent += `"${s.name}","${s.rollNumber || "N/A"}","${s.email}","${s.soiDomain?.name || "N/A"}","${item.regularAttendedDays}","${item.totalRegularDays}","${item.regularPercentage}%","${item.specialActivityAttendedDays}","${item.specialActivityPercentage}%","${item.eventAttendedDays}","${item.eventPercentage}%","${statusStr}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_Report_${startDate}_to_${endDate}_${selectedDomainName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredReports = reports.filter((item) => {
        if (filterTab === "DEFAULTERS") return item.isDefaulter;
        return true;
    });

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <TrendUp className="w-6 h-6 text-indigo-600" />
                        <span>Categorized Institutional Attendance & Defaulters</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Fair calculations categorized by Regular Sessions, Special Evening Activities (after 4:30 PM), and Events
                    </p>
                </div>

                <button
                    onClick={handleExportCsv}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                    <FileCsv className="w-4 h-4 text-emerald-600" />
                    <span>Export Categorized CSV Report</span>
                </button>
            </div>

            {/* Metrics KPI Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                            <span>Total Enrolled Students</span>
                            <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900">{summary.totalStudents}</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                            <span>Avg Regular Class %</span>
                            <TrendUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-600">{summary.avgAttendancePercentage}%</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-rose-50/60 border border-rose-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-rose-500 text-xs font-bold">
                            <span>Defaulters (&lt; 75% Regular)</span>
                            <Warning className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-rose-600">{summary.defaultersCount}</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-indigo-50/60 border border-indigo-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-indigo-500 text-xs font-bold">
                            <span>Valid Regular Days</span>
                            <Flask className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-black text-indigo-600">{summary.totalRegularDays} Days</p>
                    </div>
                </div>
            )}

            {/* Filter Bar & Category Tabs */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                {/* Search Bar, Date Pickers & Super Admin Lab Dropdown */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Cross-Institutional Student Search */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search student by Name, Roll #, Reg #, or Email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Date Range Pickers (Default Today) */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                            <Clock className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                <span>From:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-2 py-1 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-indigo-600"
                                />
                                <span>To:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-2 py-1 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-indigo-600"
                                />
                                {(startDate !== todayStr || endDate !== todayStr) && (
                                    <button
                                        onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }}
                                        className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black hover:bg-indigo-100"
                                    >
                                        Today
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Defaulter / All Filter Tabs */}
                        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                            <button
                                onClick={() => setFilterTab("ALL")}
                                className={`px-4 py-2 rounded-xl transition-all ${filterTab === "ALL" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600"}`}
                            >
                                All ({reports.length})
                            </button>
                            <button
                                onClick={() => setFilterTab("DEFAULTERS")}
                                className={`px-4 py-2 rounded-xl transition-all ${filterTab === "DEFAULTERS" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600"}`}
                            >
                                Defaulters (&lt; 75%) ({reports.filter((r) => r.isDefaulter).length})
                            </button>
                        </div>

                        {/* SOI Domain Dropdown — Strictly for Super Admin */}
                        {isSuperAdmin && (
                            <div className="flex items-center gap-2">
                                <Flask className="w-4 h-4 text-indigo-600 shrink-0" />
                                <select
                                    value={soiDomainId}
                                    onChange={(e) => setSoiDomainId(e.target.value)}
                                    className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="">All SOI Labs</option>
                                    {soiDomains.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs font-bold text-slate-500">Calculating fair attendance metrics...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Student</th>
                                <th className="py-3.5 px-4">Roll / Reg #</th>
                                <th className="py-3.5 px-4">SOI Lab</th>
                                <th className="py-3.5 px-4 text-center">Regular Class (Main)</th>
                                <th className="py-3.5 px-4 text-center">Special (After 4:30 PM)</th>
                                <th className="py-3.5 px-4 text-center">Special Event</th>
                                <th className="py-3.5 px-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredReports.map((item) => {
                                const s = item.student;

                                return (
                                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {s.profilePicUrl ? (
                                                        <img src={s.profilePicUrl} alt={s.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-extrabold text-slate-900 block">{s.name}</span>
                                                    <span className="text-[10px] text-slate-400">{s.email}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 font-mono font-bold text-slate-600">
                                            {s.rollNumber || s.registrationNumber || "N/A"}
                                        </td>

                                        <td className="py-3 px-4 font-semibold text-slate-700">
                                            {s.soiDomain?.name || "General"}
                                        </td>

                                        {/* Regular Class Attendance (Main Calculation) */}
                                        <td className="py-3 px-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`font-black text-sm ${item.isDefaulter ? "text-rose-600" : "text-emerald-600"}`}>
                                                    {item.regularPercentage}%
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {item.regularAttendedDays} / {item.totalRegularDays} Days
                                                </span>
                                            </div>
                                        </td>

                                        {/* Special Activity Attendance (After 4:30 PM) */}
                                        <td className="py-3 px-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="font-black text-xs text-amber-700">
                                                    {item.specialActivityPercentage}%
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {item.specialActivityAttendedDays} / {item.totalSpecialDays} Sessions
                                                </span>
                                            </div>
                                        </td>

                                        {/* Special Event Attendance */}
                                        <td className="py-3 px-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="font-black text-xs text-indigo-700">
                                                    {item.eventPercentage}%
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {item.eventAttendedDays} / {item.totalEventDays} Events
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <span
                                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black inline-flex items-center gap-1 ${item.isDefaulter
                                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                    }`}
                                            >
                                                {item.isDefaulter ? (
                                                    <>
                                                        <Warning className="w-3 h-3 text-rose-600" />
                                                        <span>DEFAULTER</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                        <span>REGULAR</span>
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-500">
                            Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
                            <span className="font-bold text-slate-900">{totalPages}</span> ({totalItems} total students)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-700 px-2">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
