"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, CheckCircle, Warning, ArrowRight } from "@phosphor-icons/react";

export default function SetupPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/setup-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to update password.");
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/admin");
                }, 1500);
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
                        <Image src="/logo.png" alt="Logo" width={28} height={28} className="brightness-0 invert object-contain" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Set Your Permanent Password</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Welcome to SindhanAI Hub! Please set a secure password for your account to complete onboarding.
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                        <Warning className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-2">
                        <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto animate-bounce" />
                        <p>Password updated successfully!</p>
                        <p className="text-[11px] text-emerald-600 font-medium">Redirecting to your dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-slate-700 block">New Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter at least 6 characters"
                                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-slate-700 block">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your new password"
                                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <span>Saving Password...</span>
                            ) : (
                                <>
                                    <span>Save & Continue</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
