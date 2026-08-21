"use client";

import { useState } from "react";
import {
    X,
    FileCsv,
    UploadSimple,
    DownloadSimple,
    CheckCircle,
    WarningCircle,
    PencilSimple,
    ArrowRight,
    Table,
} from "@phosphor-icons/react";

interface SeniorCsvImporterModalProps {
    isOpen: boolean;
    onClose: () => void;
    metadata: {
        departments: any[];
        classGroups: any[];
        slotTimings: any[];
        soiDomains: any[];
        domainPlacements: any[];
    };
    onImportSuccess: () => void;
}

export default function SeniorCsvImporterModal({
    isOpen,
    onClose,
    metadata,
    onImportSuccess,
}: SeniorCsvImporterModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map & Grid, 3: Importing/Result
    const [csvRows, setCsvRows] = useState<any[]>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any | null>(null);

    const studentFields = [
        { key: "name", label: "Full Name", required: true },
        { key: "email", label: "Institutional Email", required: true },
        { key: "personalEmail", label: "Personal Email", required: false },
        { key: "rollNumber", label: "Roll Number", required: true },
        { key: "registrationNumber", label: "Registration Number", required: true },
        { key: "yearOfPassing", label: "Year of Passing", required: false },
        { key: "mobileNumber", label: "Mobile Number", required: false },
        { key: "departmentCode", label: "Department Code", required: false },
        { key: "classGroupCode", label: "Section Code", required: false },
        { key: "slotTimingCode", label: "Slot Timing Code", required: false },
        { key: "soiDomainCode", label: "SOI Lab Code", required: false },
    ];

    if (!isOpen) return null;

    const handleDownloadTemplate = () => {
        const headers = [
            "name",
            "email",
            "personalEmail",
            "rollNumber",
            "registrationNumber",
            "yearOfPassing",
            "mobileNumber",
            "departmentCode",
            "classGroupCode",
            "slotTimingCode",
            "soiDomainCode",
        ];

        const sampleRow = [
            "Arun Kumar",
            "arun@sindhanai.com",
            "arun.personal@gmail.com",
            "21CS088",
            "REG717821CS088",
            "2025",
            "+919876543210",
            metadata.departments[0]?.code || "CSE",
            metadata.classGroups[0]?.code || "CLASS_A",
            metadata.slotTimings[0]?.code || "SLOT_MORNING_A",
            metadata.soiDomains[0]?.code || "AI_DS",
        ];

        const csvContent = headers.join(",") + "\n" + sampleRow.join(",");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "student_bulk_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const lines = text.split("\n").filter((l) => l.trim().length > 0);
            if (lines.length <= 1) return;

            const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
            setCsvHeaders(headers);

            // Auto mapping
            const initialMap: Record<string, string> = {};
            headers.forEach((h) => {
                const lower = h.toLowerCase();
                const match = studentFields.find(
                    (f) => f.key.toLowerCase() === lower || f.label.toLowerCase() === lower
                );
                if (match) initialMap[h] = match.key;
                else initialMap[h] = h;
            });
            setHeaderMapping(initialMap);

            const parsedRows = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
                const rowObj: any = {};
                headers.forEach((h, idx) => {
                    const mappedField = initialMap[h] || h;
                    rowObj[mappedField] = values[idx] || "";
                });
                parsedRows.push(rowObj);
            }

            setCsvRows(parsedRows);
            setStep(2);
        };
        reader.readAsText(file);
    };

    const handleCellChange = (rowIndex: number, fieldKey: string, newValue: string) => {
        setCsvRows((prev) => {
            const updated = [...prev];
            updated[rowIndex] = { ...updated[rowIndex], [fieldKey]: newValue };
            return updated;
        });
    };

    const getRowError = (row: any) => {
        if (!row.name || row.name.trim().length < 2) return "Missing Name";
        if (!row.email || !/\S+@\S+\.\S+/.test(row.email)) return "Invalid Email";
        if (!row.rollNumber) return "Missing Roll Number";
        if (!row.registrationNumber) return "Missing Reg Number";
        return null;
    };

    const handleExecuteImport = async () => {
        setImporting(true);
        setStep(3);
        try {
            const res = await fetch("/api/admin/students/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ records: csvRows }),
            });

            const data = await res.json();
            setImportResult(data);
            if (res.ok) {
                onImportSuccess();
            }
        } catch (err) {
            setImportResult({ error: "Import network failure" });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                            <FileCsv className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">Enterprise Bulk CSV Importer</h2>
                            <p className="text-xs text-slate-500">Real-time header mapping, validation & inline pre-import grid.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* STEP 1: UPLOAD & TEMPLATE DOWNLOAD */}
                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                            <div>
                                <p className="text-xs font-bold text-indigo-900">Pre-Formatted Import Template</p>
                                <p className="text-[11px] text-indigo-700">Download CSV prepopulated with active department & lab codes.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <DownloadSimple className="w-4 h-4" /> Download Template
                            </button>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-600 rounded-3xl p-10 text-center space-y-3 bg-slate-50/50 transition-all cursor-pointer">
                            <UploadSimple className="w-10 h-10 text-indigo-600 mx-auto" />
                            <div>
                                <p className="text-sm font-bold text-slate-900">Drop your CSV file here or Browse</p>
                                <p className="text-xs text-slate-500">Supports standard UTF-8 CSV documents.</p>
                            </div>
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="senior-csv-input" />
                            <label
                                htmlFor="senior-csv-input"
                                className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-all"
                            >
                                Choose CSV File
                            </label>
                        </div>
                    </div>
                )}

                {/* STEP 2: PRE-IMPORT INTERACTIVE GRID */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Table className="w-4 h-4 text-indigo-600" /> Interactive Pre-Import Data Grid ({csvRows.length} rows)
                            </span>
                            <span className="text-[11px] text-slate-400 italic">Click any cell to edit directly before importing.</span>
                        </div>

                        <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase sticky top-0 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2.5">Status</th>
                                        <th className="px-3 py-2.5">Name *</th>
                                        <th className="px-3 py-2.5">Email *</th>
                                        <th className="px-3 py-2.5">Roll No *</th>
                                        <th className="px-3 py-2.5">Reg No *</th>
                                        <th className="px-3 py-2.5">Dept Code</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {csvRows.map((row, i) => {
                                        const err = getRowError(row);
                                        return (
                                            <tr key={i} className={err ? "bg-rose-50/40" : "hover:bg-slate-50/80"}>
                                                <td className="px-3 py-2">
                                                    {err ? (
                                                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-1 w-fit">
                                                            <WarningCircle className="w-3 h-3" /> {err}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1 w-fit">
                                                            <CheckCircle className="w-3 h-3" /> Valid
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.name || ""}
                                                        onChange={(e) => handleCellChange(i, "name", e.target.value)}
                                                        className="w-full px-2 py-1 rounded bg-transparent border border-transparent focus:border-indigo-600 focus:bg-white text-xs font-semibold"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.email || ""}
                                                        onChange={(e) => handleCellChange(i, "email", e.target.value)}
                                                        className="w-full px-2 py-1 rounded bg-transparent border border-transparent focus:border-indigo-600 focus:bg-white text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.rollNumber || ""}
                                                        onChange={(e) => handleCellChange(i, "rollNumber", e.target.value)}
                                                        className="w-full px-2 py-1 rounded bg-transparent border border-transparent focus:border-indigo-600 focus:bg-white text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.registrationNumber || ""}
                                                        onChange={(e) => handleCellChange(i, "registrationNumber", e.target.value)}
                                                        className="w-full px-2 py-1 rounded bg-transparent border border-transparent focus:border-indigo-600 focus:bg-white text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.departmentCode || ""}
                                                        onChange={(e) => handleCellChange(i, "departmentCode", e.target.value)}
                                                        className="w-full px-2 py-1 rounded bg-transparent border border-transparent focus:border-indigo-600 focus:bg-white text-xs font-mono"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-slate-500 hover:underline">
                                ← Upload Different File
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteImport}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                                <span>Import Validated Records ({csvRows.length})</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: RESULT SUMMARY */}
                {step === 3 && (
                    <div className="py-6 text-center space-y-4">
                        {importing ? (
                            <p className="text-xs font-semibold text-slate-600">Processing bulk upload into database...</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <h3 className="font-bold text-sm">Bulk Import Operation Completed</h3>
                                    <p className="text-xs">
                                        Success: {importResult?.summary?.successCount || 0} created / updated. Failed: {importResult?.summary?.failCount || 0}.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                                >
                                    Done & Close
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
