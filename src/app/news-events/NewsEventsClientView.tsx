"use client";

import { useState } from "react";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import BrandTicker from "@/components/BrandTicker";
import CTASection from "@/components/CTASection";
import {
    MagnifyingGlass,
    Calendar,
    Clock,
    MapPin,
    Sparkle,
    ArrowRight,
    Newspaper,
    Image as ImageIcon,
} from "@phosphor-icons/react";

interface NewsEventsClientViewProps {
    initialNews: any[];
    initialEvents: any[];
    initialGallery: any[];
}

export default function NewsEventsClientView({
    initialNews,
    initialEvents,
    initialGallery,
}: NewsEventsClientViewProps) {
    const [newsSearch, setNewsSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedEventForModal, setSelectedEventForModal] = useState<any>(null);

    const categories = ["All", "Announcement", "Tech", "SOI Hackathon", "Workshop"];

    const upcomingEvents = initialEvents.filter((e) => !e.isPast);
    const pastEvents = initialEvents.filter((e) => e.isPast);

    const filteredNews = initialNews.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
            item.summary.toLowerCase().includes(newsSearch.toLowerCase());
        const matchesCategory =
            selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full space-y-12 py-8 md:py-14">

            {/* SindhanAI Pastel Hero Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-8 md:p-14 space-y-6 relative overflow-hidden shadow-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                        <Sparkle className="w-4 h-4 text-white" /> Lab Bulletins
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        News & Upcoming Events
                    </h1>
                    <p className="text-base sm:text-xl text-white/90 max-w-3xl leading-relaxed font-medium">
                        Stay informed on our latest research publications, student hackathons, faculty upskilling series, and community workshops.
                    </p>
                </div>
            </section>

            {/* UPCOMING EVENTS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Upcoming Events & Bootcamps</h2>
                        <p className="text-xs text-slate-600 font-medium">Open for immediate online registration</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {upcomingEvents.map((evt) => (
                        <div
                            key={evt.id}
                            className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-8 space-y-6 flex flex-col justify-between border-l-4 border-l-black"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                                        Open For Registration
                                    </span>
                                    <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-900" />
                                        {evt.date}
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">{evt.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{evt.description}</p>

                                <div className="pt-3 space-y-2 text-xs font-medium text-slate-600 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-800" />
                                        <span>{evt.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-800" />
                                        <span>{evt.venue}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => setSelectedEventForModal(evt)}
                                    className="bg-black hover:bg-slate-900 text-white rounded-xl w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    Register Now <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* LATEST NEWS & ANNOUNCEMENTS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                            <Newspaper className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Latest News & Research</h2>
                            <p className="text-xs text-slate-600 font-medium">Announcements from the SindhanAI lab</p>
                        </div>
                    </div>

                    {/* Search & Category Filter */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={newsSearch}
                                onChange={(e) => setNewsSearch(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredNews.map((post) => (
                        <div key={post.id} className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-6 space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-extrabold text-slate-900 uppercase tracking-wider">{post.category}</span>
                                    <span className="text-slate-500 font-medium">{new Date(post.publishedAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{post.title}</h3>
                                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{post.summary}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PHOTO GALLERY */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Lab & Activity Gallery</h2>
                        <p className="text-xs text-slate-600 font-medium">Glimpses into our lab sessions and hackathons</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {initialGallery.map((item) => (
                        <div key={item.id} className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-5 space-y-3">
                            <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs text-center p-4">
                                {item.title}
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">{item.title}</span>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{item.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Registration Modal */}
            {selectedEventForModal && (
                <EventRegistrationModal
                    event={selectedEventForModal}
                    onClose={() => setSelectedEventForModal(null)}
                />
            )}

            {/* Global Footer Callouts */}
            <BrandTicker />
            <CTASection />

        </div>
    );
}

