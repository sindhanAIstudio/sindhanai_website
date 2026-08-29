import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import BrandTicker from "@/components/BrandTicker";
import CTASection from "@/components/CTASection";
import MeshGradientCanvas from "@/components/MeshGradientCanvas";
import AboutHighlightSection from "@/components/AboutHighlightSection";
import AboutLabsSection from "@/components/AboutLabsSection";
import AboutClientsSection from "@/components/AboutClientsSection";
import {
    Sparkle,
    Target,
    Compass,
    Cpu,
    Brain,
    Code,
    GraduationCap,
    ArrowRight,
    CheckCircle,
    Users,
    Lightning,
    Rocket,
    Globe,
    Medal,
} from "@phosphor-icons/react/dist/ssr";

export const revalidate = 0;

export const metadata: Metadata = {
    title: "About Us — Bridging Industry Practice & Academic Innovation",
    description: "Learn about SindhanAI — KGiSL's applied technology lab uniting industry professionals, SCOPE faculty experts, and student builders to solve real problems.",
    openGraph: {
        title: "About SindhanAI — Applied AI and Technology Lab",
        description: "Bridging industry practice and academic innovation at KGiSL Institute of Technology.",
        images: ["/sindhanai-logo.png"]
    }
};

export default async function AboutPage() {
    const clientLogos = await prisma.clientLogo.findMany();

    // Marquee images from sindhanai template assets
    const marqueeImages = [
        "/images/sindhanai/image-15.webp",
        "/images/sindhanai/image-16.webp",
        "/images/sindhanai/image-17.webp",
        "/images/sindhanai/image-18.webp",
        "/images/sindhanai/image-19.webp",
    ];

    // Double loop for seamless infinite animation
    const imageLoop = [...marqueeImages, ...marqueeImages];

    return (
        <div className="w-full bg-white min-h-screen py-0 overflow-x-hidden">

            {/* ELEMENTOR-STYLE LIGHT ABOUT HERO SECTION WITH MESH GRADIENT */}
            <section className="relative w-full min-h-[90vh] bg-[#f4f3ef] pt-32 sm:pt-40 lg:pt-44 pb-12 sm:pb-20 overflow-hidden flex flex-col justify-between">

                {/* Animated WebGL Mesh Gradient Canvas */}
                <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
                    <MeshGradientCanvas
                        colors={[
                            [0.0, 0.0, 0.0, 0.08],         // #00000010
                            [0.10, 0.10, 0.15, 0.12],      // dark-opacity-3
                            [0.0, 0.0, 0.0, 0.08],         // #00000010
                            [0.62, 0.31, 0.82, 0.05],      // #9f50d3 faint ambient purple accent
                        ]}
                        distortion={1.0}
                        swirl={1.0}
                        grainMixer={0.0}
                        grainOverlay={0.0}
                        speed={1.0}
                    />
                </div>

                {/* Bottom Fade Overlay — Blends Grey Mesh Seamlessly into Next White Section */}
                <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 bg-gradient-to-b from-transparent via-white/40 to-white pointer-events-none z-[1]" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 my-auto">

                    {/* Centered Main Title (Reduced font size and weight) */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.14] max-w-4xl mx-auto">
                        Bridging Industry Practice and Academic Innovation
                    </h1>

                    {/* Centered Subtitle Description */}
                    <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        We are KGISL&apos;s applied technology lab — uniting industry professionals, faculty experts, and student builders to solve real problems through AI and software.
                    </p>

                    {/* Icons + Mission CTA Button Row */}
                    <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">

                        {/* Overlapping Standalone Themed Icon Circles: AI, Software, Training */}
                        <div className="flex items-center -space-x-3.5">
                            <div title="AI" className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-md hover:z-10 hover:scale-105 transition-transform">
                                <Brain className="w-6 h-6 text-indigo-300" weight="bold" />
                            </div>
                            <div title="Software" className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-md hover:z-10 hover:scale-105 transition-transform">
                                <Code className="w-6 h-6 text-purple-300" weight="bold" />
                            </div>
                            <div title="Training" className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-md hover:z-10 hover:scale-105 transition-transform">
                                <GraduationCap className="w-6 h-6 text-pink-300" weight="bold" />
                            </div>
                        </div>

                        {/* Standard Theme Button (rounded-[10px]) */}
                        <a
                            href="#pix_section_mission"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-slate-950 text-white font-semibold text-sm sm:text-[15px] hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
                        >
                            <span>Explore Our Mission</span>
                            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" weight="bold" />
                        </a>

                    </div>

                </div>

                {/* CONTINUOUS PHOTO MARQUEE STRIP — 100% Full Opacity, Vivid & Clear */}
                <div className="relative z-10 mt-12 sm:mt-16 w-full overflow-hidden">
                    <style>{`
                        @keyframes hero-photo-marquee {
                            0%   { transform: translateX(0%); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-hero-marquee {
                            animation: hero-photo-marquee 30s linear infinite;
                            will-change: transform;
                        }
                        .animate-hero-marquee:hover {
                            animation-play-state: paused;
                        }
                    `}</style>

                    <div className="flex items-center gap-5 sm:gap-6 animate-hero-marquee w-max px-4">
                        {[
                            "/images/sindhanai/image-15.webp",
                            "/images/sindhanai/image-34.webp",
                            "/images/sindhanai/image-19.webp",
                            "/images/sindhanai/image-16.webp",
                            "/images/sindhanai/image-15.webp",
                            "/images/sindhanai/image-34.webp",
                            "/images/sindhanai/image-19.webp",
                            "/images/sindhanai/image-16.webp",
                        ].map((src, idx) => (
                            <div
                                key={idx}
                                className="relative w-60 h-60 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border border-slate-200/60 shadow-md shrink-0 group opacity-100 bg-white"
                            >
                                <Image
                                    src={src}
                                    alt={`SindhanAI Showcase ${idx + 1}`}
                                    fill
                                    className="object-cover opacity-100 group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </section>


            {/* SECOND SECTION — Full Width Highlight Features Section */}
            <AboutHighlightSection />


            {/* THIRD SECTION — Our Labs (Vertical & Horizontal Labs) */}
            <AboutLabsSection />


            {/* FOURTH SECTION — Our Clients & Industry Partners (9:16 Reel Cards) */}
            <AboutClientsSection />


            {/* GLOBAL FOOTER CALLOUTS — White Background */}
            <BrandTicker />
            <CTASection />

        </div>
    );
}
