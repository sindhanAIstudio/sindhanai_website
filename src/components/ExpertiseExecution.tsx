"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    Briefcase,
    GraduationCap,
    Student,
    ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";

function AnimatedElement({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.15 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out transform ${isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-10 scale-95"
                } ${className}`}
        >
            {children}
        </div>
    );
}

export default function ExpertiseExecution() {
    return (
        <section className="bg-white py-20 lg:py-28 text-slate-900 overflow-hidden">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Section Header (Exact Pixfort Template Alignment) ── */}
                <AnimatedElement className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 lg:pb-16">
                    <div className="max-w-3xl space-y-2">
                        {/* Main Headline */}
                        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-950 tracking-tight leading-[1.12]">
                            A unique combination of expertise and execution.
                        </h2>
                        {/* Light Grey Sub-text */}
                        <p className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-[#949494] tracking-tight leading-[1.2]">
                            Industry practice, academic rigor, and student innovation working together.
                        </p>
                    </div>

                    {/* Top Right Action Button */}
                    <div className="shrink-0 pt-2 md:pt-0">
                        <Link
                            href="/about"
                            className="bg-slate-200/90 hover:bg-slate-300/90 text-slate-950 font-bold px-4.5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs border border-black/5"
                        >
                            <span>Learn About Us</span>
                            <ArrowUpRight className="w-3.5 h-3.5" weight="bold" />
                        </Link>
                    </div>
                </AnimatedElement>

                {/* ── 3 Distinct Visual Cards (Matching Pixfort Template Cards) ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">

                    {/* ── CARD 1: Industry Professionals (Sleek Light Card with Stat Highlight) ── */}
                    <AnimatedElement>
                        <div className="group relative flex flex-col justify-between p-8 lg:p-10 rounded-[28px] bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] border border-black/5 shadow-2xs hover:shadow-xl transition-all duration-300 min-h-[440px] overflow-hidden">

                            {/* Top Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#grad-case)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <defs>
                                                <linearGradient id="grad-case" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#EC4899" />
                                                    <stop offset="50%" stopColor="#A855F7" />
                                                    <stop offset="100%" stopColor="#3B82F6" />
                                                </linearGradient>
                                            </defs>
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" fill="url(#grad-case)" fillOpacity="0.15" />
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                        </svg>
                                    </div>
                                    <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-slate-200/90 text-slate-800 border border-black/5">
                                        Practitioners
                                    </span>
                                </div>

                                {/* Stat Highlight Block */}
                                <div className="pt-2">
                                    <div className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
                                        100%
                                    </div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-1">
                                        Industry Expertise
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Content */}
                            <div className="space-y-3 pt-6 border-t border-black/5">
                                <h3 className="text-2xl font-bold text-slate-950">
                                    Industry Professionals
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    Practitioners with real industry experience who bring domain knowledge, current practices, and professional standards into everything we do.
                                </p>
                            </div>
                        </div>
                    </AnimatedElement>

                    {/* ── CARD 2: Faculty (Rich Photo Background + Dark Frosted Card Overlay) ── */}
                    <AnimatedElement>
                        <div className="group relative flex flex-col justify-end p-6 rounded-[28px] overflow-hidden min-h-[440px] shadow-sm hover:shadow-xl transition-all duration-300">
                            {/* Background Image */}
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
                                alt="Faculty & Academic Experts"
                                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                            {/* Floating Dark Glassmorphic Card */}
                            <div className="relative z-10 p-6 sm:p-7 rounded-[22px] bg-black/70 backdrop-blur-md border border-white/15 text-white space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#grad-cap-fac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <defs>
                                                    <linearGradient id="grad-cap-fac" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#F59E0B" />
                                                        <stop offset="50%" stopColor="#EC4899" />
                                                        <stop offset="100%" stopColor="#A855F7" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                <path d="M6 12v5c0 2 6 2 6 2s6 0 6-2v-5" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Academic Experts
                                        </span>
                                    </div>
                                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                                </div>

                                <h3 className="text-2xl font-bold text-white pt-1" style={{ color: '#ffffff' }}>
                                    Faculty
                                </h3>
                                <p className="text-white/85 text-xs sm:text-sm leading-relaxed font-normal" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                    Academic experts who bring research depth, structured thinking, and a strong foundation to every project and learning initiative.
                                </p>
                            </div>
                        </div>
                    </AnimatedElement>

                    {/* ── CARD 3: Students (Deep Black Premium Card with Highlights) ── */}
                    <AnimatedElement>
                        <div className="group relative flex flex-col justify-between p-8 lg:p-10 rounded-[28px] bg-[#0A0A0A] text-white shadow-md hover:shadow-2xl transition-all duration-300 min-h-[440px] overflow-hidden border border-white/10">

                            {/* Top Content */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#grad-stu)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <defs>
                                                <linearGradient id="grad-stu" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#3B82F6" />
                                                    <stop offset="50%" stopColor="#06B6D4" />
                                                    <stop offset="100%" stopColor="#10B981" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
                                            <circle cx="12" cy="7" r="4" fill="url(#grad-stu)" fillOpacity="0.25" />
                                        </svg>
                                    </div>
                                    <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/15">
                                        Motivated Learners
                                    </span>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <h3 className="text-2xl font-bold text-white tracking-tight" style={{ color: '#ffffff' }}>
                                        Students
                                    </h3>
                                    <p className="text-white/80 text-sm leading-relaxed font-normal" style={{ color: 'rgba(255, 255, 255, 0.80)' }}>
                                        Motivated learners working on live problems — bringing current technology knowledge and a drive to build and deliver.
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Highlight Stat */}
                            <div className="pt-6 border-t border-white/15 flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-extrabold text-white tracking-tight">
                                        Project-Driven
                                    </div>
                                    <div className="text-xs font-medium text-white/70 pt-0.5">
                                        From Concept to Reality
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                                    <ArrowUpRight className="w-5 h-5" weight="bold" />
                                </div>
                            </div>

                        </div>
                    </AnimatedElement>

                </div>

            </div>
        </section>
    );
}
