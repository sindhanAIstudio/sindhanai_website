"use client";

import React from "react";
import {
    FirstAid,
    Bank,
    Factory,
    ShoppingBag,
    GraduationCap,
    Truck,
    Buildings,
    Briefcase,
} from "@phosphor-icons/react";

const industries = [
    { name: "Healthcare & MedTech", icon: FirstAid, color: "text-rose-400" },
    { name: "Finance & Banking", icon: Bank, color: "text-amber-400" },
    { name: "Manufacturing & Robotics", icon: Factory, color: "text-indigo-400" },
    { name: "Retail & E-Commerce", icon: ShoppingBag, color: "text-emerald-400" },
    { name: "Education & Research", icon: GraduationCap, color: "text-sky-400" },
    { name: "Logistics & Supply Chain", icon: Truck, color: "text-purple-400" },
    { name: "Real Estate & PropTech", icon: Buildings, color: "text-pink-400" },
    { name: "Government & Public Sector", icon: Briefcase, color: "text-teal-400" },
];

export default function IndustryTicker() {
    return (
        <section className="w-full bg-white py-7 overflow-hidden">
            <div className="max-w-[1360px] mx-auto ">
                <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-8">

                    {/* Left: Static "Industries We Work With" Title Label — template font hierarchy */}
                    <div className="shrink-0 pr-0 md:pr-8 border-b md:border-b-0 md:border-r border-slate-200/80 pb-3 md:pb-0 text-center md:text-left">
                        <p
                            className="text-lg lg:text-xl font-bold text-slate-950 tracking-tight whitespace-nowrap"
                            style={{ fontFamily: "'Manrope', 'Google Sans', sans-serif" }}
                        >
                            Industries We Work With
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Applied AI Solutions across domains</p>
                    </div>

                    {/* Right: Continuous Scrolling Ticker with Template Rounded-Corner Cards */}
                    <div className="relative flex-1 overflow-hidden w-full">
                        {/* Left & Right subtle gradient fade overlays */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />

                        {/* Ticker strip — tripled for seamless endless loop */}
                        <div className="flex items-center gap-3.5 animate-marquee whitespace-nowrap py-1">
                            {[...industries, ...industries, ...industries].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={`${item.name}-${idx}`}
                                        className="inline-flex items-center gap-3 shrink-0 bg-[#222120] text-white font-semibold text-sm lg:text-[15px] px-5 py-2.5 rounded-[14px] shadow-none border border-white/10 transition-transform duration-200 hover:scale-[1.02] cursor-default"
                                        style={{ fontFamily: "'Manrope', 'Google Sans', sans-serif" }}
                                    >
                                        <Icon
                                            className={`w-4 h-4 ${item.color}`}
                                            weight="bold"
                                        />
                                        <span className="tracking-wide text-white/95 font-semibold">
                                            {item.name}
                                        </span>
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
