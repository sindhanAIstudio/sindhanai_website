"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Handshake, ArrowUpRight, CheckCircle, Buildings } from "@phosphor-icons/react";

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

export default function AboutClientsSection() {
    const clients = [
        {
            name: "Struzon Technology",
            tagline: "Global Structural Steel Detailing & Engineering",
            logo: "/images/clients/struzon-logo.webp",
            website: "https://www.struzon.com/",
            description: "Partnering with Struzon to engineer intelligent automation and domain-driven technology solutions.",
            category: "Engineering Partner",
            width: 180,
            height: 60,
        },
        {
            name: "Pinesphere",
            tagline: "Innovative Software & Enterprise Technology Solutions",
            logo: "/images/clients/pinesphere-logo.png",
            website: "https://pinesphere.com/",
            description: "Collaborating on advanced AI integration, cloud workflows, and custom digital transformation projects.",
            category: "Technology Partner",
            width: 180,
            height: 60,
        },
    ];

    return (
        <section className="w-full bg-white py-20 sm:py-28 border-t border-slate-200/60">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="max-w-[800px] mb-14 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
                        <Handshake className="w-4 h-4 text-slate-700" weight="bold" />
                        Our Clients & Industry Partners
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                        Collaborating directly with industry clients to build practical AI solutions and deliver real-world production projects.
                    </p>
                </div>

                {/* Vertical 9:16 Instagram Reel Ratio Cards Grid */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-8 items-stretch">
                    {clients.map((client, idx) => (
                        <AnimatedCard key={idx} className="w-full sm:w-[340px] lg:w-[360px]">
                            {/* Reel 9:16 Aspect Ratio Container */}
                            <div className="relative aspect-[9/16] w-full bg-[#f8fafc] rounded-[28px] p-7 sm:p-8 border border-slate-200 flex flex-col justify-between overflow-hidden shadow-none hover:border-slate-400 transition-all duration-300 group">

                                {/* Background Decorative Tech Dot Grid */}
                                <div
                                    className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none"
                                    style={{
                                        backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`,
                                        backgroundSize: `16px 16px`
                                    }}
                                />

                                {/* Background Watermark */}
                                <div className="absolute -bottom-8 -right-8 text-slate-900/5 group-hover:text-slate-900/10 transition-colors pointer-events-none">
                                    <Buildings className="w-56 h-56" weight="duotone" />
                                </div>

                                {/* Top Row: Category Tag */}
                                <div className="relative z-10 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-[6px] border border-slate-200/80 shadow-2xs">
                                        {client.category}
                                    </span>
                                    <a
                                        href={client.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors shadow-2xs"
                                        title={`Visit ${client.name}`}
                                    >
                                        <ArrowUpRight className="w-4 h-4" weight="bold" />
                                    </a>
                                </div>

                                {/* Middle Section: Centered Logo & Details */}
                                <div className="relative z-10 my-auto space-y-6 text-center">
                                    {/* White Logo Container Box */}
                                    <div className="mx-auto w-48 h-24 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300">
                                        <Image
                                            src={client.logo}
                                            alt={client.name}
                                            width={client.width}
                                            height={client.height}
                                            className="max-h-12 w-auto object-contain"
                                        />
                                    </div>

                                    {/* Name, Tagline & Description */}
                                    <div className="space-y-3 px-2">
                                        <h3 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                                            {client.name}
                                        </h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-snug">
                                            {client.tagline}
                                        </p>
                                        <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed pt-2">
                                            {client.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Accent Row: Active Partner Checkmark */}
                                <div className="relative z-10 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
                                    <span>Active Industry Partner</span>
                                </div>

                            </div>
                        </AnimatedCard>
                    ))}
                </div>

            </div>
        </section>
    );
}
