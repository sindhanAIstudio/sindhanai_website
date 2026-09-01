"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SindhanAiLogo from "@/components/SindhanAiLogo";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`w-full sticky top-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/90 backdrop-blur-md border-b border-slate-100/80 shadow-xs py-3"
                    : "bg-transparent border-transparent py-4"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
                    <SindhanAiLogo className="h-7 sm:h-8" />
                </Link>
            </div>
        </header>
    );
}
