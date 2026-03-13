/**
 * PAGEBLITZ PREMIUM LAYOUTS v3.0 – DISTINCTIVELY DESIGNED
 * All content comes from websiteData (LLM-generated + real business data).
 * No more generic AI aesthetics – each layout has a unique typographic identity.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Star, Zap,
  Award, Clock, MapPin, Utensils, Flower,
  Dumbbell, Target, Gem, Ruler,
  Sparkles, Heart, ArrowRight, Leaf,
  Scissors, ChefHat, Home, Shield, Wrench, Hammer,
  TrendingUp, Briefcase, Coffee, Car, Lightbulb,
  ShoppingBag, GraduationCap, Building, Camera, Music, Palette,
} from 'lucide-react';
import { getVariantIndex } from '../../lib/layoutUtils';

// ── SKELETON ────────────────────────────────────────────────────
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  return (
    <div className={className}>
      {isLoading ? (
        <div className="bg-neutral-200 animate-pulse rounded-lg overflow-hidden w-full h-full" style={{ minHeight: 'inherit' }}>
          <div className="opacity-0 pointer-events-none">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// ── CATEGORY ICON SETS ──────────────────────────────────────────
// Maps business category keywords to curated icon sets.
// Service cards cycle through the set so each card gets a distinct icon.
type LucideIcon = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
const CATEGORY_ICON_SETS: Record<string, LucideIcon[]> = {
  'restaurant':   [Utensils, ChefHat, Coffee, Star, Award],
  'café':         [Coffee, ChefHat, Utensils, Sparkles, Heart],
  'cafe':         [Coffee, ChefHat, Utensils, Sparkles, Heart],
  'bäckerei':     [ChefHat, Coffee, Star, Heart, Award],
  'friseur':      [Scissors, Sparkles, Star, Gem, Heart],
  'beauty':       [Sparkles, Scissors, Gem, Heart, Star],
  'kosmetik':     [Sparkles, Gem, Scissors, Heart, Star],
  'nagel':        [Sparkles, Gem, Heart, Scissors, Star],
  'bau':          [Hammer, Ruler, Home, Shield, Wrench],
  'handwerk':     [Wrench, Hammer, Ruler, Shield, Star],
  'sanitär':      [Wrench, Home, Shield, Star, Hammer],
  'elektro':      [Zap, Wrench, Shield, Home, Star],
  'fitness':      [Dumbbell, Target, Zap, Heart, TrendingUp],
  'sport':        [Target, Dumbbell, Zap, Star, Award],
  'yoga':         [Heart, Leaf, Target, Sparkles, Dumbbell],
  'gesundheit':   [Heart, Shield, Leaf, Star, Award],
  'medizin':      [Heart, Shield, Star, Award, Leaf],
  'arzt':         [Heart, Shield, Award, Star, Leaf],
  'immobilien':   [Home, Building, MapPin, TrendingUp, Gem],
  'beratung':     [TrendingUp, Briefcase, Target, Lightbulb, Award],
  'recht':        [Briefcase, Shield, Award, Star, Target],
  'steuer':       [Briefcase, TrendingUp, Shield, Award, Star],
  'hotel':        [Star, Home, Coffee, Gem, Award],
  'mode':         [ShoppingBag, Sparkles, Gem, Heart, Star],
  'einzelhandel': [ShoppingBag, Star, Gem, Award, Heart],
  'blumen':       [Flower, Leaf, Heart, Sparkles, Star],
  'garten':       [Leaf, Flower, Hammer, Ruler, Star],
  'auto':         [Car, Wrench, Shield, Star, Award],
  'fahrrad':      [Car, Wrench, Shield, Target, Star],
  'bildung':      [GraduationCap, Star, Target, Award, Lightbulb],
  'foto':         [Camera, Star, Sparkles, Gem, Award],
  'musik':        [Music, Star, Heart, Sparkles, Award],
  'design':       [Palette, Sparkles, Gem, Star, Award],
  'reinigung':    [Sparkles, Home, Shield, Star, Award],
  'transport':    [Car, Shield, Star, Award, Target],
};
const DEFAULT_ICONS: LucideIcon[] = [Star, Award, Shield, Target, Gem];

function getCategoryIconSet(businessCategory?: string): LucideIcon[] {
  const cat = (businessCategory || '').toLowerCase();
  const matchedKey = Object.keys(CATEGORY_ICON_SETS).find(k => cat.includes(k));
  return matchedKey ? CATEGORY_ICON_SETS[matchedKey] : DEFAULT_ICONS;
}

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

/**
 * Ensures a text color is readable on a given background.
 * Prevents white text on light backgrounds and black text on dark backgrounds.
 */
function safeTextForBg(color: string | undefined, onLightBg: boolean): string {
  const fallback = onLightBg ? '#171717' : '#ffffff';
  if (!color) return fallback;
  // Transparent white (e.g. rgba(255,255,255,0.6)) is invisible on light bg
  if (onLightBg && color.startsWith('rgba(255')) return '#6b7280';
  if (!color.startsWith('#') || color.length < 7) return fallback;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (onLightBg && lum > 0.75) return fallback;
  if (!onLightBg && lum < 0.25) return fallback;
  return color;
}

/** Calculate font size based on headlineSize preference */
const getHeadlineFontSize = (headlineSize: string = 'large', baseSize: string = 'clamp(3rem, 8vw, 7rem)') => {
  const sizeMap: Record<string, Record<string, string>> = {
    large: {
      'clamp(3rem, 8vw, 7rem)': 'clamp(3rem, 8vw, 7rem)',
      'clamp(3.5rem, 9vw, 8rem)': 'clamp(3.5rem, 9vw, 8rem)',
      'clamp(2.8rem, 5.5vw, 5.5rem)': 'clamp(2.8rem, 5.5vw, 5.5rem)', // Premium
      'clamp(2.5rem, 3.5vw, 4.5rem)': 'clamp(2.5rem, 3.5vw, 4.5rem)', // HeroVariantA
      'clamp(3rem, 5vw, 6rem)':        'clamp(3rem, 5vw, 6rem)',        // HeroVariantB
      'clamp(2.8rem, 4.5vw, 6rem)':   'clamp(2.8rem, 4.5vw, 6rem)',   // HeroVariantC
    },
    medium: {
      'clamp(3rem, 8vw, 7rem)': 'clamp(2.5rem, 6vw, 5rem)',
      'clamp(3.5rem, 9vw, 8rem)': 'clamp(3rem, 7vw, 6rem)',
      'clamp(2.8rem, 5.5vw, 5.5rem)': 'clamp(2.4rem, 4.5vw, 4.5rem)',
      'clamp(2.5rem, 3.5vw, 4.5rem)': 'clamp(2rem, 2.8vw, 3.5rem)',
      'clamp(3rem, 5vw, 6rem)':        'clamp(2.4rem, 4vw, 5rem)',
      'clamp(2.8rem, 4.5vw, 6rem)':   'clamp(2.2rem, 3.5vw, 4.5rem)',
    },
    small: {
      'clamp(3rem, 8vw, 7rem)': 'clamp(2rem, 5vw, 4rem)',
      'clamp(3.5rem, 9vw, 8rem)': 'clamp(2.5rem, 6vw, 5rem)',
      'clamp(2.8rem, 5.5vw, 5.5rem)': 'clamp(2rem, 4vw, 3.5rem)',
      'clamp(2.5rem, 3.5vw, 4.5rem)': 'clamp(1.8rem, 2.2vw, 2.8rem)',
      'clamp(3rem, 5vw, 6rem)':        'clamp(2rem, 3.2vw, 4rem)',
      'clamp(2.8rem, 4.5vw, 6rem)':   'clamp(1.8rem, 2.8vw, 3.8rem)',
    },
  };
  return sizeMap[headlineSize]?.[baseSize] || baseSize;
};

