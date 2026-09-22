"use client";

import { useState, useEffect } from "react";
import {
    CalendarCheck,
    ChartPie,
    Sparkle,
    MagnifyingGlass,
    PaperPlaneRight,
    BookOpen,
    Code,
    Clock,
    CheckCircle,
    FileText,
    Link as LinkIcon,
    CaretRight,
    User,
    Chalkboard,
} from "@phosphor-icons/react";

interface Metadata {
    departments: { id: string; name: string; code: string }[];
    classGroups: { id: string; name: string; code: string }[];
}

export default function AcademicTrackerPublicClient({ metadata }: { metadata: Metadata }) {
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedClassGroup, setSelectedClassGroup] = useState("");
    const [progressData, setProgressData] = useState<any>(null);
    const [loadingProgress, setLoadingProgress] = useState(true);

    // RAG Chatbot state
    const [chatQuery, setChatQuery] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<
        { sender: "user" | "bot"; text: string; sources?: any[] }[]
    >([
        {
            sender: "bot",
            text: "Hello! I am the SCOPE Academic RAG Assistant. Ask me anything about course syllabi, PPT resources, quizzes, mini projects, or faculty topic delivery progress!",
        },
    ]);

    const fetchProgress = async () => {
        setLoadingProgress(true);
        try {
            const params = new URLSearchParams();
            if (selectedDept) params.set("departmentId", selectedDept);
            if (selectedClassGroup) params.set("classGroupId", selectedClassGroup);

            const res = await fetch(`/api/admin/scheduler/progress?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setProgressData(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch academic progress:", err);
        } finally {
            setLoadingProgress(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, [selectedDept, selectedClassGroup]);

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatQuery.trim() || chatLoading) return;

        const userMsg = chatQuery.trim();
        setChatQuery("");
        setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
        setChatLoading(true);

        try {
            const res = await fetch("/api/academic-rag/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMsg }),
            });
            const result = await res.json();

            if (result.success && result.data) {
                setChatMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        text: result.data.answer,
                        sources: result.data.sources,
                    },
                ]);
            } else {
                setChatMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        text: "Sorry, I couldn't retrieve results for your query right now. Please try again.",
                    },
                ]);
            }
        } catch (err) {
            setChatMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "An error occurred while connecting to the RAG engine.",
                },
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
            {/* Background Glow Overlay */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-purple-950/20 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
                        Academic Progress & <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Syllabus Tracker</span>
                    </h1>
                    <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                        Real-time syllabus completion tracking and period-by-period topic logs.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl mb-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col gap-1 text-xs text-slate-400 font-medium">
                            <label htmlFor="public-dept-filter">Department</label>
                            <select
                                id="public-dept-filter"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="bg-slate-950 border border-slate-700/80 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="">All Departments</option>
                                {metadata.departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} ({d.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 text-xs text-slate-400 font-medium">
                            <label htmlFor="public-class-filter">Section / Class Group</label>
                            <select
                                id="public-class-filter"
                                value={selectedClassGroup}
                                onChange={(e) => setSelectedClassGroup(e.target.value)}
                                className="bg-slate-950 border border-slate-700/80 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="">All Sections</option>
                                {metadata.classGroups.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-400">Total System Syllabi</p>
                            <p className="text-sm font-bold text-purple-300">
                                {progressData?.syllabiCount || 0} Sessions Configured
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Progress Bars & Analytics */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Overall Completion Velocity Card */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                        <ChartPie className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Overall Syllabus Progress</h2>
                                        <p className="text-xs text-slate-400">Across verified classroom deliveries</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-extrabold text-purple-400">
                                    {progressData?.overallPercentage || 0}%
                                </span>
                            </div>

                            {/* Main Progress Bar */}
                            <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                    style={{ width: `${progressData?.overallPercentage || 0}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/60 text-center">
                                <div>
                                    <p className="text-xs text-slate-400">Completed Sessions</p>
                                    <p className="text-xl font-bold text-emerald-400 mt-1">
                                        {progressData?.totalCompleted || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Total Topics</p>
                                    <p className="text-xl font-bold text-slate-200 mt-1">
                                        {progressData?.totalCount || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Verified Executions</p>
                                    <p className="text-xl font-bold text-cyan-400 mt-1">
                                        {progressData?.dailyPlansCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress by Department */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Chalkboard className="w-5 h-5 text-indigo-400" />
                                Department Breakdown
                            </h2>

                            {loadingProgress ? (
                                <div className="py-8 text-center text-slate-500 text-sm">Loading department velocity...</div>
                            ) : progressData?.deptProgress?.length === 0 ? (
                                <div className="py-8 text-center text-slate-500 text-sm">No department data available</div>
                            ) : (
                                <div className="space-y-4">
                                    {progressData?.deptProgress?.map((dept: any) => (
                                        <div key={dept.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold text-slate-200">{dept.name} ({dept.code})</span>
                                                <span className="text-xs font-bold text-indigo-400">{dept.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${dept.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Progress by Faculty Member */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-cyan-400" />
                                SCOPE Faculty Completion Progress
                            </h2>

                            {loadingProgress ? (
                                <div className="py-8 text-center text-slate-500 text-sm">Loading faculty progress...</div>
                            ) : progressData?.facultyProgress?.length === 0 ? (
                                <div className="py-8 text-center text-slate-500 text-sm">No active SCOPE faculty logs found</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {progressData?.facultyProgress?.map((fac: any) => (
                                        <div
                                            key={fac.id}
                                            className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-200 text-sm">{fac.name}</p>
                                                <p className="text-xs text-slate-400">{fac.designation}</p>
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-slate-400">{fac.completed} verified sessions</span>
                                                    <span className="font-bold text-cyan-400">{fac.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                                                        style={{ width: `${fac.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: RAG AI Assistant */}
                    <div className="lg:col-span-5 flex flex-col h-[700px] bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                        {/* RAG Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <Sparkle className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Academic RAG Engine</h3>
                                    <p className="text-xs text-purple-300">Grounding on live database topics & links</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col ${
                                        msg.sender === "user" ? "items-end" : "items-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                                            msg.sender === "user"
                                                ? "bg-purple-600 text-white rounded-br-none"
                                                : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.text}</div>

                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                                                <p className="text-xs font-semibold text-purple-400">Resource Quick Links:</p>
                                                {msg.sources.map((s, idx) => (
                                                    <div key={idx} className="flex flex-wrap gap-2 text-xs">
                                                        {s.ppt && (
                                                            <a
                                                                href={s.ppt}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-cyan-400 underline hover:text-cyan-300 flex items-center gap-1"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> PPT
                                                            </a>
                                                        )}
                                                        {s.quiz && (
                                                            <a
                                                                href={s.quiz}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-emerald-400 underline hover:text-emerald-300 flex items-center gap-1"
                                                            >
                                                                <LinkIcon className="w-3.5 h-3.5" /> Quiz
                                                            </a>
                                                        )}
                                                        {s.activity && (
                                                            <a
                                                                href={s.activity}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-amber-400 underline hover:text-amber-300 flex items-center gap-1"
                                                            >
                                                                <Code className="w-3.5 h-3.5" /> Activity
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex items-start">
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-purple-400 flex items-center gap-2">
                                        <Sparkle className="w-4 h-4 animate-spin text-purple-400" />
                                        Querying database & vector index...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Prompts */}
                        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 flex flex-wrap gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setChatQuery("Binary Search Trees PPT and Quiz")}
                                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors"
                            >
                                🔍 Binary Search Trees PPT
                            </button>
                            <button
                                type="button"
                                onClick={() => setChatQuery("Python mini projects for 2nd year")}
                                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors"
                            >
                                💻 Python Mini Projects
                            </button>
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                            <input
                                type="text"
                                value={chatQuery}
                                onChange={(e) => setChatQuery(e.target.value)}
                                placeholder="Ask about topics, PPT links, or faculty schedules..."
                                className="flex-1 bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!chatQuery.trim() || chatLoading}
                                className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg"
                            >
                                <PaperPlaneRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
