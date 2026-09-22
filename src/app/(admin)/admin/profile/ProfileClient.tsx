"use client";

import { useState, useEffect } from "react";
import { User, Key, Check, WarningCircle, ShieldCheck, Envelope, Phone, IdentificationCard, Briefcase, Buildings } from "@phosphor-icons/react";

export default function ProfileClient() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Edit details state
    const [name, setName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);

    // Password modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Toast State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
        show: false,
        message: "",
        type: "success",
    });

    const showNotification = (message: string, type: "success" | "error" = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/profile");
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
                setName(data.data.name || "");
                setMobileNumber(data.data.mobileNumber || "");
                setBio(data.data.bio || "");
            } else {
                showNotification(data.error || "Failed to load profile", "error");
            }
        } catch (err) {
            showNotification("Network error loading profile", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, mobileNumber, bio }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification("Profile updated successfully!");
                fetchProfile();
            } else {
                showNotification(data.error || "Failed to update profile", "error");
            }
        } catch (err) {
            showNotification("Network error saving profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showNotification("New passwords do not match", "error");
            return;
        }
        setPasswordLoading(true);
        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "CHANGE_PASSWORD",
                    currentPassword,
                    newPassword,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification("Password changed successfully!");
                setShowPasswordModal(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                showNotification(data.error || "Failed to change password", "error");
            }
        } catch (err) {
            showNotification("Network error updating password", "error");
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-4xl mx-auto">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">Loading profile details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* TOAST */}
            {toast.show && (
                <div
                    className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all ${
                        toast.type === "success" ? "bg-slate-900 text-emerald-400 border-emerald-500/30" : "bg-slate-900 text-red-400 border-red-500/30"
                    }`}
                >
                    {toast.type === "success" ? <Check className="w-5 h-5 text-emerald-400" /> : <WarningCircle className="w-5 h-5 text-red-400" />}
                    <span className="text-xs font-extrabold text-white">{toast.message}</span>
                </div>
            )}

            {/* Main Profile Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 border-2 border-indigo-400/40 flex items-center justify-center text-white text-3xl font-black shadow-inner shrink-0">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
                            {profile?.role?.name || "USER"} {profile?.instructorType ? `• ${profile.instructorType} Faculty` : ""}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {profile?.name || "User Profile"}
                        </h1>
                        <p className="text-xs text-indigo-200 font-medium">
                            {profile?.email} {profile?.empId ? `• Emp ID: ${profile.empId}` : ""}
                        </p>
                    </div>

                    <div className="sm:ml-auto">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
                        >
                            <Key className="w-4 h-4" /> Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Info Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Card: Account Metadata */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
                    <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <IdentificationCard className="w-4 h-4 text-indigo-600" /> Account Metadata
                    </h3>

                    <div className="space-y-4 text-xs">
                        <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Email Address</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                <Envelope className="w-3.5 h-3.5 text-slate-400" /> {profile?.email}
                            </span>
                        </div>

                        <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Designation</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {profile?.designation || "Not specified"}
                            </span>
                        </div>

                        <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Department</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                <Buildings className="w-3.5 h-3.5 text-slate-400" /> {profile?.department?.name || "N/A"}
                            </span>
                        </div>

                        <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Section / Class Group</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                <User className="w-3.5 h-3.5 text-slate-400" /> {profile?.classGroup?.name || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Card: Editable Profile Form */}
                <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                    <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                        Personal Information
                    </h3>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">Mobile Number</label>
                                <input
                                    type="text"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Bio / About Me</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                placeholder="Short bio..."
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                                {saving ? "Saving Changes..." : "Save Profile"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <Key className="w-5 h-5 text-indigo-600" /> Change Password
                            </h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                                Cancel
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                                >
                                    {passwordLoading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
