"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    MagnifyingGlass,
    Trash,
    ArrowCounterClockwise,
    PencilSimple,
    Eye,
    ShieldCheck,
    Flask,
    User,
    Envelope,
    Phone,
    Briefcase,
    GraduationCap,
    DeviceMobile,
    Check,
    ArrowUpRight,
    UserSwitch,
    X,
} from "@phosphor-icons/react";

interface AdminManagementClientProps {
    metadata: {
        soiDomains: { id: string; name: string }[];
        departments: { id: string; name: string }[];
        instructors: { id: string; name: string; email: string; designation: string | null; soiDomainId: string | null }[];
    };
}

export default function AdminManagementClient({ metadata }: AdminManagementClientProps) {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [soiDomainId, setSoiDomainId] = useState("");
    const [trashView, setTrashView] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1 });

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isPromoteOpen, setIsPromoteOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
    const [promoteSearch, setPromoteSearch] = useState("");

    // Form state
    const [selectedInstructorId, setSelectedInstructorId] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        personalEmail: "",
        mobileNumber: "",
        designation: "Lab Administrator",
        instructorType: "SOI",
        soiDomainId: "",
        departmentId: "",
        experienceYears: "",
        bio: "",
        profilePicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
        linkedinUrl: "",
        githubUrl: "",
        statusNote: "",
        password: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (soiDomainId) params.set("soiDomainId", soiDomainId);
            if (trashView) params.set("trash", "true");
            params.set("page", page.toString());
            params.set("limit", "10");

            const res = await fetch(`/api/admin/admins?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setAdmins(data.data || []);
                setPagination(data.pagination || { total: 0, totalPages: 1 });
            }
        } catch (error) {
            console.error("Failed to load admins:", error);
        } finally {
            setLoading(false);
        }
    }, [search, soiDomainId, trashView, page]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            personalEmail: "",
            mobileNumber: "",
            designation: "Lab Administrator",
            instructorType: "SOI",
            soiDomainId: "",
            departmentId: "",
            experienceYears: "",
            bio: "",
            profilePicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
            linkedinUrl: "",
            githubUrl: "",
            statusNote: "",
            password: "",
        });
        setEditingAdmin(null);
        setSelectedInstructorId("");
    };

    // Create / Edit Admin Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingAdmin ? `/api/admin/admins/${editingAdmin.id}` : "/api/admin/admins";
            const method = editingAdmin ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                showToast(editingAdmin ? "Admin record updated successfully!" : "New Lab Admin created successfully!");
                setIsCreateOpen(false);
                resetForm();
                fetchAdmins();
            } else {
                alert(data.error || "Operation failed.");
            }
        } catch (err) {
            console.error("Admin form submit error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Promote Instructor Submit
    const handlePromoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInstructorId) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "PROMOTE",
                    instructorId: selectedInstructorId,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast(data.message || "Instructor promoted to Admin!");
                setIsPromoteOpen(false);
                resetForm();
                fetchAdmins();
            } else {
                alert(data.error || "Promotion failed.");
            }
        } catch (err) {
            console.error("Promote error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Demote Admin to Instructor
    const handleDemote = async (admin: any) => {
        if (!confirm(`Demote ${admin.name} back to Instructor role?`)) return;

        try {
            const res = await fetch(`/api/admin/admins/${admin.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "DEMOTE" }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast(data.message || "Admin demoted to Instructor.");
                fetchAdmins();
            } else {
                alert(data.error || "Demotion failed.");
            }
        } catch (err) {
            console.error("Demote error:", err);
        }
    };

    // Delete / Restore
    const handleToggleDelete = async (id: string, restore: boolean) => {
        const actionText = restore ? "restore" : "move to trash";
        if (!confirm(`Are you sure you want to ${actionText} this admin?`)) return;

        try {
            const res = await fetch(`/api/admin/admins/${id}?restore=${restore}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast(`Admin ${restore ? "restored" : "moved to trash"} successfully.`);
                fetchAdmins();
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
                        <span>Lab Administrator Directory</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                            {pagination.total} Admins
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Super Admin Controls: Manage Lab Admins, assign SOI Labs, or promote Instructors to Admin role
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPromoteOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2"
                    >
                        <UserSwitch className="w-4 h-4" />
                        <span>Promote Instructor</span>
                    </button>

                    <button
                        onClick={() => {
                            resetForm();
                            setIsCreateOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create New Admin</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by Admin name, email, designation..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                </div>

                <select
                    value={soiDomainId}
                    onChange={(e) => {
                        setSoiDomainId(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600 transition-all w-full md:w-60"
                >
                    <option value="">All SOI Labs</option>
                    {metadata.soiDomains?.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Directory Grid */}
            {loading ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-slate-500">Loading administrator directory...</p>
                </div>
            ) : admins.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-extrabold text-slate-800">No Administrators Found</h3>
                    <p className="text-xs text-slate-500">Create a new Lab Admin or promote an instructor above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {admins.map((admin) => (
                        <div
                            key={admin.id}
                            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                                    {admin.profilePicUrl ? (
                                        <img src={admin.profilePicUrl} alt={admin.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShieldCheck className="w-7 h-7 text-amber-600" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {admin.name}
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                                            Lab Admin
                                        </span>
                                    </div>

                                    <p className="text-xs font-semibold text-slate-500 truncate">
                                        {admin.designation || "Lab Administrator"}
                                    </p>

                                    <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1">
                                        <Envelope className="w-3.5 h-3.5 text-slate-400" />
                                        {admin.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned SOI Lab</p>
                                    <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">
                                        {admin.soiDomain?.name || "Global / Unassigned"}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                                    <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">
                                        {admin.department?.name || "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <button
                                    onClick={() => handleDemote(admin)}
                                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                                >
                                    Demote to Instructor
                                </button>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingAdmin(admin);
                                            setFormData({
                                                name: admin.name || "",
                                                email: admin.email || "",
                                                personalEmail: admin.personalEmail || "",
                                                mobileNumber: admin.mobileNumber || "",
                                                designation: admin.designation || "Lab Administrator",
                                                instructorType: admin.instructorType || "SOI",
                                                soiDomainId: admin.soiDomainId || "",
                                                departmentId: admin.departmentId || "",
                                                experienceYears: admin.experienceYears ? String(admin.experienceYears) : "",
                                                bio: admin.bio || "",
                                                profilePicUrl: admin.profilePicUrl || "",
                                                linkedinUrl: admin.linkedinUrl || "",
                                                githubUrl: admin.githubUrl || "",
                                                statusNote: admin.statusNote || "",
                                                password: "",
                                            });
                                            setIsCreateOpen(true);
                                        }}
                                        title="Edit Admin"
                                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        <PencilSimple className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleToggleDelete(admin.id, trashView)}
                                        title="Move to Trash"
                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Admin Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">
                                    {editingAdmin ? "Edit Lab Administrator" : "Create New Lab Administrator"}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Full instructor-equivalent fields for Lab Admins
                                </p>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-10 px-3.5 mt-1 rounded-xl bg-slate-50 border text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700">Login Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full h-10 px-3.5 mt-1 rounded-xl bg-slate-50 border text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700">Assigned SOI Lab</label>
                                    <select
                                        value={formData.soiDomainId}
                                        onChange={(e) => setFormData({ ...formData, soiDomainId: e.target.value })}
                                        className="w-full h-10 px-3.5 mt-1 rounded-xl bg-slate-50 border text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                    >
                                        <option value="">Select Lab...</option>
                                        {metadata.soiDomains.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700">Department</label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full h-10 px-3.5 mt-1 rounded-xl bg-slate-50 border text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                    >
                                        <option value="">Select Department...</option>
                                        {metadata.departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700">Designation</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full h-10 px-3.5 mt-1 rounded-xl bg-slate-50 border text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700">Mobile Number</label>
                                    <input
                                        type="text"
                                        value={formData.mobileNumber}
                                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                        placeholder="+91 9876543210"
                                        className="w-full h-10 px-3.5 mt-1 rounded-xl bg-slate-50 border text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : editingAdmin ? "Update Admin" : "Create Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Promote Instructor Modal */}
            {isPromoteOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Promote Instructor to Admin</h2>
                                <p className="text-xs text-slate-500 font-medium">Select an existing instructor to elevate to Lab Admin</p>
                            </div>
                            <button onClick={() => setIsPromoteOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePromoteSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700">Search & Select Instructor *</label>
                                <div className="relative mt-1">
                                    <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={promoteSearch}
                                        onChange={(e) => setPromoteSearch(e.target.value)}
                                        placeholder="Search instructor by name, email, designation..."
                                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600 mb-2"
                                    />
                                </div>
                                <select
                                    required
                                    value={selectedInstructorId}
                                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border text-xs font-semibold focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="">Choose Instructor...</option>
                                    {metadata.instructors
                                        .filter((inst) => {
                                            if (!promoteSearch.trim()) return true;
                                            const q = promoteSearch.toLowerCase();
                                            return (
                                                inst.name.toLowerCase().includes(q) ||
                                                inst.email.toLowerCase().includes(q) ||
                                                (inst.designation && inst.designation.toLowerCase().includes(q))
                                            );
                                        })
                                        .map((inst) => (
                                            <option key={inst.id} value={inst.id}>
                                                {inst.name} ({inst.email}) — {inst.designation || "Instructor"}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsPromoteOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedInstructorId}
                                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-extrabold shadow-md hover:bg-amber-600 disabled:opacity-50"
                                >
                                    {submitting ? "Promoting..." : "Promote to Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
