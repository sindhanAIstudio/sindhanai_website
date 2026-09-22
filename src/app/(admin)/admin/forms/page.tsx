"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    NotePencil,
    Plus,
    FileText,
    Eye,
    PaperPlaneTilt,
    Trash,
    Link as LinkIcon,
    Sparkle,
    CheckCircle,
    Copy,
    ChartLineUp,
    Spinner,
    ArrowSquareOut,
    ToggleLeft,
    ToggleRight,
    ChartBar,
    Exam,
} from "@phosphor-icons/react";

interface DynamicFormItem {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    type?: string; // "form" | "poll" | "quiz"
    active: boolean;
    viewsCount: number;
    submissionsCount: number;
    createdAt: string;
    _count: {
        submissions: number;
    };
}

export default function AdminFormsPage() {
    const [forms, setForms] = useState<DynamicFormItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<"all" | "form" | "poll" | "quiz">("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [formType, setFormType] = useState<"form" | "poll" | "quiz">("form");
    const [creating, setCreating] = useState(false);
    const [embedModalForm, setEmbedModalForm] = useState<DynamicFormItem | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/forms");
            const data = await res.json();
            if (res.ok) {
                setForms(data.forms || []);
            }
        } catch (err) {
            console.error("Error fetching forms:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setCreating(true);
        try {
            const res = await fetch("/api/admin/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    description: newDescription.trim(),
                    type: formType,
                }),
            });

            const data = await res.json();
            if (res.ok && data.form) {
                setShowCreateModal(false);
                setNewTitle("");
                setNewDescription("");
                // Redirect to Form Builder Studio
                window.location.href = `/admin/forms/builder?id=${data.form.id}`;
            } else {
                alert(data.error || "Failed to create form");
            }
        } catch (err: any) {
            alert(err.message || "Network error");
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (form: DynamicFormItem) => {
        try {
            const res = await fetch(`/api/admin/forms/${form.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !form.active }),
            });
            if (res.ok) {
                setForms(forms.map((f) => (f.id === form.id ? { ...f, active: !f.active } : f)));
            }
        } catch (err) {
            console.error("Failed to toggle status:", err);
        }
    };

    const handleDeleteForm = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete form "${title}" and all its submissions?`)) return;

        try {
            const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
            if (res.ok) {
                setForms(forms.filter((f) => f.id !== id));
            }
        } catch (err) {
            alert("Failed to delete form");
        }
    };

    const filteredForms = forms.filter((f) => {
        const matchesSearch =
            f.title.toLowerCase().includes(search.toLowerCase()) ||
            f.slug.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "all" || (f.type || "form") === filterType;
        return matchesSearch && matchesType;
    });

    const totalViews = forms.reduce((acc, f) => acc + (f.viewsCount || 0), 0);
    const totalSubmissions = forms.reduce((acc, f) => acc + (f._count?.submissions || f.submissionsCount || 0), 0);
    const conversionRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : "0.0";

    return (
        <div className="space-y-6">
            {/* Top Bar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                            <NotePencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">Dynamic Forms, Polls & Quizzes</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Forminator-style visual studio builder for Custom Forms, Live Polls, and Knowledge Quizzes
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New (Form / Poll / Quiz)</span>
                </button>
            </div>

            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Items</p>
                        <p className="text-2xl font-black text-slate-900">{forms.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Views</p>
                        <p className="text-2xl font-black text-sky-600">{totalViews}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                        <Eye className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Submissions / Votes</p>
                        <p className="text-2xl font-black text-emerald-600">{totalSubmissions}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                        <PaperPlaneTilt className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg. Conversion</p>
                        <p className="text-2xl font-black text-amber-600">{conversionRate}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                        <ChartLineUp className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold w-full md:w-auto">
                    <button
                        onClick={() => setFilterType("all")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${filterType === "all" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setFilterType("form")}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterType === "form" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Forms</span>
                    </button>
                    <button
                        onClick={() => setFilterType("poll")}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterType === "poll" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <ChartBar className="w-3.5 h-3.5" />
                        <span>Polls</span>
                    </button>
                    <button
                        onClick={() => setFilterType("quiz")}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterType === "quiz" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <Exam className="w-3.5 h-3.5" />
                        <span>Quizzes</span>
                    </button>
                </div>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or slug..."
                    className="w-full md:w-72 h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
            </div>

            {/* Directory Table */}
            {loading ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                    <Spinner className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Loading form directory...</p>
                </div>
            ) : filteredForms.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">No Items Found</h3>
                        <p className="text-xs text-slate-500">
                            Create your first Custom Form, Live Poll, or Scored Quiz!
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Item</span>
                    </button>
                </div>
            ) : (
                <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-4 px-6">Title & Type</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-center">Views</th>
                                    <th className="py-4 px-6 text-center">Submissions / Votes</th>
                                    <th className="py-4 px-6 text-center">Conversion</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {filteredForms.map((form) => {
                                    const views = form.viewsCount || 0;
                                    const subs = form._count?.submissions || form.submissionsCount || 0;
                                    const conv = views > 0 ? ((subs / views) * 100).toFixed(1) : "0.0";
                                    const typeName = (form.type || "form").toUpperCase();

                                    return (
                                        <tr key={form.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-slate-900 text-sm">{form.title}</span>
                                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${typeName === "POLL"
                                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                                            : typeName === "QUIZ"
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        }`}>
                                                        {typeName}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-mono text-indigo-600">
                                                    /forms/{form.slug}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleToggleActive(form)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer ${form.active
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                            : "bg-slate-100 border-slate-200 text-slate-500"
                                                        }`}
                                                >
                                                    {form.active ? (
                                                        <>
                                                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                                                            <span>Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                                                            <span>Draft / Inactive</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            <td className="py-4 px-6 text-center font-mono font-bold text-slate-700">
                                                {views}
                                            </td>

                                            <td className="py-4 px-6 text-center font-mono font-bold text-emerald-600">
                                                {subs}
                                            </td>

                                            <td className="py-4 px-6 text-center font-mono font-bold text-amber-600">
                                                {conv}%
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Edit Builder */}
                                                    <Link
                                                        href={`/admin/forms/builder?id=${form.id}`}
                                                        className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-600 border border-slate-200 transition-all"
                                                        title="Edit Form Builder"
                                                    >
                                                        <NotePencil className="w-4 h-4" />
                                                    </Link>

                                                    {/* Submissions */}
                                                    <Link
                                                        href={`/admin/forms/${form.id}/submissions`}
                                                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all flex items-center gap-1 text-[11px] font-bold"
                                                        title="View Submissions"
                                                    >
                                                        <PaperPlaneTilt className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Responses ({subs})</span>
                                                    </Link>

                                                    {/* Public Form Link */}
                                                    <a
                                                        href={`/forms/${form.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                                                        title="View Public Link"
                                                    >
                                                        <ArrowSquareOut className="w-4 h-4" />
                                                    </a>

                                                    {/* Embed Modal Trigger */}
                                                    <button
                                                        onClick={() => setEmbedModalForm(form)}
                                                        className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 transition-all cursor-pointer"
                                                        title="Share & Embed Link"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDeleteForm(form.id, form.title)}
                                                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                                                        title="Delete Item"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Create New Form / Poll / Quiz */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Sparkle className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-base font-extrabold text-slate-900">Create New Module</h3>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateForm} className="space-y-4">
                            {/* Type Selector (Form / Poll / Quiz) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Module Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormType("form")}
                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${formType === "form"
                                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20"
                                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                        <p className="text-xs font-extrabold">Custom Form</p>
                                        <p className="text-[10px] opacity-75">Registration / Lead form</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormType("poll")}
                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${formType === "poll"
                                                ? "bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20"
                                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <ChartBar className="w-5 h-5 text-purple-600" />
                                        <p className="text-xs font-extrabold">Interactive Poll</p>
                                        <p className="text-[10px] opacity-75">Live voting & graph</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormType("quiz")}
                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${formType === "quiz"
                                                ? "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20"
                                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <Exam className="w-5 h-5 text-amber-600" />
                                        <p className="text-xs font-extrabold">Scored Quiz</p>
                                        <p className="text-[10px] opacity-75">Knowledge test & score</p>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder={
                                        formType === "poll"
                                            ? "e.g. Which AI domain do you want to learn next?"
                                            : formType === "quiz"
                                                ? "e.g. Generative AI Fundamentals Quiz"
                                                : "e.g. SOI Hackathon 2026 Registration Form"
                                    }
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Provide instructions for respondents..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newTitle.trim()}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {creating ? (
                                        <>
                                            <Spinner className="w-4 h-4 animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            <span>Launch Studio Builder</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Embed & Share Link */}
            {embedModalForm && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2 text-sky-600">
                                <LinkIcon className="w-5 h-5" />
                                <h3 className="text-base font-extrabold text-slate-900">Share & Embed Link</h3>
                            </div>
                            <button
                                onClick={() => setEmbedModalForm(null)}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700">Direct Link</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/forms/${embedModalForm.slug}`}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-indigo-600"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/forms/${embedModalForm.slug}`);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0 cursor-pointer"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                {copied && <p className="text-[11px] text-emerald-600 font-semibold">✓ Link copied to clipboard!</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700">HTML Iframe Embed Code</label>
                                <textarea
                                    readOnly
                                    rows={3}
                                    value={`<iframe src="${window.location.origin}/forms/${embedModalForm.slug}" width="100%" height="750" frameborder="0"></iframe>`}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setEmbedModalForm(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
