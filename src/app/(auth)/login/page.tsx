"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, LockKey, EnvelopeSimple, Key, CheckCircle, Warning, CaretLeft } from "@phosphor-icons/react";

export default function LoginPage() {
    const router = useRouter();

    const [screen, setScreen] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Screen 1: Email Check
    const handleCheckIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setErrorMessage(null);

        try {
            const res = await fetch("/api/auth/check-identity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error || "Failed to check email identity.");
                return;
            }

            setIsExistingUser(data.isExistingUser);
            setUserName(data.name);
            setUserRole(data.role);
            setScreen(2);
        } catch {
            setErrorMessage("Network error checking identity. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Screen 2: Login or Password Setup
    const handleAuthenticate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            if (isExistingUser) {
                // Regular Login
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        deviceFingerprint: typeof window !== "undefined" ? navigator.userAgent : null,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setErrorMessage(data.error || "Invalid password.");
                    return;
                }

                const roleName = data.user?.role || data.role;

                // Redirect based on role
                if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") {
                    router.push("/admin");
                } else if (roleName === "INSTRUCTOR") {
                    router.push("/instructor");
                } else {
                    router.push("/student");
                }
            } else {
                // First-time Password Setup
                if (password.length < 8) {
                    setErrorMessage("Password must be at least 8 characters long.");
                    setLoading(false);
                    return;
                }

                if (password !== confirmPassword) {
                    setErrorMessage("Passwords do not match.");
                    setLoading(false);
                    return;
                }

                const res = await fetch("/api/auth/initialize-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        deviceFingerprint: typeof window !== "undefined" ? navigator.userAgent : null,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setErrorMessage(data.error || "Password initialization failed.");
                    return;
                }

                const roleName = data.user?.role || data.role;
                if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") {
                    router.push("/admin");
                } else if (roleName === "INSTRUCTOR") {
                    router.push("/instructor");
                } else {
                    router.push("/student");
                }
            }
        } catch {
            setErrorMessage("An unexpected authentication error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between">

            {/* Light Top Navigation */}
            <header className="px-8 py-5 flex items-center justify-between border-b border-slate-200 bg-white">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                        <Image src="/logo.png" alt="Logo" width={20} height={20} className="brightness-0 invert object-contain" />
                    </div>
                    <span className="font-bold text-base text-slate-900 tracking-tight">
                        SindhanAI Hub
                    </span>
                </Link>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enterprise 256-bit SSL Security
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">

                    {/* Header Info */}
                    <div className="space-y-1 text-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                            <LockKey className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            {screen === 1 ? "Sign In to SindhanAI Hub" : isExistingUser ? `Welcome back, ${userName}` : `Set Up Account Password`}
                        </h1>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            {screen === 1
                                ? "Enter your institutional email to access your role dashboard."
                                : isExistingUser
                                    ? `Authenticating profile as ${userRole}`
                                    : `Initialize your password for ${email}`}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
                            <Warning className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* SCREEN 1: EMAIL IDENTIFICATION */}
                    {screen === 1 && (
                        <form onSubmit={handleCheckIdentity} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Email Address</label>
                                <div className="relative">
                                    <EnvelopeSimple className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="superadmin@sindhanai.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? "Checking Identity..." : "Continue to Authentication"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* SCREEN 2: PASSWORD OR PASSWORD SETUP */}
                    {screen === 2 && (
                        <form onSubmit={handleAuthenticate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">
                                    {isExistingUser ? "Password" : "New Password (min 8 chars)"}
                                </label>
                                <div className="relative">
                                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {!isExistingUser && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Confirm Password</label>
                                    <div className="relative">
                                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setScreen(1)}
                                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center cursor-pointer transition-colors"
                                >
                                    <CaretLeft className="w-4 h-4" />
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? "Authenticating..." : isExistingUser ? "Sign In to Console" : "Save & Continue"}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </main>

            {/* Light Footer */}
            <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
                © {new Date().getFullYear()} SindhanAI Hub. Institutional Security Standards.
            </footer>

        </div>
    );
}
