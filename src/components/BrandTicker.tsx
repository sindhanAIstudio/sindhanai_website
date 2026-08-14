"use client";

import React from "react";

const grayIconSVGs = [
    <svg key="pie" width="30" height="30" viewBox="2 2 20 20" fill="none"><path d="M14,5 C18.6217603,5 22,8.72093463 22,13.5 C22,18.1944204 18.1944204,22 13.5,22 C8.72093463,22 5,18.6217603 5,14 C5,13.4477153 5.44771525,13 6,13 L12,13 C12.5522847,13 13,12.5522847 13,12 L13,6 C13,5.48716416 13.3860402,5.06449284 13.8833789,5.00672773 Z M10.1,2 C10.5970563,2 11,2.40294373 11,2.9 L11,10.1 C11,10.5970563 10.5970563,11 10.1,11 L2.9,11 C2.40294373,11 2,10.5970563 2,10.1 C2,5.62649353 5.62649353,2 10.1,2 Z" fill="currentColor" /></svg>,
    <svg key="chat" width="30" height="30" viewBox="2 2 20 20" fill="none"><path d="M19,3 C20.6568542,3 22,4.34314575 22,6 L22,15 C22,16.6568542 20.6568542,18 19,18 L9.60555128,18 C9.40812629,18 9.2151186,18.058438 9.05085108,18.1679497 L5.10940039,20.7955835 C4.19034302,21.4082884 2.94860433,21.1599407 2.33589941,20.2408833 C2.11687605,19.9123483 2,19.5263329 2,19.1314829 L2,6 C2,4.34314575 3.34314575,3 5,3 Z M16.8479983,11.2200011 C16.555288,10.7516645 15.9383376,10.6092914 15.4700011,10.9020017 C13.1276047,12.3659994 10.8723953,12.3659994 8.52999894,10.9020017 C8.06166241,10.6092914 7.44471203,10.7516645 7.1520017,11.2200011 C6.85929136,11.6883376 7.00166453,12.305288 7.47000106,12.5979983 C10.460938,14.4673339 13.539062,14.4673339 16.5299989,12.5979983 C16.9983355,12.305288 17.1407086,11.6883376 16.8479983,11.2200011 Z" fill="currentColor" /></svg>,
    <svg key="head" width="30" height="30" viewBox="2 2 20 20" fill="none"><path d="M12,3 C16.9845709,3 21,7.26639337 21,12.5 C21,13.6590398 20.8868432,14.6387594 20.6279059,15.626011 L20.1464355,17.0843092 C19.1652629,19.3462497 C18.5983213,20.654185 17.0784333,21.2548791 15.7704979,20.6879375 C14.4625626,20.1209959 13.8618685,18.6011078 14.4288101,17.2931725 L15.6864721,14.3917442 C16.2534137,13.0838089 17.7733017,12.4831148 19.081237,13.0500564 C19,8.34476588 15.8519851,5 12,5 C8.14799072,5 4.99989551,8.34479081 4.99989551,12.5 C6.30911808,12.4953533 7.80406248,13.0970538 8.36526291,14.3917442 L9.62292483,17.2931725 C10.1898664,18.6011078 9.58917235,20.1209959 8.28123704,20.6879375 C6.97330172,21.2548791 5.45341375,20.654185 4.88647207,19.3462497 C4.25452551,18.0590139 3.14645044,14.9243589 2.99989551,12.5 C2.99989551,7.2664108 7.01541342,3 12,3 Z" fill="currentColor" /></svg>,
    <svg key="switch" width="30" height="30" viewBox="2 2 20 20" fill="none"><path d="M15.5,2 C17.9852814,2 20,4.01471863 20,6.5 C20,8.98528137 17.9852814,11 15.5,11 L8.5,11 C6.01471863,11 4,8.98528137 4,6.5 C4,4.01471863 6.01471863,2 8.5,2 Z M8.5,4 C7.11928813,4 6,5.11928813 6,6.5 C6,7.88071187 7.11928813,9 8.5,9 C9.88071187,9 11,7.88071187 11,6.5 C11,5.11928813 9.88071187,4 8.5,4 Z M8.5,22 C6.01471863,22 4,19.9852814 4,17.5 C4,15.0147186 6.01471863,13 8.5,13 L15.5,13 C17.9852814,13 20,15.0147186 20,17.5 C20,19.9852814 17.9852814,22 15.5,22 Z M15.5,15 C14.1192881,15 13,16.1192881 13,17.5 C13,18.8807119 14.1192881,20 15.5,20 C16.8807119,20 18,18.8807119 18,17.5 C18,16.1192881 16.8807119,15 15.5,15 Z" fill="currentColor" /></svg>,
    <svg key="lock" width="30" height="30" viewBox="2 2 20 20" fill="none"><path d="M12,2 C14.7614237,2 17,4.23857625 17,7 L17,9 C18.6568542,9 20,10.3431458 20,12 L20,19 C20,20.6568542 18.6568542,22 17,22 L7,22 C5.34314575,22 4,20.6568542 4,19 L4,12 C4,10.3431458 5.34314575,9 7,9 L7,7 C7,4.23857625 9.23857625,2 12,2 Z M12,4 C10.3431458,4 9,5.34314575 9,7 L9,9 L15,9 L15,7 C15,5.34314575 13.6568542,4 12,4 Z" fill="currentColor" /></svg>,
    <svg key="rainbow" width="30" height="30" viewBox="2 2 20 20" fill="none"><path d="M12,6 C18.0751322,6 23,10.9248678 23,17 C23,17.5522847 22.5522847,18 22,18 C21.4477153,18 21,17.5522847 21,17 C21,12.0294373 16.9705627,8 12,8 C7.02943725,8 3,12.0294373 3,17 C3,17.5522847 2.55228475,18 2,18 C1.44771525,18 1,17.5522847 1,17 C1,10.9248678 5.92486775,6 12,6 Z M12,10 C15.8659932,10 19,13.1340068 19,17 C19,17.5522847 18.5522847,18 18,18 C17.4477153,18 17,17.5522847 17,17 C17,14.2385763 14.7614237,12 12,12 C9.23857625,12 7,14.2385763 7,17 C7,17.5522847 6.55228475,18 6,18 C5.44771525,18 5,17.5522847 5,17 C5,13.1340068 8.13400675,10 12,10 Z M12,14 C13.6568542,14 15,15.3431458 15,17 C15,17.5522847 14.5522847,18 14,18 L10,18 C9.44771525,18 9,17.5522847 9,17 C9,15.3431458 10.3431458,14 12,14 Z" fill="currentColor" /></svg>,
];

