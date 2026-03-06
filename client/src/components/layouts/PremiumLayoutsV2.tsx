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
import { getVariantIndex } from '../../lib/layoutUtils';

// ── SKELETON ────────────────────────────────────────────────────
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  return (
    <div className={className}>
      {isLoading ? (
        <div className="bg-neutral-200 animate-pulse rounded-lg overflow-hidden w-full h-full">
          <div className="opacity-0 pointer-events-none">{children}</div>
        </div>
      ) : (
        children
      )}
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

/** Calculate font size based on headlineSize preference */
const getHeadlineFontSize = (headlineSize: string = 'large', baseSize: string = 'clamp(3rem, 8vw, 7rem)') => {
  const sizeMap: Record<string, Record<string, string>> = {
    large: {
      'clamp(3rem, 8vw, 7rem)': 'clamp(3rem, 8vw, 7rem)',     // HeroVariantA
      'clamp(3.5rem, 9vw, 8rem)': 'clamp(3.5rem, 9vw, 8rem)', // HeroVariantB
      'clamp(4rem, 12vw, 10rem)': 'clamp(4rem, 12vw, 10rem)', // HeroVariantC
      'clamp(2.8rem, 5.5vw, 5.5rem)': 'clamp(2.8rem, 5.5vw, 5.5rem)', // Premium
    },
    medium: {
      'clamp(3rem, 8vw, 7rem)': 'clamp(2.5rem, 6vw, 5rem)',
      'clamp(3.5rem, 9vw, 8rem)': 'clamp(3rem, 7vw, 6rem)',
      'clamp(4rem, 12vw, 10rem)': 'clamp(3.2rem, 9vw, 7rem)',
      'clamp(2.8rem, 5.5vw, 5.5rem)': 'clamp(2.4rem, 4.5vw, 4.5rem)',
    },
    small: {
      'clamp(3rem, 8vw, 7rem)': 'clamp(2rem, 5vw, 4rem)',
      'clamp(3.5rem, 9vw, 8rem)': 'clamp(2.5rem, 6vw, 5rem)',
      'clamp(4rem, 12vw, 10rem)': 'clamp(2.8rem, 8vw, 6rem)',
      'clamp(2.8rem, 5.5vw, 5.5rem)': 'clamp(2rem, 4vw, 3.5rem)',
    },
  };
  return sizeMap[headlineSize]?.[baseSize] || baseSize;
};

/** Calculate section headline sizes based on headlineSize preference */
const getSectionHeadlineSize = (headlineSize: string = 'large', type: 'services' | 'about' | 'testimonials' | 'contact' = 'services') => {
  const sizes = {
    large: {
      services: 'clamp(2rem, 4vw, 3rem)',
      about: 'clamp(1.8rem, 3.5vw, 2.5rem)',
      testimonials: 'clamp(1.8rem, 3.5vw, 2.5rem)',
      contact: 'clamp(1.8rem, 3.5vw, 2.5rem)',
    },
    medium: {
      services: 'clamp(1.75rem, 3.5vw, 2.5rem)',
      about: 'clamp(1.6rem, 3vw, 2.2rem)',
      testimonials: 'clamp(1.6rem, 3vw, 2.2rem)',
      contact: 'clamp(1.6rem, 3vw, 2.2rem)',
    },
    small: {
      services: 'clamp(1.5rem, 3vw, 2rem)',
      about: 'clamp(1.4rem, 2.5vw, 1.8rem)',
      testimonials: 'clamp(1.4rem, 2.5vw, 1.8rem)',
      contact: 'clamp(1.4rem, 2.5vw, 1.8rem)',
    },
  };
  return sizes[headlineSize as keyof typeof sizes]?.[type] || sizes.large[type];
};

/** Calculate body text size multiplier based on headlineSize */
const getBodyTextMultiplier = (headlineSize: string = 'large'): number => {
  const multipliers = {
    large: 1,
    medium: 0.95,
    small: 0.9,
  };
  return multipliers[headlineSize as keyof typeof multipliers] || 1;
};

// ── HERO VARIANTS ───────────────────────────────────────────────

function HeroVariantA({ websiteData, cs, isLoading, displayFont, bodyFont, heroImageUrl, heroCta, hl, headlineSize }: any) {
  return (
    <section id="hero" className="min-h-[90vh] grid lg:grid-cols-2 pt-[100px] items-center gap-12 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-start text-left relative z-10"
      >
        <Skeleton isLoading={isLoading} className="w-full min-h-[16rem] mb-8">
          <h1 style={{ fontFamily: displayFont, fontWeight: 800, lineHeight: 1.1, fontSize: getHeadlineFontSize(headlineSize, 'clamp(3rem, 8vw, 7rem)') }} className="uppercase drop-shadow-xl mb-0">
            {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
          </h1>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-3/4 min-h-[4rem] mb-12">
          <p style={{ fontFamily: bodyFont, borderColor: cs.primary }} className="text-neutral-400 text-xl leading-relaxed max-w-lg border-l-4 pl-6 drop-shadow-lg mb-0">
            {websiteData.sections?.find((s: any) => s.type === 'hero')?.subheadline || websiteData.tagline}
          </p>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-48 h-14 mt-4">
          <button style={{ backgroundColor: cs.primary, fontFamily: displayFont, fontWeight: 700 }} className="px-12 py-5 text-white uppercase text-xs rounded-full hover:scale-105 transition-transform shadow-xl">
            {heroCta}
          </button>
        </Skeleton>
      </motion.div>
      <motion.div 
        className="relative aspect-square"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <Skeleton isLoading={isLoading} className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
        </Skeleton>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl blur-3xl opacity-20" style={{ backgroundColor: cs.primary }} />
      </motion.div>
    </section>
  );
}

function HeroVariantB({ websiteData, cs, isLoading, displayFont, bodyFont, heroImageUrl, heroCta, hl, headlineSize }: any) {
  return (
    <section id="hero" className="pt-40 pb-32 text-center px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <Skeleton isLoading={isLoading} className="w-3/4 mx-auto min-h-[11rem] mb-12">
          <h1 style={{ fontFamily: displayFont, fontWeight: 800, lineHeight: 1.1, fontSize: getHeadlineFontSize(headlineSize, 'clamp(3.5rem, 9vw, 8rem)') }} className="uppercase drop-shadow-xl mb-0">
            {hl.main} <span style={{ color: cs.primary }}>{hl.last}</span>
          </h1>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-2/3 mx-auto min-h-[4rem] mb-16">
          <p style={{ fontFamily: bodyFont }} className="text-neutral-500 text-xl max-w-2xl mx-auto italic drop-shadow-lg mb-0">
            {websiteData.sections?.find((s: any) => s.type === 'hero')?.subheadline || websiteData.tagline}
          </p>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-48 h-14 mx-auto mt-4 mb-20">
          <button style={{ backgroundColor: cs.primary, fontFamily: displayFont, fontWeight: 700 }} className="px-12 py-5 text-white uppercase text-xs rounded-full hover:scale-105 transition-transform shadow-2xl">
            {heroCta}
          </button>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
          <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
        </Skeleton>
      </motion.div>
    </section>
  );
}

function HeroVariantC({ websiteData, cs, isLoading, displayFont, bodyFont, heroImageUrl, heroCta, hl, headlineSize }: any) {
  return (
    <section id="hero" className="min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroImageUrl} className="w-full h-full object-cover opacity-10 grayscale" alt="" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-[60%_40%] items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start relative z-10"
        >
          <Skeleton isLoading={isLoading} className="w-full min-h-[18rem] mb-12">
            <h1 style={{ fontFamily: displayFont, fontWeight: 900, lineHeight: 1.0, fontSize: getHeadlineFontSize(headlineSize, 'clamp(4rem, 12vw, 10rem)') }} className="uppercase tracking-tighter drop-shadow-2xl mb-0">
              {hl.main}<br />
              <span className="relative inline-block">
                {hl.last}
                <div className="absolute -bottom-2 left-0 w-full h-4 opacity-30" style={{ backgroundColor: cs.primary }} />
              </span>
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 min-h-[4rem] mb-16">
            <p style={{ fontFamily: bodyFont }} className="text-neutral-600/90 text-2xl font-light leading-relaxed drop-shadow-lg mb-0">
              {websiteData.sections?.find((s: any) => s.type === 'hero')?.subheadline || websiteData.tagline}
            </p>
          </Skeleton>
          <div className="flex flex-wrap gap-6 mt-10">
            <Skeleton isLoading={isLoading} className="w-48 h-14">
              <button style={{ backgroundColor: cs.primary, fontFamily: displayFont, fontWeight: 700 }} className="px-12 py-5 text-white uppercase text-xs tracking-widest rounded-full shadow-2xl hover:scale-105 transition-transform">
                {heroCta}
              </button>
            </Skeleton>
          </div>
        </motion.div>
        <motion.div
          className="hidden lg:block relative"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl rotate-3 scale-110">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-4 border-dashed border-neutral-200 animate-spin-slow" />
        </motion.div>
      </div>
    </section>
  );
}

// ── SERVICES VARIANTS ───────────────────────────────────────────

function ServicesVariantA({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize }: any) {
  const services = sec(websiteData, 'services')?.items || [];
  return (
    <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[8rem] mb-24">
          <h2 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1 }} className="uppercase mb-0">
            Unsere <span style={{ color: cs.primary }}>Leistungen</span>
          </h2>
        </Skeleton>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service: any, i: number) => (
            <Skeleton key={i} isLoading={isLoading} className="h-72">
              <div className="p-10 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-neutral-100 group">
                <div className="w-14 h-14 rounded-full mb-8 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform" style={{ backgroundColor: cs.primary + '15' }}>
                  <Zap size={28} style={{ color: cs.primary }} />
                </div>
                <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: '1.5rem' }} className="mb-4">{service.title}</h3>
                <p style={{ fontFamily: bodyFont }} className="text-neutral-500 leading-relaxed">{service.description}</p>
              </div>
            </Skeleton>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesVariantB({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize }: any) {
  const services = sec(websiteData, 'services')?.items || [];
  return (
    <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[8rem]">
            <h2 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1 }} className="uppercase mb-0">
              Exzellente<br /><span style={{ color: cs.primary }}>Services</span>
            </h2>
          </Skeleton>
          <div className="h-px flex-1 bg-neutral-200 hidden md:block mb-4" />
          <p className="text-neutral-400 uppercase tracking-widest text-xs font-bold mb-4">Professionelle Lösungen</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {services.map((service: any, i: number) => (
            <Skeleton key={i} isLoading={isLoading} className="h-40">
              <div className="py-14 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-neutral-50 px-4 transition-colors">
                <span style={{ fontFamily: displayFont, fontWeight: 900, color: cs.primary }} className="text-4xl opacity-20 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                <div className="flex-1">
                  <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: '1.5rem' }} className="mb-2 uppercase">{service.title}</h3>
                  <p style={{ fontFamily: bodyFont }} className="text-neutral-500 max-w-2xl">{service.description}</p>
                </div>
                <ArrowRight size={24} style={{ color: cs.primary }} className="shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-[-20px] group-hover:translate-x-0" />
              </div>
            </Skeleton>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ABOUT VARIANTS ──────────────────────────────────────────────

function AboutVariantA({ aboutHeadline, aboutContent, aboutImg, cs, isLoading, displayFont, bodyFont, headlineSize }: any) {
  return (
    <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <img src={aboutImg} className="w-full h-full object-cover" alt="" />
          </Skeleton>
        </motion.div>
        <div>
          <Skeleton isLoading={isLoading} className="w-full h-36 mb-8">
            <span className="text-xs uppercase tracking-[0.3em] mb-6 block font-bold" style={{ color: cs.primary }}>// Über uns</span>
            <h2 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: getSectionHeadlineSize(headlineSize, 'about'), lineHeight: 1.1 }} className="uppercase mb-8">
              {aboutHeadline}
            </h2>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-24">
            <p style={{ fontFamily: bodyFont }} className="text-neutral-600 text-lg leading-relaxed">
              {aboutContent}
            </p>
          </Skeleton>
        </div>
      </div>
    </section>
  );
}

