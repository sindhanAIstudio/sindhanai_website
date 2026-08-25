"use client";

import { useState, useRef, useEffect } from "react";
import { CaretDown, X, Check, MagnifyingGlass } from "@phosphor-icons/react";

interface Option {
    id: string;
    name: string;
}

interface MultiSelectProps {
    label?: string;
    required?: boolean;
    options: Option[];
    value: string[];
    onChange: (selectedIds: string[]) => void;
    placeholder?: string;
}

export default function MultiSelect({
    label,
    required = false,
    options = [],
    value = [],
    onChange,
    placeholder = "Select options...",
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOptions = options.filter((opt) => value.includes(opt.id));

    const toggleOption = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((item) => item !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const removeOption = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((item) => item !== id));
    };

    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-1.5 relative select-none" ref={dropdownRef}>
            {label && (
                <label className="text-xs font-bold text-slate-700">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            {/* Selected Value Bar / Trigger */}
            <div
                onClick={() => setIsOpen((prev) => !prev)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-50 border transition-all cursor-pointer flex items-center justify-between gap-2 flex-wrap ${isOpen ? "border-indigo-600 ring-2 ring-indigo-500/10 bg-white" : "border-slate-200 hover:border-slate-300"
                    }`}
            >
                <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map((opt) => (
                            <span
                                key={opt.id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold"
                            >
                                <span>{opt.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => removeOption(opt.id, e)}
                                    className="p-0.5 hover:bg-indigo-200/60 rounded-md transition-colors"
                                >
                                    <X className="w-3 h-3 text-indigo-600" />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-slate-400 font-medium">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {selectedOptions.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange([]);
                            }}
                            className="p-1 hover:text-slate-600 rounded-md text-[11px] font-bold"
                            title="Clear all"
                        >
                            Clear
                        </button>
                    )}
                    <CaretDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Search bar */}
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
                        <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 ml-2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search roles..."
                            className="w-full bg-transparent text-xs py-1 text-slate-800 placeholder-slate-400 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = value.includes(opt.id);
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => toggleOption(opt.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                                ? "bg-indigo-50 text-indigo-700 font-bold"
                                                : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        <span>{opt.name}</span>
                                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" weight="bold" />}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="px-3 py-3 text-xs text-slate-400 text-center font-medium">No roles match search</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
