"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MeshGradientCanvas from "@/components/MeshGradientCanvas";
import BrandTicker from "@/components/BrandTicker";
import {
    GraduationCap,
    Users,
    Buildings,
    Briefcase,
    Sparkle,
    ArrowRight,
    CheckCircle,
    BookOpen,
    Code,
    Brain,
    Compass,
    Trophy,
    UserCheck,
    Handshake,
    Laptop,
    Rocket
} from "@phosphor-icons/react";

// ─── Custom Mesh Gradient Colors for Training (Indigo/Violet/Amber/Sky) ────
const TRAINING_MESH_COLORS = [
    [0x4f / 255, 0x46 / 255, 0xe5 / 255, 1.0], // Indigo
    [0x8b / 255, 0x5c / 255, 0xf6 / 255, 1.0], // Violet
    [0xf5 / 255, 0x9e / 255, 0x0b / 255, 1.0], // Amber
    [0x0e / 255, 0xa5 / 255, 0xe9 / 255, 1.0], // Sky Blue
];

// ─── Animated reveal wrapper ───────────────────────────────────────────────
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

// ─── What We Offer Items ───────────────────────────────────────────────────
const offerings = [
    {
        icon: GraduationCap,
        title: "Faculty Learning and Upskilling",
        desc: "Helping faculty stay current with technology and industry practices through structured learning and knowledge sharing.",
    },
    {
        icon: Users,
        title: "Student Training",
        desc: "Hands-on training in computational thinking, programming, AI, data science, generative AI, and related areas.",
    },
    {
        icon: Compass,
        title: "Industry-Aligned Learning",
        desc: "Bringing real industry tools, workflows, and expectations into the classroom and student activities.",
    },
    {
        icon: Laptop,
        title: "Workshops and Technical Sessions",
        desc: "Focused sessions on specific tools, technologies, or problem areas tailored for institutional needs.",
    },
    {
        icon: Trophy,
        title: "Hackathons and Knowledge Events",
        desc: "Practical events where students build, compete, and collaborate on real-world engineering challenges.",
    },
    {
        icon: UserCheck,
        title: "Mentoring and Guidance",
        desc: "Supporting students through technical learning, project work, competitions, and career preparation.",
    },
    {
        icon: Buildings,
        title: "Institutional Support",
        desc: "Helping departments and institutions adopt technology to improve their processes and learning outcomes.",
    },
    {
        icon: Handshake,
        title: "Industry Collaboration",
        desc: "Connecting students and faculty with industry for learning, live projects, and career opportunities.",
    },
];

// ─── Approach Pillars ──────────────────────────────────────────────────────
const approachPillars = [
    {
        number: "01",
        title: "Learn by Building",
        desc: "Students build functional software and AI models rather than passively consuming theory.",
    },
    {
        number: "02",
        title: "Real Work Integration",
        desc: "Curricula built around production tools, version control, modern frameworks, and deployment.",
    },
    {
        number: "03",
        title: "Faculty & Student Mentorship",
        desc: "Direct access to experienced engineering practitioners throughout the learning journey.",
    },
];

// ─── Who We Train Categories ───────────────────────────────────────────────
const targetEcosystems = [
    {
        icon: Buildings,
        title: "Higher Education Institutions & Colleges",
        desc: "Empowering engineering, science, and technical colleges with updated tech tracks and FDP programs.",
    },
    {
        icon: BookOpen,
        title: "Schools & Pre-University Programmes",
        desc: "Introducing foundational coding, computational thinking, and AI concepts to early learners.",
    },
    {
        icon: Briefcase,
        title: "Corporate Teams & Organisations",
        desc: "Custom upskilling modules for technical teams adapting to generative AI and modern data pipelines.",
    },
    {
        icon: Rocket,
        title: "Government Bodies & Public Institutions",
        desc: "Capacity-building initiatives for public sector technology programs and skill development missions.",
    },
];

