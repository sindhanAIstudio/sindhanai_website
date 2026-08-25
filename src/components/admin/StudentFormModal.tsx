"use client";

import { useState, useEffect } from "react";
import {
    X,
    UploadSimple,
    FilePdf,
    User,
    CheckCircle,
    WarningCircle,
    SealCheck,
    CloudArrowUp,
    ArrowSquareOut,
    GraduationCap,
    BookmarkSimple,
} from "@phosphor-icons/react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import MultiSelect from "@/components/ui/MultiSelect";
import ImageCropperModal from "@/components/ui/ImageCropperModal";

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingStudent: any | null;
    metadata: {
        departments: any[];
        batches: any[];
        classGroups: any[];
        slotTimings: any[];
        soiDomains: any[];
        domainPlacements: any[];
        interestedRoles: any[];
    };
    onSaveSuccess: () => void;
}

export default function StudentFormModal({
    isOpen,
    onClose,
    editingStudent,
    metadata,
    onSaveSuccess,
}: StudentFormModalProps) {
    const countryCodes = [
        { code: "+91", label: "India (+91)" },
        { code: "+1", label: "USA/Canada (+1)" },
        { code: "+44", label: "UK (+44)" },
        { code: "+971", label: "UAE (+971)" },
        { code: "+65", label: "Singapore (+65)" },
        { code: "+61", label: "Australia (+61)" },
    ];

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        personalEmail: "",
        rollNumber: "",
        registrationNumber: "",
        yearOfPassing: "2025",
        countryCode: "+91",
        mobileRaw: "",
        tenthPercentage: "",
        twelfthPercentage: "",
        currentCgpa: "",
        githubUrl: "",
        kaggleUrl: "",
        leetcodeUrl: "",
        linkedinUrl: "",
        residentialStatus: "Dayscholar",
        address: "",
        resumeUrl: "",
        profilePicUrl: "",
        departmentId: "",
        batchId: "",
        classGroupId: "",
        slotTimingId: "",
        soiDomainId: "",
        domainPlacementId: "",
        interestedRoleIds: [] as string[],
        statusNote: "",
        skills: [] as string[],
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [uploadingPic, setUploadingPic] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Profile Picture 1:1 Cropper Modal State
    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropperSrc, setCropperSrc] = useState<string | null>(null);

    useEffect(() => {
        if (editingStudent) {
            let phoneCode = "+91";
            let rawPhone = editingStudent.mobileNumber || "";
            if (rawPhone.startsWith("+")) {
                const parts = rawPhone.split(" ");
                if (parts.length > 1) {
                    phoneCode = parts[0];
                    rawPhone = parts.slice(1).join("");
                }
            }

            const existingRoles = editingStudent.interestedRoles && Array.isArray(editingStudent.interestedRoles)
                ? editingStudent.interestedRoles.map((r: any) => r.id)
                : editingStudent.interestedRoleId ? [editingStudent.interestedRoleId] : [];

            setFormData({
                name: editingStudent.name || "",
                email: editingStudent.email || "",
                personalEmail: editingStudent.personalEmail || "",
                rollNumber: editingStudent.rollNumber || "",
                registrationNumber: editingStudent.registrationNumber || "",
                yearOfPassing: editingStudent.yearOfPassing ? editingStudent.yearOfPassing.toString() : "2025",
                countryCode: phoneCode,
                mobileRaw: rawPhone,
                tenthPercentage: editingStudent.tenthPercentage ? editingStudent.tenthPercentage.toString() : "",
                twelfthPercentage: editingStudent.twelfthPercentage ? editingStudent.twelfthPercentage.toString() : "",
                currentCgpa: editingStudent.currentCgpa ? editingStudent.currentCgpa.toString() : "",
                githubUrl: editingStudent.githubUrl || "",
                kaggleUrl: editingStudent.kaggleUrl || "",
                leetcodeUrl: editingStudent.leetcodeUrl || "",
                linkedinUrl: editingStudent.linkedinUrl || "",
                residentialStatus: editingStudent.residentialStatus || "Dayscholar",
                address: editingStudent.address || "",
                resumeUrl: editingStudent.resumeUrl || "",
                profilePicUrl: editingStudent.profilePicUrl || "",
                departmentId: editingStudent.departmentId || "",
                batchId: editingStudent.batchId || "",
                classGroupId: editingStudent.classGroupId || "",
                slotTimingId: editingStudent.slotTimingId || "",
                soiDomainId: editingStudent.soiDomainId || "",
                domainPlacementId: editingStudent.domainPlacementId || "",
                interestedRoleIds: existingRoles,
                statusNote: editingStudent.statusNote || "",
                skills: editingStudent.skills ? editingStudent.skills.map((s: any) => s.skillName) : [],
            });
        } else {
            // Default to empty strings so dropdowns show clean placeholders without pre-selected items
            setFormData({
                name: "",
                email: "",
                personalEmail: "",
                rollNumber: "",
                registrationNumber: "",
                yearOfPassing: "2025",
                countryCode: "+91",
                mobileRaw: "",
                tenthPercentage: "",
                twelfthPercentage: "",
                currentCgpa: "",
                githubUrl: "",
                kaggleUrl: "",
                leetcodeUrl: "",
                linkedinUrl: "",
                residentialStatus: "Dayscholar",
                address: "",
                resumeUrl: "",
                profilePicUrl: "",
                departmentId: "",
                batchId: "",
                classGroupId: "",
                slotTimingId: "",
                soiDomainId: "",
                domainPlacementId: "",
                interestedRoleIds: [],
                statusNote: "",
                skills: [],
            });
        }
        setFieldErrors({});
        setModalError(null);
    }, [editingStudent, metadata, isOpen]);

    if (!isOpen) return null;

    // Real-time On-Input Field Validator
    const validateField = (field: string, value: string) => {
        let err = "";
        switch (field) {
            case "name":
                if (!value.trim()) err = "Full Name is required";
                else if (value.trim().length < 2) err = "Name must be at least 2 characters";
                break;
            case "email":
                if (!value.trim()) err = "Institutional email is required";
                else if (!/\S+@\S+\.\S+/.test(value)) err = "Invalid email format";
                break;
            case "personalEmail":
                if (!value.trim()) err = "Personal email is required";
                else if (!/\S+@\S+\.\S+/.test(value)) err = "Invalid email format";
                break;
            case "rollNumber":
                if (!value.trim()) err = "Roll Number is required";
                break;
            case "registrationNumber":
                if (!value.trim()) err = "Registration Number is required";
                break;
            case "mobileRaw":
                if (!value.trim()) err = "Mobile number is required";
                else if (!/^\d{10}$/.test(value.trim())) err = "Mobile number must be 10 digits";
                break;
            case "tenthPercentage":
                if (!value) err = "10th percentage is required";
                else if (parseFloat(value) < 0 || parseFloat(value) > 100) err = "Percentage must be between 0 and 100";
                break;
            case "twelfthPercentage":
                if (!value) err = "12th percentage is required";
                else if (parseFloat(value) < 0 || parseFloat(value) > 100) err = "Percentage must be between 0 and 100";
                break;
            case "currentCgpa":
                if (!value) err = "CGPA is required";
                else if (parseFloat(value) < 0 || parseFloat(value) > 10) err = "CGPA must be between 0.0 and 10.0";
                break;
        }

        setFieldErrors((prev) => ({ ...prev, [field]: err }));
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    // Profile Picture Select & Crop Handlers
    const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setModalError(null);

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setCropperSrc(reader.result as string);
                setCropperOpen(true);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleCropComplete = async (croppedFile: File) => {
        setModalError(null);

        // Strict 1.5MB Limit Check for Cropped Profile Picture
        const MAX_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
        if (croppedFile.size > MAX_SIZE_BYTES) {
            setModalError(`Cropped profile picture file size (${(croppedFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the strict 1.5MB limit. Please re-crop or select a smaller image.`);
            return;
        }

        setUploadingPic(true);
        try {
            const body = new FormData();
            body.append("file", croppedFile);
            body.append("type", "profilePic");

            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json();

            if (res.ok && data.url) {
                setFormData((prev) => ({ ...prev, profilePicUrl: data.url }));
                setFieldErrors((prev) => ({ ...prev, profilePicUrl: "" }));
            } else {
                setModalError(data.error || "Profile picture upload failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setModalError("Network error while uploading profile picture. Please try again.");
        } finally {
            setUploadingPic(false);
        }
    };

    // File Upload Handler for Resume
    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setModalError(null);
        setUploadingResume(true);

        try {
            const body = new FormData();
            body.append("file", file);
            body.append("type", "resume");

            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json();

            if (res.ok && data.url) {
                setFormData((prev) => ({ ...prev, resumeUrl: data.url }));
                setFieldErrors((prev) => ({ ...prev, resumeUrl: "" }));
            } else {
                setModalError(data.error || "Resume upload failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setModalError("Network error while uploading resume. Please try again.");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setModalError(null);

        // Validate mandatory fields
        if (
            !formData.name ||
            !formData.email ||
            !formData.personalEmail ||
            !formData.rollNumber ||
            !formData.registrationNumber ||
            !formData.mobileRaw ||
            !formData.tenthPercentage ||
            !formData.twelfthPercentage ||
            !formData.currentCgpa ||
            !formData.resumeUrl ||
            !formData.profilePicUrl
        ) {
            setModalError("All mandatory fields and file uploads (Profile Picture & Resume) must be completed.");
            setSaving(false);
            return;
        }

        const payload = {
            ...formData,
            mobileNumber: `${formData.countryCode} ${formData.mobileRaw}`,
        };

        try {
            const url = editingStudent
                ? `/api/admin/students/${editingStudent.id}`
                : `/api/admin/students`;
            const method = editingStudent ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setModalError(data.error || "Failed to save student details.");
                return;
            }

            onSaveSuccess();
            onClose();
        } catch {
            setModalError("Network error while submitting student record.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl my-6 overflow-hidden space-y-6 p-8 md:p-10">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            {editingStudent ? "Edit Student Profile" : "Register New Student Record"}
                        </h2>
                        <p className="text-xs text-slate-500">Comprehensive student profile with institutional metadata allocation.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {modalError && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                        <WarningCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{modalError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-3">
                    {/* TOP HERO SECTION: FILE UPLOADS (Profile Pic & Resume) */}
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                            1. Profile Picture & Document Uploads *
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Profile Picture Upload Box (Max 1.5MB) */}
                            <div className="flex items-center gap-5 p-4 bg-white rounded-2xl border border-slate-200">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-indigo-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                                    {formData.profilePicUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={formData.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>

                                <div className="space-y-2 flex-1">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Profile Picture *</p>
                                        <p className="text-[11px] text-slate-500">PNG, JPG, or WebP up to <span className="font-bold text-indigo-600">1.5MB limit</span>.</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePicSelect}
                                            className="hidden"
                                            id="profile-pic-upload"
                                        />
                                        <label
                                            htmlFor="profile-pic-upload"
                                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                        >
                                            <UploadSimple className="w-4 h-4" />
                                            <span>{uploadingPic ? "Uploading..." : formData.profilePicUrl ? "Crop / Change Photo" : "Upload Photo"}</span>
                                        </label>
                                        {formData.profilePicUrl && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                    </div>
                                </div>
                            </div>

                            {/* Resume Document Upload Box */}
                            <div className="flex items-center gap-5 p-4 bg-white rounded-2xl border border-slate-200">
                                <div className="w-20 h-20 rounded-2xl bg-rose-50 border-2 border-dashed border-rose-200 shrink-0 flex items-center justify-center">
                                    <FilePdf className="w-9 h-9 text-rose-600" />
                                </div>

                                <div className="space-y-2 flex-1">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Student Resume (PDF) *</p>
                                        <p className="text-[11px] text-slate-500">PDF or Word document.</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleResumeUpload}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label
                                            htmlFor="resume-upload"
                                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                        >
                                            <CloudArrowUp className="w-4 h-4 text-indigo-400" />
                                            <span>{uploadingResume ? "Uploading..." : formData.resumeUrl ? "Change File" : "Upload Resume"}</span>
                                        </label>
                                        {formData.resumeUrl && (
                                            <a href={formData.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-semibold underline flex items-center gap-1">
                                                View <ArrowSquareOut className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: BASIC IDENTIFICATION */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Basic Identification</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="Deepak Raj"
                                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white transition-all ${fieldErrors.name ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.name && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.name}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Institutional Email (SOI) *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="deepak@sindhanai.com"
                                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white transition-all ${fieldErrors.email ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.email && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Personal Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.personalEmail}
                                    onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                                    placeholder="deepak.personal@gmail.com"
                                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white transition-all ${fieldErrors.personalEmail ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.personalEmail && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.personalEmail}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Roll Number *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.rollNumber}
                                    onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                                    placeholder="21CS042"
                                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white transition-all ${fieldErrors.rollNumber ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.rollNumber && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.rollNumber}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Registration Number *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.registrationNumber}
                                    onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                                    placeholder="REG717821CS042"
                                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white transition-all ${fieldErrors.registrationNumber ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.registrationNumber && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.registrationNumber}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Year of Passing *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.yearOfPassing}
                                    onChange={(e) => handleInputChange("yearOfPassing", e.target.value)}
                                    placeholder="2025"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: INSTITUTIONAL & SOI LAB METADATA DROPDOWNS */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Institutional Allocation & SOI Lab</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SearchableSelect
                                label="Department"
                                required
                                options={metadata.departments}
                                value={formData.departmentId}
                                onChange={(val) => handleInputChange("departmentId", val)}
                                placeholder="Select Department..."
                            />

                            <SearchableSelect
                                label="Batch"
                                required
                                options={metadata.batches || []}
                                value={formData.batchId}
                                onChange={(val) => handleInputChange("batchId", val)}
                                placeholder="Select Batch..."
                            />

                            <SearchableSelect
                                label="Section / Class Group"
                                required
                                options={metadata.classGroups}
                                value={formData.classGroupId}
                                onChange={(val) => handleInputChange("classGroupId", val)}
                                placeholder="Select Section..."
                            />

                            <SearchableSelect
                                label="Slot Timing"
                                required
                                options={metadata.slotTimings}
                                value={formData.slotTimingId}
                                onChange={(val) => handleInputChange("slotTimingId", val)}
                                placeholder="Select Slot Timing..."
                            />

                            <SearchableSelect
                                label="SOI Lab / SOI Domain"
                                required
                                options={metadata.soiDomains}
                                value={formData.soiDomainId}
                                onChange={(val) => handleInputChange("soiDomainId", val)}
                                placeholder="Select SOI Lab..."
                            />

                            <SearchableSelect
                                label="Domain Placement (Optional)"
                                options={metadata.domainPlacements}
                                value={formData.domainPlacementId}
                                onChange={(val) => handleInputChange("domainPlacementId", val)}
                                placeholder="Select Domain Placement (Optional)..."
                            />

                            <MultiSelect
                                label="Interested Roles"
                                required
                                options={metadata.interestedRoles || []}
                                value={formData.interestedRoleIds || []}
                                onChange={(val) => setFormData((prev) => ({ ...prev, interestedRoleIds: val }))}
                                placeholder="Select Interested Roles..."
                            />
                        </div>
                    </div>

                    {/* SECTION 4: CONTACT & ACADEMICS */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Contact, Academic Metrics & Status Notes</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700">WhatsApp Mobile *</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.countryCode}
                                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                        className="px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium shrink-0"
                                    >
                                        {countryCodes.map((c) => (
                                            <option key={c.code} value={c.code}>{c.code}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.mobileRaw}
                                        onChange={(e) => handleInputChange("mobileRaw", e.target.value)}
                                        placeholder="9876543210"
                                        className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white ${fieldErrors.mobileRaw ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                            }`}
                                    />
                                </div>
                                {fieldErrors.mobileRaw && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.mobileRaw}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">10th Percentage *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.tenthPercentage}
                                    onChange={(e) => handleInputChange("tenthPercentage", e.target.value)}
                                    placeholder="92.5"
                                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white ${fieldErrors.tenthPercentage ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.tenthPercentage && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.tenthPercentage}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">12th Percentage *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.twelfthPercentage}
                                    onChange={(e) => handleInputChange("twelfthPercentage", e.target.value)}
                                    placeholder="89.0"
                                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white ${fieldErrors.twelfthPercentage ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.twelfthPercentage && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.twelfthPercentage}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Current CGPA *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.currentCgpa}
                                    onChange={(e) => handleInputChange("currentCgpa", e.target.value)}
                                    placeholder="8.75"
                                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-xs focus:outline-none focus:bg-white ${fieldErrors.currentCgpa ? "border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-indigo-600"
                                        }`}
                                />
                                {fieldErrors.currentCgpa && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.currentCgpa}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700">Permanent Address *</label>
                                <textarea
                                    rows={2}
                                    required
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    placeholder="Full residential address..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <BookmarkSimple className="w-3.5 h-3.5 text-indigo-600" /> Active / Status Note
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.statusNote}
                                    onChange={(e) => handleInputChange("statusNote", e.target.value)}
                                    placeholder="e.g. Enrolled into Advanced GenAI lab track / Deactivation reason..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: DEVELOPER PROFILES */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">5. Developer Profiles & Portfolios</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700">GitHub Link *</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.githubUrl}
                                    onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                                    placeholder="https://github.com/..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700">LinkedIn Link *</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.linkedinUrl}
                                    onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700">LeetCode Link *</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.leetcodeUrl}
                                    onChange={(e) => handleInputChange("leetcodeUrl", e.target.value)}
                                    placeholder="https://leetcode.com/u/..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700">Kaggle Link *</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.kaggleUrl}
                                    onChange={(e) => handleInputChange("kaggleUrl", e.target.value)}
                                    placeholder="https://kaggle.com/..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Submit Bar */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer transition-all"
                        >
                            {saving ? "Saving Record..." : editingStudent ? "Update Student Profile" : "Create Student Record"}
                        </button>
                    </div>
                </form>
            </div>

            {/* 1:1 Aspect Ratio Profile Picture Cropper Modal */}
            <ImageCropperModal
                isOpen={cropperOpen}
                imageSrc={cropperSrc}
                onClose={() => setCropperOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}
