"use client";

import React from "react";
import { Sparkle, ShieldCheck, GraduationCap, Cpu, CoinVertical } from "@phosphor-icons/react";

export default function WhyPartnerSection() {
    const pillars = [
        {
            title: "Expert-Led Delivery",
            description: "Guided by experienced practitioners and backed by academic rigor.",
            icon: ShieldCheck,
            gradient: "grad-why-1",
            stops: ["#EC4899", "#A855F7"]
        },
        {
            title: "Institutional Credibility",
            description: "Trusted foundation through KGISL Educational Institutions and School of Innovation.",
            icon: GraduationCap,
            gradient: "grad-why-2",
            stops: ["#3B82F6", "#06B6D4"]
        },
        {
            title: "Current Tech Capabilities",
            description: "Direct access to practical AI, Generative AI, and modern software skills.",
            icon: Cpu,
            gradient: "grad-why-3",
            stops: ["#F59E0B", "#EC4899"]
        },
        {
            title: "Cost-Effective Partnership",
            description: "High-value delivery designed to maximize return for partners and institutions.",
            icon: CoinVertical,
            gradient: "grad-why-4",
            stops: ["#10B981", "#3B82F6"]
        }
    ];

    return (
        <section className="w-full bg-white py-16 sm:py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
                <div className="max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider">
                        <Sparkle className="w-3.5 h-3.5 text-purple-600 fill-purple-600" weight="fill" />
                        <span>Why Sindhanai</span>
                    </div>

                    <h2
                        className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-900 leading-[1.15] tracking-tight m-0 p-0"
                        style={{ fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif" }}
                    >
                        Why partner with Sindhanai.
                    </h2>

                    <p className="text-lg sm:text-xl text-slate-600 font-medium tracking-tight leading-relaxed">
                        Combining institutional trust, expert guidance, and modern technology capabilities.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((pillar) => {
                        const IconComp = pillar.icon;
                        return (
                            <div
                                key={pillar.title}
                                className="group relative rounded-2xl bg-[#00000008] border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-6"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <defs>
                                            <linearGradient id={pillar.gradient} x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor={pillar.stops[0]} />
                                                <stop offset="100%" stopColor={pillar.stops[1]} />
                                            </linearGradient>
                                        </defs>
                                        <IconComp className="w-6 h-6" style={{ color: pillar.stops[0] }} weight="duotone" />
                                    </svg>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 font-normal leading-relaxed">
                                        {pillar.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
