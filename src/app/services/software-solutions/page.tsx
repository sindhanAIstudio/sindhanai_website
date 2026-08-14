import Link from "next/link";
import {
    Globe,
    Cloud,
    Lock,
    Sparkle,
    ArrowRight,
    CheckCircle,
} from "@phosphor-icons/react/dist/ssr";

export default function SoftwareSolutionsPage() {
    const solutions = [
        {
            icon: Globe,
            title: "Full-Stack Web Engineering",
            desc: "Next.js 14+ App Router, TypeScript, Tailwind CSS, and Node.js/Python microservices designed for speed, SEO, and responsiveness.",
        },
        {
            icon: Cloud,
            title: "DevOps & Cloud Infrastructure",
            desc: "Docker containerization, CI/CD automated deployment pipelines, Kubernetes cluster setup, and cloud hosting management.",
        },
        {
            icon: Lock,
            title: "Custom CRM & ERP Engines",
            desc: "Tailored enterprise administrative dashboards, dynamic role-based access control, analytics reporting, and API integrations.",
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
                        Software & Web Engineering Solutions
                    </h1>
                    <p className="text-base sm:text-xl text-white/90 max-w-3xl leading-relaxed font-medium">
                        Building high-performance modern web applications, cloud infrastructure, and custom software systems with enterprise security standards.
                    </p>
                </div>
            </section>

            {/* Solutions Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {solutions.map((sol) => {
                        const Icon = sol.icon;
                        return (
                            <div key={sol.title} className="pixfort-card p-8 space-y-5 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{sol.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{sol.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Scalable Modern Tech Stack
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
                        <h3 className="text-2xl font-extrabold text-slate-900">Need a Full-Stack Web App or Custom Software?</h3>
                        <p className="text-sm text-slate-600 mt-1">Talk directly with our lead software architects at SindhanAI.</p>
                    </div>
                    <Link href="/contact" className="pixfort-btn-black px-7 py-3.5 text-sm flex items-center gap-2 shrink-0">
                        Start Software Project <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

        </div>
    );
}

