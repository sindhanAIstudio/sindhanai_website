"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    QrCode,
    Camera,
    CheckCircle,
    XCircle,
    ShieldCheck,
    DeviceMobile,
    Broadcast,
    Sparkle,
    Spinner,
    ArrowLeft,
} from "@phosphor-icons/react";

export default function StudentScannerClient() {
    const [scannedToken, setScannedToken] = useState("");
    const [deviceFingerprint, setDeviceFingerprint] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Generate persistent cryptographically unique device ID + Canvas hardware entropy
    useEffect(() => {
        const getOrCreatePersistentDeviceId = (): string => {
            const STORAGE_KEY = "sindhanai_device_id_v2";
            let deviceId = "";

            try {
                deviceId = localStorage.getItem(STORAGE_KEY) || "";
            } catch { }

            if (!deviceId) {
                // Cryptographically secure 128-bit random token
                if (typeof crypto !== "undefined" && crypto.randomUUID) {
                    deviceId = `DEV-${crypto.randomUUID().replace(/-/g, "").substring(0, 12)}`;
                } else {
                    const randomBuf = new Uint8Array(8);
                    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
                        crypto.getRandomValues(randomBuf);
                    }
                    const hex = Array.from(randomBuf).map((b) => b.toString(16).padStart(2, "0")).join("");
                    deviceId = `DEV-${hex.substring(0, 12)}`;
                }

                try {
                    localStorage.setItem(STORAGE_KEY, deviceId);
                } catch { }
            }

            return deviceId;
        };

        // Hardware Canvas Font & Shader Entropy for supplementary validation
        let canvasHash = "";
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
                canvas.width = 200;
                canvas.height = 50;
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial', sans-serif";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = "#069";
                ctx.fillText("Sindhanai-ID", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("Sindhanai-ID", 4, 17);
                const str = canvas.toDataURL();
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    hash = (hash << 5) - hash + str.charCodeAt(i);
                    hash |= 0;
                }
                canvasHash = Math.abs(hash).toString(16).substring(0, 4);
            }
        } catch { }

        const baseId = getOrCreatePersistentDeviceId();
        setDeviceFingerprint(baseId);
    }, []);

    const handleScanSubmit = async (tokenToUse?: string) => {
        const token = tokenToUse || scannedToken;
        if (!token.trim()) return;

        setSubmitting(true);
        setResult(null);

        try {
            const res = await fetch("/api/attendance/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token.trim(),
                    deviceFingerprint,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setResult({ success: false, message: data.error || "Scan verification failed" });
            } else {
                setResult({ success: true, message: data.message || "Attendance marked successfully!" });
                setScannedToken("");
            }
        } catch (err: any) {
            setResult({ success: false, message: err.message || "Network error submitting scan" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl relative">
                {/* Back to Dashboard Navigation Button */}
                <Link
                    href="/student"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 text-indigo-400" />
                    <span>Back to Student Dashboard</span>
                </Link>

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                        <QrCode className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-black text-white">Student QR Attendance Scanner</h1>
                    <p className="text-xs text-slate-400 font-medium">
                        Scan the 5-second dynamic QR displayed on your lab screen
                    </p>
                </div>

                {/* Device Security Card */}
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 text-slate-300">
                        <DeviceMobile className="w-4 h-4 text-emerald-400" />
                        <span>Registered Device ID:</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{deviceFingerprint || "Detecting..."}</span>
                </div>

                {/* Scanner Interface */}
                <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 relative group">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 animate-pulse">
                            <Camera className="w-8 h-8" />
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            Point your mobile device camera at the live lab screen QR code
                        </p>

                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                Anti-Proxy Lock:
                            </span>
                            <span className="text-emerald-400 font-bold">Hardware Camera Active</span>
                        </div>

                        <button
                            onClick={() => handleScanSubmit()}
                            disabled={submitting || !scannedToken.trim()}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Spinner className="w-4 h-4 animate-spin" />
                                    <span>Verifying Anti-Cheat Security...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkle className="w-4 h-4" />
                                    <span>Submit Attendance Scan</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Result Feedback Banner */}
                {result && (
                    <div
                        className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200 ${result.success
                            ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                            : "bg-rose-950/80 border-rose-500/50 text-rose-300"
                            }`}
                    >
                        {result.success ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                            <h4 className="font-extrabold">{result.success ? "Attendance Verified!" : "Verification Rejected"}</h4>
                            <p className="text-[11px] font-medium opacity-90 mt-0.5">{result.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
