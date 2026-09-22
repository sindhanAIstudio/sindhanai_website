"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    DownloadSimple,
    Eye,
    PaperPlaneTilt,
    Sparkle,
    Spinner,
    Clock,
    Globe,
} from "@phosphor-icons/react";

interface SubmissionItem {
    id: string;
    name: string | null;
    email: string | null;
    responses: string;
    requestIp: string | null;
    userAgent: string | null;
    createdAt: string;
}

interface FormDetails {
    id: string;
    title: string;
    slug: string;
    description: string | null;
}

export default function FormSubmissionsConsoleClient({ formId }: { formId: string }) {
    const [form, setForm] = useState<FormDetails | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, [formId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/forms/${formId}/submissions`);
            const data = await res.json();
            if (res.ok) {
                setForm(data.form);
                setSubmissions(data.submissions || []);
            }
        } catch (err) {
            console.error("Failed to load submissions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCsv = () => {
        window.open(`/api/admin/forms/${formId}/submissions?format=csv`, "_blank");
    };

    const filteredSubmissions = submissions.filter((s) => {
        const query = search.toLowerCase();
        const nameMatch = s.name?.toLowerCase().includes(query) || false;
        const emailMatch = s.email?.toLowerCase().includes(query) || false;
        const responseMatch = s.responses.toLowerCase().includes(query);
        return nameMatch || emailMatch || responseMatch;
    });

    return (
        <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/forms"
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900">
                            Submissions Console: {form?.title || "Form Responses"}
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">
                            /forms/{form?.slug || "loading"} • Total Entries: {submissions.length}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleExportCsv}
                    disabled={submissions.length === 0}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                    <DownloadSimple className="w-4 h-4" />
                    <span>Export CSV Spreadsheet</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or response key..."
                    className="w-full md:w-80 h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
                <span className="text-xs text-slate-500 font-mono hidden md:block">
                    Showing {filteredSubmissions.length} of {submissions.length} responses
                </span>
            </div>

            {/* Responses Data Table */}
            {loading ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                    <Spinner className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Loading form submissions...</p>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <PaperPlaneTilt className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">No Responses Found</h3>
                        <p className="text-xs text-slate-500">
                            Submissions will appear here when users submit the public form.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-4 px-6">Respondent</th>
                                    <th className="py-4 px-6">Submitted Date & Time</th>
                                    <th className="py-4 px-6">IP Address</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6 space-y-0.5">
                                            <div className="font-extrabold text-slate-900 text-sm">
                                                {sub.name || "Anonymous Respondent"}
                                            </div>
                                            <div className="text-[11px] text-indigo-600 font-mono">
                                                {sub.email || "No Email Specified"}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 text-slate-600 font-mono">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{new Date(sub.createdAt).toLocaleString()}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 text-slate-600 font-mono text-[11px]">
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{sub.requestIp || "127.0.0.1"}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => setSelectedSubmission(sub)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200 transition-all text-xs cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                                <span>Inspect Response</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Submission Details Inspector */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Sparkle className="w-5 h-5" />
                                <h3 className="text-base font-extrabold text-slate-900">Submission Entry Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                            <div>
                                <span className="text-slate-500">Submitted At:</span>
                                <p className="text-slate-900 font-bold">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <span className="text-slate-500">IP Address:</span>
                                <p className="text-indigo-600 font-bold">{selectedSubmission.requestIp || "127.0.0.1"}</p>
                            </div>
                        </div>

                        {/* Extracted Fields Table */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Field Responses</h4>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden divide-y divide-slate-200 text-xs">
                                {(() => {
                                    try {
                                        const parsed = JSON.parse(selectedSubmission.responses);
                                        return Object.entries(parsed).map(([key, val]) => (
                                            <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <span className="font-extrabold text-indigo-600 font-mono text-[11px] shrink-0">
                                                    {key}:
                                                </span>
                                                <span className="font-medium text-slate-900 break-all text-right">
                                                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                                </span>
                                            </div>
                                        ));
                                    } catch {
                                        return <div className="p-4 text-rose-600">Failed to parse response JSON</div>;
                                    }
                                })()}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
