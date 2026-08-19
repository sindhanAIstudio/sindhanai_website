"use client";

import React, { useEffect, useRef, useState } from "react";
import { Brain, Cpu, Sparkle } from "@phosphor-icons/react";

function AnimatedCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, []);
    return (
        <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}>
            {children}
        </div>
    );
}

export default function AboutLabsSection() {
    return (
        <section className="w-full bg-[#f8fafc] py-20 sm:py-28 border-t border-slate-200/60 relative overflow-hidden">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section Header */}
                <div className="max-w-[800px] mb-14 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkle className="w-4 h-4 text-slate-700" weight="fill" />
                        Our Labs
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                        Specialized AI & Technology Labs
                    </h2>
                    <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                        Operating vertical and horizontal labs to bridge deep domain AI research with versatile cross-industry generative applications.
                    </p>
                </div>

                {/* 2 Lab Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    {/* AI and Data Science Lab (Vertical Lab) */}
                    <div className="lg:col-span-6">
                        <AnimatedCard className="h-full">
                            <div className="relative bg-white rounded-[24px] p-8 sm:p-10 border border-slate-200 flex flex-col justify-between h-full min-h-[380px] shadow-none transition-all duration-300 group overflow-hidden">

                                {/* Background Decorative Tech Dot Grid */}
                                <div
                                    className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none"
                                    style={{
                                        backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`,
                                        backgroundSize: `18px 18px`
                                    }}
                                />

                                {/* Large Subtle Watermark Icon in Bottom Right */}
                                <div className="absolute -bottom-6 -right-6 text-slate-900/5 group-hover:text-slate-900/10 transition-colors pointer-events-none">
                                    <Brain className="w-48 h-48" weight="duotone" />
                                </div>

                                <div className="relative z-10 space-y-6">
                                    {/* Top Row: Gray Circle Icon */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-13 h-13 rounded-full bg-[#0000000d] border border-slate-200/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <Brain className="w-7 h-7 text-slate-800" weight="bold" />
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="space-y-3 pt-2">
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                            AI and Data Science Lab
                                        </h3>
                                        <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
                                            A domain-focused lab working on AI, machine learning, data science, computer vision, and NLP. We develop models, build data pipelines, and deploy AI solutions for real use cases.
                                        </p>
                                    </div>
                                </div>

                                {/* SVG Shape Divider & Card Footer Accent */}
                                <div className="relative z-10 pt-8 mt-6">
                                    {/* Curved Wave Shape Divider Line */}
                                    <svg className="w-full h-4 text-slate-200 mb-4" viewBox="0 0 400 20" fill="none" preserveAspectRatio="none">
                                        <path d="M0 10 Q 100 20 200 10 T 400 10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                                    </svg>

                                    {/* Bottom Accent Bar */}
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                                            Deep Domain Vertical Integration
                                        </span>
                                        <span className="text-slate-400 font-mono text-[11px]">LAB-01</span>
                                    </div>
                                </div>

                            </div>
                        </AnimatedCard>
                    </div>

                    {/* Generative AI Lab (Horizontal Lab) */}
                    <div className="lg:col-span-6">
                        <AnimatedCard className="h-full">
                            <div className="relative bg-white rounded-[24px] p-8 sm:p-10 border border-slate-200 flex flex-col justify-between h-full min-h-[380px] shadow-none transition-all duration-300 group overflow-hidden">

                                {/* Background Decorative Tech Dot Grid */}
                                <div
                                    className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none"
                                    style={{
                                        backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`,
                                        backgroundSize: `18px 18px`
                                    }}
                                />

                                {/* Large Subtle Watermark Icon in Bottom Right */}
                                <div className="absolute -bottom-6 -right-6 text-slate-900/5 group-hover:text-slate-900/10 transition-colors pointer-events-none">
                                    <Cpu className="w-48 h-48" weight="duotone" />
                                </div>

                                <div className="relative z-10 space-y-6">
                                    {/* Top Row: Gray Circle Icon */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-13 h-13 rounded-full bg-[#0000000d] border border-slate-200/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <Cpu className="w-7 h-7 text-slate-800" weight="bold" />
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="space-y-3 pt-2">
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                            Generative AI Lab
                                        </h3>
                                        <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
                                            A cross-domain lab applying generative AI across multiple fields. We build LLM applications, RAG systems, AI agents, and intelligent assistants that solve specific business and academic problems.
                                        </p>
                                    </div>
                                </div>

                                {/* SVG Shape Divider & Card Footer Accent */}
                                <div className="relative z-10 pt-8 mt-6">
                                    {/* Curved Wave Shape Divider Line */}
                                    <svg className="w-full h-4 text-slate-200 mb-4" viewBox="0 0 400 20" fill="none" preserveAspectRatio="none">
                                        <path d="M0 10 Q 100 0 200 10 T 400 10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                                    </svg>

                                    {/* Bottom Accent Bar */}
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                                            Cross-Domain GenAI Innovation
                                        </span>
                                        <span className="text-slate-400 font-mono text-[11px]">LAB-02</span>
                                    </div>
                                </div>

                            </div>
                        </AnimatedCard>
                    </div>

                </div>

            </div>
        </section>
    );
}
