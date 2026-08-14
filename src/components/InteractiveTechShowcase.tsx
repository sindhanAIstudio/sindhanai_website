"use client";

import { useState } from "react";
import {
    Cpu,
    Eye,
    Stack,
    Lightning,
    Sparkle,
    CheckCircle,
    Database,
    ArrowRight,
    Code,
    TerminalWindow,
} from "@phosphor-icons/react";

export default function InteractiveTechShowcase() {
    const [activeTab, setActiveTab] = useState<"rag" | "vision" | "stack">("rag");
    const [ragQuery, setRagQuery] = useState("What are the GPU hardware requirements for fine-tuning Llama-3?");
    const [isProcessing, setIsProcessing] = useState(false);
    const [ragStep, setRagStep] = useState(3);

    const simulateRagPipeline = () => {
        setIsProcessing(true);
        setRagStep(0);
        setTimeout(() => setRagStep(1), 500);
        setTimeout(() => setRagStep(2), 1000);
        setTimeout(() => setRagStep(3), 1500);
        setTimeout(() => setIsProcessing(false), 1600);
    };

    return (
        <div className="w-full glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden my-12">
            {/* Background glow behind workbench */}
            <div className="glow-sphere-indigo top-0 right-0 opacity-40"></div>
            <div className="glow-sphere-violet bottom-0 left-0 opacity-30"></div>

            <div className="relative z-10 space-y-8">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-glow text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkle className="w-3.5 h-3.5 text-indigo-400" /> Interactive AI Workbench
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Test SindhanAI Core Engineering Capacities
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Click through our interactive live simulators to inspect how we architect enterprise solutions.
                        </p>
                    </div>

                    {/* Workbench Selector Tabs */}
                    <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab("rag")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "rag"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Database className="w-4 h-4" /> Enterprise RAG
                        </button>
                        <button
                            onClick={() => setActiveTab("vision")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "vision"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Eye className="w-4 h-4" /> Computer Vision
                        </button>
                        <button
                            onClick={() => setActiveTab("stack")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "stack"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Stack className="w-4 h-4" /> Full-Stack Architecture
                        </button>
                    </div>
                </div>

                {/* Tab 1: RAG Simulator */}
                {activeTab === "rag" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80">

                        {/* Query Input */}
                        <div className="lg:col-span-5 space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-400">
                                1. User Query & Vectorization
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={ragQuery}
                                    onChange={(e) => setRagQuery(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                                />
                                <button
                                    onClick={simulateRagPipeline}
                                    disabled={isProcessing}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lightning className="w-4 h-4" /> Execute Hybrid RAG Pipeline
                                </button>
                            </div>

                            {/* Pipeline Pipeline Steps Progress */}
                            <div className="space-y-2 pt-2">
                                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${ragStep >= 1 ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-200" : "bg-slate-900/50 border-slate-800 text-slate-500"}`}>
                                    <span className="font-semibold">Step 1: Embedding Vectorization</span>
                                    {ragStep >= 1 && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                                </div>
                                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${ragStep >= 2 ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-200" : "bg-slate-900/50 border-slate-800 text-slate-500"}`}>
                                    <span className="font-semibold">Step 2: Cosine Similarity Vector Search</span>
                                    {ragStep >= 2 && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                                </div>
                                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${ragStep >= 3 ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200" : "bg-slate-900/50 border-slate-800 text-slate-500"}`}>
                                    <span className="font-semibold">Step 3: Context-Augmented Generation</span>
                                    {ragStep >= 3 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                </div>
                            </div>
                        </div>

                        {/* Vector DB Output */}
                        <div className="lg:col-span-7 bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                                <div className="flex items-center gap-2">
                                    <TerminalWindow className="w-4 h-4 text-indigo-400" />
                                    <span>RAG Vector DB Output Stream</span>
                                </div>
                                <span className="text-emerald-400">Latency: 142ms</span>
                            </div>

                            {ragStep >= 2 ? (
                                <div className="space-y-3 text-slate-300">
                                    <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                                        <div className="text-indigo-400 font-bold text-[11px] mb-1">
                                            [Vector Chunk #891] Score: 0.942 (Cosine Similarity)
                                        </div>
                                        <p className="text-slate-300 text-[11px] leading-relaxed">
                                            "Fine-tuning Llama-3-8B with LoRA requires a minimum of 24GB VRAM (NVIDIA RTX 4090 / A10G). Full parameter fine-tuning requires 8x A100 80GB GPUs."
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                                        <div className="text-emerald-400 font-bold text-[11px] mb-1">
                                            [Synthesized LLM Response]
                                        </div>
                                        <p className="text-slate-200 text-[11px] leading-relaxed">
                                            To fine-tune Llama-3 effectively:
                                            <br />• <strong>Parameter Efficient (LoRA/QLoRA)</strong>: 1x RTX 4090 or A10G (24GB VRAM)
                                            <br />• <strong>Full Precision Tuning</strong>: Multi-node cluster with 8x NVIDIA A100/H100 (80GB)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-500 italic">
                                    Press "Execute Hybrid RAG Pipeline" to stream live vector retrieval results...
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* Tab 2: Computer Vision Simulator */}
                {activeTab === "vision" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80">
                        <div className="lg:col-span-7 bg-slate-900 rounded-xl p-4 border border-slate-800 relative min-h-[240px] flex items-center justify-center overflow-hidden">
                            {/* Simulated Video Frame with Bounding Boxes */}
                            <div className="w-full h-56 bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800 flex items-center justify-center">
                                <div className="absolute inset-0 cyber-grid opacity-20"></div>

                                {/* Bounding Box 1 */}
                                <div className="absolute top-8 left-12 w-36 h-28 border-2 border-emerald-400 rounded-md bg-emerald-500/10 p-1 font-mono text-[10px] text-emerald-400 font-bold">
                                    Defect: Null [98.4%]
                                </div>

                                {/* Bounding Box 2 */}
                                <div className="absolute bottom-6 right-16 w-40 h-24 border-2 border-indigo-400 rounded-md bg-indigo-500/10 p-1 font-mono text-[10px] text-indigo-400 font-bold">
                                    Component: PCB-IC-9 [99.1%]
                                </div>

                                <div className="text-slate-500 text-xs flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-indigo-400 animate-pulse" /> Edge AI Visual Inspection Stream (60 FPS)
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-3 font-mono text-xs text-slate-300">
                            <h4 className="font-bold text-white text-sm">Real-Time Inspection Metrics</h4>
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Inference Engine:</span>
                                    <span className="text-indigo-400 font-bold">TensorRT / YOLOv8</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">FPS / Latency:</span>
                                    <span className="text-emerald-400 font-bold">62 FPS / 16ms</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Hardware Target:</span>
                                    <span className="text-white font-bold">NVIDIA Jetson Orin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: Full-Stack Architecture */}
                {activeTab === "stack" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80">
                        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                AI
                            </div>
                            <h4 className="font-bold text-white text-sm">Generative & Edge AI</h4>
                            <p className="text-xs text-slate-400">PyTorch, LangChain, LlamaIndex, TensorRT, OpenCV, HuggingFace Transformers.</p>
                        </div>

                        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                                WEB
                            </div>
                            <h4 className="font-bold text-white text-sm">Full-Stack Application</h4>
                            <p className="text-xs text-slate-400">Next.js 14+ (App Router), TypeScript, Tailwind CSS, FastAPI, Node.js.</p>
                        </div>

                        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                                DATA
                            </div>
                            <h4 className="font-bold text-white text-sm">Database & Infrastructure</h4>
                            <p className="text-xs text-slate-400">Prisma ORM 7, SQLite / PostgreSQL, Qdrant / Pinecone Vector DB, Docker.</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