// ─── Audience Items ────────────────────────────────────────────────────────
const audienceList = [
    "Colleges and institutions looking to upskill faculty or students",
    "Departments that want to bring industry relevance into their curriculum",
    "Students preparing for careers in AI, data science, and software development",
];

export default function TrainingPage() {
    return (
        <main className="w-full bg-white selection:bg-indigo-500 selection:text-white">

            {/* ── HERO SECTION ───────────────────────────────────────────── */}
            <section className="relative w-full min-h-[72vh] bg-[#f0f4f4] pt-32 sm:pt-40 lg:pt-44 pb-20 sm:pb-28 overflow-hidden flex flex-col justify-center">
                {/* Mesh Gradient Background (Subtle) */}
                <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
                    <MeshGradientCanvas
                        colors={[
                            [0.31, 0.27, 0.90, 0.10],   // subtle indigo
                            [0.55, 0.36, 0.96, 0.08],   // subtle violet
                            [0.0, 0.0, 0.0, 0.06],      // dark subtle
                            [0.06, 0.65, 0.91, 0.07],   // subtle sky
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

                {/* Content */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-white/70 border border-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        <GraduationCap className="w-4 h-4 text-slate-800" weight="bold" />
                        <span>Training and Learning</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.14] max-w-4xl mx-auto">
                        Training and Learning
                    </h1>

                    {/* Subheadline */}
                    <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Practical, industry-aligned training for students, faculty, and institutions.
                    </p>

                    {/* CTA & Hero Circles */}
                    <div className="pt-4 flex flex-col items-center gap-5">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-slate-950 text-white font-semibold text-sm sm:text-[15px] hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
                        >
                            <span>Work With Us</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
                        </Link>

                        {/* Three overlapping dark icon circles */}
                        <div className="flex items-center -space-x-3.5 pt-1">
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center border-[2.5px] border-white shadow-lg">
                                <GraduationCap className="w-6 h-6" weight="bold" />
                            </div>
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-indigo-300 flex items-center justify-center border-[2.5px] border-white shadow-lg">
                                <Users className="w-6 h-6" weight="bold" />
                            </div>
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-sky-300 flex items-center justify-center border-[2.5px] border-white shadow-lg">
                                <Buildings className="w-6 h-6" weight="bold" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ── WHAT WE OFFER ─────────────────────────────────────────── */}
            <section className="w-full bg-white py-20 sm:py-28">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[760px] mb-14 sm:mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Sparkle className="w-4 h-4 text-slate-700" weight="bold" />
                                What We Offer
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Industry-Aligned Learning & Upskilling
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                Practical programs designed to bridge the gap between classroom theory and real-world engineering.
                            </p>
                        </div>
                    </Reveal>

                    {/* 8 Offerings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {offerings.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <Reveal key={i} delay={i * 50}>
                                    <div className="bg-[#f8fafc] rounded-[20px] p-6 sm:p-7 border border-slate-200 flex flex-col justify-between h-full space-y-4">
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-slate-800" weight="bold" />
                                            </div>
                                            <h3 className="text-lg font-extrabold text-slate-950 leading-snug">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>

                </div>
            </section>


            {/* ── OUR APPROACH TO TRAINING ──────────────────────────────── */}
            <section className="w-full bg-[#f8fafc] py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[760px] mb-12">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-200/80 border border-slate-300/80 text-slate-800 text-xs font-bold uppercase tracking-wider mb-4">
                                <Compass className="w-4 h-4 text-slate-800" weight="bold" />
                                Our Approach
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                How We Approach Training
                            </h2>
                        </div>
                    </Reveal>

                    {/* Core Principle Callout Banner */}
                    <Reveal>
                        <div className="relative bg-[#f8fafc] rounded-[24px] p-8 sm:p-12 mb-14 overflow-hidden border border-slate-200">
                            {/* Background dot grid pattern */}
                            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`, backgroundSize: `18px 18px` }} />

                            <div className="relative z-10 space-y-4 max-w-4xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide">
                                    <Sparkle className="w-3.5 h-3.5 text-slate-700" weight="bold" />
                                    Core Principle
                                </div>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-snug tracking-tight text-slate-950">
                                    &ldquo;We do not run training as a separate classroom exercise. Every training programme is connected to real work — students learn by building, not just by listening. Faculty upskilling follows the same principle.&rdquo;
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Approach Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {approachPillars.map((pillar, i) => (
                            <Reveal key={i} delay={i * 80}>
                                <div className="bg-white rounded-[20px] p-7 border border-slate-200 space-y-4 h-full">
                                    <span className="inline-block text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-[4px] font-mono">
                                        {pillar.number}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-slate-950">{pillar.title}</h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{pillar.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                </div>
            </section>


            {/* ── WHO WE TRAIN ─────────────────────────────────────────── */}
            <section className="w-full bg-white py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[720px] mb-14 sm:mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Users className="w-4 h-4" weight="bold" />
                                Who We Train
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Empowering Diverse Learning Ecosystems
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                Tailored practical programs built for educational institutions, schools, enterprise teams, and public organizations.
                            </p>
                        </div>
                    </Reveal>

                    {/* Ecosystem Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {targetEcosystems.map((eco, i) => {
                            const Icon = eco.icon;
                            return (
                                <Reveal key={i} delay={i * 60}>
                                    <div className="bg-[#f8fafc] rounded-[20px] p-7 border border-slate-200 flex flex-col justify-between h-full space-y-4">
                                        <div className="space-y-4">
                                            <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-slate-800" weight="bold" />
                                            </div>
                                            <h3 className="text-base font-extrabold text-slate-950 leading-snug">{eco.title}</h3>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{eco.desc}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>

                </div>
            </section>


            {/* ── WHO THIS IS FOR ───────────────────────────────────────── */}
            <section className="w-full bg-[#f8fafc] py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* Left Header */}
                        <Reveal className="lg:col-span-5">
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-200/80 border border-slate-300/80 text-slate-800 text-xs font-bold uppercase tracking-wider">
                                    <Briefcase className="w-4 h-4" weight="bold" />
                                    Who This Is For
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                    Built for Forward-Thinking Institutions & Learners
                                </h2>
                                <p className="text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                    Whether you&apos;re updating academic curricula or preparing students for high-impact technical careers.
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

                        {/* Right Cards */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {audienceList.map((item, i) => (
                                <Reveal key={i} delay={i * 80}>
                                    <div className="flex items-start gap-4 bg-white rounded-[18px] px-6 py-5 border border-slate-200 transition-all">
                                        <CheckCircle className="w-5 h-5 text-slate-800 mt-0.5 shrink-0" weight="fill" />
                                        <p className="text-slate-700 font-semibold text-base sm:text-lg leading-relaxed">{item}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>

                    </div>
                </div>
            </section>


            {/* ── CUSTOM PAGE-SPECIFIC CTA SECTION ──────────────────────── */}
            <section className="w-full bg-white py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="relative bg-slate-950 rounded-[32px] p-8 sm:p-14 md:p-16 overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                            {/* Background mesh glow */}
                            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                            <div className="relative z-10 max-w-2xl space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                    <GraduationCap className="w-4 h-4" weight="bold" />
                                    Institutional Workshops & Training
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                    Looking to run a training programme or workshop?
                                </h3>
                                <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
                                    Connect with our team to bring practical, industry-aligned training to your institution, faculty, or students.
                                </p>
                            </div>

                            <div className="relative z-10 shrink-0">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-3 px-8 py-4 rounded-[12px] bg-white text-slate-950 font-bold text-base hover:bg-slate-100 transition-all shadow-lg hover:scale-[1.03] group"
                                >
                                    <span>Get in Touch</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Global Brand Ticker */}
            <BrandTicker />

        </main>
    );
}
