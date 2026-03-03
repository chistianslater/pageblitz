/**
 * NATURAL Layout V2 – Wellness & Eco
 * Typography: Cormorant Garamond (serif headlines) + Inter (body)
 * Feel: Organic, calming, sustainable, earthy
 * Structure: Organic shapes, flowing layout, nature-inspired
 */
import { Flower } from "lucide-react";
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

export default function NaturalLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  return (
    <div className="bg-[#fcfaf7] text-[#4a4a4a]">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-20 items-center w-full">
          <div>
            <Flower className="text-green-800 mb-6 md:mb-8" size={36} />
            <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.8] mb-6 md:mb-8">
                Rooted <br/> 
                <span className="italic text-green-900 font-normal">in Nature</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-16 max-w-sm mb-8">
              <p className="text-lg md:text-xl font-light leading-relaxed mb-8 md:mb-12 max-w-sm opacity-70 italic">
                "{websiteData.tagline}"
              </p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-40 h-12">
              <button 
                style={{ backgroundColor: cs.primary }} 
                className="px-6 md:px-10 py-4 md:py-5 rounded-full text-white font-bold shadow-xl shadow-green-900/20 hover:scale-105 transition-transform"
              >
                Explore Wellness
              </button>
            </Skeleton>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-3 md:space-y-4 pt-10 md:pt-20">
              <Skeleton isLoading={isLoading} className="w-full aspect-[2/3] rounded-full">
                <div className="rounded-full overflow-hidden aspect-[2/3] shadow-lg">
                  <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
                </div>
              </Skeleton>
            </div>
            <div className="space-y-3 md:space-y-4">
              <Skeleton isLoading={isLoading} className="w-full aspect-[2/3] rounded-full">
                <div className="rounded-full overflow-hidden aspect-[2/3] shadow-lg">
                  <img src={heroImageUrl} className="w-full h-full object-cover scale-125" alt="" />
                </div>
              </Skeleton>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 px-4 md:px-6 border-t border-green-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "100%", label: "Bio-Zertifiziert" },
              { num: "0%", label: "Chemikalien" },
              { num: "Eco", label: "Verpackung" },
              { num: "CO2", label: "Neutral" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-4xl font-serif italic text-green-800">{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-green-600/60 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
