/**
 * PAGEBLITZ PREMIUM LAYOUTS v2.1 – FULLY DYNAMIC
 * All content comes from websiteData (LLM-generated + real business data).
 * No more hardcoded placeholder text, fake addresses, or fake testimonials.
 */

import React from 'react';
import {
  Phone, Star, Shield, Zap,
  Award, Clock, MapPin, Utensils, Flower,
  Dumbbell, Target, Gem, Ruler,
  Sparkles, Heart
} from 'lucide-react';

// ── SKELETON ────────────────────────────────────────────────────
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-lg overflow-hidden ${className}`}>
      <div className="opacity-0 pointer-events-none">{children}</div>
    </div>
  );
};

// ── DATA HELPERS ────────────────────────────────────────────────
const sec = (websiteData: any, type: string) =>
  websiteData?.sections?.find((s: any) => s.type === type);

const getContactItem = (websiteData: any, icon: string): string | undefined =>
  sec(websiteData, 'contact')?.items?.find((i: any) => i.icon === icon)?.description;

/** Split last word of headline to colorize it */
const splitHeadline = (text: string) => {
  const words = (text || '').split(' ');
  if (words.length <= 1) return { main: text, last: '' };
  return { main: words.slice(0, -1).join(' '), last: words[words.length - 1] };
};

// ── PROCESS SECTION ──────────────────────────────────────────────
function ProcessSection({ websiteData, cs, isLoading, dark = false }: any) {
  const process = sec(websiteData, 'process');
  if (!isLoading && !process?.items?.length) return null;
  const items = process?.items || [
    { step: "1", title: "Kontakt", description: "" },
    { step: "2", title: "Beratung", description: "" },
    { step: "3", title: "Ergebnis", description: "" }
  ];
  const bg = dark ? "bg-white/5" : "bg-neutral-50";
  const textMain = dark ? "text-white" : "text-neutral-900";
  const textSub = dark ? "text-white/60" : "text-neutral-500";

  return (
    <section className={`py-20 px-6 ${bg}`}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-56 h-10 mx-auto mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-center ${textMain}`}>
            {process?.headline || "So einfach geht's"}
          </h2>
        </Skeleton>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {items.map((item: any, i: number) => (
            <Skeleton key={i} isLoading={isLoading} className="h-44">
              <div className="flex flex-col items-center text-center relative">
                {i < items.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed"
                    style={{ borderColor: cs.primary + '40' }} />
                )}
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white mb-4 z-10"
                  style={{ backgroundColor: cs.primary }}>
                  {item.step}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${textMain}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed ${textSub}`}>{item.description}</p>
              </div>
            </Skeleton>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────
/** Dark-theme testimonials block – only renders when real reviews exist */
function TestimonialsDark({ websiteData, cs, isLoading, heading }: any) {
  const items = sec(websiteData, 'testimonials')?.items;
  if (!isLoading && !items?.length) return null;
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-16">
            {heading || 'Kunden'} <span style={{ color: cs.primary }}>Stimmen</span>
          </h2>
        </Skeleton>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {items?.length > 0 ? items.map((t: any, i: number) => (
            <Skeleton key={i} isLoading={isLoading} className="h-64">
              <div className="p-6 md:p-8 border border-white/10 hover:border-white/30 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, j) => <Star key={j} size={16} fill="currentColor" className="text-yellow-500" />)}
                </div>
                <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 italic">"{t.description || t.title}"</p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-bold uppercase tracking-tight">{t.author}</p>
                </div>
              </div>
            </Skeleton>
          )) : [0, 1, 2].map(i => (
            <Skeleton key={i} isLoading={isLoading} className="h-64">
              <div className="p-6 md:p-8 border border-dashed border-white/20">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" className="text-yellow-500/40" />)}
                </div>
                <p className="text-white/30 text-sm italic">Ihre Kundenstimme erscheint hier, sobald Google-Bewertungen vorliegen.</p>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-white/20 text-xs uppercase tracking-widest">Kundenname</p>
                </div>
              </div>
            </Skeleton>
          ))}
        </div>
        {!items?.length && (
          <p className="text-center mt-8 text-white/30 text-xs uppercase tracking-widest">
            Bewertungen werden automatisch aus Google übernommen
          </p>
        )}
      </div>
    </section>
  );
}

/** Light-theme testimonials block – only renders when real reviews exist */
function TestimonialsLight({ websiteData, cs, isLoading, heading, serif }: any) {
  const items = sec(websiteData, 'testimonials')?.items;
  if (!isLoading && !items?.length) return null;
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Kundenstimmen</span>
            <h2 className={serif ? "font-serif text-4xl md:text-6xl italic font-light" : "text-4xl md:text-5xl font-black text-center"}>
              {heading || 'Was unsere Kunden sagen'}
            </h2>
          </div>
        </Skeleton>
        <div className="grid md:grid-cols-3 gap-6 md:gap-10">
          {items?.length > 0 ? items.map((t: any, i: number) => (
            <Skeleton key={i} isLoading={isLoading} className="h-64">
              <div className="p-6 md:p-8 border border-neutral-200 bg-white hover:shadow-lg transition-all duration-500">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, j) => <Star key={j} size={14} fill="currentColor" className="text-yellow-500" />)}
                </div>
                <p className="text-neutral-600 font-light leading-relaxed italic mb-6">"{t.description || t.title}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: cs.primary + '20' }}>
                    <Heart size={16} style={{ color: cs.primary }} />
                  </div>
                  <p className="font-bold text-sm">{t.author}</p>
                </div>
              </div>
            </Skeleton>
          )) : [0, 1, 2].map(i => (
            <Skeleton key={i} isLoading={isLoading} className="h-64">
              <div className="p-6 md:p-8 border border-dashed border-neutral-300 bg-white/50">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" className="text-yellow-400/40" />)}
                </div>
                <p className="text-neutral-400 text-sm italic">Ihre Kundenstimme erscheint hier, sobald Google-Bewertungen vorliegen.</p>
                <div className="mt-6">
                  <p className="text-neutral-300 text-xs uppercase tracking-widest">Kundenname</p>
                </div>
              </div>
            </Skeleton>
          ))}
        </div>
        {!items?.length && (
          <p className="text-center mt-8 text-neutral-400 text-xs uppercase tracking-widest">
            Bewertungen werden automatisch aus Google übernommen
          </p>
        )}
      </div>
    </section>
  );
}

// ── NAV LINKS ────────────────────────────────────────────────────
const NavLinks = ({ textClass = "text-inherit" }: { textClass?: string }) => (
  <div className="hidden md:flex items-center gap-6">
    <a href="#leistungen" className={`text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity ${textClass}`}>Leistungen</a>
    <a href="#ueber-uns" className={`text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity ${textClass}`}>Über uns</a>
    <a href="#kontakt" className={`text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity ${textClass}`}>Kontakt</a>
  </div>
);

// ── FOOTER CONTACT BLOCK ─────────────────────────────────────────
function FooterContact({ websiteData, textClass }: { websiteData: any, textClass: string }) {
  const phone = getContactItem(websiteData, 'Phone');
  const address = getContactItem(websiteData, 'MapPin');
  const hours = getContactItem(websiteData, 'Clock');
  if (!phone && !address && !hours) return null;
  return (
    <>
      {address && <li className={`flex items-start gap-2 ${textClass}`}><MapPin size={14} className="mt-0.5 shrink-0" /> {address}</li>}
      {phone && <li className={`flex items-center gap-2 ${textClass}`}><Phone size={14} /> {phone}</li>}
      {hours && <li className={`flex items-start gap-2 ${textClass}`}><Clock size={14} className="mt-0.5 shrink-0" /> {hours}</li>}
    </>
  );
}

// ================================================================
// 1. BOLD (Industrial & Construction)
// ================================================================
export function BoldLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Qualität" }, { title: "Geprüft", description: "Zertifiziert" }, { title: "24/7", description: "Support" }, { title: "100%", description: "Handarbeit" }];
  const heroCta = hero?.ctaText || 'Projekt anfragen';
  const heroSub = hero?.subheadline || websiteData.tagline || '';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-neutral-950 text-white selection:bg-primary">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-black text-xl md:text-2xl uppercase tracking-tighter italic">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-4 md:px-8 py-2.5 md:py-3 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <Skeleton isLoading={isLoading} className="absolute right-0 w-full lg:w-1/2 h-full">
          <div className="absolute right-0 w-full lg:w-1/2 h-full opacity-40 grayscale" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}>
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </div>
        </Skeleton>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <Skeleton isLoading={isLoading} className="w-full h-32 md:h-48">
              <h1 className="text-[12vw] md:text-[10vw] font-black leading-[0.8] uppercase tracking-tighter">
                {hl.main} <br/><span className="italic" style={{ color: cs.primary }}>{hl.last}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mt-4">
              <p className="mt-6 md:mt-10 max-w-md text-white/50 text-base md:text-lg">{heroSub}</p>
            </Skeleton>
            <div className="mt-8 md:mt-12 flex flex-wrap gap-4">
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button style={{ backgroundColor: cs.primary }} className="px-6 md:px-10 py-4 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">{heroCta}</button>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button className="px-6 md:px-10 py-4 border border-white/30 font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-colors">Mehr erfahren</button>
              </Skeleton>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-12 mx-auto">
                  <p className="text-4xl md:text-5xl font-black" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs md:text-sm uppercase tracking-widest text-white/50 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-16">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-6 md:p-8 border border-white/10 hover:border-white/30 transition-colors group">
                    <div className="w-12 h-12 mb-6 flex items-center justify-center" style={{ backgroundColor: cs.primary }}>
                      <Zap size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-4">{service.title}</h3>
                    <p className="text-white/50 text-sm md:text-base leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 bg-neutral-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <Skeleton isLoading={isLoading} className="w-full aspect-[4/3]">
              <div className="relative overflow-hidden">
                <img src={heroImageUrl} className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="" />
                <div className="absolute inset-0" style={{ backgroundColor: cs.primary, opacity: 0.1 }} />
              </div>
            </Skeleton>
            <div>
              <Skeleton isLoading={isLoading} className="w-48 h-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cs.primary }}>Über uns</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">{aboutHeadline.split(' ').slice(0, -1).join(' ')} <span style={{ color: cs.primary }}>{aboutHeadline.split(' ').slice(-1)[0]}</span></h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
                <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8">{aboutContent}</p>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-32 h-10">
                <button style={{ backgroundColor: cs.primary }} className="px-6 py-3 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">{heroCta}</button>
              </Skeleton>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} />

      <footer id="kontakt" className="py-16 md:py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <span className="font-black text-2xl uppercase tracking-tighter italic">{websiteData.businessName}</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-16 max-w-sm">
                <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-sm">{footerText}</p>
              </Skeleton>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/40">Kontakt</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                <FooterContact websiteData={websiteData} textClass="text-white/60" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-widest">© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6">
              <a href="#" className="text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors">Impressum</a>
              <a href="#" className="text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 2. ELEGANT (Beauty & Lifestyle)
// ================================================================
export function ElegantLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Expertise" }, { title: "Premium", description: "Qualität" }, { title: "100%", description: "Hingabe" }, { title: "Exklusiv", description: "Service" }];
  const heroCta = hero?.ctaText || 'Termin buchen';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const heroSub = hero?.subheadline || websiteData.description || '';
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-[#FFFDFB] text-neutral-900 font-light">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#FFFDFB]/90 backdrop-blur-md border-b border-neutral-200/50">
        <NavLinks textClass="text-neutral-900" />
        <Skeleton isLoading={isLoading} className="w-48 h-8 absolute left-1/2 -translate-x-1/2">
          <span className="font-serif italic text-xl md:text-2xl">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-sm">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 md:gap-20 items-center min-h-[80vh] pb-12 md:pb-0 pt-24">
        <div className="relative order-2 lg:order-1">
          <Skeleton isLoading={isLoading} className="w-full aspect-[3/4] rounded-t-full">
            <div className="overflow-hidden aspect-[3/4] shadow-2xl rounded-t-full" style={{ borderRadius: '50% 50% 0 0 / 30% 30% 0 0' }}>
              <img src={heroImageUrl} className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="" />
            </div>
          </Skeleton>
        </div>
        <div className="order-1 lg:order-2">
          <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight italic font-light mb-6 md:mb-8">{heroHeadline}</h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-20 mb-8">
            <p className="text-base md:text-lg text-neutral-500 font-light leading-relaxed mb-8 md:mb-12 max-w-md">{heroSub}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-40 h-14">
            <button style={{ backgroundColor: cs.primary }} className="px-8 md:px-12 py-4 md:py-5 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg">{heroCta}</button>
          </Skeleton>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center p-4 md:p-6">
                <Skeleton isLoading={isLoading} className="w-24 h-10 mx-auto">
                  <p className="text-3xl md:text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-4 md:px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
              <div className="text-center mb-16">
                <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Unser Angebot</span>
                <h2 className="font-serif text-4xl md:text-6xl italic font-light">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
              </div>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6 md:gap-10">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-6 md:p-10 border border-neutral-200 hover:shadow-xl transition-all duration-500 group bg-white">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: cs.primary + '20' }}>
                      <Sparkles size={20} style={{ color: cs.primary }} />
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl italic mb-4">{service.title}</h3>
                    <p className="text-neutral-500 font-light leading-relaxed text-sm md:text-base">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 md:py-32 px-4 md:px-6 bg-neutral-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <Skeleton isLoading={isLoading} className="w-32 h-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Über uns</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
                <h2 className="font-serif text-4xl md:text-5xl italic font-light mb-6">{aboutHeadline}</h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
                <p className="text-neutral-500 font-light leading-relaxed text-base md:text-lg mb-6">{aboutContent}</p>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button style={{ backgroundColor: cs.primary }} className="px-8 py-4 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg">{heroCta}</button>
              </Skeleton>
            </div>
            <Skeleton isLoading={isLoading} className="w-full aspect-[3/4] rounded-t-full order-1 lg:order-2">
              <div className="overflow-hidden aspect-[3/4] shadow-2xl rounded-t-full" style={{ borderRadius: '50% 50% 0 0 / 30% 30% 0 0' }}>
                <img src={heroImageUrl} className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="" />
              </div>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} />

      <footer id="kontakt" className="py-16 md:py-24 px-4 md:px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <span className="font-serif italic text-2xl md:text-3xl">{websiteData.businessName}</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-16 max-w-sm">
                <p className="text-white/50 font-light leading-relaxed max-w-sm">{footerText}</p>
              </Skeleton>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-6 text-white/40">Kontakt</h3>
              <ul className="space-y-3 text-white/60 text-sm font-light">
                <FooterContact websiteData={websiteData} textClass="text-white/60" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-light">© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6">
              <a href="#" className="text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors">Impressum</a>
              <a href="#" className="text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 3. CLEAN (Professional & Medical)
// ================================================================
export function CleanLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Standard" }, { title: "Geprüft", description: "Qualität" }, { title: "100%", description: "Vertrauen" }, { title: "24h", description: "Notfallservice" }];
  const heroCta = hero?.ctaText || 'Termin buchen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-white text-slate-900">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-bold text-xl tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-slate-900" />
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-4 py-2 text-white text-sm font-medium rounded-md">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="min-h-screen flex items-center pt-32 px-6">
        <div className="max-w-7xl mx-auto border-x border-slate-100 min-h-screen p-12 grid lg:grid-cols-2 gap-20">
          <div className="flex flex-col justify-center">
            <Skeleton isLoading={isLoading} className="w-full h-40">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
                {hl.main} <br/><span style={{ color: cs.primary }}>{hl.last}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mt-6">
              <p className="text-slate-500 text-lg leading-relaxed max-w-md">{hero?.subheadline || websiteData.tagline}</p>
            </Skeleton>
            <div className="mt-8 flex gap-4">
              <Skeleton isLoading={isLoading} className="w-40 h-12">
                <button style={{ backgroundColor: cs.primary }} className="px-6 py-3 text-white font-bold uppercase text-xs tracking-widest rounded-md">{heroCta}</button>
              </Skeleton>
            </div>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-square rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover grayscale rounded-3xl" alt="" />
          </Skeleton>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center p-6 bg-white rounded-xl shadow-sm">
                <Skeleton isLoading={isLoading} className="w-20 h-10 mx-auto">
                  <p className="text-3xl font-black" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-center mb-4">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 border border-slate-200 rounded-xl hover:shadow-lg transition-all bg-white">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: cs.primary + '15' }}>
                      <Shield size={24} style={{ color: cs.primary }} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-slate-500 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />

      <footer id="kontakt" className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-bold text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-slate-400 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <FooterContact websiteData={websiteData} textClass="text-slate-400" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 4. CRAFT (Meisterbetriebe)
// ================================================================
export function CraftLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Meisterqualität" }, { title: "100%", description: "Handarbeit" }, { title: "TÜV", description: "Zertifiziert" }, { title: "Garantie", description: "Auf alle Arbeiten" }];
  const heroCta = hero?.ctaText || 'Projekt planen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-white">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span className="font-black text-xl uppercase tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-900" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="grid lg:grid-cols-2 min-h-screen pt-20">
        <div className="p-12 lg:p-20 flex flex-col justify-center relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10">
            <Ruler className="mb-8" size={40} style={{ color: cs.primary }} />
            <Skeleton isLoading={isLoading} className="w-full h-40 relative z-10">
              <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8">
                {hl.main} <br/><span style={{ color: cs.primary }}>{hl.last}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-8">
              <p className="text-neutral-600 text-lg leading-relaxed max-w-md">{hero?.subheadline || websiteData.tagline}</p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-48 h-14">
              <button style={{ backgroundColor: cs.primary }} className="px-12 py-5 text-white font-bold uppercase tracking-widest text-xs">{heroCta}</button>
            </Skeleton>
          </div>
        </div>
        <Skeleton isLoading={isLoading} className="w-full h-full min-h-[50vh]">
          <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
        </Skeleton>
      </section>

      <section className="py-20 px-6 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-12 mx-auto">
                  <p className="text-4xl font-black" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black uppercase text-center mb-4">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 border border-neutral-200 hover:border-neutral-400 transition-all group">
                    <div className="w-12 h-12 mb-6 flex items-center justify-center border-2" style={{ borderColor: cs.primary }}>
                      <Award size={24} style={{ color: cs.primary }} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-3">{service.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 bg-neutral-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
                <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight">{aboutHeadline.split(' ').slice(0, -1).join(' ')} <span style={{ color: cs.primary }}>{aboutHeadline.split(' ').slice(-1)[0]}</span></h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24">
                <p className="text-neutral-600 leading-relaxed">{aboutContent}</p>
              </Skeleton>
            </div>
            <Skeleton isLoading={isLoading} className="aspect-[4/3]">
              <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />

      <footer id="kontakt" className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-black text-xl uppercase">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 5. DYNAMIC (Sport & Action)
// ================================================================
export function DynamicLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Trainer" }, { title: "24/7", description: "Geöffnet" }, { title: "100%", description: "Motivation" }, { title: "Zert.", description: "Ausbilder" }];
  const heroCta = hero?.ctaText || 'Training buchen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Unsere Mission';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-black text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-black text-xl uppercase italic tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 font-black uppercase text-xs tracking-widest">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="relative min-h-screen flex items-center pt-20">
        <div className="absolute right-0 w-[60%] h-full skew-x-[-12deg] translate-x-20 overflow-hidden" style={{ borderLeft: `8px solid ${cs.primary}` }}>
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-60 scale-125" alt="" />
          </Skeleton>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <Skeleton isLoading={isLoading} className="w-full h-64">
            <h1 className="text-[12vw] font-black uppercase italic tracking-tighter leading-[0.8]">
              {hl.main} <br/><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 h-16 mt-8">
            <p className="text-white/60 text-xl max-w-lg">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <div className="mt-12 flex gap-4">
            <Skeleton isLoading={isLoading} className="w-40 h-14">
              <button style={{ backgroundColor: cs.primary }} className="px-8 py-4 font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">{heroCta}</button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-40 h-14">
              <button className="px-8 py-4 border-2 border-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-colors">Mehr Erfahren</button>
            </Skeleton>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-14 mx-auto">
                  <p className="text-5xl font-black italic" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-white/50 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic text-center mb-4">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-8 border border-white/20 hover:border-white/40 transition-all group">
                    <div className="w-14 h-14 mb-6 flex items-center justify-center" style={{ backgroundColor: cs.primary }}>
                      <Dumbbell size={28} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{service.title}</h3>
                    <p className="text-white/60 leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 bg-neutral-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-square">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight">{aboutHeadline.split(' ').slice(0, -1).join(' ')} <span style={{ color: cs.primary }}>{aboutHeadline.split(' ').slice(-1)[0]}</span></h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-white/60 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kunden" />

      <footer id="kontakt" className="py-16 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-black text-xl uppercase italic">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-white/50 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-white/40">Kontakt</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <FooterContact websiteData={websiteData} textClass="text-white/50" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 6. FRESH (Café & Food)
// ================================================================
export function FreshLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "100%", description: "Regional" }, { title: "Täglich", description: "Frisch" }, { title: "Bio", description: "Zertifiziert" }, { title: "Zero", description: "Waste" }];
  const heroCta = hero?.ctaText || 'Reservieren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Unsere Philosophie';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-[#FAF9F6] text-neutral-900">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-serif italic text-xl">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-900" />
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest rounded-full">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="pt-40 pb-20 text-center px-6">
        <Skeleton isLoading={isLoading} className="mx-auto w-3/4 h-40">
          <h1 className="font-serif text-[8vw] leading-none mb-10 italic">{heroHeadline.split(' ').slice(0, -1).join(' ')} <span style={{ color: cs.primary }}>{heroHeadline.split(' ').slice(-1)[0]}</span></h1>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-2/3 h-16 mx-auto mb-10">
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">{hero?.subheadline || websiteData.tagline}</p>
        </Skeleton>
        <div className="max-w-4xl mx-auto relative group px-6">
          <Skeleton isLoading={isLoading} className="rounded-[4rem] aspect-video">
            <img src={heroImageUrl} className="rounded-[4rem] shadow-2xl transition-all w-full h-full object-cover" alt="" />
          </Skeleton>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full flex items-center justify-center animate-spin-slow text-white font-bold text-[10px] tracking-widest px-4 text-center" style={{ backgroundColor: cs.primary }}>FRISCH • REGIONAL • TÄGLICH •</div>
        </div>
      </section>

      <section className="py-20 px-6 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-12 mx-auto">
                  <p className="text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
              <h2 className="font-serif text-4xl md:text-6xl italic text-center mb-4">Unser <span style={{ color: cs.primary }}>Angebot</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 border border-neutral-200 rounded-3xl hover:shadow-xl transition-all group bg-white">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: cs.primary + '20' }}>
                      <Utensils size={24} style={{ color: cs.primary }} />
                    </div>
                    <h3 className="font-serif text-2xl italic mb-3">{service.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-3xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Gäste sagen" />

      <footer id="kontakt" className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-serif italic text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 7. LUXURY (High-End Automotive/Retail)
// ================================================================
export function LuxuryLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Exklusivität" }, { title: "Premium", description: "Service" }, { title: "5★", description: "Bewertung" }, { title: "Exklusiv", description: "Kollektion" }];
  const heroCta = hero?.ctaText || 'Termin vereinbaren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-black text-white selection:bg-yellow-500">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span className="font-serif italic text-xl tracking-wider">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-black font-bold uppercase text-xs tracking-widest">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20">
        <div className="absolute inset-0 opacity-40">
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover scale-105" alt="" />
          </Skeleton>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <Gem className="mx-auto mb-10" size={50} style={{ color: cs.primary }} />
          <Skeleton isLoading={isLoading} className="w-full h-32">
            <h1 className="font-serif italic text-[8vw] leading-none tracking-tight">{heroHeadline}</h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 h-16 mx-auto mt-8">
            <p className="text-white/60 text-xl max-w-lg mx-auto">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-14 mx-auto mt-12">
            <button style={{ backgroundColor: cs.primary }} className="px-10 py-4 text-black font-black uppercase text-xs tracking-widest">{heroCta}</button>
          </Skeleton>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-12 mx-auto">
                  <p className="text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-white/50 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
              <h2 className="font-serif text-4xl md:text-6xl italic text-center">Exklusive <span style={{ color: cs.primary }}>Services</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-8 border border-white/20 hover:border-white/40 transition-all group">
                    <div className="w-14 h-14 mb-6 flex items-center justify-center" style={{ backgroundColor: cs.primary }}>
                      <Gem size={28} className="text-black" />
                    </div>
                    <h3 className="font-serif text-2xl italic mb-4">{service.title}</h3>
                    <p className="text-white/60 leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 bg-neutral-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3]">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-white/60 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kunden" />

      <footer id="kontakt" className="py-16 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-serif italic text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-white/50 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/40">Kontakt</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <FooterContact websiteData={websiteData} textClass="text-white/50" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 8. MODERN (Agency/Software)
// ================================================================
export function ModernLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Qualität" }, { title: "Agil", description: "Arbeitsweise" }, { title: "Modern", description: "Technologie" }, { title: "100%", description: "Zufriedenheit" }];
  const heroCta = hero?.ctaText || 'Projekt starten';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-white text-slate-900">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-bold text-xl tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-slate-900" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-4 py-2 text-white text-sm font-medium rounded-lg">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="max-w-7xl mx-auto px-6 py-40 grid lg:grid-cols-12 gap-16 items-center pt-32">
        <div className="lg:col-span-7">
          <Skeleton isLoading={isLoading} className="w-full h-64">
            <h1 className="text-[7vw] font-black tracking-tighter leading-[0.9] mb-12">
              {hl.main} <br/><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-8">
            <p className="text-slate-500 text-xl max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-14">
            <div className="flex gap-4">
              <button style={{ backgroundColor: cs.primary }} className="px-8 py-4 text-white font-bold rounded-xl shadow-xl">{heroCta}</button>
              <button className="px-8 py-4 border border-slate-200 rounded-xl font-bold">Mehr erfahren</button>
            </div>
          </Skeleton>
        </div>
        <div className="lg:col-span-5 relative">
          <Skeleton isLoading={isLoading} className="rounded-[3rem] aspect-[4/5] shadow-2xl">
            <img src={heroImageUrl} className="rounded-[3rem] w-full h-full object-cover" alt="" />
          </Skeleton>
          <div className="absolute top-1/2 left-[-10%] w-40 h-40 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: cs.primary + '20' }} />
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-12 mx-auto">
                  <p className="text-4xl font-black" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-center mb-4">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 border border-slate-200 rounded-2xl hover:shadow-lg transition-all bg-white">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: cs.primary + '15' }}>
                      <Zap size={24} style={{ color: cs.primary }} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-slate-500 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />

      <footer id="kontakt" className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-bold text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-slate-400 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <FooterContact websiteData={websiteData} textClass="text-slate-400" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 9. NATURAL (Eco/Wellness)
// ================================================================
export function NaturalLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "100%", description: "Natürlich" }, { title: "Bio", description: "Zertifiziert" }, { title: "Lokal", description: "Bezogen" }, { title: "Zero", description: "Waste" }];
  const heroCta = hero?.ctaText || 'Beratung anfragen';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Philosophie';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-[#FCF9F5] text-neutral-800 font-sans">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-neutral-200/50">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-serif italic text-xl">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest rounded-full">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-24 items-center pt-40">
        <Skeleton isLoading={isLoading} className="w-full h-80">
          <div>
            <h1 className="font-serif text-[7vw] leading-[0.85] font-light mb-10">
              {heroHeadline.split(' ').slice(0, -1).join(' ')} <br/><span style={{ color: cs.primary }} className="italic">{heroHeadline.split(' ').slice(-1)[0]}</span>
            </h1>
            <p className="text-xl text-neutral-500 font-light leading-relaxed max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </div>
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

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-12 mx-auto">
                  <p className="text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
              <h2 className="font-serif text-4xl md:text-6xl italic text-center">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-8 border border-neutral-200 rounded-3xl hover:shadow-xl transition-all group bg-[#FCF9F5]">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: cs.primary + '20' }}>
                      <Flower size={24} style={{ color: cs.primary }} />
                    </div>
                    <h3 className="font-serif text-2xl italic mb-3">{service.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-3xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Kunden sagen" />

      <footer id="kontakt" className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-serif italic text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 10. PREMIUM (Corporate Executive)
// ================================================================
export function PremiumLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const statsItems = sec(websiteData, 'stats')?.items ||
    [{ title: "Top", description: "Expertise" }, { title: "Global", description: "Präsenz" }, { title: "Boutique", description: "Service" }, { title: "100%", description: "Ergebnis" }];
  const heroCta = hero?.ctaText || 'Kontakt aufnehmen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Expertise';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;

  return (
    <div className="bg-white min-h-screen font-sans">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span className="font-bold text-xl tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-900" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="grid lg:grid-cols-12 min-h-screen pt-20">
        <div className="lg:col-span-5 bg-neutral-900 text-white p-12 lg:p-24 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '50px 50px' }} />
          <Skeleton isLoading={isLoading} className="w-full h-64 relative z-10">
            <h1 className="text-[6vw] font-bold leading-[0.9] tracking-tighter">
              {hl.main} <br/><span style={{ color: cs.primary }} className="italic font-serif">{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mt-8 relative z-10">
            <p className="text-white/60 text-lg max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
        </div>
        <div className="lg:col-span-7 p-12 lg:p-24 flex items-center relative bg-white">
          <div className="absolute top-0 right-0 p-12 text-[15vw] font-black text-neutral-50 uppercase italic select-none leading-none">Top</div>
          <Skeleton isLoading={isLoading} className="rounded-[4rem] aspect-video w-full shadow-2xl relative z-10">
            <img src={heroImageUrl} className="rounded-[4rem] w-full h-full object-cover" alt="" />
          </Skeleton>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <Skeleton isLoading={isLoading} className="w-24 h-12 mx-auto">
                  <p className="text-4xl font-black" style={{ color: cs.primary }}>{stat.title}</p>
                </Skeleton>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section id="leistungen" className="py-20 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-center">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-8 border border-neutral-200 hover:shadow-xl transition-all group bg-white">
                    <div className="w-14 h-14 mb-6 flex items-center justify-center" style={{ backgroundColor: cs.primary + '15' }}>
                      <Target size={28} style={{ color: cs.primary }} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-neutral-500 leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 md:py-32 px-6 bg-neutral-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />

      <footer id="kontakt" className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-bold text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">{footerText}</p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-xs">
            <span>© {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// INDUSTRY MAPPING & LAYOUT ENGINE
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
