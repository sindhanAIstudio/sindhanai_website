"use client";

import { useState } from "react";
import {
    MagnifyingGlass,
    Funnel,
    DownloadSimple,
    UploadSimple,
    Trash,
    ArrowClockwise,
    CaretLeft,
    CaretRight,
    Plus,
    X,
    FileCsv,
    CheckCircle,
    WarningCircle,
    UserCheck,
} from "@phosphor-icons/react";

export interface Column<T> {
    header: React.ReactNode;
    accessorKey?: keyof T | string;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

export interface FilterOption {
    label: string;
    key: string;
    options: { label: string; value: string }[];
}

interface ReusableDataTableProps<T> {
    title: string;
    subtitle?: string;
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    filters?: FilterOption[];
    activeFilters?: Record<string, string>;
    onFilterChange?: (key: string, value: string) => void;
    isTrashView?: boolean;
    onToggleTrashView?: (trash: boolean) => void;
    onAddClick?: () => void;
    onExportCSV?: () => void;
    onImportCSV?: (records: any[]) => Promise<{ successCount: number; failCount: number; errors: any[] }>;
    sampleCSVFields?: string[];
}

export default function ReusableDataTable<T extends { id: string }>({
    title,
    subtitle,
    data,
    columns,
    loading = false,
    totalCount,
    currentPage,
    totalPages,
    onPageChange,
    onSearchChange,
    filters = [],
    activeFilters = {},
    onFilterChange,
    isTrashView = false,
    onToggleTrashView,
    onAddClick,
    onExportCSV,
    onImportCSV,
    sampleCSVFields = ["name", "email", "personalEmail", "rollNumber", "registrationNumber", "yearOfPassing", "mobileNumber", "departmentCode", "classGroupCode", "slotTimingCode"],
}: ReusableDataTableProps<T>) {
    const [searchValue, setSearchValue] = useState("");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importRecords, setImportRecords] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        onSearchChange(e.target.value);
    };

    // CSV File Reader
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const lines = text.split("\n").filter((l) => l.trim().length > 0);
            if (lines.length <= 1) return;

            const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
            const parsedRows = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
                const rowObj: any = {};
                headers.forEach((h, idx) => {
                    rowObj[h] = values[idx] || "";
                });
                parsedRows.push(rowObj);
            }

            setImportRecords(parsedRows);
        };
        reader.readAsText(file);
    };

    const handleDownloadSampleCSV = () => {
        const csvContent = sampleCSVFields.join(",") + "\n" +
            "Aravind Raj,aravind@sindhanai.com,aravind.personal@gmail.com,21CS001,REG2021001,2025,+919876543210,CSE,CLASS_A,SLOT_MORNING_A";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "student_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExecuteImport = async () => {
        if (!onImportCSV || importRecords.length === 0) return;
        setImporting(true);
        setImportResult(null);
        try {
            const result = await onImportCSV(importRecords);
            setImportResult(result);
        } catch (err: any) {
            setImportResult({ successCount: 0, failCount: importRecords.length, errors: [{ row: 0, reason: err.message || "Import failed" }] });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header & Main Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        {title}
                        {isTrashView && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                Trash View
                            </span>
                        )}
                    </h1>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {onToggleTrashView && (
                        <button
                            type="button"
                            onClick={() => onToggleTrashView(!isTrashView)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${isTrashView
                                ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                        >
                            {isTrashView ? <UserCheck className="w-4 h-4 text-amber-600" /> : <Trash className="w-4 h-4 text-slate-500" />}
                            <span>{isTrashView ? "View Active Records" : "View Trash"}</span>
                        </button>
                    )}

                    {onExportCSV && (
                        <button
                            type="button"
                            onClick={onExportCSV}
                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <DownloadSimple className="w-4 h-4 text-slate-600" /> Export CSV
                        </button>
                    )}

                    {onImportCSV && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowImportModal(true);
                                setImportRecords([]);
                                setImportResult(null);
                            }}
                            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <UploadSimple className="w-4 h-4 text-indigo-600" /> Import CSV
                        </button>
                    )}

                    {onAddClick && !isTrashView && (
                        <button
                            type="button"
                            onClick={onAddClick}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Add New Record
                        </button>
                    )}
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                    <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Search by name, email, roll number..."
                        value={searchValue}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                </div>

                {filters.length > 0 && onFilterChange && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Funnel className="w-4 h-4 text-slate-400 shrink-0" />
                        {filters.map((f) => (
                            <select
                                key={f.key}
                                value={activeFilters[f.key] || ""}
                                onChange={(e) => onFilterChange(f.key, e.target.value)}
                                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
                            >
                                <option value="">All {f.label}</option>
                                {f.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ))}
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                {columns.map((col, idx) => (
                                    <th key={idx} className="px-4 py-3.5">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowClockwise className="w-4 h-4 animate-spin text-indigo-600" />
                                            <span>Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        {columns.map((col, idx) => (
                                            <td key={idx} className="px-4 py-3.5 font-medium text-slate-800">
                                                {col.cell ? col.cell(item) : (item as any)[col.accessorKey as string] || "—"}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                        Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
                        <span className="font-bold text-slate-900">{totalPages || 1}</span> ({totalCount} total entries)
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
                        >
                            <CaretLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
                        >
                            <CaretRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* CSV Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden space-y-4 p-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <FileCsv className="w-5 h-5 text-indigo-600" /> User-Friendly CSV Bulk Import
                                </h2>
                                <p className="text-xs text-slate-500">Upload a CSV file to create student records in bulk.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowImportModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* File Selector & Download Sample */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Need the correct column format?</p>
                                <p className="text-[11px] text-slate-500">Download the pre-formatted CSV template file.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadSampleCSV}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                            >
                                Download Template CSV
                            </button>
                        </div>

                        {/* File Upload Box */}
                        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-6 text-center space-y-2 transition-colors cursor-pointer bg-slate-50/50">
                            <UploadSimple className="w-8 h-8 text-indigo-600 mx-auto" />
                            <p className="text-xs font-semibold text-slate-800">Select CSV file from your computer</p>
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-file-input" />
                            <label htmlFor="csv-file-input" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer transition-all">
                                Choose File
                            </label>
                        </div>

                        {/* Preview Table */}
                        {importRecords.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-800">Preview Parsed Records ({importRecords.length} rows):</p>
                                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                                            <tr>
                                                <th className="px-3 py-2">Name</th>
                                                <th className="px-3 py-2">Email</th>
                                                <th className="px-3 py-2">Roll No</th>
                                                <th className="px-3 py-2">Reg No</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {importRecords.slice(0, 5).map((row, i) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-1.5 font-medium">{row.name || "—"}</td>
                                                    <td className="px-3 py-1.5">{row.email || "—"}</td>
                                                    <td className="px-3 py-1.5">{row.rollNumber || "—"}</td>
                                                    <td className="px-3 py-1.5">{row.registrationNumber || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Result Summary */}
                        {importResult && (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>Import Complete: {importResult.summary?.successCount || 0} succeeded, {importResult.summary?.failCount || 0} failed.</span>
                                </div>
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <div className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-rose-700">
                                        {importResult.errors.map((err: any, i: number) => (
                                            <p key={i} className="flex items-center gap-1.5">
                                                <WarningCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                <span>Row {err.row} ({err.email}): {err.reason}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                disabled={importing || importRecords.length === 0}
                                onClick={handleExecuteImport}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                            >
                                {importing ? "Processing Bulk Upload..." : `Import ${importRecords.length} Records`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
