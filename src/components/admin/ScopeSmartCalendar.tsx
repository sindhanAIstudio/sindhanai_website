"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Calendar,
    Clock,
    Plus,
    CheckCircle,
    XCircle,
    ClockAfternoon,
    Sparkle,
    BookOpen,
    Code,
    FileText,
    Check,
    X,
    PencilSimple,
    Eye,
    ArrowRight,
    MagnifyingGlass,
    WarningCircle,
    Info,
    CheckSquare,
    Square,
    Buildings,
    UsersThree,
    GraduationCap,
    ArrowSquareOut,
    Link as LinkIcon,
    CaretLeft,
    CaretRight,
} from "@phosphor-icons/react";

interface ScopeSmartCalendarProps {
    currentUser: {
        id: string;
        name: string;
        role: string;
        instructorType: string | null;
    };
    metadata: {
        departments: any[];
        classGroups: any[];
        scopeFaculty: any[];
        syllabi: any[];
        miniProjects: any[];
        subjects?: any[];
        batches?: any[];
    };
}

export default function ScopeSmartCalendar({ currentUser, metadata }: ScopeSmartCalendarProps) {
    const isSuperOrAdmin = currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN";

    const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
        isSuperOrAdmin && metadata.scopeFaculty.length > 0 ? metadata.scopeFaculty[0].id : currentUser.id
    );

    // Selected Date (YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

    const [loading, setLoading] = useState(true);
    const [periodConfigs, setPeriodConfigs] = useState<any[]>([]);
    const [dailyPlans, setDailyPlans] = useState<Record<number, any>>({});

    // Progress analytics state
    const [progressData, setProgressData] = useState<any>({ subjects: [], faculty: [] });

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
        show: false,
        message: "",
        type: "info",
    });

    // Modals & Hover details
    const [showModal, setShowModal] = useState(false); // Planning / Edit Modal
    const [showStatusModal, setShowStatusModal] = useState(false); // Status Verification Todo Modal
    const [showReadOnlyModal, setShowReadOnlyModal] = useState(false); // SuperAdmin Auditor Modal
    const [showDetailViewModal, setShowDetailViewModal] = useState(false); // Dedicated Class & Syllabus Detail Modal
    const [detailViewPeriod, setDetailViewPeriod] = useState<number>(1);
    const [hoverPeriodNum, setHoverPeriodNum] = useState<number | null>(null);
    const [activePeriod, setActivePeriod] = useState<number>(1);
    const [modalTab, setModalTab] = useState<"THEORY" | "LAB" | "MINI_PROJECT">("THEORY");

    // Form State
    const [formSubjectId, setFormSubjectId] = useState<string>("");
    const [formDepartmentId, setFormDepartmentId] = useState<string>(metadata.departments[0]?.id || "");
    const [formClassGroupId, setFormClassGroupId] = useState<string>(metadata.classGroups[0]?.id || "");
    const [formBatchId, setFormBatchId] = useState<string>(metadata.batches?.[0]?.id || "");
    const [selectedSyllabusIds, setSelectedSyllabusIds] = useState<string[]>([]);
    const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
    const [selectedMiniProjectId, setSelectedMiniProjectId] = useState<string>("");
    const [topicSearchQuery, setTopicSearchQuery] = useState<string>("");
    const [planStatus, setPlanStatus] = useState<string>("PLANNED");
    const [planNotes, setPlanNotes] = useState<string>("");
    const [saving, setSaving] = useState(false);

    const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 4000);
    };

    // Filter active and non-trashed subjects
    const activeSubjects = useMemo(() => {
        return (metadata.subjects || []).filter(
            (s: any) => s.isActive !== false && !s.isDeleted && !s.deletedAt
        );
    }, [metadata.subjects]);

    // Helper: Generate 7 days centered on selectedDate (3 days before, selected date, 3 days after)
    const get7DaysWindow = (currentDateStr: string) => {
        const parts = (currentDateStr || "").split("-").map(Number);
        const year = parts[0] || new Date().getFullYear();
        const month = parts[1] || (new Date().getMonth() + 1);
        const day = parts[2] || new Date().getDate();

        const center = new Date(year, month - 1, day);

        const days = [];
        for (let i = -3; i <= 3; i++) {
            const d = new Date(center);
            d.setDate(center.getDate() + i);

            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
            const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            days.push({
                dateStr,
                dayName,
                monthDay,
                isCenter: i === 0,
                isSelected: dateStr === currentDateStr,
            });
        }
        return days;
    };

    const handlePrevDay = () => {
        const parts = (selectedDate || "").split("-").map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        d.setDate(d.getDate() - 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };

    const handleNextDay = () => {
        const parts = (selectedDate || "").split("-").map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };

    const weekDays = get7DaysWindow(selectedDate);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/scheduler?facultyId=${selectedFacultyId}&date=${selectedDate}`);
            const data = await res.json();
            if (data.success) {
                setPeriodConfigs(data.periodConfigs || []);
                setDailyPlans(data.dailyPlans || {});
            }
        } catch (err) {
            console.error("Fetch schedule error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const res = await fetch("/api/admin/scheduler/progress");
            const data = await res.json();
            if (data.success) {
                setProgressData(data.data || {});
            }
        } catch (err) {
            console.error("Fetch progress error:", err);
        }
    };

    useEffect(() => {
        fetchSchedule();
        fetchProgress();
    }, [selectedFacultyId, selectedDate]);

    // Helper to safely parse JSON or comma-separated syllabus item IDs
    const parseIds = (raw: any): string[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string") {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                return raw.split(",").map((s) => s.trim()).filter(Boolean);
            }
        }
        return [];
    };

    // Open Planning Modal
    const handleOpenPeriodModal = (periodNum: number) => {
        if (isSuperOrAdmin) {
            handleOpenReadOnlyModal(periodNum);
            return;
        }

        setActivePeriod(periodNum);
        setTopicSearchQuery("");
        const existingPlan = dailyPlans[periodNum];
        if (existingPlan) {
            setFormSubjectId(existingPlan.subjectId || activeSubjects[0]?.id || "");
            setFormDepartmentId(existingPlan.departmentId || metadata.departments[0]?.id || "");
            setFormClassGroupId(existingPlan.classGroupId || metadata.classGroups[0]?.id || "");
            setFormBatchId(existingPlan.batchId || metadata.batches?.[0]?.id || "");
            
            let loadedIds = parseIds(existingPlan.syllabusItemIds);
            if (loadedIds.length === 0 && existingPlan.syllabusItemId) {
                loadedIds = [existingPlan.syllabusItemId];
            }
            setSelectedSyllabusIds(loadedIds);
            setCompletedTopicIds(parseIds(existingPlan.completedTopicIds));

            setSelectedMiniProjectId(existingPlan.miniProjectSyllabusId || "");
            setPlanStatus(existingPlan.status || "PLANNED");
            setPlanNotes(existingPlan.notes || "");
            setModalTab(existingPlan.courseType || "THEORY");
        } else {
            setFormSubjectId(activeSubjects[0]?.id || "");
            setFormDepartmentId(metadata.departments[0]?.id || "");
            setFormClassGroupId(metadata.classGroups[0]?.id || "");
            setFormBatchId(metadata.batches?.[0]?.id || "");
            setSelectedSyllabusIds([]);
            setCompletedTopicIds([]);
            setSelectedMiniProjectId("");
            setPlanStatus("PLANNED");
            setPlanNotes("");
            setModalTab("THEORY");
        }
        setShowModal(true);
    };

    // Open Status Verification Todo Modal
    const handleOpenStatusModal = (periodNum: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setActivePeriod(periodNum);
        const existingPlan = dailyPlans[periodNum];
        if (existingPlan) {
            setFormSubjectId(existingPlan.subjectId || activeSubjects[0]?.id || "");
            setFormDepartmentId(existingPlan.departmentId || metadata.departments[0]?.id || "");
            setFormClassGroupId(existingPlan.classGroupId || metadata.classGroups[0]?.id || "");
            setFormBatchId(existingPlan.batchId || metadata.batches?.[0]?.id || "");

            let loadedIds = parseIds(existingPlan.syllabusItemIds);
            if (loadedIds.length === 0 && existingPlan.syllabusItemId) {
                loadedIds = [existingPlan.syllabusItemId];
            }
            setSelectedSyllabusIds(loadedIds);
            setCompletedTopicIds(parseIds(existingPlan.completedTopicIds));
            setPlanStatus(existingPlan.status || "COMPLETED");
            setPlanNotes(existingPlan.notes || "");
            setShowStatusModal(true);
        }
    };

    // Open Dedicated Class & Syllabus Detail View Modal
    const handleOpenDetailViewModal = (periodNum: number) => {
        setDetailViewPeriod(periodNum);
        setShowDetailViewModal(true);
    };

    // Open SuperAdmin Read-Only Inspector Modal
    const handleOpenReadOnlyModal = (periodNum: number) => {
        setActivePeriod(periodNum);
        setShowReadOnlyModal(true);
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let topicTitle = "";
            if (modalTab === "MINI_PROJECT") {
                const activeMiniProject = metadata.miniProjects.find((m) => m.id === selectedMiniProjectId);
                topicTitle = activeMiniProject ? `[${activeMiniProject.language}] ${activeMiniProject.title}` : "Mini Project Session";
            } else {
                if (selectedSyllabusIds.length > 0) {
                    const selectedTitles = selectedSyllabusIds
                        .map((id) => {
                            const item = metadata.syllabi.find((s) => s.id === id);
                            return item ? `Session ${item.sessionNumber || ""}: ${item.title}` : null;
                        })
                        .filter(Boolean);
                    topicTitle = selectedTitles.join(" | ");
                } else {
                    topicTitle = "Scheduled Session";
                }
            }

            // Calculate auto-status if completing via Todo checkboxes in Status Modal
            let computedStatus = planStatus;
            if (showStatusModal && selectedSyllabusIds.length > 0) {
                if (completedTopicIds.length === selectedSyllabusIds.length) {
                    computedStatus = "COMPLETED";
                } else if (completedTopicIds.length > 0) {
                    computedStatus = "PARTIALLY_COMPLETED";
                } else {
                    computedStatus = "NOT_COMPLETED";
                }
            }

            const payload = {
                periodNumber: activePeriod,
                date: selectedDate,
                dateStr: selectedDate,
                facultyId: selectedFacultyId,
                subjectId: formSubjectId || null,
                departmentId: formDepartmentId || null,
                classGroupId: formClassGroupId || null,
                batchId: formBatchId || null,
                courseType: modalTab,
                syllabusItemId: selectedSyllabusIds[0] || null,
                syllabusItemIds: selectedSyllabusIds,
                completedTopicIds: completedTopicIds,
                miniProjectSyllabusId: selectedMiniProjectId || null,
                plannedTopicTitle: topicTitle,
                status: computedStatus,
                notes: planNotes,
            };

            const res = await fetch("/api/admin/scheduler", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (result.success) {
                setShowModal(false);
                setShowStatusModal(false);
                showNotification("Period plan saved successfully!", "success");
                fetchSchedule();
                fetchProgress();
            } else {
                showNotification(result.error || "Failed to save period plan", "error");
            }
        } catch (err: any) {
            console.error("Save plan error:", err);
            showNotification("Network error saving period plan: " + err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const selectedFacultyObj = metadata.scopeFaculty.find((f) => f.id === selectedFacultyId);

    // Filter syllabus topics by selected Subject and CourseType
    const filteredSyllabus = useMemo(() => {
        return (metadata.syllabi || []).filter((s: any) => {
            if (s.isDeleted) return false;
            if (formSubjectId && s.subjectId && s.subjectId !== formSubjectId) return false;
            if (modalTab === "THEORY") return s.courseType === "THEORY";
            if (modalTab === "LAB") return s.courseType === "LAB";
            return true;
        });
    }, [metadata.syllabi, formSubjectId, modalTab]);

    // Filter mini projects by selected Subject
    const filteredMiniProjects = useMemo(() => {
        return (metadata.miniProjects || []).filter((m: any) => {
            if (m.isDeleted) return false;
            if (formSubjectId && m.subjectId && m.subjectId !== formSubjectId) return false;
            return true;
        });
    }, [metadata.miniProjects, formSubjectId]);

    const searchedSyllabus = useMemo(() => {
        if (!topicSearchQuery.trim()) return filteredSyllabus;
        const q = topicSearchQuery.toLowerCase();
        return filteredSyllabus.filter((s: any) => {
            const titleMatch = (s.title || "").toLowerCase().includes(q);
            const outlineMatch = (s.topicsOutline || "").toLowerCase().includes(q);
            const sessMatch = s.sessionNumber ? s.sessionNumber.toString().includes(q) : false;
            return titleMatch || outlineMatch || sessMatch;
        });
    }, [filteredSyllabus, topicSearchQuery]);

    const classSubjectProgressMap = progressData.classSubjectProgressMap || {};

    const getPlanClassSubjectProgress = (plan: any) => {
        if (!plan || !plan.subjectId) return { total: 0, completed: 0, percentage: 0 };
        const classKey = `${plan.subjectId}_${plan.departmentId || ""}_${plan.classGroupId || ""}_${plan.batchId || ""}`;
        if (classSubjectProgressMap[classKey]) {
            return classSubjectProgressMap[classKey];
        }
        if (classSubjectProgressMap[plan.subjectId]) {
            return classSubjectProgressMap[plan.subjectId];
        }
        return { total: 0, completed: 0, percentage: 0 };
    };

    // Display faculty list for progress: for instructors, show ONLY their own record
    const displayFacultyProgress = isSuperOrAdmin
        ? (progressData.faculty || [])
        : (progressData.faculty || []).filter((f: any) => f.id === currentUser.id);

    // Get active plan for detail view modal
    const detailPlan = dailyPlans[detailViewPeriod];
    const detailSubjectProgress = getPlanClassSubjectProgress(detailPlan);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 relative">

            {/* CUSTOM TOAST NOTIFICATION */}
            {toast.show && (
                <div
                    className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
                        toast.type === "success"
                            ? "bg-slate-900 text-emerald-400 border-emerald-500/30"
                            : toast.type === "error"
                            ? "bg-slate-900 text-red-400 border-red-500/30"
                            : "bg-slate-900 text-indigo-400 border-indigo-500/30"
                    }`}
                >
                    {toast.type === "success" && <Check className="w-5 h-5 text-emerald-400" />}
                    {toast.type === "error" && <WarningCircle className="w-5 h-5 text-red-400" />}
                    {toast.type === "info" && <Info className="w-5 h-5 text-indigo-400" />}
                    <span className="text-xs font-extrabold text-white">{toast.message}</span>
                </div>
            )}

            {/* Header Frame */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Academic Scheduler
                        </h1>
                        {isSuperOrAdmin && (
                            <p className="text-xs text-indigo-200 font-medium mt-1">
                                SuperAdmin Auditor View • Read-Only Micro Plans Inspection
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Interactive Date Picker Input */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-2xl flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-300 shrink-0" />
                            <label className="text-[11px] font-extrabold uppercase text-indigo-200 shrink-0">Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    if (e.target.value) setSelectedDate(e.target.value);
                                }}
                                className="bg-slate-900 text-white text-xs font-extrabold px-2.5 py-1 rounded-xl border border-indigo-400/40 focus:outline-none cursor-pointer"
                            />
                        </div>

                        {/* Faculty Selector for Admins */}
                        {isSuperOrAdmin && metadata.scopeFaculty.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl flex items-center gap-2 min-w-[220px]">
                                <label className="text-[11px] font-extrabold uppercase text-indigo-200 shrink-0">
                                    Faculty:
                                </label>
                                <select
                                    value={selectedFacultyId}
                                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                                    className="w-full px-2.5 py-1 rounded-xl bg-slate-900 border border-indigo-400/40 text-white text-xs font-bold focus:outline-none"
                                >
                                    {metadata.scopeFaculty.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} {f.empId ? `(${f.empId})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* 7-Day Centered Date Navigation Bar with Both-Side Arrows */}
                <div className="flex items-center gap-2 pt-2 relative z-10">
                    <button
                        type="button"
                        onClick={handlePrevDay}
                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer shrink-0 active:scale-95"
                        title="Previous Day"
                    >
                        <CaretLeft className="w-5 h-5" weight="bold" />
                    </button>

                    <div className="grid grid-cols-7 gap-1.5 flex-1">
                        {weekDays.map((d) => (
                            <button
                                key={d.dateStr}
                                onClick={() => setSelectedDate(d.dateStr)}
                                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                                    d.isSelected
                                        ? "bg-white text-slate-950 border-white shadow-xl scale-102 font-extrabold"
                                        : "bg-white/5 hover:bg-white/15 border-white/10 text-white/80"
                                }`}
                            >
                                <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider opacity-75">
                                    {d.dayName}
                                </span>
                                <span className="block text-xs sm:text-sm font-extrabold mt-0.5">
                                    {d.monthDay}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleNextDay}
                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer shrink-0 active:scale-95"
                        title="Next Day"
                    >
                        <CaretRight className="w-5 h-5" weight="bold" />
                    </button>
                </div>
            </div>

            {/* Faculty Active Banner */}
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm shrink-0">
                        {selectedFacultyObj?.name ? selectedFacultyObj.name.charAt(0) : "F"}
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-950">
                            {selectedFacultyObj?.name || "SCOPE Faculty Member"}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            {selectedFacultyObj?.designation || "Faculty Mentor"} • Schedule for {selectedDate}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600">8 Operational Periods</span>
                </div>
            </div>

            {/* 8 PERIODS GRID WITH UNIFORM SIZE, FRONT PROGRESS BAR & MARK STATUS BUTTON */}
            {loading ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Loading period schedule...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                    {(periodConfigs.length > 0 ? periodConfigs : Array.from({ length: 8 }, (_, i) => ({ periodNumber: i + 1, periodName: `Period ${i + 1}`, startTime: `${8 + i}:30`, endTime: `${9 + i}:30` }))).map((period) => {
                        const plan = dailyPlans[period.periodNumber];

                        let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
                        if (plan?.status === "COMPLETED") statusColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        if (plan?.status === "PARTIALLY_COMPLETED") statusColor = "bg-amber-50 text-amber-800 border-amber-200";
                        if (plan?.status === "NOT_COMPLETED") statusColor = "bg-rose-50 text-rose-800 border-rose-200";

                        // Multi-sessions parsing
                        const planTopicIds = parseIds(plan?.syllabusItemIds);
                        if (planTopicIds.length === 0 && plan?.syllabusItemId) planTopicIds.push(plan.syllabusItemId);

                        // Check course types contained in multi-selected topics
                        const attachedSyllabi = planTopicIds.map((id) => metadata.syllabi.find((s) => s.id === id)).filter(Boolean);
                        const hasTheory = attachedSyllabi.some((s) => s.courseType === "THEORY") || plan?.courseType === "THEORY";
                        const hasLab = attachedSyllabi.some((s) => s.courseType === "LAB") || plan?.courseType === "LAB";
                        const hasMiniProject = plan?.courseType === "MINI_PROJECT";

                        const isHovered = hoverPeriodNum === period.periodNumber;
                        const planProgress = getPlanClassSubjectProgress(plan);

                        return (
                            <div
                                key={period.periodNumber}
                                onMouseEnter={() => setHoverPeriodNum(period.periodNumber)}
                                onMouseLeave={() => setHoverPeriodNum(null)}
                                className={`bg-white rounded-3xl border p-5 transition-all duration-200 flex flex-col justify-between min-h-[340px] relative ${
                                    isHovered ? "border-indigo-300 shadow-md bg-slate-50/30" : plan ? "border-slate-300 shadow-2xs" : "border-slate-200 border-dashed"
                                }`}
                            >
                                <div className="space-y-3 flex-1 flex flex-col justify-between">
                                    {/* Period Top Bar */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            {period.periodName || `Period ${period.periodNumber}`}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-500 inline-flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {period.startTime} - {period.endTime}
                                        </span>
                                    </div>

                                    {plan ? (
                                        <div className="space-y-3 flex-1 flex flex-col justify-between">
                                            <div className="space-y-2.5">
                                                {/* DUAL PILLS: THEORY & LAB */}
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {hasTheory && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-800 border-indigo-200">
                                                            THEORY
                                                        </span>
                                                    )}
                                                    {hasLab && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-amber-50 text-amber-800 border-amber-200">
                                                            LAB
                                                        </span>
                                                    )}
                                                    {hasMiniProject && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-purple-50 text-purple-800 border-purple-200">
                                                            MINI PROJECT
                                                        </span>
                                                    )}
                                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusColor}`}>
                                                        {plan.status.replace("_", " ")}
                                                    </span>
                                                </div>

                                                {/* METADATA BADGES: BATCH, DEPARTMENT, SECTION */}
                                                <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                                                    {plan.subject && (
                                                        <span className="text-indigo-700 font-extrabold">
                                                            {plan.subject.name} {plan.subject.code ? `(${plan.subject.code})` : ""}
                                                        </span>
                                                    )}
                                                    {plan.department && (
                                                        <span className="inline-flex items-center gap-1 text-slate-700">
                                                            • <Buildings className="w-3 h-3 text-slate-400" /> {plan.department.code || plan.department.name}
                                                        </span>
                                                    )}
                                                    {plan.classGroup && (
                                                        <span className="inline-flex items-center gap-1 text-slate-700">
                                                            • <UsersThree className="w-3 h-3 text-slate-400" /> {plan.classGroup.code || plan.classGroup.name}
                                                        </span>
                                                    )}
                                                    {plan.batch && (
                                                        <span className="inline-flex items-center gap-1 text-slate-700">
                                                            • <GraduationCap className="w-3 h-3 text-slate-400" /> {plan.batch.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* SCHEDULED TOPIC TITLE */}
                                                <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                                                    {plan.plannedTopicTitle || "Scheduled Session"}
                                                </h4>

                                                {plan.notes && (
                                                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-1">
                                                        "{plan.notes}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* CLASS SUBJECT PROGRESS BAR ON FRONT CARD */}
                                            {plan.subjectId && (
                                                <div className="space-y-1 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 mt-auto">
                                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                                        <span className="text-indigo-900 font-extrabold flex items-center gap-1">
                                                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Syllabus Progress
                                                        </span>
                                                        <span className="text-indigo-700 font-extrabold">
                                                            {planProgress.completed} / {planProgress.total} ({planProgress.percentage}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-indigo-200/60 overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                            style={{ width: `${planProgress.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <Plus className="w-4 h-4" weight="bold" />
                                            </div>
                                            <p className="text-xs font-extrabold text-slate-400 group-hover:text-slate-700 transition-colors">
                                                {isSuperOrAdmin ? "No Plan Logged" : "Click to Plan Period"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* SEPARATE VIEW, EDIT & MARK STATUS BUTTONS */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-3">
                                    {isSuperOrAdmin ? (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDetailViewModal(period.periodNumber)}
                                            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                        >
                                            <Eye className="w-4 h-4 text-indigo-600" /> View Details
                                        </button>
                                    ) : plan ? (
                                        <div className="flex items-center justify-between w-full gap-1.5">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetailViewModal(period.periodNumber)}
                                                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors border border-indigo-200/60"
                                                    title="View Class & Syllabus Details"
                                                >
                                                    <Eye className="w-4 h-4 text-indigo-600" />
                                                    <span>View</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPeriodModal(period.periodNumber)}
                                                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors border border-amber-200/60"
                                                    title="Edit Period Plan"
                                                >
                                                    <PencilSimple className="w-4 h-4 text-amber-700" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleOpenStatusModal(period.periodNumber, e)}
                                                className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                                title="Mark Completion Status"
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                                <span>Mark Status</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenPeriodModal(period.periodNumber)}
                                            className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-indigo-200/60"
                                        >
                                            <Plus className="w-4 h-4" /> Add Period Plan
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SYLLABUS PROGRESS BARS SECTION */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-extrabold text-slate-950">
                        {isSuperOrAdmin ? "Central Syllabus Progress Dashboard" : "My Syllabus Completion Progress"}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Subject Progress Bars */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Subject Completion
                        </h4>
                        {(!progressData.subjects || progressData.subjects.length === 0) ? (
                            <p className="text-xs text-slate-400 font-medium py-4">No subjects configured yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {progressData.subjects.map((s: any) => (
                                    <div key={s.id} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-800">
                                            <span>{s.name} {s.code ? `(${s.code})` : ""}</span>
                                            <span className="text-indigo-600">{s.percentage}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                style={{ width: `${s.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Faculty Delivery */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                            {isSuperOrAdmin ? "Faculty Delivery Breakdown" : "My Delivery Records"}
                        </h4>
                        {(!displayFacultyProgress || displayFacultyProgress.length === 0) ? (
                            <p className="text-xs text-slate-400 font-medium py-4">No delivery records logged yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {displayFacultyProgress.map((f: any) => (
                                    <div key={f.id} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-800">
                                            <span>{f.name}</span>
                                            <span className="text-emerald-600">{f.percentage}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                                style={{ width: `${f.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* PLANNING MODAL WITH SUBJECT, DEPARTMENT, SECTION & BATCH SELECTORS */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">

                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">
                                    Period {activePeriod} Planning
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Date: {selectedDate}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Batch, Department, Section, and Subject Selectors Grid (Cascading Dependent Dropdowns) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">1. Batch / Academic Year *</label>
                                <select
                                    value={formBatchId}
                                    onChange={(e) => {
                                        const newBatchId = e.target.value;
                                        setFormBatchId(newBatchId);
                                        const validSections = (metadata.classGroups || []).filter((c: any) => {
                                            if (newBatchId && c.batchId && c.batchId !== newBatchId) return false;
                                            if (formDepartmentId && c.departmentId && c.departmentId !== formDepartmentId) return false;
                                            return true;
                                        });
                                        if (validSections.length > 0 && !validSections.some((c: any) => c.id === formClassGroupId)) {
                                            setFormClassGroupId(validSections[0].id);
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="">-- Choose Batch * --</option>
                                    {(metadata.batches || []).map((b: any) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} {b.code ? `(${b.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">2. Department *</label>
                                <select
                                    value={formDepartmentId}
                                    onChange={(e) => {
                                        const newDeptId = e.target.value;
                                        setFormDepartmentId(newDeptId);
                                        const validSections = (metadata.classGroups || []).filter((c: any) => {
                                            if (formBatchId && c.batchId && c.batchId !== formBatchId) return false;
                                            if (newDeptId && c.departmentId && c.departmentId !== newDeptId) return false;
                                            return true;
                                        });
                                        if (validSections.length > 0 && !validSections.some((c: any) => c.id === formClassGroupId)) {
                                            setFormClassGroupId(validSections[0].id);
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="">-- Choose Department * --</option>
                                    {(metadata.departments || []).map((d: any) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} {d.code ? `(${d.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                    3. Section / Class Group * (Dependent)
                                </label>
                                <select
                                    value={formClassGroupId}
                                    onChange={(e) => setFormClassGroupId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="">-- Choose Section * --</option>
                                    {(metadata.classGroups || [])
                                        .filter((c: any) => (!formBatchId || !c.batchId || c.batchId === formBatchId) && (!formDepartmentId || !c.departmentId || c.departmentId === formDepartmentId))
                                        .map((c: any) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.code ? `(${c.code})` : ""}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">4. Subject *</label>
                                <select
                                    value={formSubjectId}
                                    onChange={(e) => setFormSubjectId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="">-- Choose Subject * --</option>
                                    {activeSubjects.map((s: any) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.code ? `(${s.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Type Pills: Theory | Lab | Mini Project */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setModalTab("THEORY")}
                                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${modalTab === "THEORY" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-950"
                                    }`}
                            >
                                <BookOpen className="w-4 h-4" /> Theory Class
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTab("LAB")}
                                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${modalTab === "LAB" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-950"
                                    }`}
                            >
                                <Code className="w-4 h-4" /> Practical Lab
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTab("MINI_PROJECT")}
                                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${modalTab === "MINI_PROJECT" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-950"
                                    }`}
                            >
                                <Sparkle className="w-4 h-4" /> Mini Project
                            </button>
                        </div>

                        <form onSubmit={handleSavePlan} className="space-y-4">

                            {modalTab !== "MINI_PROJECT" ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Select Syllabus Topics ({selectedSyllabusIds.length} Selected)
                                        </label>
                                        {selectedSyllabusIds.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedSyllabusIds([])}
                                                className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                                            >
                                                Clear Selection
                                            </button>
                                        )}
                                    </div>

                                    {/* Selected Badges */}
                                    {selectedSyllabusIds.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100 max-h-24 overflow-y-auto">
                                            {selectedSyllabusIds.map((id) => {
                                                const item = metadata.syllabi.find((s) => s.id === id);
                                                if (!item) return null;
                                                return (
                                                    <span
                                                        key={id}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] shadow-2xs"
                                                    >
                                                        Sess #{item.sessionNumber || "-"}: {item.title}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSyllabusIds((prev) => prev.filter((i) => i !== id))}
                                                            className="hover:text-red-200 cursor-pointer ml-0.5"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Topic Search Input */}
                                    <div className="relative">
                                        <MagnifyingGlass className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search topics by session #, title, or outline..."
                                            value={topicSearchQuery}
                                            onChange={(e) => setTopicSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Searchable Topics Multi-Select List */}
                                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
                                        {searchedSyllabus.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-slate-400 font-medium">
                                                No syllabus topics found for selected filter
                                            </div>
                                        ) : (
                                            searchedSyllabus.map((s) => {
                                                const isSelected = selectedSyllabusIds.includes(s.id);
                                                return (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => {
                                                            setSelectedSyllabusIds((prev) =>
                                                                isSelected ? prev.filter((i) => i !== s.id) : [...prev, s.id]
                                                            );
                                                        }}
                                                        className={`p-3 text-xs flex items-start gap-3 cursor-pointer transition-colors ${
                                                            isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}} // Handled by div container click
                                                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                        />
                                                        <div className="space-y-0.5 flex-1">
                                                            <div className="font-extrabold text-slate-900 flex items-center justify-between">
                                                                <span>Session #{s.sessionNumber || "-"}: {s.title}</span>
                                                                {s.duration && <span className="text-[10px] text-slate-400 font-normal">{s.duration}</span>}
                                                            </div>
                                                            {s.topicsOutline && (
                                                                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                                                    {s.topicsOutline}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-700">Select Mini Project</label>
                                    <select
                                        value={selectedMiniProjectId}
                                        onChange={(e) => setSelectedMiniProjectId(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                                    >
                                        <option value="">-- Choose Mini Project --</option>
                                        {filteredMiniProjects.map((m: any) => (
                                            <option key={m.id} value={m.id}>
                                                [{m.language}] {m.title}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Selected Mini Project Card Preview */}
                                    {selectedMiniProjectId && (() => {
                                        const mp = metadata.miniProjects.find((m) => m.id === selectedMiniProjectId);
                                        if (!mp) return null;
                                        return (
                                            <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                                                        <Sparkle className="w-4 h-4 text-purple-600" />
                                                        [{mp.language}] {mp.title}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMiniProjectId("")}
                                                        className="text-purple-500 hover:text-purple-700 cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {mp.description && (
                                                    <p className="text-[11px] text-purple-700 font-medium line-clamp-2">
                                                        {mp.description}
                                                    </p>
                                                )}
                                                {mp.link && (
                                                    <a
                                                        href={mp.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <LinkIcon className="w-3 h-3" /> Project Guidelines Link
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Planning Notes</label>
                                <input
                                    type="text"
                                    value={planNotes}
                                    onChange={(e) => setPlanNotes(e.target.value)}
                                    placeholder="Optional topic notes..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer"
                                >
                                    {saving ? "Saving Plan..." : "Save Period Plan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DEDICATED CLASS & SYLLABUS DETAIL VIEW MODAL WITH NAVIGATION & SUBJECT PROGRESS */}
            {showDetailViewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
                        
                        {/* Header & Period Navigation Controls */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-indigo-600" />
                                    Period {detailViewPeriod} Class & Syllabus View
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Date: {selectedDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        disabled={detailViewPeriod <= 1}
                                        onClick={() => setDetailViewPeriod((prev) => Math.max(1, prev - 1))}
                                        className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-bold text-xs hover:bg-slate-200 disabled:opacity-40 cursor-pointer shadow-2xs"
                                    >
                                        &larr; Prev
                                    </button>
                                    <span className="text-xs font-black text-slate-700 px-1">P{detailViewPeriod}</span>
                                    <button
                                        type="button"
                                        disabled={detailViewPeriod >= 8}
                                        onClick={() => setDetailViewPeriod((prev) => Math.min(8, prev + 1))}
                                        className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-bold text-xs hover:bg-slate-200 disabled:opacity-40 cursor-pointer shadow-2xs"
                                    >
                                        Next &rarr;
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDetailViewModal(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {detailPlan ? (
                            <div className="space-y-5">
                                {/* Class Metadata Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Subject</span>
                                        <span className="font-extrabold text-indigo-700">
                                            {detailPlan.subject?.name || "N/A"} {detailPlan.subject?.code ? `(${detailPlan.subject.code})` : ""}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Department</span>
                                        <span className="font-extrabold text-slate-800">
                                            {detailPlan.department?.name || "N/A"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Section</span>
                                        <span className="font-extrabold text-slate-800">
                                            {detailPlan.classGroup?.name || "N/A"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Batch</span>
                                        <span className="font-extrabold text-slate-800">
                                            {detailPlan.batch?.name || "N/A"}
                                        </span>
                                    </div>
                                </div>

                                {/* Class Subject Progress Bar */}
                                {detailPlan.subjectId && (
                                    <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-indigo-900 flex items-center gap-1.5">
                                                <BookOpen className="w-4 h-4 text-indigo-600" />
                                                Class Subject Progress: {detailPlan.subject?.name}
                                            </span>
                                            <span className="text-indigo-700 font-extrabold">
                                                {detailSubjectProgress.completed} / {detailSubjectProgress.total} Sessions ({detailSubjectProgress.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-indigo-200/60 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                style={{ width: `${detailSubjectProgress.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Topics & Sessions Detailed List */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                        Planned Sessions & Topics Outline
                                    </h4>

                                    {(() => {
                                        const planTopicIds = parseIds(detailPlan.syllabusItemIds);
                                        if (planTopicIds.length === 0 && detailPlan.syllabusItemId) planTopicIds.push(detailPlan.syllabusItemId);
                                        const completedIds = parseIds(detailPlan.completedTopicIds);
                                        const attachedSyllabi = planTopicIds.map((id) => metadata.syllabi.find((s) => s.id === id)).filter(Boolean);

                                        if (attachedSyllabi.length > 0) {
                                            return (
                                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                                    {attachedSyllabi.map((s) => {
                                                        const isCompleted = completedIds.includes(s.id) || detailPlan.status === "COMPLETED";
                                                        return (
                                                            <div
                                                                key={s.id}
                                                                className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        {isCompleted ? (
                                                                            <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
                                                                        ) : (
                                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                                        )}
                                                                        <span className={`text-xs font-extrabold ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                                                                            Session #{s.sessionNumber || "-"}: {s.title}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-100 text-slate-700">
                                                                        {s.courseType}
                                                                    </span>
                                                                </div>
                                                                {s.topicsOutline && (
                                                                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                                        {s.topicsOutline}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }

                                        if (detailPlan.miniProjectSyllabus || detailPlan.courseType === "MINI_PROJECT") {
                                            const mp = detailPlan.miniProjectSyllabus;
                                            return (
                                                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                                                    <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                                                        Mini Project Details
                                                    </span>
                                                    <h5 className="text-sm font-extrabold text-purple-900">
                                                        {mp ? `[${mp.language}] ${mp.title}` : detailPlan.plannedTopicTitle}
                                                    </h5>
                                                    {mp?.description && (
                                                        <p className="text-xs text-purple-800">{mp.description}</p>
                                                    )}
                                                    {mp?.link && (
                                                        <a
                                                            href={mp.link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                                                        >
                                                            <LinkIcon className="w-3.5 h-3.5" /> Open Project Link
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        }

                                        return (
                                            <p className="text-xs text-slate-700 font-bold p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                {detailPlan.plannedTopicTitle || "Scheduled Session"}
                                            </p>
                                        );
                                    })()}
                                </div>

                                {detailPlan.notes && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Instructor Planning Notes</span>
                                        <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                            "{detailPlan.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-2">
                                <Info className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="text-xs font-bold text-slate-400">No period plan logged for Period {detailViewPeriod}.</p>
                            </div>
                        )}

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            {!isSuperOrAdmin && detailPlan && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDetailViewModal(false);
                                        handleOpenPeriodModal(detailViewPeriod);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer border border-amber-200"
                                >
                                    <PencilSimple className="w-4 h-4" /> Edit Period {detailViewPeriod} Plan
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowDetailViewModal(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer ml-auto"
                            >
                                Close Details
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* STATUS TODO VERIFICATION MODAL */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-indigo-600" /> Syllabus Topic Completion Checklist
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Check off completed topics to strike them out e.g. To-Do App</p>
                            </div>
                            <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePlan} className="space-y-4">
                            {selectedSyllabusIds.length > 0 ? (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">Check off Completed Topics:</label>
                                    <div className="space-y-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                                        {selectedSyllabusIds.map((id) => {
                                            const item = metadata.syllabi.find((s) => s.id === id);
                                            if (!item) return null;
                                            const isChecked = completedTopicIds.includes(id);

                                            return (
                                                <div
                                                    key={id}
                                                    onClick={() => {
                                                        setCompletedTopicIds((prev) =>
                                                            isChecked ? prev.filter((i) => i !== id) : [...prev, id]
                                                        );
                                                    }}
                                                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                                        isChecked ? "bg-emerald-50/80 border-emerald-200 text-slate-400" : "bg-white border-slate-200 text-slate-900"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-bold text-xs ${isChecked ? "line-through text-slate-400" : "text-slate-900"}`}>
                                                            Session #{item.sessionNumber || "-"}: {item.title}
                                                        </p>
                                                        {item.topicsOutline && (
                                                            <p className={`text-[11px] mt-0.5 ${isChecked ? "line-through text-slate-400" : "text-slate-500"}`}>
                                                                {item.topicsOutline}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">No syllabus topics selected for this period.</p>
                            )}

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700">Overall Status Override</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: "COMPLETED", label: "Completed", color: "bg-emerald-600" },
                                        { val: "PARTIALLY_COMPLETED", label: "Partially Done", color: "bg-amber-600" },
                                        { val: "NOT_COMPLETED", label: "Not Completed", color: "bg-rose-600" },
                                    ].map((st) => (
                                        <button
                                            key={st.val}
                                            type="button"
                                            onClick={() => setPlanStatus(st.val)}
                                            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${planStatus === st.val
                                                ? `${st.color} text-white shadow-xs`
                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Reason</label>
                                <textarea
                                    value={planNotes}
                                    onChange={(e) => setPlanNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Enter completion notes or reason..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowStatusModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Update Todo Status"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SUPERADMIN READ-ONLY INSPECTION MODAL */}
            {showReadOnlyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-indigo-600" /> Read-Only Micro Plan Inspector
                            </h3>
                            <button onClick={() => setShowReadOnlyModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {dailyPlans[activePeriod] ? (
                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="block font-bold text-slate-400 uppercase text-[10px]">Faculty Member</span>
                                    <span className="font-extrabold text-slate-900">{selectedFacultyObj?.name || "SCOPE Faculty"}</span>
                                </div>
                                {dailyPlans[activePeriod].subject && (
                                    <div>
                                        <span className="block font-bold text-slate-400 uppercase text-[10px]">Subject</span>
                                        <span className="font-extrabold text-slate-900">
                                            {dailyPlans[activePeriod].subject.name} {dailyPlans[activePeriod].subject.code ? `(${dailyPlans[activePeriod].subject.code})` : ""}
                                        </span>
                                    </div>
                                )}
                                {dailyPlans[activePeriod].department && (
                                    <div>
                                        <span className="block font-bold text-slate-400 uppercase text-[10px]">Department & Section & Batch</span>
                                        <span className="font-extrabold text-slate-700">
                                            {dailyPlans[activePeriod].department.name} • {dailyPlans[activePeriod].classGroup?.name || ""} • {dailyPlans[activePeriod].batch?.name || ""}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="block font-bold text-slate-400 uppercase text-[10px]">Scheduled Topic</span>
                                    <span className="font-extrabold text-indigo-600">{dailyPlans[activePeriod].plannedTopicTitle || "Topic Title"}</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-400 uppercase text-[10px]">Execution Status</span>
                                    <span className="font-extrabold text-slate-800">{dailyPlans[activePeriod].status}</span>
                                </div>
                                {dailyPlans[activePeriod].notes && (
                                    <div>
                                        <span className="block font-bold text-slate-400 uppercase text-[10px]">Notes / Reasons</span>
                                        <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-medium">{dailyPlans[activePeriod].notes}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 font-medium py-4 text-center">No micro plan logged for this period.</p>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowReadOnlyModal(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
