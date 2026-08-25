"use client";

import {
    X,
    User,
    Envelope,
    Phone,
    Flask,
    Briefcase,
    GraduationCap,
    Clock,
    LinkedinLogo,
    GithubLogo,
    SealCheck,
    Calendar,
    ChalkboardTeacher,
} from "@phosphor-icons/react";

interface InstructorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    instructor: any | null;
}

export default function InstructorProfileModal({
    isOpen,
    onClose,
    instructor,
}: InstructorProfileModalProps) {
    if (!isOpen || !instructor) return null;

    const isScope = instructor.instructorType === "Scope";

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Profile Banner */}
                <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-6 shrink-0 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 flex items-center justify-center shadow-xl">
                            {instructor.profilePicUrl ? (
                                <img src={instructor.profilePicUrl} alt={instructor.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white/60" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h2 className="text-xl font-black tracking-tight">{instructor.name}</h2>
                                <span
                                    className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold shadow-sm ${isScope
                                            ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                                            : "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
                                        }`}
                                >
                                    {isScope ? "Scope Faculty" : "SOI Staff"}
                                </span>
                            </div>

                            <p className="text-xs font-semibold text-indigo-200/80">{instructor.designation || "Instructor"}</p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-300 pt-1">
                                <span className="flex items-center gap-1.5">
                                    <Envelope className="w-4 h-4 text-indigo-400" />
                                    {instructor.email}
                                </span>
                                {instructor.mobileNumber && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-emerald-400" />
                                        {instructor.mobileNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* SECTION 1: KEY METRICS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/80">
                            <p className="text-[11px] font-bold text-indigo-800 uppercase flex items-center gap-1">
                                <Flask className="w-4 h-4 text-indigo-600" /> SOI Lab Domain
                            </p>
                            <p className="text-xs font-extrabold text-indigo-950 mt-1">
                                {instructor.soiDomain?.name || "Unassigned"}
                            </p>
                        </div>

                        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                            <p className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                                <GraduationCap className="w-4 h-4 text-emerald-600" /> Department
                            </p>
                            <p className="text-xs font-extrabold text-emerald-950 mt-1">
                                {instructor.department?.name || "General"}
                            </p>
                        </div>

                        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                            <p className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Clock className="w-4 h-4 text-amber-600" /> Total Experience
                            </p>
                            <p className="text-xs font-extrabold text-amber-950 mt-1">
                                {instructor.experienceYears ? `${instructor.experienceYears} Years` : "Not Specified"}
                            </p>
                        </div>
                    </div>

                    {/* SECTION 2: BIO & SPECIALIZATION */}
                    {instructor.bio && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                Specialization & Bio
                            </h3>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 leading-relaxed">
                                {instructor.bio}
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: CONTACT & SOCIAL PROFILES */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                            Contact Details & Social Footprint
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                                <p className="font-bold text-slate-900 flex items-center gap-2">
                                    <Envelope className="w-4 h-4 text-indigo-600" /> Contact Emails
                                </p>
                                <div className="space-y-1 font-semibold text-slate-600">
                                    <p>Institutional: <span className="text-slate-900 font-bold">{instructor.email}</span></p>
                                    <p>Personal: <span className="text-slate-900 font-bold">{instructor.personalEmail || "N/A"}</span></p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                                <p className="font-bold text-slate-900 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-emerald-600" /> Developer Profiles
                                </p>
                                <div className="flex items-center gap-3 pt-1">
                                    {instructor.linkedinUrl ? (
                                        <a
                                            href={instructor.linkedinUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                        >
                                            <LinkedinLogo className="w-4 h-4" /> LinkedIn
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 font-medium">No LinkedIn</span>
                                    )}

                                    {instructor.githubUrl ? (
                                        <a
                                            href={instructor.githubUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                        >
                                            <GithubLogo className="w-4 h-4" /> GitHub
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 font-medium">No GitHub</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: RECENT CLASSROOM SESSIONS */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Recent Classroom Sessions</span>
                            <span className="text-indigo-600 font-bold text-[11px]">
                                Total Taught: {instructor.classroomSessions?.length || 0}
                            </span>
                        </h3>

                        {instructor.classroomSessions && instructor.classroomSessions.length > 0 ? (
                            <div className="space-y-2">
                                {instructor.classroomSessions.map((session: any) => (
                                    <div
                                        key={session.id}
                                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                <ChalkboardTeacher className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{session.title}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">
                                                    {new Date(session.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${session.status === "ACTIVE"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-slate-200 text-slate-700"
                                                }`}
                                        >
                                            {session.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400 font-medium">
                                No active classroom sessions recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0 text-xs text-slate-500 font-medium">
                    <span>Instructor ID: <code className="text-slate-800 font-bold">{instructor.id.slice(0, 8)}</code></span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-colors"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
