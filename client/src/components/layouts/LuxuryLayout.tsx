/**
 * LUXURY Layout V2 – Automotive & High-End
 * Typography: Playfair Display (serif headlines) + Inter (body)
 * Feel: Exclusive, premium, sophisticated, cinematic
 * Structure: Full-screen hero, dramatic overlays, elegant details
 */
import { Shield } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Skeleton Loading Component
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-md ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function LuxuryLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  return (
    <div className="bg-black text-white selection:bg-yellow-500 font-tenor grain-overlay">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 md:px-6 overflow-hidden">
        <Skeleton isLoading={isLoading} className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-0 opacity-60">
            <img src={heroImageUrl} className="w-full h-full object-cover grayscale hover:scale-110 transition-transform duration-[3s]" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-black" />
          </div>
        </Skeleton>
        <div className="relative z-10 max-w-4xl">
          <div className="flex justify-center items-center gap-4 mb-10">
            <div className="h-[1px] w-12 bg-white/40" />
            <Shield size={20} className="text-yellow-500" />
            <div className="h-[1px] w-12 bg-white/40" />
          </div>
          <Skeleton isLoading={isLoading} className="w-3/4 h-24 md:h-48 mx-auto mb-10">
            <h1 className="font-serif italic text-[14vw] md:text-[10vw] leading-[0.8] mb-12">
              Beyond <br/> Perfection
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-1/2 h-16 mx-auto mb-8">
            <p className="text-white/60 text-base md:text-lg mb-8 md:mb-12 max-w-md mx-auto">
              {websiteData.tagline}
            </p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-14 mx-auto">
            <button 
              style={{ backgroundColor: cs.primary }} 
              className="px-8 md:px-16 py-4 md:py-6 rounded-full text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-white transition-all hover:scale-105"
            >
              Experience the Unrivaled
            </button>
          </Skeleton>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { num: "01", label: "Exklusivität" },
              { num: "02", label: "Präzision" },
              { num: "03", label: "Exzellenz" },
              { num: "04", label: "Heritage" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-5xl font-serif italic text-white/20">{stat.num}</p>
                <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/60 mt-3 md:mt-4">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
