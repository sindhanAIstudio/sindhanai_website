import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
    Sparkle,
    Target,
    Compass,
    Cpu,
    ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

export const revalidate = 0;

export default async function AboutPage() {
    const clientLogos = await prisma.clientLogo.findMany();

    return (
        <div className="w-full space-y-12 py-8 md:py-14">

            {/* Pixfort Pastel Hero Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pixfort-hero-bg rounded-[32px] p-8 md:p-14 space-y-6 text-center relative overflow-hidden shadow-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full pixfort-frosted-pill text-xs font-bold uppercase tracking-wider mx-auto">
                        <Sparkle className="w-4 h-4 text-white" /> About SindhanAI
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        The Applied AI & Software Lab Backed by KGISL
                    </h1>
                    <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
                        Operating at the intersection of industry engineering standards and academic research. We build production-ready AI systems while empowering students and faculty.
                    </p>
                </div>
            </section>

            {/* Vision & Mission Split */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="pixfort-card p-8 space-y-4 border-l-4 border-l-black">
                        <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                            <Compass className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900">Our Vision</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            To position KGISL & KGISL SOI as a premier hub for applied artificial intelligence in South India, translating cutting-edge deep learning research into scalable enterprise solutions.
                        </p>
                    </div>

                    <div className="pixfort-card p-8 space-y-4 border-l-4 border-l-black">
                        <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                            <Target className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900">Our Mission</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Bridge academia and industry through hands-on AI project incubation, faculty upskilling bootcamps, and full-stack software development for regional and global clients.
                        </p>
                    </div>

                </div>
            </section>

            {/* TWO DEDICATED INNOVATION LABS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                        Laboratory Infrastructure
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                        Our Two Dedicated Innovation Labs
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Lab 1 */}
                    <div className="pixfort-card p-8 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                                    <Cpu className="w-7 h-7" />
                                </div>
                                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                                    Vertical Focus Lab
                                </span>
                            </div>

                            <h3 className="text-2xl font-extrabold text-slate-900">AI & Data Science Lab</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Focuses on computer vision models (YOLO, OpenCV), edge AI deployments (NVIDIA Jetson), time-series analytics, and industrial predictive maintenance pipelines.
                            </p>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                            <div className="font-bold text-slate-800">Tech Stack & Tools:</div>
                            <div className="flex flex-wrap gap-2">
                                {["PyTorch", "TensorRT", "OpenCV", "YOLOv8", "FastAPI", "Docker"].map((tech) => (
                                    <span key={tech} className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-semibold">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lab 2 */}
                    <div className="pixfort-card p-8 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                                    <Sparkle className="w-7 h-7" />
                                </div>
                                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                                    Horizontal Focus Lab
                                </span>
                            </div>

                            <h3 className="text-2xl font-extrabold text-slate-900">Generative AI Lab</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Specializes in enterprise RAG knowledge bases, vector search indexing, custom LLM fine-tuning, autonomous agent workflows, and prompt engineering.
                            </p>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                            <div className="font-bold text-slate-800">Tech Stack & Tools:</div>
                            <div className="flex flex-wrap gap-2">
                                {["LlamaIndex", "LangChain", "Qdrant", "Pinecone", "Ollama", "Llama-3"].map((tech) => (
                                    <span key={tech} className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-semibold">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CLIENT / PARTNER LOGOS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    Backed & Trusted By Leading Entities
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {clientLogos.map((client) => (
                        <div
                            key={client.id}
                            className="pixfort-card p-5 text-center text-sm font-bold text-slate-800 hover:text-black transition-colors"
                        >
                            {client.name}
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

