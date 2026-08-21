"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Sliders, Database, SignOut, Sparkle, Check, X, CaretRight } from "@phosphor-icons/react";

interface AdminDashboardClientProps {
    session: any;
    roles: any[];
    permissions: any[];
    metadata: {
        batches: any[];
        academicYears: any[];
        departments: any[];
        soiDomains: any[];
        domainPlacements: any[];
        classGroups: any[];
    };
    users: any[];
}

export default function AdminDashboardClient({
    session,
    roles,
    permissions,
    metadata,
    users,
}: AdminDashboardClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"rbac" | "metadata" | "users">("rbac");

    const [rolePermissionsState, setRolePermissionsState] = useState<Record<string, string[]>>(() => {
        const initialMap: Record<string, string[]> = {};
        roles.forEach((r) => {
            initialMap[r.id] = r.permissions.map((rp: any) => rp.permission.key);
        });
        return initialMap;
    });

    const [savingRole, setSavingRole] = useState<string | null>(null);

    const togglePermission = (roleId: string, permKey: string) => {
        setRolePermissionsState((prev) => {
            const currentKeys = prev[roleId] || [];
            const updatedKeys = currentKeys.includes(permKey)
                ? currentKeys.filter((k) => k !== permKey)
                : [...currentKeys, permKey];
            return { ...prev, [roleId]: updatedKeys };
        });
    };

    const handleSaveRbacMatrix = async (roleId: string) => {
        setSavingRole(roleId);
        try {
            const res = await fetch("/api/admin/rbac/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleId,
                    permissionKeys: rolePermissionsState[roleId] || [],
                }),
            });
            if (res.ok) {
                alert("Role permissions updated successfully.");
                router.refresh();
            } else {
                alert("Failed to update role permissions.");
            }
        } catch {
            alert("Error saving RBAC permissions.");
        } finally {
            setSavingRole(null);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">

            {/* Enterprise Light Header */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                                <Image src="/logo.png" alt="SindhanAI" width={20} height={20} className="brightness-0 invert object-contain" />
                            </div>
                            <span className="font-bold text-base text-slate-900 tracking-tight">
                                SindhanAI Admin Console
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> {session.role} MODE
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-slate-900">{session.name}</div>
                            <div className="text-[11px] text-slate-500">{session.email}</div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <SignOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Hero Header Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                            <Sparkle className="w-3.5 h-3.5 text-indigo-600" /> Dynamic Access Control Engine
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration</h1>
                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                            Configure role-based access matrix rules, manage institutional metadata standards, and audit active system directory accounts.
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                        <button
                            onClick={() => setActiveTab("rbac")}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "rbac" ? "bg-white text-indigo-600 shadow-xs border border-slate-200" : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Sliders className="w-4 h-4" /> RBAC Matrix
                        </button>
                        <button
                            onClick={() => setActiveTab("metadata")}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "metadata" ? "bg-white text-indigo-600 shadow-xs border border-slate-200" : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Database className="w-4 h-4" /> Metadata
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "users" ? "bg-white text-indigo-600 shadow-xs border border-slate-200" : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Users className="w-4 h-4" /> Users ({users.length})
                        </button>
                    </div>
                </div>

                {/* TAB 1: RBAC MATRIX */}
                {activeTab === "rbac" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900">Role Permission Matrix</h2>
                            <span className="text-xs text-slate-500">Toggle permission keys to update security boundaries</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {roles.map((role) => {
                                const activeKeys = rolePermissionsState[role.id] || [];
                                const isSuperAdmin = role.name === "SUPER_ADMIN";

                                return (
                                    <div key={role.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                        {role.name}
                                                        {isSuperAdmin && (
                                                            <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                                                                Unrestricted
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">{role.description}</p>
                                                </div>

                                                {!isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleSaveRbacMatrix(role.id)}
                                                        disabled={savingRole === role.id}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                                    >
                                                        {savingRole === role.id ? "Saving..." : "Save Matrix"}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Permissions Checklist */}
                                            <div className="space-y-2 pt-3 border-t border-slate-100">
                                                {permissions.map((perm) => {
                                                    const isChecked = isSuperAdmin || activeKeys.includes(perm.key);

                                                    return (
                                                        <div
                                                            key={perm.id}
                                                            onClick={() => !isSuperAdmin && togglePermission(role.id, perm.key)}
                                                            className={`p-3 rounded-xl border flex items-center justify-between transition-all select-none ${!isSuperAdmin ? "cursor-pointer" : ""
                                                                } ${isChecked
                                                                    ? "bg-indigo-50/50 border-indigo-200 text-slate-900"
                                                                    : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300"
                                                                }`}
                                                        >
                                                            <div className="space-y-0.5">
                                                                <div className="text-xs font-semibold flex items-center gap-2">
                                                                    <span>{perm.name}</span>
                                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                                        {perm.key}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-500">{perm.description || perm.category}</div>
                                                            </div>

                                                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isChecked ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                                                                }`}>
                                                                {isChecked ? <Check className="w-3.5 h-3.5" weight="bold" /> : <X className="w-3.5 h-3.5" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 2: METADATA */}
                {activeTab === "metadata" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900">System Classification Metadata</h2>
                            <span className="text-xs text-slate-500">Relational metadata structures</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Batches</h3>
                                <div className="space-y-1.5">
                                    {metadata.batches.map((b) => (
                                        <div key={b.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between">
                                            <span className="font-semibold text-slate-900">{b.name}</span>
                                            <span className="text-slate-500 font-medium">{b.startYear} - {b.endYear}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">SOI Domains</h3>
                                <div className="space-y-1.5">
                                    {metadata.soiDomains.map((d) => (
                                        <div key={d.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between">
                                            <span className="font-semibold text-slate-900">{d.name}</span>
                                            <span className="text-slate-500 font-mono">{d.code}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Departments</h3>
                                <div className="space-y-1.5">
                                    {metadata.departments.map((dep) => (
                                        <div key={dep.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between">
                                            <span className="font-semibold text-slate-900">{dep.name}</span>
                                            <span className="text-slate-500 font-mono">{dep.code}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: USERS DIRECTORY */}
                {activeTab === "users" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900">User Directory</h2>
                            <span className="text-xs text-slate-500">Active accounts and assigned roles</span>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">User</th>
                                        <th className="px-6 py-3.5">Role</th>
                                        <th className="px-6 py-3.5">SOI Domain</th>
                                        <th className="px-6 py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="font-bold text-slate-900">{u.name}</div>
                                                <div className="text-slate-500 text-[11px]">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                                                    {u.role.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 font-medium">{u.soiDomain?.name || "N/A"}</td>
                                            <td className="px-6 py-3.5">
                                                {u.passwordHash ? (
                                                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-700 font-semibold">Uninitialized</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>

        </div>
    );
}
