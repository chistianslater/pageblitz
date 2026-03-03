import React from 'react';
import { Gem, Ruler } from 'lucide-react';

const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return <div className={`bg-neutral-200 animate-pulse rounded-lg ${className}`}><div className="opacity-0">{children}</div></div>;
};

export function BoldLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
        <div className="absolute right-0 w-1/2 h-full opacity-30" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}>
          <Skeleton isLoading={isLoading} className="w-full h-full"><img src={heroImageUrl} className="w-full h-full object-cover" /></Skeleton>
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <Skeleton isLoading={isLoading} className="w-2/3 h-40">
            <h1 className="text-[10vw] font-black leading-[0.8] uppercase">Build <br/><span style={{ color: cs.primary }}>Bold</span></h1>
          </Skeleton>
        </div>
      </section>
    </div>
  );
}

export function ElegantLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-[#FFFDFB] min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-24 items-center">
        <div className="relative">
          <div style={{ borderRadius: '25rem 25rem 2rem 2rem' }} className="overflow-hidden">
            <Skeleton isLoading={isLoading} className="aspect-[3/4]"><img src={heroImageUrl} className="w-full h-full object-cover" /></Skeleton>
          </div>
        </div>
        <Skeleton isLoading={isLoading} className="h-64"><h1 className="font-serif text-7xl italic">Elegant<br/>Beauty</h1></Skeleton>
      </section>
    </div>
  );
}

export function CleanLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white min-h-screen">
      <section className="min-h-screen grid lg:grid-cols-2 p-12">
        <Skeleton isLoading={isLoading} className="h-40"><h1 className="text-7xl font-black">Clean<br/>Expert</h1></Skeleton>
        <Skeleton isLoading={isLoading} className="aspect-square"><img src={heroImageUrl} className="w-full h-full object-cover grayscale" /></Skeleton>
      </section>
    </div>
  );
}

export function CraftLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white min-h-screen">
      <section className="grid lg:grid-cols-2 min-h-screen">
        <div className="p-20 flex flex-col justify-center">
          <Ruler style={{ color: cs.primary }} className="mb-8" size={40} />
          <Skeleton isLoading={isLoading} className="h-40"><h1 className="text-6xl font-black">Master<br/>Craft</h1></Skeleton>
        </div>
        <Skeleton isLoading={isLoading} className="h-full"><img src={heroImageUrl} className="w-full h-full object-cover" /></Skeleton>
      </section>
    </div>
  );
}

export function DynamicLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center">
        <div className="absolute right-0 w-[60%] h-full skew-x-[-12deg] overflow-hidden" style={{ borderLeft: `8px solid ${cs.primary}` }}>
          <Skeleton isLoading={isLoading} className="w-full h-full"><img src={heroImageUrl} className="w-full h-full object-cover opacity-60" /></Skeleton>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Skeleton isLoading={isLoading} className="h-64"><h1 className="text-[12vw] font-black uppercase italic">Dynamic<br/><span style={{ color: cs.primary }}>Power</span></h1></Skeleton>
        </div>
      </section>
    </div>
  );
}

export function FreshLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <section className="pt-40 pb-20 text-center">
        <Skeleton isLoading={isLoading} className="mx-auto h-40 w-3/4"><h1 className="font-serif text-[8vw] italic">Fresh<br/><span style={{ color: cs.primary }}>Daily</span></h1></Skeleton>
        <Skeleton isLoading={isLoading} className="mx-auto rounded-[4rem] aspect-video max-w-4xl mt-10"><img src={heroImageUrl} className="rounded-[4rem] w-full h-full object-cover" /></Skeleton>
      </section>
    </div>
  );
}

export function LuxuryLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 opacity-40">
          <Skeleton isLoading={isLoading} className="w-full h-full"><img src={heroImageUrl} className="w-full h-full object-cover" /></Skeleton>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        <div className="relative z-10">
          <Gem style={{ color: cs.primary }} className="mx-auto mb-10" size={50} />
          <Skeleton isLoading={isLoading} className="h-32"><h1 className="font-serif italic text-[8vw]">Luxury<br/>Defined</h1></Skeleton>
        </div>
      </section>
    </div>
  );
}

export function ModernLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-40 grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7">
          <Skeleton isLoading={isLoading} className="h-64"><h1 className="text-[7vw] font-black">Modern<br/><span style={{ color: cs.primary }}>Tech</span></h1></Skeleton>
        </div>
        <div className="lg:col-span-5">
          <Skeleton isLoading={isLoading} className="rounded-[3rem] aspect-[4/5]"><img src={heroImageUrl} className="rounded-[3rem] w-full h-full object-cover" /></Skeleton>
        </div>
      </section>
    </div>
  );
}

export function NaturalLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-[#FCF9F5] min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-24 items-center">
        <Skeleton isLoading={isLoading} className="h-80"><h1 className="font-serif text-[7vw] font-light">Natural<br/><span style={{ color: cs.primary }} className="italic">Harmony</span></h1></Skeleton>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[2/3]"><img src={heroImageUrl} className="rounded-full w-full h-full object-cover" /></Skeleton>
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[2/3] mt-20"><img src={heroImageUrl} className="rounded-full w-full h-full object-cover" /></Skeleton>
        </div>
      </section>
    </div>
  );
}

export function PremiumLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  return (
    <div className="bg-white min-h-screen">
      <section className="grid lg:grid-cols-12 min-h-screen">
        <div className="lg:col-span-5 bg-neutral-900 text-white p-24 flex flex-col justify-center">
          <Skeleton isLoading={isLoading} className="h-64"><h1 className="text-[6vw] font-bold">Premium<br/><span style={{ color: cs.primary }} className="italic font-serif">Executive</span></h1></Skeleton>
        </div>
        <div className="lg:col-span-7 p-24 flex items-center">
          <Skeleton isLoading={isLoading} className="rounded-[4rem] aspect-video w-full"><img src={heroImageUrl} className="rounded-[4rem] w-full h-full object-cover" /></Skeleton>
        </div>
      </section>
    </div>
  );
}
