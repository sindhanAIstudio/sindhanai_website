"use client";

import { useEffect } from "react";
import { CheckCircle, Warning, Info, X } from "@phosphor-icons/react";

export interface ToastProps {
    id?: string;
    type: "success" | "error" | "info";
    title: string;
    message?: string;
    onClose: () => void;
    duration?: number; // duration in ms (default 3500)
}

export default function ToastNotification({
    type,
    title,
    message,
    onClose,
    duration = 3500,
}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: {
            bg: "bg-white border-emerald-200 text-slate-900",
            iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
            icon: CheckCircle,
        },
        error: {
            bg: "bg-white border-rose-200 text-slate-900",
            iconBg: "bg-rose-50 text-rose-600 border-rose-200",
            icon: Warning,
        },
        info: {
            bg: "bg-white border-indigo-200 text-slate-900",
            iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
            icon: Info,
        },
    };

    const style = styles[type];
    const Icon = style.icon;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div className={`p-4 rounded-2xl border shadow-xl flex items-start gap-3 ${style.bg}`}>
                <div className={`p-2 rounded-xl border shrink-0 ${style.iconBg}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-2">
                    <h4 className="font-bold text-xs text-slate-900">{title}</h4>
                    {message && <p className="text-[11px] text-slate-500 mt-0.5">{message}</p>}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
