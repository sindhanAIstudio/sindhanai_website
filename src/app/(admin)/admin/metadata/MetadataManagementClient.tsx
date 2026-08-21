"use client";

import { useState } from "react";
import {
    Buildings,
    UsersThree,
    Clock,
    Flask,
    Briefcase,
    GraduationCap,
    Target,
    PencilSimple,
    Trash,
    MagnifyingGlass,
    X,
    Warning,
    CaretRight,
    ArrowClockwise,
    ToggleLeft,
    ToggleRight,
} from "@phosphor-icons/react";
import ConfirmationModal, { ConfirmationModalProps } from "@/components/ui/ConfirmationModal";
import ToastNotification, { ToastProps } from "@/components/ui/ToastNotification";

interface MetadataManagementClientProps {
    initialData: {
        departments: any[];
        classGroups: any[];
        slotTimings: any[];
        soiDomains: any[];
        domainPlacements: any[];
        batches: any[];
        interestedRoles: any[];
    };
}

type MetadataCategory =
    | "departments"
    | "classGroups"
    | "slotTimings"
    | "soiDomains"
    | "domainPlacements"
    | "batches"
    | "interestedRoles";

type StatusTab = "active" | "inactive" | "trashed";

export default function MetadataManagementClient({
    initialData,
}: MetadataManagementClientProps) {
    const [metadata, setMetadata] = useState(initialData);
    const [activeDrawer, setActiveDrawer] = useState<MetadataCategory | null>(null);
    const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Form state inside drawer
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formName, setFormName] = useState("");
    const [formCode, setFormCode] = useState("");
    const [formStartYear, setFormStartYear] = useState("2021");
    const [formEndYear, setFormEndYear] = useState("2025");
    const [formIsActive, setFormIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Custom Modal & Toast States
    const [confirmModalConfig, setConfirmModalConfig] = useState<Omit<ConfirmationModalProps, "isOpen" | "onClose"> | null>(null);
    const [toastConfig, setToastConfig] = useState<Omit<ToastProps, "onClose"> | null>(null);

    const showToast = (type: "success" | "error" | "info", title: string, message?: string) => {
        setToastConfig({ type, title, message });
    };

    const categoriesConfig: Record<
        MetadataCategory,
        {
            title: string;
            description: string;
            icon: any;
            color: string;
            namePlaceholder: string;
            codePlaceholder: string;
            codeRequired: boolean;
        }
    > = {
        departments: {
            title: "Departments",
            description: "Institutional academic departments (CSE, IT, ECE, AI&DS)",
            icon: Buildings,
            color: "text-indigo-600 bg-indigo-50 border-indigo-200",
            namePlaceholder: "e.g. Computer Science & Engineering",
            codePlaceholder: "e.g. CSE (Unique Code Mandatory)",
            codeRequired: true,
        },
        classGroups: {
            title: "Class Groups / Sections",
            description: "Academic student sections and cohort divisions",
            icon: UsersThree,
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
            namePlaceholder: "e.g. Section A",
            codePlaceholder: "e.g. CLASS_A (Unique Code Mandatory)",
            codeRequired: true,
        },
        slotTimings: {
            title: "Slot Timings",
            description: "Lab and session shift timing slots",
            icon: Clock,
            color: "text-amber-600 bg-amber-50 border-amber-200",
            namePlaceholder: "e.g. Morning Slot A (09:00 AM - 11:00 AM)",
            codePlaceholder: "e.g. SLOT_MORNING_A (Unique Code Mandatory)",
            codeRequired: true,
        },
        soiDomains: {
            title: "SOI Domains / SOI Labs",
            description: "Specialized SindhanAI AI & Technology labs",
            icon: Flask,
            color: "text-sky-600 bg-sky-50 border-sky-200",
            namePlaceholder: "e.g. AI & Data Science Lab",
            codePlaceholder: "e.g. LAB_AI_DS (Unique Code Mandatory)",
            codeRequired: true,
        },
        domainPlacements: {
            title: "Domain Placements",
            description: "Career placement domains & target profiles",
            icon: Briefcase,
            color: "text-purple-600 bg-purple-50 border-purple-200",
            namePlaceholder: "e.g. Product Engineering Track",
            codePlaceholder: "e.g. TRACK_PROD_ENG (Unique Code Mandatory)",
            codeRequired: true,
        },
        batches: {
            title: "Batches / Academic Years",
            description: "Institutional graduation batches & passing years",
            icon: GraduationCap,
            color: "text-rose-600 bg-rose-50 border-rose-200",
            namePlaceholder: "e.g. Batch 2021-2025",
            codePlaceholder: "e.g. BATCH_2021_2025 (Unique Code Mandatory)",
            codeRequired: true,
        },
        interestedRoles: {
            title: "Interested Roles",
            description: "Aspirational student career target tracks",
            icon: Target,
            color: "text-teal-600 bg-teal-50 border-teal-200",
            namePlaceholder: "e.g. Full Stack AI Engineer",
            codePlaceholder: "e.g. ROLE_FULLSTACK (Unique Code Mandatory)",
            codeRequired: true,
        },
    };

    const openDrawer = (catKey: MetadataCategory) => {
        setActiveDrawer(catKey);
        setActiveStatusTab("active");
        setSearchQuery("");
        setCurrentPage(1);
        resetForm();
        refreshMetadata(catKey, "all");
    };

    // Inline field validation errors
    const [nameError, setNameError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [yearError, setYearError] = useState<string | null>(null);

    const resetForm = () => {
        setEditingItem(null);
        setFormName("");
        setFormCode("");
        setFormStartYear("2023");
        setFormEndYear("2027");
        setFormIsActive(true);
        setErrorMsg(null);
        setNameError(null);
        setCodeError(null);
        setYearError(null);
    };

    const startEdit = (item: any) => {
        setEditingItem(item);
        setFormName(item.name || "");
        const fallbackCode = item.code || (item.startYear ? `BATCH_${item.startYear}_${item.endYear}` : item.name.toUpperCase().replace(/[^A-Z0-9_]/g, "_"));
        setFormCode(fallbackCode);
        setFormStartYear(item.startYear ? item.startYear.toString() : "2023");
        setFormEndYear(item.endYear ? item.endYear.toString() : "2027");
        setFormIsActive(item.isActive !== false);
        setErrorMsg(null);
        setNameError(null);
        setCodeError(null);
        setYearError(null);
    };

    const refreshMetadata = async (catKey: MetadataCategory, status: string = "all") => {
        try {
            const res = await fetch(`/api/admin/metadata?category=${catKey}&status=${status}`);
            const data = await res.json();
            if (res.ok) {
                setMetadata((prev) => ({ ...prev, [catKey]: data.data || [] }));
            }
        } catch (err) {
            console.error("Refresh failed:", err);
        }
    };

    const handleStatusTabChange = (tab: StatusTab) => {
        setActiveStatusTab(tab);
        setCurrentPage(1);
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeDrawer) return;

        setNameError(null);
        setCodeError(null);
        setYearError(null);
        setErrorMsg(null);

        let isValid = true;

        const trimmedName = formName.trim();
        if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
            setNameError("Display Name must be 2 to 100 characters");
            isValid = false;
        }

        const trimmedCode = formCode.toUpperCase().trim().replace(/[^A-Z0-9_]/g, "_");
        if (!trimmedCode || trimmedCode.length < 2 || trimmedCode.length > 20) {
            setCodeError("Unique Code must be 2 to 20 uppercase alphanumeric characters/underscores");
            isValid = false;
        }

        let sYear = parseInt(formStartYear);
        let eYear = parseInt(formEndYear);

        if (activeDrawer === "batches") {
            if (isNaN(sYear) || sYear < 2015 || sYear > 2099) {
                setYearError("Start Year must be between 2015 and 2099");
                isValid = false;
            } else if (isNaN(eYear) || eYear < 2016 || eYear > 2100) {
                setYearError("End Year must be between 2016 and 2100");
                isValid = false;
            } else if (eYear <= sYear) {
                setYearError("End Year must be greater than Start Year");
                isValid = false;
            } else if (eYear - sYear > 6) {
                setYearError("Batch duration cannot exceed 6 years");
                isValid = false;
            }
        }

        if (!isValid) return;

        setSaving(true);

        try {
            const payload = {
                category: activeDrawer,
                id: editingItem?.id,
                name: trimmedName,
                code: trimmedCode,
                startYear: sYear,
                endYear: eYear,
                isActive: formIsActive,
            };

            const res = await fetch("/api/admin/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || "Failed to save record");
                showToast("error", "Save Failed", data.error || "Could not save metadata record.");
                return;
            }

            showToast(
                "success",
                editingItem ? "Record Updated" : "Record Created",
                `Successfully saved ${trimmedName}`
            );
            resetForm();
            refreshMetadata(activeDrawer, "all");
        } catch {
            setErrorMsg("Network error saving metadata");
            showToast("error", "Network Error", "Unable to connect to server.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (item: any) => {
        if (!activeDrawer) return;
        const newStatus = !item.isActive;

        setMetadata((prev) => ({
            ...prev,
            [activeDrawer]: prev[activeDrawer].map((it: any) =>
                it.id === item.id ? { ...it, isActive: newStatus } : it
            ),
        }));

        try {
            const res = await fetch("/api/admin/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: activeDrawer,
                    id: item.id,
                    isActive: newStatus,
                    action: "toggle-status",
                }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast(
                    "info",
                    `Status Changed to ${newStatus ? "Active" : "Inactive"}`,
                    `${item.name} is now ${newStatus ? "Active" : "Inactive"}.`
                );
            } else {
                showToast("error", "Action Blocked", data.error || "Failed to update status.");
                refreshMetadata(activeDrawer, "all");
            }
        } catch (err) {
            console.error("Toggle status failed:", err);
            refreshMetadata(activeDrawer, "all");
        }
    };

    const promptSoftDelete = (item: any) => {
        if (!activeDrawer) return;
        setConfirmModalConfig({
            title: "Move to Trash?",
            description: `Are you sure you want to soft delete "${item.name}"? It will be moved to the Trashed tab and can be restored anytime.`,
            variant: "warning",
            confirmText: "Move to Trash",
            onConfirm: async () => {
                setConfirmModalConfig(null);
                executeSoftDelete(item.id, item.name);
            },
        });
    };

    const executeSoftDelete = async (id: string, name: string) => {
        if (!activeDrawer) return;

        setMetadata((prev) => ({
            ...prev,
            [activeDrawer]: prev[activeDrawer].map((it: any) =>
                it.id === id ? { ...it, deletedAt: new Date().toISOString(), isActive: false } : it
            ),
        }));

        try {
            const res = await fetch(`/api/admin/metadata?category=${activeDrawer}&id=${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                showToast("info", "Moved to Trash", `"${name}" was moved to Trashed tab.`);
            } else {
                showToast("error", "Soft Delete Failed", data.error || "Failed to soft delete record.");
                refreshMetadata(activeDrawer, "all");
            }
        } catch (err) {
            console.error("Soft delete failed:", err);
            refreshMetadata(activeDrawer, "all");
        }
    };

    const handleRestoreItem = async (id: string, name: string) => {
        if (!activeDrawer) return;

        setMetadata((prev) => ({
            ...prev,
            [activeDrawer]: prev[activeDrawer].map((it: any) =>
                it.id === id ? { ...it, deletedAt: null, isActive: true } : it
            ),
        }));

        try {
            const res = await fetch("/api/admin/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: activeDrawer,
                    id,
                    action: "restore",
                }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast("success", "Record Restored", `"${name}" restored to Active tab.`);
            } else {
                showToast("error", "Restore Failed", data.error || "Failed to restore record.");
                refreshMetadata(activeDrawer, "all");
            }
        } catch (err) {
            console.error("Restore failed:", err);
            refreshMetadata(activeDrawer, "all");
        }
    };

    // Filter & Paginate items STRICTLY by tab status & search query
    const getDrawerItems = () => {
        if (!activeDrawer) return [];
        const rawList = metadata[activeDrawer] || [];
        const query = searchQuery.toLowerCase();

        return rawList.filter((item: any) => {
            if (activeStatusTab === "active") {
                if (item.deletedAt || item.isActive === false) return false;
            } else if (activeStatusTab === "inactive") {
                if (item.deletedAt || item.isActive !== false) return false;
            } else if (activeStatusTab === "trashed") {
                if (!item.deletedAt) return false;
            }

            if (!query) return true;
            return (
                item.name.toLowerCase().includes(query) ||
                (item.code && item.code.toLowerCase().includes(query))
            );
        });
    };

    const drawerItems = getDrawerItems();
    const totalPages = Math.ceil(drawerItems.length / itemsPerPage) || 1;
    const paginatedItems = drawerItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getActiveCount = (catKey: MetadataCategory) => {
        const list = metadata[catKey] || [];
        return list.filter((it: any) => !it.deletedAt && it.isActive !== false).length;
    };

    return (
        <div className="space-y-6">
            {/* Header Title */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Metadata Console</h1>
                <p className="text-xs text-slate-500">Configure departments, sections, slot timings, SOI labs, domain placements, and graduation batches.</p>
            </div>

            {/* Metadata Category Cards Grid (Clean layout without item preview list as requested) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(Object.keys(categoriesConfig) as MetadataCategory[]).map((catKey) => {
                    const cat = categoriesConfig[catKey];
                    const Icon = cat.icon;
                    const activeCount = getActiveCount(catKey);

                    return (
                        <div
                            key={catKey}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-xl border ${cat.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                                        {activeCount} Active Records
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{cat.title}</h3>
                                    <p className="text-xs text-slate-500">{cat.description}</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => openDrawer(catKey)}
                                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <span>Manage {cat.title}</span>
                                <CaretRight className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* SIDE DRAWER MODAL FOR CATEGORY MANAGEMENT */}
            {activeDrawer && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
                    <div className="w-full max-w-lg bg-white h-full border-l border-slate-200 p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
                        <div className="space-y-6">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 capitalize">
                                        Manage {categoriesConfig[activeDrawer].title}
                                    </h2>
                                    <p className="text-xs text-slate-500">Create, edit, toggle active status, soft-delete, or restore items.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveDrawer(null)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Create / Edit Form Box (only when in active tab) */}
                            {activeStatusTab === "active" && (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-800">
                                            {editingItem ? `Edit Record: ${editingItem.name}` : `Add New ${categoriesConfig[activeDrawer].title}`}
                                        </p>
                                        {editingItem && (
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                                            >
                                                + Clear Edit Form
                                            </button>
                                        )}
                                    </div>

                                    {errorMsg && (
                                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-1.5">
                                            <Warning className="w-4 h-4 text-rose-600 shrink-0" />
                                            <span>{errorMsg}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSaveItem} className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700">Display Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formName}
                                                onChange={(e) => setFormName(e.target.value)}
                                                placeholder={categoriesConfig[activeDrawer].namePlaceholder}
                                                className={`w-full px-3 py-1.5 rounded-xl bg-white border text-xs focus:outline-none focus:border-indigo-600 ${nameError ? "border-rose-400 bg-rose-50/30" : "border-slate-200"}`}
                                            />
                                            {nameError && <p className="text-[10px] font-semibold text-rose-600 mt-0.5">{nameError}</p>}
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700">
                                                Unique Code * (Mandatory)
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formCode}
                                                onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                                                placeholder={categoriesConfig[activeDrawer].codePlaceholder}
                                                className={`w-full px-3 py-1.5 rounded-xl bg-white border text-xs focus:outline-none focus:border-indigo-600 font-mono ${codeError ? "border-rose-400 bg-rose-50/30" : "border-slate-200"}`}
                                            />
                                            {codeError && <p className="text-[10px] font-semibold text-rose-600 mt-0.5">{codeError}</p>}
                                        </div>

                                        {activeDrawer === "batches" && (
                                            <div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700">Start Year * (2015-2099)</label>
                                                        <input
                                                            type="number"
                                                            min={2015}
                                                            max={2099}
                                                            value={formStartYear}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormStartYear(val);
                                                                if (val && formEndYear) {
                                                                    setFormName(`${val}-${formEndYear}`);
                                                                    setFormCode(`BATCH_${val}_${formEndYear}`);
                                                                }
                                                            }}
                                                            placeholder="2023"
                                                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700">End Year * (2016-2100)</label>
                                                        <input
                                                            type="number"
                                                            min={2016}
                                                            max={2100}
                                                            value={formEndYear}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormEndYear(val);
                                                                if (formStartYear && val) {
                                                                    setFormName(`${formStartYear}-${val}`);
                                                                    setFormCode(`BATCH_${formStartYear}_${val}`);
                                                                }
                                                            }}
                                                            placeholder="2027"
                                                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                                        />
                                                    </div>
                                                </div>
                                                {yearError && <p className="text-[10px] font-semibold text-rose-600 mt-1">{yearError}</p>}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                                        >
                                            {saving ? "Saving Record..." : editingItem ? "Update Record" : "Create Record"}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* 3 STATUS SEPARATE TABS: ACTIVE | INACTIVE | TRASHED */}
                            <div className="space-y-3">
                                <div className="flex border-b border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => handleStatusTabChange("active")}
                                        className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeStatusTab === "active"
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        Active ({metadata[activeDrawer]?.filter((it: any) => !it.deletedAt && it.isActive !== false).length || 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusTabChange("inactive")}
                                        className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeStatusTab === "inactive"
                                            ? "border-amber-600 text-amber-600"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        Inactive ({metadata[activeDrawer]?.filter((it: any) => !it.deletedAt && it.isActive === false).length || 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusTabChange("trashed")}
                                        className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeStatusTab === "trashed"
                                            ? "border-rose-600 text-rose-600"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        Trashed ({metadata[activeDrawer]?.filter((it: any) => Boolean(it.deletedAt)).length || 0})
                                    </button>
                                </div>

                                {/* Search Bar inside list */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-800 capitalize">
                                        {activeStatusTab} Records ({drawerItems.length})
                                    </h3>
                                    <div className="relative w-44">
                                        <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                        <input
                                            type="text"
                                            placeholder="Search items..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                </div>

                                {/* Items List Rendering */}
                                {paginatedItems.length > 0 ? (
                                    <div className="space-y-2">
                                        {paginatedItems.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                                                        {activeStatusTab !== "trashed" && (
                                                            <span
                                                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${item.isActive !== false
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                                                    }`}
                                                            >
                                                                {item.isActive !== false ? "Active" : "Inactive"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 font-mono">
                                                        {item.code || (item.startYear ? `${item.startYear} - ${item.endYear}` : `ID: ${item.id.substring(0, 8)}`)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {activeStatusTab !== "trashed" ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleStatus(item)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                                title={item.isActive !== false ? "Switch to Inactive" : "Switch to Active"}
                                                            >
                                                                {item.isActive !== false ? (
                                                                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                                                                ) : (
                                                                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => startEdit(item)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <PencilSimple className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => promptSoftDelete(item)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                                                title="Soft Delete (Move to Trash)"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRestoreItem(item.id, item.name)}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-100 cursor-pointer"
                                                            title="Restore to Active"
                                                        >
                                                            <ArrowClockwise className="w-3.5 h-3.5" /> Restore
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center py-6">No {activeStatusTab} records found.</p>
                                )}
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-[11px] text-slate-500">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CUSTOM REUSABLE CONFIRMATION MODAL */}
            {confirmModalConfig && (
                <ConfirmationModal
                    isOpen={true}
                    {...confirmModalConfig}
                    onClose={() => setConfirmModalConfig(null)}
                />
            )}

            {/* CUSTOM FLOATING TOAST NOTIFICATION */}
            {toastConfig && (
                <ToastNotification
                    {...toastConfig}
                    onClose={() => setToastConfig(null)}
                />
            )}
        </div>
    );
}
