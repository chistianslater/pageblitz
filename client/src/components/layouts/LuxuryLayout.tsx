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
function LuxurySkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div className="min-h-screen bg-black animate-pulse">
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-neutral-800" />
        <div className="relative z-10 text-center px-6 max-w-4xl w-full">
          <div className="flex justify-center mb-8">
            <div className="h-5 w-5 bg-white/20 rounded mr-4" />
            <div className="h-0.5 w-12 bg-white/20" />
            <div className="h-5 w-5 bg-white/20 rounded ml-4" />
          </div>
          <div className="space-y-4">
            <div className="h-16 md:h-24 w-3/4 bg-white/10 rounded mx-auto" />
          </div>
          <div className="mt-8 h-14 w-48 bg-white/10 rounded-full mx-auto" />
        </div>
      </section>
    </div>
  );
}

export default function LuxuryLayout({ websiteData, cs, heroImageUrl, isLoading }: Props) {
  if (isLoading) {
    return <LuxurySkeleton cs={cs} />;
  }

  return (
    <div className="bg-black text-white selection:bg-yellow-500">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 md:px-6">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <div className="flex justify-center items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="h-[1px] w-8 md:w-12 bg-white/30" />
            <Shield size={16} className="text-yellow-500 md:w-5 md:h-5" />
            <div className="h-[1px] w-8 md:w-12 bg-white/30" />
          </div>
          <h1 className="font-serif italic text-[10vw] md:text-[8vw] leading-none mb-8 md:mb-12">
            Beyond Perfection
          </h1>
          <p className="text-white/60 text-base md:text-lg mb-8 md:mb-12 max-w-md mx-auto">
            {websiteData.tagline}
          </p>
          <button 
            style={{ backgroundColor: cs.primary }} 
            className="px-8 md:px-16 py-4 md:py-6 rounded-full text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-white transition-all hover:scale-105"
          >
            Experience the Unrivaled
          </button>
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
