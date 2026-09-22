"use client";

import Link from "next/link";
import {
    ArrowLeft,
    GraduationCap,
    MapPin,
    EnvelopeSimple,
    LinkedinLogo,
    GithubLogo,
    TwitterLogo,
    Quotes,
    Briefcase,
    Sparkle,
    CheckCircle,
    FileText,
    PlayCircle,
    PhoneCall,
    Code,
    Article,
    SlackLogo,
    Database,
    User,
} from "@phosphor-icons/react";
import { TeamMember } from "@/data/teamData";
import BrandTicker from "@/components/BrandTicker";
import CTASection from "@/components/CTASection";

export default function TeamProfileClientView({ member }: { member: TeamMember }) {
    const scope = member.scopeData;

    return (
        <div className="w-full space-y-12 py-8 md:py-14">

            {/* Back Button & Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/team"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 font-bold text-xs shadow-2xs hover:shadow-xs transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to All Team Members
                </Link>
            </div>

            {/* Main Profile Header Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">

                        {/* Avatar Column (4 Cols) */}
                        <div className="md:col-span-4 flex justify-center md:justify-start">
                            <div className="relative">
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0F172A&color=fff&size=300`;
                                    }}
                                    className="w-40 h-40 md:w-52 md:h-52 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
                                />
                                <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                                    Active Fellow
                                </div>
                            </div>
                        </div>

                        {/* Information Column (8 Cols) */}
                        <div className="md:col-span-8 space-y-5 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                                    <Sparkle className="w-3.5 h-3.5 text-white" /> {member.category}
                                </div>
                                {scope?.empId && (
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/30 backdrop-blur-md border border-indigo-400/40 text-indigo-100 text-xs font-extrabold uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5 text-indigo-300" /> Emp ID: {scope.empId}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                    {member.name}
                                </h1>
                                <p className="text-lg sm:text-xl font-semibold text-indigo-200 mt-1">
                                    {member.role}
                                </p>
                            </div>

                            <p className="text-sm sm:text-base text-white/80 max-w-2xl font-medium leading-relaxed">
                                {member.bio}
                            </p>

                            {/* Location & Lab Meta */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-1 text-xs text-white/70 font-semibold">
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-indigo-300" />
                                    <span>{member.lab}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-indigo-300" />
                                    <span>{member.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4 text-indigo-300" />
                                    <span>{member.experience} Experience</span>
                                </div>
                            </div>

                            {/* Quick Action CV / Intro Video Buttons */}
                            {(scope?.onePageCv || scope?.selfIntroVideo) && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                                    {scope?.onePageCv && scope.onePageCv.startsWith("http") && (
                                        <a
                                            href={scope.onePageCv}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-indigo-50 font-extrabold text-xs inline-flex items-center gap-2 transition-all shadow-md"
                                        >
                                            <FileText className="w-4 h-4 text-indigo-600" weight="bold" /> View One-Page CV
                                        </a>
                                    )}
                                    {scope?.selfIntroVideo && scope.selfIntroVideo.startsWith("http") && (
                                        <a
                                            href={scope.selfIntroVideo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs inline-flex items-center gap-2 transition-all shadow-md border border-indigo-400/40"
                                        >
                                            <PlayCircle className="w-4.5 h-4.5 text-white" weight="fill" /> Watch Self Intro Video
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Social & Platform Links */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-3">
                                {member.email && (
                                    <a
                                        href={`mailto:${member.email}`}
                                        className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center gap-2 text-white text-xs font-bold transition-all"
                                        title="Email"
                                    >
                                        <EnvelopeSimple className="w-4 h-4" />
                                        <span className="hidden sm:inline">{member.email}</span>
                                    </a>
                                )}
                                {scope?.phone && (
                                    <a
                                        href={`tel:${scope.phone}`}
                                        className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center gap-2 text-white text-xs font-bold transition-all"
                                        title="Phone"
                                    >
                                        <PhoneCall className="w-4 h-4" />
                                        <span className="hidden sm:inline">{scope.phone}</span>
                                    </a>
                                )}
                                {member.social.linkedin && (
                                    <a
                                        href={member.social.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
                                        title="LinkedIn"
                                    >
                                        <LinkedinLogo className="w-4.5 h-4.5" />
                                    </a>
                                )}
                                {member.social.github && (
                                    <a
                                        href={member.social.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
                                        title="GitHub"
                                    >
                                        <GithubLogo className="w-4.5 h-4.5" />
                                    </a>
                                )}
                                {member.social.twitter && member.social.twitter !== "-" && (
                                    <a
                                        href={member.social.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
                                        title="Twitter / X"
                                    >
                                        <TwitterLogo className="w-4.5 h-4.5" />
                                    </a>
                                )}
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* Profile Content Body */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Stats & Technical Skills (5 Cols) */}
                    <div className="lg:col-span-5 space-y-8">

                        {/* Subject Experience Breakdown (for SCOPE Faculty) */}
                        {scope && (
                            <div className="bg-white rounded-[28px] border border-slate-200/80 p-7 space-y-5 shadow-xs">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                    Teaching & Work Experience
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                                        <span className="block text-[11px] font-bold text-slate-500">Overall Work Exp</span>
                                        <span className="text-base font-black text-slate-950 mt-0.5 block">{scope.workExperience || "N/A"}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                                        <span className="block text-[11px] font-bold text-slate-500">Python Teaching</span>
                                        <span className="text-base font-black text-slate-950 mt-0.5 block">{scope.pythonExperience || "-"}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                                        <span className="block text-[11px] font-bold text-slate-500">C Programming</span>
                                        <span className="text-base font-black text-slate-950 mt-0.5 block">{scope.cProgrammingExperience || "-"}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                                        <span className="block text-[11px] font-bold text-slate-500">DSA / Design Thinking</span>
                                        <span className="text-base font-black text-slate-950 mt-0.5 block">{scope.dsaDesignThinkingExperience || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Impact Stats Grid */}
                        <div className="bg-white rounded-[28px] border border-slate-200/80 p-7 space-y-5 shadow-xs">
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                Track Record & Impact
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                                    <div className="text-3xl font-black text-indigo-950">
                                        {member.stats.projectsCount}+
                                    </div>
                                    <div className="text-xs font-bold text-indigo-700 mt-1">
                                        Projects Delivered
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                                    <div className="text-3xl font-black text-amber-950">
                                        {member.stats.yearsExp}
                                    </div>
                                    <div className="text-xs font-bold text-amber-700 mt-1">
                                        Years Experience
                                    </div>
                                </div>

                                {member.stats.papersOrPatents !== undefined && (
                                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 col-span-2">
                                        <div className="text-3xl font-black text-emerald-950">
                                            {member.stats.papersOrPatents}
                                        </div>
                                        <div className="text-xs font-bold text-emerald-700 mt-1">
                                            Research Publications / Patents
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Technical Stack / Skills */}
                        <div className="bg-white rounded-[28px] border border-slate-200/80 p-7 space-y-4 shadow-xs">
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                Primary Expertise & Tools
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                {member.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Developer & Coding Profiles Card */}
                        {scope && (scope.leetcode || scope.hackerrank || scope.medium || scope.slack || scope.kaggle) && (
                            <div className="bg-white rounded-[28px] border border-slate-200/80 p-7 space-y-4 shadow-xs">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                    Coding & Developer Profiles
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {scope.leetcode && scope.leetcode.startsWith("http") && (
                                        <a
                                            href={scope.leetcode}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-2 transition-all"
                                        >
                                            <Code className="w-4 h-4 text-amber-600" weight="bold" /> LeetCode
                                        </a>
                                    )}
                                    {scope.hackerrank && scope.hackerrank.startsWith("http") && (
                                        <a
                                            href={scope.hackerrank}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-2 transition-all"
                                        >
                                            <Code className="w-4 h-4 text-emerald-600" weight="bold" /> HackerRank
                                        </a>
                                    )}
                                    {scope.medium && scope.medium.startsWith("http") && (
                                        <a
                                            href={scope.medium}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-2 transition-all"
                                        >
                                            <Article className="w-4 h-4 text-slate-800" weight="bold" /> Medium
                                        </a>
                                    )}
                                    {scope.slack && scope.slack.startsWith("http") && (
                                        <a
                                            href={scope.slack}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-2 transition-all"
                                        >
                                            <SlackLogo className="w-4 h-4 text-rose-600" weight="bold" /> Slack Workspace
                                        </a>
                                    )}
                                    {scope.kaggle && scope.kaggle.startsWith("http") && (
                                        <a
                                            href={scope.kaggle}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-2 transition-all"
                                        >
                                            <Database className="w-4 h-4 text-sky-600" weight="bold" /> Kaggle
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Bio, Quote, Asset Cards, Highlights (7 Cols) */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Full Bio */}
                        <div className="bg-white rounded-[28px] border border-slate-200/80 p-8 space-y-4 shadow-xs">
                            <h2 className="text-2xl font-extrabold text-slate-950">
                                About {member.name.split(" ")[0]}
                            </h2>
                            <p className="text-base text-slate-700 leading-relaxed font-medium">
                                {member.fullBio}
                            </p>
                        </div>

                        {/* Self Introduction Video Showcase Box */}
                        {scope?.selfIntroVideo && scope.selfIntroVideo.startsWith("http") && (
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-[28px] p-8 text-white space-y-4 shadow-lg border border-indigo-800/40 relative overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/50 backdrop-blur-md flex items-center justify-center border border-indigo-400/30">
                                        <PlayCircle className="w-7 h-7 text-white" weight="fill" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-white">Self Introduction Video</h3>
                                        <p className="text-xs text-indigo-200 font-medium">Watch personal introduction and teaching vision</p>
                                    </div>
                                </div>
                                <p className="text-xs text-white/70 font-medium">
                                    Faculty mentor introduction video recorded for SindhanAI SCOPE program.
                                </p>
                                <a
                                    href={scope.selfIntroVideo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-indigo-50 font-extrabold text-xs transition-all shadow-md"
                                >
                                    <PlayCircle className="w-4 h-4 text-indigo-600" weight="fill" /> Watch Video Presentation
                                </a>
                            </div>
                        )}

                        {/* One-Page CV Showcase Box */}
                        {scope?.onePageCv && scope.onePageCv.startsWith("http") && (
                            <div className="bg-slate-50 rounded-[28px] p-8 border border-slate-200/90 space-y-4 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                        <FileText className="w-6 h-6" weight="bold" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-950">Faculty One-Page CV</h3>
                                        <p className="text-xs text-slate-500 font-medium">Verified academic resume & credentials document</p>
                                    </div>
                                </div>
                                <a
                                    href={scope.onePageCv}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-slate-800 font-extrabold text-xs transition-all shadow-xs"
                                >
                                    <FileText className="w-4 h-4 text-indigo-300" weight="bold" /> Open Google Drive Resume
                                </a>
                            </div>
                        )}

                        {/* Inspiring Quote (if present) */}
                        {member.quote && (
                            <div className="bg-slate-900 text-white rounded-[28px] p-8 space-y-3 relative overflow-hidden shadow-md">
                                <Quotes className="w-10 h-10 text-indigo-400 opacity-40 absolute top-4 right-4" weight="fill" />
                                <p className="text-lg font-bold italic text-indigo-100 relative z-10">
                                    &ldquo;{member.quote}&rdquo;
                                </p>
                                <div className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
                                    — Personal Philosophy
                                </div>
                            </div>
                        )}

                        {/* Key Highlights */}
                        <div className="bg-white rounded-[28px] border border-slate-200/80 p-8 space-y-6 shadow-xs">
                            <h3 className="text-xl font-extrabold text-slate-950">
                                Key Projects & Contributions
                            </h3>

                            <div className="space-y-4">
                                {member.highlights.map((h, i) => (
                                    <div
                                        key={i}
                                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2"
                                    >
                                        <div className="flex items-center gap-2 text-base font-extrabold text-slate-950">
                                            <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" weight="fill" />
                                            <span>{h.title}</span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600 pl-7 leading-relaxed">
                                            {h.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            <BrandTicker />
            <CTASection />

        </div>
    );
}

