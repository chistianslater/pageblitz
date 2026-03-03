/**
 * BOLD Layout V2 – Handwerk & Industrie
 * Typography: Space Grotesque (headlines) + Plus Jakarta Sans (body)
 * Feel: Strong, industrial, trustworthy, masculine
 * Structure: Full-bleed dark hero, large typography, industrial accents
 */
import { Star, ChevronRight, Play, Shield, Zap, Flower, Award, Clock } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Skeleton Loading Component
function BoldSkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div className="min-h-screen bg-neutral-950 animate-pulse">
      {/* Nav Skeleton */}
      <div className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="h-8 w-32 bg-white/10 rounded" />
        <div className="h-10 w-28 bg-white/10 rounded" />
      </div>
      
      {/* Hero Skeleton */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="space-y-3">
                <div className="h-16 w-full bg-white/10 rounded" />
                <div className="h-16 w-3/4 bg-white/10 rounded" />
                <div className="h-16 w-1/2 bg-white/10 rounded" />
              </div>
              <div className="h-20 w-full max-w-md bg-white/10 rounded" />
              <div className="flex gap-4 pt-4">
                <div className="h-14 w-40 bg-white/10 rounded" />
              </div>
            </div>
            <div className="aspect-[4/5] bg-white/10 rounded-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BoldLayout({ websiteData, cs, heroImageUrl, isLoading }: Props) {
  if (isLoading) {
    return <BoldSkeleton cs={cs} />;
  }

  return (
    <div className="bg-neutral-950 text-white selection:bg-orange-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
        <span className="font-black text-xl md:text-2xl uppercase tracking-tighter italic">{websiteData.businessName}</span>
        <button 
          style={{ backgroundColor: cs.primary }} 
          className="px-4 md:px-8 py-2.5 md:py-3 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform"
        >
          Projekt starten
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div 
          className="absolute right-0 w-full lg:w-1/2 h-full opacity-40 grayscale" 
          style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
        >
          <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <h1 className="text-[12vw] md:text-[10vw] font-black leading-[0.8] uppercase tracking-tighter">
              Build <br/> 
              <span className="italic" style={{ color: cs.primary }}>Beyond</span> <br/> 
              Limits
            </h1>
            <p className="mt-6 md:mt-10 max-w-md text-white/50 text-base md:text-lg">
              {websiteData.tagline}
            </p>
            <div className="mt-8 md:mt-12 flex flex-wrap gap-4">
              <button 
                style={{ backgroundColor: cs.primary }}
                className="px-6 md:px-10 py-4 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform"
              >
                Projekt anfragen
              </button>
              <button className="px-6 md:px-10 py-4 border border-white/30 font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-colors">
                Mehr erfahren
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-10 text-[10vw] md:text-[15vw] font-black opacity-[0.02] select-none pointer-events-none">
          HARDCORE
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { num: "25+", label: "Jahre Erfahrung" },
              { num: "100%", label: "Qualität" },
              { num: "500+", label: "Projekte" },
              { num: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-black" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs md:text-sm uppercase tracking-widest text-white/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
