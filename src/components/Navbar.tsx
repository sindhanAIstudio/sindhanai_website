"use client";

import { useState, useEffect } from "react";
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
    Star,
    CheckCircle,
} from "@phosphor-icons/react";

export default function Navbar() {
    const pathname = usePathname();
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState<"ai-technology" | "training" | "software-solutions">("ai-technology");

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) {
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
        { name: "Services", href: "/services", isMega: true },
        { name: "About", href: "/about" },
        { name: "News & Events", href: "#" },
        { name: "Team", href: "#" },
        { name: "Contact", href: "#" },
    ];

    // Mega menu interactive content definitions matching SindhanAI design
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
        <div className={`w-full z-50 transition-all duration-300 ${isScrolled ? "fixed top-0 left-0 right-0 pointer-events-none" : isHomePage ? "relative bg-white" : "absolute top-0 left-0 right-0 bg-transparent pointer-events-auto"}`}>

            {/* 1. Top Header Bar (SindhanAI Style) */}
            <div className={`hidden md:flex items-center justify-between max-w-[1360px] mx-auto py-2 px-4 sm:px-6 lg:px-8 text-[14px] text-slate-800 font-semibold border-b transition-all duration-300 ${isScrolled ? "opacity-0 -translate-y-full max-h-0 py-0 overflow-hidden border-transparent pointer-events-none" : isHomePage ? "opacity-100 translate-y-0 max-h-12 border-slate-100/60 bg-white pointer-events-auto" : "opacity-100 translate-y-0 max-h-12 border-slate-900/10 bg-transparent pointer-events-auto"}`}>
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

            {/* 2. Main Floating Sticky Navbar */}
            <div className={`w-full transition-all duration-300 ease-in-out pointer-events-auto ${isScrolled ? "fixed top-3 left-0 right-0 px-4 sm:px-6 z-50" : isHomePage ? "relative bg-white px-4 sm:px-6 lg:px-8" : "relative bg-transparent px-4 sm:px-6 lg:px-8"}`}>
                <header
                    className={`max-w-[1360px] mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${isScrolled
                        ? "bg-white/85 backdrop-saturate-[1.8] backdrop-blur-[20px] border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-[16px] px-6 h-[65px]"
                        : isHomePage
                            ? "border border-transparent py-3.5 bg-white"
                            : "border border-transparent py-3.5 bg-transparent"
                        }`}
                >

                    {/* Left Group: Capital Text Logo + Vertical Separator + Left-Aligned Nav Menu */}
                    <div className="flex items-center gap-4">

                        <Link
                            href="/"
                            className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
                        >
                            <img
                                src="/sindhanai-logo.png"
                                alt="SindhanAI"
                                className="w-auto h-5 sm:h-6 md:h-7 object-contain"
                            />
                        </Link>

                        {/* Vertical Separator Line */}
                        <span className="w-px h-6 bg-slate-300 mx-1 hidden md:inline-block"></span>

                        {/* Left-Aligned Nav Items */}
                        <nav className="hidden md:flex items-center gap-1.5">
                            {navLinks.map((link) => {
                                if (link.isMega) {
                                    const isMegaActive = pathname.startsWith("/services") || megaMenuOpen;
                                    return (
                                        <div
                                            key={link.name}
                                            className="relative"
                                            onMouseEnter={() => setMegaMenuOpen(true)}
                                            onMouseLeave={() => setMegaMenuOpen(false)}
                                        >
                                            <button
                                                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                                                style={{
                                                    backgroundColor: isMegaActive ? "#0000001a" : undefined,
                                                    paddingBlock: "calc(var(--spacing) * 2.5)",
                                                }}
                                                className={`px-4 rounded-xl text-[15px] font-semibold transition-all flex items-center gap-1 ${isMegaActive
                                                    ? "text-slate-950"
                                                    : "text-slate-800 hover:text-slate-950 hover:bg-[#0000000d]"
                                                    }`}
                                            >
                                                {link.name}
                                                <CaretDown className={`w-4 h-4 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} weight="bold" />
                                            </button>

                                            {/* SindhanAI AI Agency 30/70 Mega Menu Dropdown */}
                                            {megaMenuOpen && (
                                                <div className="absolute top-full left-0 w-[840px] pt-3 z-50">
                                                    <div className="rounded-[28px] p-6 border border-slate-200/80 shadow-2xl bg-[#FAF8F5] grid grid-cols-12 gap-6">

                                                        {/* Left Col (30% -> 4/12): Explore Sidebar List */}
                                                        <div className="col-span-4 flex flex-col justify-between space-y-4">
                                                            <div>
                                                                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider block mb-3 pl-1">
                                                                    Explore
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
                                                                                {/* Neutral Gray Icon Outer Container — SindhanAI style */}
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

                                                        {/* Right Col (70% -> 8/12): Rainbow Border Preview Card */}
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

                                                                    {/* Non-clickable Sub-Items Grid */}
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

                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        style={{
                                            backgroundColor: isActive ? "#0000001a" : undefined,
                                            paddingBlock: "calc(var(--spacing) * 2.5)",
                                        }}
                                        className={`px-4 rounded-xl text-[15px] font-semibold transition-all ${isActive
                                            ? "text-slate-950"
                                            : "text-slate-800 hover:text-slate-950 hover:bg-[#0000000d]"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right: Lang, Search & Get in Touch CTA */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/contact"
                            className="hidden sm:inline-flex bg-black hover:bg-slate-900 text-white font-bold text-[14px] px-5 py-2.5 rounded-xl transition-all items-center gap-2 shadow-xs"
                        >
                            Get in Touch <ChatTeardropText className="w-4 h-4 fill-white" />
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
                        </button>
                    </div>

                </header>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-2">
                        <Link
                            href="/contact"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block w-full py-3 text-center text-xs font-bold text-white rounded-xl bg-black"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
