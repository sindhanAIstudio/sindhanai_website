"use client";

import { useState } from "react";
import {
    Calendar as CalendarIcon,
    CheckCircle,
    XCircle,
    Star,
    Sparkle,
    Clock,
    DeviceMobile,
    Info,
    CalendarBlank
} from "@phosphor-icons/react";

interface StudentAttendanceClientProps {
    student: any;
    records: any[];
    holidays: any[];
}

export default function StudentAttendanceClient({
    student,
    records,
    holidays,
}: StudentAttendanceClientProps) {
    const [currentDate] = useState(new Date());

    // Generate current month days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Helper to get record for a specific date (YYYY-MM-DD)
    const getDayStatus = (dayNum: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

        const holiday = holidays.find((h) => h.date === dateStr);
        if (holiday) {
            return { type: "HOLIDAY", title: holiday.title };
        }

        const dayRecords = records.filter((r) => r.date === dateStr);
        if (dayRecords.length > 0) {
            const hasSpecial = dayRecords.find((r) => r.category === "SPECIAL_ACTIVITY");
            const hasEvent = dayRecords.find((r) => r.category === "EVENT");
            const regular = dayRecords.find((r) => r.category === "REGULAR" || !r.category);

            if (hasEvent) {
                return {
                    type: "EVENT",
                    title: hasEvent.sessionTitle,
                    inTime: hasEvent.inTime,
                    outTime: hasEvent.outTime,
                };
            }
            if (hasSpecial) {
                return {
                    type: "SPECIAL_ACTIVITY",
                    title: "Special Evening Activity",
                    inTime: hasSpecial.inTime,
                    outTime: hasSpecial.outTime,
                };
            }
            if (regular) {
                return {
                    type: "PRESENT",
                    title: regular.sessionTitle,
                    inTime: regular.inTime,
                    outTime: regular.outTime,
                };
            }
        }

        // Sunday check
        const d = new Date(year, month, dayNum);
        if (d.getDay() === 0) {
            return { type: "SUNDAY", title: "Sunday Off" };
        }

        // Past day check
        if (d < new Date(new Date().setHours(0, 0, 0, 0))) {
            return { type: "ABSENT", title: "Unattended Day" };
        }

        return { type: "UPCOMING", title: "Scheduled Class" };
    };

    // Calculate percentage
    const attendedDays = new Set(records.map((r) => r.date)).size;
    const totalWorkingDaysPassed = Math.max(1, attendedDays + records.filter(r => r.status === "ABSENT").length);
    const percentage = Math.round((attendedDays / totalWorkingDaysPassed) * 100);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">

            {/* Top Student Header Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
                        <Sparkle className="w-3.5 h-3.5 text-amber-400" /> Student Attendance Portal
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">{student.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-indigo-200 font-semibold">
                        <span>Roll: <strong className="text-white">{student.rollNumber || "N/A"}</strong></span>
                        <span>Domain: <strong className="text-white">{student.soiDomain || "General"}</strong></span>
                        <span>Batch: <strong className="text-white">{student.batch || "2025"}</strong></span>
                    </div>
                </div>

                {/* Score & Device Status */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
                    <div className="text-center px-3 border-r border-white/10">
                        <div className="text-3xl font-black text-emerald-400">{percentage}%</div>
                        <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Attendance %</div>
                    </div>
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-indigo-100 font-bold">
                            <DeviceMobile className="w-4 h-4 text-emerald-400" />
                            <span>{student.deviceFingerprint ? "Registered Device" : "Device Unbound"}</span>
                        </div>
                        <p className="text-[10px] text-indigo-300">
                            {student.deviceFingerprint ? "Hardware Locked" : "Scan to bind phone"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Legend Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-extrabold">
                <span className="text-slate-500">Legend:</span>
                <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Present (Regular)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Special Activity</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span>Special Event</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span>Absent</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                    <span>Holiday</span>
                </div>
            </div>

            {/* Interactive Calendar Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-base font-black text-slate-900">
                            {monthNames[month]} {year}
                        </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Hover over any day for IN/OUT times</span>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                        <div key={day} className={`text-xs font-black uppercase tracking-wider py-2 ${idx === 0 ? "text-rose-500" : "text-slate-400"}`}>
                            {day}
                        </div>
                    ))}

                    {/* Empty Slots before month starts */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-16 rounded-2xl bg-slate-50/50"></div>
                    ))}

                    {/* Month Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const statusInfo = getDayStatus(dayNum);

                        let bgStyle = "bg-slate-50 border-slate-200/60 text-slate-700";
                        let badgeIcon = null;

                        if (statusInfo.type === "PRESENT") {
                            bgStyle = "bg-emerald-50 border-emerald-200 text-emerald-900";
                            badgeIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
                        } else if (statusInfo.type === "SPECIAL_ACTIVITY") {
                            bgStyle = "bg-amber-50 border-amber-200 text-amber-900";
                            badgeIcon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
                        } else if (statusInfo.type === "EVENT") {
                            bgStyle = "bg-indigo-50 border-indigo-200 text-indigo-900";
                            badgeIcon = <Star className="w-3.5 h-3.5 text-indigo-600" />;
                        } else if (statusInfo.type === "HOLIDAY") {
                            bgStyle = "bg-sky-50 border-sky-200 text-sky-900";
                            badgeIcon = <CalendarBlank className="w-3.5 h-3.5 text-sky-600" />;
                        } else if (statusInfo.type === "ABSENT") {
                            bgStyle = "bg-rose-50 border-rose-200 text-rose-900";
                            badgeIcon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
                        }

                        return (
                            <div
                                key={dayNum}
                                className={`relative group h-16 rounded-2xl border p-2 flex flex-col justify-between transition-all hover:scale-[1.03] cursor-pointer shadow-xs ${bgStyle}`}
                            >
                                <div className="flex items-center justify-between text-xs font-black">
                                    <span>{dayNum}</span>
                                    {badgeIcon}
                                </div>

                                <div className="text-[10px] font-extrabold truncate text-left opacity-80">
                                    {statusInfo.title}
                                </div>

                                {/* HOVER CARD POPUP WITH IN/OUT TIMES */}
                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white rounded-2xl p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity space-y-1.5 text-left">
                                    <div className="text-[11px] font-black text-indigo-300 flex items-center justify-between">
                                        <span>{monthNames[month]} {dayNum}, {year}</span>
                                        <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-white/10">{statusInfo.type}</span>
                                    </div>
                                    <div className="text-xs font-bold text-white truncate">{statusInfo.title}</div>

                                    {(statusInfo.inTime || statusInfo.outTime) ? (
                                        <div className="pt-1 border-t border-slate-800 text-[10px] space-y-0.5 text-slate-300 font-medium">
                                            <div className="flex justify-between">
                                                <span>IN Time:</span>
                                                <strong className="text-emerald-400 font-mono">{statusInfo.inTime || "09:00 AM"}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>OUT Time:</span>
                                                <strong className="text-amber-400 font-mono">{statusInfo.outTime || "05:00 PM"}</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                                            No timestamps recorded
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