/** Calculate section headline sizes based on headlineSize preference */
const getSectionHeadlineSize = (headlineSize: string = 'large', type: 'services' | 'about' | 'testimonials' | 'contact' = 'services') => {
  const sizes = {
    large: {
      services: 'clamp(2.4rem, 5vw, 3.8rem)',
      about: 'clamp(2.1rem, 4vw, 3.2rem)',
      testimonials: 'clamp(2rem, 3.8vw, 3rem)',
      contact: 'clamp(2rem, 3.8vw, 3rem)',
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

// ── Section order helper (for drag-and-drop reordering in preview) ──────────
function getSecOrder(websiteData: any, type: string, fallback: number): number {
  const order: string[] | undefined = (websiteData as any)?._sectionOrder;
  if (!order || order.length === 0) return fallback;
  const idx = order.indexOf(type);
  return idx === -1 ? fallback : (idx + 1) * 10;
}

function getAddonOrder(websiteData: any): number {
  return Math.min(
    getSecOrder(websiteData, 'gallery', 51),
    getSecOrder(websiteData, 'menu', 52),
    getSecOrder(websiteData, 'pricelist', 53)
  );
}

// ── HERO VARIANTS ───────────────────────────────────────────────

/** Eyebrow pill badge shown above the hero headline */
function HeroBadge({ text, cs, dark, centered = false }: { text: string; cs: any; dark: boolean; centered?: boolean }) {
  const bg    = dark ? 'rgba(255,255,255,0.08)' : `${cs.primary}18`;
  const border = dark ? 'rgba(255,255,255,0.18)' : `${cs.primary}40`;
  const color  = dark ? '#ffffff' : cs.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-8 ${centered ? 'self-center' : 'self-start'}`}
      style={{ backgroundColor: bg, border: `1px solid ${border}`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      {text}
    </motion.div>
  );
}

function HeroVariantA({ websiteData, cs, isLoading, displayFont, bodyFont, heroImageUrl, heroCta, hl, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const primaryColor = safeCs.primary || '#3b82f6';
  const accentColor  = safeCs.accent || safeCs.secondary || primaryColor;
  const textColor    = dark ? (safeCs.lightText || '#ffffff') : safeTextForBg(safeCs.text, true);
  const textMuted    = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.6)') : safeTextForBg(safeCs.textLight, true);
  const badgeText    = websiteData.businessCategory ? `✓ ${websiteData.businessCategory}` : (websiteData.businessName || 'Professioneller Service');

  return (
    <section id="hero" className="grid lg:grid-cols-[45%_55%] min-h-screen overflow-hidden">
      {/* LEFT: Text Panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 pt-28 lg:pt-0 pb-16 lg:pb-0 z-[1]"
      >
        {/* Left edge accent line */}
        {!isLoading && (
          <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full hidden lg:block"
            style={{ backgroundColor: primaryColor, opacity: 0.35 }} />
        )}
        {/* Subtle background depth blob */}
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none"
          style={{ backgroundColor: primaryColor }} />

        {!isLoading && <HeroBadge text={badgeText} cs={safeCs} dark={dark} />}

        <Skeleton isLoading={isLoading} className="w-full min-h-[10rem] mb-6">
          <h1 style={{ fontFamily: displayFont, fontWeight: 900, lineHeight: 1.12, fontSize: getHeadlineFontSize(headlineSize, 'clamp(2.5rem, 3.5vw, 4.5rem)'), color: textColor }}
            className="uppercase tracking-tight mb-0">
            {hl.main}<br />
            <span style={{ color: primaryColor }}>{hl.last}</span>
          </h1>
        </Skeleton>

        <Skeleton isLoading={isLoading} className="w-3/4 min-h-[4rem] mb-8">
          <p style={{ fontFamily: bodyFont, color: textMuted }}
            className="text-lg leading-relaxed max-w-sm mb-0">
            {websiteData.sections?.find((s: any) => s.type === 'hero')?.subheadline || websiteData.tagline}
          </p>
        </Skeleton>

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <Skeleton isLoading={isLoading} className="min-w-[160px] h-14">
            <button style={{ backgroundColor: primaryColor, fontFamily: displayFont, fontWeight: 700, color: safeCs.onPrimary || '#ffffff' }}
              className="px-10 py-4 uppercase text-xs rounded-full hover:scale-105 transition-transform shadow-xl whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="min-w-[130px] h-14">
            <button style={{ fontFamily: displayFont, color: dark ? 'rgba(255,255,255,0.7)' : textMuted, borderColor: dark ? 'rgba(255,255,255,0.25)' : `${primaryColor}55` }}
              className="px-8 py-4 uppercase text-xs rounded-full border-2 hover:opacity-70 transition-opacity whitespace-nowrap">
              Mehr erfahren
            </button>
          </Skeleton>
        </div>
      </motion.div>

      {/* RIGHT: Full-height image (no aspect ratio constraint) */}
      <motion.div
        className="relative min-h-[55vw] lg:min-h-screen overflow-hidden"
        initial={{ opacity: 0, scale: 1.05 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <Skeleton isLoading={isLoading} className="absolute inset-0">
          <img src={heroImageUrl} className="photo-editorial absolute inset-0 w-full h-full object-cover" alt="" />
          {/* Gradient blend at left edge for seamless column transition */}
          <div className="absolute inset-y-0 left-0 w-16 pointer-events-none"
            style={{ backgroundImage: dark ? 'linear-gradient(to right, rgba(10,10,10,0.6), transparent)' : 'linear-gradient(to right, rgba(248,249,250,0.5), transparent)' }} />
        </Skeleton>

        {/* Primary color block — top-left corner accent */}
        {!isLoading && (
          <div className="absolute top-0 left-0 w-14 h-14 hidden lg:block" style={{ backgroundColor: primaryColor }} />
        )}

      </motion.div>
    </section>
  );
}

function HeroVariantB({ websiteData, cs, isLoading, displayFont, bodyFont, heroImageUrl, heroCta, hl, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const primaryColor = safeCs.primary || '#3b82f6';
  const accentColor  = safeCs.accent || safeCs.secondary || primaryColor;
  const textColor    = dark ? (safeCs.lightText || '#ffffff') : safeTextForBg(safeCs.text, true);
  const textMuted    = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.6)') : safeTextForBg(safeCs.textLight, true);
  const badgeText    = websiteData.businessCategory ? `✓ ${websiteData.businessCategory}` : (websiteData.businessName || 'Professioneller Service');

  return (
    <section id="hero" className="pt-28 md:pt-36 pb-16 md:pb-24 text-center px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background orbs: more visible */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12] pointer-events-none" style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-20 left-0 w-[450px] h-[450px] rounded-full blur-[100px] opacity-[0.08] pointer-events-none" style={{ backgroundColor: accentColor }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center relative z-10"
      >
        {!isLoading && <HeroBadge text={badgeText} cs={safeCs} dark={dark} centered={true} />}

        {/* Thin accent line: editorial divider between badge and headline */}
        {!isLoading && (
          <div className="w-16 h-px mb-8" style={{ backgroundColor: primaryColor }} />
        )}

        <Skeleton isLoading={isLoading} className="w-3/4 mx-auto min-h-[8rem] mb-10">
          <h1 style={{ fontFamily: displayFont, fontWeight: 900, lineHeight: 1.12, fontSize: getHeadlineFontSize(headlineSize, 'clamp(3rem, 5vw, 6rem)'), color: textColor }}
            className="uppercase tracking-tight mb-0">
            {hl.main}<br />
            <span style={{ color: primaryColor }}>{hl.last}</span>
          </h1>
        </Skeleton>

        <Skeleton isLoading={isLoading} className="w-2/3 mx-auto min-h-[4rem] mb-10">
          <p style={{ fontFamily: bodyFont, color: textMuted }}
            className="text-xl max-w-2xl mx-auto italic leading-relaxed mb-0">
            {websiteData.sections?.find((s: any) => s.type === 'hero')?.subheadline || websiteData.tagline}
          </p>
        </Skeleton>

        {/* CTA row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Skeleton isLoading={isLoading} className="min-w-[160px] h-14">
            <button style={{ backgroundColor: primaryColor, fontFamily: displayFont, fontWeight: 700, color: safeCs.onPrimary || '#ffffff' }}
              className="px-10 py-4 uppercase text-xs rounded-full hover:scale-105 transition-transform shadow-2xl whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="min-w-[130px] h-14">
            <button style={{ fontFamily: displayFont, color: dark ? 'rgba(255,255,255,0.7)' : textMuted, borderColor: dark ? 'rgba(255,255,255,0.25)' : `${primaryColor}55` }}
              className="px-8 py-4 uppercase text-xs rounded-full border-2 hover:opacity-70 transition-opacity whitespace-nowrap">
              Mehr erfahren
            </button>
          </Skeleton>
        </div>

        {/* Hero image */}
        <div className="relative w-full">
          <Skeleton isLoading={isLoading} className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img src={heroImageUrl} className="photo-editorial w-full h-full object-cover" alt="" />
          </Skeleton>
        </div>
      </motion.div>
    </section>
  );
}

function HeroVariantC({ websiteData, cs, isLoading, displayFont, bodyFont, heroImageUrl, heroCta, hl, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const primaryColor = safeCs.primary || '#3b82f6';
  const accentColor  = safeCs.accent || safeCs.secondary || primaryColor;
  const textColor    = dark ? (safeCs.lightText || '#ffffff') : safeTextForBg(safeCs.text, true);
  const textMuted    = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.65)') : safeTextForBg(safeCs.textLight, true);
  const bgGradient   = dark
    ? 'bg-gradient-to-br from-black/80 via-black/60 to-black/30'
    : 'bg-gradient-to-br from-white/85 via-white/65 to-white/25';
  const badgeText    = websiteData.businessCategory ? `✓ ${websiteData.businessCategory}` : (websiteData.businessName || 'Professioneller Service');

  return (
    <section id="hero" className="min-h-screen flex items-center relative overflow-hidden py-28 lg:py-32">
      {/* Full-bleed background — dramatically more visible */}
      <div className="absolute inset-0 z-0">
        <img src={heroImageUrl} className="w-full h-full object-cover" style={{ opacity: 0.38 }} alt="" />
        <div className={`absolute inset-0 ${bgGradient}`} />
      </div>

      {/* Content: full max-width */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          {!isLoading && <HeroBadge text={badgeText} cs={safeCs} dark={dark} />}

          <Skeleton isLoading={isLoading} className="w-full min-h-[12rem] mb-8">
            <h1 style={{ fontFamily: displayFont, fontWeight: 700, lineHeight: 1.12, fontSize: getHeadlineFontSize(headlineSize, 'clamp(2.8rem, 4.5vw, 6rem)'), color: textColor }}
              className="uppercase tracking-tight mb-0">
              {hl.main}<br />
              <span
                className="relative inline-block pb-4"
                style={{ color: primaryColor }}
              >
                {hl.last}
                {/* Animated SVG wave underline */}
                <svg className="absolute -bottom-1 left-0 w-full overflow-visible" style={{ height: '10px' }} viewBox="0 0 200 10" preserveAspectRatio="none">
                  <motion.path
                    d="M0 6 Q50 2 100 7 Q150 12 200 6"
                    fill="none" strokeWidth="3"
                    stroke={primaryColor} strokeOpacity="0.4"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.0, delay: 0.7, ease: 'easeOut' }}
                  />
                </svg>
              </span>
            </h1>
          </Skeleton>

          {/* Lower section: subheadline + CTAs */}
          <div className="max-w-2xl">
            <Skeleton isLoading={isLoading} className="w-full min-h-[5rem] mb-8">
              <p style={{ fontFamily: bodyFont, color: textMuted, borderLeft: `3px solid ${primaryColor}` }}
                className="text-lg lg:text-xl font-light leading-relaxed pl-6 mb-0">
                {websiteData.sections?.find((s: any) => s.type === 'hero')?.subheadline || websiteData.tagline}
              </p>
            </Skeleton>
            <div className="flex flex-wrap gap-4">
              <Skeleton isLoading={isLoading} className="min-w-[160px] h-14">
                <button style={{ backgroundColor: primaryColor, fontFamily: displayFont, fontWeight: 700, color: safeCs.onPrimary || '#ffffff' }}
                  className="px-10 py-4 uppercase text-xs tracking-widest rounded-full shadow-2xl hover:scale-105 transition-transform whitespace-nowrap">
                  {heroCta}
                </button>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="min-w-[130px] h-14">
                <button style={{ fontFamily: displayFont, color: dark ? 'rgba(255,255,255,0.75)' : textMuted, borderColor: dark ? 'rgba(255,255,255,0.3)' : `${primaryColor}50` }}
                  className="px-8 py-4 uppercase text-xs tracking-widest rounded-full border-2 hover:opacity-70 transition-opacity whitespace-nowrap">
                  Mehr erfahren
                </button>
              </Skeleton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── SERVICES VARIANTS ───────────────────────────────────────────

function ServicesVariantA({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const servicesSection = sec(websiteData, 'services');
  const services = servicesSection?.items || [];
  
  // Don't render if section doesn't exist
  if (!servicesSection && !isLoading) return null;
  
  // Dynamic colors based on dark mode
  const textColor = dark ? (safeCs.lightText || '#ffffff') : (safeCs.text || '#171717');
  const textMuted = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.6)') : (safeCs.textLight || '#737373');
  const sectionBgClass = dark ? (safeCs.darkBackground ? '' : 'bg-neutral-900') : 'bg-neutral-50';
  const sectionBgStyle = dark
    ? { backgroundColor: safeCs.darkBackground || '#0a0a0a' }
    : { backgroundColor: safeCs.background || '#fafafa' };
  const cardBgClass = dark ? (safeCs.darkSurface ? '' : 'bg-neutral-800') : 'bg-white';
  const cardBgStyle = dark
    ? { backgroundColor: safeCs.darkSurface || '#1a1a1a' }
    : { backgroundColor: safeCs.surface || '#ffffff' };
  const cardBorderColor = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const serviceIconSet = getCategoryIconSet(websiteData?.businessCategory);
  return (
    <section id="leistungen" className={`py-24 md:py-32 px-6 scroll-mt-20 ${sectionBgClass}`} style={sectionBgStyle}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[8rem] mb-16 md:mb-20">
          <h2 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor }} className="uppercase mb-0">
            {servicesSection?.headline
              ? <>{servicesSection.headline}</>
              : <>Unsere <span style={{ color: safeCs.primary }}>Leistungen</span></>}
          </h2>
        </Skeleton>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 gap-y-10 md:gap-y-12">
          {services.map((service: any, i: number) => {
            const ServiceIcon = serviceIconSet[i % serviceIconSet.length] as any;
            return (
              <Skeleton key={i} isLoading={isLoading} className="min-h-[18rem]">
                <div className={`p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all group ${cardBgClass}`} style={{ ...cardBgStyle, border: `1px solid ${cardBorderColor}` }}>
                  <div className="w-14 h-14 rounded-full mb-6 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform" style={{ backgroundColor: safeCs.primary + '15' }}>
                    <ServiceIcon size={28} style={{ color: safeCs.primary }} />
                  </div>
                  <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: '1.5rem', color: textColor }} className="mb-4">{service.title}</h3>
                  <p style={{ fontFamily: bodyFont, color: textMuted }} className="leading-relaxed">{service.description}</p>
                </div>
              </Skeleton>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServicesVariantB({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const servicesSection = sec(websiteData, 'services');
  const services = servicesSection?.items || [];
  
  // Don't render if section doesn't exist
  if (!servicesSection && !isLoading) return null;
  
  // Dynamic colors based on dark mode
  const textColor = dark ? (safeCs.lightText || '#ffffff') : (safeCs.text || '#171717');
  const textMuted = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.6)') : (safeCs.textLight || '#737373');
  const sectionBgClass = dark ? (safeCs.darkBackground ? '' : 'bg-neutral-900') : '';
  const sectionBgStyle = dark
    ? { backgroundColor: safeCs.darkBackground || '#0a0a0a' }
    : { backgroundColor: safeCs.background || '#ffffff' };
  const dividerColor = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const hoverBgColor = dark ? 'rgba(255,255,255,0.05)' : '#f9fafb';
  return (
    <section id="leistungen" className={`py-24 md:py-32 px-6 scroll-mt-20 ${sectionBgClass}`} style={sectionBgStyle}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
          <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[8rem]">
            <h2 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor }} className="uppercase mb-0">
              {servicesSection?.headline
                ? <>{servicesSection.headline}</>
                : <>Exzellente<br /><span style={{ color: safeCs.primary }}>Services</span></>}
            </h2>
          </Skeleton>
          <div className="h-px flex-1 hidden md:block mb-4" style={{ backgroundColor: dividerColor }} />
          <p className="uppercase tracking-widest text-xs font-bold mb-4" style={{ color: textMuted }}>Professionelle Lösungen</p>
        </div>
        <div style={{ borderTop: `1px solid ${dividerColor}` }}>
          {services.map((service: any, i: number) => (
            <Skeleton key={i} isLoading={isLoading} className="min-h-[8rem]">
              <div className="py-8 flex flex-col md:flex-row md:items-center gap-8 group px-4 transition-colors" style={{ borderBottom: `1px solid ${dividerColor}`, '--hover-bg': hoverBgColor } as React.CSSProperties} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBgColor }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                <span style={{ fontFamily: displayFont, fontWeight: 900, color: safeCs.primary }} className="text-4xl opacity-20 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                <div className="flex-1">
                  <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: '1.5rem', color: textColor }} className="mb-2 uppercase">{service.title}</h3>
                  <p style={{ fontFamily: bodyFont, color: textMuted }} className="max-w-2xl">{service.description}</p>
                </div>
                <ArrowRight size={24} style={{ color: safeCs.primary }} className="shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-[-20px] group-hover:translate-x-0" />
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
  const safeCs = cs || {};
  // Don't render if no about content
  if (!aboutContent && !aboutHeadline && !isLoading) return null;
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
            <div className="photo-frame aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img src={aboutImg} className="photo-editorial w-full h-full object-cover" alt="" />
            </div>
          </Skeleton>
        </motion.div>
        <div>
          <Skeleton isLoading={isLoading} className="w-full h-36 mb-8">
            <span className="text-xs uppercase tracking-[0.3em] mb-6 block font-bold" style={{ color: safeCs.primary }}>Über uns</span>
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

function AboutVariantB({ aboutHeadline, aboutContent, aboutImg, cs, isLoading, displayFont, bodyFont, headlineSize, businessCategory }: any) {
  // Don't render if no about content
  if (!aboutContent && !aboutHeadline && !isLoading) return null;
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
            <div className="photo-frame photo-frame-dark aspect-square rounded-full overflow-hidden">
              <img src={aboutImg} className="photo-editorial w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="" />
            </div>
          </Skeleton>
          {(() => {
            const DecoIcon = getCategoryIconSet(businessCategory)[0] as any;
            return (
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full border-4 border-white/10 flex items-center justify-center backdrop-blur-xl">
                <DecoIcon size={48} className="text-white/20" />
              </div>
            );
          })()}
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
  // Use dynamic colors from colorScheme if available, fallback to defaults
  const safeCs = cs || {};
  const bgClass = dark ? (safeCs.darkBackground ? '' : "bg-white/5") : (safeCs.background ? '' : "bg-neutral-50");
  const bgStyle = dark
    ? { backgroundColor: safeCs.darkSurface || 'rgba(255,255,255,0.05)', fontFamily: bodyFont }
    : { backgroundColor: safeCs.surface || '#fafafa', fontFamily: bodyFont };
  const textMain = dark ? (safeCs.lightText ? '' : 'text-white') : (safeCs.text ? '' : 'text-neutral-900');
  const textMainStyle = dark ? { color: safeCs.lightText || '#ffffff' } : { color: safeCs.text || '#171717' };
  const textSub = dark ? (safeCs.lightTextMuted ? '' : 'text-white/60') : (safeCs.textLight ? '' : 'text-neutral-500');
  const textSubStyle = dark ? { color: safeCs.lightTextMuted || 'rgba(255,255,255,0.6)' } : { color: safeCs.textLight || '#737373' };
  const hs = { fontFamily: displayFont, ...headlineStyle };

  // Variant 0: Horizontal Steps (Current)
  if (variant === 0) {
    return (
      <section className={`py-24 md:py-32 px-6 ${bgClass}`} style={bgStyle}>
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-full max-w-2xl h-24 mx-auto">
            <h2 className={`text-3xl md:text-4xl text-center ${textMain}`} style={{ ...hs, ...textMainStyle }}>
              {process?.headline || "In 3 Schritten zu Ihrem Ziel"}
            </h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-16">
            {items.map((item: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-44">
                <div className="flex flex-col items-center text-center relative">
                  {i < items.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed"
                      style={{ borderColor: safeCs.primary + '40' }} />
                  )}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 z-10"
                    style={{ backgroundColor: safeCs.primary, color: safeCs.onPrimary || '#ffffff', ...hs }}>
                    {item.step}
                  </div>
                  <h3 className={`text-lg mb-2 ${textMain}`} style={{ ...hs, ...textMainStyle }}>{item.title}</h3>
                  <p className={`text-sm leading-relaxed ${textSub}`} style={{ ...textSubStyle, fontFamily: bodyFont }}>{item.description}</p>
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
    <section className={`py-24 md:py-32 px-6 ${bgClass}`} style={{ ...bgStyle, fontFamily: bodyFont }}>
      <div className="max-w-4xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-56 h-10 mx-auto mb-12">
          <h2 className={`text-3xl md:text-4xl text-center mb-0 ${textMain}`} style={{ ...hs, ...textMainStyle }}>
            {process?.headline || "Ihr Weg zu uns"}
          </h2>
        </Skeleton>
        <div className="relative">
          {/* Line centered at 50% (-translate-x-1/2 shifts line's center to 50%) */}
          <div className="absolute left-[35px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-neutral-200" />
          <div className="space-y-16">
            {items.map((item: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-32">
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {/* Desktop left slot – flex-1 so circle center lands at exactly 50% */}
                  <div className={`hidden md:flex flex-1 pr-12 flex-col ${i % 2 === 0 ? 'items-end text-right' : ''}`}>
                    {i % 2 === 0 && (
                      <>
                        <h3 className={`text-xl font-bold mb-2 ${textMain}`} style={hs}>{item.title}</h3>
                        <p className={`text-sm ${textSub}`}>{item.description}</p>
                      </>
                    )}
                  </div>
                  {/* Circle – shrink-0 so both flex-1 halves are equal → center at 50% */}
                  <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg mr-5 md:mr-0"
                    style={{ backgroundColor: safeCs.primary }}>
                    {item.step}
                  </div>
                  {/* Right slot – flex-1: fills remaining space on mobile + equal half on desktop */}
                  <div className="flex-1 md:pl-12">
                    {/* Mobile: always show */}
                    <div className="md:hidden">
                      <h3 className={`text-xl font-bold mb-2 ${textMain}`} style={hs}>{item.title}</h3>
                      <p className={`text-sm ${textSub}`}>{item.description}</p>
                    </div>
                    {/* Desktop: only odd steps */}
                    {i % 2 !== 0 && (
                      <div className="hidden md:block">
                        <h3 className={`text-xl font-bold mb-2 ${textMain}`} style={hs}>{item.title}</h3>
                        <p className={`text-sm ${textSub}`}>{item.description}</p>
                      </div>
                    )}
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

  // Use dynamic colors from colorScheme if available, fallback to defaults
  const safeCs = cs || {};
  const textSub = dark ? (safeCs.lightTextMuted ? '' : 'text-white/50') : (safeCs.textLight ? '' : 'text-neutral-500');
  const textSubStyle = dark ? { color: safeCs.lightTextMuted || 'rgba(255,255,255,0.5)' } : { color: safeCs.textLight || '#737373' };
  const bgClass = dark ? (safeCs.darkBackground ? '' : 'bg-white/5') : (safeCs.background ? '' : 'bg-neutral-50');
  const bgStyle = dark ? { backgroundColor: safeCs.darkBackground || 'rgba(255,255,255,0.05)' } : { backgroundColor: safeCs.background || '#fafafa' };
  const cardBgClass = dark ? (safeCs.darkSurface ? '' : 'bg-white/10') : (safeCs.surface ? '' : 'bg-white');
  const cardBgStyle = dark ? { backgroundColor: safeCs.darkSurface || 'rgba(255,255,255,0.1)' } : { backgroundColor: safeCs.surface || '#ffffff' };
  const dividerClass = dark ? (safeCs.lightTextMuted ? '' : 'bg-white/20') : (safeCs.textLight ? '' : 'bg-neutral-200');
  const dividerStyle = dark ? { backgroundColor: safeCs.lightTextMuted || 'rgba(255,255,255,0.2)' } : { backgroundColor: safeCs.textLight || '#e5e7eb' };
  const borderClass = dark ? (safeCs.lightTextMuted ? '' : 'border-white/10') : (safeCs.textLight ? '' : 'border-neutral-100');
  const borderStyle = dark ? { borderColor: safeCs.lightTextMuted || 'rgba(255,255,255,0.1)' } : { borderColor: safeCs.textLight || '#f5f5f5' };

  const stars = rating ? Math.round(rating) : 5;
  const displayRating = rating ? rating.toFixed(1) : "5.0";
  const displayCount = reviewCount
    ? reviewCount >= 50 ? `${Math.floor(reviewCount / 10) * 10}+` : `${reviewCount}`
    : "–";

  return (
    <section className={`py-16 md:py-24 px-6 ${bgClass}`} style={bgStyle}>
      <div className="max-w-7xl mx-auto flex justify-center">
        <Skeleton isLoading={isLoading} className="w-80 h-20">
          <div className={`inline-flex items-center gap-6 px-8 py-4 rounded-xl border ${cardBgClass} ${borderClass} shadow-sm`} style={{ ...cardBgStyle, ...borderStyle }}>
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
            <div className={`w-px h-10 ${dividerClass}`} style={dividerStyle} />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black leading-none" style={{ color: safeCs.primary }}>{displayRating}</span>
              <span className={`text-[10px] uppercase tracking-widest mt-1 ${textSub}`} style={textSubStyle}>Bewertung</span>
            </div>
            <div className={`w-px h-10 ${dividerClass}`} style={dividerStyle} />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black leading-none" style={{ color: safeCs.primary }}>{displayCount}</span>
              <span className={`text-[10px] uppercase tracking-widest mt-1 ${textSub}`} style={textSubStyle}>Rezensionen</span>
            </div>
          </div>
        </Skeleton>
      </div>
    </section>
  );
}

// ── CONTACT SECTION ───────────────────────────────────────────────
// Default form fields if none configured
const DEFAULT_CONTACT_FORM_FIELDS = [
  { id: "name", label: "Name", placeholder: "Max Mustermann", type: "text", required: true },
  { id: "email", label: "E-Mail", placeholder: "max@beispiel.de", type: "email", required: true },
  { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht…", type: "textarea", required: true },
];

function ContactSection({ websiteData, cs, isLoading, dark = false, displayFont = "inherit", bodyFont = "inherit", headlineStyle = {}, template = 'modern', headlineSize }: any) {
  const phone = getContactItem(websiteData, 'Phone');
  const address = getContactItem(websiteData, 'MapPin');
  const hours = getContactItem(websiteData, 'Clock');
  const locked = websiteData?.addOnContactForm === false;
  const { datenschutzHref } = useLegalLinks(websiteData);

  // Get form fields from websiteData or use defaults
  const formFields = websiteData?.contactFormFields || DEFAULT_CONTACT_FORM_FIELDS;

  // Use dynamic colors from colorScheme if available, fallback to defaults
  const safeCs = cs || {};
  const textMain = dark ? (safeCs.lightText ? '' : 'text-white') : (safeCs.text ? '' : 'text-neutral-900');
  const textMainStyle = dark ? { color: safeCs.lightText || '#ffffff' } : { color: safeCs.text || '#171717' };
  const textSub = dark ? (safeCs.lightTextMuted ? '' : 'text-white/50') : (safeCs.textLight ? '' : 'text-neutral-500');
  const textSubStyle = dark ? { color: safeCs.lightTextMuted || 'rgba(255,255,255,0.5)' } : { color: safeCs.textLight || '#737373' };
  const darkBgColor = (safeCs as any).darkBackground || '#0a0a0a';
  const bgStyle = dark
    ? { backgroundColor: darkBgColor }
    : { backgroundColor: safeCs.background || '#fafafa' };
  const bgClass = dark ? (safeCs.darkBackground ? '' : 'bg-neutral-900') : (safeCs.background ? '' : 'bg-neutral-50');
  const topBorder = dark ? 'border-t border-white/10' : '';
  const cardBgStyle = dark
    ? { backgroundColor: 'rgba(255,255,255,0.07)' }
    : { backgroundColor: safeCs.surface || '#ffffff' };
  const cardBgClass = '';
  const borderColor = dark ? 'rgba(255,255,255,0.12)' : (safeCs.textLight || '#e5e7eb');
  const border = '';
  const borderStyle = { borderColor };
  const topBorderStyle = {};
  const inputBg = dark ? 'rgba(255,255,255,0.06)' : (safeCs.background || '#f9fafb');
  const inputText = dark ? ((safeCs as any).lightText || '#ffffff') : (safeCs.text || '#111827');
  const inputPlaceholder = dark ? 'rgba(255,255,255,0.3)' : (safeCs.textLight || '#9ca3af');
  const iconBg = `${safeCs.primary || '#3b82f6'}20`;
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
    textTransform: config.labelTransform as 'uppercase' | 'normal',
    fontWeight: config.labelTransform === 'uppercase' ? 600 : 500,
  };

  const inputStyle = {
    fontFamily: bodyFont, width: '100%', padding: config.inputPadding,
    borderRadius: config.inputRadius, border: `1px solid ${borderColor}`,
    background: inputBg, color: inputText, outline: 'none', fontSize: config.inputFontSize,
  };

  const buttonStyle = {
    backgroundColor: safeCs.primary, fontFamily: displayFont,
    borderRadius: config.buttonRadius, padding: config.buttonPadding,
    textTransform: config.buttonStyle as 'uppercase' | 'normal', letterSpacing: config.buttonStyle === 'uppercase' ? '0.05em' : '0',
    fontWeight: config.buttonStyle === 'uppercase' ? 700 : 600,
  };

  return (
    <section id="kontakt" className={`py-24 md:py-32 px-6 scroll-mt-20 ${bgClass} ${topBorder}`} style={{ ...bgStyle, ...topBorderStyle, fontFamily: bodyFont }}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-48 h-10 mb-16">
          <h2 className={`mb-16 text-center ${textMain}`} style={{ ...hs, ...textMainStyle, fontSize: getSectionHeadlineSize(headlineSize, 'contact') }}>Kontakt</h2>
        </Skeleton>
        {/* When form is disabled: single centered info column; when enabled: 2-column grid with form */}
        <div className={locked ? 'max-w-xl mx-auto' : 'grid md:grid-cols-2 gap-12 items-start'}>
          {/* Left / only column: contact info items */}
          <div className="space-y-6">
            {(address || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-20">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center shrink-0" style={{ width: '2.5rem', height: '2.5rem', borderRadius: config.iconRadius, backgroundColor: iconBg }}>
                    <MapPin size={18} style={{ color: safeCs.primary }} />
                  </div>
                  <div>
                    <p className={`mb-2 text-lg ${textMain}`} style={{ ...textMainStyle, fontFamily: displayFont, fontWeight: 600 }}>Adresse</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${textSub} transition-colors hover:opacity-80`}
                      style={textSubStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = safeCs.primary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = textSubStyle.color || '')}
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
                    <Phone size={18} style={{ color: safeCs.primary }} />
                  </div>
                  <div>
                    <p className={`mb-2 text-lg ${textMain}`} style={{ ...textMainStyle, fontFamily: displayFont, fontWeight: 600 }}>Telefon</p>
                    <a
                      href={`tel:${(phone ?? '').replace(/\s/g, '')}`}
                      className={`${textSub} transition-colors hover:opacity-80`}
                      style={textSubStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = safeCs.primary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = textSubStyle.color || '')}
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
                    <Clock size={18} style={{ color: safeCs.primary }} />
                  </div>
                  <div>
                    <p className={`mb-2 text-lg ${textMain}`} style={{ ...textMainStyle, fontFamily: displayFont, fontWeight: 600 }}>Öffnungszeiten</p>
                    <p className={`whitespace-pre-line ${textSub}`} style={textSubStyle}>{hours}</p>
                  </div>
                </div>
              </Skeleton>
            )}
          </div>

          {/* Right column: contact form – only rendered when the add-on is active */}
          {!locked && (
            <div className="relative">
              <div className={`border ${cardBgClass} ${border}`}
                style={{ ...cardBgStyle, ...borderStyle, borderRadius: config.cardRadius, padding: '1.5rem' }}>
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                  {formFields.map((field: any) => (
                    <div key={field.id}>
                      <label className={`block mb-1.5 ${textSub}`} style={{ ...labelStyle, ...textSubStyle }}>
                        {field.label}
                        {field.required && <span style={{ color: safeCs.primary }}>*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          placeholder={field.placeholder}
                          required={field.required}
                          style={{ ...inputStyle, resize: 'none' as const, minHeight: '100px' }}
                          className="focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                          onFocus={(e) => e.currentTarget.style.borderColor = safeCs.primary}
                          onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          required={field.required}
                          style={inputStyle}
                          className="focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all cursor-pointer"
                          onFocus={(e) => e.currentTarget.style.borderColor = safeCs.primary}
                          onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                        >
                          <option value="">{field.placeholder || 'Bitte wählen...'}</option>
                          {field.options?.map((option: string, idx: number) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.required}
                          style={inputStyle}
                          className="focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                          onFocus={(e) => e.currentTarget.style.borderColor = safeCs.primary}
                          onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex items-start gap-2.5 pt-1">
                    <div className="mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center"
                      style={{ borderRadius: config.inputRadius, borderColor: inputPlaceholder, backgroundColor: inputBg }}>
                    </div>
                    <p className={`text-xs leading-relaxed ${textSub}`} style={{ ...textSubStyle, fontFamily: bodyFont }}>
                      Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                      <a href={datenschutzHref} className="underline underline-offset-2" style={{ color: safeCs.primary }}>Datenschutzerklärung</a> zu.
                    </p>
                  </div>
                  <button type="submit" className="w-full hover:opacity-90 transition-opacity" style={{ ...buttonStyle, color: safeCs.onPrimary || '#ffffff' }}>
                    Nachricht senden
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────
function TestimonialsSection({ websiteData, cs, isLoading, heading, dark = false, variant = 0, serif = false, headlineSize }: any) {
  const items = sec(websiteData, 'testimonials')?.items;
  if (!isLoading && !items?.length) return null;

  // Use dynamic colors from colorScheme if available, fallback to defaults
  const safeCs = cs || {};
  const bg = dark
    ? (safeCs.darkBackground ? '' : 'bg-black')
    : (safeCs.background ? '' : 'bg-white');
  const bgStyle = dark
    ? { backgroundColor: safeCs.darkBackground || '#000000' }
    : { backgroundColor: safeCs.background || '#ffffff' };
  const textMain = dark
    ? (safeCs.lightText ? '' : 'text-white')
    : (safeCs.text ? '' : 'text-neutral-900');
  const textMainStyle = dark
    ? { color: safeCs.lightText || '#ffffff' }
    : { color: safeCs.text || '#171717' };
  const textSub = dark
    ? (safeCs.lightTextMuted ? '' : 'text-white/60')
    : (safeCs.textLight ? '' : 'text-neutral-500');
  const textSubStyle = dark
    ? { color: safeCs.lightTextMuted || 'rgba(255,255,255,0.6)' }
    : { color: safeCs.textLight || '#737373' };
  const border = dark ? "border-white/10" : "border-neutral-200";

  // Variant 0: Standard Grid
  if (variant === 0) {
    return (
      <section className={`py-24 md:py-32 px-6 ${bg}`} style={bgStyle}>
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="max-w-2xl mx-auto mb-20">
            <div className="text-center mb-20">
              <span className={`text-xs font-bold uppercase tracking-[0.3em] block mb-4 ${dark ? (safeCs.lightTextMuted ? '' : 'text-white/40') : 'opacity-40'}`} style={dark ? { color: safeCs.lightTextMuted || 'rgba(255,255,255,0.4)' } : undefined}>Kundenstimmen</span>
              <h2 className={`${textMain} ${serif ? "font-serif italic font-light" : "font-black text-center"}`} style={{ ...textMainStyle, fontSize: getSectionHeadlineSize(headlineSize, 'testimonials') }}>
                {heading || 'Was unsere Kunden sagen'}
              </h2>
            </div>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {items?.length > 0 ? items.map((t: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-64">
                <div className={`p-10 border ${border} ${dark ? (safeCs.darkSurface ? '' : 'bg-white/5') : 'bg-white shadow-sm'} hover:shadow-xl transition-all duration-500 rounded-2xl`} style={dark && safeCs.darkSurface ? { backgroundColor: safeCs.darkSurface, borderColor: safeCs.lightTextMuted || 'rgba(255,255,255,0.1)' } : undefined}>
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating || 5)].map((_, j) => <Star key={j} size={16} fill="currentColor" className="text-yellow-500" />)}
                  </div>
                  <p className={`${textSub} font-light leading-relaxed italic mb-8 text-lg`} style={textSubStyle}>"{t.description || t.title}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: safeCs.primary + '20' }}>
                      <Heart size={20} style={{ color: safeCs.primary }} />
                    </div>
                    <div>
                      <p className={`font-bold ${textMain}`} style={textMainStyle}>{t.author}</p>
                      <p className="text-xs uppercase tracking-widest" style={{ opacity: 0.4, color: dark ? (safeCs.lightTextMuted || '#ffffff') : (safeCs.textLight || '#737373') }}>Kunde</p>
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
    <section className={`py-24 md:py-32 px-6 ${bg} overflow-hidden relative isolate`} style={bgStyle}>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-500/5 -z-10 skew-x-12 translate-x-1/2" />
      <div className="max-w-7xl mx-auto relative z-0">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="lg:sticky lg:top-32">
            <span className={`text-xs font-bold uppercase tracking-[0.3em] block mb-6 ${dark ? (safeCs.lightTextMuted ? '' : 'text-white/40') : 'opacity-40'}`} style={dark ? { color: safeCs.lightTextMuted || 'rgba(255,255,255,0.4)' } : undefined}>Testimonials</span>
            <h2 className={`${textMain} ${serif ? "font-serif italic font-light" : "font-black"} mb-8`} style={{ ...textMainStyle, fontSize: getSectionHeadlineSize(headlineSize, 'testimonials') }}>
              Echte <span style={{ color: safeCs.primary }}>Erfahrungen</span>
            </h2>
            <p className={`${textSub} text-xl font-light leading-relaxed mb-12`} style={textSubStyle}>
              Wir legen höchsten Wert auf Qualität und Kundenzufriedenheit. Das sagen unsere Partner über die Zusammenarbeit.
            </p>
          </div>
          <div className="space-y-8 relative z-10">
            {items?.slice(0, 2).map((t: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="min-h-[200px]">
                <motion.div
                  className={`p-8 md:p-10 ${dark ? (safeCs.darkSurface ? '' : 'bg-white/10') : 'bg-white shadow-2xl'} rounded-[2rem] relative overflow-visible`}
                  style={dark && safeCs.darkSurface ? { backgroundColor: safeCs.darkSurface } : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg z-20" style={{ backgroundColor: safeCs.primary }}>
                    <Star size={18} style={{ color: safeCs.onPrimary || '#ffffff' }} fill="currentColor" />
                  </div>
                  <div className="pt-2">
                    <p className={`${textMain} text-base md:text-lg mb-4 italic leading-relaxed`} style={textMainStyle}>"{t.description || t.title}"</p>
                    <p className={`font-bold ${textMain} uppercase tracking-widest text-xs md:text-sm`} style={textMainStyle}>— {t.author}</p>
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

// ── DYNAMIC FOOTER ─────────────────────────────────────────────────
interface FooterProps {
  websiteData: any;
  cs: any;
  isLoading: boolean;
  footerText: string;
  variant?: 'default' | 'centered' | 'elegant' | 'modern' | 'minimal';
  logoStyle?: React.CSSProperties;
  showBorder?: boolean;
}

/** Extracts the site slug from the current URL so legal page links work on
 *  /site/:slug pages. Falls back to '#' in onboarding preview mode. */
function useLegalLinks(websiteData?: any) {
  const slugFromPath = typeof window !== 'undefined'
    ? window.location.pathname.match(/\/site\/([^/]+)/)?.[1] ?? null
    : null;
  const slug = slugFromPath ?? (websiteData as any)?._slug ?? null;
  return {
    impressumHref: slug ? `/site/${slug}/impressum` : '#',
    datenschutzHref: slug ? `/site/${slug}/datenschutz` : '#',
  };
}

/** Inline legal-links block used by the Elegant layout's custom footer. */
function ElegantFooterLegalLinks({ websiteData }: { websiteData?: any }) {
  const { impressumHref, datenschutzHref } = useLegalLinks(websiteData);
  return (
    <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest shrink-0">
      <a href={impressumHref} className="hover:text-white transition-colors">Impressum</a>
      <a href={datenschutzHref} className="hover:text-white transition-colors">Datenschutz</a>
    </div>
  );
}

function DynamicFooter({ websiteData, cs, isLoading, footerText, variant = 'default', logoStyle = {}, showBorder = true }: FooterProps) {
  // Use dynamic colors from colorScheme
  const safeCs = cs || {};
  const { impressumHref, datenschutzHref } = useLegalLinks(websiteData);
  const bgClass = safeCs.darkBackground ? '' : 'bg-neutral-900';
  const bgStyle = { backgroundColor: safeCs.darkBackground || '#171717' };
  const textMain = safeCs.lightText ? '' : 'text-white';
  const textMainStyle = { color: safeCs.lightText || '#ffffff' };
  const textMuted = safeCs.lightTextMuted ? '' : 'text-neutral-400';
  const textMutedStyle = { color: safeCs.lightTextMuted || '#a3a6b5' };
  const textSubtle = safeCs.lightTextMuted ? '' : 'text-neutral-500';
  const textSubtleStyle = { color: safeCs.lightTextMuted ? `${safeCs.lightTextMuted}99` : '#737373' };
  const borderColor = safeCs.lightTextMuted || 'rgba(255,255,255,0.1)';

  const baseClasses = "py-10 md:py-12 px-6";
  const borderClasses = showBorder ? "border-t" : "";

  const containerClasses = {
    default: "flex flex-col md:flex-row justify-between items-start gap-8",
    centered: "flex flex-col md:flex-row justify-between items-center gap-8",
    elegant: "flex flex-col md:flex-row justify-between gap-8",
    modern: "flex flex-col md:flex-row justify-between items-start gap-8",
    minimal: "flex flex-col md:flex-row justify-between items-center gap-8",
  };

  return (
    <footer className={`${baseClasses} ${bgClass} ${borderClasses} ${textMain}`} style={{ ...bgStyle, borderColor: borderColor }}>
      <div className={`max-w-7xl mx-auto w-full ${containerClasses[variant as keyof typeof containerClasses] || containerClasses.default}`}>
        <div className="md:max-w-[400px] lg:max-w-[480px]">
          <Skeleton isLoading={isLoading} className="w-full h-8 mb-4">
            <span
              style={{ ...logoStyle, ...textMainStyle }}
              className="break-words block leading-tight"
            >
              {websiteData.businessName}
            </span>
          </Skeleton>
          <p className="text-sm break-words leading-relaxed" style={textMutedStyle}>{footerText}</p>
        </div>
        <ul className="space-y-1.5 text-sm" style={textMutedStyle}>
          <FooterContact websiteData={websiteData} textClass="" />
        </ul>
        <div className="flex gap-6 text-xs uppercase tracking-widest shrink-0" style={textSubtleStyle}>
          <a href={impressumHref} className="hover:opacity-100 transition-opacity" style={{ '--hover-color': safeCs.primary } as React.CSSProperties}>Impressum</a>
          <a href={datenschutzHref} className="hover:opacity-100 transition-opacity" style={{ '--hover-color': safeCs.primary } as React.CSSProperties}>Datenschutz</a>
        </div>
      </div>
    </footer>
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
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Angebot anfragen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Warum Kunden uns vertrauen';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Space Grotesk', Impact, 'Arial Narrow', sans-serif");
  const BODY = "'Plus Jakarta Sans', 'Arial', sans-serif";
  const HL: React.CSSProperties = { fontWeight: 900, letterSpacing: '0.02em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;
  const darkBg = (safeCs as any).darkBackground || '#0A0A0A';

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
    <div style={{ fontFamily: BODY, backgroundColor: darkBg, display: 'flex', flexDirection: 'column' }} className="text-white overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/10" style={{ backgroundColor: darkBg + 'cc' }}>
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.25rem', fontStyle: 'italic' }} className="uppercase truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[140px] h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.1em', color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-3 text-xs uppercase hover:scale-105 transition-transform whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={true} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Kundenstimmen" dark={true} variant={testimonialsIdx} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="bold" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="default"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.1rem', textTransform: 'uppercase' }}
          showBorder={true}
        />
      </div>
    </div>
  );
}

// ================================================================
// 2. ELEGANT (Beauty & Lifestyle)
// ================================================================
// Aesthetic: Parisian editorial. Cormorant Garamond italic, generous whitespace.
// Key move: Giant floating background initial, centered editorial hero.
export function ElegantLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Termin buchen';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Ihr Wohlbefinden, unser Versprechen';
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
    <div style={{ fontFamily: BODY, color: safeCs.text || '#171717', display: 'flex', flexDirection: 'column' }} className="bg-[#FFFDFB] overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#FFFDFB]/80 backdrop-blur-md border-b border-neutral-200/40">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '0.02em' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[120px] h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.15em', color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-3 text-[10px] uppercase rounded-full hover:scale-105 transition-transform shadow-lg whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={false} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Was Klientinnen sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="elegant" headlineSize={headlineSize} />
      </div>

      <footer style={{ order: 9999 }} className="py-12 px-8 bg-[#1A1511] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="md:max-w-[280px] lg:max-w-[320px] text-center md:text-left">
            <Skeleton isLoading={isLoading} className="w-full h-8">
              <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }} className="break-words">{websiteData.businessName}</span>
            </Skeleton>
          </div>
          <ul className="space-y-1 text-sm text-white/50 text-center">
            <FooterContact websiteData={websiteData} textClass="text-white/50" />
          </ul>
          <ElegantFooterLegalLinks websiteData={websiteData} />
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
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Termin vereinbaren';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'In besten Händen bei uns';
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
    <div style={{ fontFamily: BODY, color: safeCs.text || '#171717', display: 'flex', flexDirection: 'column' }} className="bg-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: safeCs.primary }} />
            <span style={{ fontFamily: resolveLogoFont(websiteData, BODY), fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }} className="whitespace-nowrap block">{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[140px] h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em', color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-3 text-xs rounded-full uppercase shadow-lg hover:scale-105 transition-transform whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={false} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Was Patienten sagen" variant={testimonialsIdx} serif={false} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="clean" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="elegant"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, BODY), fontWeight: 500, fontSize: '1rem' }}
          showBorder={false}
        />
      </div>
    </div>
  );
}

// ================================================================
// 4. CRAFT (Handwerk & Artisan)
// ================================================================
// Aesthetic: Workshop warmth. Playfair Display bold, parchment base.
// Key move: Warm parchment bg, numbered service blocks with earthy sienna accents.
export function CraftLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Angebot anfragen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Handwerk, das für sich spricht';
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
    <div style={{ fontFamily: BODY, color: safeCs.text || '#292524', display: 'flex', flexDirection: 'column' }} className="bg-[#F2EBD9] overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#F2EBD9]/90 backdrop-blur-sm border-b border-neutral-300/50">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.01em' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.06em', color: safeCs.onPrimary || '#ffffff' }} className="px-7 py-2.5 text-xs uppercase whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={false} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Was Kunden sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="craft" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="default"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 700, fontSize: '1.2rem' }}
          showBorder={false}
        />
      </div>
    </div>
  );
}

// ================================================================
// 5. DYNAMIC (Sport & Fitness)
// ================================================================
// Aesthetic: Kinetic energy. Bebas Neue at giant scale, diagonal image cut.
// Key move: Massive italic type, skewed image panel, electric accent.
export function DynamicLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Training buchen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Ihr Ziel. Unser Antrieb.';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Bebas Neue', Impact, 'Arial Narrow', sans-serif");
  const BODY = "'Rajdhani', 'Arial', sans-serif";
  const HL: React.CSSProperties = { letterSpacing: '0.04em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;
  const darkBg = (safeCs as any).darkBackground || '#080808';

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
    <div style={{ fontFamily: BODY, backgroundColor: darkBg, display: 'flex', flexDirection: 'column' }} className="text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-sm border-b border-white/10" style={{ backgroundColor: darkBg + 'e6' }}>
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontSize: '1.6rem', letterSpacing: '0.08em' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-40 h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: DISPLAY, letterSpacing: '0.1em', color: safeCs.onPrimary || '#ffffff' }} className="px-8 py-2.5 text-xs uppercase whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={true} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Das sagen unsere Kunden" dark={true} variant={testimonialsIdx} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="bold" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="default"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontSize: '1.4rem', letterSpacing: '0.06em' }}
          showBorder={true}
        />
      </div>
    </div>
  );
}

// ================================================================
// 6. FRESH (Café & Food)
// ================================================================
// Aesthetic: Artisan food editorial. Fraunces all-serif, warm cream.
// Key move: Centered editorial hero, large rounded image, spinning circular badge.
export function FreshLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Reservieren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Leidenschaft auf jedem Teller';
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
    <div style={{ fontFamily: BODY, color: safeCs.text || '#292524', display: 'flex', flexDirection: 'column' }} className="bg-[#FBF7F0] overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#FBF7F0]/90 backdrop-blur-sm border-b border-neutral-200/60">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 300 }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-2.5 text-xs rounded-full whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={false} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Was Gäste sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="fresh" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="elegant"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontWeight: 300, fontSize: '1.3rem' }}
          showBorder={false}
        />
      </div>
    </div>
  );
}

