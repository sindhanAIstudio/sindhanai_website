"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MeshGradientCanvas from "@/components/MeshGradientCanvas";
import BrandTicker from "@/components/BrandTicker";
import CTASection from "@/components/CTASection";
import {
    Code,
    ShoppingCart,
    Cloud,
    Gear,
    ArrowRight,
    CheckCircle,
    MagnifyingGlass,
    Compass,
    Monitor,
    Heart,
    Building,
    Factory,
    House,
    Storefront,
    Briefcase,
    Sparkle,
    Rocket,
    Globe,
    Stack,
    ShieldCheck
} from "@phosphor-icons/react";

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

// ─── What We Offer Items (4 Core Solutions) ────────────────────────────────
const offerings = [
    {
        icon: Globe,
        title: "Website Development",
        desc: "Clean, functional websites built for your audience and purpose — designed for performance, accessibility, and high conversion.",
    },
    {
        icon: ShoppingCart,
        title: "E-Commerce Solutions",
        desc: "End-to-end online store development with seamless payment gateway integration, inventory, and management tools.",
    },
    {
        icon: Stack,
        title: "Custom CRM and ERP",
        desc: "Tailored business management systems built around your specific processes, operations, and workflow automation requirements.",
    },
    {
        icon: Cloud,
        title: "DevOps and Cloud",
        desc: "Infrastructure setup, CI/CD pipelines, and cloud deployment on enterprise platforms like AWS, GCP, and Azure.",
    },
];

// ─── Process Steps (5 Steps) ───────────────────────────────────────────────
const processSteps = [
    {
        id: "01",
        label: "Discover",
        icon: MagnifyingGlass,
        description: "We understand your business, your users, and your goals.",
    },
    {
        id: "02",
        label: "Design",
        icon: Compass,
        description: "We propose a solution structure, technology stack, and delivery plan.",
    },
    {
        id: "03",
        label: "Develop",
        icon: Code,
        description: "We build, test, and iterate based on your feedback.",
    },
    {
        id: "04",
        label: "Deploy",
        icon: Cloud,
        description: "We launch the solution and hand over with full documentation.",
    },
    {
        id: "05",
        label: "Monitor",
        icon: Monitor,
        description: "We track performance and address issues after launch.",
    },
];

// ─── Industries We Serve (6 Sectors) ──────────────────────────────────────
const industries = [
    { icon: Storefront, label: "Retail and E-Commerce", desc: "Custom storefronts, order tracking, and omnichannel shopping systems." },
    { icon: House, label: "Real Estate", desc: "Property portals, CRM integrations, and interactive listing platforms." },
    { icon: Heart, label: "Healthcare", desc: "Patient portals, HIPAA-aligned record workflows, and scheduling tools." },
    { icon: Building, label: "Finance and Banking", desc: "Secure web portals, financial dashboards, and transaction management." },
    { icon: Factory, label: "Manufacturing", desc: "ERP integration, inventory management, and operational analytics." },
    { icon: Briefcase, label: "Small & Mid-Sized Businesses", desc: "Scalable web presences, internal tools, and workflow automation." },
];

// ─── Who This Is For (3 Audience Checklist Items) ──────────────────────────
const audienceList = [
    "Small and mid-sized businesses that need a web or software presence",
    "Institutions looking for custom internal tools and automation systems",
    "Organisations that need well-built software at a reasonable cost",
];

