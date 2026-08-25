"use client";

import { useState, useEffect, useCallback } from "react";
import {
    WifiHigh,
    Plus,
    Check,
    Trash,
    Info,
    CheckCircle,
    XCircle,
    ShieldCheck,
    Question,
    Sparkle,
    Broadcast,
    Desktop,
} from "@phosphor-icons/react";

export default function WifiWhitelistClient() {
    const [whitelists, setWhitelists] = useState<any[]>([]);
    const [detectedIp, setDetectedIp] = useState<string>("Detecting...");
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [ipAddressOrSubnet, setIpAddressOrSubnet] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchWhitelists = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/wifi-whitelist");
            const data = await res.json();
            if (res.ok) {
                setWhitelists(data.data || []);
                setDetectedIp(data.detectedIp || "127.0.0.1");
            }
        } catch (err) {
            console.error("Failed to load Wi-Fi whitelist:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWhitelists();
    }, [fetchWhitelists]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // 1-Click Detect & Whitelist Current IP
    const handleQuickAddDetectedIp = async () => {
        if (!detectedIp || detectedIp === "Detecting...") return;

        setName(`Lab Router (${detectedIp})`);
        setIpAddressOrSubnet(detectedIp);
        setDescription("Auto-detected active admin connection IP");
        setIsAddModalOpen(true);
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/wifi-whitelist/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                showToast(`Wi-Fi network ${!currentStatus ? "activated" : "deactivated"}.`);
                fetchWhitelists();
            }
        } catch (err) {
            console.error("Failed to toggle status:", err);
        }
    };

    const handleDelete = async (id: string, networkName: string) => {
        if (!confirm(`Are you sure you want to remove "${networkName}" from allowed Wi-Fi networks?`)) return;

        try {
            const res = await fetch(`/api/admin/wifi-whitelist/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast(`Removed "${networkName}".`);
                fetchWhitelists();
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim() || !ipAddressOrSubnet.trim()) {
            setFormError("Network Name and IP Address / Subnet CIDR are required");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/wifi-whitelist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    ipAddressOrSubnet: ipAddressOrSubnet.trim(),
                    description: description.trim() || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add Wi-Fi subnet");

            showToast(`Wi-Fi network "${name}" whitelisted successfully.`);
            setName("");
            setIpAddressOrSubnet("");
            setDescription("");
            setIsAddModalOpen(false);
            fetchWhitelists();
        } catch (err: any) {
            setFormError(err.message || "Failed to create whitelist entry");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Banner */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <WifiHigh className="w-6 h-6 text-indigo-600" />
                        <span>Dynamic Lab Wi-Fi Whitelist</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold">
                            Anti-Malpractice Active
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Students must be connected to an authorized Lab Wi-Fi network to submit QR attendance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Question className="w-4 h-4 text-indigo-600" />
                        <span>{showGuide ? "Hide IP Guide" : "How to Find Router IP"}</span>
                    </button>

                    <button
                        onClick={() => {
                            setName("");
                            setIpAddressOrSubnet("");
                            setDescription("");
                            setFormError(null);
                            setIsAddModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Allowed Wi-Fi / Subnet</span>
                    </button>
                </div>
            </div>

            {/* 1-Click Detect & Whitelist Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold shrink-0 text-emerald-400">
                        <Broadcast className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Detected System IP</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">Live Connection</span>
                            {detectedIp === "::1" && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                                    Localhost Loopback (IPv6)
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-white mt-0.5">
                            {detectedIp}
                        </h3>
                        <p className="text-xs text-indigo-200/80 font-medium">
                            {detectedIp === "::1"
                                ? "Running locally on dev machine. When deployed on campus LAN, students' Wi-Fi IPs (e.g. 192.168.1.X) will be detected automatically."
                                : "This is your current network request IP address from this device."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    <button
                        onClick={handleQuickAddDetectedIp}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Sparkle className="w-4 h-4" />
                        <span>1-Click Whitelist Current IP</span>
                    </button>
                </div>
            </div>

            {/* Institutional DHCP Subnet Presets Quick Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black uppercase text-slate-200">Institutional Dual Floor Wi-Fi Subnet Presets (DHCP)</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Recommended for Floor Routers</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        onClick={() => {
                            setName("Floor Wi-Fi AP 1 (DHCP Subnet)");
                            setIpAddressOrSubnet("192.168.1.0/24");
                            setDescription("Covers all DHCP clients on 192.168.1.1 - 192.168.1.254");
                            setIsAddModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left cursor-pointer transition-all"
                    >
                        <span className="text-[11px] font-black text-emerald-400 block">Router 1 Subnet</span>
                        <span className="text-xs font-mono font-bold text-white">192.168.1.0/24</span>
                    </button>

                    <button
                        onClick={() => {
                            setName("Floor Wi-Fi AP 2 (DHCP Subnet)");
                            setIpAddressOrSubnet("192.168.2.0/24");
                            setDescription("Covers all DHCP clients on 192.168.2.1 - 192.168.2.254");
                            setIsAddModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left cursor-pointer transition-all"
                    >
                        <span className="text-[11px] font-black text-indigo-400 block">Router 2 Subnet</span>
                        <span className="text-xs font-mono font-bold text-white">192.168.2.0/24</span>
                    </button>

                    <button
                        onClick={() => {
                            setName("Campus Wi-Fi Main Range");
                            setIpAddressOrSubnet("10.0.0.0/16");
                            setDescription("Covers all campus Wi-Fi DHCP clients on 10.0.X.X");
                            setIsAddModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left cursor-pointer transition-all"
                    >
                        <span className="text-[11px] font-black text-amber-400 block">Campus Wi-Fi Range</span>
                        <span className="text-xs font-mono font-bold text-white">10.0.0.0/16</span>
                    </button>
                </div>
            </div>

            {/* Router IP Guide Drawer */}
            {showGuide && (
                <div className="p-6 bg-amber-50/80 rounded-3xl border border-amber-200/80 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-extrabold text-amber-900">
                                How to find your Lab Router IP or Subnet on Windows / Mac
                            </h4>
                            <p className="text-xs text-amber-800 font-medium mt-1">
                                Follow these quick steps to get your lab router IP details:
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-amber-950">
                        <div className="p-4 rounded-2xl bg-white/80 border border-amber-200/60 space-y-2">
                            <h5 className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                                <Desktop className="w-4 h-4" /> Windows (`cmd` Command)
                            </h5>
                            <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium text-[11px]">
                                <li>Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">Win + R</kbd>, type <code className="bg-slate-200 px-1 rounded">cmd</code>, press Enter.</li>
                                <li>Type <code className="bg-indigo-50 font-mono text-indigo-700 px-1.5 py-0.5 rounded font-bold">ipconfig</code> and press Enter.</li>
                                <li>Note down your <span className="font-bold text-slate-900">IPv4 Address</span> (e.g. <code className="bg-slate-100 font-mono">192.168.1.45</code>) or Default Gateway.</li>
                                <li>To whitelist the whole router subnet, add <code className="bg-emerald-100 text-emerald-800 font-mono px-1 rounded font-bold">192.168.1.0/24</code> or <code className="bg-emerald-100 text-emerald-800 font-mono px-1 rounded font-bold">192.168.1.*</code>.</li>
                            </ol>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/80 border border-amber-200/60 space-y-2">
                            <h5 className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                                <WifiHigh className="w-4 h-4" /> Multiple Wi-Fi Routers on Same Floor
                            </h5>
                            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                                If you have two routers on the floor (e.g. Router 1 & Router 2), simply connect to each Wi-Fi one by one, click <span className="font-bold text-emerald-700">"1-Click Whitelist My Current IP"</span>, or add both IP ranges (e.g. <code className="bg-slate-100 px-1 font-mono">192.168.1.0/24</code> and <code className="bg-slate-100 px-1 font-mono">192.168.2.0/24</code>).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Whitelisted Subnets List */}
            {loading ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-slate-500">Loading Wi-Fi whitelist records...</p>
                </div>
            ) : whitelists.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
                    <WifiHigh className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-extrabold text-slate-800">No Authorized Wi-Fi Networks</h3>
                    <p className="text-xs text-slate-500">
                        Click "Add Allowed Wi-Fi" or use 1-Click Detection to authorize lab networks.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {whitelists.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${item.isActive ? "border-slate-200/80" : "border-slate-200/50 bg-slate-50/50 opacity-60"
                                }`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${item.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                                            <WifiHigh className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 truncate">{item.name}</h3>
                                            <p className="text-[11px] font-mono font-bold text-indigo-600 mt-0.5">
                                                {item.ipAddressOrSubnet}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleToggleActive(item.id, item.isActive)}
                                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition-colors ${item.isActive
                                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                            }`}
                                    >
                                        {item.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                        <span>{item.isActive ? "Active" : "Inactive"}</span>
                                    </button>
                                </div>

                                {item.description && (
                                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                <span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
                                <button
                                    onClick={() => handleDelete(item.id, item.name)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                    title="Remove Network"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Whitelist Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <WifiHigh className="w-5 h-5 text-indigo-600" />
                                <span>Whitelist Lab Wi-Fi Network</span>
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    Network / Router Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. SOI Lab Router 1 (Floor 2)"
                                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    IP Address or Subnet CIDR <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={ipAddressOrSubnet}
                                    onChange={(e) => setIpAddressOrSubnet(e.target.value)}
                                    placeholder="e.g. 192.168.1.0/24 or 115.240.12.5"
                                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:border-indigo-600 focus:bg-white"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Supports exact IPs (<code className="font-mono">192.168.1.50</code>), subnets (<code className="font-mono">192.168.1.0/24</code>), or wildcard (<code className="font-mono">192.168.1.*</code>).
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Location Notes</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. High-speed 5GHz access point near Lab 2 entrance"
                                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Authorize Wi-Fi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
