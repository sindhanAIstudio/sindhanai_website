"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Newspaper,
    Calendar,
    ListChecks,
    Plus,
    Trash,
    UserCheck,
    CheckCircle,
    CircleNotch,
    ArrowLeft,
    Tray,
} from "@phosphor-icons/react";

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<"news" | "events" | "forms" | "submissions">("news");
    const [news, setNews] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [formsData, setFormsData] = useState<{ forms: any[]; generalSubmissions: any[] }>({
        forms: [],
        generalSubmissions: [],
    });
    const [loading, setLoading] = useState(true);

    // Form Modals State
    const [showNewsModal, setShowNewsModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedRegistrations, setSelectedRegistrations] = useState<any>(null);

    // New News State
    const [newsForm, setNewsForm] = useState({
        title: "",
        category: "Announcement",
        summary: "",
        content: "",
    });

    // New Event State
    const [eventForm, setEventForm] = useState({
        title: "",
        date: "",
        time: "09:30 AM - 04:30 PM IST",
        venue: "KGISL AI Lab",
        description: "",
    });

    // New Dynamic Form State
    const [formForm, setFormForm] = useState({
        title: "",
        description: "",
        fieldsJson: JSON.stringify(
            [
                { name: "fullName", label: "Full Name", type: "text", required: true },
                { name: "email", label: "Email Address", type: "email", required: true },
                { name: "qualification", label: "Highest Qualification", type: "text", required: false },
            ],
            null,
            2
        ),
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resNews, resEvents, resForms] = await Promise.all([
                fetch("/api/admin/news"),
                fetch("/api/admin/events"),
                fetch("/api/admin/forms"),
            ]);

            const [dataNews, dataEvents, dataForms] = await Promise.all([
                resNews.json(),
                resEvents.json(),
                resForms.json(),
            ]);

            setNews(Array.isArray(dataNews) ? dataNews : []);
            setEvents(Array.isArray(dataEvents) ? dataEvents : []);
            setFormsData(dataForms || { forms: [], generalSubmissions: [] });
        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateNews = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/admin/news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newsForm),
        });
        setShowNewsModal(false);
        setNewsForm({ title: "", category: "Announcement", summary: "", content: "" });
        fetchData();
    };

    const handleDeleteNews = async (id: string) => {
        if (!confirm("Are you sure you want to delete this news post?")) return;
        await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
        fetchData();
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/admin/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventForm),
        });
        setShowEventModal(false);
        setEventForm({ title: "", date: "", time: "09:30 AM - 04:30 PM IST", venue: "KGISL AI Lab", description: "" });
        fetchData();
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
        fetchData();
    };

    const handleCreateForm = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/admin/forms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formForm),
        });
        setShowFormModal(false);
        setFormForm({ title: "", description: "", fieldsJson: "" });
        fetchData();
    };

    const handleDeleteForm = async (id: string) => {
        if (!confirm("Are you sure you want to delete this dynamic form?")) return;
        await fetch(`/api/admin/forms?id=${id}`, { method: "DELETE" });
        fetchData();
    };

    return (
        <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-3xl p-6 sm:p-8">
                <div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main Website
                        </Link>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                        SindhanAI CMS Portal
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Manage News, Events, Dynamic Forms & Real-time Registrations
                    </p>
                </div>

                {/* Tab Selection */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab("news")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "news"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <Newspaper className="w-4 h-4" /> News ({news.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "events"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <Calendar className="w-4 h-4" /> Events ({events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("forms")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "forms"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <ListChecks className="w-4 h-4" /> Dynamic Forms ({formsData.forms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("submissions")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "submissions"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <Tray className="w-4 h-4" /> Submissions ({formsData.generalSubmissions.length})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <CircleNotch className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading CMS Data...</p>
                </div>
            ) : (
                <>
                    {/* Tab 1: News Management */}
                    {activeTab === "news" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    News & Announcements
                                </h2>
                                <button
                                    onClick={() => setShowNewsModal(true)}
                                    className="px-4 py-2 text-xs font-bold text-white rounded-xl sindhanai-gradient-bg flex items-center gap-1.5 shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> Publish New Post
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {news.map((item) => (
                                    <div key={item.id} className="glass-card rounded-2xl p-6 space-y-3 relative">
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span className="font-bold text-indigo-500 uppercase">{item.category}</span>
                                            <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                            {item.summary}
                                        </p>
                                        <div className="pt-2 flex justify-end">
                                            <button
                                                onClick={() => handleDeleteNews(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Events & Registrations Management */}
                    {activeTab === "events" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Events & Workshop Schedule
                                </h2>
                                <button
                                    onClick={() => setShowEventModal(true)}
                                    className="px-4 py-2 text-xs font-bold text-white rounded-xl sindhanai-gradient-bg flex items-center gap-1.5 shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> Create New Event
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {events.map((evt) => (
                                    <div key={evt.id} className="glass-card rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${evt.isPast ? "bg-slate-700 text-slate-300" : "bg-emerald-500/20 text-emerald-400"}`}>
                                                {evt.isPast ? "Past Event" : "Upcoming"}
                                            </span>
                                            <span className="text-xs text-slate-400">{evt.date}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                                            {evt.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                            {evt.description}
                                        </p>

                                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                                            <button
                                                onClick={() => setSelectedRegistrations(evt)}
                                                className="text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                                            >
                                                <UserCheck className="w-4 h-4" /> View Registrations ({evt.registrations?.length || 0})
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(evt.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-950/40 rounded-lg"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Dynamic Forms Management */}
                    {activeTab === "forms" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Dynamic Form Builder Schemas
                                </h2>
                                <button
                                    onClick={() => setShowFormModal(true)}
                                    className="px-4 py-2 text-xs font-bold text-white rounded-xl sindhanai-gradient-bg flex items-center gap-1.5 shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> Create Dynamic Form
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formsData.forms.map((frm) => (
                                    <div key={frm.id} className="glass-card rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-indigo-400">ACTIVE FORM</span>
                                            <button
                                                onClick={() => handleDeleteForm(frm.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-950/40 rounded-lg"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                            {frm.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            {frm.description || "No custom description."}
                                        </p>
                                        <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-32">
                                            <pre>{frm.fields}</pre>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Submissions received: <strong>{frm.submissions?.length || 0}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Contact Submissions */}
                    {activeTab === "submissions" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Contact & General Form Submissions
                            </h2>
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-xs text-slate-300">
                                    <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Payload Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {formsData.generalSubmissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-800/40">
                                                <td className="p-4 whitespace-nowrap">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-white">{sub.name}</td>
                                                <td className="p-4 text-indigo-400">{sub.email}</td>
                                                <td className="p-4 font-mono text-[11px] text-slate-400">{sub.payload}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Registrations Modal */}
            {selectedRegistrations && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-2xl rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto relative">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="font-bold text-white text-lg">
                                Registrations for: {selectedRegistrations.title}
                            </h3>
                            <button
                                onClick={() => setSelectedRegistrations(null)}
                                className="text-xs px-3 py-1 bg-slate-800 text-slate-300 rounded-lg"
                            >
                                Close
                            </button>
                        </div>

                        {selectedRegistrations.registrations?.length > 0 ? (
                            <div className="space-y-3">
                                {selectedRegistrations.registrations.map((reg: any) => (
                                    <div key={reg.id} className="p-4 bg-slate-900 rounded-xl space-y-1 text-xs text-slate-300">
                                        <div className="flex justify-between font-bold text-white text-sm">
                                            <span>{reg.name}</span>
                                            <span className="text-indigo-400">{reg.role}</span>
                                        </div>
                                        <div>Email: {reg.email} | Phone: {reg.phone}</div>
                                        <div>Institution: {reg.institution}</div>
                                        {reg.additionalInfo && <div className="text-slate-400 italic mt-1">"{reg.additionalInfo}"</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No registrations recorded yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Create News Modal */}
            {showNewsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg rounded-3xl p-6 space-y-4 bg-[#131c31]">
                        <h3 className="font-bold text-white text-lg">Publish New Announcement</h3>
                        <form onSubmit={handleCreateNews} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newsForm.title}
                                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                                <select
                                    value={newsForm.category}
                                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                >
                                    <option value="Announcement">Announcement</option>
                                    <option value="Tech">Tech</option>
                                    <option value="SOI Hackathon">SOI Hackathon</option>
                                    <option value="Workshop">Workshop</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Summary *</label>
                                <input
                                    type="text"
                                    required
                                    value={newsForm.summary}
                                    onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Full Content *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newsForm.content}
                                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl"
                                >
                                    Publish Post
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewsModal(false)}
                                    className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg rounded-3xl p-6 space-y-4 bg-[#131c31]">
                        <h3 className="font-bold text-white text-lg">Create New Upcoming Event</h3>
                        <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 mb-1 font-semibold">Date *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="November 20, 2026"
                                        value={eventForm.date}
                                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1 font-semibold">Time</label>
                                    <input
                                        type="text"
                                        value={eventForm.time}
                                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Venue *</label>
                                <input
                                    type="text"
                                    required
                                    value={eventForm.venue}
                                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Description *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl"
                                >
                                    Create Event
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEventModal(false)}
                                    className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Dynamic Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg rounded-3xl p-6 space-y-4 bg-[#131c31]">
                        <h3 className="font-bold text-white text-lg">Create Custom Dynamic Form</h3>
                        <form onSubmit={handleCreateForm} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Form Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formForm.title}
                                    onChange={(e) => setFormForm({ ...formForm, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                                <input
                                    type="text"
                                    value={formForm.description}
                                    onChange={(e) => setFormForm({ ...formForm, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1 font-semibold">Fields Schema JSON *</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formForm.fieldsJson}
                                    onChange={(e) => setFormForm({ ...formForm, fieldsJson: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl"
                                >
                                    Save Form Schema
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