export default function SoftwareSolutionsServicePage() {
    return (
        <main className="w-full bg-white selection:bg-emerald-500 selection:text-white">

            {/* ── HERO SECTION ───────────────────────────────────────────── */}
            <section className="relative w-full min-h-[72vh] bg-[#f0f4f4] pt-32 sm:pt-40 lg:pt-44 pb-20 sm:pb-28 overflow-hidden flex flex-col justify-center">
                {/* Mesh Gradient Background (Subtle Cyan/Emerald Tint) */}
                <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
                    <MeshGradientCanvas
                        colors={[
                            [0.05, 0.70, 0.55, 0.10],   // subtle emerald/teal
                            [0.10, 0.50, 0.85, 0.08],   // subtle cyan/blue
                            [0.0, 0.0, 0.0, 0.06],      // dark subtle
                            [0.02, 0.60, 0.75, 0.07],   // subtle mint/sky
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
                        <Code className="w-4 h-4 text-slate-800" weight="bold" />
                        <span>Software Solutions</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.14] max-w-4xl mx-auto">
                        Software Solutions
                    </h1>

                    {/* Subheadline */}
                    <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Well-built web and cloud solutions that match your business requirements.
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
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-emerald-300 flex items-center justify-center border-[2.5px] border-white shadow-lg">
                                <Code className="w-6 h-6" weight="bold" />
                            </div>
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center border-[2.5px] border-white shadow-lg">
                                <ShoppingCart className="w-6 h-6" weight="bold" />
                            </div>
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-teal-300 flex items-center justify-center border-[2.5px] border-white shadow-lg">
                                <Cloud className="w-6 h-6" weight="bold" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ── WHAT WE OFFER ─────────────────────────────────────────── */}
            <section className="w-full bg-white py-20 sm:py-28">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[720px] mb-14 sm:mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Rocket className="w-4 h-4 text-slate-700" weight="bold" />
                                What We Offer
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Tailored Software & Cloud Engineering
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                End-to-end web applications, e-commerce systems, custom business tools, and cloud infrastructure.
                            </p>
                        </div>
                    </Reveal>

                    {/* 4 Core Solutions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {offerings.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <Reveal key={i} delay={i * 60}>
                                    <div className="bg-[#f8fafc] rounded-[24px] p-7 border border-slate-200 flex flex-col justify-between h-full space-y-5">
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-slate-800" weight="bold" />
                                            </div>
                                            <h3 className="text-xl font-extrabold text-slate-950 leading-snug">
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


            {/* ── HOW WE APPROACH ───────────────────────────────────────── */}
            <section className="w-full bg-[#f8fafc] py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[720px] mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Compass className="w-4 h-4 text-slate-700" weight="bold" />
                                Our Process
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                How We Approach Your Project
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                A structured and transparent five-phase delivery framework — from initial discovery to ongoing post-launch monitoring.
                            </p>
                        </div>
                    </Reveal>

                    {/* Horizontal Step Cards */}
                    <div className="relative">
                        {/* Connector Line (desktop) */}
                        <div className="hidden lg:block absolute top-[52px] left-[108px] right-[108px] h-px border-t-2 border-dashed border-slate-300 z-0" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 relative z-10">
                            {processSteps.map((step, i) => (
                                <Reveal key={step.id} delay={i * 80}>
                                    <div className="relative bg-white rounded-[20px] p-6 border border-slate-200 flex flex-col items-center text-center gap-4 transition-all shadow-none h-full">
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


            {/* ── INDUSTRIES WE SERVE ────────────────────────────────────── */}
            <section className="w-full bg-white py-20 sm:py-28 border-t border-slate-200/60">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                    <Reveal>
                        <div className="max-w-[720px] mb-14 sm:mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Building className="w-4 h-4 text-slate-700" weight="bold" />
                                Domain Expertise
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Industries We Serve
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                Solving domain-specific operational challenges with robust, secure, and scalable web solutions.
                            </p>
                        </div>
                    </Reveal>

                    {/* Industries Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {industries.map((ind, i) => {
                            const Icon = ind.icon;
                            return (
                                <Reveal key={i} delay={i * 60}>
                                    <div className="bg-[#f8fafc] rounded-[20px] p-7 border border-slate-200 space-y-4 h-full">
                                        <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-slate-800" weight="bold" />
                                        </div>
                                        <h3 className="text-lg font-extrabold text-slate-950">{ind.label}</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{ind.desc}</p>
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
                                    Engineering Solutions for Growing Businesses & Institutions
                                </h2>
                                <p className="text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                                    Whether you need to launch a new product, automate internal workflows, or modernize legacy systems.
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


            {/* ── FOOTER CALLOUTS ───────────────────────────────────────── */}
            {/* <BrandTicker /> */}
            <CTASection />

        </main>
    );
}
