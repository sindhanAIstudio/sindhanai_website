"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";

function AnimatedOrb({ className }: { className: string }) {
    return <div className={`absolute rounded-full blur-3xl pointer-events-none opacity-30 animate-pulse ${className}`} />;
}

export default function CTASection({ bgClass = "bg-white" }: { bgClass?: string }) {
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
        <section className={`w-full ${bgClass} py-16 sm:py-20 px-4 sm:px-6 lg:px-8`}>
            <div
                ref={ref}
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(40px)",
                    transition: "opacity 0.8s ease-out, transform 0.8s ease-out"
                }}
                className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Left Card - 16:9 Aspect Ratio */}
                <div className="w-full aspect-[16/9] min-h-[340px] rounded-3xl bg-[#f5f4f0] border border-black/6 p-8 sm:p-12 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2
                            className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-slate-950 leading-[1.15] tracking-tight"
                            style={{ fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif" }}
                        >
                            Have a project in mind?{" "}
                            <span className="text-slate-500 font-bold">Let us work on it together.</span>
                        </h2>
                    </div>

                    <div className="pt-4">
                        <div className="flex items-center gap-5 flex-wrap">
                            <div className="flex items-center -space-x-2.5">
                                {["bg-indigo-400", "bg-purple-400", "bg-pink-400"].map((c, i) => (
                                    <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                                        {["SK", "AP", "MR"][i]}
                                    </div>
                                ))}
                            </div>

                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-700 transition-colors group shadow-md"
                            >
                                Start a Conversation
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Card - 16:9 Aspect Ratio Pure Infographic Graphic */}
                <div className="relative w-full aspect-[16/9] min-h-[340px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
                    {/* Soft ambient glowing orbs */}
                    <AnimatedOrb className="w-72 h-72 bg-purple-400 -top-20 -right-20" />
                    <AnimatedOrb className="w-56 h-56 bg-indigo-400 bottom-4 -left-16" />
                    <AnimatedOrb className="w-48 h-48 bg-pink-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                    {/* Gradient background overlays */}
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#e8e8f0_25%,transparent_50%,#f0e8f0_75%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(139,92,246,0.15),transparent_65%)]" />

                    {/* Animated spinning SVG patterns and neural grid */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                        {/* Outer Orbit */}
                        <svg className="absolute w-[360px] h-[360px] opacity-15 animate-spin-slow" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" stroke="#7C3AED" strokeWidth="1" fill="none" strokeDasharray="10 8" />
                            <circle cx="100" cy="100" r="70" stroke="#EC4899" strokeWidth="1" fill="none" strokeDasharray="6 10" />
                        </svg>

                        {/* Inner Counter Orbit */}
                        <svg className="absolute w-[240px] h-[240px] opacity-20" style={{ animation: "spin 25s linear infinite reverse" }} viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="80" stroke="#3B82F6" strokeWidth="1" fill="none" strokeDasharray="8 6" />
                            <circle cx="100" cy="100" r="55" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 8" />
                        </svg>

                        {/* Floating Glow Particle Dots */}
                        {[
                            { top: "20%", left: "25%", size: 6, delay: "0s" },
                            { top: "35%", left: "75%", size: 8, delay: "0.5s" },
                            { top: "65%", left: "20%", size: 7, delay: "1s" },
                            { top: "75%", left: "70%", size: 5, delay: "1.5s" },
                            { top: "45%", left: "50%", size: 10, delay: "2s" },
                            { top: "15%", left: "60%", size: 6, delay: "0.8s" },
                            { top: "80%", left: "40%", size: 7, delay: "1.2s" },
                        ].map((dot, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full bg-purple-500/30 backdrop-blur-sm border border-purple-400/40"
                                style={{
                                    top: dot.top,
                                    left: dot.left,
                                    width: `${dot.size}px`,
                                    height: `${dot.size}px`,
                                    animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
                                    animationDelay: dot.delay
                                }}
                            />
                        ))}
                    </div>

                    {/* Central Glowing Spark Symbol Accent */}
                    <div className="relative z-10 w-16 h-16 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="spark-cta-clean" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#spark-cta-clean)" />
                        </svg>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 35s linear infinite;
                }
            `}</style>
        </section>
    );
}
