"use client";

import { useState } from "react";
import { CheckCircle, CircleNotch, PaperPlaneRight } from "@phosphor-icons/react";

interface DynamicFormRendererProps {
    customForm?: {
        id: string;
        title: string;
        description: string | null;
        fields: string;
    } | null;
}

export default function DynamicFormRenderer({ customForm }: DynamicFormRendererProps) {
    const [formData, setFormData] = useState<Record<string, string>>({
        name: "",
        email: "",
        phone: "",
        subject: "Project Inquiry",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    let dynamicFields: any[] = [];
    if (customForm?.fields) {
        try {
            dynamicFields = JSON.parse(customForm.fields);
        } catch (e) {
            console.error("Failed to parse dynamic form fields JSON", e);
        }
    }

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/forms/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formId: customForm?.id || null,
                    name: formData.name || formData.fullName || "Anonymous",
                    email: formData.email || "",
                    data: formData,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Submission failed");

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-slate-800 bg-[#0b0f1a]">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Message Received!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to SindhanAI. Our team will review your message and get back to you shortly.
                </p>
                <div className="pt-4">
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({ name: "", email: "", phone: "", subject: "Project Inquiry", message: "" });
                        }}
                        className="px-6 py-2.5 text-xs font-bold text-white rounded-xl sindhanai-gradient-bg"
                    >
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6 bg-[#0b0f1a]">
            <div>
                <h3 className="text-2xl font-bold text-white">
                    {customForm?.title || "Start a Conversation"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                    {customForm?.description ||
                        "Fill out the form below for project inquiries, institutional training, or general questions."}
                </p>
            </div>

            {error && (
                <div className="p-3 text-xs rounded-xl bg-red-950/40 text-red-400 border border-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {dynamicFields.length > 0 ? (
                    dynamicFields.map((field: any) => (
                        <div key={field.name}>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                {field.label} {field.required && "*"}
                            </label>

                            {field.type === "textarea" ? (
                                <textarea
                                    required={field.required}
                                    rows={4}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    placeholder={field.placeholder || ""}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            ) : field.type === "select" ? (
                                <select
                                    required={field.required}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="">Select an option...</option>
                                    {field.options?.map((opt: string) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    required={field.required}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    placeholder={field.placeholder || ""}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g. Dr. Rajesh Kumar"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="rajesh@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Inquiry Type *
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => handleChange("subject", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-indigo-500"
                            >
                                <option value="Project Inquiry">AI / Software Project Inquiry</option>
                                <option value="Training Program">Faculty / Student Training Program</option>
                                <option value="Institutional Partnership">Institutional Partnership</option>
                                <option value="General Inquiry">General Question</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Project / Inquiry Details *
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.message}
                                onChange={(e) => handleChange("message", e.target.value)}
                                placeholder="Briefly describe your objectives, timeline, or requirements..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>
                    </>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 text-xs font-bold text-white rounded-xl sindhanai-gradient-bg shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <CircleNotch className="w-4 h-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            <>
                                Send Message <PaperPlaneRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
