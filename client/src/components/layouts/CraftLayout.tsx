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
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-md ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function CraftLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const subheadline = websiteData.sections?.[0]?.subheadline || "Präzision und Qualität aus Meisterhand.";

  return (
    <div className="bg-[#f2f2f2] text-neutral-800">
      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 min-h-screen">
        <div className="p-6 md:p-12 lg:p-24 flex flex-col justify-center bg-white">
            {/* Eyebrow badge */}
          {!isLoading && (
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-8 self-start border"
              style={{ backgroundColor: `${cs.primary}15`, borderColor: `${cs.primary}40`, color: cs.primary }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cs.primary }} />
              {websiteData.businessCategory || websiteData.businessName || 'Handwerk & Qualität'}
            </span>
          )}
          <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
            {(() => {
              const text = websiteData.tagline || websiteData.businessName || 'Handwerk Qualität';
              const words = text.split(' ');
              const mid = Math.ceil(words.length / 2);
              return (
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 uppercase leading-[0.9]">
                  {words.slice(0, mid).join(' ') || 'Handwerk'}<br/>
                  {words.slice(mid).join(' ') || 'Qualität'}
                </h1>
              );
            })()}
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-16 mb-8">
            <p className="text-lg md:text-xl text-neutral-400 mb-8 md:mb-12 max-w-md">
              {subheadline}
            </p>
          </Skeleton>
          <div className="grid grid-cols-2 gap-4 md:gap-8 py-6 md:py-8 border-y border-neutral-100 mb-8 md:mb-12">
            <Skeleton isLoading={isLoading} className="h-16">
              <div>
                <p className="text-2xl md:text-3xl font-black">25+</p>
                <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Years of Trust</p>
              </div>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="h-16">
              <div>
                <p className="text-2xl md:text-3xl font-black">100%</p>
                <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Precision</p>
              </div>
            </Skeleton>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton isLoading={isLoading} className="w-36 h-12">
              <button
                style={{ backgroundColor: cs.primary }}
                className="px-6 md:px-10 py-4 md:py-5 text-white font-bold w-fit uppercase text-xs tracking-widest rounded-lg hover:scale-105 transition-transform"
              >
                Anfrage stellen
              </button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-32 h-12">
              <button
                style={{ color: cs.primary, borderColor: `${cs.primary}55` }}
                className="px-6 py-4 font-bold w-fit uppercase text-xs tracking-widest rounded-lg border-2 hover:opacity-70 transition-opacity"
              >
                Mehr erfahren
              </button>
            </Skeleton>
          </div>
        </div>
        <Skeleton isLoading={isLoading} className="hidden lg:block w-full h-full">
          <div className="relative overflow-hidden hidden lg:block">
            <img
              src={heroImageUrl}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              alt=""
            />
            {/* Primary-color accent stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: cs.primary }} />
            {/* Floating stat chip */}
            {!isLoading && (
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-2xl font-black leading-none" style={{ color: cs.primary }}>★ 4.9</p>
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mt-1">Kundenbewertung</p>
              </div>
            )}
          </div>
        </Skeleton>
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
