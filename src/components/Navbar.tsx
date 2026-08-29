"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CaretDown,
    List,
    X,
    ChatTeardropText,
    MapPin,
    PhoneCall,
    FacebookLogo,
    TwitterLogo,
    InstagramLogo,
    Cpu,
    GraduationCap,
    Code,
    ArrowRight,
    CheckCircle,
} from "@phosphor-icons/react";
import SindhanAiLogo from "@/components/SindhanAiLogo";

export default function Navbar() {
    const pathname = usePathname();
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState<"ai-technology" | "training" | "software-solutions">("ai-technology");
    const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMegaMouseEnter = () => {
        if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
        setMegaMenuOpen(true);
    };

    const handleMegaMouseLeave = () => {
        megaTimeoutRef.current = setTimeout(() => {
            setMegaMenuOpen(false);
        }, 250);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Services", href: "/services", isMega: true },
        { name: "News & Events", href: "", isUnlinked: true },
        {
            name: "Teams",
            href: "/team",
            hasDropdown: true,
            dropdownItems: [
                { name: "Industry Experts", href: "", isUnlinked: true },
                { name: "Scope", href: "/team" },
            ],
        },
        { name: "Contact", href: "", isUnlinked: true },
    ];

    const megaMenuData = {
        "ai-technology": {
            title: "AI and Technology",
            subtitle: "Enterprise GenAI & ML Solutions",
            icon: Cpu,
            href: "/services/ai-technology",
            statNumber: "99.9%",
            statLabel: "Uptime SLA",
            heading: "Move Faster With AI.",
            subheading: "Build Once. Scale Infinitely.",
            buttonText: "Explore Solutions",
            subItems: [
                "AI/ML Development",
                "Computer Vision",
                "NLP",
                "Data Analytics",
                "LLM Applications",
                "RAG Applications",
                "AI Chatbots and Agents",
                "Prompt Engineering",
            ],
        },
        training: {
            title: "Training",
            subtitle: "Faculty, Student & Industry Upskilling",
            icon: GraduationCap,
            href: "/services/training",
            statNumber: "100+",
            statLabel: "Institutions Upskilled",
            heading: "Industry-Aligned Learning.",
            subheading: "Empowering Faculty & Students.",
            buttonText: "Explore Training",
            subItems: [
                "Faculty Upskilling",
                "Student Training",
                "Industry-Aligned Learning",
                "Workshops",
                "Mentoring",
                "Institutional Support",
                "Industry Collaboration",
            ],
        },
        "software-solutions": {
            title: "Software Solutions",
            subtitle: "Web, E-Commerce, CRM & Cloud",
            icon: Code,
            href: "/services/software-solutions",
            statNumber: "50+",
            statLabel: "Deployments Live",
            heading: "Scalable Enterprise Apps.",
            subheading: "Custom CRM, ERP & Cloud Systems.",
            buttonText: "Explore Solutions",
            subItems: [
                "Website Development",
                "E-Commerce",
                "Custom CRM and ERP",
                "DevOps and Cloud",
            ],
        },
    };

    const currentData = megaMenuData[activeCategory];
    const isHomePage = pathname === "/";

    return (
        <div className={`w-full z-50 transition-all duration-300 ${isScrolled ? "fixed top-0 left-0 right-0 pointer-events-none" : isHomePage ? "md:relative md:bg-white absolute top-0 left-0 right-0 bg-transparent pointer-events-auto" : "absolute top-0 left-0 right-0 bg-transparent pointer-events-auto"}`}>

            {/* 1. Desktop Top Bar */}
            <div className={`hidden md:flex items-center justify-between max-w-[1360px] mx-auto py-2 px-0 text-[14px] text-slate-800 font-semibold border-b transition-all duration-300 ${isScrolled ? "opacity-0 -translate-y-full max-h-0 py-0 overflow-hidden border-transparent pointer-events-none" : isHomePage ? "opacity-100 translate-y-0 max-h-12 border-slate-100/60 bg-white pointer-events-auto" : "opacity-100 translate-y-0 max-h-12 border-slate-900/10 bg-transparent pointer-events-auto"}`}>
                <div className="flex items-center gap-3">
                    <span className="text-slate-700 font-semibold text-[14px]">Follow us on</span>
                    <div className="flex items-center gap-3 text-slate-900">
                        <FacebookLogo className="w-[18px] h-[18px] hover:text-indigo-600 transition-colors cursor-pointer" weight="bold" />
                        <TwitterLogo className="w-[18px] h-[18px] hover:text-indigo-600 transition-colors cursor-pointer" weight="bold" />
                        <InstagramLogo className="w-[18px] h-[18px] hover:text-indigo-600 transition-colors cursor-pointer" weight="bold" />
                    </div>
                </div>
                <div className="flex items-center gap-6 text-slate-900 font-semibold text-[14px]">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
                        <MapPin className="w-[18px] h-[18px] text-slate-600" weight="bold" /> KGISL Campus, Coimbatore, TN
                    </span>
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
                        <PhoneCall className="w-[18px] h-[18px] text-slate-600" weight="bold" /> Schedule A Call
                    </span>
                </div>
            </div>

            {/* 2. Main Sticky Navbar Bar (White Glossy Rounded Floating Container on Mobile) */}
            <div className={`w-full transition-all duration-300 ease-in-out pointer-events-auto ${isScrolled ? "fixed top-3 left-0 right-0 px-4 sm:px-6 z-50" : "relative bg-transparent px-4 sm:px-6 lg:px-8 py-3"}`}>
                <header
                    className={`max-w-[1360px] mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${isScrolled
                        ? "bg-white/85 backdrop-saturate-[1.8] backdrop-blur-[20px] border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-[20px] px-5 sm:px-6 h-[62px]"
                        : "bg-white/95 md:bg-transparent backdrop-saturate-[1.8] md:backdrop-blur-none backdrop-blur-[20px] border border-slate-200/50 md:border-transparent shadow-md md:shadow-none rounded-[22px] md:rounded-none px-5 md:px-0 h-[60px] md:h-auto"
                        }`}
                >

                    {/* Left: Brand Logo + Nav Menu */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
                            <SindhanAiLogo className="h-6 sm:h-7" />
                        </Link>

                        <span className="w-px h-6 bg-slate-300 mx-1 hidden md:inline-block"></span>

                        {/* Desktop Nav Items */}
                        <nav className="hidden md:flex items-center gap-1.5">
                            {navLinks.map((link) => {
                                if (link.isMega) {
                                    return (
                                        <div
                                            key={link.name}
                                            className="relative"
                                            onMouseEnter={handleMegaMouseEnter}
                                            onMouseLeave={handleMegaMouseLeave}
                                        >
                                            <button
                                                onClick={() => {
                                                    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
                                                    setMegaMenuOpen(!megaMenuOpen);
                                                }}
                                                className={`px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-all flex items-center gap-1 ${megaMenuOpen
                                                    ? "text-slate-950 bg-black/5"
                                                    : "text-slate-800 hover:text-slate-950 hover:bg-black/5"
                                                    }`}
                                            >
                                                {link.name}
                                                <CaretDown className={`w-4 h-4 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} weight="bold" />
                                            </button>

                                            {megaMenuOpen && (
                                                <div
                                                    onMouseEnter={handleMegaMouseEnter}
                                                    onMouseLeave={handleMegaMouseLeave}
                                                    className="absolute top-full left-0 w-[840px] pt-3 z-50"
                                                >
                                                    <div className="rounded-[28px] p-6 border border-slate-200/80 shadow-2xl bg-[#FAF8F5] grid grid-cols-12 gap-6">

                                                        <div className="col-span-4 flex flex-col justify-between space-y-4">
                                                            <div>
                                                                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider block mb-3 pl-1">
                                                                    Explore Services
                                                                </span>

                                                                <div className="space-y-1.5">
                                                                    {(["ai-technology", "training", "software-solutions"] as const).map((key) => {
                                                                        const item = megaMenuData[key];
                                                                        const CategoryIcon = item.icon;
                                                                        const isActive = activeCategory === key;

                                                                        return (
                                                                            <Link
                                                                                key={key}
                                                                                href={item.href}
                                                                                onClick={() => setMegaMenuOpen(false)}
                                                                                onMouseEnter={() => setActiveCategory(key)}
                                                                                className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${isActive
                                                                                    ? "bg-[#ECE8E1] text-slate-950 shadow-xs border border-slate-300/40"
                                                                                    : "text-slate-700 hover:bg-[#F2EFE9]"
                                                                                    }`}
                                                                            >
                                                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-white text-slate-950 shadow-2xs" : "bg-slate-200/70 text-slate-700"}`}>
                                                                                    <CategoryIcon className="w-4 h-4" weight="bold" />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-sm font-bold text-slate-950 leading-tight">
                                                                                        {item.title}
                                                                                    </div>
                                                                                    <div className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                                                                                        {item.subtitle}
                                                                                    </div>
                                                                                </div>
                                                                            </Link>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-8">
                                                            <div className="p-[2.5px] rounded-[24px] bg-gradient-to-tr from-amber-400 via-pink-400 to-indigo-500 shadow-lg h-full">
                                                                <div className="bg-white rounded-[22px] p-7 h-full flex flex-col justify-between space-y-5">

                                                                    <div className="space-y-1">
                                                                        <div className="text-4xl font-extrabold text-slate-950 tracking-tight">
                                                                            {currentData.statNumber}
                                                                        </div>
                                                                        <div className="text-sm font-bold text-slate-800">
                                                                            {currentData.statLabel}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <div className="text-xl font-extrabold text-slate-950 leading-tight">
                                                                            {currentData.heading}
                                                                        </div>
                                                                        <div className="text-sm font-semibold text-slate-500 leading-snug">
                                                                            {currentData.subheading}
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-2 my-1">
                                                                        {currentData.subItems.map((subItem) => (
                                                                            <div
                                                                                key={subItem}
                                                                                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100/90 cursor-default"
                                                                            >
                                                                                <CheckCircle className="w-3.5 h-3.5 text-slate-700 shrink-0" weight="fill" />
                                                                                <span className="text-xs font-bold text-slate-800 leading-snug">
                                                                                    {subItem}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="pt-3">
                                                                        <Link
                                                                            href={currentData.href}
                                                                            onClick={() => setMegaMenuOpen(false)}
                                                                            className="bg-[#ECE9E3] hover:bg-[#DFDCD5] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 transition-colors shadow-2xs"
                                                                        >
                                                                            {currentData.buttonText} <ArrowRight className="w-3.5 h-3.5" />
                                                                        </Link>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                if (link.isUnlinked) {
                                    return (
                                        <span
                                            key={link.name}
                                            className="px-4 py-2.5 rounded-xl text-[15px] font-semibold text-slate-800 hover:text-slate-950 cursor-pointer transition-all"
                                        >
                                            {link.name}
                                        </span>
                                    );
                                }

                                if (link.hasDropdown) {
                                    return (
                                        <div key={link.name} className="relative group/team">
                                            <Link
                                                href={link.href}
                                                className={`px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-all flex items-center gap-1.5 ${pathname === link.href
                                                    ? "text-slate-950 bg-black/10 font-bold"
                                                    : "text-slate-800 hover:text-slate-950 hover:bg-black/5"
                                                    }`}
                                            >
                                                {link.name}
                                                <CaretDown className="w-3.5 h-3.5 text-slate-600 group-hover/team:rotate-180 transition-transform" weight="bold" />
                                            </Link>
                                            <div className="absolute top-full left-0 pt-2 w-56 hidden group-hover/team:block z-50">
                                                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl rounded-2xl p-2 space-y-1">
                                                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 select-none cursor-default">
                                                        Industry Experts
                                                    </div>
                                                    <Link
                                                        href="/team"
                                                        className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors"
                                                    >
                                                        Scope
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-all ${pathname === link.href
                                            ? "text-slate-950 bg-black/10 font-bold"
                                            : "text-slate-800 hover:text-slate-950 hover:bg-black/5"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right CTA */}
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex bg-black text-white font-bold text-[14px] px-5 py-2.5 rounded-xl items-center gap-2 shadow-xs cursor-default">
                            Get in Touch <ChatTeardropText className="w-4 h-4 fill-white" />
                        </span>

                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Menu"
                            className="md:hidden p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
                        </button>
                    </div>

                </header>
            </div>

            {/* Mobile Drawer (Clean Glassmorphism Floating Overlay) */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-x-4 top-20 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-3xl p-6 space-y-4 pointer-events-auto max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <SindhanAiLogo className="h-6" />
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        {navLinks.map((link) => {
                            if (link.isMega) {
                                return (
                                    <div key={link.name} className="space-y-2">
                                        <button
                                            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-bold text-slate-900 bg-slate-50 hover:bg-slate-100"
                                        >
                                            <span>Services</span>
                                            <CaretDown className={`w-4 h-4 text-slate-600 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} weight="bold" />
                                        </button>

                                        {mobileServicesOpen && (
                                            <div className="pl-3 pr-1 space-y-1.5 py-1">
                                                <Link
                                                    href="/services/ai-technology"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors"
                                                >
                                                    <Cpu className="w-4.5 h-4.5 text-slate-700 shrink-0" weight="bold" />
                                                    <div>
                                                        <div className="text-slate-950 font-bold">AI & Technology</div>
                                                        <div className="text-[11px] text-slate-500 font-medium">GenAI, ML & RAG Applications</div>
                                                    </div>
                                                </Link>

                                                <Link
                                                    href="/services/training"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors"
                                                >
                                                    <GraduationCap className="w-4.5 h-4.5 text-slate-700 shrink-0" weight="bold" />
                                                    <div>
                                                        <div className="text-slate-950 font-bold">Training & Upskilling</div>
                                                        <div className="text-[11px] text-slate-500 font-medium">Faculty & Student Training</div>
                                                    </div>
                                                </Link>

                                                <Link
                                                    href="/services/software-solutions"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors"
                                                >
                                                    <Code className="w-4.5 h-4.5 text-slate-700 shrink-0" weight="bold" />
                                                    <div>
                                                        <div className="text-slate-950 font-bold">Software Solutions</div>
                                                        <div className="text-[11px] text-slate-500 font-medium">Web, E-Commerce, CRM & Cloud</div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (link.hasDropdown) {
                                return (
                                    <div key={link.name} className="space-y-1">
                                        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                                            {link.name}
                                        </div>
                                        <div className="pl-3 pr-1 space-y-1">
                                            <div className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed">
                                                Industry Experts (Upcoming)
                                            </div>
                                            <Link
                                                href="/team"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block px-4 py-2.5 rounded-xl text-base font-bold text-slate-900 bg-slate-50 border border-slate-200/70 hover:bg-slate-100 transition-colors"
                                            >
                                                SCOPE Team
                                            </Link>
                                        </div>
                                    </div>
                                );
                            }

                            if (link.isUnlinked) {
                                return (
                                    <div
                                        key={link.name}
                                        className="px-4 py-3 rounded-2xl text-base font-bold text-slate-900 hover:bg-slate-50 cursor-pointer"
                                    >
                                        {link.name}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-2xl text-base font-bold text-slate-900 hover:bg-slate-50"
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="pt-2">
                        <span className="block w-full py-3.5 text-center text-sm font-bold text-white rounded-2xl bg-black shadow-md cursor-default">
                            Get in Touch
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
