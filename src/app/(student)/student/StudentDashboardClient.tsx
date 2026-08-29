"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { QrCode, SignOut, CheckCircle, Warning, GithubLogo, Code, Trophy, Sparkle, ShieldCheck } from "@phosphor-icons/react";

interface StudentDashboardClientProps {
    user: any;
    session: any;
}

export default function StudentDashboardClient({ user, session }: StudentDashboardClientProps) {
    const searchParams = useSearchParams();

    const querySessionId = searchParams.get("sessionId") || "";
    const queryToken = searchParams.get("token") || "";

    const [sessionId, setSessionId] = useState(querySessionId);
    const [token, setToken] = useState(queryToken);

    const [scanning, setScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [githubUsername, setGithubUsername] = useState(user.platformProfile?.githubUsername || "");
    const [leetcodeUsername, setLeetcodeUsername] = useState(user.platformProfile?.leetcodeUsername || "");
    const [kaggleUsername, setKaggleUsername] = useState(user.platformProfile?.kaggleUsername || "");
    const [syncing, setSyncing] = useState(false);
    const [profileData, setProfileData] = useState<any>(
        user.platformProfile ? {
            github: user.platformProfile.githubData ? JSON.parse(user.platformProfile.githubData) : null,
            leetcode: user.platformProfile.leetcodeData ? JSON.parse(user.platformProfile.leetcodeData) : null,
            kaggle: user.platformProfile.kaggleData ? JSON.parse(user.platformProfile.kaggleData) : null,
        } : null
    );

    useEffect(() => {
        if (querySessionId && queryToken) {
            handleScanAttendance(querySessionId, queryToken);
        }
    }, [querySessionId, queryToken]);

    const handleScanAttendance = async (sId: string, tok: string) => {
        setScanning(true);
        setScanMessage(null);
        try {
            const res = await fetch("/api/attendance/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sId,
                    token: tok,
                    deviceFingerprint: typeof window !== "undefined" ? navigator.userAgent : null,
                }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setScanMessage({
                    type: "success",
                    text: `Attendance Verified! Logged for "${data.sessionTitle}".`,
                });
            } else {
                setScanMessage({
                    type: "error",
                    text: data.error || "Attendance verification failed.",
                });
            }
        } catch {
            setScanMessage({
                type: "error",
                text: "An error occurred during verification scan.",
            });
        } finally {
            setScanning(false);
        }
    };

    const handleSyncDeveloperProfiles = async (e: React.FormEvent) => {
        e.preventDefault();
        setSyncing(true);
        try {
            const res = await fetch("/api/developer/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    githubUsername,
                    leetcodeUsername,
                    kaggleUsername,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setProfileData(data.profileData);
                alert("Developer profiles synchronized successfully.");
            } else {
                alert(data.error || "Failed to sync profiles");
            }
        } catch {
            alert("Error syncing developer profiles");
        } finally {
            setSyncing(false);
        }
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
                                Student Portal
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Device Signature Verified
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/student/scan"
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                        >
                            <QrCode className="w-4 h-4 text-white" />
                            <span>Launch Camera QR Scanner</span>
                        </Link>

                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-slate-900">{session.name}</div>
                            <div className="text-[11px] text-slate-500">{session.email}</div>
                        </div>

                        <button
                            onClick={async () => {
                                await fetch("/api/auth/logout", { method: "POST" });
                                window.location.href = "/login";
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <SignOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Body */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Profile Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                                <Sparkle className="w-3.5 h-3.5 text-indigo-600" /> Student Innovation Record
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500">Batch</div>
                            <div className="text-xs font-semibold text-slate-900">{user.batch?.name || "N/A"}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500">Academic Year</div>
                            <div className="text-xs font-semibold text-slate-900">{user.academicYear?.name || "N/A"}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500">Department</div>
                            <div className="text-xs font-semibold text-slate-900">{user.department?.code || "N/A"}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500">SOI Domain</div>
                            <div className="text-xs font-semibold text-indigo-700">{user.soiDomain?.name || "N/A"}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500">Placement Target</div>
                            <div className="text-xs font-semibold text-emerald-700">{user.domainPlacement?.name || "N/A"}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500">Class Group</div>
                            <div className="text-xs font-semibold text-slate-900">{user.classGroup?.name || "N/A"}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Attendance Verification Scanner (5 Cols) */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="space-y-1">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-indigo-600" /> Attendance Scanner
                            </h2>
                            <p className="text-xs text-slate-500">Scan live classroom TOTP QR or input token below</p>
                        </div>

                        {scanMessage && (
                            <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${scanMessage.type === "success"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-rose-50 border-rose-200 text-rose-800"
                                }`}>
                                {scanMessage.type === "success" ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                    <Warning className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                )}
                                <span>{scanMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={(e) => { e.preventDefault(); handleScanAttendance(sessionId, token); }} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Classroom Session ID</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Paste Session ID"
                                    value={sessionId}
                                    onChange={(e) => setSessionId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">10-Second TOTP Token</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 9F2A7B8C"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={scanning}
                                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {scanning ? "Verifying Token & Device..." : "Submit Attendance Verification"}
                            </button>
                        </form>
                    </div>

                    {/* Developer Platform Portfolio Sync (7 Cols) */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="space-y-1">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Code className="w-5 h-5 text-emerald-600" /> Developer Platform Sync
                            </h2>
                            <p className="text-xs text-slate-500">Connect GitHub, LeetCode, and Kaggle for automated footprint tracking</p>
                        </div>

                        <form onSubmit={handleSyncDeveloperProfiles} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <GithubLogo className="w-3.5 h-3.5 text-slate-600" /> GitHub
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="octocat"
                                        value={githubUsername}
                                        onChange={(e) => setGithubUsername(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Code className="w-3.5 h-3.5 text-amber-600" /> LeetCode
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="leetcode_user"
                                        value={leetcodeUsername}
                                        onChange={(e) => setLeetcodeUsername(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Trophy className="w-3.5 h-3.5 text-sky-600" /> Kaggle
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="kaggle_user"
                                        value={kaggleUsername}
                                        onChange={(e) => setKaggleUsername(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={syncing}
                                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {syncing ? "Fetching Platform Data..." : "Synchronize Developer Platforms"}
                            </button>
                        </form>

                        {/* Synchronized Live Profile Badges */}
                        {profileData && (
                            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {profileData.github && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">GitHub</div>
                                        <div className="text-xs font-bold text-slate-900">{profileData.github.publicRepos} Repos</div>
                                        <div className="text-[11px] text-indigo-700">{profileData.github.followers} Followers</div>
                                    </div>
                                )}

                                {profileData.leetcode && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">LeetCode</div>
                                        <div className="text-xs font-bold text-amber-700">{profileData.leetcode.solvedCount} Solved</div>
                                        <div className="text-[11px] text-slate-500 font-mono">Rank #{profileData.leetcode.ranking}</div>
                                    </div>
                                )}

                                {profileData.kaggle && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Kaggle</div>
                                        <div className="text-xs font-bold text-sky-700">{profileData.kaggle.tier} Tier</div>
                                        <div className="text-[11px] text-slate-500 font-mono">{profileData.kaggle.competitions} Contests</div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}
