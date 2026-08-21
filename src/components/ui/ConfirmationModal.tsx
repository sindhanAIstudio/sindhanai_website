"use client";

import { Warning, Trash, CheckCircle, Info, X } from "@phosphor-icons/react";

export interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    variant?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmationModal({
    isOpen,
    title,
    description,
    variant = "danger",
    confirmText = "Confirm Action",
    cancelText = "Cancel",
    isLoading = false,
    onConfirm,
    onClose,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: "bg-rose-50 border-rose-200 text-rose-600",
            icon: Trash,
            button: "bg-rose-600 hover:bg-rose-700 text-white",
        },
        warning: {
            iconBg: "bg-amber-50 border-amber-200 text-amber-600",
            icon: Warning,
            button: "bg-amber-600 hover:bg-amber-700 text-white",
        },
        info: {
            iconBg: "bg-indigo-50 border-indigo-200 text-indigo-600",
            icon: Info,
            button: "bg-indigo-600 hover:bg-indigo-700 text-white",
        },
    };

    const style = variantStyles[variant];
    const Icon = style.icon;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl border ${style.iconBg}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 ${style.button}`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
