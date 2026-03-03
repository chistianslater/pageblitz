/**
 * PREMIUM Layout V2 – The Executive Choice
 * Typography: Playfair Display (serif headlines) + Inter (body)
 * Feel: Executive, strategic, high-end consulting
 * Structure: Bold split layout, strategic messaging, premium execution
 */
import type { WebsiteData, ColorScheme } from "@shared/types";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Skeleton Loading Component
function PremiumSkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <section className="min-h-screen grid lg:grid-cols-12">
        <div className="lg:col-span-5 bg-neutral-800 p-8 md:p-12 lg:p-24 flex flex-col justify-center">
          <div className="space-y-2 mb-6 md:mb-10">
            <div className="h-8 md:h-12 w-full bg-white/10 rounded" />
            <div className="h-8 md:h-12 w-4/5 bg-white/10 rounded" />
            <div className="h-8 md:h-12 w-3/5 bg-white/10 rounded" />
          </div>
          <div className="h-16 w-full max-w-xs bg-white/10 rounded mb-8 md:mb-12" />
          <div className="h-12 w-40 bg-white/10 rounded-full" />
        </div>
        <div className="lg:col-span-7 relative p-8 md:p-12 lg:p-24 flex items-center">
          <div className="w-full max-w-2xl relative">
            <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden aspect-video bg-neutral-200 shadow-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PremiumLayout({ websiteData, cs, heroImageUrl, isLoading }: Props) {
  if (isLoading) {
    return <PremiumSkeleton cs={cs} />;
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="min-h-screen grid lg:grid-cols-12">
        <div className="lg:col-span-5 bg-neutral-900 text-white p-8 md:p-12 lg:p-24 flex flex-col justify-center relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
              backgroundSize: '60px 60px md:80px 80px' 
            }} 
          />
          <div className="relative z-10">
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-[0.9] mb-6 md:mb-10 tracking-tight">
              Strategy <br/> 
              Driven <br/> 
              <span className="italic font-light" style={{ color: cs.primary }}>Results.</span>
            </h1>
            <p className="text-white/40 max-w-xs mb-8 md:mb-12 text-base md:text-lg font-light leading-relaxed">
              {websiteData.tagline}
            </p>
            <button 
              style={{ backgroundColor: cs.primary }} 
              className="px-6 md:px-10 py-4 md:py-5 rounded-full text-white font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-transform"
            >
              Start Your Project
            </button>
          </div>
        </div>
        <div className="lg:col-span-7 relative p-6 md:p-12 lg:p-24 flex items-center min-h-[50vh] lg:min-h-screen">
          <div className="w-full max-w-2xl relative">
            <div className="absolute -top-10 md:-top-20 -right-10 md:-right-20 text-[12vw] md:text-[18vw] font-black text-neutral-50 pointer-events-none uppercase italic hidden sm:block">
              Impact
            </div>
            <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden aspect-video shadow-[0_30px_60px_rgba(0,0,0,0.1)] md:shadow-[0_50px_100px_rgba(0,0,0,0.1)] transition-all duration-700 hover:scale-[1.02]">
              <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "98%", label: "Erfolgsquote" },
              { num: "€2B+", label: "Umsatz Impact" },
              { num: "100+", label: "Unternehmen" },
              { num: "Top", label: "Consulting" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-4xl font-bold tracking-tighter" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
