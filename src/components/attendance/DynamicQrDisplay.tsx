"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { generateDynamicQrToken } from "@/lib/attendance/totp";
import { Broadcast, ShieldCheck, WarningCircle, Copy, Check } from "@phosphor-icons/react";

interface DynamicQrDisplayProps {
    sessionId: string;
    sessionSecret: string;
    sessionTitle: string;
    status: string;
    showTimer?: boolean;
}

export default function DynamicQrDisplay({
    sessionId,
    sessionSecret,
    sessionTitle,
    status,
    showTimer = false,
}: DynamicQrDisplayProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [currentToken, setCurrentToken] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        if (status !== "ACTIVE") return;

        const refreshQr = async () => {
            const token = generateDynamicQrToken(sessionId, sessionSecret);
            setCurrentToken(token);
            try {
                const url = await QRCode.toDataURL(token, { width: 280, margin: 1 });
                setQrDataUrl(url);
            } catch (e) {
                console.error("QR render error:", e);
            }
        };

        refreshQr();

        // Silent 5-second rotation
        const interval = setInterval(() => {
            refreshQr();
        }, 5000);

        return () => clearInterval(interval);
    }, [sessionId, sessionSecret, status]);

    const handleCopyToken = () => {
        if (!currentToken) return;
        navigator.clipboard.writeText(currentToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (status !== "ACTIVE") {
        return (
            <div className="p-8 text-center bg-slate-100 rounded-3xl border border-slate-200 space-y-3">
                <WarningCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-700">Attendance Session Closed</h3>
                <p className="text-xs text-slate-500 font-medium">
                    This attendance session is no longer active.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto text-center space-y-4">
            {/* Header */}
            <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                    <Broadcast className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                    <span>Live Secure Attendance QR</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 truncate">{sessionTitle}</h2>
            </div>

            {/* Silent Dynamic QR Code Box */}
            <div className="p-5 bg-slate-900 rounded-3xl shadow-inner inline-block relative">
                <div className="p-4 bg-white rounded-2xl shadow-md">
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Live Dynamic Attendance QR Code" className="w-[240px] h-[240px] rounded-xl object-contain mx-auto" />
                    ) : (
                        <div className="w-[240px] h-[240px] bg-slate-100 flex items-center justify-center rounded-2xl">
                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-white text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Anti-Spoofing Protected</span>
                </div>
            </div>

            {/* Dev Copy Token Button for Single-Laptop Testing */}
            <div className="pt-1">
                <button
                    onClick={handleCopyToken}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto border border-slate-200 cursor-pointer"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-extrabold">Live QR Token Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Copy Live Token (For Testing)</span>
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
                Point mobile camera at screen OR copy token to paste at /student/scan.
            </p>
        </div>
    );
}
