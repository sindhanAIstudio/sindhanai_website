import Link from "next/link";
import {
    GraduationCap,
    Users,
    Trophy,
    Sparkle,
    ArrowRight,
    CheckCircle,
} from "@phosphor-icons/react/dist/ssr";

export default function TrainingPage() {
    const pillars = [
        {
            icon: GraduationCap,
            title: "Faculty Upskilling Series",
            desc: "Intensive 3 to 5 day practical workshops equipping academic faculty with hands-on PyTorch, LLM fine-tuning, and RAG architecture skills.",
        },
        {
            icon: Users,
            title: "Student AI Bootcamps",
            desc: "Project-driven bootcamps teaching students modern computer vision, full-stack web development, and cloud deployment pipelines.",
        },
        {
            icon: Trophy,
            title: "Hackathons & Mentorship",
            desc: "Organization of regional & national AI hackathons with direct project incubation, code review, and cash reward opportunities.",
        },
    ];

    return (
        <div className="w-full space-y-12 py-8 md:py-14">

            {/* Pixfort Pastel Hero Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pixfort-hero-bg rounded-[32px] p-8 md:p-14 space-y-6 relative overflow-hidden shadow-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full pixfort-frosted-pill text-xs font-bold uppercase tracking-wider">
                        <Sparkle className="w-4 h-4 text-white" /> Vertical Service
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        Training & Experiential Upskilling
                    </h1>
                    <p className="text-base sm:text-xl text-white/90 max-w-3xl leading-relaxed font-medium">
                        Empowering academic faculty and ambitious students with real-world engineering skills, industry mentorship, and live project incubation.
                    </p>
                </div>
            </section>

            {/* Pillars Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pillars.map((pil) => {
                        const Icon = pil.icon;
                        return (
                            <div key={pil.title} className="pixfort-card p-8 space-y-5 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{pil.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{pil.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Industry Certificate Included
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA Box */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pixfort-card-grey p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-black">
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-900">Want to Host a Workshop at Your Institution?</h3>
                        <p className="text-sm text-slate-600 mt-1">Partner with SindhanAI for institutional training programs.</p>
                    </div>
                    <Link href="/contact" className="pixfort-btn-black px-7 py-3.5 text-sm flex items-center gap-2 shrink-0">
                        Request Training Proposal <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

        </div>
    );
}

