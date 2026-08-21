"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { MagnifyingGlass, CaretDown, Check } from "@phosphor-icons/react";

interface OptionItem {
    id: string;
    name: string;
    code?: string;
}

interface SearchableSelectProps {
    label: string;
    options: OptionItem[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export default function SearchableSelect({
    label,
    options,
    value,
    onChange,
    placeholder = "Select Option...",
    required = false,
    error,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    const filteredOptions = options.filter((opt) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            opt.name.toLowerCase().includes(q) ||
            (opt.code && opt.code.toLowerCase().includes(q))
        );
    });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setActiveIndex(0);
    }, [search]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === "Escape") {
            setIsOpen(false);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredOptions[activeIndex]) {
                onChange(filteredOptions[activeIndex].id);
                setIsOpen(false);
                setSearch("");
            }
        }
    };

    return (
        <div className="space-y-1 relative" ref={containerRef} onKeyDown={handleKeyDown}>
            <label className="text-xs font-bold text-slate-700">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>

            {/* Select Trigger Box */}
            <button
                type="button"
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={label}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-xs flex items-center justify-between transition-all cursor-pointer ${error ? "border-rose-500 bg-rose-50/30" : "border-slate-200 hover:border-indigo-300 focus:border-indigo-600 bg-slate-50"
                    }`}
            >
                <span className={`truncate font-medium ${selectedOption ? "text-slate-900" : "text-slate-400"}`}>
                    {selectedOption
                        ? `${selectedOption.name}${selectedOption.code ? ` (${selectedOption.code})` : ""}`
                        : placeholder}
                </span>
                <CaretDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Dropdown Menu Box with Search Input */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 space-y-2 max-h-60 overflow-y-auto">
                    <div className="relative">
                        <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={`Search ${label}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                        />
                    </div>

                    <div className="space-y-0.5 max-h-40 overflow-y-auto" role="listbox">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    role="option"
                                    aria-selected={opt.id === value}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`w-full px-3 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${idx === activeIndex
                                            ? "bg-indigo-50 font-bold text-indigo-700"
                                            : opt.id === value
                                                ? "bg-slate-100 font-bold text-slate-900"
                                                : "text-slate-700 font-medium hover:bg-slate-50"
                                        }`}
                                >
                                    <span className="truncate">
                                        {opt.name} {opt.code && <span className="text-[11px] text-slate-400 font-mono">({opt.code})</span>}
                                    </span>
                                    {opt.id === value && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />}
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 italic text-center py-3">No matching options</p>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        </div>
    );
}
