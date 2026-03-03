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
function CleanSkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <section className="min-h-screen flex items-center pt-24 md:pt-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto w-full border-x border-neutral-100">
          <div className="grid lg:grid-cols-2">
            <div className="py-12 md:py-20 pr-0 md:pr-12 border-b border-neutral-100">
              <div className="h-3 w-32 bg-neutral-200 rounded mb-6 md:mb-8" />
              <div className="space-y-2 mb-6 md:mb-12">
                <div className="h-10 md:h-16 w-full bg-neutral-200 rounded" />
                <div className="h-10 md:h-16 w-4/5 bg-neutral-200 rounded" />
              </div>
              <div className="h-16 w-full max-w-sm bg-neutral-200 rounded mb-6 md:mb-12" />
              <div className="flex flex-wrap gap-4 md:gap-10">
                <div className="h-6 w-24 bg-neutral-200 rounded" />
                <div className="h-6 w-24 bg-neutral-200 rounded" />
              </div>
            </div>
            <div className="py-12 md:py-20 pl-0 md:pl-12 border-b border-l-0 md:border-l border-neutral-100">
              <div className="rounded-2xl md:rounded-3xl overflow-hidden aspect-square bg-neutral-200" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CleanLayout({ websiteData, cs, heroImageUrl, isLoading }: Props) {
  const subheadline = websiteData.sections?.[0]?.subheadline || "Professionelle Beratung und Behandlung auf höchstem Niveau.";

  if (isLoading) {
    return <CleanSkeleton cs={cs} />;
  }

  return (
    <div className="bg-white text-neutral-900">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 md:pt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full border-x border-neutral-100">
          <div className="grid lg:grid-cols-2">
            <div className="py-12 md:py-20 pr-0 md:pr-12 border-b border-neutral-100 flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-blue-600 mb-6 md:mb-8 block">
                Medical Excellence
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-6 md:mb-12 uppercase">
                Expert <br/> 
                <span className="text-blue-600">Precision</span>
              </h1>
              <p className="text-base md:text-lg text-neutral-400 mb-8 md:mb-12 max-w-sm">
                {subheadline}
              </p>
              <div className="flex flex-wrap gap-6 md:gap-10">
                <div className="flex items-center gap-2 md:gap-3 text-blue-600 font-bold uppercase text-xs tracking-widest">
                  <Award size={18}/> Certified
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-blue-600 font-bold uppercase text-xs tracking-widest">
                  <Clock size={18}/> 24/7 Support
                </div>
              </div>
            </div>
            <div className="py-12 md:py-20 pl-0 md:pl-12 border-b border-l-0 md:border-l border-neutral-100 flex items-center">
              <div className="rounded-2xl md:rounded-3xl overflow-hidden aspect-square shadow-2xl relative group w-full">
                <img 
                  src={heroImageUrl} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt=""
                />
                <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
              </div>
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
