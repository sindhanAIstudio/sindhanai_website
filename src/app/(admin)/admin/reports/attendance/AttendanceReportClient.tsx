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
    Star
} from "@phosphor-icons/react";

export default function AttendanceReportClient() {
    const [reports, setReports] = useState<any[]>([]);
    const [summary, setSummary] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [soiDomains, setSoiDomains] = useState<any[]>([]);
    const [soiDomainId, setSoiDomainId] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [filterTab, setFilterTab] = useState<"ALL" | "DEFAULTERS">("ALL");

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (soiDomainId) params.set("soiDomainId", soiDomainId);
            if (categoryFilter) params.set("category", categoryFilter);

            const res = await fetch(`/api/admin/reports/attendance?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setReports(data.data || []);
                setSummary(data.summary || null);
            }
        } catch (err) {
            console.error("Failed to load attendance report:", err);
        } finally {
            setLoading(false);
        }
    }, [soiDomainId, categoryFilter]);

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
        const selectedDomainName = soiDomains.find((d) => d.id === soiDomainId)?.name || "All_SOI_Labs";
        let csvContent = "data:text/csv;charset=utf-8,Student Name,Roll Number,Email,SOI Lab,Regular Attended,Special Activity,Special Event,Total Attended,Total Valid Days,Attendance %,Status\n";

        reports.forEach((item) => {
            const s = item.student;
            const statusStr = item.isDefaulter ? "DEFAULTER (<75%)" : "REGULAR";
            csvContent += `"${s.name}","${s.rollNumber || "N/A"}","${s.email}","${s.soiDomain?.name || "N/A"}","${item.regularCount}","${item.specialActivityCount}","${item.eventCount}","${item.attendedDays}","${item.totalValidDays}","${item.attendancePercentage}%","${statusStr}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Categorized_Attendance_Report_${selectedDomainName}.csv`);
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
                        Fair calculations categorized by Regular Sessions, Special Evening Activities, and Special Events
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
                            <span>Average Attendance</span>
                            <TrendUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-600">{summary.avgAttendancePercentage}%</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-rose-50/60 border border-rose-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-rose-500 text-xs font-bold">
                            <span>Defaulters (&lt; 75%)</span>
                            <Warning className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-rose-600">{summary.defaultersCount}</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-indigo-50/60 border border-indigo-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-indigo-500 text-xs font-bold">
                            <span>Valid Working Days</span>
                            <Flask className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-black text-indigo-600">{summary.totalValidDays} Days</p>
                    </div>
                </div>
            )}

            {/* Filter Bar & Category Tabs */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Defaulter / All Filter */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                        <button
                            onClick={() => setFilterTab("ALL")}
                            className={`px-4 py-2 rounded-xl transition-all ${filterTab === "ALL" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600"}`}
                        >
                            All Students ({reports.length})
                        </button>
                        <button
                            onClick={() => setFilterTab("DEFAULTERS")}
                            className={`px-4 py-2 rounded-xl transition-all ${filterTab === "DEFAULTERS" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600"}`}
                        >
                            Defaulters (&lt; 75%) ({reports.filter((r) => r.isDefaulter).length})
                        </button>
                    </div>

                    {/* SOI Domain Dropdown */}
                    <div className="flex items-center gap-2">
                        <Flask className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-500 shrink-0">Filter Lab Domain:</span>
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
                </div>

                {/* Attendance Category Filter Chips */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-extrabold">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider">Attendance Category:</span>
                    <button
                        onClick={() => setCategoryFilter("")}
                        className={`px-3 py-1.5 rounded-xl transition-all ${categoryFilter === "" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                        All Types
                    </button>
                    <button
                        onClick={() => setCategoryFilter("REGULAR")}
                        className={`px-3 py-1.5 rounded-xl transition-all ${categoryFilter === "REGULAR" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
                    >
                        Regular Class
                    </button>
                    <button
                        onClick={() => setCategoryFilter("SPECIAL_ACTIVITY")}
                        className={`px-3 py-1.5 rounded-xl transition-all ${categoryFilter === "SPECIAL_ACTIVITY" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"}`}
                    >
                        Special Activity (After 4:30 PM)
                    </button>
                    <button
                        onClick={() => setCategoryFilter("EVENT")}
                        className={`px-3 py-1.5 rounded-xl transition-all ${categoryFilter === "EVENT" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"}`}
                    >
                        Special Events
                    </button>
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
                                <th className="py-3.5 px-4 text-center">Category Breakdown (Reg / Special / Event)</th>
                                <th className="py-3.5 px-4 text-center">Total Attended / Valid</th>
                                <th className="py-3.5 px-4 text-center">Attendance %</th>
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

                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black">
                                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{item.regularCount} Reg</span>
                                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">{item.specialActivityCount} Special</span>
                                                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">{item.eventCount} Event</span>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-center font-extrabold text-slate-800">
                                            {item.attendedDays} / {item.totalValidDays}
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`font-black text-sm ${item.isDefaulter ? "text-rose-600" : "text-emerald-600"}`}>
                                                    {item.attendancePercentage}%
                                                </span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className={`h-full rounded-full ${item.isDefaulter ? "bg-rose-500" : "bg-emerald-500"}`}
                                                        style={{ width: `${Math.min(item.attendancePercentage, 100)}%` }}
                                                    ></div>
                                                </div>
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
            </div>
        </div>
    );
}