// ================================================================
// 7. LUXURY (High-End & Premium)
// ================================================================
// Aesthetic: Fashion editorial. Libre Baskerville italic, rich near-black.
// Key move: Full-bleed cinematic hero, maximum negative space, thin accent lines.
export function LuxuryLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const heroCta = hero?.ctaText || 'Termin vereinbaren';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Qualität ohne Kompromisse';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const DISPLAY = getDisplayFont(websiteData, "'Playfair Display', Georgia, serif");
  const BODY = "'Tenor Sans', 'Helvetica Neue', sans-serif";
  const HL: React.CSSProperties = { fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.01em' };
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;
  const hl = splitHeadline(heroHeadline);
  const darkBg = (safeCs as any).darkBackground || '#0C0A09';

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
    <div style={{ fontFamily: BODY, backgroundColor: darkBg, display: 'flex', flexDirection: 'column' }} className="text-white overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-8 py-5 flex justify-between items-center backdrop-blur-md border-b border-white/5" style={{ backgroundColor: darkBg + 'cc' }}>
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.45rem', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[140px] h-10">
          <button style={{ fontFamily: BODY, fontWeight: 400, letterSpacing: '0.25em', fontSize: '0.65rem', backgroundColor: safeCs.primary, color: safeCs.onPrimary || '#ffffff' }} className="px-8 py-3 rounded-full uppercase hover:bg-white transition-all shadow-2xl whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={true} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Stimmen unserer Kunden" dark={true} variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="luxury" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="centered"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }}
          showBorder={true}
        />
      </div>
    </div>
  );
}

