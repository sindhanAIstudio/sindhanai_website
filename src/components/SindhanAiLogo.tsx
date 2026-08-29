import React from "react";
import { Sparkle } from "@phosphor-icons/react";

interface SindhanAiLogoProps {
    className?: string;
    lightMode?: boolean;
}

export default function SindhanAiLogo({ className = "h-7", lightMode = false }: SindhanAiLogoProps) {
    return (
        <div className={`inline-flex items-center cursor-pointer select-none group ${className}`}>
            <span
                className={`font-black text-2xl sm:text-[28px] tracking-tight leading-none transition-colors ${lightMode
                    ? "text-white"
                    : "bg-gradient-to-r from-[#03072E] via-[#080D42] to-[#0A1148] bg-clip-text text-transparent"
                    }`}
                style={{ fontFamily: "var(--font-heading), 'Plus Jakarta Sans', sans-serif" }}
            >
                Sindhan
            </span>
            <div className="relative inline-flex items-center">
                <span
                    className="font-black text-2xl sm:text-[28px] tracking-tight leading-none bg-gradient-to-r from-[#0052FF] via-[#3B82F6] to-[#9033FF] bg-clip-text text-transparent"
                    style={{ fontFamily: "var(--font-heading), 'Plus Jakarta Sans', sans-serif" }}
                >
                    AI
                </span>
                <Sparkle
                    className="w-3.5 h-3.5 text-indigo-500 shrink-0 -mt-3 -ml-0.5 opacity-90 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300"
                    weight="fill"
                />
            </div>
        </div>
    );
}
