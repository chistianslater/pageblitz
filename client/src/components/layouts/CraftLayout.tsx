/**
 * CRAFT Layout V2 – Manufacturing & Handwerk
 * Typography: Space Grotesque (headlines) + Inter (body)
 * Feel: Authentic, robust, precision-focused, artisanal
 * Structure: Split layout, industrial accents, strong typography
 */
import { Zap } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Skeleton Loading Component
function CraftSkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div className="min-h-screen bg-[#f2f2f2] animate-pulse">
      <section className="grid lg:grid-cols-2 min-h-screen">
        <div className="p-8 md:p-12 lg:p-24 flex flex-col justify-center">
          <div className="h-10 w-10 bg-neutral-300 rounded mb-6 md:mb-8" />
          <div className="space-y-3 mb-6 md:mb-8">
            <div className="h-12 md:h-16 w-full bg-neutral-300 rounded" />
            <div className="h-12 md:h-16 w-4/5 bg-neutral-300 rounded" />
          </div>
          <div className="h-16 w-full max-w-md bg-neutral-300 rounded mb-6 md:mb-12" />
          <div className="grid grid-cols-2 gap-4 md:gap-8 py-6 md:py-8 border-y border-neutral-200 mb-6 md:mb-12">
            <div>
              <div className="h-8 w-16 bg-neutral-300 rounded mb-2" />
              <div className="h-3 w-24 bg-neutral-300 rounded" />
            </div>
            <div>
              <div className="h-8 w-16 bg-neutral-300 rounded mb-2" />
              <div className="h-3 w-24 bg-neutral-300 rounded" />
            </div>
          </div>
          <div className="h-12 w-36 bg-neutral-300 rounded" />
        </div>
        <div className="hidden lg:block bg-neutral-300" />
      </section>
    </div>
  );
}

export default function CraftLayout({ websiteData, cs, heroImageUrl, isLoading }: Props) {
  const subheadline = websiteData.sections?.[0]?.subheadline || "Präzision und Qualität aus Meisterhand.";

  if (isLoading) {
    return <CraftSkeleton cs={cs} />;
  }

  return (
    <div className="bg-[#f2f2f2] text-neutral-800">
      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 min-h-screen">
        <div className="p-6 md:p-12 lg:p-24 flex flex-col justify-center bg-white">
          <Zap className="text-orange-500 mb-6 md:mb-8" size={32} />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 uppercase leading-[0.9]">
            Handcrafted <br/> Engineering
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 mb-8 md:mb-12 max-w-md">
            {subheadline}
          </p>
          <div className="grid grid-cols-2 gap-4 md:gap-8 py-6 md:py-8 border-y border-neutral-100 mb-8 md:mb-12">
            <div>
              <p className="text-2xl md:text-3xl font-black">25+</p>
              <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Years of Trust</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black">100%</p>
              <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Precision</p>
            </div>
          </div>
          <button 
            style={{ backgroundColor: cs.primary }} 
            className="px-6 md:px-10 py-4 md:py-5 text-white font-bold w-fit uppercase text-xs tracking-widest hover:scale-105 transition-transform"
          >
            Request Quote
          </button>
        </div>
        <div className="relative overflow-hidden hidden lg:block">
          <img 
            src={heroImageUrl} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
            alt=""
          />
        </div>
      </section>

      {/* Mobile Image */}
      <div className="lg:hidden h-64 overflow-hidden">
        <img 
          src={heroImageUrl} 
          className="w-full h-full object-cover grayscale" 
          alt=""
        />
      </div>
    </div>
  );
}