// ================================================================
// 8. MODERN (Agency & Software)
// ================================================================
// Aesthetic: Tech geometric. Syne 800 with Space Mono accents.
// Key move: 12-col grid hero, monospace decorative numbers, geometric accent blob.
export function ModernLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Projekt starten';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Ihr Partner für digitalen Erfolg';
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
    <div style={{ fontFamily: BODY, color: safeCs.text || '#171717', display: 'flex', flexDirection: 'column' }} className="bg-white overflow-hidden grain-overlay">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', fontStyle: 'italic' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[130px] h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.02em', color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-2.5 text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={false} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Was Kunden sagen" variant={testimonialsIdx} serif={false} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="modern" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="modern"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}
          showBorder={false}
        />
      </div>
    </div>
  );
}

// ================================================================
// 9. NATURAL (Eco & Wellness)
// ================================================================
// Aesthetic: Botanical organic. Lora italic, organic cream base.
// Key move: Asymmetric pill-shaped images, leaf-green accents, flowing curves.
export function NaturalLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Beratung anfragen';
  const heroHeadline = hero?.headline || websiteData.tagline || '';
  const aboutHeadline = about?.headline || 'Natürlich gut. Nachhaltig besser.';
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
    <div style={{ fontFamily: BODY, display: 'flex', flexDirection: 'column' }} className="bg-[#fcfaf7] text-[#4a4a4a] overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#fcfaf7]/80 backdrop-blur-md border-b border-green-900/5">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Leaf size={24} style={{ color: safeCs.primary }} className="shrink-0" />
            <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 400 }} className="whitespace-nowrap block">{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[130px] h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-2.5 text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-lg whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={false} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        <Services websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} variant={processIdx} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <About aboutHeadline={aboutHeadline} aboutContent={aboutContent} aboutImg={aboutImg} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} businessCategory={websiteData?.businessCategory} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Was Kunden sagen" variant={testimonialsIdx} serif={true} headlineSize={headlineSize} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={cs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="fresh" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={cs}
          isLoading={isLoading}
          footerText={footerText}
          variant="elegant"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem' }}
          showBorder={false}
        />
      </div>
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
  const safeCs = cs || {};
  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Kontakt aufnehmen';
  const hl = splitHeadline(
    hero?.headline || websiteData.tagline || websiteData.businessName || ''
  );
  const aboutHeadline = about?.headline || 'Erfahrung, die Sie voranbringt';
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
    <div style={{ fontFamily: BODY, color: safeCs.text || '#171717', display: 'flex', flexDirection: 'column' }} className="bg-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[140px] h-10">
          <button style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em', color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO: Dynamic colored left panel / white right panel */}
      <section id="hero" className="min-h-screen grid lg:grid-cols-[45%_55%] pt-[80px]">
        {/* Left: dynamic primary color panel */}
        <div className="text-white p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden" style={{ backgroundColor: safeCs.secondary || safeCs.primary }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10 flex flex-col items-start">
            <Skeleton isLoading={isLoading} className="w-full min-h-[14rem] mb-12">
              <h1 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.15, fontSize: getHeadlineFontSize(headlineSize, 'clamp(2.8rem, 5.5vw, 5.5rem)') }} className="mb-0">
                {hl.main}<br /><span style={{ color: safeCs.primary }}>{hl.last}</span>
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 min-h-[4rem] mb-16">
              <p style={{ fontFamily: BODY, fontWeight: 300, lineHeight: 1.8, fontSize: '1.2rem' }} className="text-white/60 max-w-md border-l border-white/20 pl-8 italic mb-0">{hero?.subheadline || websiteData.tagline}</p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-44 h-12 mt-4">
              <button style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.08em', color: safeCs.onPrimary || '#ffffff' }} className="px-10 py-4 text-xs uppercase shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform whitespace-nowrap">{heroCta}</button>
            </Skeleton>
          </div>
        </div>
        {/* Right: image panel */}
        <div className="relative min-h-[60vh] overflow-hidden">
          <Skeleton isLoading={isLoading} className="absolute inset-0">
            <img src={heroImageUrl} className="photo-editorial absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10" />
          </Skeleton>
        </div>
      </section>

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        {services.length > 0 && (
          <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[6rem] mb-24">
                <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1 }} className="mb-0">
                  Unsere <span style={{ color: safeCs.primary }}>Leistungen</span>
                </h2>
              </Skeleton>
              <div className="grid md:grid-cols-3 gap-8">
                {services.map((service: any, i: number) => (
                  <Skeleton key={i} isLoading={isLoading} className="min-h-[18rem]">
                    <div className="p-10 border border-neutral-100 hover:shadow-2xl transition-all duration-500 bg-white group flex flex-col justify-between" style={{ borderTop: `4px solid ${safeCs.primary}` }}>
                      <div>
                        <Target size={28} style={{ color: safeCs.primary }} className="mb-6 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: '1.6rem', lineHeight: 1.2 }} className="mb-4">{service.title}</h3>
                        <p style={{ fontFamily: BODY, fontWeight: 400, fontSize: '0.9rem' }} className="text-neutral-500 leading-relaxed">{service.description}</p>
                      </div>
                      <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" style={{ color: safeCs.primary }}>
                        <span>Mehr erfahren</span><ArrowRight size={14} />
                      </div>
                    </div>
                  </Skeleton>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <section id="ueber-uns" className="py-24 md:py-32 px-6 bg-[#F7F9FC] scroll-mt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
                <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.3em', color: safeCs.primary }} className="uppercase block mb-4 tracking-[0.3em]">Ihr vertrauensvoller Partner</span>
                <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: getSectionHeadlineSize(headlineSize, 'about'), lineHeight: 1.1 }}>{aboutHeadline}</h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24">
                <p style={{ fontFamily: BODY, fontWeight: 400, lineHeight: 1.8, fontSize: '1.125rem' }} className="text-neutral-600">{aboutContent}</p>
              </Skeleton>
            </div>
            <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden">
              <img src={aboutImg} className="photo-editorial w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="" />
            </Skeleton>
          </div>
        </section>
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsLight websiteData={websiteData} cs={safeCs} isLoading={isLoading} serif={false} heading="Was Kunden sagen" />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={HL} template="luxury" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="elegant"
          logoStyle={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }}
          showBorder={false}
        />
      </div>
    </div>
  );
}


