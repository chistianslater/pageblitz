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
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-md ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function PremiumLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="min-h-screen grid lg:grid-cols-12">
        <div className="lg:col-span-5 bg-neutral-900 text-white p-8 md:p-12 lg:p-24 flex flex-col justify-center relative overflow-hidden z-[1]">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
              backgroundSize: '60px 60px md:80px 80px' 
            }} 
          />
          <div className="relative z-10">
            <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-[0.9] mb-6 md:mb-10 tracking-tight">
                Strategy <br/> 
                Driven <br/> 
                <span className="italic font-light" style={{ color: cs.primary }}>Results.</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-16 max-w-xs mb-8">
              <p className="text-white/40 max-w-xs mb-8 md:mb-12 text-base md:text-lg font-light leading-relaxed">
                {websiteData?.tagline}
              </p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-40 h-12">
              <button 
                style={{ backgroundColor: cs.primary }} 
                className="px-6 md:px-10 py-4 md:py-5 rounded-full text-white font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-transform"
              >
                Start Your Project
              </button>
            </Skeleton>
          </div>
        </div>
        <div className="lg:col-span-7 relative p-6 md:p-12 lg:p-24 flex items-center min-h-[50vh] lg:min-h-screen">
          <div className="w-full max-w-2xl relative">
            <div className="absolute -top-10 md:-top-20 -right-10 md:-right-20 text-[12vw] md:text-[18vw] font-black text-neutral-50 pointer-events-none uppercase italic hidden sm:block">
              Impact
            </div>
            <Skeleton isLoading={isLoading} className="w-full aspect-video rounded-[2rem]">
              <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden aspect-video shadow-[0_30px_60px_rgba(0,0,0,0.1)] md:shadow-[0_50px_100px_rgba(0,0,0,0.1)] transition-all duration-700 hover:scale-[1.02]">
                <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
              </div>
            </Skeleton>
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
