"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MeshGradientCanvas from "@/components/MeshGradientCanvas";
import BrandTicker from "@/components/BrandTicker";
import CTASection from "@/components/CTASection";
import {
    Brain,
    ChartLine,
    Eye,
    Target,
    Cpu,
    Rocket,
    ArrowRight,
    MagnifyingGlass,
    Compass,
    Code,
    Cloud,
    Monitor,
    CheckCircle,
    ChatCircleText,
    Robot,
    Gear,
    Flask,
    Briefcase,
    Buildings,
    Package,
    ShoppingCart,
    Truck,
    GraduationCap,
    Heart,
    Building,
    Factory,
} from "@phosphor-icons/react";

// ─── Slot Machine Reel ─────────────────────────────────────────────────────
const reelIcons = [
    Brain, Cpu, Robot, Code, Cloud, Gear,
    Eye, ChartLine, Target, Flask, Buildings, Factory,
    GraduationCap, Heart, Package, Truck, Compass, Rocket,
];

interface SlotItem {
    icon: React.ComponentType<{ className?: string; weight?: "bold" | "fill" | "duotone" | "regular" | "light" | "thin" }>;
    colorClass: string;
    label: string;
}

const finalSlots: SlotItem[] = [
    { icon: Brain, colorClass: "text-teal-300", label: "AI" },
    { icon: Factory, colorClass: "text-amber-300", label: "Industry" },
    { icon: Gear, colorClass: "text-emerald-300", label: "Automation" },
];

