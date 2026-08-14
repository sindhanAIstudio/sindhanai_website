"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    Cpu,
    Code,
    GraduationCap,
    ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";

function AnimatedElement({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) {
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
            id={id}
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

export default function CapabilitiesSection() {
    const categories = [
        { id: 0, label: "AI & Technology", icon: Cpu },
        { id: 1, label: "Software Solutions", icon: Code },
        { id: 2, label: "Training", icon: GraduationCap },
    ];

    return (
        <section className="bg-white py-16 lg:py-24 text-slate-900">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16">

                    {/* ── LEFT SIDE (30% Sticky Column) ── */}
                    {/* Aligned perfectly at top baseline with right column H2 title */}
                    <div className="w-full lg:w-[30%] shrink-0 self-start lg:sticky lg:top-32 space-y-6 pt-2">

                        <AnimatedElement>
                            {/* Top Label matching reference image baseline */}
                            <div className="text-sm font-medium text-slate-500 tracking-tight leading-snug pb-6">
                                Our Services
                            </div>

                            {/* 3 Horizontal Static Pills matching Image 3 */}
                            <div className="space-y-3">
                                <div className="w-full p-4.5 rounded-[18px] font-bold text-sm sm:text-base flex items-center gap-3.5 bg-gradient-to-r from-[#0000000d] to-[#00000010] text-slate-900 select-none shadow-2xs border border-black/5">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-black/5">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#grad-cpu-pill)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <defs>
                                                <linearGradient id="grad-cpu-pill" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#EC4899" />
                                                    <stop offset="50%" stopColor="#A855F7" />
                                                    <stop offset="100%" stopColor="#3B82F6" />
                                                </linearGradient>
                                            </defs>
                                            <rect x="4" y="4" width="16" height="16" rx="2" fill="url(#grad-cpu-pill)" fillOpacity="0.15" />
                                            <rect x="9" y="9" width="6" height="6" />
                                            <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" />
                                        </svg>
                                    </div>
                                    <span className="truncate">AI & Technology</span>
                                </div>

                                <div className="w-full p-4.5 rounded-[18px] font-bold text-sm sm:text-base flex items-center gap-3.5 bg-gradient-to-r from-[#0000000d] to-[#00000010] text-slate-900 select-none shadow-2xs border border-black/5">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-black/5">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#grad-code-pill)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <defs>
                                                <linearGradient id="grad-code-pill" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#A855F7" />
                                                    <stop offset="50%" stopColor="#3B82F6" />
                                                    <stop offset="100%" stopColor="#06B6D4" />
                                                </linearGradient>
                                            </defs>
                                            <polyline points="16 18 22 12 16 6" />
                                            <polyline points="8 6 2 12 8 18" />
                                        </svg>
                                    </div>
                                    <span className="truncate">Software Solutions</span>
                                </div>

                                <div className="w-full p-4.5 rounded-[18px] font-bold text-sm sm:text-base flex items-center gap-3.5 bg-gradient-to-r from-[#0000000d] to-[#00000010] text-slate-900 select-none shadow-2xs border border-black/5">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-black/5">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#grad-cap-pill)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <defs>
                                                <linearGradient id="grad-cap-pill" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#F59E0B" />
                                                    <stop offset="50%" stopColor="#EC4899" />
                                                    <stop offset="100%" stopColor="#A855F7" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c0 2 6 2 6 2s6 0 6-2v-5" />
                                        </svg>
                                    </div>
                                    <span className="truncate">Training</span>
                                </div>
                            </div>
                        </AnimatedElement>

                    </div>

                    {/* ── RIGHT SIDE (70% Scrolling Cards Area) ── */}
                    <div className="w-full lg:w-[66%] space-y-12">

                        {/* Right Header Text (Exact Baseline Alignment with Left Label) */}
                        <AnimatedElement className="space-y-3 pb-2">
                            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-950 tracking-tight leading-[1.12] m-0 p-0">
                                Core capabilities across AI, software, and training.
                            </h2>
                            <p className="text-xl sm:text-2xl font-semibold text-[#949494] tracking-tight leading-snug">
                                Tailored technology solutions designed for industry and academic growth.
                            </p>
                        </AnimatedElement>

                        {/* ── CARD 1: AI and Technology ── */}
                        <AnimatedElement id="capability-card-0">
                            <div className="group relative rounded-[28px] bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] border border-black/5 p-8 lg:p-10 space-y-8 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                {/* Card Top: Number & Tag */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-2xl bg-slate-950 text-white font-extrabold text-sm flex items-center justify-center">
                                            01
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-slate-200/90 border border-black/5 text-slate-800">
                                            Intelligence Systems
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/80 border border-black/5 flex items-center justify-center text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                                        <ArrowUpRight className="w-5 h-5" weight="bold" />
                                    </div>
                                </div>

                                {/* Card Content Header */}
                                <div className="space-y-3 max-w-2xl">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                                        AI and Technology
                                    </h3>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                        Machine learning, data science, computer vision, NLP, and generative AI solutions built for real use cases.
                                    </p>
                                </div>

                                {/* Infographic Visual Placeholder */}
                                <div className="rounded-[22px] bg-white p-6 sm:p-8 border border-black/5 shadow-xs space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Matching Cpu Icon with Gradient */}
                                            <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-xs">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#grad-cpu-inner)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <defs>
                                                        <linearGradient id="grad-cpu-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#EC4899" />
                                                            <stop offset="50%" stopColor="#A855F7" />
                                                            <stop offset="100%" stopColor="#3B82F6" />
                                                        </linearGradient>
                                                    </defs>
                                                    <rect x="4" y="4" width="16" height="16" rx="2" fill="url(#grad-cpu-inner)" fillOpacity="0.15" />
                                                    <rect x="9" y="9" width="6" height="6" />
                                                    <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">LLM & RAG Engine</div>
                                                <div className="text-[11px] text-slate-500">Active Inference Node v4.2</div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-black/5">
                                            99.4% Precision
                                        </span>
                                    </div>

                                    {/* Mock UI Controls */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Vector Embeddings</div>
                                            <div className="text-slate-900 font-bold text-sm">1.2M Tokens/sec</div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Computer Vision</div>
                                            <div className="text-slate-900 font-bold text-sm">60 FPS Inspection</div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Predictive ML</div>
                                            <div className="text-slate-900 font-bold text-sm">Real-time Stream</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Action */}
                                <div className="pt-2 flex justify-start">
                                    <Link
                                        href="/services/ai-technology"
                                        className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <span>Explore Solutions</span>
                                        <ArrowUpRight className="w-4 h-4" weight="bold" />
                                    </Link>
                                </div>
                            </div>
                        </AnimatedElement>

                        {/* ── CARD 2: Software Solutions ── */}
                        <AnimatedElement id="capability-card-1">
                            <div className="group relative rounded-[28px] bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] border border-black/5 p-8 lg:p-10 space-y-8 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                {/* Card Top: Number & Tag */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-2xl bg-slate-950 text-white font-extrabold text-sm flex items-center justify-center">
                                            02
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-slate-200/90 border border-black/5 text-slate-800">
                                            Enterprise Engineering
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/80 border border-black/5 flex items-center justify-center text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                                        <ArrowUpRight className="w-5 h-5" weight="bold" />
                                    </div>
                                </div>

                                {/* Card Content Header */}
                                <div className="space-y-3 max-w-2xl">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                                        Software Solutions
                                    </h3>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                        Web applications, e-commerce platforms, CRM, ERP, DevOps, and cloud infrastructure tailored to business needs.
                                    </p>
                                </div>

                                {/* Infographic Visual Placeholder */}
                                <div className="rounded-[22px] bg-white p-6 sm:p-8 border border-black/5 shadow-xs space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Matching Code Icon with Gradient */}
                                            <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-xs">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#grad-code-inner)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <defs>
                                                        <linearGradient id="grad-code-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#A855F7" />
                                                            <stop offset="50%" stopColor="#3B82F6" />
                                                            <stop offset="100%" stopColor="#06B6D4" />
                                                        </linearGradient>
                                                    </defs>
                                                    <polyline points="16 18 22 12 16 6" />
                                                    <polyline points="8 6 2 12 8 18" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">Custom Cloud & ERP Architecture</div>
                                                <div className="text-[11px] text-slate-500">Multi-tenant Cloud Ecosystem</div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-black/5">
                                            DevOps Ready
                                        </span>
                                    </div>

                                    {/* Mock UI Elements */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Custom CRM & ERP</div>
                                            <div className="text-slate-900 font-bold text-sm">Automated Workflows</div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">E-Commerce & Web</div>
                                            <div className="text-slate-900 font-bold text-sm">Sub-second Speed</div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Cloud Deployment</div>
                                            <div className="text-slate-900 font-bold text-sm">Zero Downtime CI/CD</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Action */}
                                <div className="pt-2 flex justify-start">
                                    <Link
                                        href="/services/software-solutions"
                                        className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <span>Launch Platform</span>
                                        <ArrowUpRight className="w-4 h-4" weight="bold" />
                                    </Link>
                                </div>
                            </div>
                        </AnimatedElement>

                        {/* ── CARD 3: Training ── */}
                        <AnimatedElement id="capability-card-2">
                            <div className="group relative rounded-[28px] bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] border border-black/5 p-8 lg:p-10 space-y-8 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                {/* Card Top: Number & Tag */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-2xl bg-slate-950 text-white font-extrabold text-sm flex items-center justify-center">
                                            03
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-slate-200/90 border border-black/5 text-slate-800">
                                            Academic & Upskilling
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/80 border border-black/5 flex items-center justify-center text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                                        <ArrowUpRight className="w-5 h-5" weight="bold" />
                                    </div>
                                </div>

                                {/* Card Content Header */}
                                <div className="space-y-3 max-w-2xl">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                                        Training
                                    </h3>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                        Practical training in computational thinking, programming, AI, and data science for students and faculty.
                                    </p>
                                </div>

                                {/* Infographic Visual Placeholder */}
                                <div className="rounded-[22px] bg-white p-6 sm:p-8 border border-black/5 shadow-xs space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Matching GraduationCap Icon with Gradient */}
                                            <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-xs">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#grad-cap-inner)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <defs>
                                                        <linearGradient id="grad-cap-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#F59E0B" />
                                                            <stop offset="50%" stopColor="#EC4899" />
                                                            <stop offset="100%" stopColor="#A855F7" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                    <path d="M6 12v5c0 2 6 2 6 2s6 0 6-2v-5" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">Institutional Training & Bootcamps</div>
                                                <div className="text-[11px] text-slate-500">Industry-Aligned Curriculum</div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-black/5">
                                            Live Mentorship
                                        </span>
                                    </div>

                                    {/* Mock UI Elements */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Faculty Upskilling</div>
                                            <div className="text-slate-900 font-bold text-sm">Advanced AI Research</div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Student Training</div>
                                            <div className="text-slate-900 font-bold text-sm">Hands-on Code Labs</div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                            <div className="text-slate-400 text-[11px]">Institutional Support</div>
                                            <div className="text-slate-900 font-bold text-sm">Industry Collaborations</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Action */}
                                <div className="pt-2 flex justify-start">
                                    <Link
                                        href="/services/training"
                                        className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <span>View Programs</span>
                                        <ArrowUpRight className="w-4 h-4" weight="bold" />
                                    </Link>
                                </div>
                            </div>
                        </AnimatedElement>

                    </div>

                </div>

            </div>
        </section>
    );
}
