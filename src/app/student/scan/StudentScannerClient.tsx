"use client";

import { useState, useEffect } from "react";
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
} from "@phosphor-icons/react";

export default function StudentScannerClient() {
    const [scannedToken, setScannedToken] = useState("");
    const [deviceFingerprint, setDeviceFingerprint] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Generate hardware fingerprint
    useEffect(() => {
        const fpStr = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}-${navigator.language}`;
        let hash = 0;
        for (let i = 0; i < fpStr.length; i++) {
            const char = fpStr.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        setDeviceFingerprint(`DEV-${Math.abs(hash).toString(16)}`);
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
            <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl">
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
                            Point your device camera at the lab screen OR paste live token below
                        </p>

                        <input
                            type="text"
                            value={scannedToken}
                            onChange={(e) => {
                                setScannedToken(e.target.value);
                                if (e.target.value.length > 20) {
                                    handleScanSubmit(e.target.value);
                                }
                            }}
                            placeholder="Paste or Scan QR Payload Token..."
                            className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 text-center"
                        />

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
