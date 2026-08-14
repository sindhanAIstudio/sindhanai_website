"use client";

import { useState } from "react";
import { X, CircleNotch, CheckCircle, PaperPlaneRight } from "@phosphor-icons/react";

interface EventRegistrationModalProps {
    event: {
        id: string;
        title: string;
        date: string;
        time: string;
        venue: string;
    };
    onClose: () => void;
}

export default function EventRegistrationModal({
    event,
    onClose,
}: EventRegistrationModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        role: "Student",
        additionalInfo: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/events/${event.id}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 relative border border-slate-800 bg-[#0b0f1a]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {submitted ? (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Registration Confirmed!</h3>
                        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                            You are registered for <strong>{event.title}</strong>. A confirmation reference has been recorded in our lab database.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-xs font-bold text-white rounded-xl sindhanai-gradient-bg"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/20">
                                Event Registration
                            </span>
                            <h3 className="text-xl font-bold text-white mt-1 leading-snug">{event.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                {event.date} • {event.time} • {event.venue}
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 text-xs rounded-xl bg-red-950/40 text-red-400 border border-red-800">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dr. Rajesh Kumar"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 mb-1 font-semibold">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="rajesh@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1 font-semibold">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 mb-1 font-semibold">Institution / Org *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="KGISL Institute of Tech"
                                        value={formData.institution}
                                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1 font-semibold">Role *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                        <option value="Industry Professional">Industry Professional</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 text-xs font-bold text-white rounded-xl sindhanai-gradient-bg shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <CircleNotch className="w-4 h-4 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Registration <PaperPlaneRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
}
