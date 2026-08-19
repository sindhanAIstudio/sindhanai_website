"use client";

import React, { useState } from "react";
import {
    FirstAid,
    Bank,
    Factory,
    ShoppingBag,
    GraduationCap,
    Truck,
    Buildings,
    Briefcase,
    Cpu,
} from "@phosphor-icons/react";

// User's provided background images looped across items
const bgImages = [
    "/images/marquee-2.jpg",
    "/images/gradient-bg-1.jpg",
    "/images/marquee-1.jpg",
];

const tickerItems = [
    {
        title: "Healthcare & MedTech",
        icon: FirstAid,
        bgImage: bgImages[0],
        iconColor: "#FF6B6B",
    },
    {
        title: "AI & Generative AI Labs",
        icon: Cpu,
        bgImage: bgImages[1],
        iconColor: "#0693E3",
    },
    {
        title: "Finance & Banking",
        icon: Bank,
        bgImage: bgImages[2],
        iconColor: "#FCB900",
    },
    {
        title: "Manufacturing & Robotics",
        icon: Factory,
        bgImage: bgImages[0],
        iconColor: "#00D084",
    },
    {
        title: "Retail & E-Commerce",
        icon: ShoppingBag,
        bgImage: bgImages[1],
        iconColor: "#FF416C",
    },
    {
        title: "Education & Research",
        icon: GraduationCap,
        bgImage: bgImages[2],
        iconColor: "#8ED1FC",
    },
    {
        title: "Logistics & Supply Chain",
        icon: Truck,
        bgImage: bgImages[0],
        iconColor: "#9B51E0",
    },
    {
        title: "Real Estate & PropTech",
        icon: Buildings,
        bgImage: bgImages[1],
        iconColor: "#CF2E2E",
    },
    {
        title: "Government & Enterprise",
        icon: Briefcase,
        bgImage: bgImages[2],
        iconColor: "#10B981",
    },
];

export default function IndustryTicker() {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    return (
        <section className="w-full bg-white py-6 lg:py-8 overflow-hidden border-b border-slate-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">

                    {/* Left: Static Title Label (Top pill badge removed) */}
                    <div className="shrink-0 lg:pr-8 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-3 lg:pb-0 text-center lg:text-left">
                        <p
                            className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap"
                            style={{ fontFamily: "'Manrope', 'Google Sans', sans-serif" }}
                        >
                            Industries We Work With
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Applied AI & Software Transformation</p>
                    </div>

                    {/* Right: Continuous Scrolling Ticker (Edge overlays removed for 100% word visibility) */}
                    <div className="relative flex-1 overflow-hidden w-full">
                        {/* Ticker strip */}
                        <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap py-2">
                            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => {
                                const Icon = item.icon;
                                const isHovered = hoveredIdx === idx;

                                return (
                                    <div
                                        key={`${item.title}-${idx}`}
                                        className="group shrink-0 flex items-center gap-8 sm:gap-12 cursor-pointer select-none"
                                        onMouseEnter={() => setHoveredIdx(idx)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                    >
                                        {/* High-Contrast Gradient Gray by default -> Vibrant Background Image on Hover */}
                                        <h2
                                            className="text-3xl sm:text-4xl lg:text-[25px] font-extrabold tracking-tight shrink-0 py-1 transition-all duration-300 ease-out"
                                            style={{
                                                fontFamily: "'Manrope', 'Google Sans', sans-serif",
                                                backgroundImage: isHovered
                                                    ? `url('${item.bgImage}')`
                                                    : "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                                color: "transparent",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                transform: isHovered ? "scale(1.05)" : "scale(1)",
                                            }}
                                        >
                                            {item.title}
                                        </h2>

                                        {/* Interspersed Industry Icon: Dark Slate by default -> Full Color Accent on Hover */}
                                        <div
                                            className="shrink-0 flex items-center justify-center transition-all duration-300 ease-out"
                                            style={{
                                                transform: isHovered ? "scale(1.15) rotate(6deg)" : "scale(1)",
                                            }}
                                        >
                                            <Icon
                                                className="w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-300"
                                                style={{ color: isHovered ? item.iconColor : "#475569" }}
                                                weight="duotone"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
