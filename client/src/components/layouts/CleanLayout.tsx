/**
 * CLEAN Layout V2 – Medical & Consulting
 * Typography: Inter (headlines + body)
 * Feel: Clinical, trustworthy, professional, precise
 * Structure: Grid-based, clean lines, medical blue accents
 */
import { Award, Clock } from "lucide-react";
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

export default function CleanLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const subheadline = websiteData.sections?.[0]?.subheadline || "Professionelle Beratung und Behandlung auf höchstem Niveau.";

  return (
    <div className="bg-white text-neutral-900 font-outfit">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 md:pt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full border-x border-neutral-100">
          <div className="grid lg:grid-cols-2">
            <div className="py-12 md:py-20 pr-0 md:pr-12 border-b border-neutral-100 flex flex-col justify-center">
              <Skeleton isLoading={isLoading} className="w-32 h-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 md:mb-8 block">
                  Medical Excellence
                </span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
                <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight leading-[0.8] mb-6 md:mb-12 uppercase">
                  Expert <br/> 
                  <span className="text-blue-600">Precision</span>
                </h1>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-16 max-w-sm mb-8">
                <p className="text-base md:text-lg text-neutral-400 mb-8 md:mb-12 max-w-sm">
                  {subheadline}
                </p>
              </Skeleton>
              <div className="flex flex-wrap gap-6 md:gap-10">
                <Skeleton isLoading={isLoading} className="w-24 h-6">
                  <div className="flex items-center gap-2 md:gap-3 text-blue-600 font-bold uppercase text-xs tracking-widest">
                    <Award size={18}/> Certified
                  </div>
                </Skeleton>
                <Skeleton isLoading={isLoading} className="w-24 h-6">
                  <div className="flex items-center gap-2 md:gap-3 text-blue-600 font-bold uppercase text-xs tracking-widest">
                    <Clock size={18}/> 24/7 Support
                  </div>
                </Skeleton>
              </div>
            </div>
            <div className="py-12 md:py-20 pl-0 md:pl-12 border-b border-l-0 md:border-l border-neutral-100 flex items-center">
              <Skeleton isLoading={isLoading} className="w-full aspect-square rounded-2xl">
                <div className="rounded-2xl md:rounded-3xl overflow-hidden aspect-square shadow-2xl relative group w-full">
                  <img 
                    src={heroImageUrl} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    alt=""
                  />
                  <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
                </div>
              </Skeleton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "20+", label: "Jahre Erfahrung" },
              { num: "15k+", label: "Patienten" },
              { num: "99%", label: "Erfolgsquote" },
              { num: "ISO", label: "Zertifiziert" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4">
                <p className="text-2xl md:text-4xl font-black tracking-tighter" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
