"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    UploadSimple,
    DownloadSimple,
    MagnifyingGlass,
    FileText,
    PencilSimple,
    Trash,
    Link as LinkIcon,
    BookOpen,
    Code,
    X,
    Sparkle,
    FileCsv,
    CaretLeft,
    CaretRight,
    ArrowSquareOut,
    WarningCircle,
    Info,
    Check,
    Flask,
} from "@phosphor-icons/react";

interface Subject {
    id: string;
    name: string;
    code?: string | null;
    description?: string | null;
}

type TabType = "THEORY" | "LAB" | "MINI_PROJECT";

export default function SyllabusManagementClient({ subjects = [] }: { subjects?: Subject[] }) {
    const activeSubjects = useMemo(() => {
        return (subjects || []).filter((s: any) => s.isActive !== false && !s.deletedAt && !s.isDeleted);
    }, [subjects]);

    const [activeTab, setActiveTab] = useState<TabType>("THEORY");
    const [loading, setLoading] = useState(true);

    // Subject Filter Selection
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjects[0]?.id || "");

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
        show: false,
        message: "",
        type: "info",
    });

    // Custom Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmText?: string;
        type?: "danger" | "warning" | "info";
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    // Selection state for Bulk Delete
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");

    // Form Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Import modal state
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJsonText, setImportJsonText] = useState("");
    const [importLoading, setImportLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        sessionNumber: "",
        title: "",
        duration: "1 Hour",
        topicsOutline: "",
        pptResourceUrl: "",
        pptPublishedUrl: "",
        quizLink: "",
        activityLink: "",
        courseType: "THEORY",
        subjectId: subjects[0]?.id || "",
        language: "Python",
        description: "",
        link: "",
    });

    const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 4000);
    };

    const [items, setItems] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSyllabusData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("kind", activeTab);
            if (activeTab === "THEORY") {
                params.set("courseType", "THEORY");
            } else if (activeTab === "LAB") {
                params.set("courseType", "LAB");
            }
            if (selectedSubjectId) params.set("subjectId", selectedSubjectId);
            if (searchQuery) params.set("search", searchQuery);
            params.set("page", currentPage.toString());
            params.set("pageSize", pageSize.toString());

            const res = await fetch(`/api/admin/syllabus?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setItems(data.data || []);
                if (data.pagination) {
                    setTotalCount(data.pagination.total || 0);
                    setTotalPages(data.pagination.totalPages || 1);
                }
            } else {
                showNotification(data.error || "Failed to load syllabus items", "error");
            }
        } catch (err) {
            console.error("Failed to fetch syllabus data:", err);
            showNotification("Network error loading syllabus data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSyllabusData();
    }, [selectedSubjectId, searchQuery, activeTab, currentPage, pageSize]);

    // Switch tabs safely
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSelectedIds([]);
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                sessionNumber: item.sessionNumber?.toString() || "",
                title: item.title || "",
                duration: item.duration || (activeTab === "LAB" ? "2 Hours" : "1 Hour"),
                topicsOutline: item.topicsOutline || "",
                pptResourceUrl: item.pptResourceUrl || "",
                pptPublishedUrl: item.pptPublishedUrl || "",
                quizLink: item.quizLink || "",
                activityLink: item.activityLink || "",
                courseType: item.courseType || (activeTab === "LAB" ? "LAB" : "THEORY"),
                subjectId: item.subjectId || selectedSubjectId || subjects[0]?.id || "",
                language: item.language || "Python",
                description: item.description || "",
                link: item.link || "",
            });
        } else {
            setEditingItem(null);
            setFormData({
                sessionNumber: (items.length + 1).toString(),
                title: "",
                duration: activeTab === "LAB" ? "2 Hours" : "1 Hour",
                topicsOutline: "",
                pptResourceUrl: "",
                pptPublishedUrl: "",
                quizLink: "",
                activityLink: "",
                courseType: activeTab === "LAB" ? "LAB" : "THEORY",
                subjectId: selectedSubjectId || subjects[0]?.id || "",
                language: "Python",
                description: "",
                link: "",
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingItem ? "PUT" : "POST";
            const bodyPayload = {
                id: editingItem?.id,
                kind: activeTab,
                ...formData,
            };

            const res = await fetch("/api/admin/syllabus", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload),
            });

            const result = await res.json();
            if (result.success) {
                setShowModal(false);
                showNotification(`Successfully ${editingItem ? "updated" : "created"} entry!`, "success");
                fetchSyllabusData();
            } else {
                showNotification(result.error || "Failed to save entry", "error");
            }
        } catch (err) {
            showNotification("An error occurred while saving entry", "error");
        }
    };

    // Delete single item
    const handleDeleteSingleClick = (id: string, title: string) => {
        setConfirmModal({
            open: true,
            title: "Delete Item",
            message: `Are you sure you want to delete "${title}"? This record will be archived.`,
            confirmText: "Delete",
            type: "danger",
            onConfirm: () => performDeleteSingle(id),
        });
    };

    const performDeleteSingle = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/syllabus?id=${id}&kind=${activeTab}`, {
                method: "DELETE",
            });
            const result = await res.json();
            if (result.success) {
                setSelectedIds((prev) => prev.filter((i) => i !== id));
                showNotification("Item deleted successfully.", "success");
                fetchSyllabusData();
            } else {
                showNotification(result.error || "Failed to delete item", "error");
            }
        } catch (err) {
            showNotification("Failed to connect to delete endpoint", "error");
        } finally {
            setConfirmModal((prev) => ({ ...prev, open: false }));
        }
    };

    // Delete multiple selected items
    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) return;
        setConfirmModal({
            open: true,
            title: "Bulk Delete",
            message: `Are you sure you want to delete ${selectedIds.length} selected item(s)?`,
            confirmText: `Delete (${selectedIds.length})`,
            type: "danger",
            onConfirm: () => performBulkDelete(),
        });
    };

    const performBulkDelete = async () => {
        try {
            const res = await fetch(`/api/admin/syllabus?ids=${selectedIds.join(",")}&kind=${activeTab}`, {
                method: "DELETE",
            });
            const result = await res.json();
            if (result.success) {
                showNotification(result.message || `Successfully deleted ${selectedIds.length} items.`, "success");
                setSelectedIds([]);
                fetchSyllabusData();
            } else {
                showNotification(result.error || "Bulk delete failed", "error");
            }
        } catch (err) {
            showNotification("Bulk delete request failed", "error");
        } finally {
            setConfirmModal((prev) => ({ ...prev, open: false }));
        }
    };

    const parseCSVData = (text: string) => {
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentCell = '';
        let insideQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    currentCell += '"';
                    i++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if ((char === '\r' || char === '\n') && !insideQuotes) {
                if (char === '\r' && nextChar === '\n') i++;
                currentRow.push(currentCell.trim());
                if (currentRow.some((cell) => cell.length > 0)) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        if (currentCell || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            if (currentRow.some((cell) => cell.length > 0)) {
                rows.push(currentRow);
            }
        }

        if (rows.length < 2) return [];
        const headers = rows[0].map((h) => h.replace(/^"|"$/g, '').trim());
        return rows.slice(1).map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, idx) => {
                obj[h] = row[idx] ? row[idx].replace(/^"|"$/g, '').replace(/""/g, '"') : '';
            });
            return obj;
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                setImportJsonText(content);
                showNotification("Loaded file into preview editor", "info");
            }
        };
        reader.readAsText(file);
    };

    const handleLoadPythonSample = async () => {
        try {
            const res = await fetch("/sample_python_syllabus.csv");
            const text = await res.text();
            setImportJsonText(text);
            showNotification("Loaded 45-session Python sample syllabus", "success");
        } catch (err) {
            showNotification("Failed to load sample file", "error");
        }
    };

    const handleBulkImport = async () => {
        if (!importJsonText.trim()) return;
        setImportLoading(true);
        try {
            let parsedItems: any[] = [];
            try {
                parsedItems = JSON.parse(importJsonText);
            } catch {
                parsedItems = parseCSVData(importJsonText);
            }

            if (parsedItems.length === 0) {
                showNotification("Could not parse any valid rows. Check CSV format.", "error");
                setImportLoading(false);
                return;
            }

            const res = await fetch("/api/admin/syllabus/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: parsedItems,
                    kind: activeTab,
                    subjectId: selectedSubjectId || null,
                }),
            });

            const result = await res.json();
            if (result.success) {
                showNotification(result.message, "success");
                setShowImportModal(false);
                setImportJsonText("");
                fetchSyllabusData();
            } else {
                showNotification(result.error || "Import failed", "error");
            }
        } catch (err: any) {
            showNotification("Format error: " + err.message, "error");
        } finally {
            setImportLoading(false);
        }
    };

    // Server-side paginated items
    const paginatedItems = items;

    // Checkbox selection logic
    const isAllVisibleSelected = useMemo(() => {
        if (paginatedItems.length === 0) return false;
        return paginatedItems.every((item) => selectedIds.includes(item.id));
    }, [paginatedItems, selectedIds]);

    const handleToggleSelectAll = () => {
        if (isAllVisibleSelected) {
            const pageIds = paginatedItems.map((i) => i.id);
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            const pageIds = paginatedItems.map((i) => i.id);
            setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleToggleSelectRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const selectedSubjectObj = subjects.find((s) => s.id === selectedSubjectId);

    const getTabTitle = () => {
        if (activeTab === "THEORY") return "Theory Sessions";
        if (activeTab === "LAB") return "Lab Sessions";
        return "Mini Projects";
    };

    return (
        <div className="space-y-6 relative">

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

            {/* CUSTOM CONFIRMATION MODAL */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600">
                                <WarningCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    {confirmModal.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Confirm delete action
                                </p>
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
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                            >
                                {confirmModal.confirmText || "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-indigo-600" weight="bold" />
                        Syllabus Directory
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Syllabus Directory
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            type="button"
                            onClick={handleBulkDeleteClick}
                            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer animate-pulse"
                        >
                            <Trash className="w-4 h-4" weight="bold" /> Delete ({selectedIds.length} Selected)
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4" weight="bold" /> Add {activeTab === "MINI_PROJECT" ? "Mini Project" : activeTab === "LAB" ? "Lab Session" : "Theory Session"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowImportModal(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <UploadSimple className="w-4 h-4" weight="bold" /> Bulk Import
                    </button>
                    <a
                        href={`/api/admin/syllabus/export?kind=${activeTab}`}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <DownloadSimple className="w-4 h-4" weight="bold" /> Export CSV
                    </a>
                </div>
            </div>

            {/* SUBJECT SELECTOR BAR */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 p-5 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                        Select Academic Subject
                    </label>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white font-extrabold text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400 transition-colors min-w-[260px]"
                        >
                            <option value="">All Subjects</option>
                            {activeSubjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.code ? `(${s.code})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="text-left md:text-right">
                    <p className="text-xs text-slate-300">Active {getTabTitle()}</p>
                    <p className="text-2xl font-black text-indigo-400">
                        {totalCount} <span className="text-slate-400 text-xs font-normal">Records</span>
                    </p>
                </div>
            </div>

            {/* Separate Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleTabChange("THEORY")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 ${activeTab === "THEORY"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <BookOpen className="w-4 h-4" weight="bold" /> Theory Sessions
                    </button>
                    <button
                        onClick={() => handleTabChange("LAB")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 ${activeTab === "LAB"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <Flask className="w-4 h-4" weight="bold" /> Lab Sessions
                    </button>
                    <button
                        onClick={() => handleTabChange("MINI_PROJECT")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 ${activeTab === "MINI_PROJECT"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <Code className="w-4 h-4" weight="bold" /> Mini Projects
                    </button>
                </div>

                {selectedIds.length > 0 && (
                    <span className="text-xs font-bold text-indigo-600">
                        {selectedIds.length} items selected across list
                    </span>
                )}
            </div>

            {/* Search Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="relative">
                    <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" weight="bold" />
                    <input
                        type="text"
                        placeholder={`Search ${getTabTitle().toLowerCase()} by title, outline, or keywords...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                </div>
            </div>

            {/* DATA TABLE VIEW */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center space-y-3">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                        <p className="text-xs font-bold text-slate-500">Loading {getTabTitle().toLowerCase()}...</p>
                    </div>
                ) : paginatedItems.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-700">No {getTabTitle().toLowerCase()} found</p>
                        <p className="text-xs text-slate-400">Click "Bulk Import" to upload sessions or select another subject.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                    <th className="py-3.5 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isAllVisibleSelected}
                                            onChange={handleToggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </th>
                                    {activeTab !== "MINI_PROJECT" ? (
                                        <>
                                            <th className="py-3.5 px-4 w-28">Session #</th>
                                            <th className="py-3.5 px-4">Title & Subject</th>
                                            <th className="py-3.5 px-4 w-24">Duration</th>
                                            <th className="py-3.5 px-4 max-w-xs">Topics / Content Outline</th>
                                            <th className="py-3.5 px-4">Resources & Links</th>
                                            <th className="py-3.5 px-4 w-24 text-right">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="py-3.5 px-4">Project Title</th>
                                            <th className="py-3.5 px-4 w-32">Language</th>
                                            <th className="py-3.5 px-4">Description</th>
                                            <th className="py-3.5 px-4">Project Spec Link</th>
                                            <th className="py-3.5 px-4 w-24 text-right">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                                {paginatedItems.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}
                                        >
                                            <td className="py-4 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelectRow(item.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </td>

                                            {activeTab !== "MINI_PROJECT" ? (
                                                <>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-extrabold text-slate-700 text-xs border border-slate-200">
                                                            Sess #{item.sessionNumber || "-"}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <div className="space-y-1">
                                                            <div className="font-extrabold text-slate-900 text-sm">
                                                                {item.title}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${item.courseType === "LAB"
                                                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                                                        : "bg-indigo-50 text-indigo-800 border-indigo-200"
                                                                    }`}>
                                                                    {item.courseType}
                                                                </span>
                                                                {item.subject && (
                                                                    <span className="text-[10px] text-slate-400">
                                                                        {item.subject.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-medium">
                                                        {item.duration || "1 Hour"}
                                                    </td>

                                                    <td className="py-4 px-4 max-w-xs">
                                                        {item.topicsOutline ? (
                                                            <div className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line">
                                                                {item.topicsOutline}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 italic text-[11px]">No outline set</span>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.pptResourceUrl && (
                                                                <a
                                                                    href={item.pptResourceUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] inline-flex items-center gap-1 border border-indigo-100 transition-colors"
                                                                >
                                                                    <FileText className="w-3 h-3 text-indigo-600" /> PPT Resource
                                                                </a>
                                                            )}
                                                            {item.pptPublishedUrl && (
                                                                <a
                                                                    href={item.pptPublishedUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] inline-flex items-center gap-1 border border-purple-100 transition-colors"
                                                                >
                                                                    <ArrowSquareOut className="w-3 h-3 text-purple-600" /> Published PPT
                                                                </a>
                                                            )}
                                                            {item.quizLink && (
                                                                <a
                                                                    href={item.quizLink}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-100 transition-colors"
                                                                >
                                                                    <LinkIcon className="w-3 h-3 text-emerald-600" /> Quiz
                                                                </a>
                                                            )}
                                                            {item.activityLink && (
                                                                <a
                                                                    href={item.activityLink}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] inline-flex items-center gap-1 border border-amber-100 transition-colors"
                                                                >
                                                                    <Code className="w-3 h-3 text-amber-600" /> Activity
                                                                </a>
                                                            )}
                                                            {!item.pptResourceUrl && !item.pptPublishedUrl && !item.quizLink && !item.activityLink && (
                                                                <span className="text-slate-300 italic text-[11px]">No links attached</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenModal(item)}
                                                                title="Edit Session"
                                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                                                            >
                                                                <PencilSimple className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSingleClick(item.id, item.title)}
                                                                title="Delete"
                                                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-4 px-4">
                                                        <div className="font-extrabold text-slate-900 text-sm">
                                                            {item.title}
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                                                            {item.language || "Python"}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-4 max-w-sm">
                                                        <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                                                            {item.description || "No description set"}
                                                        </p>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        {item.link ? (
                                                            <a
                                                                href={item.link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <LinkIcon className="w-3.5 h-3.5" /> Project Link
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-300 italic text-[11px]">No link</span>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenModal(item)}
                                                                title="Edit Mini Project"
                                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                                                            >
                                                                <PencilSimple className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSingleClick(item.id, item.title)}
                                                                title="Delete"
                                                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PAGINATION CONTROLS */}
                {!loading && items.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-semibold">
                        <div className="flex items-center gap-3">
                            <span>
                                Showing <strong className="text-slate-900">{((currentPage - 1) * pageSize) + 1}</strong> to{" "}
                                <strong className="text-slate-900">{Math.min(currentPage * pageSize, totalCount)}</strong> of{" "}
                                <strong className="text-slate-900">{totalCount}</strong> entries
                            </span>

                            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                                <span>Rows:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 cursor-pointer"
                            >
                                <CaretLeft className="w-3.5 h-3.5" /> Previous
                            </button>

                            <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 cursor-pointer"
                            >
                                Next <CaretRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-extrabold text-slate-900">
                                {editingItem ? "Edit Entry" : `Create New ${activeTab === "MINI_PROJECT" ? "Mini Project" : activeTab === "LAB" ? "Lab Session" : "Theory Session"}`}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                                <select
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                >
                                    {activeSubjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.code ? `(${s.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {activeTab !== "MINI_PROJECT" ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Session Number</label>
                                            <input
                                                type="number"
                                                value={formData.sessionNumber}
                                                onChange={(e) => setFormData({ ...formData, sessionNumber: e.target.value })}
                                                placeholder="e.g. 1"
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Course Type</label>
                                            <select
                                                value={formData.courseType}
                                                onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            >
                                                <option value="THEORY">Theory</option>
                                                <option value="LAB">Lab</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Session Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder={activeTab === "LAB" ? "e.g. Lab 1: Python Environment Setup" : "e.g. Session 1: Introduction to Python"}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            placeholder={activeTab === "LAB" ? "e.g. 2 Hours" : "e.g. 1 Hour"}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Topics / Content Outline</label>
                                        <textarea
                                            rows={3}
                                            value={formData.topicsOutline}
                                            onChange={(e) => setFormData({ ...formData, topicsOutline: e.target.value })}
                                            placeholder="Topics covered in this session..."
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">PPT Resource URL</label>
                                            <input
                                                type="url"
                                                value={formData.pptResourceUrl}
                                                onChange={(e) => setFormData({ ...formData, pptResourceUrl: e.target.value })}
                                                placeholder="https://docs.google.com/..."
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Published PPT URL</label>
                                            <input
                                                type="url"
                                                value={formData.pptPublishedUrl}
                                                onChange={(e) => setFormData({ ...formData, pptPublishedUrl: e.target.value })}
                                                placeholder="http://tiny.cc/..."
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Link</label>
                                            <input
                                                type="url"
                                                value={formData.quizLink}
                                                onChange={(e) => setFormData({ ...formData, quizLink: e.target.value })}
                                                placeholder="https://forms.gle/..."
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Activity Link</label>
                                            <input
                                                type="url"
                                                value={formData.activityLink}
                                                onChange={(e) => setFormData({ ...formData, activityLink: e.target.value })}
                                                placeholder="https://github.com/..."
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Project Title *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. AI-Powered Chatbot"
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Programming Language</label>
                                            <input
                                                type="text"
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                placeholder="e.g. Python / TypeScript"
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Scope and expectations for this mini project..."
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Project Link (Repository / Doc)</label>
                                        <input
                                            type="url"
                                            value={formData.link}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            placeholder="https://github.com/..."
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                                        />
                                    </div>
                                </>
                            )}

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
                                    className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DEDICATED BULK IMPORT MODAL FOR ACTIVE TAB */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">
                                    Bulk Import {getTabTitle()}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Import {getTabTitle().toLowerCase()} into <strong className="text-indigo-600">{selectedSubjectObj?.name || "Selected Subject"}</strong>
                                </p>
                            </div>
                            <button onClick={() => setShowImportModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Subject Selection Dropdown */}
                            <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-indigo-900">Target Subject for Import</label>
                                    <p className="text-[11px] text-indigo-700 font-medium">Select which academic subject these entries belong to</p>
                                </div>
                                <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-900 focus:outline-none"
                                >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.code ? `(${s.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* File Uploader & Template Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Upload File (.csv, .json)</label>
                                    <input
                                        type="file"
                                        accept=".csv,.json,.txt"
                                        onChange={handleFileUpload}
                                        className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                                    />
                                </div>

                                <div className="flex flex-col justify-center items-start sm:items-end gap-1.5">
                                    <a
                                        href={`/api/admin/syllabus/export?format=template&kind=${activeTab}`}
                                        download={`${activeTab.toLowerCase()}_syllabus_template.csv`}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1.5"
                                    >
                                        <FileCsv className="w-4 h-4 text-indigo-600" /> Download {getTabTitle()} Template CSV
                                    </a>
                                    {activeTab === "THEORY" && (
                                        <button
                                            type="button"
                                            onClick={handleLoadPythonSample}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Sparkle className="w-3.5 h-3.5 text-emerald-600" /> Load 45-Session Python Sample Data
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">CSV / JSON Data Preview:</label>
                                <textarea
                                    rows={8}
                                    value={importJsonText}
                                    onChange={(e) => setImportJsonText(e.target.value)}
                                    placeholder={
                                        activeTab === "MINI_PROJECT"
                                            ? `title,language,description,link\n"Mini Project 1: AI Chatbot","Python","Build a RAG based chatbot","https://github.com/example/rag-bot"`
                                            : activeTab === "LAB"
                                            ? `sessionNumber,title,duration,courseType,topicsOutline,pptResourceUrl,pptPublishedUrl,quizLink,activityLink\n1,"Lab Session 1: Dev Environment Setup","2 Hours","LAB","1. Install Python 3.11\n2. Setup Virtual Environment","https://docs.google.com","","",""`
                                            : `sessionNumber,title,duration,courseType,topicsOutline,pptResourceUrl,pptPublishedUrl,quizLink,activityLink\n1,"Session 1: Introduction to Python","1 Hour","THEORY","Python basics and history","https://docs.google.com","http://tiny.cc","",""`
                                    }
                                    className="w-full p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkImport}
                                disabled={importLoading}
                                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 inline-flex items-center gap-2 cursor-pointer"
                            >
                                {importLoading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                                Process Bulk Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
