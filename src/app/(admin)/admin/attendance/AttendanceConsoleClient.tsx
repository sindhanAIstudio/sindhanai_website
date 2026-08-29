"use client";

import { useState, useEffect, useCallback } from "react";
import DynamicQrDisplay from "@/components/attendance/DynamicQrDisplay";
import {
    Clock,
    Plus,
    Check,
    Prohibit,
    DeviceMobile,
    User,
    Sparkle,
    ProjectorScreen,
    Star,
    ArrowsOut,
    ArrowsIn,
    CalendarBlank,
    PencilSimple,
    Bookmark,
    MagnifyingGlass as Search
} from "@phosphor-icons/react";

export default function AttendanceConsoleClient() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any | null>(null);
    const [roster, setRoster] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [soiDomains, setSoiDomains] = useState<any[]>([]);
    const [todayEvents, setTodayEvents] = useState<any[]>([]);
    const [filterTab, setFilterTab] = useState<"SCANNED" | "ALL" | "UNSCANNED">("SCANNED");

    // Centralized Student Search State
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Projector Fullscreen Mode
    const [isProjectorMode, setIsProjectorMode] = useState(false);

    // Server-Side Roster Pagination State
    const [rosterPage, setRosterPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<any>({
        page: 1,
        limit: 10,
        totalStudents: 0,
        scannedCount: 0,
        pendingCount: 0,
        totalFilteredCount: 0,
        totalPages: 1,
    });

    // Toast
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Centralized Student Search (Any student in the institution)
    const handleSearchStudents = async (query: string) => {
        setStudentSearchQuery(query);
        if (!query.trim()) {
            setStudentSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/students?search=${encodeURIComponent(query.trim())}&limit=8`);
            const data = await res.json();
            if (res.ok && data.data) {
                setStudentSearchResults(data.data);
            }
        } catch (err) {
            console.error("Student search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    // Fetch Roster (Server-Side Paginated)
    const fetchRoster = useCallback(async (sessionId: string, page: number, filter: string) => {
        try {
            const res = await fetch(`/api/admin/sessions/${sessionId}?page=${page}&limit=10&filter=${filter}`);
            const data = await res.json();
            if (res.ok) {
                if (data.session) setActiveSession(data.session);
                setRoster(data.roster || []);
                if (data.pagination) {
                    setPaginationMeta(data.pagination);
                }
            }
        } catch (err) {
            console.error("Failed to fetch roster:", err);
        }
    }, []);

    // Fetch / Auto-Load Active Session for Today
    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/sessions");
            const data = await res.json();
            if (res.ok && data.data) {
                setSessions(data.data);

                // Auto-select today's active session or first session automatically
                const active = data.data.find((s: any) => s.status === "ACTIVE") || data.data[0];
                if (active) {
                    setActiveSession(active);
                    fetchRoster(active.id, 1, "SCANNED");
                } else {
                    autoCreateDefaultSession();
                }
            }
        } catch (err) {
            console.error("Failed to load sessions:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchRoster]);

    // Auto-create default daily session if none exists for today
    const autoCreateDefaultSession = async () => {
        try {
            const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const res = await fetch("/api/admin/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `Regular SOI Lab Attendance — ${todayStr}`,
                    sessionType: "REGULAR",
                    durationMinutes: "480",
                }),
            });
            const data = await res.json();
            if (res.ok && data.data) {
                setActiveSession(data.data);
                fetchRoster(data.data.id, 1, "SCANNED");
                fetchSessions();
            }
        } catch (err) {
            console.error("Auto session creation error:", err);
        }
    };

    // Fetch Calendar Events & SOI Domains (Filtered STRICTLY to instructor's lab)
    useEffect(() => {
        fetch("/api/admin/calendar")
            .then((r) => r.json())
            .then((d) => {
                setSoiDomains(d.soiDomains || []);
                const todayStr = new Date().toISOString().split("T")[0];
                const events = (d.events || []).filter((e: any) => {
                    if (e.date !== todayStr) return false;
                    // Filter strictly by active session's lab domain
                    if (e.soiDomainId && activeSession?.soiDomainId && e.soiDomainId !== activeSession.soiDomainId) {
                        return false;
                    }
                    return true;
                });
                setTodayEvents(events);
            })
            .catch(() => { });
    }, [activeSession?.soiDomainId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Select Active Session with Confirmation Alert
    const handleSelectSession = (sessionId: string, sessionTitle?: string) => {
        if (activeSession?.id === sessionId) return;

        const confirmMsg = `Are you sure you want to switch the active attendance session to "${sessionTitle || 'this session'}"?`;
        if (!confirm(confirmMsg)) return;

        setRosterPage(1);
        const targetSession = sessions.find((s) => s.id === sessionId);
        if (targetSession) setActiveSession(targetSession);
        fetchRoster(sessionId, 1, filterTab);
    };

    // Fetch paginated roster whenever page or filter changes
    useEffect(() => {
        if (activeSession?.id) {
            fetchRoster(activeSession.id, rosterPage, filterTab);
        }
    }, [activeSession?.id, rosterPage, filterTab, fetchRoster]);

    // Ultra-lightweight polling: fetch tiny 50-byte stats object every 4s
    useEffect(() => {
        if (!activeSession || activeSession.status !== "ACTIVE") return;

        const interval = setInterval(() => {
            fetch(`/api/admin/sessions/${activeSession.id}?statsOnly=true`)
                .then((r) => r.json())
                .then((stats) => {
                    if (stats && typeof stats.scannedCount === "number") {
                        setPaginationMeta((prev: any) => {
                            if (prev.scannedCount !== stats.scannedCount) {
                                // Scanned count changed -> reload current paginated roster page
                                fetchRoster(activeSession.id, rosterPage, filterTab);
                            }
                            return {
                                ...prev,
                                scannedCount: stats.scannedCount,
                                totalStudents: stats.totalStudents,
                                pendingCount: stats.pendingCount,
                            };
                        });
                    }
                })
                .catch(() => { });
        }, 4000);

        return () => clearInterval(interval);
    }, [activeSession?.id, activeSession?.status, rosterPage, filterTab, fetchRoster]);

    // Switch session to Event Attendance Mode with Confirmation Alert
    const handleTakeEventAttendance = async (event: any) => {
        const expectedTitle = `EVENT: ${event.title}`;

        // If session for this event ALREADY exists in today's active sessions, select it immediately!
        const existingEventSession = sessions.find((s) => s.title.trim().toLowerCase() === expectedTitle.trim().toLowerCase());
        if (existingEventSession) {
            handleSelectSession(existingEventSession.id, existingEventSession.title);
            showToast(`Switched to active event session: ${event.title}`);
            return;
        }

        if (!confirm(`Are you sure you want to switch attendance mode to event "${event.title}"?`)) {
            return;
        }

        try {
            const res = await fetch("/api/admin/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: expectedTitle,
                    description: event.description || "Special Event Session",
                    sessionType: "EVENT",
                    durationMinutes: "240",
                }),
            });
            const data = await res.json();
            if (res.ok && data.data) {
                showToast(`Switched attendance mode to: ${event.title}`);
                setActiveSession(data.data);
                fetchRoster(data.data.id, 1, "SCANNED");
                fetchSessions();
            }
        } catch (err) {
            console.error("Event attendance switch error:", err);
        }
    };

    // 1-Click Bulk Mark Absent
    const handleBulkMarkAbsent = async () => {
        if (!activeSession) return;
        if (!confirm(`Mark all un-scanned students as ABSENT?`)) return;

        try {
            const res = await fetch(`/api/admin/sessions/${activeSession.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "BULK_MARK_ABSENT" }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast(data.message || "Bulk marked absent!");
                handleSelectSession(activeSession.id);
            }
        } catch (err) {
            console.error("Bulk mark absent error:", err);
        }
    };

    // Manual Override
    const handleManualOverride = async (studentId: string, status: string) => {
        if (!activeSession) return;

        try {
            const res = await fetch(`/api/admin/sessions/${activeSession.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, status }),
            });

            if (res.ok) {
                showToast(`Status updated to ${status}`);
                handleSelectSession(activeSession.id);
            }
        } catch (err) {
            console.error("Manual override error:", err);
        }
    };

    const handleResetDevice = async (studentId: string, studentName: string) => {
        if (!confirm(`Reset device lock for ${studentName}?`)) return;

        try {
            const res = await fetch(`/api/admin/sessions/${activeSession.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, resetDevice: true }),
            });

            if (res.ok) {
                showToast(`Device reset for ${studentName}`);
                handleSelectSession(activeSession.id);
            }
        } catch (err) {
            console.error("Reset device error:", err);
        }
    };

    const filteredRoster = roster.filter((item) => {
        if (filterTab === "UNSCANNED") return !item.isScanned;
        return true;
    });

    const scannedCount = roster.filter((r) => r.isScanned || r.status === "PRESENT").length;

    return (
        <div className="space-y-6 font-sans">
            {/* Toast */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* FULLSCREEN PROJECTOR MODE */}
            {isProjectorMode && activeSession && (
                <div className="fixed inset-0 z-[100] bg-slate-950 text-white p-8 flex flex-col justify-between overflow-hidden animate-in fade-in duration-300 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight">{activeSession.title}</h1>
                                <p className="text-xs text-slate-400 font-medium">Classroom Projector Mode • Point Phone Camera at Screen</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsProjectorMode(false)}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border border-slate-700"
                        >
                            <ArrowsIn className="w-4 h-4" /> Exit Projector View
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto w-full my-auto">
                        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                                Live Classroom Attendance Counter
                            </span>
                            <div className="text-7xl font-black text-emerald-400 tracking-tighter">
                                {scannedCount} <span className="text-slate-600 text-4xl font-bold">/ {roster.length}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-300">
                                Students Scanned Present ({Math.round((scannedCount / (roster.length || 1)) * 100)}%)
                            </div>
                            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(scannedCount / (roster.length || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <DynamicQrDisplay
                                sessionId={activeSession.id}
                                sessionSecret={activeSession.sessionSecret}
                                sessionTitle={activeSession.title}
                                status={activeSession.status}
                                showTimer={false}
                            />
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-500 font-medium">
                        SindhanAI Hub Anti-Spoofing Attendance System • Connect to Authorized Lab Wi-Fi
                    </div>
                </div>
            )}

            {/* Standard Dashboard View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <ProjectorScreen className="w-6 h-6 text-indigo-600" />
                        <span>Instructor Attendance Console</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Zero-click active session projection for your assigned SOI Lab
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsProjectorMode(true)}
                        disabled={!activeSession}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <ArrowsOut className="w-4 h-4 text-emerald-400" />
                        <span>Projector View (Big Counter)</span>
                    </button>
                </div>
            </div>

            {/* Dynamic Events Bar */}
            {todayEvents.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 rounded-3xl shadow-lg border border-indigo-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                            <Bookmark className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">Special Event Scheduled Today</span>
                            <p className="text-sm font-extrabold">{todayEvents[0].title}</p>
                            {todayEvents[0].description && <p className="text-xs text-indigo-200/80 font-medium">{todayEvents[0].description}</p>}
                        </div>
                    </div>

                    <button
                        onClick={() => handleTakeEventAttendance(todayEvents[0])}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-950 text-xs font-black transition-all flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                    >
                        <Sparkle className="w-4 h-4 text-indigo-600" />
                        <span>⚡ Take Event Attendance</span>
                    </button>
                </div>
            )}

            {/* Session Selector & Title Cleaner */}
            {sessions.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700">Today's SOI Sessions ({sessions.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {sessions.map((s) => {
                            const isSelected = activeSession?.id === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => handleSelectSession(s.id)}
                                    className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${isSelected
                                        ? "bg-indigo-50/80 border-indigo-300 shadow-xs"
                                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                                            {s.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">Type: {s.sessionType}</span>
                                    </div>
                                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{s.title}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1">{s.attendanceRecords?.length || 0} Scans Logged</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Console Content */}
            {activeSession ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Dynamic QR Display & Clean Session Card */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Clean Session Header Card (No edit pencil) */}
                        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-slate-900">{activeSession.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                                        {activeSession.sessionType || "REGULAR"}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono">Session ID: {activeSession.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>

                        <DynamicQrDisplay
                            sessionId={activeSession.id}
                            sessionSecret={activeSession.sessionSecret}
                            sessionTitle={activeSession.title}
                            status={activeSession.status}
                            showTimer={false}
                        />
                    </div>

                    {/* Right Column: Live Roster & Centralized Student Search */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Centralized Institutional Student Search Bar */}
                        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Search className="w-4 h-4 text-indigo-600" />
                                    Centralized Student Search & Attendance Check-In
                                </label>
                                <span className="text-[10px] font-bold text-slate-400">Search any student institution-wide</span>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={studentSearchQuery}
                                    onChange={(e) => handleSearchStudents(e.target.value)}
                                    placeholder="Search by Name, Roll Number, Reg No, or Email..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 animate-pulse">
                                        Searching...
                                    </div>
                                )}
                            </div>

                            {/* Search Results Dropdown List */}
                            {studentSearchResults.length > 0 && (
                                <div className="mt-2 divide-y divide-slate-100 max-h-60 overflow-y-auto bg-slate-50 rounded-2xl border border-slate-200 p-2">
                                    {studentSearchResults.map((st) => (
                                        <div key={st.id} className="p-2.5 flex items-center justify-between hover:bg-white rounded-xl transition-all">
                                            <div>
                                                <span className="text-xs font-extrabold text-slate-900 block">{st.name}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    {st.rollNumber || st.registrationNumber || st.email} • {st.soiDomain?.name || "General SOI"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        handleManualOverride(st.id, "PRESENT");
                                                        setStudentSearchQuery("");
                                                        setStudentSearchResults([]);
                                                    }}
                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-xs transition-all"
                                                >
                                                    Mark Present
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleManualOverride(st.id, "ABSENT");
                                                        setStudentSearchQuery("");
                                                        setStudentSearchResults([]);
                                                    }}
                                                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-xs transition-all"
                                                >
                                                    Mark Absent
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Roster Controls */}
                        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                                <button
                                    onClick={() => {
                                        setFilterTab("SCANNED");
                                        setRosterPage(1);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl transition-all ${filterTab === "SCANNED" ? "bg-white text-emerald-700 shadow-xs font-black" : "text-slate-600"}`}
                                >
                                    Attended Students ({paginationMeta.scannedCount})
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterTab("ALL");
                                        setRosterPage(1);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl transition-all ${filterTab === "ALL" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600"}`}
                                >
                                    All Roster ({paginationMeta.totalStudents})
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterTab("UNSCANNED");
                                        setRosterPage(1);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl transition-all ${filterTab === "UNSCANNED" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600"}`}
                                >
                                    Pending ({paginationMeta.pendingCount})
                                </button>
                            </div>

                            <button
                                onClick={handleBulkMarkAbsent}
                                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold transition-all border border-rose-200"
                            >
                                Mark Pending as Absent
                            </button>
                        </div>

                        {/* Roster Table with Server-Side Pagination */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4">Student</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-center">Scan Time</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                    {roster.map((item) => (
                                        <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="font-extrabold text-slate-900 block">{item.student.name}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-slate-400 font-mono">{item.student.rollNumber || item.student.email}</span>
                                                    {item.student.deviceFingerprint ? (
                                                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-mono font-bold flex items-center gap-1" title={item.student.deviceFingerprint}>
                                                            📱 {item.student.deviceFingerprint}
                                                        </span>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-mono font-bold flex items-center gap-1">
                                                            🔄 Unbound / Reset
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${item.isScanned || item.status === "PRESENT" ? "bg-emerald-100 text-emerald-800" : item.status === "ABSENT" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-500"}`}>
                                                    {item.isScanned || item.status === "PRESENT" ? "PRESENT" : item.status || "NOT SCANNED"}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
                                                {item.scanTime ? new Date(item.scanTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                                            </td>

                                            <td className="py-3 px-4 text-right space-x-1">
                                                <button
                                                    onClick={() => handleManualOverride(item.student.id, "PRESENT")}
                                                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => handleManualOverride(item.student.id, "ABSENT")}
                                                    className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold border border-rose-200 transition-colors cursor-pointer"
                                                >
                                                    Absent
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Server-Side Pagination Controls */}
                            {paginationMeta.totalPages > 1 && (
                                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                                    <span>
                                        Showing {(paginationMeta.page - 1) * paginationMeta.limit + 1} to {Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.totalFilteredCount)} of {paginationMeta.totalFilteredCount} students
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={rosterPage <= 1}
                                            onClick={() => setRosterPage((p) => Math.max(p - 1, 1))}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold"
                                        >
                                            Previous
                                        </button>
                                        <span className="font-extrabold text-slate-800 px-1">
                                            Page {paginationMeta.page} of {paginationMeta.totalPages}
                                        </span>
                                        <button
                                            disabled={rosterPage >= paginationMeta.totalPages}
                                            onClick={() => setRosterPage((p) => Math.min(p + 1, paginationMeta.totalPages))}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 font-bold">
                    No active session found.
                </div>
            )}
        </div>
    );
}
