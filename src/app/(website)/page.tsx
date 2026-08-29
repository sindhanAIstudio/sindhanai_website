import Link from "next/link";
import Image from "next/image";
import MeshGradientCanvas from "@/components/MeshGradientCanvas";
import IndustryTicker from "@/components/IndustryTicker";
import HighlightFeatures from "@/components/HighlightFeatures";
import ExpertiseExecution from "@/components/ExpertiseExecution";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import ExecutionWorkflow from "@/components/ExecutionWorkflow";
import WhyPartnerSection from "@/components/WhyPartnerSection";
import BrandTicker from "@/components/BrandTicker";
import CTASection from "@/components/CTASection";
import {
  Sparkle,
  ArrowRight,
  Handshake,
  Play,
  Star,
} from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <main className="w-full">
      <section className="px-0 sm:px-6 lg:px-8 pt-0 pb-0">
        <div
          className="relative rounded-none sm:rounded-xl lg:rounded-2xl overflow-hidden"
          style={{ minHeight: "calc(100vh - 110px)", backgroundColor: "#7783F5" }}
        >
          <MeshGradientCanvas />

          <div
            className="relative z-10 h-full flex items-center pt-32 sm:pt-36 lg:pt-40 pb-14 sm:pb-16 lg:pb-24 px-5 sm:px-10 lg:px-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
              <div className="lg:col-span-7 space-y-5 sm:space-y-6 lg:space-y-7">
                <div className="inline-flex items-center gap-2 px-3.5 sm:px-4.5 py-1.5 rounded-[12px] border border-white/40 bg-black/25 backdrop-blur-md text-white text-xs sm:text-sm font-semibold cursor-default">
                  <Sparkle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300" weight="fill" />
                  <span className="text-white font-semibold tracking-wide">
                    Industry Experts. Faculty. Students.
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-[68px] font-bold leading-[1.1] tracking-tight"
                  style={{ fontFamily: "'Manrope', 'Google Sans', system-ui, sans-serif", color: "#ffffff" }}
                >
                  KGISL&#39;s Applied AI{" "}
                  <br className="hidden sm:block" />
                  and Technology Lab
                </h1>

                <p className="text-base sm:text-[19px] max-w-[560px] leading-relaxed font-normal" style={{ color: "rgba(255,255,255,0.90)" }}>
                  We bring together industry professionals, faculty, and students from our AI and Generative AI labs to work on real technology problems — building skills and delivering solutions that matter.
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 bg-black hover:bg-slate-900 text-white font-semibold text-sm sm:text-[15px] px-5 sm:px-6 py-2.5 sm:py-[11px] rounded-[10px] shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    Explore Services
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-black/25 hover:bg-black/40 text-white font-semibold text-sm sm:text-[15px] px-5 sm:px-6 py-2.5 sm:py-[11px] rounded-[10px] border border-white/30 hover:border-white/50 backdrop-blur-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Handshake weight="bold" className="w-4 h-4" />
                    Partner With Us
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
                <div className="w-full max-w-[350px] space-y-4">
                  <div className="relative rounded-[18px] overflow-hidden bg-slate-900 aspect-[16/9] shadow-2xl border border-white/20 group">
                    <Image
                      src="/images/sindhanai/bg-video-office-poster-1.webp"
                      alt="Sindhanai AI Workplace"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[68px] h-[68px] rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                        <Play weight="fill" className="w-6 h-6 text-slate-900 translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between text-sm text-white/90 px-1">
                    <p className="italic text-white/75 max-w-[200px] leading-snug text-[13px]">
                      &ldquo;Sindhanai team is by far the best support product I have ever used.&rdquo;
                    </p>
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-0.5 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} weight="fill" className="w-3 h-3 text-white/80" />
                        ))}
                      </div>
                      <span className="text-[12px] font-semibold text-white/80 tracking-wide">200+ Reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <IndustryTicker />
      <HighlightFeatures />
      <ExpertiseExecution />
      <CapabilitiesSection />
      <ExecutionWorkflow />
      <WhyPartnerSection />
      <BrandTicker />
      <CTASection />
    </main>
  );
}
