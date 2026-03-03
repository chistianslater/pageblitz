/**
 * FRESH Layout V2 – Gastronomy & Food
 * Typography: Playfair Display (serif headlines) + Inter (body)
 * Feel: Organic, appetizing, vibrant, handcrafted
 * Structure: Centered hero, floating elements, warm colors
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

export default function FreshLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  return (
    <div className="bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 text-center relative overflow-hidden">
        <div className="absolute top-10 md:top-20 left-1/2 -translate-x-1/2 text-[15vw] md:text-[20vw] font-black text-black/[0.02] select-none uppercase tracking-tighter pointer-events-none">
          Handmade
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6">
          <Skeleton isLoading={isLoading} className="w-40 h-6 mx-auto mb-6">
            <span className="inline-block px-3 md:px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest mb-6 md:mb-8">
              Daily Fresh & Local
            </span>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-20 md:h-32 mb-10">
            <h1 className="font-serif text-[8vw] md:text-[7vw] leading-none mb-10 md:mb-16 italic">
              Authentic Flavors. <br/> Modern Spirit.
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full max-w-3xl aspect-video rounded-[2rem] mx-auto">
            <div className="relative inline-block group">
              <div className="rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700">
                <img 
                  src={heroImageUrl} 
                  className="w-full max-w-3xl aspect-video object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" 
                  alt=""
                />
              </div>
              <div className="absolute -bottom-6 md:-bottom-10 -left-4 md:-left-10 w-24 h-24 md:w-40 md:h-40 bg-orange-500 rounded-full flex items-center justify-center animate-spin-slow hidden sm:flex">
                <span className="text-white font-bold uppercase text-[8px] md:text-[10px] tracking-widest text-center px-2 md:px-4">
                  See our Menu • Book a Table •
                </span>
              </div>
            </div>
          </Skeleton>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 px-4 md:px-6 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "100%", label: "Regional" },
              { num: "Bio", label: "Zutaten" },
              { num: "Frisch", label: "Zubereitet" },
              { num: "Daily", label: "Gebacken" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