const GreenCheckSVG = () => (
    <svg width="30" height="30" viewBox="2 2 20 20" fill="none">
        <path d="M12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M16.7071068,8.29289322 C16.3165825,7.90236893 15.6834175,7.90236893 15.2928932,8.29289322 L10.5,13.085 L8.70710678,11.2928932 C8.31658249,10.9023689 7.68341751,10.9023689 7.29289322,11.2928932 C6.90236893,11.6834175 6.90236893,12.3165825 7.29289322,12.7071068 L9.79289322,15.2071068 C10.1834175,15.5976311 10.8165825,15.5976311 11.2071068,15.2071068 L16.7071068,9.70710678 C17.0976311,9.31658249 17.0976311,8.68341751 16.7071068,8.29289322 Z" fill="#43E55F" />
    </svg>
);

// Repeating list 4 times ensures seamless infinite scroll loop with identical gap spacing
const grayList = [...grayIconSVGs, ...grayIconSVGs, ...grayIconSVGs, ...grayIconSVGs];
const greenList = Array(24).fill(null);

export default function BrandTicker() {
    return (
        <section className="w-full bg-white py-6">
            <style>{`
                @keyframes scroll-ltr-loop {
                    0%   { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                }
                .ticker-marquee-ltr {
                    animation: scroll-ltr-loop 20s linear infinite;
                    will-change: transform;
                }
            `}</style>

            <div
                className="mx-auto rounded-2xl overflow-hidden w-full"
                style={{ background: "#f0efeb" }}
            >
                {/* <p className="text-center text-sm font-semibold text-slate-500 pt-5 pb-3" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
                    Trusted by institutions and organisations across India
                </p> */}
                <div className="pb-5" />
                <div className="relative flex items-center h-[90px] overflow-hidden">
                    {/* Left marquee (Gray icons moving LTR into SINDHANAI) */}
                    <div className="w-1/2 overflow-hidden flex items-center" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
                        <div className="flex items-center gap-10 pr-10 ticker-marquee-ltr" style={{ width: "max-content" }}>
                            {grayList.map((svg, i) => (
                                <span key={`g-${i}`} className="flex-shrink-0 text-slate-400 flex items-center">
                                    {svg}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Centered SINDHANAI Badge - Bigger size, NO shadow */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-slate-900 shadow-none border border-slate-800"
                        style={{ whiteSpace: "nowrap" }}
                    >
                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#0f172a" />
                            </svg>
                        </div>
                        <span className="text-base sm:text-lg font-black text-white tracking-tight">SINDHANAI</span>
                    </div>

                    {/* Right marquee (Green checkmarks moving LTR out from SINDHANAI) */}
                    <div className="w-1/2 overflow-hidden flex items-center" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
                        <div className="flex items-center gap-10 pr-10 ticker-marquee-ltr" style={{ width: "max-content" }}>
                            {greenList.map((_, i) => (
                                <span key={`ck-${i}`} className="flex-shrink-0 flex items-center">
                                    <GreenCheckSVG />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pb-5" />
            </div>
        </section>
    );
}
