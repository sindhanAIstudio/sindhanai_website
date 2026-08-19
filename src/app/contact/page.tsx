import { prisma } from "@/lib/prisma";
import DynamicFormRenderer from "@/components/DynamicFormRenderer";
import { EnvelopeSimple, MapPin, Clock, Sparkle } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 0;

export default async function ContactPage() {
    const dynamicForms = await prisma.dynamicForm.findMany();

    const activeCustomForm = dynamicForms.length > 0 ? dynamicForms[0] : null;

    return (
        <div className="w-full space-y-12 py-8 md:py-14">

            {/* SindhanAI Pastel Hero Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-8 md:p-14 space-y-6 relative overflow-hidden shadow-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                        <Sparkle className="w-4 h-4 text-white" /> Connect With Us
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        Contact & Partner With Us
                    </h1>
                    <p className="text-base sm:text-xl text-white/90 max-w-3xl leading-relaxed font-medium">
                        Whether you have a live AI project requirement, want to run faculty/student upskilling, or want to collaborate with SindhanAI — we want to hear from you.
                    </p>
                </div>
            </section>

            {/* Main Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Direct Contact Info (5 Cols) */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-8 space-y-6">
                            <h2 className="text-2xl font-extrabold text-slate-900">Direct Contact Details</h2>

                            <div className="space-y-6 text-xs text-slate-600">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                        <EnvelopeSimple className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                                            Email Us
                                        </h4>
                                        <a href="mailto:sindhanai@kgisl.ac.in" className="text-sm font-bold text-slate-900 hover:underline">
                                            sindhanai@kgisl.ac.in
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                                            Campus Location
                                        </h4>
                                        <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-relaxed">
                                            School of Innovation, KGISL Campus, Saravanampatti, Coimbatore, Tamil Nadu, India — 641035
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                                            Lab Hours
                                        </h4>
                                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                                            Monday – Saturday: 09:00 AM – 06:00 PM IST
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Backing Box */}
                        <div className="bg-slate-50 rounded-[24px] border border-slate-200 p-8 space-y-2 border-l-4 border-l-black">
                            <h3 className="text-lg font-extrabold text-slate-900">Backed by KGISL & KGISL SOI</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Operating with institutional infrastructure and industry backing from KGISL Educational Institutions.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Form (7 Cols) */}
                    <div className="lg:col-span-7">
                        <DynamicFormRenderer customForm={activeCustomForm} />
                    </div>

                </div>
            </section>

        </div>
    );
}

