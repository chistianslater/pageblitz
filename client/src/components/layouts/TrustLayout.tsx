/**
 * TRUST Layout V2 – Legal & Financial
 * Typography: Space Grotesque (headlines) + Inter (body)
 * Feel: Secure, institutional, reliable, authoritative
 * Structure: Bold grid, trust indicators, professional structure
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

export default function TrustLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  return (
    <div className="bg-[#F8F9FA] text-slate-900">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 md:gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="w-10 md:w-12 h-1 bg-slate-900 mb-6 md:mb-8" />
            <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-8">
              <h1 className="text-[10vw] md:text-[7vw] font-black uppercase leading-[0.9] tracking-tighter mb-8 md:mb-10">
                Institutional <br/> 
                <span className="italic font-serif font-light text-slate-500">Security</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-8">
              <p className="text-base md:text-lg text-slate-500 mb-8 md:mb-10 max-w-lg">
                {websiteData.tagline}
              </p>
            </Skeleton>
            <div className="flex flex-col sm:flex-row gap-6 md:gap-10 border-t border-slate-200 pt-6 md:pt-10">
              <Skeleton isLoading={isLoading} className="w-36 h-12">
                <button 
                  style={{ backgroundColor: cs.primary }} 
                  className="px-6 md:px-10 py-4 md:py-5 text-white font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                  Consultation
                </button>
              </Skeleton>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex -space-x-2 md:-space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase leading-none opacity-50">
                  Trusted by <br/> 500+ Clients
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <Skeleton isLoading={isLoading} className="w-full aspect-[4/5] rounded-xl">
              <div className="border-[8px] md:border-[12px] border-white shadow-2xl rounded-xl overflow-hidden aspect-[4/5]">
                <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
              </div>
            </Skeleton>
            <div className="absolute -bottom-6 md:-bottom-8 -left-4 md:-left-8 bg-white p-4 md:p-6 shadow-2xl border-t-4 border-slate-900 max-w-[200px] md:max-w-[250px] italic text-xs md:text-sm font-serif hidden sm:block">
              "Excellence in every procedural detail."
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "30+", label: "Jahre Erfahrung" },
              { num: "500+", label: "Mandanten" },
              { num: "100%", label: "Vertraulich" },
              { num: "A+", label: "Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-4xl font-black tracking-tighter" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
