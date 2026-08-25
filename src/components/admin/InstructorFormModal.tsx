"use client";

import { useState, useEffect } from "react";
import {
    X,
    UploadSimple,
    User,
    Envelope,
    Phone,
    Briefcase,
    Flask,
    GraduationCap,
    LinkedinLogo,
    GithubLogo,
    Clock,
    FileText,
    Crop,
    ShieldCheck,
    Key,
} from "@phosphor-icons/react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ImageCropperModal from "@/components/ui/ImageCropperModal";

interface InstructorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingInstructor?: any | null;
    metadata: {
        soiDomains: { id: string; name: string }[];
        departments: { id: string; name: string }[];
    };
}

export default function InstructorFormModal({
    isOpen,
    onClose,
    onSuccess,
    editingInstructor,
    metadata,
}: InstructorFormModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        personalEmail: "",
        countryCode: "+91",
        mobileRaw: "",
        designation: "",
        instructorType: "SOI", // "SOI" | "Scope"
        isAdminRole: false, // true -> "ADMIN", false -> "INSTRUCTOR"
        soiDomainId: "",
        departmentId: "",
        experienceYears: "",
        bio: "",
        profilePicUrl: "",
        linkedinUrl: "",
        githubUrl: "",
        statusNote: "",
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [uploadingPic, setUploadingPic] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Profile Picture 1:1 Cropper Modal State
    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropperSrc, setCropperSrc] = useState<string | null>(null);

    useEffect(() => {
        if (editingInstructor) {
            let phoneCode = "+91";
            let rawPhone = editingInstructor.mobileNumber || "";
            if (rawPhone.startsWith("+")) {
                const parts = rawPhone.split(" ");
                if (parts.length > 1) {
                    phoneCode = parts[0];
                    rawPhone = parts.slice(1).join("");
                }
            }

            setFormData({
                name: editingInstructor.name || "",
                email: editingInstructor.email || "",
                password: "",
                personalEmail: editingInstructor.personalEmail || "",
                countryCode: phoneCode,
                mobileRaw: rawPhone,
                designation: editingInstructor.designation || "",
                instructorType: editingInstructor.instructorType || "SOI",
                isAdminRole: editingInstructor.role?.name === "ADMIN",
                soiDomainId: editingInstructor.soiDomainId || "",
                departmentId: editingInstructor.departmentId || "",
                experienceYears: editingInstructor.experienceYears ? editingInstructor.experienceYears.toString() : "",
                bio: editingInstructor.bio || "",
                profilePicUrl: editingInstructor.profilePicUrl || "",
                linkedinUrl: editingInstructor.linkedinUrl || "",
                githubUrl: editingInstructor.githubUrl || "",
                statusNote: editingInstructor.statusNote || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                personalEmail: "",
                countryCode: "+91",
                mobileRaw: "",
                designation: "Instructor",
                instructorType: "SOI",
                isAdminRole: false,
                soiDomainId: "",
                departmentId: "",
                experienceYears: "",
                bio: "",
                profilePicUrl: "",
                linkedinUrl: "",
                githubUrl: "",
                statusNote: "",
            });
        }
        setFieldErrors({});
        setModalError(null);
    }, [editingInstructor, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Trigger file selection for Profile Picture & open 1:1 cropper
    const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setModalError("Initial image file size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCropperSrc(reader.result as string);
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);

        // Reset file input
        e.target.value = "";
    };

    // Handler when user confirms 1:1 cropped blob from ImageCropperModal
    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropperOpen(false);
        setCropperSrc(null);
        setUploadingPic(true);
        setModalError(null);

        try {
            if (croppedBlob.size > 1.5 * 1024 * 1024) {
                setModalError("Cropped profile picture exceeds 1.5MB limit. Please compress or zoom out.");
                setUploadingPic(false);
                return;
            }

            const uploadFormData = new FormData();
            const croppedFile = new File([croppedBlob], `profile_cropped_1x1.png`, { type: "image/png" });
            uploadFormData.append("file", croppedFile);
            uploadFormData.append("type", "profile");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Image upload failed");

            setFormData((prev) => ({ ...prev, profilePicUrl: data.url }));
        } catch (err: any) {
            setModalError(err.message || "Failed to upload cropped profile picture");
        } finally {
            setUploadingPic(false);
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = "Instructor Name is mandatory";

        if (!formData.profilePicUrl) {
            errors.profilePicUrl = "Profile picture is mandatory. Please upload and crop a 1:1 image.";
        }

        if (!formData.email.trim()) {
            errors.email = "Institutional Email is mandatory";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = "Enter a valid email address";
        }

        if (formData.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
            errors.personalEmail = "Enter a valid personal email format";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);

        if (!validateForm()) return;

        setSaving(true);
        try {
            const formattedMobile = formData.mobileRaw.trim()
                ? `${formData.countryCode} ${formData.mobileRaw.trim()}`
                : null;

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password.trim() || undefined,
                personalEmail: formData.personalEmail.trim() || null,
                mobileNumber: formattedMobile,
                designation: formData.designation.trim() || "Instructor",
                instructorType: formData.instructorType,
                roleName: formData.isAdminRole ? "ADMIN" : "INSTRUCTOR",
                soiDomainId: formData.soiDomainId || null,
                departmentId: formData.departmentId || null,
                experienceYears: formData.experienceYears ? parseFloat(formData.experienceYears) : null,
                bio: formData.bio.trim() || null,
                profilePicUrl: formData.profilePicUrl || null,
                linkedinUrl: formData.linkedinUrl.trim() || null,
                githubUrl: formData.githubUrl.trim() || null,
                statusNote: formData.statusNote.trim() || null,
            };

            const url = editingInstructor ? `/api/admin/instructors/${editingInstructor.id}` : "/api/admin/instructors";
            const method = editingInstructor ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save instructor record");

            onSuccess();
            onClose();
        } catch (err: any) {
            setModalError(err.message || "An unexpected error occurred");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {editingInstructor ? "Edit Instructor Profile" : "Register New Instructor"}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Configure faculty profile, domain allocation, and contact details
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {modalError && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center justify-between">
                                <span>{modalError}</span>
                                <button type="button" onClick={() => setModalError(null)}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* SECTION 1: PROFILE PICTURE & TYPE */}
                        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col md:flex-row items-center gap-6">
                            {/* 1:1 Profile Picture Upload Area */}
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div className={`relative group w-24 h-24 rounded-2xl bg-slate-200 border-2 overflow-hidden flex items-center justify-center shadow-inner ${fieldErrors.profilePicUrl ? "border-rose-500 ring-2 ring-rose-500/20" : "border-slate-300/80"}`}>
                                    {formData.profilePicUrl ? (
                                        <img src={formData.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-slate-400" />
                                    )}
                                    <label className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1 text-[11px] font-bold">
                                        <Crop className="w-5 h-5" />
                                        <span>Crop 1:1 *</span>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleProfilePicSelect}
                                            className="hidden"
                                            disabled={uploadingPic}
                                        />
                                    </label>
                                    {uploadingPic && (
                                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                {fieldErrors.profilePicUrl ? (
                                    <p className="text-[10px] text-rose-500 font-bold text-center max-w-[120px]">{fieldErrors.profilePicUrl}</p>
                                ) : (
                                    <span className="text-[10px] text-rose-500 font-extrabold">* Required (1:1)</span>
                                )}
                            </div>

                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                            Instructor Type
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Select faculty affiliation type
                                        </p>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Max profile size: 1.5MB (1:1 Ratio)
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <label
                                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${formData.instructorType === "SOI"
                                            ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/10 text-indigo-900"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="instructorType"
                                                value="SOI"
                                                checked={formData.instructorType === "SOI"}
                                                onChange={() => handleInputChange("instructorType", "SOI")}
                                                className="accent-indigo-600"
                                            />
                                            <div>
                                                <p className="text-xs font-bold">SOI Staff</p>
                                                <p className="text-[10px] text-slate-500">Internal Domain Faculty</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">SOI</span>
                                    </label>

                                    <label
                                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${formData.instructorType === "Scope"
                                            ? "border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/10 text-purple-900"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="instructorType"
                                                value="Scope"
                                                checked={formData.instructorType === "Scope"}
                                                onChange={() => handleInputChange("instructorType", "Scope")}
                                                className="accent-purple-600"
                                            />
                                            <div>
                                                <p className="text-xs font-bold">Scope Faculty</p>
                                                <p className="text-[10px] text-slate-500">External Visiting Mentor</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-extrabold">Scope</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: SYSTEM ROLE & ADMIN ACCESS */}
                        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-900">System Admin Role Assignment</p>
                                    <p className="text-[11px] text-slate-500 font-medium">Grant full Admin Console privileges to manage students, metadata, and settings</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isAdminRole}
                                    onChange={(e) => handleInputChange("isAdminRole", e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>

                        {/* SECTION 3: PERSONAL & CONTACT INFORMATION */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                1. Personal & Account Credentials
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Instructor Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Dr. K. Ashok Kumar"
                                        className={`w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs text-slate-800 font-semibold focus:outline-none transition-all ${fieldErrors.name ? "border-rose-500 bg-rose-50/50" : "border-slate-200 focus:border-indigo-600 focus:bg-white"
                                            }`}
                                    />
                                    {fieldErrors.name && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Designation / Role Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => handleInputChange("designation", e.target.value)}
                                        placeholder="e.g. Senior Domain Mentor"
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Login Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="instructor@domain.com"
                                        className={`w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs text-slate-800 font-semibold focus:outline-none transition-all ${fieldErrors.email ? "border-rose-500 bg-rose-50/50" : "border-slate-200 focus:border-indigo-600 focus:bg-white"
                                            }`}
                                    />
                                    {fieldErrors.email && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                                        <Key className="w-3.5 h-3.5 text-indigo-600" /> Account Password {editingInstructor ? "(Optional)" : ""}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        placeholder={editingInstructor ? "Leave empty to keep current password" : "Default: InstructorPass123!"}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Personal Email</label>
                                    <input
                                        type="email"
                                        value={formData.personalEmail}
                                        onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                                        placeholder="ashok.kumar@gmail.com"
                                        className={`w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs text-slate-800 font-semibold focus:outline-none transition-all ${fieldErrors.personalEmail ? "border-rose-500 bg-rose-50/50" : "border-slate-200 focus:border-indigo-600 focus:bg-white"
                                            }`}
                                    />
                                    {fieldErrors.personalEmail && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{fieldErrors.personalEmail}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp / Contact Number</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.countryCode}
                                            onChange={(e) => handleInputChange("countryCode", e.target.value)}
                                            className="h-10 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                                        >
                                            <option value="+91">+91 (IN)</option>
                                            <option value="+1">+1 (US)</option>
                                            <option value="+44">+44 (UK)</option>
                                            <option value="+971">+971 (UAE)</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={formData.mobileRaw}
                                            onChange={(e) => handleInputChange("mobileRaw", e.target.value)}
                                            placeholder="9876543210"
                                            className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Years of Experience</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={formData.experienceYears}
                                        onChange={(e) => handleInputChange("experienceYears", e.target.value)}
                                        placeholder="e.g. 6.5"
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: DOMAIN ALLOCATION & PROFILES */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                2. SOI Lab Allocation & Social Links
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SearchableSelect
                                    label="Assigned SOI Lab / Domain"
                                    options={metadata.soiDomains || []}
                                    value={formData.soiDomainId}
                                    onChange={(val) => handleInputChange("soiDomainId", val)}
                                    placeholder="Select SOI Lab..."
                                />

                                <SearchableSelect
                                    label="Associated Department"
                                    options={metadata.departments || []}
                                    value={formData.departmentId}
                                    onChange={(val) => handleInputChange("departmentId", val)}
                                    placeholder="Select Department..."
                                />

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                                        <LinkedinLogo className="w-4 h-4 text-sky-600" /> LinkedIn Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedinUrl}
                                        onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                                        <GithubLogo className="w-4 h-4 text-slate-800" /> GitHub Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.githubUrl}
                                        onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                                        placeholder="https://github.com/username"
                                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Profile Bio / Specialization Summary</label>
                                <textarea
                                    rows={3}
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange("bio", e.target.value)}
                                    placeholder="Specializes in AI/ML model deployment, computer vision, and Python fullstack development..."
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* SECTION 5: STATUS NOTE */}
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Internal Notes / Status Reason</label>
                            <input
                                type="text"
                                value={formData.statusNote}
                                onChange={(e) => handleInputChange("statusNote", e.target.value)}
                                placeholder="Optional note for admin reference..."
                                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                            />
                        </div>
                    </form>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            <span>{editingInstructor ? "Update Instructor" : "Save Instructor"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 1:1 Profile Picture Interactive Cropper Modal */}
            {cropperSrc && (
                <ImageCropperModal
                    isOpen={cropperOpen}
                    imageSrc={cropperSrc}
                    onClose={() => {
                        setCropperOpen(false);
                        setCropperSrc(null);
                    }}
                    onCropComplete={handleCropComplete}
                />
            )}
        </>
    );
}
