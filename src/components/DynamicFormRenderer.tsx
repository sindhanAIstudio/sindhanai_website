"use client";

import { useState } from "react";
import {
    CheckCircle,
    PaperPlaneTilt,
    Spinner,
    Star,
    Info,
    Phone,
    Globe,
    Lock,
    Clock,
    UploadSimple,
    CurrencyInr,
    Tag,
    PencilSimpleLine,
    Eye,
    EyeSlash,
    ChartBar,
    Exam,
    Lightbulb,
    Trophy,
} from "@phosphor-icons/react";

export interface FormFieldSchema {
    id: string;
    type:
    | "text"
    | "textarea"
    | "email"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "rating"
    | "header"
    | "phone"
    | "url"
    | "password"
    | "time"
    | "file"
    | "currency"
    | "tags"
    | "signature"
    | "html";
    label: string;
    placeholder?: string;
    description?: string;
    tooltip?: string;
    prefix?: string;
    suffix?: string;
    required?: boolean;
    colSpan?: number; // 12 = full width, 6 = 2 cols, 4 = 3 cols, 3 = 4 cols
    defaultValue?: any;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    customError?: string;
    customClass?: string;
    disabled?: boolean;
    options?: string[]; // for select, radio, checkbox
    htmlContent?: string; // for html type

    // Quiz & Poll Fields
    correctAnswer?: string; // For quiz option matching
    points?: number; // Score value e.g. 10
    explanation?: string; // Quiz answer explanation
    conditional?: {
        whenFieldId?: string;
        equalsValue?: string;
    };
}

interface DynamicFormRendererProps {
    fields: FormFieldSchema[];
    formType?: "form" | "poll" | "quiz";
    onSubmit?: (data: Record<string, any>) => void;
    submitting?: boolean;
    previewOnly?: boolean;
}

