"use client";

import {
    X,
    User,
    Envelope,
    Phone,
    GraduationCap,
    Flask,
    Briefcase,
    CalendarCheck,
    FilePdf,
    Globe,
    SealCheck,
    PencilSimple,
    ArrowSquareOut,
    CheckCircle,
    XCircle,
    Building,
    BookmarkSimple,
    Hash,
} from "@phosphor-icons/react";

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any | null;
    onEdit?: (student: any) => void;
}

export default function StudentProfileModal({
    isOpen,
    onClose,
    student,
    onEdit,
}: StudentProfileModalProps) {
    if (!isOpen || !student) return null;

    const isDeleted = !!student.deletedAt;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {student.profilePicUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={student.profilePicUrl} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-white/70" />
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-xl font-extrabold text-white tracking-tight">{student.name}</h2>
                                {isDeleted ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold flex items-center gap-1">
                                        <XCircle className="w-3.5 h-3.5" /> Trashed
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> Active Enrolled
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-indigo-200 mt-1 font-mono flex items-center gap-3">
                                <span>Roll: {student.rollNumber || "N/A"}</span>
                                <span>•</span>
                                <span>Reg: {student.registrationNumber || "N/A"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onEdit && !isDeleted && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEdit(student);
                                }}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <PencilSimple className="w-4 h-4" /> Edit Profile
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8 overflow-y-auto space-y-6 flex-1">
                    {/* Status Note Banner if available */}
                    {student.statusNote && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                            <BookmarkSimple className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">Status Note / Remark:</span> {student.statusNote}
                            </div>
                        </div>
                    )}

                    {/* GRID SECTION 1: ACADEMIC & INSTITUTIONAL ALLOCATION METADATA */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                            1. Institutional Metadata Allocations
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                                <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Building className="w-3.5 h-3.5 text-indigo-600" /> Department
                                </p>
                                <p className="text-xs font-bold text-slate-900 mt-1">{student.department?.name || "Unassigned"}</p>
                                {student.department?.code && <p className="text-[10px] text-indigo-600 font-mono mt-0.5">{student.department.code}</p>}
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                                <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Batch
                                </p>
                                <p className="text-xs font-bold text-slate-900 mt-1">{student.batch?.name || `${student.yearOfPassing ? student.yearOfPassing - 4 : ""}-${student.yearOfPassing || "Unassigned"}`}</p>
                                {student.batch?.code && <p className="text-[10px] text-indigo-600 font-mono mt-0.5">{student.batch.code}</p>}
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                                <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Hash className="w-3.5 h-3.5 text-indigo-600" /> Section / Class Group
                                </p>
                                <p className="text-xs font-bold text-slate-900 mt-1">{student.classGroup?.name || "Unassigned"}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                                <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" /> Slot Timing
                                </p>
                                <p className="text-xs font-bold text-slate-900 mt-1">{student.slotTiming?.name || "Unassigned"}</p>
                            </div>
                        </div>
                    </div>

                    {/* GRID SECTION 2: SOI LAB & CAREER PLACEMENT TRACK */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                            2. SOI Lab & Career Tracks
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200/80">
                                <p className="text-[11px] font-bold text-sky-800 uppercase flex items-center gap-1">
                                    <Flask className="w-4 h-4 text-sky-600" /> SOI Lab / SOI Domain
                                </p>
                                <p className="text-xs font-extrabold text-sky-950 mt-1">{student.soiDomain?.name || "Not Allocated"}</p>
                            </div>

                            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80">
                                <p className="text-[11px] font-bold text-purple-800 uppercase flex items-center gap-1">
                                    <Briefcase className="w-4 h-4 text-purple-600" /> Domain Placement Track
                                </p>
                                <p className="text-xs font-extrabold text-purple-950 mt-1">{student.domainPlacement?.name || "General Track"}</p>
                            </div>

                            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                                <p className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                                    <SealCheck className="w-4 h-4 text-emerald-600" /> Interested Role
                                </p>
                                <p className="text-xs font-extrabold text-emerald-950 mt-1">{student.interestedRole?.name || "Not Specified"}</p>
                            </div>
                        </div>
                    </div>

                    {/* GRID SECTION 3: CONTACT & ACADEMIC PERFORMANCE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Details */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                3. Contact & Location
                            </h3>
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 flex items-center gap-1.5"><Envelope className="w-4 h-4 text-indigo-500" /> Institutional Email</span>
                                    <span className="font-bold text-slate-900">{student.email}</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 flex items-center gap-1.5"><Envelope className="w-4 h-4 text-slate-400" /> Personal Email</span>
                                    <span className="font-bold text-slate-800">{student.personalEmail || "N/A"}</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-4 h-4 text-emerald-500" /> Mobile Number</span>
                                    <span className="font-bold text-slate-900">{student.mobileNumber || "N/A"}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Residential Status</span>
                                    <span className="font-semibold text-slate-800">{student.residentialStatus || "Dayscholar"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Academics & Resume */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                4. Academic Metrics & Documents
                            </h3>
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                                <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-slate-100">
                                    <div className="p-2 rounded-xl bg-indigo-50/50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Current CGPA</p>
                                        <p className="text-sm font-extrabold text-indigo-700 mt-0.5">{student.currentCgpa || "N/A"}</p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">10th Percentage</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{student.tenthPercentage ? `${student.tenthPercentage}%` : "N/A"}</p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">12th Percentage</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{student.twelfthPercentage ? `${student.twelfthPercentage}%` : "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-slate-500 font-medium">Resume Document</span>
                                    {student.resumeUrl ? (
                                        <a
                                            href={student.resumeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
                                        >
                                            <FilePdf className="w-4 h-4 text-rose-600" /> Open PDF <ArrowSquareOut className="w-3.5 h-3.5" />
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 italic">No Resume Uploaded</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: INSTRUCTOR ENDORSED TECHNICAL SKILLS */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                            5. Endorsed Technical Skills ({student.skills?.length || 0})
                        </h3>
                        {student.skills && student.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {student.skills.map((skill: any, idx: number) => (
                                    <div
                                        key={skill.id || idx}
                                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-1.5"
                                    >
                                        <SealCheck className="w-4 h-4 text-indigo-600" />
                                        <span>{skill.skillName}</span>
                                        {skill.endorsedByInstructor && (
                                            <span className="text-[10px] text-indigo-600 bg-white px-1.5 py-0.5 rounded-md font-medium">
                                                By {skill.endorsedByInstructor.name}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No instructor skill endorsements recorded yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
