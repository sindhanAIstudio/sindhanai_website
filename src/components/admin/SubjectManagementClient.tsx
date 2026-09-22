"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    BookOpen,
    PencilSimple,
    Trash,
    MagnifyingGlass,
    Check,
    X,
    WarningCircle,
    Info,
    ArrowLeft,
} from "@phosphor-icons/react";
import Link from "next/link";

interface Subject {
    id: string;
    name: string;
    code?: string | null;
    description?: string | null;
    _count?: {
        syllabi: number;
        miniProjects: number;
    };
}

export default function SubjectManagementClient() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Toast State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
        show: false,
        message: "",
        type: "info",
    });

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    // Form Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({ name: "", code: "", description: "" });

    const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 4000);
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/subjects");
            const data = await res.json();
            if (data.success) {
                setSubjects(data.data || []);
            } else {
                showNotification(data.error || "Failed to load subjects", "error");
            }
        } catch (err) {
            showNotification("Network error loading subjects", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleOpenModal = (subject?: Subject) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData({
                name: subject.name || "",
                code: subject.code || "",
                description: subject.description || "",
            });
        } else {
            setEditingSubject(null);
            setFormData({ name: "", code: "", description: "" });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingSubject ? "PUT" : "POST";
            const payload = editingSubject ? { id: editingSubject.id, ...formData } : formData;

            const res = await fetch("/api/admin/subjects", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (result.success) {
                setShowModal(false);
                showNotification(`Subject ${editingSubject ? "updated" : "created"} successfully!`, "success");
                fetchSubjects();
            } else {
                showNotification(result.error || "Failed to save subject", "error");
            }
        } catch (err) {
            showNotification("Failed to connect to server", "error");
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setConfirmModal({
            open: true,
            title: "Delete Subject",
            message: `Are you sure you want to delete "${name}"? Existing syllabus topics will be unassigned.`,
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/subjects?id=${id}`, { method: "DELETE" });
            const result = await res.json();
            if (result.success) {
                showNotification("Subject deleted successfully.", "success");
                fetchSubjects();
            } else {
                showNotification(result.error || "Failed to delete subject", "error");
            }
        } catch (err) {
            showNotification("Failed to delete subject", "error");
        } finally {
            setConfirmModal((prev) => ({ ...prev, open: false }));
        }
    };

    const filteredSubjects = subjects.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 relative max-w-7xl mx-auto">

            {/* TOAST NOTIFICATION */}
            {toast.show && (
                <div
                    className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all duration-300 ${
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

            {/* CONFIRMATION MODAL */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600">
                                <WarningCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">{confirmModal.title}</h3>
                                <p className="text-xs text-slate-500 font-medium">Action confirmation</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                            {confirmModal.message}
                        </p>
                        <div className="pt-2 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
                                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmModal.onConfirm}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                            >
                                Soft Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/syllabus"
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" /> Syllabus Directory
                        </Link>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Metadata Management</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Subject Management
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">
                        Define academic subjects (e.g. Python Programming, Data Structures). Syllabus items & mini projects belong to subjects.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                    <Plus className="w-4 h-4" weight="bold" /> Add Subject
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" weight="bold" />
                    <input
                        type="text"
                        placeholder="Search subject by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                </div>
            </div>

            {/* Data Grid / Cards */}
            {loading ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Loading subjects...</p>
                </div>
            ) : filteredSubjects.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No subjects configured</p>
                    <p className="text-xs text-slate-400">Click "Add Subject" to create your first academic subject.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSubjects.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-black text-xs border border-indigo-200 uppercase">
                                        {s.code || "SUBJ"}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                        {s._count?.syllabi || 0} Sessions
                                    </span>
                                </div>

                                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                                    {s.name}
                                </h3>

                                {s.description && (
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
                                        {s.description}
                                    </p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    href={`/admin/syllabus?subjectId=${s.id}`}
                                    className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                                >
                                    <BookOpen className="w-4 h-4 text-indigo-600" /> View Syllabus ({s._count?.syllabi || 0})
                                </Link>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal(s)}
                                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                        title="Edit Subject"
                                    >
                                        <PencilSimple className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteClick(s.id, s.name)}
                                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                        title="Soft Delete Subject"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-extrabold text-slate-900">
                                {editingSubject ? "Edit Subject" : "Create New Subject"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Python Programming"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g. CS101"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief course overview..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer"
                                >
                                    Save Subject
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