// ================================================================
// ADD-ON SECTIONS: Gallery, Menu, Pricelist
// ================================================================

// ── GALLERY SECTION ──────────────────────────────────────────────
function GallerySection({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const gallery = sec(websiteData, 'gallery');
  const items = gallery?.items || [];
  const headline = gallery?.headline || 'Unsere Galerie';
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);

  if (items.length === 0) return null;

  const textColor = dark ? (safeCs.lightText || '#ffffff') : (safeCs.text || '#171717');
  const bgClass = dark ? (safeCs.darkBackground ? '' : 'bg-neutral-900') : '';
  const bgStyle = dark
    ? { backgroundColor: safeCs.darkBackground || '#0a0a0a' }
    : { backgroundColor: safeCs.surface || '#fafafa' };

  // Number of masonry columns based on gallery size
  const cols = items.length <= 3 ? 2 : items.length <= 8 ? 3 : 4;

  // Loading skeleton: show uniform placeholder tiles
  if (isLoading) {
    return (
      <section id="galerie" className={`py-16 px-6 scroll-mt-20 ${bgClass}`} style={bgStyle}>
        <div className="max-w-6xl mx-auto">
          <div className="w-48 h-8 rounded-lg bg-current opacity-10 mb-8" />
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: Math.min(items.length || 6, 9) }).map((_, i) => (
              <div key={i} className="rounded-lg bg-current opacity-[0.07]" style={{ aspectRatio: i % 3 === 0 ? '4/5' : i % 3 === 1 ? '3/4' : '1/1', minHeight: 120 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galerie" className={`py-16 px-6 scroll-mt-20 ${bgClass}`} style={bgStyle}>
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <h2 className="mb-8" style={{ fontFamily: displayFont, fontWeight: 700, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor }}>
          {headline}
        </h2>

        {/* CSS Columns masonry – images stack naturally without forced aspect-ratio */}
        <div
          style={{
            columnCount: cols,
            columnGap: '6px',
          }}
        >
          {items.map((item: any, i: number) => {
            const src = item.imageUrl || item;
            const alt = `Galerie-Bild ${i + 1}`;
            return (
              <div
                key={i}
                onClick={() => setLightboxSrc(src)}
                className="relative overflow-hidden rounded-lg group cursor-zoom-in"
                style={{ breakInside: 'avoid', marginBottom: '6px', display: 'block' }}
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full block object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Subtle zoom icon on hover – no text */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Lightbox */}
          {lightboxSrc && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
              onClick={() => setLightboxSrc(null)}
            >
              <button
                onClick={() => setLightboxSrc(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <img
                src={lightboxSrc}
                alt="Vollbild"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── MENU SECTION (Speisekarte) ───────────────────────────────────
function MenuSection({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const menu = sec(websiteData, 'menu');
  const items = menu?.items || [];
  const headline = menu?.headline || 'Unsere Speisekarte';

  if (items.length === 0) return null;

  // Group by category
  const grouped = items.reduce((acc: any, item: any) => {
    const cat = item.category || 'Sonstiges';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Dynamic colors based on dark mode
  const textColor = dark ? (safeCs.lightText || '#ffffff') : (safeCs.text || '#171717');
  const textMuted = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.6)') : (safeCs.textLight || '#737373');
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const bgClass = dark ? (safeCs.darkSurface ? '' : 'bg-neutral-800') : 'bg-white';
  const bgStyle = dark
    ? { backgroundColor: safeCs.darkSurface || '#1a1a1a' }
    : { backgroundColor: safeCs.surface || '#ffffff' };

  return (
    <section id="speisekarte" className={`py-24 md:py-32 px-6 scroll-mt-20 ${bgClass}`} style={bgStyle}>
      <div className="max-w-4xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[4rem] mb-16">
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor }}>
            {headline}
          </h2>
        </Skeleton>
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, categoryItems]: [string, any]) => (
            <div key={category}>
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <h3 style={{ fontFamily: displayFont, fontWeight: 600, color: safeCs.primary, borderColor: safeCs.primary }} className="text-xl uppercase tracking-wide border-b-2 pb-2">
                  {category}
                </h3>
              </Skeleton>
              <div className="space-y-4">
                {categoryItems.map((item: any, i: number) => (
                  <Skeleton key={i} isLoading={isLoading} className="h-20">
                    <div className="flex justify-between items-start py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <div className="flex-1">
                        <h4 style={{ fontFamily: displayFont, fontWeight: 600, color: textColor }} className="text-lg">{item.title}</h4>
                        {item.description && (
                          <p style={{ fontFamily: bodyFont, color: textMuted }} className="text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                      {item.price && (
                        <span style={{ fontFamily: displayFont, color: safeCs.primary }} className="text-lg font-semibold ml-4">
                          {item.price}
                        </span>
                      )}
                    </div>
                  </Skeleton>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICELIST SECTION ───────────────────────────────────────────
function PricelistSection({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const pricelist = sec(websiteData, 'pricelist');
  const headline = pricelist?.headline || 'Unsere Preise';

  // Support both formats: items array OR categories array
  const items = pricelist?.items || [];
  const categories = pricelist?.categories || [];

  // Build grouped data from either format
  let grouped: Record<string, any[]> = {};

  if (items.length > 0) {
    // Format 1: flat items array with category field
    grouped = items.reduce((acc: any, item: any) => {
      const cat = item.category || 'Leistungen';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  } else if (categories.length > 0) {
    // Format 2: categories array with nested items
    categories.forEach((cat: any) => {
      const catName = cat.name || 'Leistungen';
      const catItems = cat.items || [];
      if (catItems.length > 0) {
        grouped[catName] = catItems.map((item: any) => ({
          title: item.name || item.title,
          price: item.price,
          description: item.description
        }));
      }
    });
  }

  // No data to show
  if (Object.keys(grouped).length === 0) return null;

  // Dynamic colors based on dark mode
  const textColor = dark ? (safeCs.lightText || '#ffffff') : (safeCs.text || '#171717');
  const textMuted = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.7)') : (safeCs.textLight || '#737373');
  const cardBgClass = dark ? (safeCs.darkSurface ? '' : 'bg-neutral-800') : 'bg-white';
  const cardBgStyle = dark
    ? { backgroundColor: safeCs.darkSurface || '#1a1a1a' }
    : { backgroundColor: safeCs.surface || '#ffffff' };
  const sectionBgClass = dark ? (safeCs.darkBackground ? '' : 'bg-neutral-900') : 'bg-neutral-50';
  const sectionBgStyle = dark
    ? { backgroundColor: safeCs.darkBackground || '#0a0a0a' }
    : { backgroundColor: safeCs.background || '#fafafa' };
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  return (
    <section id="preise" className={`py-24 md:py-32 px-6 scroll-mt-20 ${sectionBgClass}`} style={sectionBgStyle}>
      <div className="max-w-4xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[4rem] mb-16">
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor }}>
            {headline}
          </h2>
        </Skeleton>
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, categoryItems]: [string, any]) => (
            <div key={category} className={`rounded-2xl p-8 shadow-sm ${cardBgClass}`} style={cardBgStyle}>
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <h3 style={{ fontFamily: displayFont, fontWeight: 600, color: safeCs.primary }} className="text-lg uppercase tracking-wide">
                  {category}
                </h3>
              </Skeleton>
              <div className="space-y-3">
                {categoryItems.map((item: any, i: number) => (
                  <Skeleton key={i} isLoading={isLoading} className="h-12">
                    <div className="flex justify-between items-center py-3 last:border-0" style={{ borderBottom: i < categoryItems.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
                      <span style={{ fontFamily: bodyFont, color: textMuted }}>{item.title || item.name}</span>
                      {item.price && (
                        <span style={{ fontFamily: displayFont, color: safeCs.primary }} className="font-semibold">
                          {item.price}
                        </span>
                      )}
                    </div>
                  </Skeleton>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── DYNAMIC ADD-ON SECTIONS RENDERER ─────────────────────────────
function DynamicAddonSections({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  return (
    <>
      <GallerySection websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={displayFont} bodyFont={bodyFont} headlineSize={headlineSize} dark={dark} />
      <MenuSection websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={displayFont} bodyFont={bodyFont} headlineSize={headlineSize} dark={dark} />
      <PricelistSection websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={displayFont} bodyFont={bodyFont} headlineSize={headlineSize} dark={dark} />
    </>
  );
}

// ================================================================
// EDEN LAYOUT — Warm, persönlich, modern-organisch
// Für Coaches, Therapeuten, Fotografen, Personal Services
// ================================================================

export function EdenLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'DM Serif Display', Georgia, serif");
  const BODY = "'DM Sans', 'Inter', sans-serif";
  const primaryColor = safeCs.primary || '#3b82f6';
  const accentColor = safeCs.accent || safeCs.secondary || primaryColor;
  const textColor = safeTextForBg(safeCs.text || '#1a1a1a', true);
  const textMuted = safeTextForBg(safeCs.textLight || '#6b7280', true);

  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Termin buchen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const badgeText = websiteData.businessCategory ? `• ${websiteData.businessCategory}` : (websiteData.businessName || '');

  return (
    <div style={{ fontFamily: BODY, backgroundColor: '#FDFBF7', color: textColor, display: 'flex', flexDirection: 'column' }} className="overflow-hidden">
      {/* Paper grain texture — like handmade paper */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)' opacity='0.09'/%3E%3C/svg%3E")` }} />
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#FDFBF7]/95 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: DISPLAY, fontSize: '1.25rem', fontWeight: 400, fontStyle: 'italic' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[120px] h-10">
          <button style={{ backgroundColor: primaryColor, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-2.5 text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO */}
      <section id="hero" className="min-h-screen grid lg:grid-cols-[55%_45%] pt-20 overflow-hidden">
        {/* LEFT: Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-16 lg:py-24 z-[1]"
        >
          {!isLoading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 self-start"
              style={{ backgroundColor: primaryColor + '15', border: `1px solid ${primaryColor}30` }}>
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: primaryColor }}>{badgeText}</span>
            </motion.div>
          )}

          <Skeleton isLoading={isLoading} className="w-full min-h-[10rem] mb-6">
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 400, lineHeight: 1.1, fontSize: getHeadlineFontSize(headlineSize, 'clamp(2.8rem, 4.5vw, 5.5rem)'), color: textColor }}
              className="mb-0">
              {hl.main}<br />
              <span style={{ color: primaryColor }}>
                {hl.last}
              </span>
            </h1>
          </Skeleton>

          <Skeleton isLoading={isLoading} className="w-3/4 min-h-[3.5rem] mb-10">
            <p style={{ fontFamily: BODY, color: textMuted, fontStyle: 'italic' }} className="text-lg leading-relaxed max-w-sm mb-0">
              {hero?.subheadline || websiteData.tagline}
            </p>
          </Skeleton>

          <div className="flex flex-wrap gap-4">
            <Skeleton isLoading={isLoading} className="min-w-[150px] h-14">
              <button style={{ backgroundColor: primaryColor, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }}
                className="px-8 py-4 text-xs uppercase tracking-widest rounded-full shadow-xl hover:scale-105 transition-transform whitespace-nowrap">
                {heroCta}
              </button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="min-w-[130px] h-14">
              <button style={{ fontFamily: BODY, color: textMuted, borderColor: primaryColor + '50' }}
                className="px-7 py-4 text-xs uppercase tracking-widest rounded-full border-2 hover:opacity-70 transition-opacity whitespace-nowrap">
                Mehr erfahren
              </button>
            </Skeleton>
          </div>
        </motion.div>

        {/* RIGHT: Two overlapping image cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative flex items-center justify-center py-16 lg:py-0 min-h-[60vw] lg:min-h-0"
        >
          <Skeleton isLoading={isLoading} className="w-[200px] h-[270px] absolute top-1/2 left-1/3 -translate-y-1/2">
            <div className="absolute" style={{ width: '220px', height: '290px', top: '50%', left: '50%', transform: 'translate(-60%, -55%) rotate(-3deg)', boxShadow: '0 25px 60px -10px rgba(0,0,0,0.25)', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={heroImageUrl} className="w-full h-full object-cover object-top" alt="" />
            </div>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-[170px] h-[170px] absolute bottom-1/4 right-1/4">
            <div className="absolute" style={{ width: '180px', height: '180px', top: '55%', left: '52%', transform: 'translate(-20%, -20%) rotate(2.5deg)', boxShadow: '0 20px 50px -8px rgba(0,0,0,0.2)', borderRadius: '16px', overflow: 'hidden', border: `4px solid white` }}>
              <img src={heroImageUrl} className="w-full h-full object-cover object-center" alt="" />
            </div>
          </Skeleton>
          {/* Decorative blob */}
          {!isLoading && <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none" style={{ background: `radial-gradient(ellipse at 60% 50%, ${primaryColor}25 0%, transparent 70%)` }} />}
        </motion.div>
      </section>

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      {/* SERVICES */}
      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        {services.length > 0 && (
          <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20 bg-white">
            <div className="max-w-7xl mx-auto">
              <Skeleton isLoading={isLoading} className="w-full max-w-md min-h-[5rem] mb-16">
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontStyle: 'italic', fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor }} className="mb-0">
                  Meine <span style={{ color: primaryColor }}>Leistungen</span>
                </h2>
              </Skeleton>
              <div className="grid md:grid-cols-3 gap-6">
                {services.map((service: any, i: number) => (
                  <Skeleton key={i} isLoading={isLoading} className="h-56">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="p-8 rounded-2xl bg-[#FDFBF7] hover:shadow-lg transition-all duration-300 border border-neutral-100"
                      style={{ borderLeft: `3px solid ${primaryColor}` }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primaryColor, fontFamily: BODY }}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: '1.3rem', lineHeight: 1.2, color: textColor }} className="mb-3">{service.title}</h3>
                      <p style={{ fontFamily: BODY, color: textMuted, fontSize: '0.9rem' }} className="leading-relaxed">{service.description}</p>
                    </motion.div>
                  </Skeleton>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* PROCESS */}
      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ fontStyle: 'italic', fontWeight: 400 }} />
      </div>

      {/* ABOUT */}
      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <section id="ueber-uns" className="py-24 md:py-32 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Skeleton isLoading={isLoading} className="w-full min-h-[8rem] mb-8">
                <blockquote style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.3, color: textColor }} className="mb-0">
                  "{aboutHeadline}"
                </blockquote>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full min-h-[5rem]">
                <p style={{ fontFamily: BODY, color: textMuted, lineHeight: 1.8 }} className="text-base">{aboutContent}</p>
              </Skeleton>
            </div>
            <Skeleton isLoading={isLoading} className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img src={(websiteData as any).aboutImageUrl || heroImageUrl} className="photo-editorial w-full h-full object-cover" alt="" />
            </Skeleton>
          </div>
        </section>
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsLight websiteData={websiteData} cs={safeCs} isLoading={isLoading} serif={true} heading="Was Kunden sagen" />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ fontStyle: 'italic', fontWeight: 400 }} template="warm" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="elegant"
          logoStyle={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 400 }}
          showBorder={false}
        />
      </div>
    </div>
  );
}

// ================================================================
// APEX LAYOUT — Autoritär, präzise, professionell
// Für Unternehmensberatung, IT, Recht, Architektur, B2B
// ================================================================

export function ApexLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'Bebas Neue', Impact, sans-serif");
  const BODY = "'Inter', system-ui, sans-serif";
  const primaryColor = safeCs.primary || '#3b82f6';
  const accentColor = safeCs.accent || safeCs.secondary || primaryColor;
  const textColor = safeTextForBg(safeCs.text || '#111827', true);
  const textMuted = safeTextForBg(safeCs.textLight || '#6b7280', true);

  const hero = sec(websiteData, 'hero');
  const about = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta = hero?.ctaText || 'Beratung anfragen';
  const hl = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent = about?.content || websiteData.description || '';
  const footerText = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const badgeText = websiteData.businessCategory ? websiteData.businessCategory : (websiteData.businessName || '');

  return (
    <div style={{ fontFamily: BODY, backgroundColor: '#ffffff', color: textColor, display: 'flex', flexDirection: 'column' }} className="overflow-hidden">
      {/* Dot grid texture — architect paper feel */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: `radial-gradient(rgba(15, 30, 60, 0.07) 1px, transparent 1px)`, backgroundSize: '22px 22px' }} />
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="max-w-[40%] min-h-[2rem]">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: DISPLAY, fontSize: '1.4rem', letterSpacing: '0.08em' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <Skeleton isLoading={isLoading} className="w-auto min-w-[140px] h-10">
          <button style={{ backgroundColor: primaryColor, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }} className="px-6 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap">{heroCta}</button>
        </Skeleton>
      </nav>

      {/* HERO */}
      <section id="hero" className="min-h-screen grid lg:grid-cols-[55%_45%] pt-20 overflow-hidden">
        {/* LEFT: Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-16 lg:py-24 z-[1]"
        >
          {/* Badge */}
          {!isLoading && (
            <div className="inline-flex items-center gap-2 self-start mb-6">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: primaryColor }}>{badgeText}</span>
            </div>
          )}

          {/* Top accent line */}
          {!isLoading && <div className="w-full h-px mb-6" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />}

          <Skeleton isLoading={isLoading} className="w-full min-h-[10rem] mb-4">
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 400, lineHeight: 1.0, letterSpacing: '0.03em', fontSize: getHeadlineFontSize(headlineSize, 'clamp(3.5rem, 7vw, 7.5rem)'), color: textColor }}
              className="uppercase mb-0">
              {hl.main}<br />
              <span style={{ color: primaryColor }}>
                {hl.last}
              </span>
            </h1>
          </Skeleton>

          {/* Bottom accent line */}
          {!isLoading && <div className="w-full h-px mb-8" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />}

          <Skeleton isLoading={isLoading} className="w-3/4 min-h-[3rem] mb-10">
            <p style={{ fontFamily: BODY, color: textMuted, fontSize: '1rem' }} className="leading-relaxed max-w-md mb-0">
              {hero?.subheadline || websiteData.tagline}
            </p>
          </Skeleton>

          <div className="flex flex-wrap gap-4">
            <Skeleton isLoading={isLoading} className="min-w-[160px] h-12">
              <button style={{ backgroundColor: primaryColor, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }}
                className="px-8 py-3 text-xs uppercase tracking-wider shadow-xl hover:scale-105 transition-transform whitespace-nowrap">
                {heroCta}
              </button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="min-w-[130px] h-12">
              <button style={{ fontFamily: BODY, color: textMuted, borderColor: `${primaryColor}50` }}
                className="px-7 py-3 text-xs uppercase tracking-wider border-2 hover:opacity-70 transition-opacity whitespace-nowrap">
                Mehr erfahren
              </button>
            </Skeleton>
          </div>
        </motion.div>

        {/* RIGHT: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="relative flex items-center justify-center p-8 lg:p-12 min-h-[60vw] lg:min-h-0"
        >
          <Skeleton isLoading={isLoading} className="w-full h-full rounded-2xl overflow-hidden">
            <div className="relative w-full h-full min-h-[50vw] lg:min-h-0" style={{ aspectRatio: '4/3' }}>
              <img src={heroImageUrl} className="photo-editorial w-full h-full object-cover rounded-2xl" alt="" />
              {/* Primary color corner accent */}
              {!isLoading && <div className="absolute top-0 left-0 w-12 h-12 rounded-tl-2xl" style={{ backgroundColor: primaryColor }} />}
            </div>
          </Skeleton>
        </motion.div>
      </section>

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} />
      </div>

      {/* SERVICES — Numbered ruled list */}
      <div style={{ order: getSecOrder(websiteData, 'services', 20) }}>
        {services.length > 0 && (
          <section id="leistungen" className="py-24 md:py-32 px-6 scroll-mt-20 bg-neutral-50">
            <div className="max-w-7xl mx-auto">
              <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[5rem] mb-16">
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, letterSpacing: '0.05em', fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1, color: textColor }} className="uppercase mb-0">
                  Unsere <span style={{ color: primaryColor }}>Leistungen</span>
                </h2>
              </Skeleton>
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                {services.map((service: any, i: number) => (
                  <Skeleton key={i} isLoading={isLoading} className="py-8 min-h-[5rem]">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="grid lg:grid-cols-[80px_1fr_2fr] gap-4 items-start py-8"
                    >
                      <span style={{ fontFamily: DISPLAY, fontSize: '2.5rem', fontWeight: 400, color: primaryColor, letterSpacing: '0.05em', lineHeight: 1 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 style={{ fontFamily: BODY, fontWeight: 700, fontSize: '1.1rem', color: textColor }} className="leading-tight pt-1">{service.title}</h3>
                      <p style={{ fontFamily: BODY, color: textMuted, fontSize: '0.9rem' }} className="leading-relaxed pt-1">{service.description}</p>
                    </motion.div>
                  </Skeleton>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* PROCESS */}
      <div style={{ order: getSecOrder(websiteData, 'services', 20) + 1 }}>
        <ProcessSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ fontWeight: 400, letterSpacing: '0.05em' }} />
      </div>

      {/* ABOUT */}
      <div style={{ order: getSecOrder(websiteData, 'about', 30) }}>
        <section id="ueber-uns" className="py-24 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div>
              {!isLoading && <div className="w-12 h-0.5 mb-8" style={{ backgroundColor: primaryColor }} />}
              <Skeleton isLoading={isLoading} className="w-full min-h-[6rem] mb-6">
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, letterSpacing: '0.04em', fontSize: getSectionHeadlineSize(headlineSize, 'about'), lineHeight: 1, color: textColor }} className="uppercase mb-0">
                  {aboutHeadline}
                </h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full min-h-[5rem]">
                <p style={{ fontFamily: BODY, color: textMuted, lineHeight: 1.8 }} className="text-base">{aboutContent}</p>
              </Skeleton>
            </div>
            <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img src={(websiteData as any).aboutImageUrl || heroImageUrl} className="photo-editorial w-full h-full object-cover" alt="" />
            </Skeleton>
          </div>
        </section>
      </div>

      <div style={{ order: getSecOrder(websiteData, 'testimonials', 40) }}>
        <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading="Was Kunden sagen" dark={false} variant={1} />
      </div>

      <div style={{ order: getAddonOrder(websiteData) }}>
        <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'contact', 60) }}>
        <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ fontWeight: 400, letterSpacing: '0.05em' }} template="luxury" headlineSize={headlineSize} />
      </div>

      <div style={{ order: 9999 }}>
        <DynamicFooter
          websiteData={websiteData}
          cs={safeCs}
          isLoading={isLoading}
          footerText={footerText}
          variant="minimal"
          logoStyle={{ fontFamily: DISPLAY, fontSize: '1.3rem', letterSpacing: '0.1em' }}
          showBorder={true}
        />
      </div>
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
  if (cat.includes('coach') || cat.includes('yoga') || cat.includes('ernährung') || cat.includes('fotograf') || cat.includes('massage') || cat.includes('heilpraktik')) return 'EDEN';
  if (cat.includes('beratung') || cat.includes('recht') || cat.includes('steuer') || cat.includes('finanz') || cat.includes('architekt') || cat.includes('ingenieur')) return 'APEX';
  return 'PREMIUM';
};

export const LayoutEngine = ({ gmbData, websiteData, isLoading }: any) => {
  const layoutKey = getLayoutKeyByIndustry(gmbData?.category);
  const layouts: any = {
    BOLD: BoldLayoutV2, ELEGANT: ElegantLayoutV2, CLEAN: CleanLayoutV2,
    CRAFT: CraftLayoutV2, DYNAMIC: DynamicLayoutV2, FRESH: FreshLayoutV2,
    LUXURY: LuxuryLayoutV2, MODERN: ModernLayoutV2, NATURAL: NaturalLayoutV2,
    PREMIUM: PremiumLayoutV2, EDEN: EdenLayoutV2, APEX: ApexLayoutV2
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
