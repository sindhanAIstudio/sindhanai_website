"use client";

import React, { useEffect, useRef, useState, CSSProperties } from "react";
import Image from "next/image";
import { CheckCircle, Users, Check } from "@phosphor-icons/react";

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

export default function HighlightFeatures() {
    const headingStyle: CSSProperties = {
        fontSize: "clamp(30px, 3.6vw, 54px)",
        fontWeight: 800,
        lineHeight: 1.1,
        fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif",
    };
    const subStyle: CSSProperties = {
        fontSize: "clamp(22px, 2.5vw, 38px)",
        fontWeight: 700,
        lineHeight: 1.2,
        fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif",
    };

    return (
        <section className="w-full bg-white py-16 sm:py-24">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                <div className="max-w-[1100px] mb-12 sm:mb-16">
                    <div className="flex flex-wrap items-center" style={{ gap: "0.3em", lineHeight: 1.1 }}>
                        {"AI is not just an experiment.".split(" ").map((word, i) => (
                            <WordFade key={`h1-${i}`} word={word} delay={i * 45} color="#0f172a" style={headingStyle} />
                        ))}

                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "10px 20px",
                                borderRadius: "999px",
                                background: "linear-gradient(130deg, #f9c4e4 0%, #dab8f7 50%, #e0daff 100%)",
                                verticalAlign: "middle",
                                lineHeight: 1,
                                flexShrink: 0,
                                margin: "0 0.15em",
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <defs>
                                    <linearGradient id="spark-g" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#EC4899" />
                                        <stop offset="100%" stopColor="#A855F7" />
                                    </linearGradient>
                                </defs>
                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#spark-g)" />
                                <path d="M19 2L20.25 4.75L23 6L20.25 7.25L19 10L17.75 7.25L15 6L17.75 4.75L19 2Z" fill="url(#spark-g)" opacity="0.55" />
                            </svg>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <defs>
                                    <linearGradient id="arr-g" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#A855F7" />
                                        <stop offset="100%" stopColor="#818CF8" />
                                    </linearGradient>
                                </defs>
                                <path d="M5 12H19M13 6L19 12L13 18" stroke="url(#arr-g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>

                        {"It is your core capability.".split(" ").map((word, i) => (
                            <WordFade key={`h2-${i}`} word={word} delay={120 + i * 45} color="#0f172a" style={headingStyle} />
                        ))}
                    </div>

                    <div className="flex flex-wrap" style={{ marginTop: "0.4em", gap: "0.3em" }}>
                        {"We build practical intelligent frameworks that streamline operations, support better decision-making, and drive real growth.".split(" ").map((word, i) => (
                            <WordFade key={`sub-${i}`} word={word} delay={220 + i * 18} color="#b0b0b0" style={subStyle} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7">
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatedCard>
                            <div className="relative bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] rounded-[24px] p-7 border border-black/5 flex flex-col justify-between h-[270px] hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs border border-black/5">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <defs><linearGradient id="g-sparkle" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EC4899" /><stop offset="50%" stopColor="#A855F7" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient></defs>
                                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#g-sparkle)" />
                                                <path d="M19 2L20.25 5.75L24 7L20.25 8.25L19 12L17.75 8.25L14 7L17.75 5.75L19 2Z" fill="url(#g-sparkle)" opacity="0.8" />
                                            </svg>
                                        </div>
                                        <span className="bg-slate-200/90 text-slate-800 text-[11px] font-bold px-3.5 py-1 rounded-full border border-black/5">Core</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-950 mb-2">Applied AI & ML</h3>
                                    <p className="text-sm font-semibold text-slate-600 leading-snug">Practical machine learning models deployed for real operational needs.</p>
                                </div>
                            </div>
                        </AnimatedCard>

                        <AnimatedCard>
                            <div className="relative bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] rounded-[24px] p-7 border border-black/5 flex flex-col justify-between h-[270px] hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs border border-black/5">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <defs><linearGradient id="g-gen" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A855F7" /><stop offset="50%" stopColor="#EC4899" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                                                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="url(#g-gen)" strokeWidth="2.5" fill="none" />
                                                <rect x="8" y="8" width="8" height="8" rx="2.5" fill="url(#g-gen)" opacity="0.4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-950 mb-2">Generative Systems</h3>
                                    <p className="text-sm font-semibold text-slate-600 leading-snug">Production-ready RAG applications, LLM workflows, and intelligent assistants.</p>
                                </div>
                            </div>
                        </AnimatedCard>

                        <AnimatedCard>
                            <div className="relative bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] rounded-[24px] p-7 border border-black/5 flex flex-col justify-between h-[270px] hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs border border-black/5">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <defs><linearGradient id="g-ring" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A855F7" /><stop offset="60%" stopColor="#EC4899" /><stop offset="100%" stopColor="#06B6D4" /></linearGradient></defs>
                                                <circle cx="12" cy="12" r="7.5" stroke="url(#g-ring)" strokeWidth="3.5" strokeDasharray="36 10" fill="none" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-950 mb-2">Data Intelligence</h3>
                                    <p className="text-sm font-semibold text-slate-600 leading-snug">Turn scattered organizational data into structured analytics and predictive insights.</p>
                                </div>
                            </div>
                        </AnimatedCard>

                        <AnimatedCard>
                            <div className="relative bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] rounded-[24px] p-7 border border-black/5 flex flex-col justify-between h-[270px] hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs border border-black/5">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <defs><linearGradient id="g-shield" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="50%" stopColor="#EC4899" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                                                <path d="M12 2L4 5V11C4 16.55 7.4 21.74 12 23C16.6 21.74 20 16.55 20 11V5L12 2Z" fill="url(#g-shield)" opacity="0.15" stroke="url(#g-shield)" strokeWidth="2" />
                                                <path d="M13 7L8.5 13H12.5L11 18L15.5 12H11.5L13 7Z" fill="url(#g-shield)" />
                                            </svg>
                                        </div>
                                        <span className="bg-slate-200/90 text-slate-800 text-[11px] font-bold px-3.5 py-1 rounded-full border border-black/5">Enterprise</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-950 mb-2">Secure Deployment</h3>
                                    <p className="text-sm font-semibold text-slate-600 leading-snug">Enterprise-grade AI integration tailored to your existing software infrastructure.</p>
                                </div>
                            </div>
                        </AnimatedCard>
                    </div>

                    <div className="lg:col-span-4">
                        <AnimatedCard className="h-full">
                            <div className="bg-gradient-to-br from-[#0000000d] via-[#00000010] to-[#0000000a] rounded-[24px] p-7 border border-black/5 flex flex-col justify-between h-full space-y-8 hover:shadow-md transition-shadow">
                                <div className="bg-white rounded-[20px] p-6 shadow-xs border border-black/5 overflow-hidden space-y-6">
                                    <div className="flex items-center justify-between gap-2 overflow-hidden py-1">
                                        <div className="flex items-center -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white overflow-hidden relative">
                                                <Image src="/images/sindhanai/person-image-4.webp" alt="Team member" width={32} height={32} className="object-cover" />
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white overflow-hidden relative">
                                                <Image src="/images/sindhanai/circles-image-7.webp" alt="Team avatar" width={32} height={32} className="object-cover" />
                                            </div>
                                        </div>
                                        <div className="bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-black/5 shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-slate-800" />
                                            <span className="text-xs font-bold text-slate-900">AI Agency</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="w-5 h-5 text-slate-800" weight="fill" />
                                            <CheckCircle className="w-5 h-5 text-slate-800" weight="fill" />
                                        </div>
                                    </div>
                                    <div className="rounded-[16px] py-4 px-6 bg-[#F5F4F0] border border-black/5 flex items-center justify-center shadow-2xs">
                                        <span className="text-lg font-black tracking-tight text-slate-950">SINTHAN<span className="text-slate-700">AI</span></span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-slate-950 leading-tight">Built for Real Business. Delivered by Experts.</h3>
                                    <p className="text-sm font-semibold text-slate-600 leading-relaxed">We partner with forward-looking organisations ready to embed artificial intelligence into every layer of their work.</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                    <span className="bg-slate-200/90 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 border border-black/5">
                                        <Check className="w-3.5 h-3.5 text-slate-900" weight="bold" /> Expert-Led Delivery
                                    </span>
                                    <span className="bg-slate-200/90 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 border border-black/5">
                                        <Users className="w-3.5 h-3.5 text-slate-900" weight="bold" /> Institutional Trust
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
