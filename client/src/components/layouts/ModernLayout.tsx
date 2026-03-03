/**
 * MODERN Layout V2 – Tech & Agency
 * Typography: Inter (headlines) + Inter (body)
 * Feel: Clean, minimal, professional, tech-forward
 * Structure: Modern grid layout, floating elements, gradient accents
 */
import { ChevronRight, Play } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Skeleton Loading Component
function ModernSkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div className="min-h-screen bg-white animate-pulse overflow-hidden">
      {/* Nav Skeleton */}
      <nav className="px-6 md:px-10 py-6 md:py-8 flex justify-between items-center">
        <div className="h-8 w-32 bg-neutral-200 rounded" />
        <div className="hidden md:flex gap-6">
          <div className="h-4 w-16 bg-neutral-200 rounded" />
          <div className="h-4 w-16 bg-neutral-200 rounded" />
          <div className="h-4 w-16 bg-neutral-200 rounded" />
        </div>
      </nav>
      
      {/* Hero Skeleton */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="h-14 md:h-20 w-full bg-neutral-200 rounded" />
              <div className="h-14 md:h-20 w-4/5 bg-neutral-200 rounded" />
              <div className="h-14 md:h-20 w-3/5 bg-neutral-200 rounded" />
            </div>
            <div className="flex gap-4 pt-4">
              <div className="h-14 w-40 bg-neutral-200 rounded-2xl" />
              <div className="h-14 w-40 bg-neutral-200 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] bg-neutral-200 rounded-[2rem] md:rounded-[3rem]" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ModernLayout({ websiteData, cs, heroImageUrl, isLoading }: Props) {
  if (isLoading) {
    return <ModernSkeleton cs={cs} />;
  }

  return (
    <div className="bg-white text-slate-900 overflow-hidden relative">
      {/* Background Gradient */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-10 pointer-events-none" 
        style={{ backgroundColor: cs.primary }} 
      />
      
      {/* Navigation */}
      <nav className="px-4 md:px-10 py-6 md:py-8 flex justify-between items-center relative z-10">
        <span className="font-black tracking-tighter text-xl md:text-2xl uppercase">Digital.Core</span>
        <div className="hidden md:flex gap-6 md:gap-10 text-[10px] font-bold uppercase tracking-widest opacity-60">
          <a href="#" className="hover:opacity-100 transition-opacity">Process</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Work</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
        </div>
        <button className="md:hidden p-2">
          <div className="w-6 h-0.5 bg-slate-900 mb-1.5" />
          <div className="w-6 h-0.5 bg-slate-900 mb-1.5" />
          <div className="w-6 h-0.5 bg-slate-900" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 grid lg:grid-cols-12 gap-8 md:gap-10 items-center">
        <div className="lg:col-span-7">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 md:mb-10">
            Smart Solutions <br/> 
            <span style={{ color: cs.primary }}>For Next-Gen</span> <br/> 
            Business.
          </h1>
          <p className="text-base md:text-lg text-slate-500 mb-6 md:mb-8 max-w-lg">
            {websiteData.tagline}
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <button 
              style={{ backgroundColor: cs.primary }} 
              className="px-6 md:px-10 py-4 md:py-5 text-white font-bold rounded-2xl flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform text-sm md:text-base"
            >
              Get Started <ChevronRight size={18}/>
            </button>
            <button className="px-6 md:px-10 py-4 md:py-5 border-2 border-slate-100 rounded-2xl font-bold flex items-center gap-2 md:gap-3 hover:bg-slate-50 transition-all text-sm md:text-base">
              <Play size={18} fill="currentColor"/> Watch Demo
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 relative mt-8 lg:mt-0">
          <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
            <img 
              src={heroImageUrl} 
              className="w-full aspect-[4/5] object-cover" 
              alt=""
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "98%", label: "Kundenzufriedenheit" },
              { num: "250+", label: "Projekte" },
              { num: "12+", label: "Jahre Erfahrung" },
              { num: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-4xl font-black tracking-tighter" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 md:mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
