"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, EnvelopeSimple, MapPin, CaretRight, ArrowUp, FacebookLogo, XLogo, InstagramLogo, DribbbleLogo, YoutubeLogo } from "@phosphor-icons/react";
import SindhanAiLogo from "@/components/SindhanAiLogo";

export default function Footer() {
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <footer className="w-full bg-white border-t border-slate-200 relative overflow-hidden" style={{ minHeight: "70vh" }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-20 pb-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-14 pb-14 border-b border-slate-200">
                    <div className="md:col-span-4 space-y-5">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
                            >
                                <SindhanAiLogo className="h-8 sm:h-9" />
                            </Link>
                        </div>

                        <p className="text-base text-slate-600 font-normal leading-relaxed max-w-xs">
                            Applied AI and Technology Lab bridging industry expertise, academic excellence, and modern software development.
                        </p>

                        <div className="space-y-2.5">
                            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block">Certifications</span>
                            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="w-9 h-9 rounded-lg bg-red-600 flex flex-col items-center justify-center leading-none p-1">
                                    <span className="text-[6px] font-black text-white uppercase leading-tight text-center">Great Place To Work</span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">Great Place To Work</div>
                                    <div className="text-[10px] text-slate-500 font-medium">Certified</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-3 space-y-4">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Services</h4>
                        <ul className="space-y-2.5">
                            {[
                                { name: "AI & Technology", href: "/services/ai-technology" },
                                { name: "Software Solutions", href: "/services/software-solutions" },
                                { name: "Training & Up-Skilling", href: "/services/training" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="flex items-center gap-1.5 text-base font-semibold text-slate-700 hover:text-slate-950 transition-colors group">
                                        <span>{item.name}</span>
                                        <CaretRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Menu</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: "Home", href: "/", isUnlinked: false },
                                { label: "About", href: "/about", isUnlinked: false },
                                { label: "Services", href: "/services", isUnlinked: false },
                                { label: "Team", href: "/team", isUnlinked: false },
                                { label: "Contact", href: "", isUnlinked: true }
                            ].map((item) => (
                                <li key={item.label}>
                                    {item.isUnlinked ? (
                                        <span className="flex items-center gap-1.5 text-base font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer">
                                            <span>{item.label}</span>
                                        </span>
                                    ) : (
                                        <Link href={item.href} className="flex items-center gap-1.5 text-base font-semibold text-slate-700 hover:text-slate-950 transition-colors group">
                                            <span>{item.label}</span>
                                            <CaretRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-3 space-y-5">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Get in Touch</h4>

                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-base text-slate-700 font-medium">
                                <Clock className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" weight="bold" />
                                <span>Open 8am to 6pm, Monday to Friday</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-base text-slate-700 font-medium">
                                <EnvelopeSimple className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" weight="bold" />
                                <a href="mailto:sindhanai@kgisl.ac.in" className="hover:text-slate-950 transition-colors">
                                    Contact us at sindhanai@kgisl.ac.in
                                </a>
                            </li>
                            <li className="flex items-start gap-2.5 text-base text-slate-700 font-medium">
                                <MapPin className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" weight="bold" />
                                <span>KGISL SOI, Saravanampatti, Coimbatore</span>
                            </li>
                        </ul>

                        <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-slate-100 border border-slate-200">
                            {[FacebookLogo, XLogo, InstagramLogo, DribbbleLogo, YoutubeLogo].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-150 shadow-sm">
                                    <Icon className="w-4 h-4" weight="bold" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-5 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <EnvelopeSimple className="w-4 h-4" />
                        <a href="mailto:sindhanai@kgisl.ac.in" className="hover:text-slate-900 transition-colors">sindhanai@kgisl.ac.in</a>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
                        <span className="select-none text-slate-400">Get in Touch</span>
                        <span>SindhanAI © All rights reserved</span>
                    </div>
                </div>
            </div>

            <div
                className="absolute bottom-0 right-0 pointer-events-none select-none z-0 overflow-hidden leading-none"
                aria-hidden="true"
            >
                <span
                    className="block font-black text-slate-200 text-[130px] sm:text-[180px] lg:text-[220px] tracking-tighter translate-y-8 translate-x-6"
                    style={{ fontFamily: "var(--font-heading), 'Plus Jakarta Sans', sans-serif" }}
                >
                    SindhanAI.
                </span>
            </div>

            {showTop && (
                <button
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    className="fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-800 hover:bg-slate-900 hover:text-white transition-all duration-200"
                >
                    <ArrowUp className="w-5 h-5" weight="bold" />
                </button>
            )}
        </footer>
    );
}
