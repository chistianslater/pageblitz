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
          <Zap className="text-orange-500 mb-6 md:mb-8" size={32} />
          <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 uppercase leading-[0.9]">
              Handcrafted <br/> Engineering
            </h1>
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
          <Skeleton isLoading={isLoading} className="w-36 h-12">
            <button 
              style={{ backgroundColor: cs.primary }} 
              className="px-6 md:px-10 py-4 md:py-5 text-white font-bold w-fit uppercase text-xs tracking-widest hover:scale-105 transition-transform"
            >
              Request Quote
            </button>
          </Skeleton>
        </div>
        <Skeleton isLoading={isLoading} className="hidden lg:block w-full h-full">
          <div className="relative overflow-hidden hidden lg:block">
            <img 
              src={heroImageUrl} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
              alt=""
            />
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
