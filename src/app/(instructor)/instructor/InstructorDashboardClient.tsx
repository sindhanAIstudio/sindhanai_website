"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCodeLib from "qrcode";
import { QrCode, PlusCircle, SignOut, Clock, Users, Sparkle, ShieldCheck, CheckCircle } from "@phosphor-icons/react";

interface InstructorDashboardClientProps {
    session: any;
    initialSessions: any[];
}

export default function InstructorDashboardClient({ session, initialSessions }: InstructorDashboardClientProps) {
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("60");
    const [activeSessionId, setActiveSessionId] = useState<string | null>(
        initialSessions[0]?.id || null
    );

    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [currentTotp, setCurrentTotp] = useState<string | null>(null);
    const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
    const [loading, setLoading] = useState(false);

    // Create New Classroom Session
    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        setLoading(true);
        try {
            const res = await fetch("/api/attendance/session/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, durationMinutes: duration }),
            });
            const data = await res.json();
            if (res.ok) {
                setActiveSessionId(data.sessionId);
                setTitle("");
            } else {
                alert(data.error || "Failed to create session");
            }
        } catch {
            alert("Error creating classroom session");
        } finally {
            setLoading(false);
        }
    };

    // Live TOTP QR Code 10-second polling loop
    useEffect(() => {
        if (!activeSessionId) return;

        let intervalId: NodeJS.Timeout;

        const fetchTokenAndRenderQR = async () => {
            try {
                const res = await fetch(`/api/attendance/session/token?sessionId=${activeSessionId}`);
                if (!res.ok) return;

                const data = await res.json();
                setCurrentTotp(data.token);
                setSecondsRemaining(data.secondsRemaining);

                const scanUrl = `${window.location.origin}/student?sessionId=${data.sessionId}&token=${data.token}`;
                const dataUrl = await QRCodeLib.toDataURL(scanUrl, {
                    width: 320,
                    margin: 2,
                    color: { dark: "#0f172a", light: "#ffffff" },
                });

                setQrDataUrl(dataUrl);
            } catch (err) {
                console.error("QR Rendering error:", err);
            }
        };

        fetchTokenAndRenderQR();
        intervalId = setInterval(fetchTokenAndRenderQR, 2000);

        return () => clearInterval(intervalId);
    }, [activeSessionId]);

    // 1-second countdown ticker
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 10));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const activeSession = initialSessions.find((s) => s.id === activeSessionId) || initialSessions[0];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">

            {/* Enterprise Light Header */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                                <Image src="/logo.png" alt="SindhanAI" width={20} height={20} className="brightness-0 invert object-contain" />
                            </div>
                            <span className="font-bold text-base text-slate-900 tracking-tight">
                                Instructor Portal
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4 text-blue-600" /> Dynamic TOTP Engine Active
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-slate-900">{session.name}</div>
                            <div className="text-[11px] text-slate-500">{session.email}</div>
                        </div>

                        <button
                            onClick={async () => {
                                await fetch("/api/auth/logout", { method: "POST" });
                                window.location.href = "/login";
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <SignOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Hero Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                        <Sparkle className="w-3.5 h-3.5 text-blue-600" /> Dynamic Attendance Verification Broadcast
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live TOTP Classroom Session</h1>
                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                        Project this dynamic QR code on the classroom screen. The TOTP token automatically rotates every 10 seconds to eliminate proxy attendance attempts.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: QR Code Display Card (7 Cols) */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col items-center text-center justify-between space-y-6">
                        <div className="space-y-1.5 w-full">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                <Clock className="w-4 h-4 text-emerald-600" /> 10-Second Auto Rotation
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {activeSession ? activeSession.title : "No Active Session Selected"}
                            </h2>
                        </div>

                        {/* QR Box */}
                        {qrDataUrl ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-900 rounded-2xl shadow-md border border-slate-800 inline-block">
                                    <img src={qrDataUrl} alt="Live TOTP QR Code" className="w-64 h-64 object-contain rounded-lg" />
                                </div>

                                <div className="max-w-xs mx-auto space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-slate-500">Token: <code className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{currentTotp}</code></span>
                                        <span className="text-indigo-600 font-mono">{secondsRemaining}s</span>
                                    </div>

                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                        <div
                                            className="bg-indigo-600 h-full transition-all duration-1000"
                                            style={{ width: `${(secondsRemaining / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-slate-400 text-xs space-y-2">
                                <QrCode className="w-12 h-12 mx-auto text-slate-300" />
                                <p>Create a session to begin live QR broadcast.</p>
                            </div>
                        )}

                        <div className="text-[11px] text-slate-500 max-w-sm">
                            Students must scan using the SindhanAI web scanner. Device fingerprint mismatch will reject proxy attempts.
                        </div>
                    </div>

                    {/* Right Column: Session Controls & Roster (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Session Creator */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <PlusCircle className="w-4 h-4 text-indigo-600" /> Create Session
                            </h3>

                            <form onSubmit={handleCreateSession} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Topic Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Generative AI Lab - RAG Optimization"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Active Duration</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    >
                                        <option value="30">30 Minutes</option>
                                        <option value="60">60 Minutes</option>
                                        <option value="120">120 Minutes</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? "Initializing..." : "Launch QR Broadcast"}
                                </button>
                            </form>
                        </div>

                        {/* Roster Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4 text-emerald-600" /> Verified Roster
                                </h3>
                                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {activeSession?.attendanceRecords?.length || 0} Records
                                </span>
                            </div>

                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                {activeSession?.attendanceRecords?.map((rec: any) => (
                                    <div key={rec.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-slate-900">{rec.student.name}</div>
                                            <div className="text-[10px] text-slate-500">{rec.student.email}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified
                                            </div>
                                            <div className="text-[9px] text-slate-400">{new Date(rec.scannedAt).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}

                                {(!activeSession?.attendanceRecords || activeSession.attendanceRecords.length === 0) && (
                                    <div className="text-xs text-slate-400 text-center py-6">
                                        No student scans recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}
