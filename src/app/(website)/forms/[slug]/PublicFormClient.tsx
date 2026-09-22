"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DynamicFormRenderer, { FormFieldSchema } from "@/components/DynamicFormRenderer";
import {
    CheckCircle,
    XCircle,
    Spinner,
    ArrowLeft,
    FileText,
    ChartBar,
    Exam,
} from "@phosphor-icons/react";

interface FormSchemaDetails {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    type?: string;
    fields: string;
}

export default function PublicFormClient({ slug }: { slug: string }) {
    const [formDetails, setFormDetails] = useState<FormSchemaDetails | null>(null);
    const [fields, setFields] = useState<FormFieldSchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        fetchPublicForm();
    }, [slug]);

    const fetchPublicForm = async () => {
        try {
            const res = await fetch(`/api/forms/${slug}`);
            const data = await res.json();

            if (!res.ok || data.error) {
                setErrorMsg(data.error || "Form not found or currently inactive");
            } else {
                setFormDetails(data);
                if (data.fields) {
                    try {
                        const parsed = typeof data.fields === "string" ? JSON.parse(data.fields) : data.fields;
                        if (Array.isArray(parsed)) {
                            setFields(parsed);
                        } else if (parsed && Array.isArray(parsed.components)) {
                            const mapped: FormFieldSchema[] = parsed.components.map((c: any) => ({
                                id: c.key || `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                type: c.type === "textfield" ? "text" : c.type === "button" ? "header" : c.type || "text",
                                label: c.label || "Untitled Field",
                                placeholder: c.placeholder || "",
                                description: c.description || "",
                                required: !!c.validate?.required,
                                options: c.values ? c.values.map((v: any) => v.label || v.value) : c.options || [],
                                correctAnswer: c.correctAnswer,
                                points: c.points,
                                explanation: c.explanation,
                            }));
                            setFields(mapped);
                        }
                    } catch {
                        setErrorMsg("Invalid form configuration schema");
                    }
                }
            }
        } catch (err: any) {
            setErrorMsg("Network error loading dynamic form");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData: Record<string, any>) => {
        setSubmitting(true);
        setErrorMsg("");

        try {
            const res = await fetch(`/api/forms/${slug}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: formData }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitted(true);
            } else {
                setErrorMsg(data.error || "Failed to submit responses");
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Network error submitting responses");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
                <div className="space-y-3 text-center">
                    <Spinner className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Loading Portal...</p>
                </div>
            </div>
        );
    }

    if (errorMsg && !formDetails) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-900">Module Unavailable</h2>
                        <p className="text-xs text-slate-500">{errorMsg}</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Homepage</span>
                    </Link>
                </div>
            </div>
        );
    }

    const typeName = (formDetails?.type || "form").toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Dynamic Background Glow Effect */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center space-y-3 border-b border-slate-100 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto">
                        {typeName === "POLL" ? (
                            <ChartBar className="w-6 h-6 text-purple-600" />
                        ) : typeName === "QUIZ" ? (
                            <Exam className="w-6 h-6 text-amber-600" />
                        ) : (
                            <FileText className="w-6 h-6 text-indigo-600" />
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-2xl font-black text-slate-900">{formDetails?.title}</h1>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${typeName === "POLL"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : typeName === "QUIZ"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}>
                            {typeName}
                        </span>
                    </div>
                    {formDetails?.description && (
                        <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">{formDetails.description}</p>
                    )}
                </div>

                {/* Submission Success Screen (For Forms) */}
                {submitted && typeName === "FORM" ? (
                    <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900">Submitted Successfully!</h2>
                            <p className="text-xs text-slate-500">
                                Thank you for submitting your responses. Your submission has been securely recorded.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                window.location.reload();
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                        >
                            <span>Submit Another Response</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {errorMsg && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Native Tailwind Dynamic Form Renderer (Form / Poll / Quiz) */}
                        <DynamicFormRenderer
                            fields={fields}
                            formType={(formDetails?.type as any) || "form"}
                            onSubmit={handleFormSubmit}
                            submitting={submitting}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
