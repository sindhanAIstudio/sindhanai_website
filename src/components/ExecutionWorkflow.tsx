"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Lightbulb,
    Cpu,
    GraduationCap,
    RocketLaunch,
    MagnifyingGlass,
    PenNib,
    CodeSimple,
    CloudArrowUp,
    Pulse
} from "@phosphor-icons/react";

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

function FadeIn({ children, className = "", delay = 0 }: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                }
            },
            { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
        );

        if (ref.current) observer.observe(ref.current);
        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [delay]);

    return (
        <div
            ref={ref}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0px)" : "translateY(20px)",
                transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
            }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </div>
    );
}

export default function ExecutionWorkflow() {
    const teamWorkflow = [
        {
            num: "01",
            title: "Learn",
            description: "Stay current with industry AI & tech advancements",
            icon: Lightbulb,
        },
        {
            num: "02",
            title: "Build",
            description: "Apply learning directly to active real-world projects",
            icon: Cpu,
        },
        {
            num: "03",
            title: "Train",
            description: "Upskill students & faculty through live technical work",
            icon: GraduationCap,
        },
        {
            num: "04",
            title: "Deliver",
            description: "Deliver enterprise-grade results to our partners",
            icon: RocketLaunch,
        },
    ];

    const projectWorkflow = [
        {
            num: "01",
            title: "Discover",
            description: "Understand domain & pinpoint requirements",
            detail: "In-depth problem decomposition, stakeholder alignment, data audit, and technical feasibility assessment.",
            icon: MagnifyingGlass,
        },
        {
            num: "02",
            title: "Design",
            description: "Design optimal AI & cloud architecture",
            detail: "Model selection, pipeline architecture, latency benchmarking, security controls, and infrastructure blueprint.",
            icon: PenNib,
        },
        {
            num: "03",
            title: "Develop",
            description: "Build solution with continuous integration",
            detail: "Iterative sprints, rigorous unit & evaluation testing, human-in-the-loop validation, and clean version control.",
            icon: CodeSimple,
        },
        {
            num: "04",
            title: "Deploy",
            description: "Deploy securely to target environment",
            detail: "Containerized deployment, air-gapped or VPC hosting, automated failover, and strict enterprise IAM integration.",
            icon: CloudArrowUp,
        },
        {
            num: "05",
            title: "Monitor",
            description: "Continuous telemetry & post-delivery support",
            detail: "Real-time drift detection, accuracy tracking, SLA monitoring, and scheduled model retraining loops.",
            icon: Pulse,
        },
    ];

    return (
        <section
            id="execution-workflow"
            aria-label="Execution Workflow"
            className="w-full bg-[#000000] text-[#F5F5F5] py-24 sm:py-32 lg:py-40 border-y border-[#222222] relative selection:bg-[#F5F5F5] selection:text-[#000000]"
        >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-24 sm:space-y-32">
                {/* SECTION HEADER: Editorial Asymmetric Layout */}
                <FadeIn>
                    <div className="max-w-3xl space-y-2">
                        {/* Main Headline */}
                        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-950 tracking-tight leading-[1.12]">
                            Structured execution <br className="hidden sm:inline" />
                            from concept to delivery.
                        </h2>
                        {/* Light Grey Sub-text */}
                        <p className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-[#949494] tracking-tight leading-[1.2]">
                            Industry practice, academic rigor, and student innovation working together.
                        </p>
                    </div>
                </FadeIn>

                {/* WORKFLOW 01: AS A TEAM (Horizontal Editorial Grid) */}
                <div className="space-y-8 sm:space-y-12">
                    <FadeIn delay={100}>
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6">
                            <div className="space-y-2">
                                {/* <div className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#666666]">
                                    INTERNAL METHODOLOGY
                                </div> */}
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[#F5F5F5]">
                                    As a Team
                                </h3>
                            </div>
                            <p className="text-base sm:text-lg text-[#9A9A9A] max-w-xl font-normal leading-relaxed">
                                We stay current with industry, apply what we learn to real work, upskill our students through that work, and deliver results to our partners.
                            </p>
                        </div>
                    </FadeIn>

                    {/* Horizontal 4-Stage Grid with Glossy Glassmorphism */}
                    <FadeIn delay={150}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {teamWorkflow.map((step) => {
                                const IconComponent = step.icon;
                                return (
                                    <div
                                        key={step.num}
                                        className="group relative p-8 sm:p-9 flex flex-col justify-between min-h-[280px] sm:min-h-[310px] rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/[0.18] shadow-xl shadow-black/30 hover:bg-white/[0.15] hover:border-white/[0.32] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Top Row: Step number & subtle icon */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-base sm:text-lg font-bold tracking-widest text-slate-300 group-hover:text-white transition-colors duration-300">
                                                {step.num}
                                            </span>
                                            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-200 group-hover:bg-white/20 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                                                <IconComponent className="w-5 h-5" weight="bold" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-3 pt-8">
                                            <h4 className="text-xl sm:text-2xl font-bold tracking-wide text-white group-hover:translate-x-1 transition-transform duration-300">
                                                {step.title}
                                            </h4>
                                            <p className="text-sm sm:text-base text-slate-300 group-hover:text-white leading-relaxed font-normal transition-colors duration-300">
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Animated bottom glow indicator */}
                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-500 ease-out group-hover:w-full" />
                                    </div>
                                );
                            })}
                        </div>
                    </FadeIn>
                </div>

                {/* WORKFLOW 02: FOR YOUR PROJECT (Vertical Editorial Engineering Timeline) */}
                <div className="pt-8 sm:pt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        {/* Left Column: Context & Overview */}
                        <div className="lg:col-span-4">
                            <div className="lg:sticky lg:top-28 space-y-8">
                                <FadeIn delay={100}>
                                    <div className="space-y-3">
                                        {/* <div className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#666666]">
                                            CLIENT DELIVERY MODEL
                                        </div> */}
                                        <h3 className="text-3xl sm:text-4xl lg:text-[40px] font-medium tracking-tight text-[#F5F5F5] leading-tight">
                                            For Your Project
                                        </h3>
                                    </div>
                                    <p className="text-base sm:text-lg text-[#9A9A9A] font-normal leading-relaxed pt-3">
                                        We start by understanding your problem, design the right approach, build the solution, deploy it to your environment, and support it post-delivery.
                                    </p>
                                </FadeIn>

                                <FadeIn delay={150}>
                                    <div className="p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl space-y-4">
                                        <div className="text-xs sm:text-sm uppercase tracking-wider text-[#888888] font-semibold">
                                            Delivery Tenets
                                        </div>
                                        <ul className="space-y-3 text-sm sm:text-[15px] text-[#A5A5A5]">
                                            <li className="flex items-center gap-2.5">
                                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full shrink-0" />
                                                Full IP & repository ownership transfer
                                            </li>
                                            <li className="flex items-center gap-2.5">
                                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full shrink-0" />
                                                Milestone-based delivery & verification
                                            </li>
                                            <li className="flex items-center gap-2.5">
                                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full shrink-0" />
                                                Production telemetry & SLA guarantees
                                            </li>
                                        </ul>
                                    </div>
                                </FadeIn>
                            </div>
                        </div>

                        {/* Right Column: Vertical Timeline Sequence */}
                        <div className="lg:col-span-8">
                            <div className="relative">
                                {/* Perfectly centered continuous vertical timeline line */}
                                <div className="absolute left-[14px] sm:left-[16px] top-6 bottom-6 w-[1px] bg-white/10 -translate-x-1/2" />

                                <div className="space-y-8 sm:space-y-10">
                                    {projectWorkflow.map((stage, idx) => {
                                        const IconComponent = stage.icon;
                                        return (
                                            <FadeIn key={stage.num} delay={idx * 80}>
                                                <div className="group relative flex items-start gap-5 sm:gap-8">
                                                    {/* Timeline Node marker perfectly aligned on the line */}
                                                    <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0a0a0a] border border-white/20 group-hover:border-white flex items-center justify-center shrink-0 mt-6 shadow-md transition-colors duration-300">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-white/40 group-hover:bg-white transition-colors duration-300" />
                                                    </div>

                                                    {/* Glossy Glassmorphic Stage Card */}
                                                    <div className="flex-1 p-7 sm:p-9 rounded-3xl border border-white/[0.18] bg-white/[0.08] backdrop-blur-2xl hover:bg-white/[0.15] hover:border-white/[0.32] shadow-xl shadow-black/30 hover:shadow-2xl transition-all duration-300 space-y-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                                                            <div className="flex items-center gap-3.5">
                                                                <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-300 group-hover:text-white transition-colors">
                                                                    STAGE {stage.num}
                                                                </span>
                                                                <span className="text-white/30 hidden sm:inline">/</span>
                                                                <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:translate-x-0.5 transition-transform duration-200">
                                                                    {stage.title}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
                                                                <IconComponent className="w-6 h-6" weight="bold" />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2.5">
                                                            <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
                                                                {stage.description}
                                                            </p>
                                                            <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                                                                {stage.detail}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </FadeIn>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

