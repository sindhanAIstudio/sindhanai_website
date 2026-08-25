"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    MagnifyingGlass,
    Trash,
    ArrowCounterClockwise,
    PencilSimple,
    Eye,
    UserCheck,
    Flask,
    Funnel,
    User,
    Envelope,
    Phone,
    Briefcase,
    GraduationCap,
    DeviceMobile,
    Check,
} from "@phosphor-icons/react";
import InstructorFormModal from "@/components/admin/InstructorFormModal";
import InstructorProfileModal from "@/components/admin/InstructorProfileModal";

interface InstructorManagementClientProps {
    metadata: {
        soiDomains: { id: string; name: string }[];
        departments: { id: string; name: string }[];
    };
}

export default function InstructorManagementClient({ metadata }: InstructorManagementClientProps) {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [instructorType, setInstructorType] = useState("");
    const [soiDomainId, setSoiDomainId] = useState("");
    const [trashView, setTrashView] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1 });

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<any | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [viewingInstructor, setViewingInstructor] = useState<any | null>(null);

    // Toast Notification
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const fetchInstructors = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (instructorType) params.set("instructorType", instructorType);
            if (soiDomainId) params.set("soiDomainId", soiDomainId);
            if (trashView) params.set("trash", "true");
            params.set("page", page.toString());
            params.set("limit", "10");

            const res = await fetch(`/api/admin/instructors?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setInstructors(data.data || []);
                setPagination(data.pagination || { total: 0, totalPages: 1 });
            }
        } catch (error) {
            console.error("Failed to load instructors:", error);
        } finally {
            setLoading(false);
        }
    }, [search, instructorType, soiDomainId, trashView, page]);

    useEffect(() => {
        fetchInstructors();
    }, [fetchInstructors]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Reset Bound Device Fingerprint
    const handleResetDevice = async (instructor: any) => {
        if (!confirm(`Are you sure you want to reset the bound hardware device for ${instructor.name}? This will allow them to scan from a new phone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/instructors/${instructor.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resetDevice: true }),
            });

            if (res.ok) {
                showToast(`Bound device for ${instructor.name} was successfully reset.`);
                fetchInstructors();
            } else {
                alert("Failed to reset device fingerprint.");
            }
        } catch (error) {
            console.error("Reset device error:", error);
        }
    };

    // Soft Delete / Restore
    const handleToggleDelete = async (id: string, restore: boolean) => {
        const actionText = restore ? "restore" : "move to trash";
        if (!confirm(`Are you sure you want to ${actionText} this instructor?`)) return;

        try {
            const res = await fetch(`/api/admin/instructors/${id}?restore=${restore}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast(`Instructor ${restore ? "restored" : "moved to trash"} successfully.`);
                fetchInstructors();
            }
        } catch (error) {
            console.error("Delete/Restore error:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Banner */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Instructor Directory</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold">
                            {pagination.total} Total
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Manage faculty profiles, domain allocations, and device registrations
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setTrashView(!trashView)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${trashView
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <Trash className="w-4 h-4" />
                        <span>{trashView ? "Viewing Trash" : "Trash Bin"}</span>
                    </button>

                    <button
                        onClick={() => {
                            setEditingInstructor(null);
                            setIsFormOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Instructor</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by instructor name, email, designation..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                </div>

                {/* Faculty Type Filter */}
                <select
                    value={instructorType}
                    onChange={(e) => {
                        setInstructorType(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600 transition-all w-full md:w-44"
                >
                    <option value="">All Faculty Types</option>
                    <option value="SOI">SOI Staff (Internal)</option>
                    <option value="Scope">Scope Faculty (External)</option>
                </select>

                {/* SOI Lab Filter */}
                <select
                    value={soiDomainId}
                    onChange={(e) => {
                        setSoiDomainId(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600 transition-all w-full md:w-52"
                >
                    <option value="">All SOI Labs</option>
                    {metadata.soiDomains?.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Directory Cards / Table */}
            {loading ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-slate-500">Loading instructor records...</p>
                </div>
            ) : instructors.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
                    <User className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-extrabold text-slate-800">No Instructors Found</h3>
                    <p className="text-xs text-slate-500">
                        {trashView ? "Trash bin is currently empty." : "Try adjusting your search query or filters."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {instructors.map((instructor) => {
                        const isScope = instructor.instructorType === "Scope";

                        return (
                            <div
                                key={instructor.id}
                                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                            >
                                {/* Top Header Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                                        {instructor.profilePicUrl ? (
                                            <img
                                                src={instructor.profilePicUrl}
                                                alt={instructor.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-7 h-7 text-slate-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                                {instructor.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {instructor.role?.name === "ADMIN" && (
                                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                                                        System Admin
                                                    </span>
                                                )}
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${isScope
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-indigo-100 text-indigo-800"
                                                        }`}
                                                >
                                                    {isScope ? "Scope Faculty" : "SOI Staff"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs font-semibold text-slate-500 truncate">
                                            {instructor.designation || "Instructor"}
                                        </p>

                                        <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1">
                                            <Envelope className="w-3.5 h-3.5 text-slate-400" />
                                            {instructor.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Allocation Badges */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">SOI Lab</p>
                                        <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">
                                            {instructor.soiDomain?.name || "Unassigned"}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                                        <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">
                                            {instructor.experienceYears ? `${instructor.experienceYears} Years` : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    {/* Bound Device Status */}
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                        <DeviceMobile className={`w-4 h-4 ${instructor.deviceFingerprint ? "text-emerald-500" : "text-slate-300"}`} />
                                        <span className="font-semibold text-slate-500">
                                            {instructor.deviceFingerprint ? "Device Bound" : "No Device Bound"}
                                        </span>
                                        {instructor.deviceFingerprint && (
                                            <button
                                                onClick={() => handleResetDevice(instructor)}
                                                title="Reset Device Binding"
                                                className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold transition-colors ml-1"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setViewingInstructor(instructor);
                                                setIsProfileOpen(true);
                                            }}
                                            title="View Profile"
                                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {!trashView && (
                                            <button
                                                onClick={() => {
                                                    setEditingInstructor(instructor);
                                                    setIsFormOpen(true);
                                                }}
                                                title="Edit Profile"
                                                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            >
                                                <PencilSimple className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleToggleDelete(instructor.id, trashView)}
                                            title={trashView ? "Restore Instructor" : "Move to Trash"}
                                            className={`p-2 rounded-xl transition-colors ${trashView
                                                ? "text-emerald-600 hover:bg-emerald-50"
                                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                }`}
                                        >
                                            {trashView ? <ArrowCounterClockwise className="w-4 h-4" /> : <Trash className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs font-semibold text-slate-600">
                    <span>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <InstructorFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchInstructors}
                editingInstructor={editingInstructor}
                metadata={metadata}
            />

            <InstructorProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                instructor={viewingInstructor}
            />
        </div>
    );
}
