/**
 * PAGEBLITZ HIGH-END GENERATOR CORE v2.0 - ULTIMATE EDITION
 * ---------------------------------------------------------
 * Features:
 * - 10 Full One-Pager High-End Layouts (UiCore Pro Level)
 * - Global CSS Utilities for Layering & Masks
 * - Dynamic Skeleton Loading (isLoading)
 * - GMB Industry-to-Layout Mapping Logic
 */

import React from 'react';
import { Gem, Ruler } from 'lucide-react';

// CSS UTILITIES (müssen in globals.css sein):
// .text-outline { -webkit-text-stroke: 1.5px currentColor; color: transparent; }
// .mask-arch { border-radius: 25rem 25rem 2rem 2rem; }
// .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); }
// .animate-float { animation: float 6s ease-in-out infinite; }
// .animate-spin-slow { animation: spin 15s linear infinite; }

// --- SHARED SKELETON COMPONENT ---
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-lg overflow-hidden ${className}`}>
      <div className="opacity-0 pointer-events-none">{children}</div>
    </div>
  );
};

// ================================================================
// 1. BOLD (Industrial & Construction)
// ================================================================
export function BoldLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-neutral-950 text-white selection:bg-primary">
      <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
        <div className="absolute right-0 w-1/2 h-full opacity-30 grayscale" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}>
          <Skeleton isLoading={isLoading} className="w-full h-full"><img src={heroImageUrl} className="w-full h-full object-cover" alt="" /></Skeleton>
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <Skeleton isLoading={isLoading} className="w-2/3 h-40">
            <h1 className="text-[10vw] font-black leading-[0.8] uppercase tracking-tighter">
              Hard <br/> <span className="text-outline" style={{ color: cs.primary, WebkitTextStroke: 'none' }}>Craft</span> <br/> Mastery
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-1/2 h-6 mt-8">
            <p className="mt-6 max-w-md text-white/50 text-lg">{websiteData?.tagline}</p>
          </Skeleton>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 2. ELEGANT (Beauty & Lifestyle)
// ================================================================
export function ElegantLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-[#FFFDFB] text-neutral-900 font-light">
      <section className="max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-24 items-center">
        <div className="relative">
          <div className="overflow-hidden" style={{ borderRadius: '25rem 25rem 2rem 2rem' }}>
            <Skeleton isLoading={isLoading} className="aspect-[3/4] w-full">
              <img src={heroImageUrl} className="w-full h-full object-cover shadow-2xl" alt="" />
            </Skeleton>
          </div>
          <div className="absolute -bottom-10 -right-10 bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50 animate-float">
            <p className="font-serif italic text-2xl">5.0 Rating</p>
          </div>
        </div>
        <div>
          <Skeleton isLoading={isLoading} className="w-full h-64">
            <h1 className="font-serif text-7xl leading-tight italic mb-8">Timeless <br/> Beauty.</h1>
            <p className="text-lg text-neutral-500 font-light leading-relaxed mb-8">{websiteData?.tagline}</p>
            <button style={{ backgroundColor: cs.primary }} className="px-16 py-5 rounded-full text-white text-sm font-bold uppercase tracking-widest">Reserve Experience</button>
          </Skeleton>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 3. CLEAN (Professional & Medical)
// ================================================================
export function CleanLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white text-slate-900">
      <section className="min-h-screen flex items-center pt-32 px-6">
        <div className="max-w-7xl mx-auto border-x border-slate-100 min-h-screen p-12 grid lg:grid-cols-2 gap-20">
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-40">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6 block">Medical Excellence</span>
              <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-8">Expert <br/> <span className="text-blue-600">Precision</span></h1>
            </Skeleton>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-square rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover grayscale rounded-3xl" alt="" />
          </Skeleton>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 4. CRAFT (Meisterbetriebe)
// ================================================================
export function CraftLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white">
      <section className="grid lg:grid-cols-2 min-h-screen">
        <div className="p-20 flex flex-col justify-center relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10">
            <Ruler className="mb-8" size={40} style={{ color: cs.primary }} />
            <Skeleton isLoading={isLoading} className="w-full h-40">
              <h1 className="text-6xl font-black uppercase leading-none mb-8">Meister <br/> <span style={{ color: cs.primary }}>Qualität</span></h1>
              <button style={{ backgroundColor: cs.primary }} className="px-12 py-5 text-white font-bold uppercase tracking-widest text-xs">Projekt Planen</button>
            </Skeleton>
          </div>
        </div>
        <Skeleton isLoading={isLoading} className="w-full h-full">
          <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
        </Skeleton>
      </section>
    </div>
  );
}

// ================================================================
// 5. DYNAMIC (Sport & Action)
// ================================================================
export function DynamicLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-black text-white overflow-hidden">
      <section className="relative min-h-screen flex items-center">
        <div className="absolute right-0 w-[60%] h-full skew-x-[-12deg] translate-x-20 overflow-hidden" style={{ borderLeft: `8px solid ${cs.primary}` }}>
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-60 scale-125" alt="" />
          </Skeleton>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Skeleton isLoading={isLoading} className="w-full h-64">
            <h1 className="text-[12vw] font-black uppercase italic tracking-tighter leading-[0.8]">No <br/> <span style={{ color: cs.primary }}>Limits</span></h1>
          </Skeleton>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 6. FRESH (Café & Food)
// ================================================================
export function FreshLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-[#FAF9F6] text-neutral-900">
      <section className="pt-40 pb-20 text-center">
        <Skeleton isLoading={isLoading} className="mx-auto w-3/4 h-40">
          <h1 className="font-serif text-[8vw] leading-none mb-10 italic">Fresh <span style={{ color: cs.primary }}>Daily.</span></h1>
        </Skeleton>
        <div className="max-w-4xl mx-auto relative group px-6">
          <Skeleton isLoading={isLoading} className="rounded-[4rem] aspect-video">
            <img src={heroImageUrl} className="rounded-[4rem] shadow-2xl transition-all" alt="" />
          </Skeleton>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500 rounded-full flex items-center justify-center animate-pulse text-white font-bold text-[10px] tracking-widest px-4 text-center">NATURAL • ORGANIC • FRESH •</div>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 7. LUXURY (High-End Automotive/Retail)
// ================================================================
export function LuxuryLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-black text-white selection:bg-yellow-500">
      <section className="relative min-h-screen flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 opacity-40">
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover scale-105" alt="" />
          </Skeleton>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        <div className="relative z-10">
          <Gem className="mx-auto mb-10" size={50} style={{ color: cs.primary }} />
          <Skeleton isLoading={isLoading} className="w-full h-32">
            <h1 className="font-serif italic text-[8vw] leading-none tracking-tight">Elegance <br/> Defined</h1>
          </Skeleton>
          <button style={{ backgroundColor: cs.primary }} className="px-16 py-6 rounded-full text-black font-black uppercase text-xs tracking-widest mt-8">Discover Excellence</button>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 8. MODERN (Agency/Software)
// ================================================================
export function ModernLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white text-slate-900">
      <section className="max-w-7xl mx-auto px-6 py-40 grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7">
          <Skeleton isLoading={isLoading} className="w-full h-64">
            <h1 className="text-[7vw] font-black tracking-tighter leading-[0.9] mb-12">Digital <br/> <span style={{ color: cs.primary }}>Innovation.</span></h1>
            <div className="flex gap-6">
              <button style={{ backgroundColor: cs.primary }} className="px-12 py-5 text-white font-bold rounded-2xl shadow-xl">Get Started</button>
              <button className="px-12 py-5 border border-slate-200 rounded-2xl font-bold">Process</button>
            </div>
          </Skeleton>
        </div>
        <div className="lg:col-span-5 relative">
          <Skeleton isLoading={isLoading} className="rounded-[3rem] aspect-[4/5] shadow-2xl">
            <img src={heroImageUrl} className="rounded-[3rem] w-full h-full object-cover" alt="" />
          </Skeleton>
          <div className="absolute top-1/2 left-[-10%] w-40 h-40 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: `${cs.primary}20` }} />
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 9. NATURAL (Eco/Wellness)
// ================================================================
export function NaturalLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-[#FCF9F5] text-neutral-800">
      <section className="max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-24 items-center">
        <Skeleton isLoading={isLoading} className="w-full h-80">
          <h1 className="font-serif text-[7vw] leading-[0.85] font-light mb-10">Pure <br/> <span style={{ color: cs.primary }} className="italic">Serenity.</span></h1>
          <p className="text-xl text-neutral-500 font-light italic leading-relaxed">"Harmonizing body and soul through nature's finest elements."</p>
        </Skeleton>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[2/3] pt-20">
            <img src={heroImageUrl} className="rounded-full w-full h-full object-cover" alt="" />
          </Skeleton>
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[2/3]">
            <img src={heroImageUrl} className="rounded-full w-full h-full object-cover scale-110" alt="" />
          </Skeleton>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// 10. PREMIUM (Corporate Executive)
// ================================================================
export function PremiumLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white min-h-screen">
      <section className="grid lg:grid-cols-12 min-h-screen">
        <div className="lg:col-span-5 bg-neutral-900 text-white p-24 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '50px 50px' }} />
          <Skeleton isLoading={isLoading} className="w-full h-64 relative z-10">
            <h1 className="text-[6vw] font-bold leading-[0.9] tracking-tighter">Strategy <br/> <span style={{ color: cs.primary }} className="italic font-serif font-light">Impact.</span></h1>
          </Skeleton>
        </div>
        <div className="lg:col-span-7 p-24 flex items-center relative bg-white">
          <div className="absolute top-0 right-0 p-12 text-[15vw] font-black text-neutral-50 uppercase italic select-none leading-none">Executive</div>
          <Skeleton isLoading={isLoading} className="rounded-[4rem] aspect-video w-full shadow-2xl relative z-10">
            <img src={heroImageUrl} className="rounded-[4rem] w-full h-full object-cover" alt="" />
          </Skeleton>
        </div>
      </section>
    </div>
  );
}

// ================================================================
// PART 3: INDUSTRY MAPPING & LAYOUT ENGINE
// ================================================================

export const getLayoutKeyByIndustry = (category: string = "") => {
  const cat = category.toLowerCase();
  if (cat.includes('bau') || cat.includes('industrie') || cat.includes('handwerk')) return 'BOLD';
  if (cat.includes('friseur') || cat.includes('beauty') || cat.includes('kosmetik') || cat.includes('spa')) return 'ELEGANT';
  if (cat.includes('arzt') || cat.includes('kanzlei') || cat.includes('praxis') || cat.includes('therapie')) return 'CLEAN';
  if (cat.includes('tischler') || cat.includes('schreiner') || cat.includes('elektro') || cat.includes('sanitär')) return 'CRAFT';
  if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport') || cat.includes('training')) return 'DYNAMIC';
  if (cat.includes('café') || cat.includes('bäckerei') || cat.includes('restaurant') || cat.includes('bar')) return 'FRESH';
  if (cat.includes('auto') || cat.includes('fahrzeug') || cat.includes('immobilien') || cat.includes('schmuck')) return 'LUXURY';
  if (cat.includes('agentur') || cat.includes('it') || cat.includes('marketing') || cat.includes('software')) return 'MODERN';
  if (cat.includes('natur') || cat.includes('bio') || cat.includes('garten') || cat.includes('florist')) return 'NATURAL';
  return 'PREMIUM';
};

export const LayoutEngine = ({ gmbData, websiteData, isLoading }: any) => {
  const layoutKey = getLayoutKeyByIndustry(gmbData?.category);
  const layouts: any = {
    BOLD: BoldLayoutV2, ELEGANT: ElegantLayoutV2, CLEAN: CleanLayoutV2,
    CRAFT: CraftLayoutV2, DYNAMIC: DynamicLayoutV2, FRESH: FreshLayoutV2,
    LUXURY: LuxuryLayoutV2, MODERN: ModernLayoutV2, NATURAL: NaturalLayoutV2,
    PREMIUM: PremiumLayoutV2
  };
  const SelectedLayout = layouts[layoutKey] || PremiumLayoutV2;
  return (
    <SelectedLayout 
      websiteData={websiteData} 
      cs={websiteData?.colorScheme || { primary: '#3b82f6' }} 
      heroImageUrl={websiteData?.heroImage || websiteData?.heroImageUrl}
      isLoading={isLoading} 
    />
  );
};

export default LayoutEngine;
