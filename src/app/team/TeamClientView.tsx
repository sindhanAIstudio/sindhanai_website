"use client";

import { useState } from "react";
import { User, Briefcase, GraduationCap, Sparkle } from "@phosphor-icons/react";

interface TeamClientViewProps {
    initialMembers: any[];
}

export default function TeamClientView({ initialMembers }: TeamClientViewProps) {
    const [activeTab, setActiveTab] = useState("All");

    const tabs = ["All", "Industry Professional", "Faculty", "Student", "SCOPE"];

    const filteredMembers = initialMembers.filter((m) => {
        if (activeTab === "All") return true;
        if (activeTab === "SCOPE") return m.labGroup === "SCOPE";
        return m.category === activeTab;
    });

    return (
        <div className="w-full space-y-12 py-8 md:py-14">

            {/* Pixfort Pastel Hero Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pixfort-hero-bg rounded-[32px] p-8 md:p-14 space-y-6 relative overflow-hidden shadow-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full pixfort-frosted-pill text-xs font-bold uppercase tracking-wider">
                        <Sparkle className="w-4 h-4 text-white" /> People & Roster
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        Our Team & Fellows
                    </h1>
                    <p className="text-base sm:text-xl text-white/90 max-w-3xl leading-relaxed font-medium">
                        Industry practitioners, academic faculty, and student developers working together in applied technology labs.
                    </p>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all ${activeTab === tab
                                ? "bg-black text-white shadow-md"
                                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </section>

            {/* Team Roster Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="pixfort-card p-6 flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-extrabold text-base shadow-md">
                                    {member.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                </div>

                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{member.name}</h3>
                                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{member.designation}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        <span>{member.domain}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-slate-400" />
                                        <span>{member.labGroup}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                                    {member.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

