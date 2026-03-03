/**
 * ELEGANT Layout V2 – Beauty & Lifestyle
 * Typography: Cormorant Garamond (serif headlines) + Jost (body)
 * Feel: Luxurious, airy, feminine, editorial
 * Structure: Split hero, arch imagery, generous whitespace, gold accents
 */
import { Star } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Skeleton Loading Component
function ElegantSkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div className="min-h-screen bg-[#FFFDFB] animate-pulse">
      {/* Header Skeleton */}
      <header className="py-10 text-center">
        <div className="h-4 w-48 bg-neutral-200 rounded mx-auto mb-4" />
        <div className="h-10 w-64 bg-neutral-200 rounded mx-auto" />
      </header>
      
      {/* Hero Skeleton */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[3/4] bg-neutral-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-4 w-24 bg-neutral-200 rounded" />
            <div className="space-y-3">
              <div className="h-12 w-full bg-neutral-200 rounded" />
              <div className="h-12 w-3/4 bg-neutral-200 rounded" />
            </div>
            <div className="h-24 w-full max-w-md bg-neutral-200 rounded" />
            <div className="h-14 w-40 bg-neutral-200 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ElegantLayout({ websiteData, cs, heroImageUrl, isLoading }: Props) {
  const headline = websiteData.sections?.[0]?.headline || "Ihr Weg zu mehr Schönheit";
  const subheadline = websiteData.sections?.[0]?.subheadline || "Erleben Sie erstklassige Behandlungen in luxuriösem Ambiente.";

  if (isLoading) {
    return <ElegantSkeleton cs={cs} />;
  }

  return (
    <div className="bg-[#FFFDFB] text-neutral-900">
      {/* Header */}
      <header className="py-6 md:py-10 text-center px-4">
        <h2 className="uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] font-bold opacity-40 mb-4">
          Est. 2026 — Pure Luxury
        </h2>
        <span className="font-serif italic text-2xl md:text-4xl">{websiteData.businessName}</span>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 md:gap-20 items-center min-h-[70vh] md:min-h-[80vh] pb-12 md:pb-0">
        <div className="relative order-2 lg:order-1">
          <div 
            className="overflow-hidden aspect-[3/4] shadow-2xl rounded-t-full"
            style={{ borderRadius: '50% 50% 0 0 / 30% 30% 0 0' }}
          >
            <img 
              src={heroImageUrl} 
              className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
              alt=""
            />
          </div>
          <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-xl animate-pulse">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" className="text-yellow-500" />
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-800">Kunden-Favorit</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight italic font-light mb-6 md:mb-8">
            {headline}
          </h1>
          <p className="text-base md:text-lg text-neutral-500 font-light leading-relaxed mb-8 md:mb-12 max-w-md">
            {subheadline}
          </p>
          <button 
            style={{ backgroundColor: cs.primary }} 
            className="px-8 md:px-12 py-4 md:py-5 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg"
          >
            Termin buchen
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "15+", label: "Jahre Expertise" },
              { num: "50k+", label: "Zufriedene Kunden" },
              { num: "4.9", label: "Sterne Bewertung" },
              { num: "100%", label: "Premium-Produkte" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 md:p-6">
                <p className="text-3xl md:text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
