"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar,
    CaretLeft,
    CaretRight,
    Plus,
    Flask,
    Check,
    Sun,
    Bookmark,
    Notebook,
    FileCsv,
    UserCheck,
    Clock,
    Table,
    FloppyDiskBack,
    WarningCircle,
    Lightning,
    GridFour,
    Rows
} from "@phosphor-icons/react";

export default function CalendarClient() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"CALENDAR" | "WORKLOG">("CALENDAR");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [soiDomainId, setSoiDomainId] = useState<string>("");
    const [soiDomains, setSoiDomains] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [attendanceStats, setAttendanceStats] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    // Modals State
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split("T")[0]);

    // Form inputs
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventTime, setEventTime] = useState("10:00");
    const [modalDomainId, setModalDomainId] = useState("");
    const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Toast Notifications
    const [toast, setToast] = useState<{ message: string; type: "SUCCESS" | "ERROR" } | null>(null);

    // Faculty Worklog State
    const [worklogDate, setWorklogDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
    const [worklogs, setWorklogs] = useState<Record<string, any>>({});
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<any | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const showToast = (message: string, type: "SUCCESS" | "ERROR" = "SUCCESS") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Fetch Calendar Data
    const fetchCalendarData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("year", year.toString());
            params.set("month", month.toString().padStart(2, "0"));
            if (soiDomainId) params.set("soiDomainId", soiDomainId);

            const res = await fetch(`/api/admin/calendar?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setEvents(data.events || []);
                setAttendanceStats(data.attendanceStatsByDate || {});
                setSoiDomains(data.soiDomains || []);
                setInstructors(data.instructors || []);
            } else {
                showToast(data.error || "Failed to load calendar data", "ERROR");
            }
        } catch (err) {
            console.error("Failed to load calendar:", err);
            showToast("Network error while loading calendar", "ERROR");
        } finally {
            setLoading(false);
        }
    }, [year, month, soiDomainId]);

    // Fetch Faculty Worklog
    const fetchWorklog = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            params.set("date", worklogDate);
            if (selectedFacultyId) params.set("userId", selectedFacultyId);

            const res = await fetch(`/api/admin/worklog?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setWorklogs(data.worklogs || {});
                setFacultyList(data.facultyList || []);
                if (!selectedFacultyId && data.targetUserId) {
                    setSelectedFacultyId(data.targetUserId);
                }
            } else {
                showToast(data.error || "Failed to load worklogs", "ERROR");
            }
        } catch (err) {
            console.error("Failed to load worklog:", err);
        }
    }, [worklogDate, selectedFacultyId]);

    // Check Current User Auth Role
    useEffect(() => {
        fetch("/api/auth/login")
            .then((r) => r.json())
            .then((d) => {
                if (d.user) setCurrentUser(d.user);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    useEffect(() => {
        if (activeTab === "WORKLOG") {
            fetchWorklog();
        }
    }, [activeTab, fetchWorklog]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
    };

    const openHolidayModal = (dateStr?: string) => {
        setSelectedDateStr(dateStr || new Date().toISOString().split("T")[0]);
        setTitle("");
        setDescription("");
        setModalDomainId(soiDomainId);
        setIsHolidayModalOpen(true);
    };

    // Modal State Extensions
    const [selectedViewEvent, setSelectedViewEvent] = useState<any | null>(null);
    const [instructorSearch, setInstructorSearch] = useState("");

    // Helper: Check if event start time is in the future
    const isEventInFuture = (dateStr: string, timeStr?: string) => {
        const todayStr = new Date().toISOString().split("T")[0];
        if (dateStr > todayStr) return true;
        if (dateStr < todayStr) return false;

        // Same day: check start time if provided (e.g. "10:00 - 12:30" or "10:00")
        if (timeStr) {
            const startTimeStr = timeStr.split("-")[0].trim();
            const [hours, minutes] = startTimeStr.split(":").map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                const eventTime = new Date();
                eventTime.setHours(hours, minutes, 0, 0);
                return new Date() < eventTime;
            }
        }
        return false;
    };

    // Helper: Check if current user has permission to delete event based on role hierarchy
    const canUserDeleteEvent = (ev: any) => {
        if (!currentUser) return true;
        const currentRole = currentUser.role;
        if (currentRole === "SUPER_ADMIN") return true;

        const creatorRole = ev?.creator?.role?.name || "SUPER_ADMIN";
        if (currentRole === "ADMIN") {
            return creatorRole === "ADMIN" || creatorRole === "INSTRUCTOR";
        }
        if (currentRole === "INSTRUCTOR") {
            return creatorRole === "INSTRUCTOR" && ev.createdById === currentUser.id;
        }
        return false;
    };

    const openEventModal = (dateStr?: string) => {
        setSelectedDateStr(dateStr || new Date().toISOString().split("T")[0]);
        setTitle("");
        setDescription("");
        setEventTime("10:00");
        setModalDomainId(soiDomainId);
        setSelectedInstructorIds([]);
        setInstructorSearch("");
        setIsEventModalOpen(true);
    };

    // Save Holiday with explicit validation
    const handleSaveHoliday = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Notification
        if (!title.trim()) {
            showToast("Validation Error: Holiday title is required!", "ERROR");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDateStr,
                    type: "HOLIDAY",
                    title: title.trim(),
                    description: description.trim() || null,
                    soiDomainId: modalDomainId || null,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast(`Institutional Holiday "${title}" added successfully!`);
                setIsHolidayModalOpen(false);
                fetchCalendarData();
            } else {
                showToast(data.error || "Failed to save holiday", "ERROR");
            }
        } catch (err) {
            console.error("Save holiday error:", err);
            showToast("Error saving holiday entry", "ERROR");
        } finally {
            setSaving(false);
        }
    };

    // Save Special Event with explicit validation
    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Notification
        if (!title.trim()) {
            showToast("Validation Error: Event title is required!", "ERROR");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDateStr,
                    type: "EVENT",
                    title: title.trim(),
                    description: description.trim() || null,
                    time: eventTime,
                    soiDomainId: modalDomainId || null,
                    instructorIds: selectedInstructorIds,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast(`Special Event "${title}" created successfully!`);
                setIsEventModalOpen(false);
                fetchCalendarData();
            } else {
                showToast(data.error || "Failed to create event", "ERROR");
            }
        } catch (err) {
            console.error("Save event error:", err);
            showToast("Error saving event entry", "ERROR");
        } finally {
            setSaving(false);
        }
    };

    // Trigger Attendance for Event
    const handleTriggerEventAttendance = async (event: any, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch("/api/admin/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `EVENT: ${event.title}`,
                    description: event.description || "Calendar Special Event Session",
                    sessionType: "EVENT",
                    durationMinutes: "240",
                }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Attendance session launched for: ${event.title}`);
                router.push("/admin/attendance");
            } else {
                showToast(data.error || "Failed to trigger event attendance", "ERROR");
            }
        } catch (err) {
            console.error("Trigger event attendance error:", err);
        }
    };

    const handleDeleteEvent = async (id: string, eventTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Delete calendar entry "${eventTitle}"?`)) return;

        try {
            const res = await fetch(`/api/admin/calendar?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast(`Deleted "${eventTitle}".`);
                fetchCalendarData();
            }
        } catch (err) {
            console.error("Delete event error:", err);
        }
    };

    // Save Worklog Activity Entry
    const handleSaveWorklogEntry = async (timeSlot: string, activity: string, mergedSpan: number = 1) => {
        try {
            const res = await fetch("/api/admin/worklog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: worklogDate,
                    timeSlot,
                    activity,
                    mergedSpan,
                    targetUserId: selectedFacultyId,
                }),
            });
            if (res.ok) {
                showToast(`Worklog updated for ${timeSlot}`);
                fetchWorklog();
            }
        } catch (err) {
            console.error("Worklog save error:", err);
        }
    };

    // Multi-Cell Selection & Range Merge (Google Sheets Style)
    const toggleSlotSelection = (slot: string) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const handleMergeSelectedSlots = async () => {
        if (selectedSlots.length < 2) {
            showToast("Validation: Select at least 2 consecutive time slots to merge!", "ERROR");
            return;
        }

        const sortedSlots = [...selectedSlots].sort();
        const primarySlot = sortedSlots[0];
        const span = sortedSlots.length;
        const currentActivity = worklogs[primarySlot]?.activity || "Merged Block Activity";

        await handleSaveWorklogEntry(primarySlot, currentActivity, span);
        setSelectedSlots([]);
        showToast(`Merged ${span} time slots starting at ${primarySlot}!`);
    };

    const handleUnmergeSlots = async (slot: string) => {
        const currentActivity = worklogs[slot]?.activity || "";
        await handleSaveWorklogEntry(slot, currentActivity, 1);
        showToast(`Unmerged slot ${slot}`);
    };

    // CSV Download
    const handleDownloadReport = () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Day,Status,Event/Holiday Title,Sessions Conducted,Scans Logged\n";
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayDate = new Date(year, month - 1, d);
            const dateStr = `${year}-${month.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
            const isSunday = dayDate.getDay() === 0;

            const dayEvents = events.filter((e) => e.date === dateStr);
            const isHoliday = dayEvents.some((e) => e.type === "HOLIDAY");
            const eventTitles = dayEvents.map((e) => e.title).join(" | ");

            const stats = attendanceStats[dateStr] || { totalSessions: 0, totalScans: 0 };
            const statusStr = isSunday ? "Sunday (Excluded)" : isHoliday ? "Holiday (Excluded)" : "Session Day";

            csvContent += `"${dateStr}","${dayDate.toLocaleDateString("en-US", { weekday: "short" })}","${statusStr}","${eventTitles}","${stats.totalSessions}","${stats.totalScans}"\n`;
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Smart_Calendar_Report_${year}_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonthCount = new Date(year, month, 0).getDate();
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    const isAdminOrSuperAdmin = currentUser?.role?.name === "ADMIN" || currentUser?.role?.name === "SUPER_ADMIN";

    return (
        <div className="space-y-6 font-sans">
            {/* Validation / Success Toast */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-black flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 ${toast.type === "ERROR" ? "bg-rose-950 text-rose-100 border-rose-800" : "bg-slate-900 text-white border-slate-800"
                        }`}
                >
                    {toast.type === "ERROR" ? (
                        <WarningCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        <span>Smart Institutional Calendar & Worklog Hub</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Holiday management, special events, and daily faculty worklog tracking
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {(currentUser?.role?.name === "SUPER_ADMIN" || currentUser?.role?.name === "ADMIN") && (
                        <button
                            onClick={() => openHolidayModal()}
                            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Sun className="w-4 h-4" />
                            <span>Mark Holiday</span>
                        </button>
                    )}

                    {currentUser?.role?.name === "ADMIN" && (
                        <button
                            onClick={() => openEventModal()}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Bookmark className="w-4 h-4" />
                            <span>Add Special Event</span>
                        </button>
                    )}
                </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab("CALENDAR")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === "CALENDAR" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Smart Calendar</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("WORKLOG")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === "WORKLOG" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        <Table className="w-4 h-4" />
                        <span>Faculty Daily Worklog</span>
                    </button>
                </div>

                {activeTab === "CALENDAR" && (
                    <button
                        onClick={handleDownloadReport}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <FileCsv className="w-4 h-4 text-emerald-600" />
                        <span>Export CSV</span>
                    </button>
                )}
            </div>

            {/* TAB 1: SMART CALENDAR */}
            {activeTab === "CALENDAR" && (
                <div className="space-y-6">
                    {/* Controls Bar */}
                    <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={handlePrevMonth} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700">
                                <CaretLeft className="w-4 h-4" />
                            </button>
                            <h2 className="text-base font-black text-slate-900 w-44 text-center">
                                {monthName} {year}
                            </h2>
                            <button onClick={handleNextMonth} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700">
                                <CaretRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Flask className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-500 shrink-0">Filter SOI Lab:</span>
                            <select
                                value={soiDomainId}
                                onChange={(e) => setSoiDomainId(e.target.value)}
                                className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-indigo-600 transition-all w-full md:w-60"
                            >
                                <option value="">All SOI Labs</option>
                                {soiDomains.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-slate-200 text-center font-black text-xs text-slate-500 bg-slate-50/50 py-3">
                            <div className="text-rose-500">SUN</div>
                            <div>MON</div>
                            <div>TUE</div>
                            <div>WED</div>
                            <div>THU</div>
                            <div>FRI</div>
                            <div>SAT</div>
                        </div>

                        {loading ? (
                            <div className="p-16 text-center space-y-3">
                                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-xs font-bold text-slate-500">Loading calendar...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
                                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="p-3 bg-slate-50/30 min-h-[115px]"></div>
                                ))}

                                {Array.from({ length: daysInMonthCount }).map((_, idx) => {
                                    const dayNum = idx + 1;
                                    const dayDate = new Date(year, month - 1, dayNum);
                                    const dateStr = `${year}-${month.toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
                                    const isSunday = dayDate.getDay() === 0;
                                    const dayEvents = events.filter((e) => e.date === dateStr);
                                    const stats = attendanceStats[dateStr];

                                    return (
                                        <div
                                            key={dateStr}
                                            className={`p-2.5 min-h-[125px] flex flex-col justify-between transition-all hover:bg-indigo-50/40 group ${isSunday ? "bg-slate-50/80" : "bg-white"}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${isSunday ? "text-rose-500 font-extrabold" : "text-slate-800 group-hover:bg-indigo-600 group-hover:text-white"}`}>
                                                    {dayNum}
                                                </span>
                                                {stats && stats.totalSessions > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black">
                                                        {stats.totalScans} Scans
                                                    </span>
                                                )}
                                            </div>

                                            {/* Event Badges */}
                                            <div className="space-y-1 my-1.5">
                                                {dayEvents.map((ev) => {
                                                    const isHoliday = ev.type === "HOLIDAY";
                                                    const isEvent = ev.type === "EVENT";

                                                    return (
                                                        <div
                                                            key={ev.id}
                                                            onClick={() => setSelectedViewEvent(ev)}
                                                            className={`p-1.5 rounded-lg text-[10px] font-extrabold space-y-1 group/ev border cursor-pointer hover:shadow-sm transition-all ${isHoliday ? "bg-rose-100 text-rose-900 border-rose-200" : "bg-indigo-100 text-indigo-950 border-indigo-200"}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="truncate pr-1 font-black">{ev.title}</span>
                                                                {canUserDeleteEvent(ev) && (
                                                                    <button
                                                                        onClick={(e) => handleDeleteEvent(ev.id, ev.title, e)}
                                                                        className="opacity-0 group-hover/ev:opacity-100 text-slate-400 hover:text-rose-600 p-0.5"
                                                                        title="Delete Event"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Direct Attendance Action Trigger */}
                                                            {isEvent && (
                                                                isEventInFuture(ev.date, ev.time) ? (
                                                                    <div
                                                                        className="w-full py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-extrabold flex items-center justify-center gap-1 border border-amber-200/60 cursor-not-allowed"
                                                                        title="Attendance opens at event start time"
                                                                    >
                                                                        <Clock className="w-3 h-3 text-amber-700" />
                                                                        <span>Opens at {ev.time || "Event Start"}</span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => handleTriggerEventAttendance(ev, e)}
                                                                        className="w-full py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                                                                    >
                                                                        <Lightning className="w-3 h-3 text-amber-300 fill-amber-300" />
                                                                        <span>Take Attendance</span>
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                                                <button onClick={() => openHolidayModal(dateStr)} className="text-rose-600 hover:underline">+ Holiday</button>
                                                <span className="text-slate-300">•</span>
                                                <button onClick={() => openEventModal(dateStr)} className="text-indigo-600 hover:underline">+ Event</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: TRUE GOOGLE SHEETS FACULTY WORKLOG GRID */}
            {activeTab === "WORKLOG" && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-sm font-sans">
                    {/* Header Controls: Date & Faculty Selector */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Worklog Date</label>
                                <input
                                    type="date"
                                    value={worklogDate}
                                    onChange={(e) => setWorklogDate(e.target.value)}
                                    className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            {/* Show Faculty Member name for Instructors vs Dropdown for Admins */}
                            {isAdminOrSuperAdmin ? (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Inspect Staff Worklog (Admin View)</label>
                                    <select
                                        value={selectedFacultyId}
                                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                                        className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-600 min-w-60"
                                    >
                                        {facultyList.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} ({f.designation || "Faculty"})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Faculty Member</label>
                                    <div className="h-10 px-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-xs font-black text-emerald-900">
                                        {currentUser?.name || "Logged-in Faculty"} (My Worklog)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Google Sheets Range Merge Button Bar */}
                        <div className="flex items-center gap-3">
                            {selectedSlots.length >= 2 && (
                                <button
                                    onClick={handleMergeSelectedSlots}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer animate-bounce"
                                >
                                    <GridFour className="w-4 h-4" />
                                    <span>Merge Selected Slots ({selectedSlots.length} Hours)</span>
                                </button>
                            )}

                            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/80">
                                Google Sheets Style Grid • Select slots to merge
                            </div>
                        </div>
                    </div>

                    {/* Google Sheets Spreadsheet Table */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs font-mono">
                        <table className="w-full text-left text-xs border-collapse bg-white">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-300">
                                    <th className="p-2.5 w-12 text-center border-r border-slate-300 bg-slate-200/60">Select</th>
                                    <th className="p-2.5 w-36 border-r border-slate-300 bg-slate-200/60">Time Slot</th>
                                    <th className="p-2.5 border-r border-slate-300 bg-slate-200/60">Work Activity Summary (Direct Edit Cell)</th>
                                    <th className="p-2.5 w-32 border-r border-slate-300 bg-slate-200/60 text-center">Merged Span</th>
                                    <th className="p-2.5 w-28 text-center bg-slate-200/60">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {Object.entries(worklogs).map(([slot, data]: [string, any]) => {
                                    const isSelected = selectedSlots.includes(slot);
                                    const span = data.mergedSpan || 1;

                                    return (
                                        <tr key={slot} className={`transition-colors ${isSelected ? "bg-emerald-100/70" : "hover:bg-slate-50"}`}>
                                            <td className="p-2 text-center border-r border-slate-300">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSlotSelection(slot)}
                                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                />
                                            </td>

                                            <td className="p-2.5 border-r border-slate-300 font-black text-slate-800 bg-slate-50/50">
                                                {slot}
                                            </td>

                                            <td className="p-1 border-r border-slate-300">
                                                <input
                                                    type="text"
                                                    defaultValue={data.activity || ""}
                                                    onBlur={(e) => handleSaveWorklogEntry(slot, e.target.value, span)}
                                                    placeholder="Enter hourly lab work, research task, or teaching module..."
                                                    className="w-full h-8 px-3 rounded bg-transparent hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-emerald-500 font-sans text-xs font-medium text-slate-900 focus:outline-none transition-all"
                                                />
                                            </td>

                                            <td className="p-2 border-r border-slate-300 text-center font-sans font-extrabold text-slate-700">
                                                {span > 1 ? (
                                                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px]">
                                                        {span} Hours (Merged)
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-normal">1 Hour</span>
                                                )}
                                            </td>

                                            <td className="p-2 text-center font-sans">
                                                {span > 1 ? (
                                                    <button
                                                        onClick={() => handleUnmergeSlots(slot)}
                                                        className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold cursor-pointer"
                                                    >
                                                        Unmerge
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => showToast(`Saved entry for ${slot}`)}
                                                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                                                    >
                                                        Save
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DEDICATED MARK HOLIDAY MODAL */}
            {isHolidayModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
                            <h2 className="text-base font-extrabold text-rose-900 flex items-center gap-2">
                                <Sun className="w-5 h-5 text-rose-600" />
                                <span>Mark Institutional Holiday</span>
                            </h2>
                            <button onClick={() => setIsHolidayModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleSaveHoliday} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Holiday Date</label>
                                <input type="date" value={selectedDateStr} onChange={(e) => setSelectedDateStr(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Holiday Title <span className="text-rose-500">*</span></label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Independence Day / Local Harvest Festival" className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Scope</label>
                                <select value={modalDomainId} onChange={(e) => setModalDomainId(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900">
                                    <option value="">Institution-Wide (All Labs)</option>
                                    {soiDomains.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name} Only</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20">{saving ? "Saving..." : "Save Holiday"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DEDICATED ADD SPECIAL EVENT MODAL */}
            {isEventModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                            <h2 className="text-base font-extrabold text-indigo-900 flex items-center gap-2">
                                <Bookmark className="w-5 h-5 text-indigo-600" />
                                <span>Add Special Event / Workshop</span>
                            </h2>
                            <button onClick={() => setIsEventModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Event Date</label>
                                    <input type="date" value={selectedDateStr} onChange={(e) => setSelectedDateStr(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Start Time</label>
                                    <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Event Title <span className="text-rose-500">*</span></label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Generative AI Hands-on Masterclass" className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Assign Lead Instructors (Search & Select)</label>
                                <input
                                    type="text"
                                    value={instructorSearch}
                                    onChange={(e) => setInstructorSearch(e.target.value)}
                                    placeholder="Search instructor name, email..."
                                    className="w-full h-9 px-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                />
                                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1">
                                    {instructors
                                        .filter((ins) => {
                                            if (!instructorSearch.trim()) return true;
                                            const q = instructorSearch.toLowerCase();
                                            return (
                                                ins.name.toLowerCase().includes(q) ||
                                                ins.email.toLowerCase().includes(q) ||
                                                (ins.designation && ins.designation.toLowerCase().includes(q))
                                            );
                                        })
                                        .map((ins) => {
                                            const isChecked = selectedInstructorIds.includes(ins.id);
                                            return (
                                                <label key={ins.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer text-xs font-bold text-slate-800">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedInstructorIds([...selectedInstructorIds, ins.id]);
                                                            else setSelectedInstructorIds(selectedInstructorIds.filter((id) => id !== ins.id));
                                                        }}
                                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span>{ins.name} ({ins.designation || "Faculty"})</span>
                                                </label>
                                            );
                                        })}
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20">{saving ? "Saving..." : "Save Event"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW EVENT DETAILS & ATTENDANCE STATS MODAL */}
            {selectedViewEvent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${selectedViewEvent.type === "HOLIDAY" ? "bg-rose-500 text-white" : "bg-indigo-500 text-white"}`}>
                                        {selectedViewEvent.type}
                                    </span>
                                    <h2 className="text-base font-black tracking-tight">{selectedViewEvent.title}</h2>
                                </div>
                                <p className="text-xs text-slate-300 font-medium mt-0.5">
                                    Date: {selectedViewEvent.date} {selectedViewEvent.time ? `• ${selectedViewEvent.time}` : ""}
                                </p>
                            </div>
                            <button onClick={() => setSelectedViewEvent(null)} className="p-1.5 text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Metadata Details */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-semibold text-slate-700">
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-black">Description</span>
                                    <p className="text-slate-800">{selectedViewEvent.description || "No description provided."}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-black">Created By</span>
                                        <p className="text-slate-900 font-bold">
                                            {selectedViewEvent.creator?.name || "Super Admin"}{" "}
                                            <span className="text-[10px] text-indigo-600 font-black">({selectedViewEvent.creator?.role?.name || "SUPER_ADMIN"})</span>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-black">SOI Lab Scope</span>
                                        <p className="text-slate-900 font-bold">
                                            {soiDomains.find((d) => d.id === selectedViewEvent.soiDomainId)?.name || "Global (All Labs)"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Lock / Action Status */}
                            {selectedViewEvent.type === "EVENT" && (
                                <div className="p-4 rounded-2xl border flex flex-col gap-3 bg-white shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Lightning className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <h4 className="text-xs font-extrabold text-slate-900">Event Attendance Console</h4>
                                                <p className="text-[10px] font-bold text-slate-500">Launch active dynamic QR session for students</p>
                                            </div>
                                        </div>

                                        {isEventInFuture(selectedViewEvent.date, selectedViewEvent.time) ? (
                                            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                                                LOCKED (Opens at Start)
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                                                OPEN FOR ATTENDANCE
                                            </span>
                                        )}
                                    </div>

                                    {isEventInFuture(selectedViewEvent.date, selectedViewEvent.time) ? (
                                        <button
                                            disabled
                                            className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                                        >
                                            <Clock className="w-4 h-4" />
                                            <span>Attendance Locked Until Event Start ({selectedViewEvent.time || "Start Time"})</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                setSelectedViewEvent(null);
                                                handleTriggerEventAttendance(selectedViewEvent, e);
                                            }}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
                                        >
                                            <Lightning className="w-4 h-4 text-amber-300 fill-amber-300" />
                                            <span>Launch Active Event Attendance Session</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Modal Action Controls */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                {canUserDeleteEvent(selectedViewEvent) ? (
                                    <button
                                        onClick={(e) => {
                                            const evId = selectedViewEvent.id;
                                            const evTitle = selectedViewEvent.title;
                                            setSelectedViewEvent(null);
                                            handleDeleteEvent(evId, evTitle, e);
                                        }}
                                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-all cursor-pointer"
                                    >
                                        Delete Entry
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-slate-400 font-bold italic">
                                        Deletion restricted by creator role hierarchy
                                    </span>
                                )}

                                <button
                                    onClick={() => setSelectedViewEvent(null)}
                                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
