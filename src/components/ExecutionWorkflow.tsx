"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkle, CaretRight } from "@phosphor-icons/react";

function FadeInCard({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                }
            },
            { threshold: 0.05 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, [delay]);

    return (
        <div className="w-full">
            <div
                ref={ref}
                style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0px)" : "translateY(24px)",
                    transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                }}
                className={`will-change-transform ${className}`}
            >
                {children}
            </div>
        </div>
    );
}

export default function ExecutionWorkflow() {
    // Made Changes
    // Multi-colored icon badges matching the site's template palette (Pink, Blue, Amber, Emerald, Purple, Cyan)
    const teamSteps = [
        {
            num: "01",
            title: "Learn",
            description: "Stay current with industry AI & tech advancements",
            iconBg: "bg-pink-500/15 border-pink-500/30 text-pink-400",
            hoverBorder: "hover:border-pink-500/50",
            path: (
                <path
                    d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zM9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9v1z"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )
        },
        {
            num: "02",
            title: "Build",
            description: "Apply learning directly to active real-world projects",
            iconBg: "bg-blue-500/15 border-blue-500/30 text-blue-400",
            hoverBorder: "hover:border-blue-500/50",
            path: (
                <>
                    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.8" />
                    <rect x="9" y="9" width="6" height="6" strokeWidth="1.8" />
                    <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" strokeWidth="1.8" strokeLinecap="round" />
                </>
            )
        },
        {
            num: "03",
            title: "Train",
            description: "Upskill students & faculty through live technical work",
            iconBg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
            hoverBorder: "hover:border-amber-500/50",
            path: (
                <>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 12v5c0 2 6 2 6 2s6 0 6-2v-5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )
        },
        {
            num: "04",
            title: "Deliver",
            description: "Deliver enterprise-grade results to our partners",
            iconBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
            hoverBorder: "hover:border-emerald-500/50",
            path: (
                <>
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" strokeWidth="1.8" />
                    <path d="M12 15l-3-3a22 2 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.95 11a22.35 22.35 0 0 1-3.05 2l-3-3z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )
        }
    ];

    const projectSteps = [
        {
            num: "01",
            title: "Discover",
            description: "Understand domain & pinpoint requirements",
            iconBg: "bg-pink-500/15 border-pink-500/30 text-pink-400",
            hoverBorder: "hover:border-pink-500/50",
            path: (
                <>
                    <circle cx="11" cy="11" r="8" strokeWidth="1.8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
                </>
            )
        },
        {
            num: "02",
            title: "Design",
            description: "Design optimal AI & cloud architecture",
            iconBg: "bg-purple-500/15 border-purple-500/30 text-purple-400",
            hoverBorder: "hover:border-purple-500/50",
            path: (
                <>
                    <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.8" />
                    <path d="M3 9h18M9 21V9" strokeWidth="1.8" strokeLinecap="round" />
                </>
            )
        },
        {
            num: "03",
            title: "Develop",
            description: "Build solution with continuous integration",
            iconBg: "bg-blue-500/15 border-blue-500/30 text-blue-400",
            hoverBorder: "hover:border-blue-500/50",
            path: (
                <>
                    <polyline points="16 18 22 12 16 6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="8 6 2 12 8 18" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )
        },
        {
            num: "04",
            title: "Deploy",
            description: "Deploy securely to target environment",
            iconBg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
            hoverBorder: "hover:border-cyan-500/50",
            path: (
                <>
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )
        },
        {
            num: "05",
            title: "Monitor",
            description: "Continuous telemetry & post-delivery support",
            iconBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
            hoverBorder: "hover:border-emerald-500/50",
            path: (
                <>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )
        }
    ];

    return (
        <section className="w-full bg-[#080c14] py-16 sm:py-24 relative overflow-hidden border-y border-slate-800/80">
            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
                {/* Header */}
                <div className="max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                        <Sparkle className="w-3.5 h-3.5 text-purple-400" weight="fill" />
                        <span>Structured Execution</span>
                    </div>

                    <h2
                        className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-tight tracking-tight !text-white"
                        style={{ color: "#ffffff", fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif" }}
                    >
                        Structured execution from concept to delivery.
                    </h2>

                    <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-400">
                        How we operate as a team and execute for client projects.
                    </p>
                </div>

                {/* Block 1: As a Team */}
                <FadeInCard>
                    <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 backdrop-blur-md">
                        <div className="space-y-2 border-b border-slate-800/80 pb-6">
                            <div className="text-xs font-extrabold uppercase tracking-widest text-purple-400">
                                Internal Methodology
                            </div>
                            <h3
                                className="text-2xl sm:text-3xl font-bold tracking-tight !text-white"
                                style={{ color: "#ffffff" }}
                            >
                                As a Team
                            </h3>
                            <p className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl text-slate-400">
                                We stay current with industry, apply what we learn to real work, upskill our students through that work, and deliver results to our partners.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {teamSteps.map((step, idx) => (
                                <div key={step.num} className="group">
                                    <div className={`h-full rounded-2xl bg-[#1f293d]/80 p-5 border border-slate-700/70 shadow-lg flex flex-col justify-between space-y-5 ${step.hoverBorder} transition-all duration-300 hover:bg-[#1f293d]`}>
                                        <div className="flex items-center justify-between">
                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${step.iconBg}`}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    {step.path}
                                                </svg>
                                            </div>
                                            <span className="text-xs font-extrabold tracking-wider text-slate-400">
                                                {step.num}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <h4
                                                className="text-base font-bold !text-white flex items-center justify-between"
                                                style={{ color: "#ffffff" }}
                                            >
                                                <span>{step.title}</span>
                                                {idx < teamSteps.length - 1 && (
                                                    <CaretRight className="w-4 h-4 text-slate-500 hidden lg:block group-hover:text-purple-400 transition-colors" weight="bold" />
                                                )}
                                            </h4>
                                            <p className="text-xs font-normal leading-relaxed text-slate-300">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeInCard>

                {/* Block 2: For Your Project */}
                <FadeInCard delay={150}>
                    <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 backdrop-blur-md">
                        <div className="space-y-2 border-b border-slate-800/80 pb-6">
                            <div className="text-xs font-extrabold uppercase tracking-widest text-purple-400">
                                Client Delivery Model
                            </div>
                            <h3
                                className="text-2xl sm:text-3xl font-bold tracking-tight !text-white"
                                style={{ color: "#ffffff" }}
                            >
                                For Your Project
                            </h3>
                            <p className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl text-slate-400">
                                We start by understanding your problem, design the right approach, build the solution, deploy it to your environment, and support it post-delivery.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {projectSteps.map((step, idx) => (
                                <div key={step.num} className="group">
                                    <div className={`h-full rounded-2xl bg-[#1f293d]/80 p-5 border border-slate-700/70 shadow-lg flex flex-col justify-between space-y-4 ${step.hoverBorder} transition-all duration-300 hover:bg-[#1f293d]`}>
                                        <div className="flex items-center justify-between">
                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${step.iconBg}`}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    {step.path}
                                                </svg>
                                            </div>
                                            <span className="text-xs font-extrabold tracking-wider text-slate-400">
                                                {step.num}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <h4
                                                className="text-base font-bold !text-white flex items-center justify-between"
                                                style={{ color: "#ffffff" }}
                                            >
                                                <span>{step.title}</span>
                                                {idx < projectSteps.length - 1 && (
                                                    <CaretRight className="w-3.5 h-3.5 text-slate-500 hidden lg:block group-hover:text-purple-400 transition-colors" weight="bold" />
                                                )}
                                            </h4>
                                            <p className="text-xs font-normal leading-relaxed text-slate-300">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeInCard>
            </div>
        </section>
    );
}
