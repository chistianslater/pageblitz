/**
 * PAGEBLITZ PREMIUM LAYOUTS v3.0 – DISTINCTIVELY DESIGNED
 * All content comes from websiteData (LLM-generated + real business data).
 * No more generic AI aesthetics – each layout has a unique typographic identity.
 */

import React from 'react';
import { motion } from 'framer-motion';
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
function ProcessSection({ websiteData, cs, isLoading, dark = false, displayFont = "inherit", bodyFont = "inherit", headlineStyle = {} }: any) {
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
  const hs = { fontFamily: displayFont, ...headlineStyle };

  return (
    <section className={`py-24 md:py-32 px-6 ${bg}`} style={{ fontFamily: bodyFont }}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-56 h-10 mx-auto mb-20">
          <h2 className={`text-3xl md:text-4xl text-center mb-20 ${textMain}`} style={hs}>
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
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white mb-4 z-10"
                  style={{ backgroundColor: cs.primary, ...hs }}>
                  {item.step}
                </div>
                <h3 className={`text-lg mb-2 ${textMain}`} style={hs}>{item.title}</h3>
                <p className={`text-sm leading-relaxed ${textSub}`} style={{ fontFamily: bodyFont }}>{item.description}</p>
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
    <section className={`py-16 md:py-24 px-6 ${bg}`}>
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
function ContactSection({ websiteData, cs, isLoading, dark = false, displayFont = "inherit", bodyFont = "inherit", headlineStyle = {} }: any) {
  const phone = getContactItem(websiteData, 'Phone');
  const address = getContactItem(websiteData, 'MapPin');
  const hours = getContactItem(websiteData, 'Clock');
  // addOnContactForm=true (or undefined for published sites) → show unlocked form
  const locked = websiteData?.addOnContactForm === false;

  const textMain = dark ? "text-white" : "text-neutral-900";
  const textSub = dark ? "text-white/50" : "text-neutral-500";
  const bg = dark ? "bg-white/5" : "bg-neutral-50";
  const topBorder = dark ? "border-t border-white/10" : "";
  const cardBg = dark ? "bg-neutral-800" : "bg-white";
  const borderColor = dark ? "rgba(255,255,255,0.1)" : "#e5e7eb";
  const border = dark ? "border-white/10" : "border-neutral-200";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "#f9fafb";
  const inputText = dark ? "rgba(255,255,255,0.85)" : "#111827";
  const inputPlaceholder = dark ? "rgba(255,255,255,0.3)" : "#9ca3af";
  const iconBg = `${cs.primary}20`;
  const labelStyle = { fontFamily: bodyFont, letterSpacing: '0.1em', fontSize: '0.7rem', textTransform: 'uppercase' as const };
  const inputStyle = {
    fontFamily: bodyFont, width: '100%', padding: '0.6rem 0.875rem',
    borderRadius: '0.5rem', border: `1px solid ${borderColor}`,
    background: inputBg, color: inputText, outline: 'none', fontSize: '0.9rem',
  };
  const hs = { fontFamily: displayFont, ...headlineStyle };

  return (
    <section id="kontakt" className={`py-24 md:py-32 px-6 scroll-mt-20 ${bg} ${topBorder}`} style={{ fontFamily: bodyFont }}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-48 h-10 mb-16">
          <h2 className={`text-3xl md:text-4xl mb-16 ${textMain}`} style={hs}>Kontakt</h2>
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
                    <p className={`mb-1 ${textSub}`} style={labelStyle}>Adresse</p>
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
                    <p className={`mb-1 ${textSub}`} style={labelStyle}>Telefon</p>
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
                    <p className={`mb-1 ${textSub}`} style={labelStyle}>Öffnungszeiten</p>
                    <p className={`font-medium whitespace-pre-line ${textMain}`}>{hours}</p>
                  </div>
                </div>
              </Skeleton>
            )}
          </div>

          {/* Right: contact form – unlocked when addOnContactForm is active */}
          <div className="relative">
            <div className={`rounded-xl border ${cardBg} ${border} p-6 ${locked ? 'opacity-40 blur-[2px] pointer-events-none select-none' : ''}`}>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className={`block mb-1.5 ${textSub}`} style={labelStyle}>Name</label>
                  <input type="text" placeholder="Max Mustermann" style={inputStyle}
                    className="focus:outline-none" />
                </div>
                <div>
                  <label className={`block mb-1.5 ${textSub}`} style={labelStyle}>E-Mail</label>
                  <input type="email" placeholder="max@beispiel.de" style={inputStyle}
                    className="focus:outline-none" />
                </div>
                <div>
                  <label className={`block mb-1.5 ${textSub}`} style={labelStyle}>Nachricht</label>
                  <textarea rows={4} placeholder="Ihre Nachricht…"
                    style={{ ...inputStyle, resize: 'none' as const }}
                    className="focus:outline-none" />
                </div>
                {/* DSGVO checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <div className="mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center"
                    style={{ borderColor: inputPlaceholder, backgroundColor: inputBg }}>
                  </div>
                  <p className={`text-xs leading-relaxed ${textSub}`} style={{ fontFamily: bodyFont }}>
                    Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                    <a href="#datenschutz" className="underline underline-offset-2" style={{ color: cs.primary }}>
                      Datenschutzerklärung
                    </a>{' '}
                    zu.
                  </p>
                </div>
                <button type="submit"
                  className="w-full py-3 px-6 text-white font-bold tracking-wide rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: cs.primary, ...hs }}>
                  Nachricht senden
                </button>
              </form>
            </div>
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`${cardBg} rounded-xl border ${border} shadow-lg px-6 py-5 text-center max-w-xs w-full`}>
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                    <Shield size={22} className="text-neutral-400" />
                  </div>
                  <p className={`font-bold text-sm mb-1 ${textMain}`} style={hs}>Kontaktformular</p>
                  <p className={`text-xs mb-1 ${textSub}`}>Erhalte direkte Kundenanfragen über deine Website.</p>
                  <p className="text-xs font-semibold mb-4" style={{ color: cs.primary }}>Ab 4,90 € / Monat</p>
                  <button className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-widest text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: cs.primary, fontFamily: displayFont }}>
                    Freischalten
                  </button>
                </div>
              </div>
            )}
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
      {hours && <li className={`flex items-start gap-2 ${textClass}`}><Clock size={14} className="mt-0.5 shrink-0" /><span style={{ whiteSpace: 'pre-line' }}>{hours}</span></li>}
    </>
  );
}

// ── FONT HELPERS ─────────────────────────────────────────────────
/** Returns the headline/display font – uses user-selected headlineFont if set, else layout default */
function getDisplayFont(websiteData: any, fallback: string): string {
  const hlFont = websiteData?.designTokens?.headlineFont;
  return hlFont ? `'${hlFont}', sans-serif` : fallback;
}

/** Returns the logo font – uses user-selected logoFont if set, else falls back to display font */
function resolveLogoFont(websiteData: any, fallback: string): string {
  const logoFont = (websiteData as any)?.logoFont;
  return logoFont ? `'${logoFont}', sans-serif` : fallback;
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
  const DISPLAY = getDisplayFont(websiteData, "'Space Grotesk', Impact, 'Arial Narrow', sans-serif");
  const BODY = "'Plus Jakarta Sans', 'Arial', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 900, letterSpacing: '0.02em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#0A0A0A] text-white overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10 relative">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.25rem', fontStyle: 'italic' }} className="uppercase">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.1em' }} className="px-10 py-3 text-white text-xs uppercase hover:scale-105 transition-transform">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: split grid with industrial accents and overlapping elements */}
      <section id="hero" className="min-h-[110vh] grid lg:grid-cols-[54%_46%] pt-[120px] relative overflow-hidden">
        <motion.div 
          className="flex flex-col justify-center p-10 lg:p-24 relative z-20"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute left-0 top-0 w-[4px] h-full" style={{ backgroundColor: cs.primary }} />
          <div className="absolute -top-12 -left-6 text-[12vw] font-black opacity-[0.03] select-none pointer-events-none text-white whitespace-nowrap uppercase tracking-tighter">
            Engineering Excellence
          </div>
          
          <Skeleton isLoading={isLoading} className="w-full h-64 mb-10">
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, lineHeight: 0.85, fontSize: 'clamp(4rem, 12vw, 10.5rem)', letterSpacing: '-0.04em' }} className="uppercase drop-shadow-2xl">
              {hl.main}<br /><span style={{ color: cs.primary }} className="italic">{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-14 mb-16">
            <p style={{ fontFamily: BODY, fontWeight: 400, lineHeight: 1.7 }} className="text-white/50 text-xl max-w-md border-l border-white/20 pl-6">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-14">
            <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.1em' }} className="px-12 py-5 text-white uppercase text-xs inline-block hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">{heroCta}</button>
          </Skeleton>
        </motion.div>
        
        <motion.div
          className="relative min-h-[60vh] overflow-hidden z-10 group"
          initial={{ opacity: 0, scale: 1.1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 z-20 pointer-events-none" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}>
            <div className="absolute top-1/4 -left-12 w-24 h-96 bg-white/5 backdrop-blur-3xl border-l border-white/10 hidden lg:block skew-x-12" />
          </div>

          <Skeleton isLoading={isLoading} className="absolute inset-0">
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}>
              <img src={heroImageUrl} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] scale-110 group-hover:scale-100" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
            </div>
          </Skeleton>
        </motion.div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-16 mb-12">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.02em' }} className="uppercase">
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="border-t border-white/10">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-28">
                  <div className="border-b border-white/10 py-10 flex items-center gap-6 hover:bg-white/[0.02] transition-colors group px-2">
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

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3]">
            <img src={aboutImg} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-36 mb-6">
              <span className="text-xs uppercase tracking-[0.2em] mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, letterSpacing: '0.02em', fontSize: 'clamp(2.2rem, 5vw, 4rem)' }} className="uppercase leading-tight">{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-white/60 leading-relaxed text-lg">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kundenstimmen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-10 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-40 h-8 mb-2">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.1rem' }} className="uppercase">{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Cormorant Garamond', 'Garamond', Georgia, serif");
  const BODY = "'Jost', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 300 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#FFFDFB] text-neutral-900 overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#FFFDFB]/80 backdrop-blur-md border-b border-neutral-200/40 relative">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '0.02em' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-36 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.15em' }} className="px-8 py-3 text-white text-[10px] uppercase rounded-full hover:scale-105 transition-transform shadow-lg">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: editorial asymmetrical with overlapping elements */}
      <section id="hero" className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 md:gap-24 items-center min-h-[90vh] pb-32 md:pb-48 pt-32 md:pt-48 relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-neutral-50/50 -z-10 skew-x-12 translate-x-1/2" />
        
        <motion.div 
          className="relative order-2 lg:order-1 lg:col-span-5"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Skeleton isLoading={isLoading} className="w-full aspect-[4/5] rounded-t-full">
            <div 
              className="overflow-hidden aspect-[4/5] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-t-full relative"
              style={{ borderRadius: '60% 60% 0 0 / 40% 40% 0 0' }}
            >
              <img 
                src={heroImageUrl} 
                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[3s] grayscale-[0.2] hover:grayscale-0" 
                alt=""
              />
              <div className="absolute inset-0 bg-neutral-200/10 mix-blend-overlay" />
            </div>
          </Skeleton>
          
          {/* Overlapping Badge */}
          <div className="absolute -bottom-10 -right-6 md:-right-12 bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-2xl shadow-2xl border border-neutral-100 relative z-20 max-w-[240px]">
            <div className="flex gap-1.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="currentColor" className="text-yellow-500" />
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-800 mb-2 leading-tight">Ausgezeichnete Qualität</p>
            <p className="text-[9px] uppercase tracking-widest text-neutral-400">Edition 2026</p>
          </div>
        </motion.div>

        <motion.div 
          className="order-1 lg:order-2 lg:col-span-7 lg:pl-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Skeleton isLoading={isLoading} className="w-full h-32 md:h-64 mb-10">
            <div className="absolute -top-16 -left-8 text-xs font-serif italic text-neutral-300 select-none pointer-events-none text-[10vw] opacity-30">
              {(heroHeadline || 'E').charAt(0)}
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.0, letterSpacing: '-0.02em', fontSize: 'clamp(3.5rem, 8vw, 7.5rem)' }}>
              {heroHeadline.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 0 ? "block text-right lg:text-left" : "block text-left lg:text-right opacity-60"}>
                  {word}
                </span>
              ))}
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-24 mb-16">
            <p className="text-lg md:text-2xl text-neutral-500 font-light leading-relaxed mb-16 max-w-lg italic border-l-2 border-neutral-200 pl-8">
              {hero?.subheadline || websiteData.tagline}
            </p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-16">
            <button 
              style={{ backgroundColor: cs.primary }} 
              className="px-10 md:px-16 py-5 md:py-6 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-transform shadow-2xl"
            >
              {heroCta}
            </button>
          </Skeleton>
        </motion.div>
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

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[3/4]">
            <img src={aboutImg} className="w-full h-full object-cover" alt="" />
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
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-8 bg-[#1A1511] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Skeleton isLoading={isLoading} className="w-40 h-8">
            <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Outfit', 'Helvetica Neue', sans-serif");
  const BODY = "'Outfit', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 600 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100 relative">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-8 rounded-full" style={{ backgroundColor: cs.primary }} />
            <span style={{ fontFamily: resolveLogoFont(websiteData, BODY), fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em' }} className="px-8 py-3 text-white text-xs rounded-full uppercase shadow-lg hover:scale-105 transition-transform">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="max-w-7xl mx-auto px-6 pt-48 pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          className="lg:col-span-6 xl:col-span-5"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Skeleton isLoading={isLoading} className="w-full h-52 mb-10">
            <div className="mb-10">
              <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.3em', color: cs.primary }} className="uppercase block mb-6 border-l-2 border-primary pl-4">Excellence & Precision</span>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.95, fontSize: 'clamp(3.5rem, 7vw, 7.5rem)', textTransform: 'uppercase', letterSpacing: '-0.04em' }}>
                Expert <br /><span style={{ color: cs.primary }}>{hl.last}</span>
              </h1>
            </div>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-16 mb-16">
            <p style={{ fontFamily: BODY, fontWeight: 400, lineHeight: 1.75 }} className="text-neutral-400 text-xl max-w-md">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-44 h-12">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600 }} className="px-10 py-4 text-white text-xs rounded-full uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">{heroCta}</button>
          </Skeleton>
        </motion.div>
        <motion.div 
          className="lg:col-span-6 xl:col-span-7 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <Skeleton isLoading={isLoading} className="aspect-square rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
            <img src={heroImageUrl} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110 hover:scale-100" alt="" />
          </Skeleton>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-3xl hidden lg:flex items-center justify-center shadow-2xl backdrop-blur-3xl border border-white/20 bg-white/10" style={{ backgroundColor: cs.primary + '20' }}>
            <div className="text-center">
              <Award size={32} style={{ color: cs.primary }} className="mx-auto mb-2" />
              <div style={{ fontFamily: BODY, fontSize: '0.6rem', letterSpacing: '0.15em', fontWeight: 800 }} className="uppercase text-neutral-800">Certified</div>
            </div>
          </div>
        </motion.div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 md:py-32 px-6 bg-neutral-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-14 mb-16">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
                Unsere <em style={{ color: cs.primary }}>Leistungen</em>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="bg-white p-10 h-full shadow-sm hover:shadow-md transition-shadow" style={{ borderLeft: `3px solid ${cs.primary}` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: cs.primary }}>
                      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>{i + 1}</span>
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: '1.25rem' }} className="mb-4">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 400 }} className="text-neutral-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
              <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.2em', color: cs.primary }} className="uppercase block mb-4">Über uns</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.2 }}>
                {aboutHeadline.split(' ').slice(0, -1).join(' ')}{' '}
                <em style={{ color: cs.primary }}>{aboutHeadline.split(' ').slice(-1)[0]}</em>
              </h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, lineHeight: 1.8, fontSize: '1.125rem' }} className="text-neutral-500">{aboutContent}</p>
            </Skeleton>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={aboutImg} className="w-full h-full object-cover rounded-2xl shadow-2xl" alt="" />
          </Skeleton>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Patienten sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-40 h-8 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-sm" style={{ backgroundColor: cs.primary }} />
                <span style={{ fontFamily: resolveLogoFont(websiteData, BODY), fontWeight: 500, fontSize: '1rem' }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Playfair Display', Georgia, serif");
  const BODY = "'Source Sans 3', 'Georgia', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 900 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#F2EBD9] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#F2EBD9]/90 backdrop-blur-sm border-b border-neutral-300/50">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.01em' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.06em' }} className="px-7 py-2.5 text-white text-sm uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="min-h-screen grid lg:grid-cols-2 pt-[80px]">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-[#F2EBD9]/50">
          <Skeleton isLoading={isLoading} className="w-full h-56 mb-10">
            <Ruler size={36} style={{ color: cs.primary }} className="mb-8" />
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, lineHeight: 1.1, fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
              {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-14">
            <p className="text-neutral-600 text-lg leading-relaxed max-w-md border-l-2 border-neutral-300 pl-6">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-44 h-12">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.08em' }} className="px-12 py-5 text-white uppercase text-sm shadow-xl hover:scale-105 transition-transform">{heroCta}</button>
          </Skeleton>
        </div>
        <div className="relative min-h-[50vh] overflow-hidden">
          <Skeleton isLoading={isLoading} className="absolute inset-0">
            <img src={heroImageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#F2EBD9]/20" />
          </Skeleton>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 md:py-32 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-14 mb-16">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-10 bg-[#F2EBD9]/60 h-full relative overflow-hidden hover:bg-[#F2EBD9] transition-colors border border-neutral-200">
                    <div className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center shadow-sm" style={{ backgroundColor: cs.primary }}>
                      <span style={{ fontFamily: DISPLAY, fontWeight: 900, color: 'white', fontSize: '1.4rem', lineHeight: 1 }}>{i + 1}</span>
                    </div>
                    <Award size={28} style={{ color: cs.primary }} className="mb-6" />
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.4rem' }} className="mb-4 pr-8">{service.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] shadow-2xl overflow-hidden rounded-sm">
            <img src={aboutImg} className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
              <span className="text-xs uppercase tracking-[0.2em] mb-6 block font-bold" style={{ color: cs.primary }}>// Handwerk & Expertise</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.1 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed text-lg">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Kunden sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 700, fontSize: '1.2rem' }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Bebas Neue', Impact, 'Arial Narrow', sans-serif");
  const BODY = "'Rajdhani', 'Arial', sans-serif";
  const HL: React.CSSProperties = { letterSpacing: '0.04em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#080808] text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#080808]/90 backdrop-blur-sm border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontSize: '1.6rem', letterSpacing: '0.08em' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, letterSpacing: '0.12em', fontSize: '1.05rem' }} className="px-8 py-2.5 text-white uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Giant Bebas headline with skewed image */}
      <section id="hero" className="relative min-h-screen flex items-center pt-32 md:pt-48 pb-24">
        <div className="absolute right-0 w-[55%] h-full overflow-hidden" style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)', borderLeft: `6px solid ${cs.primary}` }}>
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-55 scale-110 grayscale" alt="" />
          </Skeleton>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <Skeleton isLoading={isLoading} className="w-full h-72 mb-12">
            <h1 style={{ fontFamily: DISPLAY, lineHeight: 0.9, fontSize: 'clamp(5rem, 14vw, 13rem)', letterSpacing: '0.02em' }}>
              {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/5 h-14 mb-16">
            <p style={{ fontFamily: BODY, fontWeight: 500, letterSpacing: '0.04em' }} className="text-white/70 text-xl max-w-sm border-l-4 pl-8" style={{ borderColor: cs.primary }}>{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <div className="flex flex-wrap gap-6 pt-4">
            <Skeleton isLoading={isLoading} className="w-56 h-16">
              <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, letterSpacing: '0.12em', fontSize: '1.15rem' }} className="px-12 py-5 text-white uppercase shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">{heroCta}</button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-56 h-16">
              <button style={{ fontFamily: DISPLAY, letterSpacing: '0.1em', fontSize: '1.1rem' }} className="px-10 py-5 border-2 border-white text-white uppercase hover:bg-white hover:text-black transition-colors">Mehr erfahren</button>
            </Skeleton>
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-72 h-20 mb-16">
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3.4rem, 8vw, 7rem)', letterSpacing: '0.03em', lineHeight: 0.9 }}>
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-10 border border-white/10 hover:border-white/40 transition-all group bg-white/5">
                    <div className="w-14 h-14 mb-8 flex items-center justify-center shadow-lg" style={{ backgroundColor: cs.primary }}>
                      <Dumbbell size={28} className="text-white" />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontSize: '1.8rem', letterSpacing: '0.04em', lineHeight: 1.1 }} className="mb-4">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 400 }} className="text-white/60 leading-relaxed text-sm">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 md:py-32 px-6 bg-[#0a0a0a] scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <Skeleton isLoading={isLoading} className="aspect-square grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl overflow-hidden">
            <img src={aboutImg} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-36 mb-8">
              <span className="text-xs uppercase tracking-[0.3em] mb-6 block font-bold" style={{ color: cs.primary, fontFamily: BODY }}>// MISSION_STATEMENT</span>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                {aboutHeadline.split(' ').slice(0, -1).join(' ')}{' '}
                <span style={{ color: cs.primary }}>{aboutHeadline.split(' ').slice(-1)[0]}</span>
              </h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, fontWeight: 400, fontSize: '1.125rem' }} className="text-white/60 leading-relaxed">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsDark websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kunden" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-10 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-2">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontSize: '1.4rem', letterSpacing: '0.06em' }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Fraunces', Georgia, serif");
  const BODY = "'Jost', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 700 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#FBF7F0] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#FBF7F0]/90 backdrop-blur-sm border-b border-neutral-200/60">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 300 }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300 }} className="px-6 py-2.5 text-white text-sm rounded-full">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: editorial centered */}
      <section id="hero" className="pt-48 pb-32 text-center px-6">
        <Skeleton isLoading={isLoading} className="w-3/4 mx-auto h-44 mb-10">
          <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, lineHeight: 1.1, fontSize: 'clamp(3rem, 8vw, 7.5rem)' }}>
            {heroHeadline.split(' ').slice(0, -1).join(' ')}{' '}
            <span style={{ color: cs.primary }}>{heroHeadline.split(' ').slice(-1)[0]}</span>
          </h1>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-2/3 mx-auto h-14 mb-16">
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '1.25rem' }} className="text-neutral-500 max-w-lg mx-auto italic">{hero?.subheadline || websiteData.tagline}</p>
        </Skeleton>

        {/* Full-width image with circular badge */}
        <div className="max-w-5xl mx-auto relative px-4">
          <Skeleton isLoading={isLoading} className="rounded-[3rem] aspect-video">
            <img src={heroImageUrl} className="rounded-[3rem] w-full h-full object-cover shadow-2xl" alt="" />
          </Skeleton>
          {/* Spinning circular badge */}
          <div className="absolute -bottom-10 -right-4 md:right-8 w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl"
            style={{ backgroundColor: cs.primary }}>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute animate-spin" style={{ animationDuration: '25s' }}>
              <path id="circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text style={{ fontFamily: DISPLAY, fontSize: '10px', fontStyle: 'italic', letterSpacing: '0.05em' }} fill="white">
                <textPath href="#circle">Frisch • Regional • Täglich • Handgemacht •</textPath>
              </text>
            </svg>
            <Utensils size={24} className="relative z-10 text-white" />
          </div>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 md:py-32 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-56 h-14 mx-auto mb-16">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }} className="text-center">
                Unser <span style={{ color: cs.primary }}>Angebot</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-10 border border-neutral-100 rounded-[2.5rem] bg-[#FBF7F0] hover:shadow-xl transition-all duration-500">
                    <div className="w-14 h-14 rounded-full mb-6 flex items-center justify-center shadow-inner" style={{ backgroundColor: cs.primary + '15' }}>
                      <Utensils size={24} style={{ color: cs.primary }} />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem' }} className="mb-4">{service.title}</h3>
                    <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.95rem' }} className="text-neutral-500 leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-[3rem] shadow-2xl overflow-hidden">
            <img src={aboutImg} className="w-full h-full object-cover rounded-[3rem] hover:scale-105 transition-transform duration-[3s]" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
              <span className="text-xs uppercase tracking-[0.3em] mb-6 block font-bold" style={{ color: cs.primary, fontFamily: DISPLAY }}>// Unsere Geschichte</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.1 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, fontWeight: 300, lineHeight: 1.8, fontSize: '1.125rem' }} className="text-neutral-600">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Gäste sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontWeight: 300, fontSize: '1.3rem' }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Playfair Display', Georgia, serif");
  const BODY = "'Tenor Sans', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.01em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#0C0A09] text-white overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#0C0A09]/80 backdrop-blur-md border-b border-white/5 relative">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.45rem', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ fontFamily: BODY, fontWeight: 400, letterSpacing: '0.25em', fontSize: '0.65rem', backgroundColor: cs.primary, color: '#000' }} className="px-10 py-3 rounded-full uppercase hover:bg-white transition-all shadow-2xl">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Cinematic with dramatic scale and overlays */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center text-center px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-60 grayscale scale-110 hover:scale-100 transition-transform duration-[4s]" alt="" />
          </Skeleton>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-black" />
        </div>
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <div className="flex justify-center items-center gap-6 mb-12">
            <div className="h-px w-16 bg-white/30" />
            <Shield size={24} className="text-yellow-500" />
            <div className="h-px w-16 bg-white/30" />
          </div>
          <Skeleton isLoading={isLoading} className="w-full h-48 mb-16 mx-auto">
            <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, lineHeight: 0.95, fontSize: 'clamp(4rem, 12vw, 11rem)', letterSpacing: '-0.02em' }}>
              Beyond <br />Perfection
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 h-14 mb-20 mx-auto">
            <p style={{ fontFamily: BODY, fontWeight: 300, letterSpacing: '0.15em', fontSize: '1.25rem' }} className="text-white/60 max-w-xl mx-auto italic border-y border-white/10 py-6">{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-56 h-14 mx-auto">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 400, letterSpacing: '0.4em', fontSize: '0.75rem', color: '#000' }} className="px-14 py-6 rounded-full uppercase hover:bg-white hover:scale-105 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10">{heroCta}</button>
          </Skeleton>
        </motion.div>
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

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 px-8 scroll-mt-20" style={{ backgroundColor: '#130F0D' }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[3/4]">
            <img src={aboutImg} className="w-full h-full object-cover" alt="" />
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
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-8 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Skeleton isLoading={isLoading} className="w-44 h-8">
            <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Clash Display', 'Syne', sans-serif");
  const BODY = "'Satoshi', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 800, letterSpacing: '-0.03em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;
  const MONO = "'Space Mono', 'Courier New', monospace";

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden grain-overlay">
      {/* Background Gradient Mesh */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-10 pointer-events-none" 
        style={{ backgroundColor: cs.primary }} 
      />

      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100 relative">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', fontStyle: 'italic' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.02em' }} className="px-6 py-2.5 text-white text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform">{heroCta}</button>
        </Skeleton>
      </nav>

      <section id="hero" className="max-w-7xl mx-auto px-6 pt-48 pb-32 grid lg:grid-cols-12 gap-16 items-center">
        <motion.div 
          className="lg:col-span-7"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Skeleton isLoading={isLoading} className="w-full h-64 mb-10">
            <span style={{ fontFamily: MONO, fontSize: '0.75rem', color: cs.primary, letterSpacing: '0.2em' }} className="block mb-8 uppercase tracking-[0.3em] font-bold">// Digitale Innovation</span>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.95, fontSize: 'clamp(3rem, 8vw, 7.5rem)', letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
              {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-16">
            <p className="text-neutral-500 text-2xl max-w-lg leading-relaxed font-light border-l-4 pl-8" style={{ borderColor: cs.primary + '30' }}>{hero?.subheadline || websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-16">
            <div className="flex flex-wrap gap-6 pt-4">
              <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600 }} className="px-12 py-5 text-white rounded-full shadow-2xl hover:scale-105 transition-transform uppercase text-xs tracking-widest">{heroCta}</button>
              <button className="px-12 py-5 border-2 border-neutral-100 rounded-full font-bold hover:bg-neutral-50 transition-all uppercase text-xs tracking-widest">Case Studies</button>
            </div>
          </Skeleton>
        </motion.div>
        <motion.div 
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Skeleton isLoading={isLoading} className="rounded-[2.5rem] aspect-[4/5] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
            <img src={heroImageUrl} className="w-full h-full object-cover hover:scale-110 transition-transform duration-[3s]" alt="" />
          </Skeleton>
          <div className="absolute -top-6 -left-6 w-32 h-32 rounded-2xl blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: cs.primary }} />
          {/* Monospace floating badge */}
          <div className="absolute bottom-10 -left-10 hidden lg:block bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl px-6 py-4 shadow-2xl">
            <p style={{ fontFamily: MONO, fontSize: '0.65rem', color: cs.primary, fontWeight: 700 }} className="tracking-tight">{'{ status: "excellence" }'}</p>
          </div>
        </motion.div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-20 px-6 bg-white scroll-mt-20">
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

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={aboutImg} className="w-full h-full object-cover rounded-2xl" alt="" />
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
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-40 h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Cormorant Garamond', Georgia, serif");
  const BODY = "'DM Sans', 'Georgia', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 700 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#fcfaf7] text-[#4a4a4a] overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#fcfaf7]/80 backdrop-blur-md border-b border-green-900/5 relative">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <div className="flex items-center gap-2">
            <Leaf size={24} style={{ color: cs.primary }} />
            <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 400 }}>{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-36 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600 }} className="px-8 py-2.5 text-white text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: organic asymmetrical with pill images and background accents */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-48 pb-32 grid lg:grid-cols-2 gap-20 items-center relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-green-900/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Flower className="text-green-800 mb-10" size={56} />
          <Skeleton isLoading={isLoading} className="w-full h-56 mb-10">
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.4em', color: cs.primary }} className="uppercase block mb-8 tracking-[0.4em]">Natürlich. Nachhaltig. Rein.</span>
            <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, lineHeight: 0.95, fontSize: 'clamp(3.5rem, 8vw, 8.5rem)' }}>
              Rooted <br /><span style={{ color: cs.primary }} className="font-normal">{heroHeadline.split(' ').slice(-1)[0]}</span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-16 mb-16">
            <p className="text-[#4a4a4a]/70 text-2xl leading-relaxed max-w-md italic border-l-2 border-green-100 pl-8">"{hero?.subheadline || websiteData.tagline}"</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-44 h-12">
            <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600 }} className="px-12 py-5 text-white rounded-full uppercase text-xs tracking-widest shadow-2xl hover:bg-green-900 transition-colors">{heroCta}</button>
          </Skeleton>
        </motion.div>
        
        {/* Pill-shaped images with coordination */}
        <motion.div 
          className="grid grid-cols-2 gap-6 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-green-900/5 blur-[100px] rounded-full pointer-events-none" />
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[2/3] mt-16 shadow-2xl">
            <img src={heroImageUrl} className="rounded-full w-full h-full object-cover" alt="" />
          </Skeleton>
          <Skeleton isLoading={isLoading} className="rounded-full aspect-[2/3] shadow-2xl">
            <img src={aboutImg} className="rounded-full w-full h-full object-cover scale-110" alt="" />
          </Skeleton>
        </motion.div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 md:py-32 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-56 h-14 mx-auto mb-16">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }} className="text-center">
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-64">
                  <div className="p-10 rounded-[2.5rem] border border-neutral-100 bg-[#F4F0E8] hover:shadow-xl transition-all duration-500">
                    <div className="w-14 h-14 rounded-full mb-6 flex items-center justify-center shadow-inner" style={{ backgroundColor: cs.primary + '20' }}>
                      <Flower size={24} style={{ color: cs.primary }} />
                    </div>
                    <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: '1.4rem' }} className="mb-4 pr-4">{service.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-[3rem] shadow-2xl overflow-hidden">
            <img src={aboutImg} className="w-full h-full object-cover rounded-[3rem] hover:scale-105 transition-transform duration-[3s]" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
              <span className="text-xs uppercase tracking-[0.4em] mb-6 block font-bold" style={{ color: cs.primary, fontFamily: BODY }}>// Natürliche Balance</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.1 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed text-lg">{aboutContent}</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={true} heading="Was Kunden sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <div className="flex items-center gap-2">
                <Leaf size={16} style={{ color: cs.primary }} />
                <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem' }}>{websiteData.businessName}</span>
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
  const DISPLAY = getDisplayFont(websiteData, "'Instrument Serif', Georgia, serif");
  const BODY = "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 400 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-44 h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em' }} className="px-6 py-2.5 text-white text-sm uppercase tracking-wider">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Navy left panel / white right panel */}
      <section id="hero" className="min-h-screen grid lg:grid-cols-[45%_55%] pt-[80px]">
        {/* Left: dark authority panel */}
        <div className="bg-[#0F1E3C] text-white p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10">
            <Skeleton isLoading={isLoading} className="w-full h-56 mb-12">
              <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.15, fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)' }}>
                {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-16">
              <p style={{ fontFamily: BODY, fontWeight: 300, lineHeight: 1.8, fontSize: '1.2rem' }} className="text-white/60 max-w-md border-l border-white/20 pl-8 italic">{hero?.subheadline || websiteData.tagline}</p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-44 h-12">
              <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.08em' }} className="px-10 py-4 text-white text-sm uppercase shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">{heroCta}</button>
            </Skeleton>
          </div>
        </div>
        {/* Right: image panel */}
        <div className="relative min-h-[60vh] overflow-hidden">
          <Skeleton isLoading={isLoading} className="absolute inset-0">
            <img src={heroImageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10" />
          </Skeleton>
        </div>
      </section>

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      {services.length > 0 && (
        <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <Skeleton isLoading={isLoading} className="w-64 h-14 mb-16">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2.4rem, 5vw, 4.2rem)' }}>
                Unsere <span style={{ color: cs.primary }}>Leistungen</span>
              </h2>
            </Skeleton>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <Skeleton key={i} isLoading={isLoading} className="h-72">
                  <div className="p-10 border border-neutral-100 hover:shadow-2xl transition-all duration-500 bg-white group flex flex-col justify-between" style={{ borderTop: `4px solid ${cs.primary}` }}>
                    <div>
                      <Target size={28} style={{ color: cs.primary }} className="mb-6 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: '1.6rem', lineHeight: 1.2 }} className="mb-4">{service.title}</h3>
                      <p style={{ fontFamily: BODY, fontWeight: 400, fontSize: '0.9rem' }} className="text-neutral-500 leading-relaxed">{service.description}</p>
                    </div>
                    <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" style={{ color: cs.primary }}>
                      <span>Mehr erfahren</span><ArrowRight size={14} />
                    </div>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <section id="ueber-uns" className="py-24 md:py-32 px-6 bg-[#F7F9FC] scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
              <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.3em', color: cs.primary }} className="uppercase block mb-4 tracking-[0.3em]">Exzellenz & Strategie</span>
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.1 }}>{aboutHeadline}</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p style={{ fontFamily: BODY, fontWeight: 400, lineHeight: 1.8, fontSize: '1.125rem' }} className="text-neutral-600">{aboutContent}</p>
            </Skeleton>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden">
            <img src={aboutImg} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="" />
          </Skeleton>
        </div>
      </section>

      <TestimonialsLight websiteData={websiteData} cs={cs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />

      <footer className="py-12 px-6 bg-[#0F1E3C] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Skeleton isLoading={isLoading} className="w-44 h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }}>{websiteData.businessName}</span>
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
