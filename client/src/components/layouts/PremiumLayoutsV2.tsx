/**
 * PAGEBLITZ PREMIUM LAYOUTS v3.0 – DISTINCTIVELY DESIGNED
 * All content comes from websiteData (LLM-generated + real business data).
 * No more generic AI aesthetics – each layout has a unique typographic identity.
 */

import React from 'react';
import {
  Phone, Star, Shield, Zap,
  Award, Clock, MapPin, Utensils, Flower,
  Dumbbell, Target, Gem, Ruler,
  Sparkles, Heart, ArrowRight, Leaf
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

// ── GOOGLE TRUST BADGE ───────────────────────────────────────────
function GoogleTrustBadge({ websiteData, cs, isLoading, dark = false }: any) {
  const rating = websiteData?.googleRating;
  const reviewCount = websiteData?.googleReviewCount;
  if (!isLoading && !rating) return null;

  const textSub = dark ? "text-white/50" : "text-neutral-500";
  const bg = dark ? "bg-white/5" : "bg-neutral-50";
  const cardBg = dark ? "bg-white/10" : "bg-white";
  const divider = dark ? "bg-white/20" : "bg-neutral-200";
  const border = dark ? "border-white/10" : "border-neutral-100";

  const stars = rating ? Math.round(rating) : 5;
  const displayRating = rating ? rating.toFixed(1) : "5.0";
  const displayCount = reviewCount
    ? reviewCount >= 50 ? `${Math.floor(reviewCount / 10) * 10}+` : `${reviewCount}`
    : "–";

  return (
    <section className={`py-12 px-6 ${bg}`}>
      <div className="max-w-7xl mx-auto flex justify-center">
        <Skeleton isLoading={isLoading} className="w-80 h-20">
          <div className={`inline-flex items-center gap-6 px-8 py-4 rounded-xl border ${cardBg} ${border} shadow-sm`}>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Google</span>
              <div className="flex gap-0.5 mt-1">
                {[0,1,2,3,4].map(i => (
                  <Star key={i} size={14}
                    fill={i < stars ? '#FBBC04' : 'none'}
                    stroke={i < stars ? '#FBBC04' : '#ccc'}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>
            <div className={`w-px h-10 ${divider}`} />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black leading-none" style={{ color: cs.primary }}>{displayRating}</span>
              <span className={`text-[10px] uppercase tracking-widest mt-1 ${textSub}`}>Bewertung</span>
            </div>
            <div className={`w-px h-10 ${divider}`} />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black leading-none" style={{ color: cs.primary }}>{displayCount}</span>
              <span className={`text-[10px] uppercase tracking-widest mt-1 ${textSub}`}>Rezensionen</span>
            </div>
          </div>
        </Skeleton>
      </div>
    </section>
  );
}

// ── CONTACT SECTION ───────────────────────────────────────────────
function ContactSection({ websiteData, cs, isLoading, dark = false }: any) {
  const phone = getContactItem(websiteData, 'Phone');
  const address = getContactItem(websiteData, 'MapPin');
  const hours = getContactItem(websiteData, 'Clock');

  const textMain = dark ? "text-white" : "text-neutral-900";
  const textSub = dark ? "text-white/50" : "text-neutral-500";
  const bg = dark ? "bg-white/5" : "bg-neutral-50";
  const cardBg = dark ? "bg-neutral-800" : "bg-white";
  const border = dark ? "border-white/10" : "border-neutral-200";
  const iconBg = `${cs.primary}20`;

  return (
    <section id="kontakt" className={`py-20 px-6 scroll-mt-20 ${bg}`}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-48 h-10 mb-12">
          <h2 className={`text-3xl md:text-4xl font-black mb-12 ${textMain}`}>Kontakt</h2>
        </Skeleton>
        <div className="grid md:grid-cols-2 gap-12">

          {/* Left: real contact data */}
          <div className="space-y-6">
            {(address || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-16">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
                    <MapPin size={18} style={{ color: cs.primary }} />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-widest mb-1 ${textSub}`}>Adresse</p>
                    <p className={`font-medium ${textMain}`}>{address}</p>
                  </div>
                </div>
              </Skeleton>
            )}
            {(phone || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-16">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
                    <Phone size={18} style={{ color: cs.primary }} />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-widest mb-1 ${textSub}`}>Telefon</p>
                    <p className={`font-medium ${textMain}`}>{phone}</p>
                  </div>
                </div>
              </Skeleton>
            )}
            {(hours || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-16">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
                    <Clock size={18} style={{ color: cs.primary }} />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-widest mb-1 ${textSub}`}>Öffnungszeiten</p>
                    <p className={`font-medium whitespace-pre-line ${textMain}`}>{hours}</p>
                  </div>
                </div>
              </Skeleton>
            )}
          </div>

          {/* Right: locked premium form */}
          <div className="relative">
            <div className={`rounded-xl border ${cardBg} ${border} p-6 opacity-40 blur-[2px] pointer-events-none`}>
              <div className="space-y-4">
                <div>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${textSub}`}>Name</p>
                  <div className={`h-10 rounded-lg border ${border}`} />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${textSub}`}>E-Mail</p>
                  <div className={`h-10 rounded-lg border ${border}`} />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${textSub}`}>Nachricht</p>
                  <div className={`h-24 rounded-lg border ${border}`} />
                </div>
                <div className="h-10 rounded-lg" style={{ backgroundColor: cs.primary }} />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${cardBg} rounded-xl border ${border} shadow-lg px-6 py-5 text-center max-w-xs w-full`}>
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <Shield size={22} className="text-neutral-400" />
                </div>
                <p className={`font-bold text-sm mb-1 ${textMain}`}>Kontaktformular</p>
                <p className={`text-xs mb-4 ${textSub}`}>Erhalte direkte Kundenanfragen über deine Website.</p>
                <button className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-widest text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: cs.primary }}>
                  Freischalten
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────
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
// Aesthetic: Raw industrial muscle. Barlow Condensed 900 at massive scale.
// Key move: Diagonal hero split with clip-path, numbered service list, accent stripe.
export function BoldLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Angebot anfragen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Unser Handwerk';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif";
  const BODY = "'Barlow', 'Arial', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#0A0A0A] text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <span style={{ fontFamily: DISPLAY, fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.25rem' }} className="uppercase">{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.1em' }} className="px-8 py-3 text-white text-sm uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: split grid with diagonal clip */}
      <section id="hero" className="min-h-screen grid lg:grid-cols-[54%_46%] pt-[64px]">
        <div className="flex flex-col justify-center p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-[3px] h-full" style={{ backgroundColor: cs.primary }} />
          <Skeleton isLoading={isLoading} className="w-full h-60 mb-8">
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, lineHeight: 0.85, fontSize: 'clamp(4rem, 11vw, 9.5rem)', letterSpacing: '0.01em' }} className="uppercase">
              {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-14 mb-10">
            <p style={{ fontFamily: BODY, fontWeight: 400, lineHeight: 1.7 }} className="text-white/50 text-lg max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-14">
            <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.1em' }} className="px-10 py-4 text-white uppercase text-sm inline-block">{heroCta}</button>
          </Skeleton>
        </div>
        <div className="relative min-h-[50vh]" style={{ clipPath: 'polygon(6% 0, 100% 0, 100% 100%, 0 100%)' }}>
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-75" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
          </Skeleton>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-16 mb-12">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.02em' }} className="uppercase">
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="border-t border-white/10">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-28">
                  <div className="border-b border-white/10 py-7 flex items-center gap-6 hover:bg-white/[0.02] transition-colors group px-2">
                    <span style={{ fontFamily: DISPLAY, fontWeight: 900, color: cs.primary, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1, opacity: 0.7 }} className="shrink-0 w-14">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 min-w-0">
                      <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.04em', fontSize: '1.2rem' }} className="uppercase mb-1">{service.title}</h3>
                      <p className="text-white/45 text-sm leading-relaxed max-w-2xl">{service.description}</p>
                    </div>
                    <ArrowRight size={20} style={{ color: cs.primary }} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <section id="ueber-uns" className="py-20 px-6 scroll-mt-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3]">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-36 mb-6">
              <span className="text-xs uppercase tracking-[0.2em] mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, letterSpacing: '0.02em', fontSize: 'clamp(2.2rem, 5vw, 4rem)' }} className="uppercase leading-tight">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-white/60 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kundenstimmen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <footer className="py-10 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-40 h-8 mb-2">
              <span style={{ fontFamily: DISPLAY, fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.1rem' }} className="uppercase">{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-white/25 text-sm mt-1">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-white/40">
            <FooterContact websiteData={websiteData} textClass="text-white/40" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 2. ELEGANT (Beauty & Lifestyle)
// ================================================================
// Aesthetic: Parisian editorial. Cormorant Garamond italic, generous whitespace.
// Key move: Giant floating background initial, centered editorial hero.
export function ElegantLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Termin buchen';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Unsere Philosophie';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Cormorant Garamond', 'Garamond', Georgia, serif";
  const BODY = "'Jost', 'Helvetica Neue', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#FAF7F2] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#FAF7F2]/90 backdrop-blur-sm border-b border-neutral-200/60">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 400, letterSpacing: '0.02em' }}>{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 500, letterSpacing: '0.12em' }} className="px-7 py-2.5 text-white text-xs uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: editorial centered with giant background initial */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '40vw', lineHeight: 1, color: cs.primary, opacity: 0.04 }}>
            {(heroHeadline || websiteData.businessName || 'E').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-3/4 mx-auto h-48 mb-8">
            <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.1, letterSpacing: '0.02em', fontSize: 'clamp(3.5rem, 8vw, 7.5rem)' }}>
              {heroHeadline.split(' ').slice(0, -1).join(' ')}{' '}
              <span style={{ color: cs.primary }}>{heroHeadline.split(' ').slice(-1)[0]}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 mx-auto h-14 mb-12">
            <p style={{ fontFamily: BODY, fontWeight: 300, letterSpacing: '0.04em' }} className="text-neutral-500 text-lg max-w-xl mx-auto">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-40 h-12 mx-auto mb-16">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, letterSpacing: '0.12em' }} className="px-10 py-3.5 text-white text-xs uppercase">{heroCta}</button>
          </Skeleton>
          <div className="max-w-3xl mx-auto aspect-[16/9] relative">
            <Skeleton isLoading={isLoading} className="w-full h-full">
              <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
            </Skeleton>
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 px-6 bg-white scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-56 h-16 mx-auto mb-16">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.02em' }} className="text-center">
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-56">
                  <div className="text-center p-8" style={{ borderTop: `2px solid ${cs.primary}30` }}>
                    <div className="w-10 h-10 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: cs.primary + '15' }}>
                      <Sparkles size={18} style={{ color: cs.primary }} />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: '1.4rem', letterSpacing: '0.01em' }} className="mb-3">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 300 }} className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-24 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[3/4]">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-36 mb-8">
              <span style={{ fontFamily: BODY, fontWeight: 400, letterSpacing: '0.2em', fontSize: '0.7rem', color: cs.primary }} className="uppercase block mb-4">Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '0.02em', color: cs.primary }} className="leading-tight">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, fontWeight: 300, lineHeight: 1.8 }} className="text-neutral-600">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Klientinnen sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <footer className="py-12 px-8 bg-[#1A1511] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Skeleton isLoading={isLoading} className="w-40 h-8">
            <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }}>{websiteData.businessName}</span>
          </Skeleton>
          <ul className="space-y-1 text-sm text-white/50 text-center">
            <FooterContact websiteData={websiteData} textClass="text-white/50" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10">
          <p className="text-white/20 text-xs text-center">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 3. CLEAN (Medical & Professional)
// ================================================================
// Aesthetic: Clinical precision. DM Serif Display meets DM Sans.
// Key move: Left-aligned editorial with offset image, primary-bordered service cards.
export function CleanLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Termin vereinbaren';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'DM Serif Display', Georgia, serif";
  const BODY = "'DM Sans', 'Helvetica Neue', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: cs.primary }} />
            <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 500, letterSpacing: '0.04em' }} className="px-6 py-2.5 text-white text-sm rounded-sm">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="max-w-7xl mx-auto px-6 pt-36 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 xl:col-span-5">
          <Skeleton isLoading={isLoading} className="w-full h-52 mb-8">
            <div className="mb-6">
              <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.25em', color: cs.primary }} className="uppercase block mb-3">Ihre Praxis – Ihr Vertrauen</span>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 400, lineHeight: 1.15, fontSize: 'clamp(2.8rem, 5.5vw, 5rem)' }}>
                {hl.main}<br /><em style={{ color: cs.primary }}>{hl.last}</em>
              </h1>
            </div>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-16 mb-10">
            <p style={{ fontFamily: BODY, fontWeight: 400, lineHeight: 1.75 }} className="text-neutral-500 text-lg max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-44 h-12">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 500 }} className="px-8 py-3.5 text-white text-sm rounded-sm">{heroCta}</button>
          </Skeleton>
        </div>
        <div className="lg:col-span-6 xl:col-span-7 relative">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-xl hidden lg:flex items-center justify-center" style={{ backgroundColor: cs.primary }}>
            <div className="text-center text-white">
              <div style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.8rem', lineHeight: 1 }}>✓</div>
              <div style={{ fontFamily: BODY, fontSize: '0.55rem', letterSpacing: '0.1em' }} className="uppercase mt-1">Geprüft</div>
            </div>
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 bg-neutral-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-14 mb-12">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
                Unsere <em style={{ color: cs.primary }}>Leistungen</em>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-56">
                  <div className="bg-white p-8 h-full" style={{ borderLeft: `3px solid ${cs.primary}` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: cs.primary }}>
                      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>{i + 1}</span>
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: '1.25rem' }} className="mb-3">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 400 }} className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.2em', color: cs.primary }} className="uppercase block mb-3">Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.2 }}>
                {aboutHeadline.split(' ').slice(0, -1).join(' ')}{' '}
                <em style={{ color: cs.primary }}>{aboutHeadline.split(' ').slice(-1)[0]}</em>
              </h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, lineHeight: 1.8 }} className="text-neutral-500">{aboutContent}</p>
            </Skeleton>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Patienten sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-40 h-8 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-sm" style={{ backgroundColor: cs.primary }} />
                <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: '1rem' }}>{websiteData.businessName}</span>
              </div>
            </Skeleton>
            <p className="text-neutral-400 text-sm">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 4. CRAFT (Handwerk & Artisan)
// ================================================================
// Aesthetic: Workshop warmth. Playfair Display bold, parchment base.
// Key move: Warm parchment bg, numbered service blocks with earthy sienna accents.
export function CraftLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Angebot anfragen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Playfair Display', Georgia, serif";
  const BODY = "'Source Sans 3', 'Georgia', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#F2EBD9] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#F2EBD9]/90 backdrop-blur-sm border-b border-neutral-300/50">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.01em' }}>{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.06em' }} className="px-7 py-2.5 text-white text-sm uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="min-h-screen grid lg:grid-cols-2 pt-[64px]">
        <div className="flex flex-col justify-center p-10 lg:p-20">
          <Skeleton isLoading={isLoading} className="w-full h-56 mb-8">
            <Ruler size={36} style={{ color: cs.primary }} className="mb-6" />
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, lineHeight: 1.05, fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
              {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-10">
            <p className="text-neutral-600 text-lg leading-relaxed max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-44 h-12">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.08em' }} className="px-10 py-4 text-white uppercase text-sm">{heroCta}</button>
          </Skeleton>
        </div>
        <div className="relative min-h-[50vh]">
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#F2EBD9]/20" />
          </Skeleton>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-14 mb-14">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-60">
                  <div className="p-8 bg-[#F2EBD9] h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center" style={{ backgroundColor: cs.primary }}>
                      <span style={{ fontFamily: DISPLAY, fontWeight: 900, color: 'white', fontSize: '1.4rem', lineHeight: 1 }}>{i + 1}</span>
                    </div>
                    <Award size={28} style={{ color: cs.primary }} className="mb-4" />
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.25rem' }} className="mb-3 pr-8">{service.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3]">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs uppercase tracking-[0.2em] mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.2 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Kunden sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.2rem' }}>{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-neutral-400 text-sm">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 5. DYNAMIC (Sport & Fitness)
// ================================================================
// Aesthetic: Kinetic energy. Bebas Neue at giant scale, diagonal image cut.
// Key move: Massive italic type, skewed image panel, electric accent.
export function DynamicLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Training buchen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Unsere Mission';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Bebas Neue', Impact, 'Arial Narrow', sans-serif";
  const BODY = "'Rajdhani', 'Arial', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#080808] text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#080808]/90 backdrop-blur-sm border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <span style={{ fontFamily: DISPLAY, fontSize: '1.6rem', letterSpacing: '0.08em' }}>{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, letterSpacing: '0.12em', fontSize: '1.05rem' }} className="px-8 py-2.5 text-white uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Giant Bebas headline with skewed image */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20">
        <div className="absolute right-0 w-[55%] h-full overflow-hidden" style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)', borderLeft: `6px solid ${cs.primary}` }}>
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-55 scale-110" alt="" />
          </Skeleton>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <Skeleton isLoading={isLoading} className="w-full h-72 mb-8">
            <h1 style={{ fontFamily: DISPLAY, lineHeight: 0.85, fontSize: 'clamp(5rem, 14vw, 13rem)', letterSpacing: '0.02em' }}>
              {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/5 h-14 mb-10">
            <p style={{ fontFamily: BODY, fontWeight: 500, letterSpacing: '0.04em' }} className="text-white/60 text-lg max-w-sm">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <div className="flex gap-4">
            <Skeleton isLoading={isLoading} className="w-44 h-14">
              <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, letterSpacing: '0.12em', fontSize: '1.05rem' }} className="px-10 py-4 text-white uppercase">{heroCta}</button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-44 h-14">
              <button style={{ fontFamily: DISPLAY, letterSpacing: '0.1em', fontSize: '1rem' }} className="px-8 py-4 border-2 border-white text-white uppercase hover:bg-white hover:text-black transition-colors">Mehr erfahren</button>
            </Skeleton>
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-72 h-20 mb-12">
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '0.03em', lineHeight: 0.9 }}>
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-4">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 border border-white/15 hover:border-white/30 transition-all group">
                    <div className="w-12 h-12 mb-5 flex items-center justify-center" style={{ backgroundColor: cs.primary }}>
                      <Dumbbell size={24} className="text-white" />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontSize: '1.6rem', letterSpacing: '0.03em', lineHeight: 1.1 }} className="mb-3">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 400 }} className="text-white/55 leading-relaxed text-sm">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <section id="ueber-uns" className="py-20 px-6 bg-[#111111] scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-square">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-36 mb-6">
              <span className="text-xs uppercase tracking-[0.2em] mb-4 block" style={{ color: cs.primary, fontFamily: BODY, fontWeight: 600 }}>Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.02em', lineHeight: 0.9 }}>
                {aboutHeadline.split(' ').slice(0, -1).join(' ')}{' '}
                <span style={{ color: cs.primary }}>{aboutHeadline.split(' ').slice(-1)[0]}</span>
              </h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, fontWeight: 400 }} className="text-white/60 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kunden" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <footer className="py-10 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-2">
              <span style={{ fontFamily: DISPLAY, fontSize: '1.4rem', letterSpacing: '0.06em' }}>{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-white/25 text-sm">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-white/40">
            <FooterContact websiteData={websiteData} textClass="text-white/40" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 6. FRESH (Café & Food)
// ================================================================
// Aesthetic: Artisan food editorial. Fraunces all-serif, warm cream.
// Key move: Centered editorial hero, large rounded image, spinning circular badge.
export function FreshLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Reservieren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Unsere Philosophie';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Fraunces', Georgia, serif";
  const BODY = "'Fraunces', Georgia, serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#FBF7F0] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#FBF7F0]/90 backdrop-blur-sm border-b border-neutral-200/60">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 300 }}>{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300 }} className="px-6 py-2.5 text-white text-sm rounded-full">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: editorial centered */}
      <section id="hero" className="pt-40 pb-12 text-center px-6">
        <Skeleton isLoading={isLoading} className="w-3/4 mx-auto h-44 mb-8">
          <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, lineHeight: 1.0, fontSize: 'clamp(3rem, 8vw, 7.5rem)' }}>
            {heroHeadline.split(' ').slice(0, -1).join(' ')}{' '}
            <span style={{ color: cs.primary }}>{heroHeadline.split(' ').slice(-1)[0]}</span>
          </h1>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-2/3 mx-auto h-14 mb-12">
          <p style={{ fontFamily: DISPLAY, fontWeight: 300, fontStyle: 'italic' }} className="text-neutral-500 text-lg max-w-lg mx-auto">{hero?.subheadline || websiteData.tagline}</p>
        </Skeleton>

        {/* Full-width image with circular badge */}
        <div className="max-w-5xl mx-auto relative">
          <Skeleton isLoading={isLoading} className="rounded-[3rem] aspect-video">
            <img src={heroImageUrl} className="rounded-[3rem] w-full h-full object-cover shadow-xl" alt="" />
          </Skeleton>
          {/* Spinning circular badge */}
          <div className="absolute -bottom-8 -right-4 md:right-4 w-28 h-28 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: cs.primary }}>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute animate-spin" style={{ animationDuration: '20s' }}>
              <path id="circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text style={{ fontFamily: DISPLAY, fontSize: '10.5px', fontStyle: 'italic' }} fill="white">
                <textPath href="#circle">Frisch • Regional • Täglich • Handgemacht •</textPath>
              </text>
            </svg>
            <Utensils size={20} className="relative z-10 text-white" />
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-56 h-14 mx-auto mb-14">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }} className="text-center">
                Unser <span style={{ color: cs.primary }}>Angebot</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-60">
                  <div className="p-8 border border-neutral-200 rounded-3xl bg-[#FBF7F0] hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-full mb-5 flex items-center justify-center" style={{ backgroundColor: cs.primary + '20' }}>
                      <Utensils size={22} style={{ color: cs.primary }} />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: '1.3rem' }} className="mb-3">{service.title}</h3>
                    <p style={{ fontFamily: DISPLAY, fontWeight: 300 }} className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-3xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
              <span className="text-xs uppercase tracking-[0.2em] mb-4 block" style={{ color: cs.primary, fontFamily: DISPLAY }}>Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.2 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: DISPLAY, fontWeight: 300, lineHeight: 1.8 }} className="text-neutral-600">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Gäste sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, fontSize: '1.3rem' }}>{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-neutral-400 text-sm">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 7. LUXURY (High-End & Premium)
// ================================================================
// Aesthetic: Fashion editorial. Libre Baskerville italic, rich near-black.
// Key move: Full-bleed cinematic hero, maximum negative space, thin accent lines.
export function LuxuryLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Termin vereinbaren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Libre Baskerville', Georgia, serif";
  const BODY = "'Jost', 'Helvetica Neue', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#0C0A09] text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#0C0A09]/80 backdrop-blur-sm">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.35rem', fontWeight: 400, letterSpacing: '0.04em' }}>{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ fontFamily: BODY, fontWeight: 400, letterSpacing: '0.15em', fontSize: '0.7rem', borderColor: cs.primary, color: cs.primary }} className="px-8 py-3 border uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Full-bleed image with text overlay */}
      <section id="hero" className="relative min-h-screen flex items-end pb-24 px-8">
        <div className="absolute inset-0">
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-45" alt="" />
          </Skeleton>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            <Skeleton isLoading={isLoading} className="w-full h-40 mb-8">
              <div className="w-16 h-px mb-8" style={{ backgroundColor: cs.primary }} />
              <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.1, fontSize: 'clamp(3rem, 7vw, 6.5rem)', letterSpacing: '0.01em' }}>
                {heroHeadline.split(' ').slice(0, -1).join(' ')}{' '}
                <span style={{ color: cs.primary }}>{heroHeadline.split(' ').slice(-1)[0]}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-2/3 h-14 mb-10">
              <p style={{ fontFamily: BODY, fontWeight: 300, letterSpacing: '0.06em' }} className="text-white/55 text-lg max-w-lg">{hero?.subheadline || websiteData.tagline}</p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-48 h-12">
              <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 400, letterSpacing: '0.15em', fontSize: '0.7rem', color: '#000' }} className="px-10 py-4 uppercase">{heroCta}</button>
            </Skeleton>
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <Skeleton isLoading={isLoading} className="w-64 h-16">
                <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
                  Exklusive <span style={{ color: cs.primary }}>Services</span>
                </h2>
              </Skeleton>
              <div className="w-32 h-px hidden md:block" style={{ backgroundColor: cs.primary + '40' }} />
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-white/10">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-10 bg-[#0C0A09] hover:bg-white/[0.02] transition-colors h-full">
                    <div className="w-8 h-px mb-8" style={{ backgroundColor: cs.primary }} />
                    <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: '1.4rem', lineHeight: 1.3 }} className="mb-4">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 300 }} className="text-white/50 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <section id="ueber-uns" className="py-24 px-8 scroll-mt-20" style={{ backgroundColor: '#130F0D' }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[3/4]">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <div className="w-12 h-px mb-10" style={{ backgroundColor: cs.primary }} />
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
              <span style={{ fontFamily: BODY, fontWeight: 300, letterSpacing: '0.2em', fontSize: '0.65rem', color: cs.primary }} className="uppercase block mb-6">Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', lineHeight: 1.2 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, fontWeight: 300, lineHeight: 1.85 }} className="text-white/55">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kunden" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <footer className="py-12 px-8 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Skeleton isLoading={isLoading} className="w-44 h-8">
            <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }}>{websiteData.businessName}</span>
          </Skeleton>
          <ul className="space-y-1 text-sm text-white/40 text-center">
            <FooterContact websiteData={websiteData} textClass="text-white/40" />
          </ul>
          <div className="flex gap-8 text-white/25 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10">
          <p className="text-white/20 text-xs text-center">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 8. MODERN (Agency & Software)
// ================================================================
// Aesthetic: Tech geometric. Syne 800 with Space Mono accents.
// Key move: 12-col grid hero, monospace decorative numbers, geometric accent blob.
export function ModernLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Projekt starten';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Syne', 'DM Sans', sans-serif";
  const BODY = "'DM Sans', 'Helvetica Neue', sans-serif";
  const MONO = "'Space Mono', 'Courier New', monospace";

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 500, letterSpacing: '0.02em' }} className="px-5 py-2.5 text-white text-sm rounded-lg">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="max-w-7xl mx-auto px-6 pt-36 pb-20 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <Skeleton isLoading={isLoading} className="w-full h-64 mb-8">
            <span style={{ fontFamily: MONO, fontSize: '0.7rem', color: cs.primary, letterSpacing: '0.1em' }} className="block mb-6">// Digitale Lösungen</span>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.92, fontSize: 'clamp(3rem, 7vw, 6.5rem)', letterSpacing: '-0.03em' }}>
              {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-10">
            <p className="text-neutral-500 text-xl max-w-lg leading-relaxed">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-44 h-12">
            <div className="flex gap-4">
              <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 500 }} className="px-8 py-3.5 text-white rounded-lg shadow-xl">{heroCta}</button>
              <button className="px-8 py-3.5 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors">Mehr erfahren</button>
            </div>
          </Skeleton>
        </div>
        <div className="lg:col-span-5 relative">
          <Skeleton isLoading={isLoading} className="rounded-2xl aspect-[4/5]">
            <img src={heroImageUrl} className="rounded-2xl w-full h-full object-cover" alt="" />
          </Skeleton>
          <div className="absolute -top-6 -left-6 w-32 h-32 rounded-2xl blur-3xl animate-pulse pointer-events-none" style={{ backgroundColor: cs.primary + '30' }} />
          {/* Monospace floating badge */}
          <div className="absolute bottom-6 -left-6 hidden lg:block bg-white border border-neutral-100 rounded-xl px-4 py-3 shadow-xl">
            <p style={{ fontFamily: MONO, fontSize: '0.6rem', color: cs.primary }}>{'{ success: true }'}</p>
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 bg-neutral-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-14 mb-14">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 bg-white rounded-2xl border border-neutral-100 hover:shadow-lg transition-all">
                    <span style={{ fontFamily: MONO, fontSize: '0.65rem', color: cs.primary + '80', letterSpacing: '0.05em' }} className="block mb-4">0{i + 1}</span>
                    <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: cs.primary + '15' }}>
                      <Zap size={20} style={{ color: cs.primary }} />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em' }} className="mb-3">{service.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span style={{ fontFamily: MONO, fontSize: '0.65rem', color: cs.primary, letterSpacing: '0.1em' }} className="block mb-4">// about_us</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-500 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-40 h-8 mb-3">
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-neutral-400 text-sm">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 9. NATURAL (Eco & Wellness)
// ================================================================
// Aesthetic: Botanical organic. Lora italic, organic cream base.
// Key move: Asymmetric pill-shaped images, leaf-green accents, flowing curves.
export function NaturalLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Beratung anfragen';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Unsere Philosophie';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Lora', Georgia, serif";
  const BODY = "'Source Sans 3', 'Georgia', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#F4F0E8] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#F4F0E8]/90 backdrop-blur-sm border-b border-neutral-300/40">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <div className="flex items-center gap-2">
            <Leaf size={20} style={{ color: cs.primary }} />
            <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }}>{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-36 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600 }} className="px-6 py-2.5 text-white text-sm rounded-full uppercase tracking-wide">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: asymmetric with pill images */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-36 pb-16 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Skeleton isLoading={isLoading} className="w-full h-56 mb-8">
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.2em', color: cs.primary }} className="uppercase block mb-4">Natürlich. Nachhaltig. Wirksam.</span>
            <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, lineHeight: 1.15, fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}>
              {heroHeadline.split(' ').slice(0, -1).join(' ')}{' '}
              <span style={{ color: cs.primary }}>{heroHeadline.split(' ').slice(-1)[0]}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-16 mb-10">
            <p className="text-neutral-600 text-lg leading-relaxed max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-44 h-12">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600 }} className="px-8 py-3.5 text-white rounded-full uppercase text-sm tracking-wider">{heroCta}</button>
          </Skeleton>
        </div>
        {/* Pill-shaped images */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[1/2] mt-12">
            <img src={heroImageUrl} className="rounded-full w-full h-full object-cover" alt="" />
          </Skeleton>
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[1/2]">
            <img src={heroImageUrl} className="rounded-full w-full h-full object-cover object-right" alt="" />
          </Skeleton>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-56 h-14 mx-auto mb-14">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }} className="text-center">
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 rounded-3xl border border-neutral-200 bg-[#F4F0E8] hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-full mb-5 flex items-center justify-center" style={{ backgroundColor: cs.primary + '20' }}>
                      <Flower size={22} style={{ color: cs.primary }} />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: '1.25rem' }} className="mb-3">{service.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-3xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs uppercase tracking-[0.2em] mb-4 block" style={{ color: cs.primary, fontFamily: BODY, fontWeight: 600 }}>Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.2 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Kunden sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <div className="flex items-center gap-2">
                <Leaf size={16} style={{ color: cs.primary }} />
                <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.2rem' }}>{websiteData.businessName}</span>
              </div>
            </Skeleton>
            <p className="text-neutral-400 text-sm">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// 10. PREMIUM (Corporate Executive)
// ================================================================
// Aesthetic: Understated authority. Instrument Serif italic with Plus Jakarta Sans.
// Key move: Dark navy left panel, clean white right panel – editorial power split.
export function PremiumLayoutV2({ websiteData, cs, heroImageUrl, isLoading }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Kontakt aufnehmen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Expertise';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = "'Instrument Serif', Georgia, serif";
  const BODY = "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif";

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }}>{websiteData.businessName}</span>
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em' }} className="px-6 py-2.5 text-white text-sm uppercase tracking-wider">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Navy left panel / white right panel */}
      <section id="hero" className="min-h-screen grid lg:grid-cols-[45%_55%] pt-[64px]">
        {/* Left: dark authority panel */}
        <div className="bg-[#0F1E3C] text-white p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10">
            <Skeleton isLoading={isLoading} className="w-full h-56 mb-8">
              <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.1, fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)' }}>
                {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-10">
              <p style={{ fontFamily: BODY, fontWeight: 300, lineHeight: 1.75 }} className="text-white/60 text-lg max-w-md">{hero?.subheadline || websiteData.tagline}</p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-44 h-12">
              <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.06em' }} className="px-8 py-3.5 text-white text-sm uppercase">{heroCta}</button>
            </Skeleton>
          </div>
        </div>
        {/* Right: image panel */}
        <div className="relative">
          <Skeleton isLoading={isLoading} className="w-full h-full min-h-[60vh]">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10" />
          </Skeleton>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-14 mb-14">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2rem, 4.5vw, 3.8rem)' }}>
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-8 border border-neutral-100 hover:shadow-xl transition-all bg-white group" style={{ borderTop: `3px solid ${cs.primary}` }}>
                    <Target size={24} style={{ color: cs.primary }} className="mb-5" />
                    <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: '1.3rem' }} className="mb-3">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 400 }} className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cs.primary }}>
                      <span>Mehr erfahren</span><ArrowRight size={12} />
                    </div>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <section id="ueber-uns" className="py-20 px-6 bg-[#F7F9FC] scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.2em', color: cs.primary }} className="uppercase block mb-3">Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.2 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, fontWeight: 400, lineHeight: 1.8 }} className="text-neutral-600">{aboutContent}</p>
            </Skeleton>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-xl" alt="" />
          </Skeleton>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <footer className="py-12 px-6 bg-[#0F1E3C] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }}>{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-white/30 text-sm">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-white/50">
            <FooterContact websiteData={websiteData} textClass="text-white/50" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
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