function AboutVariantB({ aboutHeadline, aboutContent, aboutImg, cs, isLoading, displayFont, bodyFont, headlineSize }: any) {
  return (
    <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[55%_45%] gap-16 items-center">
        <div>
          <Skeleton isLoading={isLoading} className="w-full h-32 mb-10">
            <div className="inline-block px-4 py-1 rounded-full border border-white/20 mb-6 text-xs uppercase tracking-widest font-bold">Die Story</div>
            <h2 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: getSectionHeadlineSize(headlineSize, 'about'), lineHeight: 1.1 }} className="uppercase italic">
              {aboutHeadline}
            </h2>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-24 mb-12">
            <p style={{ fontFamily: bodyFont }} className="text-white/60 text-xl leading-relaxed font-light">
              {aboutContent}
            </p>
          </Skeleton>
          <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
        </div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <Skeleton isLoading={isLoading} className="aspect-square rounded-full overflow-hidden shadow-2xl border-8 border-white/5">
            <img src={aboutImg} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="" />
          </Skeleton>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full border-4 border-white/10 flex items-center justify-center backdrop-blur-xl">
            <Award size={48} className="text-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── PROCESS SECTION ──────────────────────────────────────────────
function ProcessSection({ websiteData, cs, isLoading, dark = false, displayFont = "inherit", bodyFont = "inherit", headlineStyle = {}, variant = 0 }: any) {
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

  // Variant 0: Horizontal Steps (Current)
  if (variant === 0) {
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

  // Variant 1: Vertical Alternating Timeline
  return (
    <section className={`py-24 md:py-32 px-6 ${bg}`} style={{ fontFamily: bodyFont }}>
      <div className="max-w-4xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-56 h-10 mx-auto mb-20">
          <h2 className={`text-3xl md:text-4xl text-center mb-20 ${textMain}`} style={hs}>
            {process?.headline || "Der Ablauf"}
          </h2>
        </Skeleton>
        <div className="relative">
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200" />
          <div className="space-y-16">
            {items.map((item: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-32">
                <motion.div 
                  className={`flex items-start gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="w-full md:w-1/2 md:px-12 flex flex-col items-start md:items-end text-left md:text-right">
                    {i % 2 === 0 ? (
                      <>
                        <h3 className={`text-xl font-bold mb-2 ${textMain}`} style={hs}>{item.title}</h3>
                        <p className={`text-sm ${textSub}`}>{item.description}</p>
                      </>
                    ) : null}
                  </div>
                  <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg"
                    style={{ backgroundColor: cs.primary }}>
                    {item.step}
                  </div>
                  <div className="w-full md:w-1/2 md:px-12">
                    {i % 2 !== 0 ? (
                      <>
                        <h3 className={`text-xl font-bold mb-2 ${textMain}`} style={hs}>{item.title}</h3>
                        <p className={`text-sm ${textSub}`}>{item.description}</p>
                      </>
                    ) : null}
                  </div>
                </motion.div>
              </Skeleton>
            ))}
          </div>
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
function ContactSection({ websiteData, cs, isLoading, dark = false, displayFont = "inherit", bodyFont = "inherit", headlineStyle = {}, template = 'modern', headlineSize }: any) {
  const phone = getContactItem(websiteData, 'Phone');
  const address = getContactItem(websiteData, 'MapPin');
  const hours = getContactItem(websiteData, 'Clock');
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
  const hs = { fontFamily: displayFont, ...headlineStyle };

  const templateConfig: Record<string, {
    inputRadius: string;
    inputPadding: string;
    inputFontSize: string;
    buttonRadius: string;
    buttonStyle: 'uppercase' | 'normal';
    buttonPadding: string;
    labelTransform: 'uppercase' | 'normal';
    labelSize: string;
    iconRadius: string;
    cardRadius: string;
  }> = {
    bold: {
      inputRadius: '0', inputPadding: '0.875rem 1rem', inputFontSize: '1rem',
      buttonRadius: '0', buttonStyle: 'uppercase', buttonPadding: '1rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0', cardRadius: '0',
    },
    elegant: {
      inputRadius: '1rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'normal', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0.75rem', cardRadius: '1.5rem',
    },
    modern: {
      inputRadius: '0.75rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.9rem',
      buttonRadius: '0.75rem', buttonStyle: 'normal', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.7rem',
      iconRadius: '0.75rem', cardRadius: '1rem',
    },
    luxury: {
      inputRadius: '0.5rem', inputPadding: '0.875rem 1.25rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'uppercase', buttonPadding: '1rem 2rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0.5rem', cardRadius: '1rem',
    },
    craft: {
      inputRadius: '0.25rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.9rem',
      buttonRadius: '0.25rem', buttonStyle: 'uppercase', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.7rem',
      iconRadius: '0.25rem', cardRadius: '0.5rem',
    },
    fresh: {
      inputRadius: '1rem', inputPadding: '0.75rem 1.25rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'normal', buttonPadding: '0.875rem 2rem',
      labelTransform: 'normal', labelSize: '0.75rem',
      iconRadius: '1rem', cardRadius: '1.5rem',
    },
    clean: {
      inputRadius: '0.375rem', inputPadding: '0.625rem 0.875rem', inputFontSize: '0.875rem',
      buttonRadius: '0.375rem', buttonStyle: 'uppercase', buttonPadding: '0.75rem 1.25rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0.375rem', cardRadius: '0.75rem',
    },
  };

  const config = templateConfig[template] || templateConfig.modern;

  const labelStyle = {
    fontFamily: bodyFont,
    letterSpacing: config.labelTransform === 'uppercase' ? '0.1em' : '0.05em',
    fontSize: config.labelSize,
    textTransform: config.labelTransform as const,
    fontWeight: config.labelTransform === 'uppercase' ? 600 : 500,
  };

  const inputStyle = {
    fontFamily: bodyFont, width: '100%', padding: config.inputPadding,
    borderRadius: config.inputRadius, border: `1px solid ${borderColor}`,
    background: inputBg, color: inputText, outline: 'none', fontSize: config.inputFontSize,
  };

  const buttonStyle = {
    backgroundColor: cs.primary, fontFamily: displayFont,
    borderRadius: config.buttonRadius, padding: config.buttonPadding,
    textTransform: config.buttonStyle, letterSpacing: config.buttonStyle === 'uppercase' ? '0.05em' : '0',
    fontWeight: config.buttonStyle === 'uppercase' ? 700 : 600,
  };

  return (
    <section id="kontakt" className={`py-24 md:py-32 px-6 scroll-mt-20 ${bg} ${topBorder}`} style={{ fontFamily: bodyFont }}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-48 h-10 mb-16">
          <h2 className={`mb-16 ${textMain}`} style={{ ...hs, fontSize: getSectionHeadlineSize(headlineSize, 'contact') }}>Kontakt</h2>
        </Skeleton>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            {(address || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-20">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center shrink-0" style={{ width: '2.5rem', height: '2.5rem', borderRadius: config.iconRadius, backgroundColor: iconBg }}>
                    <MapPin size={18} style={{ color: cs.primary }} />
                  </div>
                  <div>
                    <p className={`mb-2 text-lg ${textMain}`} style={{ fontFamily: displayFont, fontWeight: 600 }}>Adresse</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${textSub} transition-colors hover:opacity-80`}
                      style={{ '--hover-color': cs.primary } as React.CSSProperties}
                      onMouseEnter={(e) => (e.currentTarget.style.color = cs.primary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                    >
                      {address}
                    </a>
                  </div>
                </div>
              </Skeleton>
            )}
            {(phone || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-20">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center shrink-0" style={{ width: '2.5rem', height: '2.5rem', borderRadius: config.iconRadius, backgroundColor: iconBg }}>
                    <Phone size={18} style={{ color: cs.primary }} />
                  </div>
                  <div>
                    <p className={`mb-2 text-lg ${textMain}`} style={{ fontFamily: displayFont, fontWeight: 600 }}>Telefon</p>
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className={`${textSub} transition-colors hover:opacity-80`}
                      onMouseEnter={(e) => (e.currentTarget.style.color = cs.primary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </Skeleton>
            )}
            {(hours || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-20">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center shrink-0" style={{ width: '2.5rem', height: '2.5rem', borderRadius: config.iconRadius, backgroundColor: iconBg }}>
                    <Clock size={18} style={{ color: cs.primary }} />
                  </div>
                  <div>
                    <p className={`mb-2 text-lg ${textMain}`} style={{ fontFamily: displayFont, fontWeight: 600 }}>Öffnungszeiten</p>
                    <p className={`whitespace-pre-line ${textSub}`}>{hours}</p>
                  </div>
                </div>
              </Skeleton>
            )}
          </div>
          <div className="relative">
            <div className={`border ${cardBg} ${border} ${locked ? 'opacity-40 blur-[2px] pointer-events-none select-none' : ''}`}
              style={{ borderRadius: config.cardRadius, padding: '1.5rem' }}>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className={`block mb-1.5 ${textSub}`} style={labelStyle}>Name</label>
                  <input type="text" placeholder="Max Mustermann" style={inputStyle}
                    className="focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    onFocus={(e) => e.currentTarget.style.borderColor = cs.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
                </div>
                <div>
                  <label className={`block mb-1.5 ${textSub}`} style={labelStyle}>E-Mail</label>
                  <input type="email" placeholder="max@beispiel.de" style={inputStyle}
                    className="focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    onFocus={(e) => e.currentTarget.style.borderColor = cs.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
                </div>
                <div>
                  <label className={`block mb-1.5 ${textSub}`} style={labelStyle}>Nachricht</label>
                  <textarea rows={4} placeholder="Ihre Nachricht…"
                    style={{ ...inputStyle, resize: 'none' as const, minHeight: '100px' }}
                    className="focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    onFocus={(e) => e.currentTarget.style.borderColor = cs.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
                </div>
                <div className="flex items-start gap-2.5 pt-1">
                  <div className="mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center"
                    style={{ borderRadius: config.inputRadius, borderColor: inputPlaceholder, backgroundColor: inputBg }}>
                  </div>
                  <p className={`text-xs leading-relaxed ${textSub}`} style={{ fontFamily: bodyFont }}>
                    Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                    <a href="#datenschutz" className="underline underline-offset-2" style={{ color: cs.primary }}>Datenschutzerklärung</a> zu.
                  </p>
                </div>
                <button type="submit" className="w-full text-white hover:opacity-90 transition-opacity" style={buttonStyle}>
                  Nachricht senden
                </button>
              </form>
            </div>
            {locked && (
              <div className="absolute inset-0 flex items-start justify-center pt-20">
                <div className={`${cardBg} border ${border} shadow-lg px-6 py-5 text-center max-w-xs w-full`}
                  style={{ borderRadius: config.cardRadius }}>
                  <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center mx-auto mb-3"
                    style={{ borderRadius: config.iconRadius }}>
                    <Shield size={22} className="text-neutral-400" />
                  </div>
                  <p className={`font-bold text-sm mb-1 ${textMain}`} style={hs}>Kontaktformular</p>
                  <p className={`text-xs mb-1 ${textSub}`}>Erhalte direkte Kundenanfragen über deine Website.</p>
                  <p className="text-xs font-semibold mb-4" style={{ color: cs.primary }}>Ab 4,90 € / Monat</p>
                  <button className="w-full text-xs text-white hover:opacity-90 transition-opacity" style={buttonStyle}>
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
function TestimonialsSection({ websiteData, cs, isLoading, heading, dark = false, variant = 0, serif = false, headlineSize }: any) {
  const items = sec(websiteData, 'testimonials')?.items;
  if (!isLoading && !items?.length) return null;

  const bg = dark ? "bg-black" : "bg-white";
  const textMain = dark ? "text-white" : "text-neutral-900";
  const textSub = dark ? "text-white/60" : "text-neutral-500";
  const border = dark ? "border-white/10" : "border-neutral-200";

  // Variant 0: Standard Grid
  if (variant === 0) {
    return (
      <section className={`py-24 md:py-32 px-6 ${bg}`}>
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-20">
            <div className="text-center mb-20">
              <span className={`text-xs font-bold uppercase tracking-[0.3em] block mb-4 ${dark ? 'text-white/40' : 'opacity-40'}`}>Kundenstimmen</span>
              <h2 className={`${textMain} ${serif ? "font-serif italic font-light" : "font-black text-center"}`} style={{ fontSize: getSectionHeadlineSize(headlineSize, 'testimonials') }}>
                {heading || 'Was unsere Kunden sagen'}
              </h2>
            </div>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {items?.length > 0 ? items.map((t: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-64">
                <div className={`p-10 border ${border} ${dark ? 'bg-white/5' : 'bg-white shadow-sm'} hover:shadow-xl transition-all duration-500 rounded-2xl`}>
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating || 5)].map((_, j) => <Star key={j} size={16} fill="currentColor" className="text-yellow-500" />)}
                  </div>
                  <p className={`${textSub} font-light leading-relaxed italic mb-8 text-lg`}>"{t.description || t.title}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cs.primary + '20' }}>
                      <Heart size={20} style={{ color: cs.primary }} />
                    </div>
                    <div>
                      <p className={`font-bold ${textMain}`}>{t.author}</p>
                      <p className="text-xs opacity-40 uppercase tracking-widest">Kunde</p>
                    </div>
                  </div>
                </div>
              </Skeleton>
            )) : null}
          </div>
        </div>
      </section>
    );
  }

  // Variant 1: Large Focus (Single or Two columns)
  return (
    <section className={`py-24 md:py-32 px-6 ${bg} overflow-hidden relative`}>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-500/5 -z-0 skew-x-12 translate-x-1/2" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className={`text-xs font-bold uppercase tracking-[0.3em] block mb-6 ${dark ? 'text-white/40' : 'opacity-40'}`}>Testimonials</span>
            <h2 className={`${textMain} ${serif ? "font-serif italic font-light" : "font-black"} mb-8`} style={{ fontSize: getSectionHeadlineSize(headlineSize, 'testimonials') }}>
              Echte <span style={{ color: cs.primary }}>Erfahrungen</span>
            </h2>
            <p className={`${textSub} text-xl font-light leading-relaxed mb-12`}>
              Wir legen höchsten Wert auf Qualität und Kundenzufriedenheit. Das sagen unsere Partner über die Zusammenarbeit.
            </p>
          </div>
          <div className="space-y-8">
            {items?.slice(0, 2).map((t: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-48">
                <motion.div 
                  className={`p-10 ${dark ? 'bg-white/10' : 'bg-white shadow-2xl'} rounded-[2rem] relative`}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: cs.primary }}>
                    <Star size={20} className="text-white" fill="currentColor" />
                  </div>
                  <p className={`${textMain} text-lg mb-6 italic leading-relaxed`}>"{t.description || t.title}"</p>
                  <p className={`font-bold ${textMain} uppercase tracking-widest text-sm`}>— {t.author}</p>
                </motion.div>
              </Skeleton>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsDark({ websiteData, cs, isLoading, heading }: any) {
  return <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading={heading} dark={true} />;
}

function TestimonialsLight({ websiteData, cs, isLoading, heading, serif }: any) {
  return <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading={heading} dark={false} serif={serif} />;
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
  // Note: Opening hours are prominently displayed in the ContactSection, not here
  if (!phone && !address) return null;
  return (
    <>
      {address && <li className={`flex items-start gap-2 ${textClass}`}><MapPin size={14} className="mt-0.5 shrink-0" /> {address}</li>}
      {phone && <li className={`flex items-center gap-2 ${textClass}`}><Phone size={14} /> {phone}</li>}
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
export function BoldLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Angebot anfragen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Unser Handwerk';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Space Grotesk', Impact, 'Arial Narrow', sans-serif");
  const BODY = "'Plus Jakarta Sans', 'Arial', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 900, letterSpacing: '0.02em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantA, HeroVariantB, HeroVariantC];
  const ServicesVariants = [ServicesVariantA, ServicesVariantB];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#0A0A0A] text-white overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10 relative">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.25rem', fontStyle: 'italic' }} className="uppercase truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.1em' }} className="px-10 py-3 text-white text-xs uppercase hover:scale-105 transition-transform">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kundenstimmen" dark={true} variant={testimonialsIdx} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="bold" headlineSize={headlineSize} />

      <footer className="py-10 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-2">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.1rem' }} className="uppercase break-words">{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-white/25 text-sm mt-1 break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-white/40">
            <FooterContact websiteData={websiteData} textClass="text-white/40" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest shrink-0">
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
export function ElegantLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Termin buchen';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Unsere Philosophie';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Cormorant Garamond', 'Garamond', Georgia, serif");
  const BODY = "'Jost', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 300 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;
  const hl = splitHeadline(heroHeadline);

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantB, HeroVariantC, HeroVariantA]; // Start with B for Elegant
  const ServicesVariants = [ServicesVariantA, ServicesVariantB];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#FFFDFB] text-neutral-900 overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#FFFDFB]/80 backdrop-blur-md border-b border-neutral-200/40 relative">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '0.02em' }} className="truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-36 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.15em' }} className="px-8 py-3 text-white text-[10px] uppercase rounded-full hover:scale-105 transition-transform shadow-lg">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Was Klientinnen sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="elegant" headlineSize={headlineSize} />

      <footer className="py-12 px-8 bg-[#1A1511] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px] text-center md:text-left">
            <Skeleton isLoading={isLoading} className="w-full h-8">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
          </div>
          <ul className="space-y-1 text-sm text-white/50 text-center">
            <FooterContact websiteData={websiteData} textClass="text-white/50" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest shrink-0">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10">
          <p className="text-white/20 text-xs text-center break-words">{footerText}</p>
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
export function CleanLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Termin vereinbaren';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Outfit', 'Helvetica Neue', sans-serif");
  const BODY = "'Outfit', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 600 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantA, HeroVariantC, HeroVariantB];
  const ServicesVariants = [ServicesVariantA, ServicesVariantB];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100 relative">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: cs.primary }} />
            <span style={{ fontFamily: resolveLogoFont(websiteData, BODY), fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }} className="truncate block">{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em' }} className="px-8 py-3 text-white text-xs rounded-full uppercase shadow-lg hover:scale-105 transition-transform">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Was Patienten sagen" variant={testimonialsIdx} serif={false} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="clean" headlineSize={headlineSize} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-sm shrink-0" style={{ backgroundColor: cs.primary }} />
                <span style={{ fontFamily: resolveLogoFont(websiteData, BODY), fontWeight: 500, fontSize: '1rem' }} className="break-words">{websiteData.businessName}</span>
              </div>
            </Skeleton>
            <p className="text-neutral-400 text-sm break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest shrink-0">
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
export function CraftLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Angebot anfragen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Playfair Display', Georgia, serif");
  const BODY = "'Source Sans 3', 'Georgia', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 900 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantA, HeroVariantB, HeroVariantC];
  const ServicesVariants = [ServicesVariantA, ServicesVariantB];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#F2EBD9] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#F2EBD9]/90 backdrop-blur-sm border-b border-neutral-300/50">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.01em' }} className="truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.06em' }} className="px-7 py-2.5 text-white text-sm uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Was Kunden sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="craft" headlineSize={headlineSize} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 700, fontSize: '1.2rem' }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-neutral-400 text-sm break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest shrink-0">
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
export function DynamicLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Training buchen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Unsere Mission';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Bebas Neue', Impact, 'Arial Narrow', sans-serif");
  const BODY = "'Rajdhani', 'Arial', sans-serif";
  const HL: React.CSSProperties = { letterSpacing: '0.04em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantC, HeroVariantA, HeroVariantB]; // Start with C for Dynamic
  const ServicesVariants = [ServicesVariantB, ServicesVariantA]; // Start with B for Dynamic
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#080808] text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#080808]/90 backdrop-blur-sm border-b border-white/10">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontSize: '1.6rem', letterSpacing: '0.08em' }} className="truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, letterSpacing: '0.12em', fontSize: '1.05rem' }} className="px-8 py-2.5 text-white uppercase">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Kunden" dark={true} variant={testimonialsIdx} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="bold" headlineSize={headlineSize} />

      <footer className="py-10 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-2">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontSize: '1.4rem', letterSpacing: '0.06em' }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-white/25 text-sm break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-white/40">
            <FooterContact websiteData={websiteData} textClass="text-white/40" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest shrink-0">
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
export function FreshLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Reservieren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Unsere Philosophie';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Fraunces', Georgia, serif");
  const BODY = "'Jost', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 700 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;
  const hl = splitHeadline(heroHeadline);

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantB, HeroVariantA, HeroVariantC]; // Start with B for Fresh
  const ServicesVariants = [ServicesVariantA, ServicesVariantB];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#FBF7F0] text-neutral-800 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#FBF7F0]/90 backdrop-blur-sm border-b border-neutral-200/60">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 300 }} className="truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300 }} className="px-6 py-2.5 text-white text-sm rounded-full">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Was Gäste sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="fresh" headlineSize={headlineSize} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontWeight: 300, fontSize: '1.3rem' }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-neutral-400 text-sm break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest shrink-0">
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
export function LuxuryLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Termin vereinbaren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Playfair Display', Georgia, serif");
  const BODY = "'Tenor Sans', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.01em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;
  const hl = splitHeadline(heroHeadline);

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantC, HeroVariantB, HeroVariantA];
  const ServicesVariants = [ServicesVariantB, ServicesVariantA];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#0C0A09] text-white overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#0C0A09]/80 backdrop-blur-md border-b border-white/5 relative">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.45rem', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase' }} className="truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ fontFamily: BODY, fontWeight: 400, letterSpacing: '0.25em', fontSize: '0.65rem', backgroundColor: cs.primary, color: '#000' }} className="px-10 py-3 rounded-full uppercase hover:bg-white transition-all shadow-2xl">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Exzellenz" dark={true} variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="luxury" headlineSize={headlineSize} />

      <footer className="py-12 px-8 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px] text-center md:text-left">
            <Skeleton isLoading={isLoading} className="w-full h-8">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
          </div>
          <ul className="space-y-1 text-sm text-white/40 text-center">
            <FooterContact websiteData={websiteData} textClass="text-white/40" />
          </ul>
          <div className="flex gap-8 text-white/25 text-xs uppercase tracking-widest shrink-0">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10">
          <p className="text-white/20 text-xs text-center break-words">{footerText}</p>
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
export function ModernLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
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

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantA, HeroVariantC, HeroVariantB];
  const ServicesVariants = [ServicesVariantA, ServicesVariantB];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100 relative">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', fontStyle: 'italic' }} className="truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.02em' }} className="px-6 py-2.5 text-white text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Was Kunden sagen" variant={testimonialsIdx} serif={false} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="modern" headlineSize={headlineSize} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-neutral-400 text-sm break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest shrink-0">
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
export function NaturalLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
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
  const hl = splitHeadline(heroHeadline);

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantC, HeroVariantA, HeroVariantB];
  const ServicesVariants = [ServicesVariantA, ServicesVariantB];
  const AboutVariants = [AboutVariantA, AboutVariantB];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-[#fcfaf7] text-[#4a4a4a] overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#fcfaf7]/80 backdrop-blur-md border-b border-green-900/5 relative">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          <div className="flex items-center gap-2 overflow-hidden">
            <Leaf size={24} style={{ color: cs.primary }} className="shrink-0" />
            <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 400 }} className="truncate block">{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-36 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600 }} className="px-8 py-2.5 text-white text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} />

      <GoogleTrustBadge websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} />

      <Services websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <ProcessSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />

      <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={cs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} />

      <TestimonialsSection websiteData={websiteData} cs={cs} isLoading={isLoading} heading="Was Kunden sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />

      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="fresh" headlineSize={headlineSize} />

      <footer className="py-12 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-3">
              <div className="flex items-center gap-2">
                <Leaf size={16} style={{ color: cs.primary }} className="shrink-0" />
                <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem' }} className="break-words">{websiteData.businessName}</span>
              </div>
            </Skeleton>
            <p className="text-neutral-400 text-sm break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-neutral-400">
            <FooterContact websiteData={websiteData} textClass="text-neutral-400" />
          </ul>
          <div className="flex gap-6 text-neutral-500 text-xs uppercase tracking-widest shrink-0">
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
export function PremiumLayoutV2({
  websiteData,
  cs,
  heroImageUrl,
  isLoading,
  headlineSize,
}: any) {
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Kontakt aufnehmen';
  const hl = splitHeadline(
    hero?.headline || websiteData.tagline || websiteData.businessName || ''
  );
  const aboutHeadline = about?.headline || 'Expertise';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText =
    websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(
    websiteData,
    "'Instrument Serif', Georgia, serif"
  );
  const BODY = "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 400 };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  const seed = websiteData.id || websiteData.businessName;
  const heroIdx = getVariantIndex(seed, 'hero', 3);
  const servicesIdx = getVariantIndex(seed, 'services', 2);
  const aboutIdx = getVariantIndex(seed, 'about', 2);
  const processIdx = getVariantIndex(seed, 'process', 2);
  const testimonialsIdx = getVariantIndex(seed, 'testimonials', 2);

  const HeroVariants = [HeroVariantA, HeroVariantB, HeroVariantC];
  const ServicesVariants = [ServicesVariantB, ServicesVariantA];
  const AboutVariants = [AboutVariantB, AboutVariantA];

  const Hero = HeroVariants[heroIdx];
  const Services = ServicesVariants[servicesIdx];
  const About = AboutVariants[aboutIdx];

  return (
    <div style={{ fontFamily: BODY }} className="bg-white text-neutral-900 overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="max-w-[40%] h-8">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }} className="truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-44 h-10">
          <button style={{ backgroundColor: cs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em' }} className="px-6 py-2.5 text-white text-sm uppercase tracking-wider">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Dynamic colored left panel / white right panel */}
      <section id="hero" className="min-h-screen grid lg:grid-cols-[45%_55%] pt-[80px]">
        {/* Left: dynamic primary color panel */}
        <div className="text-white p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden" style={{ backgroundColor: cs.secondary || cs.primary }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10 flex flex-col items-start">
            <Skeleton isLoading={isLoading} className="w-full min-h-[14rem] mb-12">
              <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.15, fontSize: getHeadlineFontSize(headlineSize, 'clamp(2.8rem, 5.5vw, 5.5rem)') }} className="mb-0">
                {hl.main}<br /><span style={{ color: cs.primary }}>{hl.last}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 min-h-[4rem] mb-16">
              <p style={{ fontFamily: BODY, fontWeight: 300, lineHeight: 1.8, fontSize: '1.2rem' }} className="text-white/60 max-w-md border-l border-white/20 pl-8 italic mb-0">{hero?.subheadline || websiteData.tagline}</p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-44 h-12 mt-4">
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
            <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[6rem] mb-24">
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1 }} className="mb-0">
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
              <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: getSectionHeadlineSize(headlineSize, 'about'), lineHeight: 1.1 }}>{aboutHeadline}</h2>
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
      <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="luxury" headlineSize={headlineSize} />

      <footer className="py-12 px-6 text-white" style={{ backgroundColor: cs.secondary || cs.primary }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px]">
            <Skeleton isLoading={isLoading} className="w-full h-8 mb-3">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
            <p className="text-white/30 text-sm break-words">{footerText}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-white/50">
            <FooterContact websiteData={websiteData} textClass="text-white/50" />
          </ul>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest shrink-0">
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