function SlotReel() {
    const [indices, setIndices] = useState([0, 4, 9]);
    const [locked, setLocked] = useState([false, false, false]);
    const [done, setDone] = useState(false);
    const [spinKey, setSpinKey] = useState(0);

    const stopAt = [1200, 1900, 2600];

    const handleSpin = () => {
        setDone(false);
        setLocked([false, false, false]);
        setSpinKey(prev => prev + 1);
    };

    useEffect(() => {
        let isCancelled = false;
        const lockedRef = [false, false, false];
        const startTime = Date.now();
        let intervals: ReturnType<typeof setTimeout>[] = [];

        const tickSlot = (slotIdx: number) => {
            if (isCancelled || lockedRef[slotIdx]) return;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / stopAt[slotIdx], 1);
            const delay = 40 + progress * progress * 240;

            setIndices(prev => {
                const next = [...prev];
                next[slotIdx] = (next[slotIdx] + 1) % reelIcons.length;
                return next;
            });

            intervals[slotIdx] = setTimeout(() => tickSlot(slotIdx), delay);
        };

        intervals[0] = setTimeout(() => tickSlot(0), 40);
        intervals[1] = setTimeout(() => tickSlot(1), 60);
        intervals[2] = setTimeout(() => tickSlot(2), 50);

        const lockTimeouts = stopAt.map((t, i) => setTimeout(() => {
            if (isCancelled) return;
            lockedRef[i] = true;
            setLocked(prev => {
                const n = [...prev];
                n[i] = true;
                return n;
            });
            setIndices(prev => {
                const n = [...prev];
                const finalIcon = finalSlots[i].icon;
                const fi = reelIcons.findIndex(ic => ic === finalIcon);
                n[i] = fi >= 0 ? fi : n[i];
                return n;
            });
            if (i === 2) {
                setTimeout(() => {
                    if (!isCancelled) setDone(true);
                }, 200);
            }
        }, t));

        return () => {
            isCancelled = true;
            intervals.forEach(id => clearTimeout(id));
            lockTimeouts.forEach(id => clearTimeout(id));
        };
    }, [spinKey]);

    return (
        <div className="flex flex-col items-center gap-3 pt-2">
            {/* Clickable slot machine container */}
            <button
                type="button"
                onClick={handleSpin}
                title="Click to spin again!"
                className="group relative flex items-center -space-x-3.5 focus:outline-none cursor-pointer"
            >
                {finalSlots.map((slot, i) => {
                    const FinalIcon = slot.icon;
                    const CurrIcon = reelIcons[indices[i]];
                    const isLocked = locked[i];

                    return (
                        <div
                            key={i}
                            className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-900 flex items-center justify-center border-[2.5px] shadow-lg overflow-hidden transition-all duration-300 ${isLocked ? "border-white/90 scale-100 shadow-slate-900/40" : "border-white/40 scale-95"
                                }`}
                        >
                            <div className="transition-transform duration-75 ease-out">
                                {isLocked ? (
                                    <FinalIcon className={`w-6 h-6 ${slot.colorClass}`} weight="bold" />
                                ) : (
                                    <CurrIcon className="w-6 h-6 text-slate-300 opacity-80" weight="bold" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </button>
        </div>
    );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, []);
    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
        >
            {children}
        </div>
    );
}

// ─── What We Offer Data ────────────────────────────────────────────────────
const aiDataScienceServices = [
    { icon: Brain, label: "AI/ML Model Development" },
    { icon: Cpu, label: "Model Training and Inferencing" },
    { icon: Eye, label: "Computer Vision and NLP" },
    { icon: ChartLine, label: "Data Analytics & Predictive Modelling" },
    { icon: Target, label: "Model Evaluation and Optimization" },
    { icon: Cloud, label: "AI Solution Deployment" },
];

const genAIServices = [
    { icon: Code, label: "LLM Application Development" },
    { icon: Flask, label: "RAG-based Applications" },
    { icon: ChatCircleText, label: "AI Chatbots & Knowledge Assistants" },
    { icon: Robot, label: "AI Agents and Agentic Workflows" },
    { icon: Gear, label: "Prompt Engineering" },
    { icon: Monitor, label: "LLM Integration and Inferencing" },
];

// ─── Process Steps ─────────────────────────────────────────────────────────
const processSteps = [
    {
        id: "01",
        label: "Discover",
        icon: MagnifyingGlass,
        description: "We understand your business problem and define clear requirements.",
    },
    {
        id: "02",
        label: "Design",
        icon: Compass,
        description: "We propose the right model, architecture, and technology approach.",
    },
    {
        id: "03",
        label: "Develop",
        icon: Code,
        description: "We build, train, and test the solution with your data and context.",
    },
    {
        id: "04",
        label: "Deploy",
        icon: Cloud,
        description: "We integrate the solution into your environment.",
    },
    {
        id: "05",
        label: "Monitor",
        icon: Monitor,
        description: "We track performance and support ongoing improvements.",
    },
];

// ─── Industries ────────────────────────────────────────────────────────────
const industries = [
    { icon: Heart, label: "Healthcare & Life Sciences", desc: "Predictive diagnostics, patient data analytics, and clinical AI tools." },
    { icon: Building, label: "Finance & Banking", desc: "Risk modelling, fraud detection, and intelligent financial assistants." },
    { icon: Factory, label: "Manufacturing", desc: "Quality control vision systems, predictive maintenance, and process automation." },
    { icon: ShoppingCart, label: "Retail & E-Commerce", desc: "Recommendation systems, demand forecasting, and customer intelligence." },
    { icon: Truck, label: "Logistics & Supply Chain", desc: "Route optimization, shipment analytics, and AI-driven operations." },
    { icon: GraduationCap, label: "Education & Research", desc: "Intelligent tutoring, content generation, and academic data insights." },
];

// ─── Who This Is For ──────────────────────────────────────────────────────
const audience = [
    "Businesses looking to use data and AI to improve their operations",
    "Organisations that want to build AI-based tools for their teams or customers",
    "Teams looking to add generative AI to their existing products or workflows",
];

// ─── PAGE ──────────────────────────────────────────────────────────────────
export default function AITechnologyServicePage() {
    return (
        <div className="w-full bg-white min-h-screen overflow-x-hidden">

            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="relative w-full min-h-[72vh] bg-[#f0f4f4] pt-32 sm:pt-40 lg:pt-44 pb-20 sm:pb-28 overflow-hidden flex flex-col justify-center">

                {/* Teal/Cyan Mesh Gradient */}
                <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
                    <MeshGradientCanvas
                        colors={[
                            [0.13, 0.78, 0.67, 0.10],   // teal
                            [0.0, 0.55, 0.70, 0.08],   // cyan-blue
                            [0.0, 0.0, 0.0, 0.06],   // dark subtle
                            [0.07, 0.65, 0.60, 0.07],   // mint
                        ]}
                        distortion={1.0}
                        swirl={0.8}
                        grainMixer={0.0}
                        grainOverlay={0.0}
                        speed={0.8}
                    />
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 bg-gradient-to-b from-transparent via-white/40 to-white pointer-events-none z-[1]" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">

                    {/* Service Label Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-white/70 border border-teal-200/80 text-teal-700 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        <Brain className="w-4 h-4" weight="bold" />
                        AI & Technology
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.14] max-w-4xl mx-auto">
                        From Data to Deployment
                    </h1>

                    <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Practical AI and generative AI solutions built for real problems — grounded in engineering, deployed with purpose.
                    </p>

                    <div className="pt-4 flex flex-col items-center gap-5">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-slate-950 text-white font-semibold text-sm sm:text-[15px] hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
                        >
                            <span>Work With Us</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
                        </Link>

                        {/* Slot Machine Spin — AI × Industry × Automation */}
                        <SlotReel />
                    </div>

                </div>
            </section>


            {/* ── WHAT WE OFFER ─────────────────────────────────────────── */}
            <section className="w-full bg-white py-20 sm:py-28">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[720px] mb-14 sm:mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Rocket className="w-4 h-4" weight="bold" />
                                What We Offer
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Our Capabilities
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                Two focused practice areas covering the full spectrum of applied AI — from classical machine learning to the latest in generative AI.
                            </p>
                        </div>
                    </Reveal>

                    {/* Two-column Capability Blocks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* AI & Data Science Block */}
                        <Reveal delay={80}>
                            <div className="relative bg-[#f8fafc] rounded-[24px] p-8 sm:p-10 border border-slate-200 overflow-hidden h-full">
                                {/* Background dot grid */}
                                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`, backgroundSize: `18px 18px` }} />
                                {/* Watermark */}
                                <div className="absolute -bottom-6 -right-6 text-slate-900/5 pointer-events-none">
                                    <Brain className="w-52 h-52" weight="duotone" />
                                </div>

                                <div className="relative z-10 space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                                            <Brain className="w-6 h-6 text-slate-800" weight="bold" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-950">AI and Data Science</h3>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vertical Lab Practice</p>
                                        </div>
                                    </div>

                                    {/* Service Items */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        {aiDataScienceServices.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200/80 transition-all">
                                                <s.icon className="w-5 h-5 text-slate-600 shrink-0" weight="bold" />
                                                <span className="text-sm font-semibold text-slate-700 leading-snug">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* Generative AI Block */}
                        <Reveal delay={160}>
                            <div className="relative bg-[#f8fafc] rounded-[24px] p-8 sm:p-10 border border-slate-200 overflow-hidden h-full">
                                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`, backgroundSize: `18px 18px` }} />
                                <div className="absolute -bottom-6 -right-6 text-slate-900/5 pointer-events-none">
                                    <Cpu className="w-52 h-52" weight="duotone" />
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                                            <Cpu className="w-6 h-6 text-slate-800" weight="bold" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-950">Generative AI</h3>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Horizontal Lab Practice</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        {genAIServices.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200/80 transition-all">
                                                <s.icon className="w-5 h-5 text-slate-600 shrink-0" weight="bold" />
                                                <span className="text-sm font-semibold text-slate-700 leading-snug">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                    </div>
                </div>
            </section>


            {/* ── HOW WE APPROACH ───────────────────────────────────────── */}
            <section className="w-full bg-[#f8fafc] py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[720px] mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Compass className="w-4 h-4" weight="bold" />
                                Our Process
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                How We Approach Your Project
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                A structured and transparent five-phase approach — from understanding your problem to monitoring your solution in production.
                            </p>
                        </div>
                    </Reveal>

                    {/* Horizontal Step Cards - like the image reference */}
                    <div className="relative">
                        {/* Connector Line (desktop) */}
                        <div className="hidden lg:block absolute top-[52px] left-[108px] right-[108px] h-px border-t-2 border-dashed border-slate-300 z-0" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 relative z-10">
                            {processSteps.map((step, i) => (
                                <Reveal key={step.id} delay={i * 80}>
                                    <div className="relative bg-white rounded-[20px] p-6 border border-slate-200 flex flex-col items-center text-center gap-4 transition-all shadow-none">
                                        {/* Step Number Tag */}
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-200 rounded-[4px] px-2.5 py-0.5">
                                            {step.id}
                                        </span>
                                        {/* Icon Circle */}
                                        <div className="w-12 h-12 rounded-full bg-[#0000000d] border border-slate-200 flex items-center justify-center transition-all">
                                            <step.icon className="w-6 h-6 text-slate-800" weight="bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="text-base font-extrabold text-slate-950">{step.label}</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ── INDUSTRIES WE SERVE ───────────────────────────────────── */}
            <section className="w-full bg-white py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[720px] mb-14 sm:mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Buildings className="w-4 h-4" weight="bold" />
                                Industries We Serve
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Serving Across Verticals
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                Our labs have worked on projects that span multiple real-world sectors — bringing domain-focused AI solutions to each.
                            </p>
                        </div>
                    </Reveal>

                    {/* Industry Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {industries.map((industry, i) => (
                            <Reveal key={i} delay={i * 60}>
                                <div className="relative bg-[#f8fafc] rounded-[20px] p-7 border border-slate-200 flex flex-col gap-4 transition-all shadow-none h-full">
                                    <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-all">
                                        <industry.icon className="w-5 h-5 text-slate-800" weight="bold" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-950 mb-1">{industry.label}</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{industry.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>


            {/* ── WHO THIS IS FOR ───────────────────────────────────────── */}
            <section className="w-full bg-[#f8fafc] py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* Left: Header */}
                        <Reveal className="lg:col-span-5">
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                    <Briefcase className="w-4 h-4" weight="bold" />
                                    Who This Is For
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                    Built for Organizations Ready to Build with AI
                                </h2>
                                <p className="text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                    Whether you&apos;re starting from scratch or integrating AI into existing workflows, we can help you move from idea to production.
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-slate-950 text-white font-semibold text-sm sm:text-[15px] hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group w-fit"
                                >
                                    <span>Get in Touch</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
                                </Link>
                            </div>
                        </Reveal>

                        {/* Right: Audience Cards */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {audience.map((item, i) => (
                                <Reveal key={i} delay={i * 80}>
                                    <div className="flex items-start gap-4 bg-white rounded-[18px] px-6 py-5 border border-slate-200 transition-all shadow-none">
                                        <CheckCircle className="w-5 h-5 text-slate-800 mt-0.5 shrink-0" weight="fill" />
                                        <p className="text-slate-700 font-semibold text-base sm:text-lg leading-relaxed">{item}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>

                    </div>
                </div>
            </section>


            {/* ── FOOTER CALLOUTS ───────────────────────────────────────── */}
            {/* <BrandTicker /> */}
            <CTASection />

        </div>
    );
}