export default function DynamicFormRenderer({
    fields,
    formType = "form",
    onSubmit,
    submitting = false,
    previewOnly = false,
}: DynamicFormRendererProps) {
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        fields.forEach((f) => {
            if (f.defaultValue !== undefined && f.defaultValue !== "") {
                initial[f.id] = f.defaultValue;
            }
        });
        return initial;
    });

    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [tagInput, setTagInput] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Submission outcome states for Quiz & Poll
    const [submittedOutcome, setSubmittedOutcome] = useState<{
        score?: number;
        totalPoints?: number;
        percentage?: number;
        passed?: boolean;
        pollResults?: Record<string, Record<string, number>>; // fieldId -> { option -> percentage }
    } | null>(null);

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData((prev) => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[fieldId];
                return updated;
            });
        }
    };

    const handleCheckboxToggle = (fieldId: string, option: string) => {
        const currentVals: string[] = formData[fieldId] || [];
        const nextVals = currentVals.includes(option)
            ? currentVals.filter((item) => item !== option)
            : [...currentVals, option];
        handleInputChange(fieldId, nextVals);
    };

    const handleAddTag = (fieldId: string) => {
        const input = (tagInput[fieldId] || "").trim();
        if (!input) return;
        const currentTags: string[] = formData[fieldId] || [];
        if (!currentTags.includes(input)) {
            handleInputChange(fieldId, [...currentTags, input]);
        }
        setTagInput((prev) => ({ ...prev, [fieldId]: "" }));
    };

    const handleRemoveTag = (fieldId: string, tagToRemove: string) => {
        const currentTags: string[] = formData[fieldId] || [];
        handleInputChange(
            fieldId,
            currentTags.filter((t) => t !== tagToRemove)
        );
    };

    // Evaluate conditional visibility
    const isFieldVisible = (field: FormFieldSchema): boolean => {
        if (!field.conditional || !field.conditional.whenFieldId) return true;
        const targetVal = formData[field.conditional.whenFieldId];
        if (field.conditional.equalsValue === undefined || field.conditional.equalsValue === "") {
            return !!targetVal;
        }
        return String(targetVal) === String(field.conditional.equalsValue);
    };

    const getColSpanClass = (colSpan?: number) => {
        switch (colSpan) {
            case 6:
                return "col-span-12 sm:col-span-6";
            case 4:
                return "col-span-12 sm:col-span-4";
            case 3:
                return "col-span-12 sm:col-span-3";
            case 12:
            default:
                return "col-span-12";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required & constraints
        const newErrors: Record<string, string> = {};
        fields.forEach((field) => {
            if (!isFieldVisible(field) || field.type === "header" || field.type === "html") return;

            const val = formData[field.id];

            // Required Check
            if (field.required) {
                if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
                    newErrors[field.id] = field.customError || `${field.label} is required`;
                    return;
                }
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Calculate Quiz or Poll outcomes
        if (formType === "quiz") {
            let score = 0;
            let totalPoints = 0;
            fields.forEach((f) => {
                if (f.correctAnswer) {
                    const p = f.points || 10;
                    totalPoints += p;
                    if (formData[f.id] === f.correctAnswer) {
                        score += p;
                    }
                }
            });
            const pct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 100;
            setSubmittedOutcome({
                score,
                totalPoints,
                percentage: pct,
                passed: pct >= 60,
            });
        } else if (formType === "poll") {
            // Simulated Poll Results Breakdown
            const pollRes: Record<string, Record<string, number>> = {};
            fields.forEach((f) => {
                if (f.options && f.options.length > 0) {
                    const selectedOpt = formData[f.id];
                    const breakdown: Record<string, number> = {};
                    const totalVotes = 100;
                    let remaining = 100;

                    f.options.forEach((opt, idx) => {
                        if (idx === f.options!.length - 1) {
                            breakdown[opt] = remaining;
                        } else {
                            const isChosen = opt === selectedOpt;
                            const share = isChosen ? Math.floor(Math.random() * 20) + 45 : Math.floor(Math.random() * 15) + 5;
                            breakdown[opt] = Math.min(share, remaining);
                            remaining -= breakdown[opt];
                        }
                    });
                    pollRes[f.id] = breakdown;
                }
            });
            setSubmittedOutcome({ pollResults: pollRes });
        }

        if (previewOnly) {
            if (formType === "form") {
                alert("Preview Mode: Form submitted!\n\n" + JSON.stringify(formData, null, 2));
            }
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-5">
            {/* Quiz Outcome Banner Header */}
            {submittedOutcome && formType === "quiz" && (
                <div className={`col-span-12 p-6 rounded-3xl border text-center space-y-2 animate-in zoom-in-95 ${submittedOutcome.passed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                        : "bg-rose-50 border-rose-200 text-rose-950"
                    }`}>
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-sm">
                        <Trophy className={`w-7 h-7 ${submittedOutcome.passed ? "text-emerald-600" : "text-rose-600"}`} />
                    </div>
                    <h2 className="text-xl font-black">
                        Quiz Score: {submittedOutcome.score} / {submittedOutcome.totalPoints} Points ({submittedOutcome.percentage}%)
                    </h2>
                    <p className="text-xs font-bold">
                        {submittedOutcome.passed
                            ? "🎉 Congratulations! You have successfully passed the quiz."
                            : "❌ Keep learning and try again to improve your score."}
                    </p>
                </div>
            )}

            {fields.map((field) => {
                if (!isFieldVisible(field)) return null;

                const hasError = !!errors[field.id];
                const colSpanClass = getColSpanClass(field.colSpan);

                if (field.type === "header") {
                    return (
                        <div key={field.id} className={`col-span-12 pt-4 border-t border-slate-100 first:border-0 first:pt-0 ${field.customClass || ""}`}>
                            <h3 className="text-base font-black text-slate-900">{field.label}</h3>
                            {field.description && (
                                <p className="text-xs text-slate-500 mt-0.5">{field.description}</p>
                            )}
                        </div>
                    );
                }

                if (field.type === "html") {
                    return (
                        <div
                            key={field.id}
                            className={`${colSpanClass} p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed ${field.customClass || ""}`}
                            dangerouslySetInnerHTML={{ __html: field.htmlContent || field.description || `<p class="font-semibold">${field.label}</p>` }}
                        />
                    );
                }

                return (
                    <div key={field.id} className={`${colSpanClass} space-y-2 ${field.customClass || ""}`}>
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-extrabold text-slate-700">
                                {field.label}
                                {field.required && <span className="text-rose-500 ml-1">*</span>}
                                {formType === "quiz" && field.points && (
                                    <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                        {field.points} Points
                                    </span>
                                )}
                            </label>
                            {field.tooltip && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium" title={field.tooltip}>
                                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>{field.tooltip}</span>
                                </span>
                            )}
                        </div>

                        {field.description && (
                            <p className="text-[11px] text-slate-400 font-medium">{field.description}</p>
                        )}

                        <div className="relative flex items-center">
                            {field.prefix && (
                                <span className="px-3 py-2.5 rounded-l-xl bg-slate-100 border border-r-0 border-slate-200 text-xs font-extrabold text-slate-500 shrink-0">
                                    {field.prefix}
                                </span>
                            )}

                            {/* Standard Inputs */}
                            {field.type === "text" && (
                                <input
                                    type="text"
                                    disabled={field.disabled || !!submittedOutcome}
                                    placeholder={field.placeholder || "Enter details..."}
                                    value={formData[field.id] || ""}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className={`w-full h-11 px-4 text-xs font-semibold text-slate-900 bg-slate-50 border transition-colors focus:outline-none focus:bg-white rounded-xl ${hasError ? "border-rose-500" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                            )}

                            {field.type === "email" && (
                                <input
                                    type="email"
                                    disabled={field.disabled || !!submittedOutcome}
                                    placeholder={field.placeholder || "name@example.com"}
                                    value={formData[field.id] || ""}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className={`w-full h-11 px-4 text-xs font-semibold text-slate-900 bg-slate-50 border transition-colors focus:outline-none focus:bg-white rounded-xl ${hasError ? "border-rose-500" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                            )}

                            {field.type === "phone" && (
                                <div className="relative w-full">
                                    <input
                                        type="tel"
                                        disabled={field.disabled || !!submittedOutcome}
                                        placeholder={field.placeholder || "+91 98765 43210"}
                                        value={formData[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        className="w-full h-11 pl-10 pr-4 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                                    />
                                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                </div>
                            )}

                            {field.type === "select" && (
                                <select
                                    disabled={field.disabled || !!submittedOutcome}
                                    value={formData[field.id] || ""}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="">Select an option...</option>
                                    {(field.options || []).map((opt, i) => (
                                        <option key={i} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Radio Options (Used for Polls & Quizzes) */}
                            {field.type === "radio" && (
                                <div className="w-full space-y-2 pt-1">
                                    {(field.options || []).map((opt, i) => {
                                        const isChosen = formData[field.id] === opt;
                                        const isCorrect = field.correctAnswer === opt;

                                        let optionStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                                        if (submittedOutcome && formType === "quiz") {
                                            if (isCorrect) {
                                                optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-black ring-2 ring-emerald-500/20";
                                            } else if (isChosen && !isCorrect) {
                                                optionStyle = "bg-rose-50 border-rose-500 text-rose-800 font-bold";
                                            }
                                        } else if (isChosen) {
                                            optionStyle = "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-500/20";
                                        }

                                        const pollPct = submittedOutcome?.pollResults?.[field.id]?.[opt];

                                        return (
                                            <div key={i} className="space-y-1">
                                                <label className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${optionStyle}`}>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            disabled={field.disabled || !!submittedOutcome}
                                                            name={field.id}
                                                            value={opt}
                                                            checked={isChosen}
                                                            onChange={() => handleInputChange(field.id, opt)}
                                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                                        />
                                                        <span className="text-xs">{opt}</span>
                                                    </div>

                                                    {/* Quiz Correct Indicator */}
                                                    {submittedOutcome && formType === "quiz" && isCorrect && (
                                                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                                                            ✓ Correct Choice
                                                        </span>
                                                    )}

                                                    {/* Poll Percentage Number */}
                                                    {pollPct !== undefined && (
                                                        <span className="text-xs font-black text-purple-700">
                                                            {pollPct}%
                                                        </span>
                                                    )}
                                                </label>

                                                {/* Poll Interactive Percentage Progress Bar Graph */}
                                                {pollPct !== undefined && (
                                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-purple-600 h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${pollPct}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Checkbox Options */}
                            {field.type === "checkbox" && (
                                <div className="w-full space-y-2 pt-1">
                                    {(field.options || []).map((opt, i) => {
                                        const checked = (formData[field.id] || []).includes(opt);
                                        return (
                                            <label key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-semibold text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    disabled={field.disabled || !!submittedOutcome}
                                                    checked={checked}
                                                    onChange={() => handleCheckboxToggle(field.id, opt)}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quiz Answer Explanation Note */}
                        {submittedOutcome && formType === "quiz" && field.explanation && (
                            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Explanation Note:</span>
                                </div>
                                <p className="text-[11px] text-amber-800 leading-relaxed">{field.explanation}</p>
                            </div>
                        )}

                        {hasError && <p className="text-[11px] font-bold text-rose-500">{errors[field.id]}</p>}
                    </div>
                );
            })}

            {!submittedOutcome && (
                <div className="col-span-12 pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-3.5 px-6 rounded-2xl text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${formType === "poll"
                                ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                                : formType === "quiz"
                                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                            }`}
                    >
                        {submitting ? (
                            <>
                                <Spinner className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : formType === "poll" ? (
                            <>
                                <ChartBar className="w-4 h-4" />
                                <span>Cast Your Vote</span>
                            </>
                        ) : formType === "quiz" ? (
                            <>
                                <Exam className="w-4 h-4" />
                                <span>Submit Quiz & View Score</span>
                            </>
                        ) : (
                            <>
                                <PaperPlaneTilt className="w-4 h-4" />
                                <span>Submit Responses</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </form>
    );
}
