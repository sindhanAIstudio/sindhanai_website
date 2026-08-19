"use client";

import React, { useEffect, useRef, useState, CSSProperties } from "react";
import { Buildings, Sparkle, Target } from "@phosphor-icons/react";

function WordFade({
    word,
    delay = 0,
    color = "#0f172a",
    style = {},
}: {
    word: string;
    delay?: number;
    color?: string;
    style?: CSSProperties;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setTimeout(() => setVisible(true), delay); },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, [delay]);

    return (
        <span
            ref={ref}
            style={{
                display: "inline-block",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0px)" : "translateY(14px)",
                transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                color,
                ...style,
            }}
        >
            {word}&nbsp;
        </span>
    );
}

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

export default function AboutHighlightSection() {
    const headingStyle: CSSProperties = {
        fontSize: "clamp(28px, 3.4vw, 50px)",
        fontWeight: 800,
        lineHeight: 1.15,
        fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif",
    };
    const subStyle: CSSProperties = {
        fontSize: "clamp(18px, 2.1vw, 32px)",
        fontWeight: 600,
        lineHeight: 1.3,
        fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif",
    };

    return (
        <section className="w-full bg-white py-16 sm:py-24">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Animated Typography Header Block — Full Exact Content */}
                <div className="max-w-[1150px] mb-14 sm:mb-16">
                    <div className="flex flex-wrap items-center" style={{ gap: "0.3em", lineHeight: 1.15 }}>
                        {"Sindhanai is the applied AI and technology team under the".split(" ").map((word, i) => (
                            <WordFade key={`h1-${i}`} word={word} delay={i * 40} color="#0f172a" style={headingStyle} />
                        ))}

                        {/* Pill Badge */}
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 18px",
                                borderRadius: "8px",
                                background: "linear-gradient(130deg, #f9c4e4 0%, #dab8f7 50%, #e0daff 100%)",
                                verticalAlign: "middle",
                                lineHeight: 1,
                                flexShrink: 0,
                                margin: "0 0.15em",
                            }}
                        >
                            <Buildings className="w-5 h-5 text-purple-700" weight="bold" />
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">School of Innovation</span>
                        </span>

                        {"at KGISL Educational Institutions.".split(" ").map((word, i) => (
                            <WordFade key={`h2-${i}`} word={word} delay={180 + i * 40} color="#0f172a" style={headingStyle} />
                        ))}
                    </div>

                    {/* Subtitle Description — Full Exact Text */}
                    <div className="flex flex-wrap" style={{ marginTop: "0.8em", gap: "0.3em" }}>
                        {"We run the AI and Data Science vertical lab and the Generative AI horizontal lab - bringing together industry professionals, faculty, and students to work on real projects and develop practical skills.".split(" ").map((word, i) => (
                            <WordFade key={`sub-${i}`} word={word} delay={300 + i * 16} color="#71717a" style={subStyle} />
                        ))}
                    </div>
                </div>

                {/* VISION & MISSION DUAL CARD GRID (Pure Black & Pure Gray with User's Circular Icon Badge Style) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-stretch">

                    {/* VISION CARD — Pure Black Card */}
                    <div className="lg:col-span-5">
                        <AnimatedCard className="h-full">
                            <div className="relative bg-slate-950 text-white rounded-[24px] p-8 sm:p-10 border border-slate-800 flex flex-col justify-between h-full min-h-[400px] shadow-lg hover:shadow-xl transition-all duration-300 group">

                                <div className="space-y-6">
                                    {/* Top Row: Left = White Circular Icon Badge, Right = Pill */}
                                    <div className="flex items-center justify-between">
                                        {/* White Circle Icon Container (Matching User Screenshot) */}
                                        <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <Sparkle className="w-6 h-6 text-purple-600" weight="fill" />
                                        </div>

                                        <span className="text-xs font-semibold text-slate-300 bg-white/10 border border-white/15 px-3.5 py-1 rounded-[6px]">
                                            Vision
                                        </span>
                                    </div>

                                    {/* Title & Vision Statement */}
                                    <div className="space-y-3">
                                        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                                            Vision
                                        </h3>
                                        <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
                                            To build a team where students work on real problems alongside industry professionals and faculty - gaining the skills and confidence to create with technology, not just learn about it.
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Clean Text Tags */}
                                <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
                                    <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase bg-slate-900 px-3.5 py-1.5 rounded-md border border-slate-800">
                                        Real-World Impact
                                    </span>
                                    <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase bg-slate-900 px-3.5 py-1.5 rounded-md border border-slate-800">
                                        Confident Builders
                                    </span>
                                </div>

                            </div>
                        </AnimatedCard>
                    </div>

                    {/* MISSION CARD — Pure Gray Card */}
                    <div className="lg:col-span-7">
                        <AnimatedCard className="h-full">
                            <div className="relative bg-[#0000000d] text-slate-950 rounded-[24px] p-8 sm:p-10 border border-black/5 flex flex-col justify-between h-full min-h-[400px] hover:shadow-md transition-all duration-300 group">

                                <div className="space-y-6">
                                    {/* Top Row: Left = White Circular Icon Badge, Right = Pill */}
                                    <div className="flex items-center justify-between">
                                        {/* White Circle Icon Container (Matching User Screenshot) */}
                                        <div className="w-12 h-12 rounded-full bg-white shadow-md border border-slate-200/60 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <Target className="w-6 h-6 text-pink-600" weight="bold" />
                                        </div>

                                        <span className="text-xs font-semibold text-slate-700 bg-black/5 border border-black/5 px-3.5 py-1 rounded-[6px]">
                                            Mission
                                        </span>
                                    </div>

                                    {/* Title & Mission Statement */}
                                    <div className="space-y-3">
                                        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                                            Mission
                                        </h3>
                                        <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed">
                                            Sindhanai brings together industry professionals, faculty, and students from our AI and Data Science and Generative AI labs. We train students in computational thinking, programming, AI, data science, and generative AI - not just in classrooms, but through real work. We take on projects from industry partners, deliver practical solutions, and through that process, help students grow into professionals who can think clearly, build confidently, and solve problems that matter.
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Clean Text Tags */}
                                <div className="pt-8 border-t border-black/10 flex flex-wrap items-center gap-3">
                                    <span className="text-slate-700 text-xs font-semibold tracking-wide uppercase bg-white/80 px-3.5 py-1.5 rounded-md border border-black/5">
                                        Computational Thinking
                                    </span>
                                    <span className="text-slate-700 text-xs font-semibold tracking-wide uppercase bg-white/80 px-3.5 py-1.5 rounded-md border border-black/5">
                                        AI & GenAI Labs
                                    </span>
                                    <span className="text-slate-700 text-xs font-semibold tracking-wide uppercase bg-white/80 px-3.5 py-1.5 rounded-md border border-black/5">
                                        Industry Partners
                                    </span>
                                </div>

                            </div>
                        </AnimatedCard>
                    </div>

                </div>

            </div>
        </section>
    );
}
