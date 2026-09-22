"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DynamicFormRenderer, { FormFieldSchema } from "@/components/DynamicFormRenderer";
import {
    ArrowLeft,
    FloppyDisk,
    Eye,
    NotePencil,
    Sparkle,
    Spinner,
    CheckCircle,
    Copy,
    Code,
    Plus,
    Trash,
    ArrowUp,
    ArrowDown,
    Gear,
    TextT,
    EnvelopeSimple,
    Hash,
    ListBullets,
    RadioButton,
    CheckSquare,
    CalendarBlank,
    Star,
    TextColumns,
    Article,
    SlidersHorizontal,
    Database,
    ShieldCheck,
    GitBranch,
    CopySimple,
    Phone,
    Globe,
    Lock,
    Clock,
    UploadSimple,
    CurrencyInr,
    Tag,
    PencilSimpleLine,
    FileCode,
    Columns,
    ChartBar,
    Exam,
    CheckSquareOffset,
    Lightbulb,
} from "@phosphor-icons/react";

export default function FormBuilderStudioClient() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
                    <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Loading Form Studio Canvas...</p>
                </div>
            }
        >
            <FormBuilderStudioContent />
        </Suspense>
    );
}

function FormBuilderStudioContent() {
    const searchParams = useSearchParams();
    const formId = searchParams.get("id");

    const [formTitle, setFormTitle] = useState("");
    const [formSlug, setFormSlug] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formType, setFormType] = useState<"form" | "poll" | "quiz">("form");
    const [activeTab, setActiveTab] = useState<"builder" | "preview" | "schema">("builder");

    // Left Palette Category Tab: basic | advanced | layout
    const [paletteCategory, setPaletteCategory] = useState<"basic" | "advanced" | "layout">("basic");

    // Multi-Tab Field Inspector: display | quizkey | data | validation | api | conditional
    const [inspectorTab, setInspectorTab] = useState<"display" | "quizkey" | "data" | "validation" | "api" | "conditional">("display");

    // Form fields schema state
    const [fields, setFields] = useState<FormFieldSchema[]>([
        {
            id: "field_fullname",
            type: "text",
            label: "Full Name",
            placeholder: "Enter full name",
            description: "Provide your complete legal name",
            colSpan: 6,
            required: true,
        },
        {
            id: "field_email",
            type: "email",
            label: "Email Address",
            placeholder: "name@sindhanai.in",
            colSpan: 6,
            required: true,
        },
    ]);

    const [selectedField, setSelectedField] = useState<FormFieldSchema | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (formId) {
            fetchFormDetails(formId);
        } else {
            setLoading(false);
        }
    }, [formId]);

    const fetchFormDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/forms/${id}`);
            const data = await res.json();
            if (res.ok && data.form) {
                setFormTitle(data.form.title);
                setFormSlug(data.form.slug);
                setFormDescription(data.form.description || "");

                const inferredType = (data.form.type || "form") as "form" | "poll" | "quiz";
                setFormType(inferredType);

                if (data.form.fields) {
                    try {
                        const parsed = typeof data.form.fields === "string" ? JSON.parse(data.form.fields) : data.form.fields;
                        if (Array.isArray(parsed)) {
                            setFields(parsed);
                        } else if (parsed && Array.isArray(parsed.components)) {
                            const mapped: FormFieldSchema[] = parsed.components.map((c: any) => ({
                                id: c.key || `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                type: c.type === "textfield" ? "text" : c.type === "button" ? "header" : c.type || "text",
                                label: c.label || "Untitled Field",
                                placeholder: c.placeholder || "",
                                description: c.description || "",
                                required: !!c.validate?.required,
                                colSpan: c.colSpan || 12,
                                options: c.values ? c.values.map((v: any) => v.label || v.value) : c.options || [],
                                correctAnswer: c.correctAnswer,
                                points: c.points,
                                explanation: c.explanation,
                            }));
                            setFields(mapped);
                        }
                    } catch { }
                }
            }
        } catch (err) {
            console.error("Failed to load form details:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddField = (type: FormFieldSchema["type"]) => {
        const newField: FormFieldSchema = {
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type,
            label: type === "header" ? "New Section Title" : type === "html" ? "Important Guidance Note" : `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            placeholder: type === "header" || type === "html" ? undefined : "Enter text...",
            required: false,
            colSpan: 12,
            options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1", "Option 2", "Option 3"] : undefined,
            htmlContent: type === "html" ? "<p>Provide custom instructions or guidelines here.</p>" : undefined,
            points: formType === "quiz" ? 10 : undefined,
        };

        setFields((prev) => [...prev, newField]);
        setSelectedField(newField);
    };

    const handleMoveField = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= fields.length) return;

        const updated = [...fields];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setFields(updated);
    };

    const handleDeleteField = (id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
        if (selectedField?.id === id) {
            setSelectedField(null);
        }
    };

    const handleUpdateSelectedField = (key: keyof FormFieldSchema, value: any) => {
        if (!selectedField) return;

        const updatedField = { ...selectedField, [key]: value };
        setSelectedField(updatedField);
        setFields((prev) => prev.map((f) => (f.id === selectedField.id ? updatedField : f)));
    };

    const handleSaveForm = async () => {
        if (!formTitle.trim() || !formId) return;

        setSaving(true);
        setSaveSuccess(false);

        try {
            const res = await fetch(`/api/admin/forms/${formId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formTitle.trim(),
                    slug: formSlug.trim(),
                    description: formDescription.trim(),
                    type: formType,
                    fields: JSON.stringify(fields),
                }),
            });

            if (res.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to save schema");
            }
        } catch (err: any) {
            alert(err.message || "Network error saving schema");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
                <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Loading Form Studio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Toolbar Header with Mode Banner */}
            <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-4 z-40">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/forms"
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="Module Title..."
                                className="bg-transparent text-lg font-black text-slate-900 focus:outline-none focus:bg-slate-50 px-2 py-0.5 rounded-lg border border-transparent focus:border-slate-200"
                            />
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${formType === "poll"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : formType === "quiz"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}>
                                {formType} Studio Mode
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono px-2">
                            <span>Slug: /forms/</span>
                            <input
                                type="text"
                                value={formSlug}
                                onChange={(e) => setFormSlug(e.target.value)}
                                className="bg-transparent text-indigo-600 font-bold focus:outline-none focus:bg-slate-50 px-1 py-0.2 rounded border border-transparent focus:border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mx-auto lg:mx-0">
                    <button
                        onClick={() => setActiveTab("builder")}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "builder"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                            }`}
                    >
                        <NotePencil className="w-4 h-4" />
                        <span>Studio Canvas</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("preview")}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "preview"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        <span>Live Preview</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("schema")}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "schema"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                            }`}
                    >
                        <Code className="w-4 h-4" />
                        <span>JSON Schema</span>
                    </button>
                </div>

                {/* Save Form Button */}
                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Saved!</span>
                        </span>
                    )}

                    <button
                        onClick={handleSaveForm}
                        disabled={saving || !formTitle.trim()}
                        className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <Spinner className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <FloppyDisk className="w-4 h-4" />
                                <span>Save Schema</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Studio Workspace Content */}
            {activeTab === "builder" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Categorized Element Palette */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Sparkle className="w-5 h-5" />
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Add Elements</h3>
                            </div>

                            {/* Category Switcher Tabs */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
                                <button
                                    onClick={() => setPaletteCategory("basic")}
                                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${paletteCategory === "basic" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    Basic
                                </button>
                                <button
                                    onClick={() => setPaletteCategory("advanced")}
                                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${paletteCategory === "advanced" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    Advanced
                                </button>
                                <button
                                    onClick={() => setPaletteCategory("layout")}
                                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${paletteCategory === "layout" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    Layout
                                </button>
                            </div>

                            {/* Category 1: BASIC FIELDS */}
                            {paletteCategory === "basic" && (
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => handleAddField("radio")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <RadioButton className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">
                                                {formType === "poll" ? "Poll Vote Options" : formType === "quiz" ? "Quiz Choice Question" : "Radio Options"}
                                            </p>
                                            <p className="text-[10px] text-slate-400">Single selection choices</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAddField("text")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <TextT className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Text Input</p>
                                            <p className="text-[10px] text-slate-400">Single line input</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAddField("textarea")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <Article className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Text Area</p>
                                            <p className="text-[10px] text-slate-400">Multi-line paragraph</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAddField("email")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <EnvelopeSimple className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Email Address</p>
                                            <p className="text-[10px] text-slate-400">Validated email field</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAddField("checkbox")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <CheckSquare className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Checkboxes</p>
                                            <p className="text-[10px] text-slate-400">Multiple selection list</p>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Category 2: ADVANCED FIELDS */}
                            {paletteCategory === "advanced" && (
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => handleAddField("phone")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Phone Number</p>
                                            <p className="text-[10px] text-slate-400">Phone input with icon</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAddField("url")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Website URL</p>
                                            <p className="text-[10px] text-slate-400">Web link input</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAddField("date")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <CalendarBlank className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Date Picker</p>
                                            <p className="text-[10px] text-slate-400">Calendar date selector</p>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Category 3: LAYOUT & SPECIALTY */}
                            {paletteCategory === "layout" && (
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => handleAddField("header")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <TextColumns className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">Section Header</p>
                                            <p className="text-[10px] text-slate-400">Section title & divider</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAddField("html")}
                                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                                            <FileCode className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600">HTML Content</p>
                                            <p className="text-[10px] text-slate-400">Rich text / guidelines note</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Column: Interactive Form Layout Canvas */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 min-h-[500px]">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                                    Studio Canvas ({fields.length})
                                </h3>
                                <span className="text-[11px] text-slate-400 font-mono">Click element to edit</span>
                            </div>

                            {fields.length === 0 ? (
                                <div className="p-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl">
                                    <Plus className="w-8 h-8 text-slate-300 mx-auto" />
                                    <p className="text-xs text-slate-500 font-medium">No questions/elements added yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-12 gap-3">
                                    {fields.map((field, idx) => {
                                        const isSelected = selectedField?.id === field.id;
                                        const isQuizQuestion = formType === "quiz" && field.type === "radio";

                                        return (
                                            <div
                                                key={field.id}
                                                onClick={() => setSelectedField(field)}
                                                className={`col-span-12 p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 relative group ${isSelected
                                                        ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                                                        : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/80"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-xs font-extrabold text-slate-900 truncate">{field.label}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMoveField(idx, "up");
                                                            }}
                                                            disabled={idx === 0}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30"
                                                        >
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMoveField(idx, "down");
                                                            }}
                                                            disabled={idx === fields.length - 1}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30"
                                                        >
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteField(field.id);
                                                            }}
                                                            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Quiz Answer Key Preview Badge */}
                                                {isQuizQuestion && (
                                                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                                                        <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                            Key: {field.correctAnswer || "Not set yet"}
                                                        </span>
                                                        <span className="text-amber-700 font-extrabold font-mono">
                                                            {field.points || 10} Points
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Multi-Tab Inspector Panel */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 sticky top-24">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <Gear className="w-5 h-5" />
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                                        Inspector Panel
                                    </h3>
                                </div>
                                {selectedField && (
                                    <span className="text-[11px] font-mono text-indigo-600 font-bold">
                                        {selectedField.id}
                                    </span>
                                )}
                            </div>

                            {selectedField ? (
                                <div className="space-y-4">
                                    {/* Tab Navigation Bar */}
                                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto text-[11px] font-bold">
                                        <button
                                            onClick={() => setInspectorTab("display")}
                                            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${inspectorTab === "display" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                                }`}
                                        >
                                            <SlidersHorizontal className="w-3.5 h-3.5" />
                                            <span>Display</span>
                                        </button>

                                        {formType === "quiz" && (
                                            <button
                                                onClick={() => setInspectorTab("quizkey")}
                                                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${inspectorTab === "quizkey" ? "bg-white text-amber-600 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                            >
                                                <Exam className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Quiz Key & Points</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setInspectorTab("data")}
                                            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${inspectorTab === "data" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                                }`}
                                        >
                                            <Database className="w-3.5 h-3.5" />
                                            <span>Choices Data</span>
                                        </button>
                                    </div>

                                    {/* Tab: DISPLAY */}
                                    {inspectorTab === "display" && (
                                        <div className="space-y-3.5 text-xs">
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-700">Question / Field Label *</label>
                                                <input
                                                    type="text"
                                                    value={selectedField.label}
                                                    onChange={(e) => handleUpdateSelectedField("label", e.target.value)}
                                                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-700">Sub-Text / Instructions</label>
                                                <input
                                                    type="text"
                                                    value={selectedField.description || ""}
                                                    onChange={(e) => handleUpdateSelectedField("description", e.target.value)}
                                                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab: QUIZ KEY & POINTS */}
                                    {inspectorTab === "quizkey" && (
                                        <div className="space-y-3.5 text-xs">
                                            <div className="space-y-1 p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                                                <div className="flex items-center gap-1.5 font-black text-amber-900">
                                                    <Exam className="w-4 h-4 text-amber-600" />
                                                    <span>Correct Answer Marker</span>
                                                </div>

                                                <label className="font-bold text-slate-700 block">Select Correct Choice Option *</label>
                                                <select
                                                    value={selectedField.correctAnswer || ""}
                                                    onChange={(e) => handleUpdateSelectedField("correctAnswer", e.target.value)}
                                                    className="w-full h-9 px-3 rounded-xl bg-white border border-amber-300 text-xs font-extrabold text-slate-900 focus:outline-none"
                                                >
                                                    <option value="">-- Select Correct Answer Key --</option>
                                                    {(selectedField.options || []).map((opt, i) => (
                                                        <option key={i} value={opt}>
                                                            ✓ {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-700">Question Point Score</label>
                                                <input
                                                    type="number"
                                                    value={selectedField.points ?? 10}
                                                    onChange={(e) => handleUpdateSelectedField("points", Number(e.target.value))}
                                                    placeholder="e.g. 10"
                                                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-900"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-700">Correct Answer Explanation Note</label>
                                                <textarea
                                                    rows={3}
                                                    value={selectedField.explanation || ""}
                                                    onChange={(e) => handleUpdateSelectedField("explanation", e.target.value)}
                                                    placeholder="Explain why this choice is correct..."
                                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab: CHOICES DATA */}
                                    {inspectorTab === "data" && (
                                        <div className="space-y-3.5 text-xs">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="font-bold text-slate-700">Option Choices Manager</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentOpts = selectedField.options || [];
                                                            handleUpdateSelectedField("options", [...currentOpts, `Option ${currentOpts.length + 1}`]);
                                                        }}
                                                        className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                                                    >
                                                        + Add Choice
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {(selectedField.options || []).map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const updatedOpts = [...(selectedField.options || [])];
                                                                    updatedOpts[i] = e.target.value;
                                                                    handleUpdateSelectedField("options", updatedOpts);
                                                                }}
                                                                className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedOpts = (selectedField.options || []).filter((_, idx) => idx !== i);
                                                                    handleUpdateSelectedField("options", updatedOpts);
                                                                }}
                                                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteField(selectedField.id)}
                                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[11px] border border-rose-200 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                            <span>Delete Element</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
                                    <p>No element selected.</p>
                                    <p className="text-[11px] text-slate-400">Click any element in canvas to edit choices, correct answer key & points.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Live Preview Tab */}
            {activeTab === "preview" && (
                <div className="space-y-6 max-w-3xl mx-auto py-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black text-slate-900">{formTitle}</h2>
                        {formDescription && <p className="text-xs text-slate-500 font-medium">{formDescription}</p>}
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md">
                        <DynamicFormRenderer fields={fields} formType={formType} previewOnly={true} />
                    </div>
                </div>
            )}

            {/* JSON Schema Tab */}
            {activeTab === "schema" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">JSON Schema Definition</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(fields, null, 2));
                                alert("JSON Schema copied to clipboard!");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
                        >
                            <Copy className="w-4 h-4 text-indigo-600" />
                            <span>Copy JSON</span>
                        </button>
                    </div>

                    <textarea
                        readOnly
                        rows={20}
                        value={JSON.stringify(fields, null, 2)}
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-indigo-900 focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
}
