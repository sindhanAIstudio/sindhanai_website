"use client";

import { useState, useEffect, useRef } from "react";
import {
    GraduationCap,
    ArrowRight,
    X,
    PlayCircle,
    FileText,
    EnvelopeSimple,
    PhoneCall,
    LinkedinLogo,
    GithubLogo,
    TwitterLogo,
    Code,
    Article,
    SlackLogo,
    Database,
    Brain,
    CaretLeft,
    CaretRight,
    CheckCircle,
    MagnifyingGlass,
    Funnel,
    Crown,
    Star,
    Lightning,
    Sparkle,
} from "@phosphor-icons/react";
import { TeamMember } from "@/data/teamData";
import MeshGradientCanvas from "@/components/MeshGradientCanvas";
import CTASection from "@/components/CTASection";

interface TeamClientViewProps {
    initialMembers: TeamMember[];
}

export default function TeamClientView({ initialMembers }: TeamClientViewProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Horizontal Slider State for Leadership Section
    const [activeSlide, setActiveSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const stickySectionRef = useRef<HTMLDivElement>(null);

    const scrollToSlide = (index: number) => {
        setActiveSlide(index);
    };

    // Mouse & Touch Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        const diff = e.clientX - startX;
        if (diff < -40) {
            setActiveSlide((prev) => Math.min(2, prev + 1));
        } else if (diff > 40) {
            setActiveSlide((prev) => Math.max(0, prev - 1));
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        const diff = e.changedTouches[0].clientX - startX;
        if (diff < -40) {
            setActiveSlide((prev) => Math.min(2, prev + 1));
        } else if (diff > 40) {
            setActiveSlide((prev) => Math.max(0, prev - 1));
        }
    };

    // Scroll-Driven Pinned Horizontal Progression (Auto-slides when user scrolls vertically)
    useEffect(() => {
        const handleWindowScroll = () => {
            if (!stickySectionRef.current) return;
            const rect = stickySectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const totalScrollableDistance = rect.height - windowHeight;

            if (totalScrollableDistance <= 0) return;

            const scrolledIntoSection = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolledIntoSection / totalScrollableDistance));

            let targetIndex = 0;
            if (progress < 0.33) {
                targetIndex = 0;
            } else if (progress < 0.66) {
                targetIndex = 1;
            } else {
                targetIndex = 2;
            }

            setActiveSlide(targetIndex);
        };

        window.addEventListener("scroll", handleWindowScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleWindowScroll);
    }, []);

    // Filter faculty members based on search input (Name, Role, Skills, Bio)
    const filteredMembers = initialMembers.filter((member) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            member.name.toLowerCase().includes(q) ||
            member.role.toLowerCase().includes(q) ||
            member.skills.some((skill) => skill.toLowerCase().includes(q)) ||
            (member.bio && member.bio.toLowerCase().includes(q))
        );
    });

    // Disable body scroll when modal is open
    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedIndex]);

    // Handle initial URL hash (#slug) on load and on hash change
    useEffect(() => {
        const syncHashWithModal = () => {
            const hash = window.location.hash.replace("#", "").trim().toLowerCase();
            if (hash) {
                const index = initialMembers.findIndex(
                    (m) =>
                        m.slug.toLowerCase() === hash ||
                        m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === hash
                );
                if (index !== -1) {
                    setSelectedIndex(index);
                    return;
                }
            }
        };

        syncHashWithModal();
        window.addEventListener("hashchange", syncHashWithModal);
        return () => window.removeEventListener("hashchange", syncHashWithModal);
    }, [initialMembers]);

    const selectMember = (indexInFiltered: number | null) => {
        if (indexInFiltered === null) {
            setSelectedIndex(null);
            if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
            return;
        }

        const targetMember = filteredMembers[indexInFiltered];
        if (!targetMember) return;

        const originalIndex = initialMembers.findIndex((m) => m.id === targetMember.id);
        if (originalIndex !== -1) {
            setSelectedIndex(originalIndex);
            const targetHash = `#${targetMember.slug}`;
            if (window.location.hash !== targetHash) {
                window.location.hash = targetMember.slug;
            }
        }
    };

    const selectedMember = selectedIndex !== null ? initialMembers[selectedIndex] : null;

    const handlePrev = () => {
        if (selectedIndex === null) return;
        const newIdx = selectedIndex === 0 ? initialMembers.length - 1 : selectedIndex - 1;
        setSelectedIndex(newIdx);
        const member = initialMembers[newIdx];
        if (member) window.location.hash = member.slug;
    };

    const handleNext = () => {
        if (selectedIndex === null) return;
        const newIdx = selectedIndex === initialMembers.length - 1 ? 0 : selectedIndex + 1;
        setSelectedIndex(newIdx);
        const member = initialMembers[newIdx];
        if (member) window.location.hash = member.slug;
    };

    const openLink = (url?: string) => {
        if (!url || url === "-" || url === "") return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="w-full bg-white min-h-screen">

            {/* ── HERO HEADER (Distinct Indigo & Violet Mesh Palette) ─────────────── */}
            <section className="relative w-full bg-[#f4f3f9] pt-32 sm:pt-40 lg:pt-44 pb-20 sm:pb-28 overflow-hidden flex flex-col justify-center">
                {/* Violet/Indigo Ambient Mesh Gradient */}
                <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
                    <MeshGradientCanvas
                        colors={[
                            [0.38, 0.28, 0.88, 0.10],   // indigo-violet
                            [0.58, 0.22, 0.82, 0.08],   // purple
                            [0.0, 0.0, 0.0, 0.06],      // dark subtle
                            [0.48, 0.38, 0.95, 0.07],   // lavender
                        ]}
                        distortion={1.0}
                        swirl={0.8}
                        grainMixer={0.0}
                        grainOverlay={0.0}
                        speed={0.8}
                    />
                </div>

                {/* Bottom Fade Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none z-[1]" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-indigo-200/90 text-indigo-800 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
                        <GraduationCap className="w-4 h-4 text-indigo-600" weight="bold" />
                        School of AIDS & GenAI
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
                        SCOPE Faculties
                    </h1>

                    {/* Subtitle */}
                    <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                        Team SindhanAI brings together faculty from AD, GenAI and SCOPE to learn from each other, keep up with current technologies and industry practices, and turn that learning into useful teaching, projects, training, and solutions.
                    </p>

                    {/* Powered by IPS Tech (Placed Below Description) */}
                    <div className="pt-3 flex items-center justify-center">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">Powered by IPS Tech</span>
                            <img
                                src="/ips-tech.png"
                                alt="IPS Tech"
                                className="h-5 sm:h-6 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LEADERSHIP HIERARCHY SECTION ────────────────────────────────────────── */}

            {/* 1. DESKTOP VIEW: Scroll-Driven Sticky Horizontal Pin Slider (hidden md:block) */}
            <div ref={stickySectionRef} className="hidden md:block relative h-[220vh] bg-transparent pb-8 mb-4">
                {/* STICKY PINNED VIEWPORT (Top-16 Pinned Frame) */}
                <div className="sticky top-16 h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                    {/* CENTERED SECTION HEADER */}
                    <div className="text-center space-y-2 pb-2 max-w-2xl mx-auto">
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
                            Leadership & Governance — Scroll to Explore
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                            Guiding Vision & AI Mentorship
                        </h2>
                    </div>

                    {/* HORIZONTAL CAROUSEL CONTAINER WITH DRAG SUPPORT & SHARED BACKDROP FRAME */}
                    <div
                        className="relative overflow-hidden px-4 sm:px-6 py-4 cursor-grab active:cursor-grabbing select-none max-w-4xl mx-auto w-full my-auto"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* SINGLE SHARED ROTATED BACKDROP COLOR RIBBON */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 z-0">
                            <div
                                className={`w-full max-w-4xl h-full transform -rotate-2 transition-all duration-700 opacity-95 rounded-[36px] sm:rounded-[40px] ${activeSlide === 0
                                    ? "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400"
                                    : activeSlide === 1
                                        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400"
                                        : "bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500"
                                    }`}
                            />
                        </div>

                        {/* HORIZONTAL TRANSITION SLIDES CONTAINER */}
                        <div
                            className="relative z-10 flex transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                        >
                            {/* ── SLIDE 1: PRIME MOVER (White Floating Card with Opacity Fade to Prevent Bleed) ── */}
                            <div
                                className={`w-full shrink-0 px-2 flex justify-center transition-opacity duration-500 ${activeSlide === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-[36px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[380px] sm:min-h-[420px] shadow-xl shadow-slate-900/5 border border-slate-100/80">
                                    {/* Left Content */}
                                    <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6 bg-white">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2.5">
                                                <span className="h-0.5 w-6 bg-rose-600 rounded-full" />
                                                <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">
                                                    PRIME MOVER
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                                    Dr. Ashok Bakthavathsalam
                                                </h3>
                                                <p className="text-xs sm:text-sm font-extrabold text-rose-600 uppercase tracking-wide">
                                                    Managing Director — KgGroups
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                Executive Leadership
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                KGISL Founder
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Studio Image Panel */}
                                    <div className="md:col-span-5 relative bg-gradient-to-br from-rose-50 to-amber-50 min-h-[300px] md:min-h-full overflow-hidden">
                                        <img
                                            src="/faculty_images/ashok-bakthavathsalam.jpg"
                                            alt="Dr. Ashok Bakthavathsalam"
                                            className="w-full h-full object-cover object-top absolute inset-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 2: HEAD OF INSTITUTION (White Floating Card with Opacity Fade) ── */}
                            <div
                                className={`w-full shrink-0 px-2 flex justify-center transition-opacity duration-500 ${activeSlide === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-[36px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[380px] sm:min-h-[420px] shadow-xl shadow-slate-900/5 border border-slate-100/80">
                                    {/* Left Content */}
                                    <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6 bg-white">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2.5">
                                                <span className="h-0.5 w-6 bg-teal-600 rounded-full" />
                                                <span className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
                                                    HEAD OF INSTITUTION
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                                    Er. Sathish Ramanujam
                                                </h3>
                                                <p className="text-xs sm:text-sm font-extrabold text-teal-700 uppercase tracking-wide">
                                                    Head of AD - SCHOOL OF INNOVATION & HOD - AIDS
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                Academic Direction
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                Head of SOI & AIDS
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Studio Image Panel */}
                                    <div className="md:col-span-5 relative bg-gradient-to-br from-teal-50 to-emerald-50 min-h-[300px] md:min-h-full overflow-hidden">
                                        <img
                                            src="/faculty_images/sathish-ramanujam.jpg"
                                            alt="Er. Sathish Ramanujam"
                                            className="w-full h-full object-cover object-top absolute inset-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── SLIDE 3: TECHNICAL MENTORS (White Floating Card with Opacity Fade) ── */}
                            <div
                                className={`w-full shrink-0 px-2 flex justify-center transition-opacity duration-500 ${activeSlide === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-[36px] overflow-hidden p-6 sm:p-10 flex flex-col justify-between space-y-6 min-h-[380px] sm:min-h-[420px] shadow-xl shadow-slate-900/5 border border-slate-100/80">
                                    {/* Top Header Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className="h-0.5 w-6 bg-violet-600 rounded-full" />
                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
                                                TECHNICAL MENTORS
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            GenAI & Innovation Labs
                                        </span>
                                    </div>

                                    {/* Mentors 2-Column Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        {/* Mathi Yuvarajan T.K */}
                                        <div className="bg-slate-50/90 rounded-2xl p-5 flex items-center gap-5 border border-slate-100 hover:bg-white hover:shadow-xs transition-all duration-300">
                                            <div className="w-28 h-36 sm:w-36 sm:h-44 rounded-2xl overflow-hidden shrink-0 shadow-xs relative border border-slate-100">
                                                <img
                                                    src="/faculty_images/mathi-yuvarajan.jpg"
                                                    alt="Mathi Yuvarajan T.K"
                                                    className="w-full h-full object-cover object-top absolute inset-0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                                    Mathi Yuvarajan T.K
                                                </h4>
                                                <p className="text-xs font-extrabold text-violet-600 uppercase tracking-wide leading-relaxed">
                                                    Head of GenAI — School of Innovation
                                                </p>
                                            </div>
                                        </div>

                                        {/* Aiswariya S */}
                                        <div className="bg-slate-50/90 rounded-2xl p-5 flex items-center gap-5 border border-slate-100 hover:bg-white hover:shadow-xs transition-all duration-300">
                                            <div className="w-28 h-36 sm:w-36 sm:h-44 rounded-2xl overflow-hidden shrink-0 shadow-xs relative border border-slate-100">
                                                <img
                                                    src="/faculty_images/aiswariya-s.jpg"
                                                    alt="Aiswariya S"
                                                    className="w-full h-full object-cover object-top absolute inset-0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                                    Aiswariya S
                                                </h4>
                                                <p className="text-xs font-extrabold text-sky-600 uppercase tracking-wide leading-relaxed">
                                                    AI Innovation Engineer — School of Innovation
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 text-center">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Guiding Students in Generative AI, Machine Learning, and Computer Vision
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PROGRESS INDICATOR DOTS (ANCHORED AT BOTTOM OF STICKY VIEWPORT) */}
                    <div className="flex justify-center items-center gap-2 pt-2 pb-2">
                        {[0, 1, 2].map((idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToSlide(idx)}
                                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === idx ? "w-8 bg-slate-950" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. MOBILE VIEW: Dedicated Clean Responsive Stacked Layout (block md:hidden) */}
            <section className="block md:hidden max-w-xl mx-auto px-4 py-10 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2 pb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
                        Leadership & Governance
                    </span>
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                        Guiding Vision & AI Mentorship
                    </h2>
                </div>

                {/* Mobile Card 1: Prime Mover */}
                <div className="relative p-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transform -rotate-1 rounded-3xl opacity-90 pointer-events-none" />
                    <div className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="h-0.5 w-5 bg-rose-600 rounded-full" />
                                <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                                    PRIME MOVER
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                    Dr. Ashok Bakthavathsalam
                                </h3>
                                <p className="text-xs font-extrabold text-rose-600 uppercase tracking-wide mt-1">
                                    Managing Director — KgGroups
                                </p>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden h-[340px] sm:h-[400px] w-full relative bg-rose-50 border border-slate-100">
                            <img
                                src="/faculty_images/ashok-bakthavathsalam.jpg"
                                alt="Dr. Ashok Bakthavathsalam"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Card 2: Head of Institution */}
                <div className="relative p-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 transform -rotate-1 rounded-3xl opacity-90 pointer-events-none" />
                    <div className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="h-0.5 w-5 bg-teal-600 rounded-full" />
                                <span className="text-xs font-black uppercase tracking-wider text-teal-600">
                                    HEAD OF INSTITUTION
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                    Er. Sathish Ramanujam
                                </h3>
                                <p className="text-xs font-extrabold text-teal-700 uppercase tracking-wide mt-1">
                                    Head of AD - SCHOOL OF INNOVATION & HOD - AIDS
                                </p>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden h-[340px] sm:h-[400px] w-full relative bg-teal-50 border border-slate-100">
                            <img
                                src="/faculty_images/sathish-ramanujam.jpg"
                                alt="Er. Sathish Ramanujam"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Card 3: Technical Mentors */}
                <div className="relative p-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 transform -rotate-1 rounded-3xl opacity-90 pointer-events-none" />
                    <div className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="h-0.5 w-5 bg-violet-600 rounded-full" />
                                <span className="text-xs font-black uppercase tracking-wider text-violet-600">
                                    TECHNICAL MENTORS
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Mathi Yuvarajan */}
                            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
                                <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-lg overflow-hidden shrink-0 relative border border-slate-100">
                                    <img
                                        src="/faculty_images/mathi-yuvarajan.jpg"
                                        alt="Mathi Yuvarajan T.K"
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                                        Mathi Yuvarajan T.K
                                    </h4>
                                    <p className="text-[11px] sm:text-xs font-extrabold text-violet-600 uppercase tracking-wide mt-1">
                                        Head of GenAI — School of Innovation
                                    </p>
                                </div>
                            </div>

                            {/* Aiswariya S */}
                            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
                                <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-lg overflow-hidden shrink-0 relative border border-slate-100">
                                    <img
                                        src="/faculty_images/aiswariya-s.jpg"
                                        alt="Aiswariya S"
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                                        Aiswariya S
                                    </h4>
                                    <p className="text-[11px] sm:text-xs font-extrabold text-sky-600 uppercase tracking-wide mt-1">
                                        AI Innovation Engineer — School of Innovation
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FACULTY MEMBERS GRID & SEARCH ────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 space-y-10">
                {/* SEARCH INPUT & FILTER BAR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs backdrop-blur-sm">
                    <div className="relative w-full sm:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <MagnifyingGlass className="w-4 h-4" weight="bold" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search faculty by name, role, or skill..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-2xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" weight="bold" />
                            </button>
                        )}
                    </div>

                    {/* Member Count Indicator */}
                    <div className="text-xs font-bold text-slate-600 flex items-center gap-2 self-start sm:self-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Showing {filteredMembers.length} of {initialMembers.length} Faculty Mentors</span>
                    </div>
                </div>

                {/* FACULTY GRID */}
                {
                    filteredMembers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {filteredMembers.map((member, index) => (
                                <div
                                    key={member.id}
                                    className="bg-white rounded-[20px] border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group hover:-translate-y-1"
                                >
                                    <div className="space-y-5">
                                        {/* Member Header & Light Studio Background Frame */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="relative shrink-0 p-1 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-2xs">
                                                <img
                                                    src={member.avatar || "/faculty_images/dummy_avatar.png"}
                                                    alt={member.name}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0F172A&color=fff&size=200`;
                                                    }}
                                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-white group-hover:scale-105 transition-transform"
                                                />
                                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-white" />
                                            </div>
                                        </div>

                                        {/* Name & Role */}
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-950 leading-snug group-hover:text-slate-800 transition-colors">
                                                {member.name}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-500 mt-1">
                                                {member.role}
                                            </p>
                                        </div>

                                        {/* About Bio Snippet */}
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                                            {member.bio}
                                        </p>

                                        {/* Skills Chips */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {member.skills.slice(0, 3).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {member.skills.length > 3 && (
                                                <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-500">
                                                    +{member.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => selectMember(index)}
                                            className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                                        >
                                            View Details <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* EMPTY STATE WHEN SEARCH HAS NO MATCHES */
                        <div className="py-20 text-center space-y-4 bg-slate-50/60 rounded-3xl border border-dashed border-slate-300 p-8">
                            <div className="w-14 h-14 rounded-full bg-slate-200/80 flex items-center justify-center mx-auto text-slate-500">
                                <MagnifyingGlass className="w-6 h-6" weight="bold" />
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900">
                                No faculty members found
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                                We couldn't find any faculty members matching "{searchQuery}". Try searching by another name, role, or programming skill.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Reset Search Filter
                            </button>
                        </div>
                    )
                }
            </section >

            {/* ── MONOCHROME EXTRA-LARGE FACULTY DETAIL MODAL ── */}
            {
                selectedMember && selectedIndex !== null && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn"
                        onClick={() => selectMember(null)}
                    >
                        <div
                            className="relative w-full max-w-4xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden text-slate-900 max-h-[92vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Clean Top Navigation Bar (Only Prev/Next Controls & Close Button) */}
                            <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs shrink-0">
                                {/* Previous / Next Navigation & Counter */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                                        title="Previous Profile"
                                    >
                                        <CaretLeft className="w-4 h-4" weight="bold" />
                                        <span className="hidden sm:inline">Previous</span>
                                    </button>

                                    <span className="text-xs font-extrabold text-slate-600 px-3 select-none">
                                        Profile {selectedIndex + 1} of {initialMembers.length}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                                        title="Next Profile"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <CaretRight className="w-4 h-4" weight="bold" />
                                    </button>
                                </div>

                                {/* Close Modal Button */}
                                <button
                                    type="button"
                                    onClick={() => selectMember(null)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
                                    aria-label="Close modal"
                                >
                                    <X className="w-4 h-4" weight="bold" />
                                </button>
                            </div>

                            {/* SINGLE UNIFIED SCROLLABLE AREA (Gray Header + About Body scroll together) */}
                            <div className="overflow-y-auto flex-1">
                                {/* Modal Header Details (Gray Background) */}
                                <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                        {/* Extra-Large Profile Avatar in Modal */}
                                        <div className="relative group shrink-0 p-1.5 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                            <img
                                                src={selectedMember.avatar || "/faculty_images/dummy_avatar.png"}
                                                alt={selectedMember.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=0F172A&color=fff&size=300`;
                                                }}
                                                className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border border-slate-200"
                                            />

                                            {/* Action Badges Overlay (Play Video & Resume) */}
                                            <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 z-10">
                                                {/* Intro Video Button */}
                                                {selectedMember.scopeData?.selfIntroVideo && selectedMember.scopeData.selfIntroVideo.startsWith("http") && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openLink(selectedMember.scopeData?.selfIntroVideo)}
                                                        title="Watch Self Introduction Video"
                                                        className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
                                                    >
                                                        <PlayCircle className="w-5.5 h-5.5 text-white" weight="fill" />
                                                    </button>
                                                )}

                                                {/* Resume / OnePage CV Button */}
                                                {selectedMember.scopeData?.onePageCv && selectedMember.scopeData.onePageCv.startsWith("http") && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openLink(selectedMember.scopeData?.onePageCv)}
                                                        title="View One-Page CV / Resume"
                                                        className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
                                                    >
                                                        <FileText className="w-5 h-5 text-white" weight="bold" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Name, Role & Contact */}
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                                                    SCOPE Team
                                                </span>
                                                {selectedMember.scopeData?.empId && (
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950 text-white">
                                                        Emp ID: {selectedMember.scopeData.empId}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                                                {selectedMember.name}
                                            </h2>

                                            <p className="text-xs sm:text-sm font-bold text-slate-600">
                                                {selectedMember.role}
                                            </p>

                                            {/* Direct Contact Links */}
                                            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 font-semibold">
                                                {selectedMember.email && (
                                                    <a
                                                        href={`mailto:${selectedMember.email}`}
                                                        className="inline-flex items-center gap-1.5 hover:text-slate-950 transition-colors"
                                                    >
                                                        <EnvelopeSimple className="w-4 h-4 text-slate-500" weight="bold" />
                                                        <span>{selectedMember.email}</span>
                                                    </a>
                                                )}
                                                {selectedMember.scopeData?.phone && (
                                                    <a
                                                        href={`tel:${selectedMember.scopeData.phone}`}
                                                        className="inline-flex items-center gap-1.5 hover:text-slate-950 transition-colors"
                                                    >
                                                        <PhoneCall className="w-4 h-4 text-slate-500" weight="bold" />
                                                        <span>{selectedMember.scopeData.phone}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* All Profiles & Social Links Directly Under Profile Header Section */}
                                    <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                            Profiles & Social Links
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMember.social.linkedin && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.social.linkedin)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <LinkedinLogo className="w-4 h-4 text-slate-800" weight="bold" /> LinkedIn
                                                </button>
                                            )}
                                            {selectedMember.social.github && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.social.github)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <GithubLogo className="w-4 h-4 text-slate-800" weight="bold" /> GitHub
                                                </button>
                                            )}
                                            {selectedMember.social.twitter && selectedMember.social.twitter !== "-" && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.social.twitter)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <TwitterLogo className="w-4 h-4 text-slate-800" weight="bold" /> X (Twitter)
                                                </button>
                                            )}
                                            {selectedMember.scopeData?.leetcode && selectedMember.scopeData.leetcode.startsWith("http") && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.scopeData?.leetcode)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <Code className="w-4 h-4 text-slate-800" weight="bold" /> LeetCode
                                                </button>
                                            )}
                                            {selectedMember.scopeData?.hackerrank && selectedMember.scopeData.hackerrank.startsWith("http") && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.scopeData?.hackerrank)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <Code className="w-4 h-4 text-slate-800" weight="bold" /> HackerRank
                                                </button>
                                            )}
                                            {selectedMember.scopeData?.medium && selectedMember.scopeData.medium.startsWith("http") && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.scopeData?.medium)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <Article className="w-4 h-4 text-slate-800" weight="bold" /> Medium
                                                </button>
                                            )}
                                            {selectedMember.scopeData?.slack && selectedMember.scopeData.slack.startsWith("http") && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.scopeData?.slack)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <SlackLogo className="w-4 h-4 text-slate-800" weight="bold" /> Slack
                                                </button>
                                            )}
                                            {selectedMember.scopeData?.kaggle && selectedMember.scopeData.kaggle.startsWith("http") && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.scopeData?.kaggle)}
                                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                                                >
                                                    <Database className="w-4 h-4 text-slate-800" weight="bold" /> Kaggle
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Content Area */}
                                <div className="p-6 sm:p-8 space-y-6">
                                    {/* Quick Action CV / Intro Video Buttons if present */}
                                    {(selectedMember.scopeData?.selfIntroVideo || selectedMember.scopeData?.onePageCv) && (
                                        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Faculty Assets:</span>
                                            {selectedMember.scopeData?.onePageCv && selectedMember.scopeData.onePageCv.startsWith("http") && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.scopeData?.onePageCv)}
                                                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                                                >
                                                    <FileText className="w-4 h-4" weight="bold" /> View One-Page CV
                                                </button>
                                            )}
                                            {selectedMember.scopeData?.selfIntroVideo && selectedMember.scopeData.selfIntroVideo.startsWith("http") && (
                                                <button
                                                    type="button"
                                                    onClick={() => openLink(selectedMember.scopeData?.selfIntroVideo)}
                                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                                                >
                                                    <PlayCircle className="w-4 h-4 text-white" weight="fill" /> Watch Self Intro Video
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* About Section */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                            About & Professional Overview
                                        </h4>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            {selectedMember.fullBio || selectedMember.bio}
                                        </p>
                                    </div>

                                    {/* Technical & Teaching Experience Grid */}
                                    {selectedMember.scopeData && (
                                        <div className="space-y-3 pt-2">
                                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                                Experience & Technical Proficiency
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <span className="block text-[11px] font-bold text-slate-500">Work Experience</span>
                                                    <span className="text-sm font-extrabold text-slate-900">{selectedMember.scopeData.workExperience || "N/A"}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <span className="block text-[11px] font-bold text-slate-500">Python</span>
                                                    <span className="text-sm font-extrabold text-slate-900">{selectedMember.scopeData.pythonExperience || "-"}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <span className="block text-[11px] font-bold text-slate-500">C Programming</span>
                                                    <span className="text-sm font-extrabold text-slate-900">{selectedMember.scopeData.cProgrammingExperience || "-"}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <span className="block text-[11px] font-bold text-slate-500">DSA / Design Thinking</span>
                                                    <span className="text-sm font-extrabold text-slate-900">{selectedMember.scopeData.dsaDesignThinkingExperience || "-"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer with Previous / Next Controls */}
                            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <CaretLeft className="w-4 h-4" weight="bold" /> <span className="hidden sm:inline">Previous</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <span className="hidden sm:inline">Next</span> <CaretRight className="w-4 h-4" weight="bold" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => selectMember(null)}
                                    className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* <BrandTicker /> */}
            <CTASection />
        </div >
    );
}
