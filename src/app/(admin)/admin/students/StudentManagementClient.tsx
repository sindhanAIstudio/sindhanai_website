"use client";

import { useState, useEffect, useCallback } from "react";
import ReusableDataTable, { Column, FilterOption } from "@/components/ui/ReusableDataTable";
import StudentFormModal from "@/components/admin/StudentFormModal";
import StudentProfileModal from "@/components/admin/StudentProfileModal";
import SeniorCsvImporterModal from "@/components/admin/SeniorCsvImporterModal";
import ConfirmationModal, { ConfirmationModalProps } from "@/components/ui/ConfirmationModal";
import ToastNotification, { ToastProps } from "@/components/ui/ToastNotification";
import {
    PencilSimple,
    Trash,
    ArrowClockwise,
    FilePdf,
    SealCheck,
    Flask,
    Briefcase,
    Plus,
    X,
    Eye,
    GraduationCap,
    BookmarkSimple,
    DeviceMobile,
} from "@phosphor-icons/react";

interface StudentManagementClientProps {
    session: any;
    metadata: {
        departments: any[];
        batches: any[];
        classGroups: any[];
        slotTimings: any[];
        soiDomains: any[];
        domainPlacements: any[];
        interestedRoles: any[];
    };
}

export default function StudentManagementClient({
    session,
    metadata,
}: StudentManagementClientProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [isTrashView, setIsTrashView] = useState(false);

    // Selection State for Bulk Domain Placement Assignment
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [targetPlacementId, setTargetPlacementId] = useState("");
    const [bulkUpdating, setBulkUpdating] = useState(false);

    // Active filters
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        departmentId: "",
        batchId: "",
        classGroupId: "",
        slotTimingId: "",
        soiDomainId: "",
        domainPlacementId: "",
        yearOfPassing: "",
    });

    // Modal Visibility States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any | null>(null);
    const [profileStudent, setProfileStudent] = useState<any | null>(null);
    const [isImporterOpen, setIsImporterOpen] = useState(false);

    // Endorse Skill Drawer state
    const [endorseStudent, setEndorseStudent] = useState<any | null>(null);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("AI/ML");

    // Fetch students list
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                search,
                trash: isTrashView ? "true" : "false",
            });

            if (activeFilters.departmentId) params.append("departmentId", activeFilters.departmentId);
            if (activeFilters.batchId) params.append("batchId", activeFilters.batchId);
            if (activeFilters.classGroupId) params.append("classGroupId", activeFilters.classGroupId);
            if (activeFilters.slotTimingId) params.append("slotTimingId", activeFilters.slotTimingId);
            if (activeFilters.soiDomainId) params.append("soiDomainId", activeFilters.soiDomainId);
            if (activeFilters.domainPlacementId) params.append("domainPlacementId", activeFilters.domainPlacementId);
            if (activeFilters.yearOfPassing) params.append("yearOfPassing", activeFilters.yearOfPassing);

            const res = await fetch(`/api/admin/students?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setStudents(data.data || []);
                setTotalCount(data.pagination?.total || 0);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error("Failed to fetch students:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, isTrashView, activeFilters]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Modal & Toast States
    const [confirmModalConfig, setConfirmModalConfig] = useState<Omit<ConfirmationModalProps, "isOpen" | "onClose"> | null>(null);
    const [toastConfig, setToastConfig] = useState<Omit<ToastProps, "onClose"> | null>(null);

    const showToast = (type: "success" | "error" | "info", title: string, message?: string) => {
        setToastConfig({ type, title, message });
    };

    // Handle Soft Delete or Restore with clean ConfirmationModal
    const promptSoftDelete = (student: any, restore: boolean = false) => {
        setConfirmModalConfig({
            title: restore ? "Restore Student Profile?" : "Move Student to Trash?",
            description: restore
                ? `Are you sure you want to restore ${student.name}'s profile to active directory?`
                : `Are you sure you want to move ${student.name}'s profile to trash? It can be restored anytime.`,
            variant: restore ? "info" : "warning",
            confirmText: restore ? "Restore Student" : "Move to Trash",
            onConfirm: async () => {
                setConfirmModalConfig(null);
                executeSoftDelete(student.id, student.name, restore);
            },
        });
    };

    const executeSoftDelete = async (studentId: string, name: string, restore: boolean = false) => {
        try {
            const res = await fetch(`/api/admin/students/${studentId}?restore=${restore ? "true" : "false"}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                showToast(
                    restore ? "success" : "info",
                    restore ? "Profile Restored" : "Moved to Trash",
                    `${name}'s profile has been ${restore ? "restored to active directory" : "moved to trash"}.`
                );
                fetchStudents();
            } else {
                showToast("error", "Action Failed", data.error || "Failed to update student profile status.");
            }
        } catch (err) {
            console.error("Action error:", err);
            showToast("error", "Network Error", "Unable to connect to server.");
        }
    };

    // Instructor skill endorsement submit
    const handleAddSkillEndorsement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!endorseStudent || !newSkillName.trim()) return;

        try {
            const res = await fetch(`/api/admin/students/${endorseStudent.id}/endorse-skill`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skillName: newSkillName.trim(), category: newSkillCategory }),
            });

            if (res.ok) {
                setNewSkillName("");
                fetchStudents();
                setEndorseStudent(null);
            }
        } catch (err) {
            console.error("Skill endorsement failed:", err);
        }
    };

    // Filter Options definition
    const filterOptions: FilterOption[] = [
        {
            key: "batchId",
            label: "Batch",
            options: (metadata.batches || []).map((b) => ({ label: `${b.name} (${b.code || ""})`, value: b.id })),
        },
        {
            key: "yearOfPassing",
            label: "Year of Passing",
            options: [
                { label: "2024", value: "2024" },
                { label: "2025", value: "2025" },
                { label: "2026", value: "2026" },
                { label: "2027", value: "2027" },
            ],
        },
        {
            key: "soiDomainId",
            label: "SOI Lab / Domain",
            options: metadata.soiDomains.map((s) => ({ label: s.name, value: s.id })),
        },
        {
            key: "domainPlacementId",
            label: "Domain Placement",
            options: metadata.domainPlacements.map((d) => ({ label: d.name, value: d.id })),
        },
        {
            key: "departmentId",
            label: "Department",
            options: metadata.departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })),
        },
        {
            key: "classGroupId",
            label: "Section",
            options: metadata.classGroups.map((c) => ({ label: c.name, value: c.id })),
        },
        {
            key: "slotTimingId",
            label: "Slot Timing",
            options: metadata.slotTimings.map((s) => ({ label: s.name, value: s.id })),
        },
    ];

    // Handle Bulk Domain Placement Submission
    const handleBulkPlacement = async () => {
        if (selectedStudentIds.length === 0) return;
        setBulkUpdating(true);
        try {
            const res = await fetch("/api/admin/students/bulk-placement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentIds: selectedStudentIds,
                    domainPlacementId: targetPlacementId || null,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast("success", "Bulk Placement Updated", data.message);
                setSelectedStudentIds([]);
                setIsBulkModalOpen(false);
                fetchStudents();
            } else {
                showToast("error", "Update Failed", data.error || "Failed to assign domain placement.");
            }
        } catch (err) {
            console.error("Bulk placement error:", err);
            showToast("error", "Network Error", "Failed to connect to server.");
        } finally {
            setBulkUpdating(false);
        }
    };

    // Columns Definition
    const columns: Column<any>[] = [
        {
            header: (
                <input
                    type="checkbox"
                    checked={students.length > 0 && selectedStudentIds.length === students.length}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedStudentIds(students.map((s) => s.id));
                        } else {
                            setSelectedStudentIds([]);
                        }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
            ),
            cell: (item) => (
                <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(item.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedStudentIds((prev) => [...prev, item.id]);
                        } else {
                            setSelectedStudentIds((prev) => prev.filter((id) => id !== item.id));
                        }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
            ),
        },
        {
            header: "Student Profile",
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => setProfileStudent(item)}
                        className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        {item.profilePicUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.profilePicUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-indigo-600 bg-indigo-50">
                                {item.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => setProfileStudent(item)}
                            className="font-bold text-slate-900 text-xs hover:text-indigo-600 hover:underline text-left cursor-pointer"
                        >
                            {item.name}
                        </button>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[11px] text-slate-400 font-mono">{item.rollNumber || "No Roll"}</p>
                            {item.statusNote && (
                                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5 max-w-[140px] truncate" title={item.statusNote}>
                                    <BookmarkSimple className="w-3 h-3 text-amber-600 shrink-0" /> {item.statusNote}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Emails",
            cell: (item) => (
                <div>
                    <p className="text-xs text-slate-800 font-medium">{item.email}</p>
                    <p className="text-[11px] text-slate-400">{item.personalEmail || "—"}</p>
                </div>
            ),
        },
        {
            header: "SOI Lab & Placement",
            cell: (item) => (
                <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <Flask className="w-3 h-3 text-sky-600" /> {item.soiDomain?.name || "Unallocated"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <Briefcase className="w-3 h-3 text-purple-600" /> {item.domainPlacement?.name || "General Track"}
                    </span>
                </div>
            ),
        },
        {
            header: "Department & Batch",
            cell: (item) => (
                <div>
                    <p className="text-xs font-semibold text-slate-800">{item.department?.code || "—"} ({item.classGroup?.name || "—"})</p>
                    <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3 h-3" /> Batch: {item.batch?.name || `${item.yearOfPassing ? item.yearOfPassing - 4 : ""}-${item.yearOfPassing || "N/A"}`}
                    </p>
                </div>
            ),
        },
        {
            header: "Academics",
            cell: (item) => (
                <div className="text-xs">
                    <p className="font-bold text-indigo-600">CGPA: {item.currentCgpa || "—"}</p>
                    <p className="text-[10px] text-slate-400">10th: {item.tenthPercentage || "—"}% | 12th: {item.twelfthPercentage || "—"}%</p>
                </div>
            ),
        },
        {
            header: "Device Status",
            cell: (item) => (
                item.deviceFingerprint ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-bold inline-flex items-center gap-1" title={item.deviceFingerprint}>
                        <DeviceMobile className="w-3.5 h-3.5 text-emerald-600" />
                        {item.deviceFingerprint}
                    </span>
                ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-mono font-bold inline-flex items-center gap-1">
                        <ArrowClockwise className="w-3.5 h-3.5 text-amber-600" />
                        Unbound / Reset
                    </span>
                )
            ),
        },
        {
            header: "Resume",
            cell: (item) => (
                item.resumeUrl ? (
                    <a
                        href={item.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-rose-100 transition-colors"
                    >
                        <FilePdf className="w-3.5 h-3.5" /> Resume
                    </a>
                ) : (
                    <span className="text-slate-400 text-xs italic">No Resume</span>
                )
            ),
        },
        {
            header: "Actions",
            cell: (item) => (
                <div className="flex items-center gap-1">
                    {!isTrashView ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setProfileStudent(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
                                title="View Full Profile Modal"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingStudent(item);
                                    setIsFormModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                title="Edit Student Profile"
                            >
                                <PencilSimple className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setEndorseStudent(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                                title="Endorse Technical Skill"
                            >
                                <SealCheck className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!confirm(`Reset device lock for ${item.name}? This will allow them to register a new phone on their next scan.`)) return;
                                    try {
                                        const res = await fetch(`/api/admin/students/${item.id}`, { method: "PATCH" });
                                        const data = await res.json();
                                        if (res.ok) {
                                            showToast("success", "Device Reset", `Device lock reset for ${item.name}.`);
                                            fetchStudents();
                                        } else {
                                            showToast("error", "Reset Failed", data.error || "Failed to reset device.");
                                        }
                                    } catch {
                                        showToast("error", "Error", "Failed to reset device lock.");
                                    }
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors cursor-pointer"
                                title="Reset Bound Device (Allow New Phone Registration)"
                            >
                                <DeviceMobile className="w-4 h-4 text-amber-600" />
                            </button>
                            <button
                                type="button"
                                onClick={() => promptSoftDelete(item, false)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Soft Delete (Move to Trash)"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => promptSoftDelete(item, true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-100 cursor-pointer"
                        >
                            <ArrowClockwise className="w-3.5 h-3.5" /> Restore
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <ReusableDataTable
                title="Student Profile & Directory Engine"
                subtitle="Manage student onboardings, academic tracking, SOI labs, domain placements, and skill endorsements."
                data={students}
                columns={columns}
                loading={loading}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                onSearchChange={(query) => {
                    setSearch(query);
                    setCurrentPage(1);
                }}
                filters={filterOptions}
                activeFilters={activeFilters}
                onFilterChange={(key, val) => {
                    setActiveFilters((prev) => ({ ...prev, [key]: val }));
                    setCurrentPage(1);
                }}
                isTrashView={isTrashView}
                onToggleTrashView={(trash) => {
                    setIsTrashView(trash);
                    setCurrentPage(1);
                }}
                onAddClick={() => {
                    setEditingStudent(null);
                    setIsFormModalOpen(true);
                }}
                onExportCSV={() => showToast("info", "Export CSV", "Student directory CSV export initialized.")}
                onImportCSV={async () => {
                    setIsImporterOpen(true);
                    return { successCount: 0, failCount: 0, errors: [] };
                }}
            />

            {/* Student Profile Modal */}
            <StudentProfileModal
                isOpen={!!profileStudent}
                onClose={() => setProfileStudent(null)}
                student={profileStudent}
                onEdit={(studentToEdit) => {
                    setEditingStudent(studentToEdit);
                    setIsFormModalOpen(true);
                }}
            />

            {/* Student Add / Edit Form Modal */}
            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                editingStudent={editingStudent}
                metadata={metadata}
                onSaveSuccess={fetchStudents}
            />

            {/* Senior Developer CSV Importer Modal */}
            <SeniorCsvImporterModal
                isOpen={isImporterOpen}
                onClose={() => setIsImporterOpen(false)}
                metadata={metadata}
                onImportSuccess={fetchStudents}
            />

            {/* Confirmation Modal */}
            {confirmModalConfig && (
                <ConfirmationModal
                    isOpen={!!confirmModalConfig}
                    onClose={() => setConfirmModalConfig(null)}
                    {...confirmModalConfig}
                />
            )}

            {/* Toast Notification */}
            {toastConfig && (
                <ToastNotification
                    type={toastConfig.type}
                    title={toastConfig.title}
                    message={toastConfig.message}
                    onClose={() => setToastConfig(null)}
                />
            )}

            {/* Skill Endorsement Drawer */}
            {endorseStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
                    <div className="w-full max-w-md bg-white h-full border-l border-slate-200 p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Skill Endorsement Console</h2>
                                    <p className="text-xs text-slate-500">Instructor endorsement for {endorseStudent.name}</p>
                                </div>
                                <button type="button" onClick={() => setEndorseStudent(null)} className="p-1 text-slate-400 hover:text-slate-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddSkillEndorsement} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700">Technical Skill Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                        placeholder="e.g. PyTorch / Next.js / Docker"
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700">Skill Category</label>
                                    <select
                                        value={newSkillCategory}
                                        onChange={(e) => setNewSkillCategory(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                    >
                                        <option value="AI/ML">AI & Machine Learning</option>
                                        <option value="Languages">Programming Languages</option>
                                        <option value="Frameworks">Web & System Frameworks</option>
                                        <option value="DevOps">Cloud & DevOps</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <SealCheck className="w-4 h-4" /> Endorse Skill as Instructor
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Selection Bar for Bulk Domain Placement */}
            {selectedStudentIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-xs font-semibold">
                        <span className="bg-indigo-500 text-white px-2 py-0.5 rounded-md font-bold mr-2">
                            {selectedStudentIds.length} Selected
                        </span>
                        Students Selected for Mass Assignment
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsBulkModalOpen(true)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                            <Briefcase className="w-4 h-4" /> Bulk Assign Domain Placement
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedStudentIds([])}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Domain Placement Selection Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-600" /> Bulk Placement Assignment
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Assigning domain placement to <span className="font-bold text-indigo-600">{selectedStudentIds.length} selected students</span>.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBulkModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-700">Target Domain Placement Track</label>
                            <select
                                value={targetPlacementId}
                                onChange={(e) => setTargetPlacementId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                            >
                                <option value="">-- Clear / Unallocated Placement Track --</option>
                                {metadata.domainPlacements.map((dp) => (
                                    <option key={dp.id} value={dp.id}>
                                        {dp.name} ({dp.code})
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-500 italic">
                                Note: Selecting unallocated will remove the placement tag for all {selectedStudentIds.length} students.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsBulkModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={bulkUpdating}
                                onClick={handleBulkPlacement}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                            >
                                {bulkUpdating ? "Applying Changes..." : `Update ${selectedStudentIds.length} Students`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
