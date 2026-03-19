/**
 * PAGEBLITZ PREMIUM LAYOUTS v3.0 – DISTINCTIVELY DESIGNED
 * All content comes from websiteData (LLM-generated + real business data).
 * No more generic AI aesthetics – each layout has a unique typographic identity.
 */

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
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
  if (!isLoading) return <>{children}</>;
  return (
    <div className={className}>
      <div className="bg-neutral-200 animate-pulse rounded-lg overflow-hidden w-full h-full" style={{ minHeight: 'inherit' }}>
        <div className="opacity-0 pointer-events-none">{children}</div>
      </div>
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

/** Calculate font size based on headlineSize preference.
 *  Works with any clamp() value — no lookup table, just math.
 *  medium ≈ 80 %, small ≈ 65 % of the base size. */
const getHeadlineFontSize = (headlineSize: string = 'large', baseSize: string = 'clamp(3rem, 8vw, 7rem)'): string => {
  const scale = headlineSize === 'small' ? 0.65 : headlineSize === 'medium' ? 0.80 : 1.0;
  if (scale === 1.0) return baseSize;
  // Parse clamp(min, preferred, max) — tolerant of optional spaces
  const m = baseSize.match(/clamp\(\s*([\d.]+)(rem|vw|em|px)\s*,\s*([\d.]+)(rem|vw|em|px)\s*,\s*([\d.]+)(rem|vw|em|px)\s*\)/);
  if (!m) return baseSize; // non-clamp value (e.g. plain rem) — return as-is
  const r = (n: number) => Math.round(n * 100) / 100;
  return `clamp(${r(+m[1] * scale)}${m[2]}, ${r(+m[3] * scale)}${m[4]}, ${r(+m[5] * scale)}${m[6]})`;
};

/** Calculate section headline sizes based on headlineSize preference */
const getSectionHeadlineSize = (headlineSize: string = 'large', type: 'services' | 'about' | 'testimonials' | 'contact' = 'services') => {
  const sizes = {
    large: {
      services: 'clamp(2.4rem, 5vw, 3.8rem)',
      about: 'clamp(1.8rem, 3.2vw, 2.6rem)',
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
    <section id="hero" className="grid lg:grid-cols-[52%_48%] min-h-screen overflow-hidden">
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
          <h1 style={{ fontFamily: displayFont, fontWeight: 900, lineHeight: 1.12, fontSize: getHeadlineFontSize(headlineSize, 'clamp(2.2rem, 3.2vw, 4rem)'), color: textColor, overflowWrap: 'break-word', wordBreak: 'break-word' }}
            className="uppercase tracking-tight mb-6">
            {hl.main}<br />
            <span style={{ color: primaryColor }}>{hl.last}</span>
          </h1>
        </Skeleton>

        <Skeleton isLoading={isLoading} className="w-3/4 min-h-[4rem] mb-8">
          <p style={{ fontFamily: bodyFont, color: textMuted }}
            className="text-lg leading-relaxed max-w-sm mb-16">
            {websiteData.sections?.find((s: any) => s.type === 'hero')?.subheadline || websiteData.tagline}
          </p>
        </Skeleton>

        <div className="flex flex-wrap items-center gap-4 mt-0">
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
            className="uppercase tracking-tight mb-10">
            {hl.main}<br />
            <span style={{ color: primaryColor }}>{hl.last}</span>
          </h1>
        </Skeleton>

        <Skeleton isLoading={isLoading} className="w-2/3 mx-auto min-h-[4rem] mb-10">
          <p style={{ fontFamily: bodyFont, color: textMuted }}
            className="text-xl max-w-2xl mx-auto italic leading-relaxed mb-16">
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
              className="uppercase tracking-tight mb-8">
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
                className="text-lg lg:text-xl font-light leading-relaxed pl-6 mb-16">
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
    <section id="services" className={`py-24 md:py-32 px-6 scroll-mt-20 ${sectionBgClass}`} style={sectionBgStyle}>
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
    <section id="services" className={`py-24 md:py-32 px-6 scroll-mt-20 ${sectionBgClass}`} style={sectionBgStyle}>
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
    <section id="about" className="py-24 md:py-32 px-6 scroll-mt-20">
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
        <div className="text-center lg:text-left">
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

function AboutVariantB({ aboutHeadline, aboutContent, aboutImg, cs, isLoading, displayFont, bodyFont, headlineSize }: any) {
  const safeCs = cs || {};
  const primary = safeCs.primary || '#6366f1';
  if (!aboutContent && !aboutHeadline && !isLoading) return null;
  return (
    <section id="about" className="py-24 md:py-32 px-6 scroll-mt-20 relative overflow-hidden" style={{ backgroundColor: '#111111' }}>
      {/* Subtle primary glow — ties section to layout's color identity */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none" style={{ background: `radial-gradient(circle, ${primary}1a 0%, transparent 65%)`, transform: 'translate(25%, -25%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none" style={{ background: `radial-gradient(circle, ${primary}0d 0%, transparent 70%)`, transform: 'translate(-30%, 30%)' }} />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-16 lg:gap-24 items-center relative z-10">
        {/* Text */}
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Eyebrow with accent line */}
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-8 h-px flex-shrink-0" style={{ backgroundColor: primary }} />
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold" style={{ color: primary }}>Über uns</span>
          </div>

          <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
            <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: getSectionHeadlineSize(headlineSize, 'about'), lineHeight: 1.1, color: '#ffffff' }} className="mb-8">
              {aboutHeadline}
            </h2>
          </Skeleton>

          <Skeleton isLoading={isLoading} className="w-full h-24 mb-10">
            <p style={{ fontFamily: bodyFont, lineHeight: 1.85 }} className="text-white/55 text-lg">
              {aboutContent}
            </p>
          </Skeleton>

          <div className="h-px w-12 mx-auto lg:mx-0" style={{ backgroundColor: `${primary}50` }} />
        </motion.div>

        {/* Image — portrait format with offset accent frame */}
        <motion.div
          className="relative mx-auto lg:mx-0"
          style={{ maxWidth: '380px', width: '100%' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Offset accent frame */}
          <div className="absolute rounded-2xl" style={{ inset: 0, transform: 'translate(10px, 10px)', border: `1px solid ${primary}35`, borderRadius: '1rem', pointerEvents: 'none' }} />

          <Skeleton isLoading={isLoading} className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: '3/4' }}>
              <img
                src={aboutImg}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                style={{ filter: 'grayscale(15%) contrast(1.05)', display: 'block' }}
                alt=""
              />
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
            </div>
          </Skeleton>
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
      <section id="process" className={`py-24 md:py-32 px-6 ${bgClass}`} style={bgStyle}>
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-full max-w-2xl h-24 mx-auto mb-8">
            <h2 className={`text-3xl md:text-4xl text-center ${textMain}`} style={{ ...hs, ...textMainStyle }}>
              {process?.headline || "In 3 Schritten zu Ihrem Ziel"}
            </h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-12">
            {items.map((item: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-44">
                <div className="flex flex-col items-center text-center relative">
                  {i < items.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed"
                      style={{ borderColor: safeCs.primary + '40' }} />
                  )}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 z-10"
                    style={{ backgroundColor: safeCs.primary || '#3b82f6', color: safeCs.onPrimary || '#ffffff', boxShadow: `0 0 0 4px ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, ...hs }}>
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
    <section id="process" className={`py-24 md:py-32 px-6 ${bgClass}`} style={{ ...bgStyle, fontFamily: bodyFont }}>
      <div className="max-w-4xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-56 h-10 mx-auto mb-16">
          <h2 className={`text-3xl md:text-4xl text-center mb-0 ${textMain}`} style={{ ...hs, ...textMainStyle }}>
            {process?.headline || "Ihr Weg zu uns"}
          </h2>
        </Skeleton>
        <div className="relative">
          {/* Line centered at 50% (-translate-x-1/2 shifts line's center to 50%) */}
          <div className="absolute left-[35px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }} />
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
                  <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg mr-5 md:mr-0"
                    style={{ backgroundColor: safeCs.primary || '#3b82f6', color: safeCs.onPrimary || '#ffffff', boxShadow: `0 0 0 4px ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
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
  { id: "name",    label: "Name",      placeholder: "Max Mustermann",  type: "text",     required: true },
  { id: "email",   label: "E-Mail",    placeholder: "max@beispiel.de", type: "email",    required: true },
  { id: "subject", label: "Betreff",   placeholder: "Ihr Anliegen",    type: "text",     required: true },
  { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht…", type: "textarea", required: true },
];

function ContactSection({ websiteData, cs, isLoading, dark = false, displayFont = "inherit", bodyFont = "inherit", headlineStyle = {}, template = 'modern', headlineSize }: any) {
  const phone = getContactItem(websiteData, 'Phone');
  const address = getContactItem(websiteData, 'MapPin');
  const hours = getContactItem(websiteData, 'Clock');
  const locked = websiteData?.addOnContactForm === false;
  const { datenschutzHref } = useLegalLinks(websiteData);

  // Get form fields from websiteData or use defaults.
  // Always ensure an email field is present – inject one after "name" if missing.
  const rawFields: any[] = websiteData?.contactFormFields || DEFAULT_CONTACT_FORM_FIELDS;
  const hasEmailField = rawFields.some((f: any) => f.type === 'email' || f.id === 'email');
  const formFields: any[] = hasEmailField
    ? rawFields
    : (() => {
        const nameIdx = rawFields.findIndex((f: any) => f.id === 'name');
        const insertAt = nameIdx >= 0 ? nameIdx + 1 : 1;
        const emailDefault = { id: 'email', label: 'E-Mail', placeholder: 'max@beispiel.de', type: 'email', required: true };
        return [...rawFields.slice(0, insertAt), emailDefault, ...rawFields.slice(insertAt)];
      })();

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => { setSubmitted(true); setSubmitError(null); },
    onError: (err: any) => {
      // tRPC wraps Zod issues as JSON in err.message — parse into friendly German messages
      try {
        const issues: Array<{ path?: string[]; format?: string; code?: string; message?: string }> = JSON.parse(err.message);
        const fieldMessages: Record<string, string> = {
          name: "Bitte gib deinen Namen ein.",
          email: "Bitte gib eine gültige E-Mail-Adresse ein.",
          message: "Bitte gib eine Nachricht ein.",
          phone: "Bitte gib eine gültige Telefonnummer ein.",
        };
        const msg = issues
          .map(i => fieldMessages[(i.path?.[0] ?? '')] ?? i.message ?? "Ungültige Eingabe.")
          .join(" ");
        setSubmitError(msg || "Fehler beim Senden. Bitte überprüfe deine Eingaben.");
      } catch {
        setSubmitError(err.message?.includes("TOO_MANY_REQUESTS")
          ? "Zu viele Anfragen. Bitte versuche es später erneut."
          : "Fehler beim Senden. Bitte versuche es erneut.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!websiteData?.slug) return;
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') || '').toString();
    // Find the actual email field – its id may differ from "email" (e.g. "field_1710234567890")
    const emailField = formFields.find((f: any) => f.type === 'email' || f.id === 'email');
    const emailFieldId = emailField?.id ?? 'email';
    const email = (fd.get(emailFieldId) || '').toString();
    const phone = (fd.get('phone') || '').toString() || undefined;
    const message = (fd.get('message') || '').toString();
    // Exclude the standard fields (and the actual email field id) from customFields
    const specialKeys = new Set(['name', emailFieldId, 'phone', 'message', 'privacy']);
    const customFields: Record<string, string> = {};
    fd.forEach((val, key) => {
      if (!specialKeys.has(key)) {
        customFields[key] = val.toString();
      }
    });
    submitMutation.mutate({
      slug: websiteData.slug,
      name,
      email,
      ...(phone ? { phone } : {}),
      message,
      ...(Object.keys(customFields).length ? { customFields } : {}),
    });
  };

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
    showCardBorder: boolean;
    cardShadow?: string;
  }> = {
    bold: {
      inputRadius: '0', inputPadding: '0.875rem 1rem', inputFontSize: '1rem',
      buttonRadius: '0', buttonStyle: 'uppercase', buttonPadding: '1rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0', cardRadius: '0',
      showCardBorder: false,
    },
    elegant: {
      inputRadius: '1rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'normal', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0.75rem', cardRadius: '1.5rem',
      showCardBorder: true,
    },
    modern: {
      inputRadius: '0.75rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.9rem',
      buttonRadius: '0.75rem', buttonStyle: 'normal', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.7rem',
      iconRadius: '0.75rem', cardRadius: '1rem',
      showCardBorder: true,
    },
    luxury: {
      inputRadius: '0.5rem', inputPadding: '0.875rem 1.25rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'uppercase', buttonPadding: '1rem 2rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0.5rem', cardRadius: '1rem',
      showCardBorder: false,
    },
    craft: {
      inputRadius: '0.25rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.9rem',
      buttonRadius: '0.25rem', buttonStyle: 'uppercase', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.7rem',
      iconRadius: '0.25rem', cardRadius: '0.5rem',
      showCardBorder: true,
    },
    fresh: {
      inputRadius: '1rem', inputPadding: '0.75rem 1.25rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'normal', buttonPadding: '0.875rem 2rem',
      labelTransform: 'normal', labelSize: '0.75rem',
      iconRadius: '1rem', cardRadius: '1.5rem',
      showCardBorder: false,
      cardShadow: '0 4px 24px rgba(0,0,0,0.06)',
    },
    clean: {
      inputRadius: '0.375rem', inputPadding: '0.625rem 0.875rem', inputFontSize: '0.875rem',
      buttonRadius: '0.375rem', buttonStyle: 'uppercase', buttonPadding: '0.75rem 1.25rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0.375rem', cardRadius: '0.75rem',
      showCardBorder: true,
    },
    // ── Newer layout templates ──────────────────────────────────────
    warm: {
      inputRadius: '1.25rem', inputPadding: '0.75rem 1.25rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'normal', buttonPadding: '0.875rem 2rem',
      labelTransform: 'normal', labelSize: '0.8rem',
      iconRadius: '1rem', cardRadius: '1.75rem',
      showCardBorder: false,
      cardShadow: '0 4px 24px rgba(0,0,0,0.06)',
    },
    aurora: {
      // Dark cosmic – no harsh border, subtle glassy card
      inputRadius: '0.5rem', inputPadding: '0.875rem 1rem', inputFontSize: '0.95rem',
      buttonRadius: '0.5rem', buttonStyle: 'normal', buttonPadding: '1rem 1.5rem',
      labelTransform: 'normal', labelSize: '0.75rem',
      iconRadius: '0.5rem', cardRadius: '0.75rem',
      showCardBorder: false,
    },
    nexus: {
      // Light portfolio – clean geometric, thin border intentional
      inputRadius: '0.5rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.9rem',
      buttonRadius: '0.5rem', buttonStyle: 'normal', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'normal', labelSize: '0.75rem',
      iconRadius: '0.5rem', cardRadius: '0.75rem',
      showCardBorder: true,
    },
    clay: {
      // Claymorphism – very rounded, no border, soft shadow
      inputRadius: '1.75rem', inputPadding: '0.75rem 1.25rem', inputFontSize: '0.95rem',
      buttonRadius: '9999px', buttonStyle: 'normal', buttonPadding: '0.875rem 2rem',
      labelTransform: 'normal', labelSize: '0.8rem',
      iconRadius: '1.25rem', cardRadius: '2rem',
      showCardBorder: false,
      cardShadow: '0 8px 32px rgba(0,0,0,0.08)',
    },
    forge: {
      // Brutalist editorial – sharp, uppercase, intentional hard border
      inputRadius: '0', inputPadding: '0.875rem 1rem', inputFontSize: '0.9rem',
      buttonRadius: '0', buttonStyle: 'uppercase', buttonPadding: '1rem 1.5rem',
      labelTransform: 'uppercase', labelSize: '0.65rem',
      iconRadius: '0', cardRadius: '0',
      showCardBorder: true,
    },
    pulse: {
      // Neumorphism – soft, no traditional border, gentle shadow
      inputRadius: '0.75rem', inputPadding: '0.75rem 1rem', inputFontSize: '0.9rem',
      buttonRadius: '0.75rem', buttonStyle: 'normal', buttonPadding: '0.875rem 1.5rem',
      labelTransform: 'normal', labelSize: '0.75rem',
      iconRadius: '0.75rem', cardRadius: '1.25rem',
      showCardBorder: false,
      cardShadow: '4px 4px 12px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.65)',
    },
    flux: {
      // Dark warm gold – no border, glassy card
      inputRadius: '0.5rem', inputPadding: '0.875rem 1rem', inputFontSize: '0.95rem',
      buttonRadius: '0.5rem', buttonStyle: 'normal', buttonPadding: '1rem 1.5rem',
      labelTransform: 'normal', labelSize: '0.75rem',
      iconRadius: '0.5rem', cardRadius: '0.75rem',
      showCardBorder: false,
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
    <section id="contact" className={`py-24 md:py-32 px-6 scroll-mt-20 ${bgClass} ${topBorder}`} style={{ ...bgStyle, ...topBorderStyle, fontFamily: bodyFont }}>
      <div className="max-w-7xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-48 h-10 mb-16">
          <h2 className={`mb-16 text-center ${textMain}`} style={{ ...hs, ...textMainStyle, fontSize: getSectionHeadlineSize(headlineSize, 'contact') }}>Kontakt</h2>
        </Skeleton>
        {/* When form is disabled: single centered info column; when enabled: 2-column grid with form */}
        <div className={locked ? 'max-w-xl mx-auto' : 'grid md:grid-cols-2 gap-12 items-start'}>
          {/* Left / only column: contact info items */}
          <div className="space-y-6 min-w-0 overflow-hidden">
            {(address || isLoading) && (
              <Skeleton isLoading={isLoading} className="w-full h-20">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center shrink-0" style={{ width: '2.5rem', height: '2.5rem', borderRadius: config.iconRadius, backgroundColor: iconBg }}>
                    <MapPin size={18} style={{ color: safeCs.primary }} />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className={`mb-2 text-lg ${textMain}`} style={{ ...textMainStyle, fontFamily: displayFont, fontWeight: 600 }}>Adresse</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${textSub} transition-colors hover:opacity-80 break-words`}
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
                  <div className="min-w-0 overflow-hidden">
                    <p className={`mb-2 text-lg ${textMain}`} style={{ ...textMainStyle, fontFamily: displayFont, fontWeight: 600 }}>Öffnungszeiten</p>
                    <p className={`whitespace-pre-line break-words ${textSub}`} style={textSubStyle}>{hours}</p>
                  </div>
                </div>
              </Skeleton>
            )}
          </div>

          {/* Right column: contact form – only rendered when the add-on is active */}
          {!locked && (
            <div className="relative">
              <div className={`${config.showCardBorder ? 'border' : ''} ${cardBgClass} ${border}`}
                style={{ ...cardBgStyle, ...(config.showCardBorder ? borderStyle : {}), borderRadius: config.cardRadius, padding: '1.5rem', ...(config.cardShadow ? { boxShadow: config.cardShadow } : {}) }}>
                <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
                  {formFields.map((field: any) => (
                    <div key={field.id}>
                      <label className={`block mb-1.5 ${textSub}`} style={{ ...labelStyle, ...textSubStyle }}>
                        {field.label}
                        {field.required && <span style={{ color: safeCs.primary }}>*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.id}
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
                          name={field.id}
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
                          name={field.id}
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
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      name="privacy"
                      required
                      className="mt-0.5 shrink-0 w-4 h-4 cursor-pointer"
                      style={{ accentColor: safeCs.primary }}
                    />
                    <span className={`text-xs leading-relaxed ${textSub}`} style={{ ...textSubStyle, fontFamily: bodyFont }}>
                      Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                      <a href={datenschutzHref} className="underline underline-offset-2" style={{ color: safeCs.primary }}>Datenschutzerklärung</a> zu.
                    </span>
                  </label>
                  {submitError && (
                    <p className="text-red-400 text-sm">{submitError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ ...buttonStyle, color: safeCs.onPrimary || '#ffffff' }}
                  >
                    {submitMutation.isPending ? "Wird gesendet…" : "Nachricht senden"}
                  </button>
                </form>
                {submitted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    style={{ ...cardBgStyle, borderRadius: config.cardRadius }}>
                    <div className="text-4xl mb-4">✓</div>
                    <p className={`text-lg font-semibold mb-2 ${textMain}`} style={textMainStyle}>Nachricht gesendet!</p>
                    <p className={`text-sm ${textSub}`} style={textSubStyle}>Vielen Dank. Wir melden uns so schnell wie möglich bei Ihnen.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── REVIEW CARD ───────────────────────────────────────────────────
const MAX_REVIEW_CHARS = 200;

function ReviewCard({ review, cs, cardBg, cardBorder }: {
  review: { text?: string; title?: string; description?: string; author: string; rating?: number; source?: string };
  cs: any;
  cardBg?: string;
  cardBorder?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = review.description || review.text || review.title || '';
  const isLong = text.length > MAX_REVIEW_CHARS;
  const displayed = expanded || !isLong ? text : text.slice(0, MAX_REVIEW_CHARS) + '…';
  const stars = Math.min(5, Math.max(1, review.rating || 5));
  const safeCs = cs || {};

  return (
    <div
      style={{ backgroundColor: cardBg || '#ffffff', border: cardBorder ? `1px solid ${cardBorder}` : undefined }}
      className="rounded-2xl p-8 flex flex-col gap-4 shadow-sm"
    >
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < stars ? '#f59e0b' : '#d1d5db', fontSize: '1rem' }}>★</span>
        ))}
      </div>
      {/* Review text — always dark on white card */}
      <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '0.95rem' }} className="flex-1 italic">
        &ldquo;{displayed}&rdquo;
        {isLong && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ color: safeCs.primary || '#3b82f6', marginLeft: '6px' }}
            className="text-sm font-medium hover:underline focus:outline-none not-italic"
          >
            {expanded ? 'Weniger' : 'Weiterlesen'}
          </button>
        )}
      </p>
      {/* Author */}
      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: safeCs.primary || '#3b82f6' }}
        >
          {(review.author || '?')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>{review.author}</div>
          {review.source && <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{review.source}</div>}
        </div>
      </div>
    </div>
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
      <section id="testimonials" className={`py-24 md:py-32 px-6 ${bg}`} style={bgStyle}>
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
                {dark ? (
                  // Dark variant: semi-transparent card, text inherits from theme (already light)
                  <div className={`p-10 border ${border} ${safeCs.darkSurface ? '' : 'bg-white/5'} hover:shadow-xl transition-all duration-500 rounded-2xl`} style={safeCs.darkSurface ? { backgroundColor: safeCs.darkSurface, borderColor: safeCs.lightTextMuted || 'rgba(255,255,255,0.1)' } : undefined}>
                    <div className="flex gap-1 mb-6">
                      {[...Array(t.rating || 5)].map((_, j) => <Star key={j} size={16} fill="currentColor" className="text-yellow-500" />)}
                    </div>
                    <p className="font-light leading-relaxed italic mb-8 text-lg" style={textSubStyle}>"{t.description || t.title}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: safeCs.primary + '20' }}>
                        <Heart size={20} style={{ color: safeCs.primary }} />
                      </div>
                      <div>
                        <p className="font-bold" style={textMainStyle}>{t.author}</p>
                        <p className="text-xs uppercase tracking-widest" style={{ opacity: 0.4, color: safeCs.lightTextMuted || '#ffffff' }}>Kunde</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Light variant: white card — use ReviewCard to force dark text and add Weiterlesen
                  <ReviewCard
                    review={{ text: t.description || t.title, author: t.author, rating: t.rating }}
                    cs={safeCs}
                    cardBg="#ffffff"
                    cardBorder={safeCs.border || '#e5e7eb'}
                  />
                )}
              </Skeleton>
            )) : null}
          </div>
        </div>
      </section>
    );
  }

  // Variant 1: Large Focus (Single or Two columns)
  return (
    <section id="testimonials" className={`py-24 md:py-32 px-6 ${bg} overflow-hidden relative isolate`} style={bgStyle}>
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  {dark ? (
                    <div className={`p-8 md:p-10 ${safeCs.darkSurface ? '' : 'bg-white/10'} rounded-[2rem] relative overflow-visible`}
                      style={safeCs.darkSurface ? { backgroundColor: safeCs.darkSurface } : undefined}>
                      <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg z-20" style={{ backgroundColor: safeCs.primary }}>
                        <Star size={18} style={{ color: safeCs.onPrimary || '#ffffff' }} fill="currentColor" />
                      </div>
                      <div className="pt-2">
                        <p className="text-base md:text-lg mb-4 italic leading-relaxed" style={textMainStyle}>"{t.description || t.title}"</p>
                        <p className="font-bold uppercase tracking-widest text-xs md:text-sm" style={textMainStyle}>— {t.author}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg z-20" style={{ backgroundColor: safeCs.primary }}>
                        <Star size={18} style={{ color: safeCs.onPrimary || '#ffffff' }} fill="currentColor" />
                      </div>
                      <ReviewCard
                        review={{ text: t.description || t.title, author: t.author, rating: t.rating }}
                        cs={safeCs}
                        cardBg="#ffffff"
                        cardBorder={safeCs.border || '#e5e7eb'}
                      />
                    </div>
                  )}
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
const scrollToContact = () =>
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

const NavLinks = ({ textClass = "text-inherit" }: { textClass?: string }) => (
  <div className="hidden md:flex items-center gap-6">
    <a href="#services" className={`text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity ${textClass}`}>Leistungen</a>
    <a href="#about" className={`text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity ${textClass}`}>Über uns</a>
    <a href="#contact" className={`text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity ${textClass}`}>Kontakt</a>
  </div>
);

// ── MOBILE MENU ──────────────────────────────────────────────────
function MobileMenu({
  businessName,
  accentColor,
  isDark,
}: {
  businessName?: string;
  accentColor?: string;
  isDark?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    { label: 'Leistungen', href: '#services' },
    { label: 'Über uns', href: '#about' },
    { label: 'Kontakt', href: '#contact' },
  ];

  return (
    <>
      {/* Trigger button — pill style, mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-current/20 text-[11px] font-medium uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Menü öffnen"
        style={{ color: isDark ? '#ffffff' : undefined }}
      >
        <span className="flex flex-col gap-[3px] w-3.5">
          <span className="block h-px bg-current w-full" />
          <span className="block h-px bg-current w-2/3 ml-auto" />
        </span>
        Menü
      </button>

      {/* Overlay — portal escapes nav's backdrop-filter stacking context */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed inset-0 z-[9999] flex flex-col"
              style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(24px)' }}
            >
              {/* Top bar */}
              <motion.div
                className="flex items-center justify-between px-6 py-5"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <span className="text-white font-medium text-lg truncate max-w-[70%]">{businessName}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-all"
                  aria-label="Menü schließen"
                >
                  <motion.svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  >
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </motion.svg>
                </button>
              </motion.div>

              {/* Nav links — staggered slide-up */}
              <div className="flex-1 flex flex-col justify-center px-8 gap-2">
                {links.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between py-4 border-b border-white/10 text-white/50 hover:text-white transition-colors"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <span className="text-3xl font-light tracking-tight">{link.label}</span>
                    <motion.svg
                      width="18" height="18" viewBox="0 0 16 16" fill="none"
                      className="text-white/30 group-hover:text-white/80 transition-colors"
                      initial={{ x: -6, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
                    >
                      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  </motion.a>
                ))}
                <motion.a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="mt-8 py-4 rounded-2xl text-center text-sm font-semibold"
                  style={{ background: accentColor || '#3b82f6', color: '#fff' }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + links.length * 0.07, duration: 0.35 }}
                >
                  Jetzt kontaktieren
                </motion.a>
              </div>

              {/* Bottom */}
              <motion.div
                className="px-8 pb-8 text-white/15 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                © {new Date().getFullYear()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

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
 *  /site/:slug pages, subdomain pages (schau-horch.pageblitz.de), and
 *  falls back to '#' in onboarding preview mode. */
function useLegalLinks(websiteData?: any) {
  // On customer subdomains (e.g. schau-horch.pageblitz.de) use root-relative paths
  const isCustomerSubdomain = typeof window !== 'undefined' &&
    /^[a-z0-9][a-z0-9-]*\.pageblitz\.de$/.test(window.location.hostname) &&
    !/^(www|analytics|admin|api|mail|ftp)\.pageblitz\.de$/.test(window.location.hostname);
  if (isCustomerSubdomain) {
    return { impressumHref: '/impressum', datenschutzHref: '/datenschutz' };
  }
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
      {websiteData.showBranding !== false && (
        <div className="max-w-7xl mx-auto w-full text-center pt-4 border-t mt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <a
            href="https://pageblitz.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-opacity"
            style={{ color: 'inherit', textDecoration: 'none', opacity: 0.35 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}
          >
            Erstellt mit Pageblitz
          </a>
        </div>
      )}
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 900, letterSpacing: '0.06em', fontSize: '1.25rem', fontStyle: 'italic' }} className="uppercase truncate block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[140px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.1em', color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-3 text-xs uppercase hover:scale-105 transition-transform whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={true} />
        </div>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '0.02em' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[120px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.15em', color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-3 text-[10px] uppercase rounded-full hover:scale-105 transition-transform shadow-lg whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={false} />
        </div>
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
        {websiteData.showBranding !== false && (
          <div className="max-w-7xl mx-auto text-center pt-4 border-t border-white/[0.08] mt-4">
            <a
              href="https://pageblitz.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-opacity"
              style={{ color: 'inherit', textDecoration: 'none', opacity: 0.35 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}
            >
              Erstellt mit Pageblitz
            </a>
          </div>
        )}
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: safeCs.primary }} />
            <span style={{ fontFamily: resolveLogoFont(websiteData, BODY), fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }} className="whitespace-nowrap block">{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[140px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em', color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-3 text-xs rounded-full uppercase shadow-lg hover:scale-105 transition-transform whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={false} />
        </div>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.01em' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.06em', color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-7 py-2.5 text-xs uppercase whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={false} />
        </div>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontSize: '1.6rem', letterSpacing: '0.08em' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: DISPLAY, letterSpacing: '0.1em', color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-8 py-2.5 text-xs uppercase whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={true} />
        </div>
      </nav>

      <Hero websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} heroImageUrl={heroImageUrl} heroCta={heroCta} hl={hl} headlineSize={headlineSize} dark={true} />

      <div style={{ order: 1 }}>
        <GoogleTrustBadge websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={true} />
      </div>

      <div style={{ order: getSecOrder(websiteData, 'services', 20), borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '2rem' }}>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 300 }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[110px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 300, color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-2.5 text-xs rounded-full whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={false} />
        </div>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.45rem', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-white" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[140px] h-10">
            <button onClick={scrollToContact} style={{ fontFamily: BODY, fontWeight: 400, letterSpacing: '0.25em', fontSize: '0.65rem', backgroundColor: safeCs.primary, color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-8 py-3 rounded-full uppercase hover:bg-white transition-all shadow-2xl whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={true} />
        </div>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', fontStyle: 'italic' }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.02em', color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-2.5 text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={false} />
        </div>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            <Leaf size={24} style={{ color: safeCs.primary }} className="shrink-0" />
            <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 400 }} className="whitespace-nowrap block">{websiteData.businessName}</span>
          </div>
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-2.5 text-xs rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-lg whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={false} />
        </div>
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: resolveLogoFont(websiteData, DISPLAY), fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400 }} className="whitespace-nowrap block">{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-800" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[140px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: safeCs.primary, fontFamily: BODY, fontWeight: 600, letterSpacing: '0.04em', color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={safeCs.primary} isDark={false} />
        </div>
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
          <section id="services" className="py-24 md:py-32 px-6 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[6rem] mb-16">
                <h2 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1 }} className="mb-0">
                  Unsere <span style={{ color: safeCs.primary }}>Leistungen</span>
                </h2>
              </Skeleton>
              <div className="grid md:grid-cols-3 gap-8">
                {services.map((service: any, i: number) => (
                  <Skeleton key={i} isLoading={isLoading} className="min-h-[14rem]">
                    <div className="p-8 border border-neutral-100 hover:shadow-2xl transition-all duration-500 bg-white group flex flex-col gap-4" style={{ borderTop: `4px solid ${safeCs.primary}` }}>
                      <Target size={28} style={{ color: safeCs.primary }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                      <h3 style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: '1.5rem', lineHeight: 1.2 }}>{service.title}</h3>
                      <p style={{ fontFamily: BODY, fontWeight: 400, fontSize: '0.9rem' }} className="text-neutral-500 leading-relaxed flex-1">{service.description}</p>
                      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" style={{ color: safeCs.primary }}>
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
        <section id="about" className="py-24 md:py-32 px-6 bg-[#F7F9FC] scroll-mt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="text-center lg:text-left">
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
function GalleryMasonry({ items, displayFont, cs, dark }: { items: any[]; displayFont: string; cs: any; dark: boolean }) {
  const safeCs = cs || {};
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);
  const cols = items.length <= 3 ? 2 : items.length <= 8 ? 3 : 4;
  return (
    <>
      <div style={{ columnCount: cols, columnGap: '6px' }}>
        {items.map((item: any, i: number) => {
          const src = item.imageUrl || item;
          return (
            <div key={i} onClick={() => setLightboxSrc(src)}
              className="relative overflow-hidden rounded-lg group cursor-zoom-in"
              style={{ breakInside: 'avoid', marginBottom: '6px', display: 'block' }}>
              <img src={src} alt={`Galerie-Bild ${i + 1}`} className="w-full block object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {lightboxSrc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setLightboxSrc(null)}>
          <button onClick={() => setLightboxSrc(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <img src={lightboxSrc} alt="Vollbild" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function GallerySection({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const gallery = sec(websiteData, 'gallery');
  const items = gallery?.items || [];
  const albums: any[] = gallery?.albums || [];
  const isAlbumMode = gallery?.mode === 'albums' && albums.length > 0;
  const headline = gallery?.headline || 'Unsere Galerie';
  const [openAlbum, setOpenAlbum] = React.useState<any | null>(null);

  // Nothing to show
  if (!isAlbumMode && items.length === 0) return null;
  if (isAlbumMode && albums.length === 0) return null;

  const textColor = dark ? (safeCs.lightText || '#ffffff') : (safeCs.text || '#171717');
  const textMuted = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.65)') : (safeCs.textLight || '#737373');
  const bgClass = dark ? (safeCs.darkBackground ? '' : 'bg-neutral-900') : '';
  const bgStyle = dark
    ? { backgroundColor: safeCs.darkBackground || '#0a0a0a' }
    : { backgroundColor: safeCs.surface || '#fafafa' };

  const cols = items.length <= 3 ? 2 : items.length <= 8 ? 3 : 4;

  if (isLoading) {
    return (
      <section id="galerie" className={`py-16 px-6 scroll-mt-20 ${bgClass}`} style={bgStyle}>
        <div className="max-w-6xl mx-auto">
          <div className="w-48 h-8 rounded-lg bg-current opacity-10 mb-8" />
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${isAlbumMode ? 3 : cols}, 1fr)` }}>
            {Array.from({ length: isAlbumMode ? Math.min(albums.length || 3, 6) : Math.min(items.length || 6, 9) }).map((_, i) => (
              <div key={i} className="rounded-xl bg-current opacity-[0.07]" style={{ aspectRatio: '4/3', minHeight: 120 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galerie" className={`py-16 px-6 scroll-mt-20 ${bgClass}`} style={bgStyle}>
      <div className="max-w-6xl mx-auto">
        {/* Headline + optional back-button in album detail view */}
        <div className="flex items-center gap-4 mb-8">
          {openAlbum && (
            <button onClick={() => setOpenAlbum(null)}
              className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
              style={{ color: safeCs.primary || '#3b82f6', fontFamily: displayFont }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Alle Alben
            </button>
          )}
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor }}>
            {openAlbum ? openAlbum.name : headline}
          </h2>
        </div>

        {/* Album detail view */}
        {openAlbum && (
          <GalleryMasonry items={(openAlbum.images || []).map((url: string) => ({ imageUrl: url }))} displayFont={displayFont} cs={safeCs} dark={dark} />
        )}

        {/* Album grid */}
        {isAlbumMode && !openAlbum && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album: any, i: number) => {
              const cover = album.images?.[0];
              const count = album.images?.length || 0;
              return (
                <div key={album.id || i} onClick={() => setOpenAlbum(album)}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{ aspectRatio: '4/3' }}>
                  {cover
                    ? <img src={cover} alt={album.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    : <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                  }
                  {/* Dark overlay with name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4">
                    <p style={{ fontFamily: displayFont, fontWeight: 700, color: '#ffffff', fontSize: '1.1rem', lineHeight: 1.2 }}>{album.name || `Album ${i + 1}`}</p>
                    <p style={{ fontFamily: bodyFont, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: '2px' }}>{count} {count === 1 ? 'Foto' : 'Fotos'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Single gallery (flat masonry) */}
        {!isAlbumMode && (
          <GalleryMasonry items={items} displayFont={displayFont} cs={safeCs} dark={dark} />
        )}
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
    <section id="preise" className={`py-16 md:py-24 px-6 scroll-mt-20 ${sectionBgClass}`} style={sectionBgStyle}>
      <div className="max-w-4xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-full max-w-xl min-h-[4rem] mb-10">
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: textColor, marginBottom: '2.5rem' }}>
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

// ── FAQ SECTION ───────────────────────────────────────────────────
function FaqSection({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const faq = sec(websiteData, 'faq');
  const items: any[] = faq?.items || [];
  if (!isLoading && items.length === 0) return null;

  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const headline = faq?.headline || 'Häufige Fragen';
  const textColor = dark ? (safeCs.lightText || '#ffffff') : (safeCs.text || '#171717');
  const textMuted = dark ? (safeCs.lightTextMuted || 'rgba(255,255,255,0.7)') : (safeCs.textLight || '#737373');
  const sectionBgStyle = dark
    ? { backgroundColor: safeCs.darkBackground || '#0a0a0a' }
    : { backgroundColor: safeCs.background || '#fafafa' };
  const sectionBgClass = dark ? (safeCs.darkBackground ? '' : 'bg-neutral-900') : 'bg-neutral-50';
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const iconBg = `${safeCs.primary || '#3b82f6'}18`;

  return (
    <section id="faq" className={`py-24 md:py-32 px-6 scroll-mt-20 ${sectionBgClass}`} style={sectionBgStyle}>
      <div className="max-w-3xl mx-auto">
        <Skeleton isLoading={isLoading} className="w-64 h-10 mb-10">
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.15, color: textColor, marginBottom: '2.5rem' }}>
            {headline}
          </h2>
        </Skeleton>
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <Skeleton key={i} isLoading={isLoading} className="h-16">
              <div
                className="rounded-xl overflow-hidden cursor-pointer select-none"
                style={{ border: `1px solid ${borderColor}`, backgroundColor: dark ? 'rgba(255,255,255,0.04)' : (safeCs.surface || '#ffffff') }}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <span style={{ fontFamily: displayFont, fontWeight: 600, color: textColor, fontSize: '0.95rem' }}>
                    {item.question}
                  </span>
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200"
                    style={{ backgroundColor: iconBg, transform: openIdx === i ? 'rotate(45deg)' : 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke={safeCs.primary || '#3b82f6'} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                {openIdx === i && (
                  <div className="px-6 pb-5">
                    <p style={{ fontFamily: bodyFont, color: textMuted, fontSize: '0.9rem', lineHeight: 1.7 }}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            </Skeleton>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TEAM SECTION ─────────────────────────────────────────────────
function TeamSection({ websiteData, cs, isLoading, displayFont, bodyFont, headlineSize, dark = false }: any) {
  const safeCs = cs || {};
  const primary = safeCs.primary || '#6366f1';
  const members: any[] = (websiteData as any)?.teamMembers || [];

  if (!isLoading && members.length === 0) return null;

  const bg = dark ? 'transparent' : safeCs.surface || '#f8f9fa';
  const text = dark ? '#ffffff' : safeCs.text || '#111111';
  const textMuted = dark ? 'rgba(255,255,255,0.55)' : safeCs.textLight || '#666666';

  return (
    <section id="team" className="py-20 px-6 scroll-mt-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-8 h-px" style={{ backgroundColor: primary }} />
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold" style={{ color: primary }}>Team</span>
            <div className="w-8 h-px" style={{ backgroundColor: primary }} />
          </div>
          <h2 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: getSectionHeadlineSize(headlineSize, 'services'), lineHeight: 1.1, color: text }}>
            Unser Team
          </h2>
        </div>

        {/* Members grid */}
        <div className={`grid gap-8 ${
          members.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
          members.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
          members.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {isLoading ? [0,1,2].map(i => (
            <div key={i} className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-current opacity-10" />
              <div className="h-5 w-32 mx-auto mb-2 rounded bg-current opacity-10" />
              <div className="h-4 w-24 mx-auto rounded bg-current opacity-10" />
            </div>
          )) : members.map((m: any) => (
            <motion.div
              key={m.id}
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Photo */}
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-5 border-2" style={{ borderColor: `${primary}30` }}>
                {m.photo ? (
                  <img src={m.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: `${primary}15`, color: primary }}>
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 style={{ fontFamily: displayFont, fontWeight: 600, color: text, fontSize: '1.125rem' }} className="mb-1">{m.name}</h3>
              <p style={{ fontFamily: bodyFont, color: primary, fontSize: '0.875rem' }} className="font-medium mb-3">{m.role}</p>
              {m.bio && <p style={{ fontFamily: bodyFont, color: textMuted, fontSize: '0.875rem', lineHeight: 1.6 }} className="mb-4 px-2">{m.bio}</p>}

              {/* Contact links */}
              {(m.email || m.phone) && (
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {m.email && (
                    <a href={`mailto:${m.email}`} style={{ color: textMuted, fontSize: '0.8125rem' }}
                      className="hover:opacity-80 transition-opacity flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a href={`tel:${m.phone}`} style={{ color: textMuted, fontSize: '0.8125rem' }}
                      className="hover:opacity-80 transition-opacity flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
                      </svg>
                      {m.phone}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
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
      <FaqSection websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={displayFont} bodyFont={bodyFont} headlineSize={headlineSize} dark={dark} />
      <GallerySection websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={displayFont} bodyFont={bodyFont} headlineSize={headlineSize} dark={dark} />
      <TeamSection websiteData={websiteData} cs={cs} isLoading={isLoading} displayFont={displayFont} bodyFont={bodyFont} headlineSize={headlineSize} dark={dark} />
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: DISPLAY, fontSize: '1.25rem', fontWeight: 400, fontStyle: 'italic' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[120px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: primaryColor, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-2.5 text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={false} />
        </div>
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
          <section id="services" className="py-24 md:py-32 px-6 scroll-mt-20 bg-white">
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
        <section id="about" className="py-24 md:py-32 px-6 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
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
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: DISPLAY, fontSize: '1.4rem', letterSpacing: '0.08em' }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 w-auto min-w-[140px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor: primaryColor, fontFamily: BODY, fontWeight: 600, color: safeCs.onPrimary || '#ffffff' }} className="hidden md:block px-6 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap">{heroCta}</button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={false} />
        </div>
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
          className="relative flex items-center justify-center p-8 lg:p-12 min-h-[60vw] lg:min-h-0 z-0"
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
          <section id="services" className="py-24 md:py-32 px-6 scroll-mt-20 bg-neutral-50">
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
        <section id="about" className="py-24 md:py-32 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="text-center lg:text-left">
              {!isLoading && <div className="w-12 h-0.5 mb-8 mx-auto lg:mx-0" style={{ backgroundColor: primaryColor }} />}
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

// ================================================================
// 13. AURORA (Tech · Glassmorphism · Dark)
// ================================================================
// Aesthetic: Deep space dark with animated gradient orbs and glass cards.
// Key move: Gradient hero headline, glass service cards, animated orb background.
export function AuroraLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'Space Grotesk', sans-serif");
  const BODY = "'Inter', system-ui, sans-serif";
  const primaryColor = safeCs.primary || '#6366f1';
  const accentColor  = safeCs.accent  || '#22d3ee';
  // Aurora is always dark – fixed dark palette
  const BG      = '#080812';
  const SURFACE = 'rgba(255,255,255,0.06)';
  const BORDER  = 'rgba(255,255,255,0.1)';
  const TXT     = '#f1f5f9';
  const TXT_M   = 'rgba(241,245,249,0.65)';

  const hero        = sec(websiteData, 'hero');
  const about       = sec(websiteData, 'about');
  const services    = sec(websiteData, 'services')?.items || [];
  const heroCta     = hero?.ctaText || 'Loslegen';
  const hl          = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent  = about?.content  || websiteData.description || '';
  const footerText  = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const iconSet     = getCategoryIconSet(websiteData.businessCategory);
  const aboutImg    = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily: BODY, backgroundColor: BG, color: TXT }} className="overflow-hidden">
      <style>{`
        @keyframes aurora-a{0%,100%{transform:translate(0,0)scale(1)}40%{transform:translate(3vw,-4vh)scale(1.08)}70%{transform:translate(-2vw,3vh)scale(0.96)}}
        @keyframes aurora-b{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(-4vw,2vh)scale(1.1)}67%{transform:translate(2vw,-3vh)scale(0.93)}}
        @media(prefers-reduced-motion:reduce){.aurora-orb{animation:none!important}}
      `}</style>

      {/* Animated gradient orbs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="aurora-orb absolute rounded-full"
          style={{ width:'60vw', height:'60vw', top:'-15%', left:'-10%',
            background:`radial-gradient(circle,${primaryColor}55 0%,transparent 70%)`,
            filter:'blur(70px)', animation:'aurora-a 18s ease-in-out infinite' }} />
        <div className="aurora-orb absolute rounded-full"
          style={{ width:'50vw', height:'50vw', bottom:'5%', right:'-5%',
            background:`radial-gradient(circle,${accentColor}45 0%,transparent 70%)`,
            filter:'blur(80px)', animation:'aurora-b 22s ease-in-out infinite' }} />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4"
        style={{ background:'rgba(8,8,18,0.7)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${BORDER}` }}>
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily: DISPLAY, fontWeight:700, fontSize:'1.2rem', letterSpacing:'-0.03em', color: TXT }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-slate-400" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ background:`linear-gradient(135deg,${primaryColor},${accentColor})`, fontFamily:BODY, fontWeight:600, color:'#fff' }}
              className="hidden md:block px-6 py-2.5 text-xs uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg">
              {heroCta}
            </button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={true} />
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 text-center">
        {!isLoading && (
          <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background:`${primaryColor}22`, border:`1px solid ${primaryColor}45` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span style={{ color:primaryColor, fontFamily:BODY }} className="text-xs font-semibold uppercase tracking-[0.15em]">
              {websiteData.businessCategory || websiteData.businessName}
            </span>
          </motion.div>
        )}
        <Skeleton isLoading={isLoading} className="w-3/4 mx-auto min-h-[10rem] mb-8">
          <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.1 }}
            style={{ fontFamily:DISPLAY, fontWeight:800, lineHeight:1.05, fontSize:getHeadlineFontSize(headlineSize,'clamp(3rem,8vw,7rem)'), letterSpacing:'-0.03em' }}>
            {hl.main && hl.last ? (
              <>{hl.main}<br /><span style={{ backgroundImage:`linear-gradient(135deg,${primaryColor},${accentColor})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{hl.last}</span></>
            ) : (
              <span style={{ backgroundImage:`linear-gradient(135deg,${primaryColor},${accentColor})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{hl.main || hl.last}</span>
            )}
          </motion.h1>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-2/3 mx-auto min-h-[4rem] mb-10">
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.8, delay:0.3 }}
            style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.8 }} className="text-lg max-w-2xl mx-auto mb-0">
            {hero?.subheadline || websiteData.tagline}
          </motion.p>
        </Skeleton>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.5 }}
          className="flex flex-wrap gap-4 justify-center">
          <Skeleton isLoading={isLoading} className="min-w-[160px] h-14">
            <button style={{ background:`linear-gradient(135deg,${primaryColor},${accentColor})`, fontFamily:BODY, fontWeight:700, color:'#fff' }}
              className="px-10 py-4 rounded-full text-sm hover:scale-105 active:scale-95 transition-transform shadow-2xl whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="min-w-[140px] h-14">
            <button style={{ fontFamily:BODY, color:TXT_M, border:`1px solid ${BORDER}`, background:'rgba(255,255,255,0.04)', backdropFilter:'blur(10px)' }}
              className="px-8 py-4 rounded-full text-sm hover:bg-white/10 transition-colors whitespace-nowrap">
              Mehr erfahren
            </button>
          </Skeleton>
        </motion.div>
        {/* Hero image glass card */}
        {!isLoading && heroImageUrl && (
          <motion.div initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.8 }}
            className="mt-16 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden"
            style={{ border:`1px solid ${BORDER}`, background:SURFACE, backdropFilter:'blur(20px)', boxShadow:`0 40px 80px rgba(0,0,0,0.5)` }}>
            <img src={heroImageUrl} className="w-full h-[280px] sm:h-[360px] object-cover" alt={websiteData.businessName} />
          </motion.div>
        )}
      </section>

      {/* SERVICES */}
      <section id="services" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="text-center mb-16">
            <p style={{ color:primaryColor, fontFamily:BODY, fontSize:'0.7rem', letterSpacing:'0.2em', fontWeight:700 }} className="uppercase mb-3">
              {sec(websiteData,'services')?.title || 'Leistungen'}
            </p>
            <h2 style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:getSectionHeadlineSize(headlineSize,'services'), letterSpacing:'-0.02em', color:TXT }}>
              {sec(websiteData,'services')?.headline || 'Was wir bieten'}
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isLoading ? Array(6).fill({}) : services.slice(0,6)).map((service: any, i: number) => {
              const Icon = iconSet[i % iconSet.length];
              return (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.08 }}>
                  <Skeleton isLoading={isLoading} className="min-h-[200px] rounded-2xl">
                    <div className="p-7 rounded-2xl h-full hover:-translate-y-1 transition-transform duration-200"
                      style={{ background:SURFACE, border:`1px solid ${BORDER}`, backdropFilter:'blur(16px)' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background:`${primaryColor}25` }}>
                        <Icon size={22} style={{ color:primaryColor }} />
                      </div>
                      <h3 style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:'1.05rem', color:TXT }} className="mb-3">{service.title}</h3>
                      <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.65, fontSize:'0.88rem' }}>{service.description}</p>
                    </div>
                  </Skeleton>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8 }} className="text-center lg:text-left">
            <p style={{ color:accentColor, fontFamily:BODY, fontSize:'0.7rem', letterSpacing:'0.2em', fontWeight:700 }} className="uppercase mb-4">Über uns</p>
            <h2 style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:getSectionHeadlineSize(headlineSize,'about'), letterSpacing:'-0.02em', color:TXT }} className="mb-6">{aboutHeadline}</h2>
            <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.8 }} className="mb-8">{aboutContent}</p>
            <div className="flex justify-center lg:justify-start">
              <button style={{ background:`linear-gradient(135deg,${primaryColor},${accentColor})`, fontFamily:BODY, fontWeight:600, color:'#fff' }}
                className="px-8 py-3.5 rounded-full text-sm hover:scale-105 transition-transform whitespace-nowrap">
                {heroCta}
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8, delay:0.2 }}>
            <Skeleton isLoading={isLoading} className="min-h-[400px] rounded-3xl">
              {aboutImg
                ? <div className="rounded-3xl overflow-hidden" style={{ border:`1px solid ${BORDER}` }}><img src={aboutImg} className="w-full h-[440px] object-cover" alt={aboutHeadline} /></div>
                : <div className="rounded-3xl h-[440px] flex items-center justify-center" style={{ background:`${primaryColor}18`, border:`1px solid ${primaryColor}35` }}>
                    <span style={{ color:primaryColor, fontFamily:DISPLAY, fontWeight:700, fontSize:'5rem' }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} heading={sec(websiteData,'testimonials')?.headline||'Was Kunden sagen'} dark={true} variant={1} headlineSize={headlineSize} />
      <DynamicAddonSections websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      <ContactSection websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ letterSpacing:'-0.02em' }} template="aurora" headlineSize={headlineSize} />
      <DynamicFooter websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} footerText={footerText} variant="minimal" logoStyle={{ fontFamily:DISPLAY, fontWeight:700, letterSpacing:'-0.02em' }} />
    </div>
  );
}

// ================================================================
// 14. NEXUS (Portfolio · Bento Grid · Light)
// ================================================================
// Aesthetic: Asymmetric bento-grid hero. Cards of different sizes create visual rhythm.
// Key move: 2×2 primary hero cell + 1×1 satellites, Space Grotesk -0.03em tracking.
export function NexusLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'Space Grotesk', sans-serif");
  const BODY    = "'Plus Jakarta Sans', 'Inter', sans-serif";
  const primaryColor = safeCs.primary || '#0f172a';
  const accentColor  = safeCs.accent  || '#6366f1';
  const BG    = safeCs.background || '#ffffff';
  const TXT   = safeTextForBg(safeCs.text    || '#0f172a', true);
  const TXT_M = safeTextForBg(safeCs.textLight || '#64748b', true);

  const hero     = sec(websiteData, 'hero');
  const about    = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta  = hero?.ctaText || 'Zusammenarbeiten';
  const hl       = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent  = about?.content  || websiteData.description || '';
  const footerText    = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const iconSet    = getCategoryIconSet(websiteData.businessCategory);
  const aboutImg   = (websiteData as any).aboutImageUrl || heroImageUrl;
  const phone      = getContactItem(websiteData, 'phone');

  return (
    <div style={{ fontFamily:BODY, backgroundColor:BG, color:TXT }} className="overflow-hidden">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md" style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:'1.15rem', letterSpacing:'-0.03em', color:TXT }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-600" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor:primaryColor, fontFamily:BODY, fontWeight:600, color:'#ffffff' }}
              className="hidden md:block px-6 py-2.5 text-xs uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={false} />
        </div>
      </nav>

      {/* BENTO GRID HERO */}
      <section id="hero" className="pt-24 pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
          {/* Cell 1: 2×2 Main hero */}
          <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.7 }}
            className="col-span-2 row-span-2 rounded-3xl overflow-hidden relative p-10 flex flex-col justify-end min-h-[380px]"
            style={{ backgroundColor:primaryColor }}>
            {heroImageUrl && !isLoading && (
              <img src={heroImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-25" alt="" />
            )}
            <div className="relative z-10">
              {!isLoading && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
                  style={{ background:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.92)' }}>
                  {websiteData.businessCategory || websiteData.businessName}
                </span>
              )}
              <Skeleton isLoading={isLoading} className="min-h-[8rem] mb-4">
                <h1 style={{ fontFamily:DISPLAY, fontWeight:800, lineHeight:1.05, fontSize:getHeadlineFontSize(headlineSize,'clamp(2.2rem,5vw,4.5rem)'), color:'#ffffff', letterSpacing:'-0.03em' }} className="mb-4">
                  {hl.main}
                  {hl.main && hl.last ? <><br /><span style={{ color: accentColor === primaryColor ? 'rgba(255,255,255,0.7)' : accentColor }}>{hl.last}</span></> : null}
                </h1>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="min-h-[2.5rem] min-w-[120px]">
                <button style={{ backgroundColor:'#ffffff', color:primaryColor, fontFamily:BODY, fontWeight:700 }}
                  className="px-7 py-3 rounded-full text-sm hover:scale-105 transition-transform whitespace-nowrap">
                  {heroCta}
                </button>
              </Skeleton>
            </div>
          </motion.div>

          {/* Cell 2: Tagline */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.15 }}
            className="rounded-3xl p-7 flex flex-col justify-center" style={{ backgroundColor:`${accentColor}12`, border:`1px solid ${accentColor}22` }}>
            <Skeleton isLoading={isLoading} className="min-h-[5rem]">
              <p style={{ fontFamily:BODY, fontSize:'1rem', lineHeight:1.55, color:TXT, fontWeight:500 }}>
                {hero?.subheadline || websiteData.tagline}
              </p>
            </Skeleton>
          </motion.div>

          {/* Cell 3: Phone / CTA */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.25 }}
            className="rounded-3xl p-7 flex flex-col justify-center" style={{ backgroundColor:'#f8fafc', border:'1px solid rgba(0,0,0,0.06)' }}>
            {!isLoading && (phone
              ? <>
                  <Phone size={22} style={{ color:accentColor }} className="mb-3" />
                  <p style={{ fontFamily:BODY, fontWeight:600, color:TXT, fontSize:'0.9rem' }}>{phone}</p>
                  <p style={{ fontFamily:BODY, color:TXT_M, fontSize:'0.75rem', marginTop:'0.25rem' }}>Ruf uns an</p>
                </>
              : <>
                  <ArrowRight size={22} style={{ color:accentColor }} className="mb-3" />
                  <p style={{ fontFamily:BODY, fontWeight:600, color:TXT, fontSize:'0.9rem' }}>Kontakt aufnehmen</p>
                </>
            )}
          </motion.div>
        </div>

        {/* Service mini-cards row */}
        <div className="max-w-7xl mx-auto mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(isLoading ? Array(4).fill({}) : services).map((service: any, i: number) => {
            const Icon = iconSet[i % iconSet.length];
            return (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.07 }}>
                <Skeleton isLoading={isLoading} className="min-h-[160px] rounded-3xl">
                  <div className="p-6 rounded-3xl h-full hover:shadow-lg transition-shadow duration-200"
                    style={{ backgroundColor:'#f8fafc', border:'1px solid rgba(0,0,0,0.06)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor:`${primaryColor}12` }}>
                      <Icon size={18} style={{ color:primaryColor }} />
                    </div>
                    <h3 style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:'0.92rem', color:TXT }} className="mb-2">{service.title}</h3>
                    <p style={{ fontFamily:BODY, color:TXT_M, fontSize:'0.8rem', lineHeight:1.55 }}>{service.description}</p>
                  </div>
                </Skeleton>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8 }}>
            <Skeleton isLoading={isLoading} className="min-h-[400px] rounded-3xl">
              {aboutImg
                ? <div className="rounded-3xl overflow-hidden"><img src={aboutImg} className="w-full h-[420px] object-cover" alt={aboutHeadline} /></div>
                : <div className="rounded-3xl h-[420px] flex items-center justify-center" style={{ backgroundColor:`${primaryColor}10`, border:`1px solid ${primaryColor}20` }}>
                    <span style={{ color:primaryColor, fontFamily:DISPLAY, fontWeight:700, fontSize:'5rem' }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8, delay:0.2 }} className="text-center lg:text-left">
            <p style={{ color:accentColor, fontFamily:BODY, fontSize:'0.7rem', letterSpacing:'0.2em', fontWeight:700 }} className="uppercase mb-4">Über uns</p>
            <h2 style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:getSectionHeadlineSize(headlineSize,'about'), letterSpacing:'-0.03em', color:TXT }} className="mb-6">{aboutHeadline}</h2>
            <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.8 }} className="mb-8">{aboutContent}</p>
            <div className="flex justify-center lg:justify-start">
              <button style={{ backgroundColor:primaryColor, fontFamily:BODY, fontWeight:600, color:'#ffffff' }}
                className="px-8 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
                {heroCta}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading={sec(websiteData,'testimonials')?.headline||'Was Kunden sagen'} dark={false} variant={0} headlineSize={headlineSize} />
      <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ letterSpacing:'-0.03em' }} template="nexus" headlineSize={headlineSize} />
      <DynamicFooter websiteData={websiteData} cs={safeCs} isLoading={isLoading} footerText={footerText} variant="default" logoStyle={{ fontFamily:DISPLAY, fontWeight:700, letterSpacing:'-0.03em' }} />
    </div>
  );
}

// ================================================================
// 15. CLAY (Wellness · Claymorphism · Pastel)
// ================================================================
// Aesthetic: Soft 3D cards with double shadows, blob shapes, rounded everything.
// Key move: Clay card treatment with dual shadows, pastel palette, large border-radius.
export function ClayLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'Nunito', 'Varela Round', sans-serif");
  const BODY    = "'Outfit', 'Inter', sans-serif";
  const primaryColor = safeCs.primary || '#db2777';
  const accentColor  = safeCs.accent  || '#a78bfa';
  const BG    = safeCs.background || '#fdf4ff';
  const TXT   = safeTextForBg(safeCs.text    || '#2d2d44', true);
  const TXT_M = safeTextForBg(safeCs.textLight || '#6b6b8a', true);

  const clay = (bg = '#ffffff'): React.CSSProperties => ({
    backgroundColor: bg,
    borderRadius: '28px',
    boxShadow: '12px 12px 28px rgba(0,0,0,0.08), -6px -6px 16px rgba(255,255,255,0.82)',
    border: '1px solid rgba(255,255,255,0.65)',
  });

  const hero     = sec(websiteData, 'hero');
  const about    = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta  = hero?.ctaText || 'Termin buchen';
  const hl       = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent  = about?.content  || websiteData.description || '';
  const footerText    = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const iconSet = getCategoryIconSet(websiteData.businessCategory);
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily:BODY, backgroundColor:BG, color:TXT }} className="overflow-hidden">
      <style>{`
        @keyframes clay-blob{0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}}
        @media(prefers-reduced-motion:reduce){.clay-blob-el{animation:none!important}}
      `}</style>
      {/* Decorative blobs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex:0 }}>
        <div className="clay-blob-el absolute" style={{ width:'50vw', height:'50vw', top:'-15%', right:'-10%',
          background:`radial-gradient(circle,${primaryColor}22 0%,transparent 70%)`, filter:'blur(40px)',
          animation:'clay-blob 10s ease-in-out infinite' }} />
        <div className="clay-blob-el absolute" style={{ width:'40vw', height:'40vw', bottom:'0', left:'-5%',
          background:`radial-gradient(circle,${accentColor}1e 0%,transparent 70%)`, filter:'blur(50px)',
          animation:'clay-blob 13s ease-in-out infinite 3s' }} />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4"
        style={{ background:`${BG}e8`, backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.5)',
          boxShadow:'0 2px 20px rgba(0,0,0,0.06)' }}>
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily:DISPLAY, fontWeight:800, fontSize:'1.2rem', color:primaryColor }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-500" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor:primaryColor, fontFamily:BODY, fontWeight:700, color:'#fff',
              borderRadius:'50px', boxShadow:`0 8px 20px ${primaryColor}45` }}
              className="hidden md:block px-6 py-2.5 text-sm hover:scale-105 active:scale-95 transition-transform whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={false} />
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative z-10 min-h-screen flex items-center pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full">
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8 }}>
            {!isLoading && (
              <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ backgroundColor:`${primaryColor}1e`, border:`1.5px solid ${primaryColor}35` }}>
                <Sparkles size={13} style={{ color:primaryColor }} />
                <span style={{ color:primaryColor, fontFamily:BODY }} className="text-xs font-semibold">
                  {websiteData.businessCategory || websiteData.businessName}
                </span>
              </motion.div>
            )}
            <Skeleton isLoading={isLoading} className="min-h-[9rem] mb-6">
              <h1 style={{ fontFamily:DISPLAY, fontWeight:900, lineHeight:1.15, fontSize:getHeadlineFontSize(headlineSize,'clamp(3rem,7vw,6rem)'), color:TXT }}>
                {hl.main}
                {hl.main && hl.last ? <><br /><span style={{ color:primaryColor }}>{hl.last}</span></> : null}
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 min-h-[3.5rem] mb-8">
              <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.75, fontSize:'1.05rem' }} className="mb-0">
                {hero?.subheadline || websiteData.tagline}
              </p>
            </Skeleton>
            <div className="flex flex-wrap gap-4">
              <Skeleton isLoading={isLoading} className="min-w-[150px] h-14">
                <button style={{ backgroundColor:primaryColor, fontFamily:BODY, fontWeight:700, color:'#fff',
                  borderRadius:'50px', boxShadow:`0 12px 30px ${primaryColor}45` }}
                  className="px-10 py-4 text-sm hover:scale-105 active:scale-95 transition-transform whitespace-nowrap">
                  {heroCta}
                </button>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="min-w-[130px] h-14">
                <div style={{ ...clay(), padding:'1rem 2rem', cursor:'pointer', fontFamily:BODY, color:TXT_M }}
                  className="text-sm hover:scale-[1.02] transition-transform whitespace-nowrap flex items-center">
                  Mehr erfahren
                </div>
              </Skeleton>
            </div>
          </motion.div>
          {/* Hero image clay card */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.2 }}>
            <Skeleton isLoading={isLoading} className="min-h-[420px] rounded-[40px]">
              {heroImageUrl
                ? <div style={{ ...clay(), overflow:'hidden', borderRadius:'40px' }}>
                    <img src={heroImageUrl} className="w-full h-[450px] sm:h-[520px] object-cover" alt={websiteData.businessName} />
                  </div>
                : <div style={{ ...clay(`${primaryColor}15`), height:'450px' }} className="flex items-center justify-center">
                    <span style={{ color:primaryColor, fontFamily:DISPLAY, fontWeight:900, fontSize:'6rem' }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="text-center mb-14">
            <h2 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:getSectionHeadlineSize(headlineSize,'services'), color:TXT }}>
              {sec(websiteData,'services')?.headline || 'Unsere Angebote'}
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isLoading ? Array(6).fill({}) : services.slice(0,6)).map((service: any, i: number) => {
              const Icon = iconSet[i % iconSet.length];
              const pastelBgs = ['#fff0f8','#f0f4ff','#f0fff4','#fffbf0','#f8f0ff','#f0fffe'];
              return (
                <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.09 }}>
                  <Skeleton isLoading={isLoading} className="min-h-[200px] rounded-[28px]">
                    <div className="p-7 h-full hover:-translate-y-1.5 hover:scale-[1.01] transition-transform duration-200"
                      style={clay(pastelBgs[i % pastelBgs.length])}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor:`${primaryColor}22` }}>
                        <Icon size={22} style={{ color:primaryColor }} />
                      </div>
                      <h3 style={{ fontFamily:DISPLAY, fontWeight:800, fontSize:'1.05rem', color:TXT }} className="mb-3">{service.title}</h3>
                      <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.65, fontSize:'0.88rem' }}>{service.description}</p>
                    </div>
                  </Skeleton>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8 }} className="text-center lg:text-left">
            <h2 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:getSectionHeadlineSize(headlineSize,'about'), color:TXT }} className="mb-6">{aboutHeadline}</h2>
            <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.8 }} className="mb-8">{aboutContent}</p>
            <div className="flex justify-center lg:justify-start">
              <button style={{ backgroundColor:primaryColor, fontFamily:BODY, fontWeight:700, color:'#fff',
                borderRadius:'50px', boxShadow:`0 10px 25px ${primaryColor}45` }}
                className="px-8 py-3.5 text-sm hover:scale-105 transition-transform whitespace-nowrap">
                {heroCta}
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8, delay:0.2 }}>
            <Skeleton isLoading={isLoading} className="min-h-[400px] rounded-[40px]">
              {aboutImg
                ? <div style={{ ...clay(), overflow:'hidden', borderRadius:'40px' }}><img src={aboutImg} className="w-full h-[440px] object-cover" alt={aboutHeadline} /></div>
                : <div style={{ ...clay(`${primaryColor}15`), height:'440px' }} className="flex items-center justify-center">
                    <span style={{ color:primaryColor, fontFamily:DISPLAY, fontWeight:900, fontSize:'5rem' }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading={sec(websiteData,'testimonials')?.headline||'Das sagen unsere Kunden'} dark={false} variant={0} serif={false} headlineSize={headlineSize} />
      <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ fontWeight:900 }} template="clay" headlineSize={headlineSize} />
      <DynamicFooter websiteData={websiteData} cs={safeCs} isLoading={isLoading} footerText={footerText} variant="default" logoStyle={{ fontFamily:DISPLAY, fontWeight:900 }} />
    </div>
  );
}

// ================================================================
// 16. FORGE (Architecture · Brutalist Editorial · Sharp)
// ================================================================
// Aesthetic: Oversized editorial typography, strong grid lines, no border-radius.
// Key move: Massive Cormorant Garamond 300 headlines, numbered service list, accent stripe.
export function ForgeLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'Cormorant Garamond', Georgia, serif");
  const BODY    = "'Space Grotesk', sans-serif";
  const primaryColor = safeCs.primary || '#0a0a0a';
  const accentColor  = safeCs.accent  || '#c4a000';
  const BG    = safeCs.background || '#f8f7f4';
  const TXT   = safeTextForBg(safeCs.text    || '#0a0a0a', true);
  const TXT_M = safeTextForBg(safeCs.textLight || '#5a5a5a', true);

  const hero     = sec(websiteData, 'hero');
  const about    = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta  = hero?.ctaText || 'Kontakt aufnehmen';
  const heroHeadline = hero?.headline || websiteData.tagline || websiteData.businessName || '';
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent  = about?.content  || websiteData.description || '';
  const footerText    = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const aboutImg   = (websiteData as any).aboutImageUrl || heroImageUrl;
  const iconSet    = getCategoryIconSet(websiteData.businessCategory);

  return (
    <div style={{ fontFamily:BODY, backgroundColor:BG, color:TXT }} className="overflow-hidden">
      {/* NAV – minimal, line-based */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-5"
        style={{ background:`${BG}f5`, backdropFilter:'blur(12px)', borderBottom:`2px solid ${TXT}` }}>
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily:DISPLAY, fontWeight:600, fontSize:'1.1rem', letterSpacing:'0.04em', textTransform:'uppercase' as const }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-neutral-700" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ backgroundColor:TXT, fontFamily:BODY, fontWeight:500, color:'#fff', letterSpacing:'0.08em' }}
              className="hidden md:block px-6 py-2.5 text-xs uppercase hover:opacity-80 transition-opacity whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={false} />
        </div>
      </nav>

      {/* HERO – oversized typo + full image */}
      <section id="hero" className="pt-28 min-h-screen grid lg:grid-cols-[55%_45%] overflow-hidden"
        style={{ borderBottom:`2px solid ${TXT}` }}>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:1 }}
          className="flex flex-col justify-center px-8 lg:px-16 py-20 relative">
          {!isLoading && (
            <p style={{ fontFamily:BODY, fontSize:'0.65rem', letterSpacing:'0.3em', color:accentColor, fontWeight:600 }} className="uppercase mb-8">
              {websiteData.businessCategory || '—'}
            </p>
          )}
          <Skeleton isLoading={isLoading} className="min-h-[16rem] mb-8">
            <h1 style={{ fontFamily:DISPLAY, fontWeight:300, lineHeight:0.95,
              fontSize:getHeadlineFontSize(headlineSize,'clamp(4rem,10vw,9rem)'),
              letterSpacing:'-0.03em', textTransform:'uppercase' as const, color:TXT }}>
              {heroHeadline}
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 min-h-[3.5rem] mb-10">
            <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.7, maxWidth:'50ch',
              borderLeft:`3px solid ${accentColor}`, paddingLeft:'1.25rem' }}>
              {hero?.subheadline || websiteData.tagline}
            </p>
          </Skeleton>
          <div className="flex flex-wrap gap-4">
            <Skeleton isLoading={isLoading} className="min-w-[160px] h-14">
              <button style={{ backgroundColor:TXT, fontFamily:BODY, fontWeight:500, color:'#fff', letterSpacing:'0.08em' }}
                className="px-10 py-4 text-xs uppercase hover:opacity-80 active:opacity-60 transition-opacity whitespace-nowrap">
                {heroCta}
              </button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="min-w-[140px] h-14">
              <button style={{ fontFamily:BODY, color:TXT_M, border:`2px solid ${TXT}`, letterSpacing:'0.08em',
                backgroundColor:'transparent' }}
                className="px-8 py-4 text-xs uppercase hover:bg-black hover:text-white transition-colors whitespace-nowrap">
                Mehr erfahren
              </button>
            </Skeleton>
          </div>
        </motion.div>

        {/* Right: Full image */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:1.2, delay:0.2 }}
          className="relative min-h-[55vw] lg:min-h-0 overflow-hidden" style={{ borderLeft:`2px solid ${TXT}` }}>
          <Skeleton isLoading={isLoading} className="absolute inset-0">
            {heroImageUrl && <img src={heroImageUrl} className="absolute inset-0 w-full h-full object-cover"
              style={{ filter:'grayscale(20%) contrast(1.05)' }} alt="" />}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor:accentColor }} />
          </Skeleton>
        </motion.div>
      </section>

      {/* SERVICES – numbered editorial list */}
      <section id="services" className="py-20 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline gap-8 mb-16" style={{ borderBottom:`2px solid ${TXT}`, paddingBottom:'1.5rem' }}>
            <h2 style={{ fontFamily:DISPLAY, fontWeight:300, fontSize:getSectionHeadlineSize(headlineSize,'services'),
              letterSpacing:'-0.02em', textTransform:'uppercase' as const, color:TXT }}>
              {sec(websiteData,'services')?.headline || 'Leistungen'}
            </h2>
            <span style={{ fontFamily:BODY, color:accentColor, fontSize:'0.7rem', letterSpacing:'0.2em', fontWeight:600 }} className="uppercase">
              {services.length} Angebote
            </span>
          </div>
          <div style={{ borderTop:`2px solid ${TXT}` }}>
            {(isLoading ? Array(5).fill({}) : services.slice(0,5)).map((service: any, i: number) => {
              const Icon = iconSet[i % iconSet.length];
              return (
                <motion.div key={i} initial={{ opacity:0, y:15 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.08 }}>
                  <Skeleton isLoading={isLoading} className="min-h-[80px]">
                    <div className="flex items-start gap-6 py-8 hover:bg-black/[0.02] transition-colors"
                      style={{ borderBottom:`2px solid ${TXT}` }}>
                      <span style={{ fontFamily:BODY, fontWeight:600, color:accentColor, fontSize:'0.75rem', minWidth:'2.5rem' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h3 style={{ fontFamily:DISPLAY, fontWeight:600, fontSize:'1.4rem', color:TXT,
                          textTransform:'uppercase' as const, letterSpacing:'-0.01em' }} className="mb-2">
                          {service.title}
                        </h3>
                        <p style={{ fontFamily:BODY, color:TXT_M, fontSize:'0.88rem', lineHeight:1.65, maxWidth:'60ch' }}>{service.description}</p>
                      </div>
                      <Icon size={20} style={{ color:accentColor, opacity:0.6, marginTop:'0.2rem' }} />
                    </div>
                  </Skeleton>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 px-8 lg:px-16" style={{ borderTop:`2px solid ${TXT}`, borderBottom:`2px solid ${TXT}` }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[40%_60%] gap-16 items-start">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.8 }} className="text-center lg:text-left">
            <h2 style={{ fontFamily:DISPLAY, fontWeight:300, fontSize:getSectionHeadlineSize(headlineSize,'about'),
              textTransform:'uppercase' as const, letterSpacing:'-0.02em', color:TXT }} className="mb-8">
              {aboutHeadline}
            </h2>
            <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.8, fontSize:'0.95rem' }} className="mb-8">{aboutContent}</p>
            <div className="flex justify-center lg:justify-start">
              <button style={{ backgroundColor:TXT, fontFamily:BODY, fontWeight:500, color:'#fff', letterSpacing:'0.08em' }}
                className="px-8 py-3.5 text-xs uppercase hover:opacity-80 transition-opacity whitespace-nowrap">
                {heroCta}
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.8, delay:0.2 }}>
            <Skeleton isLoading={isLoading} className="min-h-[420px]">
              {aboutImg
                ? <img src={aboutImg} className="w-full h-[480px] object-cover"
                    style={{ filter:'grayscale(15%) contrast(1.05)' }} alt={aboutHeadline} />
                : <div className="h-[480px] flex items-center justify-center" style={{ backgroundColor:`${primaryColor}08` }}>
                    <span style={{ color:TXT, fontFamily:DISPLAY, fontSize:'8rem', fontWeight:300 }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} heading={sec(websiteData,'testimonials')?.headline||'Referenzen'} dark={false} variant={0} serif={true} headlineSize={headlineSize} />
      <DynamicAddonSections websiteData={websiteData} cs={safeCs} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      <ContactSection websiteData={websiteData} cs={safeCs} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ fontWeight:300, textTransform:'uppercase' as const, letterSpacing:'-0.02em' }} template="forge" headlineSize={headlineSize} />
      <DynamicFooter websiteData={websiteData} cs={safeCs} isLoading={isLoading} footerText={footerText} variant="default" showBorder={true} logoStyle={{ fontFamily:DISPLAY, fontWeight:600, textTransform:'uppercase' as const, letterSpacing:'0.04em' }} />
    </div>
  );
}

// ================================================================
// 17. PULSE (Health · Neumorphism · Soft 3D)
// ================================================================
// Aesthetic: Soft raised & pressed surfaces on light gray, circular elements, health feel.
// Key move: Dual-shadow neumorphic cards, gradient CTAs, pressed badge effect.
export function PulseLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'Plus Jakarta Sans', sans-serif");
  const BODY    = "'Inter', system-ui, sans-serif";
  const primaryColor = safeCs.primary || '#4f86c6';
  const accentColor  = safeCs.accent  || '#5dbb9c';
  const NEU  = '#e8ecf0';   // Neumorphic base
  const TXT  = '#2d3748';
  const TXT_M = '#718096';

  const neuRaised:  React.CSSProperties = { background:NEU, boxShadow:'8px 8px 20px rgba(163,177,198,0.6),-8px -8px 20px rgba(255,255,255,0.8)', borderRadius:'20px' };
  const neuPressed: React.CSSProperties = { background:NEU, boxShadow:'inset 6px 6px 14px rgba(163,177,198,0.6),inset -6px -6px 14px rgba(255,255,255,0.7)', borderRadius:'20px' };

  const hero     = sec(websiteData, 'hero');
  const about    = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta  = hero?.ctaText || 'Termin anfragen';
  const hl       = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent  = about?.content  || websiteData.description || '';
  const footerText    = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const iconSet  = getCategoryIconSet(websiteData.businessCategory);
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily:BODY, backgroundColor:NEU, color:TXT }} className="overflow-hidden">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4"
        style={{ background:`${NEU}f5`, backdropFilter:'blur(16px)',
          boxShadow:'0 2px 12px rgba(163,177,198,0.3)' }}>
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:'1.2rem', color:TXT }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-slate-600" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ background:`linear-gradient(135deg,${primaryColor},${accentColor})`, fontFamily:BODY,
              fontWeight:600, color:'#fff', boxShadow:`0 6px 18px ${primaryColor}50`, borderRadius:'50px' }}
              className="hidden md:block px-6 py-2.5 text-xs uppercase tracking-wider hover:scale-105 transition-transform whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={false} />
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="min-h-screen flex items-center pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8 }}>
            {!isLoading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8"
                style={{ ...neuPressed, borderRadius:'50px', paddingLeft:'1rem', paddingRight:'1rem' }}>
                <Heart size={13} style={{ color:primaryColor }} />
                <span style={{ color:primaryColor, fontFamily:BODY, fontSize:'0.75rem', fontWeight:600 }}>
                  {websiteData.businessCategory || websiteData.businessName}
                </span>
              </div>
            )}
            <Skeleton isLoading={isLoading} className="min-h-[10rem] mb-6">
              <h1 style={{ fontFamily:DISPLAY, fontWeight:800, lineHeight:1.1,
                fontSize:getHeadlineFontSize(headlineSize,'clamp(2.8rem,6vw,5.5rem)'), color:TXT }}>
                {hl.main}
                {hl.main && hl.last ? <><br /><span style={{ color:primaryColor }}>{hl.last}</span></> : null}
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 min-h-[3.5rem] mb-10">
              <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.75, fontSize:'1.05rem' }} className="mb-0">
                {hero?.subheadline || websiteData.tagline}
              </p>
            </Skeleton>
            <div className="flex flex-wrap gap-4">
              <Skeleton isLoading={isLoading} className="min-w-[150px] h-14">
                <button style={{ background:`linear-gradient(135deg,${primaryColor},${accentColor})`,
                  fontFamily:BODY, fontWeight:700, color:'#fff', borderRadius:'50px',
                  boxShadow:`0 10px 28px ${primaryColor}50` }}
                  className="px-10 py-4 text-sm hover:scale-105 active:scale-95 transition-transform whitespace-nowrap">
                  {heroCta}
                </button>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="min-w-[130px] h-14">
                <button style={{ ...neuRaised, fontFamily:BODY, color:TXT_M, paddingLeft:'2rem', paddingRight:'2rem', paddingTop:'1rem', paddingBottom:'1rem' }}
                  className="text-sm whitespace-nowrap">
                  Mehr erfahren
                </button>
              </Skeleton>
            </div>
          </motion.div>
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.2 }}>
            <Skeleton isLoading={isLoading} className="min-h-[420px] rounded-[30px]">
              {heroImageUrl
                ? <div style={{ ...neuRaised, overflow:'hidden', borderRadius:'30px' }}>
                    <img src={heroImageUrl} className="w-full h-[460px] object-cover" alt={websiteData.businessName} />
                  </div>
                : <div style={{ ...neuRaised, height:'460px' }} className="flex items-center justify-center">
                    <span style={{ color:primaryColor, fontFamily:DISPLAY, fontWeight:700, fontSize:'5rem' }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="text-center mb-16">
            <h2 style={{ fontFamily:DISPLAY, fontWeight:800, fontSize:getSectionHeadlineSize(headlineSize,'services'), color:TXT }}>
              {sec(websiteData,'services')?.headline || 'Unsere Angebote'}
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(isLoading ? Array(6).fill({}) : services.slice(0,6)).map((service: any, i: number) => {
              const Icon = iconSet[i % iconSet.length];
              return (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.09 }}>
                  <Skeleton isLoading={isLoading} className="min-h-[200px] rounded-[20px]">
                    <div className="p-7 hover:scale-[1.01] transition-transform duration-200" style={neuRaised}>
                      <div className="w-14 h-14 flex items-center justify-center mb-5"
                        style={{ ...neuPressed, borderRadius:'16px', paddingLeft:'12px', paddingRight:'12px', paddingTop:'12px', paddingBottom:'12px' }}>
                        <Icon size={24} style={{ color:primaryColor }} />
                      </div>
                      <h3 style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:'1.05rem', color:TXT }} className="mb-3">{service.title}</h3>
                      <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.65, fontSize:'0.88rem' }}>{service.description}</p>
                    </div>
                  </Skeleton>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8 }}>
            <Skeleton isLoading={isLoading} className="min-h-[400px] rounded-[30px]">
              {aboutImg
                ? <div style={{ ...neuRaised, overflow:'hidden', borderRadius:'30px' }}>
                    <img src={aboutImg} className="w-full h-[440px] object-cover" alt={aboutHeadline} />
                  </div>
                : <div style={{ ...neuRaised, height:'440px' }} className="flex items-center justify-center">
                    <span style={{ color:primaryColor, fontFamily:DISPLAY, fontWeight:700, fontSize:'5rem' }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8, delay:0.2 }}>
            <h2 style={{ fontFamily:DISPLAY, fontWeight:800, fontSize:getSectionHeadlineSize(headlineSize,'about'), color:TXT }} className="mb-6">{aboutHeadline}</h2>
            <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.8, maxWidth:'55ch' }} className="mb-8">{aboutContent}</p>
            <button style={{ background:`linear-gradient(135deg,${primaryColor},${accentColor})`,
              fontFamily:BODY, fontWeight:700, color:'#fff', borderRadius:'50px',
              boxShadow:`0 10px 28px ${primaryColor}40` }}
              className="px-8 py-3.5 text-sm hover:scale-105 transition-transform whitespace-nowrap">
              {heroCta}
            </button>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection websiteData={websiteData} cs={{ ...safeCs, surface:NEU, background:NEU }} isLoading={isLoading} heading={sec(websiteData,'testimonials')?.headline||'Was Kunden sagen'} dark={false} variant={0} headlineSize={headlineSize} />
      <DynamicAddonSections websiteData={websiteData} cs={{ ...safeCs, surface:NEU, background:NEU }} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={false} />
      <ContactSection websiteData={websiteData} cs={{ ...safeCs, background:NEU, surface:NEU }} isLoading={isLoading} dark={false} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{}} template="pulse" headlineSize={headlineSize} />
      <DynamicFooter websiteData={websiteData} cs={{ ...safeCs, background:NEU }} isLoading={isLoading} footerText={footerText} variant="default" logoStyle={{ fontFamily:DISPLAY, fontWeight:700 }} />
    </div>
  );
}

// ================================================================
// 18. FLUX (Restaurant · Dark Cinematic · Gold)
// ================================================================
// Aesthetic: Deep dark background, full-bleed cinematic hero, warm gold accents.
// Key move: Full-screen hero image at 40% brightness, gradient from bottom, gold typography.
export function FluxLayoutV2({ websiteData, cs, heroImageUrl, isLoading, headlineSize }: any) {
  const safeCs = cs || {};
  const DISPLAY = getDisplayFont(websiteData, "'Syne', Impact, sans-serif");
  const BODY    = "'Inter', system-ui, sans-serif";
  const primaryColor = safeCs.primary || '#d4a843';
  const accentColor  = safeCs.accent  || '#b07d3a';
  const BG      = '#060608';
  const SURFACE = '#0e0e12';
  const TXT     = '#f5f0e8';
  const TXT_M   = 'rgba(245,240,232,0.62)';
  const BORDER  = `rgba(212,168,67,0.22)`;

  const hero     = sec(websiteData, 'hero');
  const about    = sec(websiteData, 'about');
  const services = sec(websiteData, 'services')?.items || [];
  const heroCta  = hero?.ctaText || 'Reservieren';
  const hl       = splitHeadline(hero?.headline || websiteData.tagline || websiteData.businessName || '');
  const aboutHeadline = about?.headline || 'Über uns';
  const aboutContent  = about?.content  || websiteData.description || '';
  const footerText    = websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`;
  const iconSet  = getCategoryIconSet(websiteData.businessCategory);
  const aboutImg = (websiteData as any).aboutImageUrl || heroImageUrl;

  return (
    <div style={{ fontFamily:BODY, backgroundColor:BG, color:TXT }} className="overflow-hidden">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-5"
        style={{ background:'rgba(6,6,8,0.78)', backdropFilter:'blur(24px)', borderBottom:`1px solid ${BORDER}` }}>
        <Skeleton isLoading={isLoading} className="min-w-0 max-w-[40%] min-h-[2rem] overflow-hidden">
          {(websiteData as any).logoImageUrl
            ? <img src={(websiteData as any).logoImageUrl} alt={websiteData.businessName} className="h-8 w-auto object-contain max-w-[160px]" />
            : <span style={{ fontFamily:DISPLAY, fontWeight:800, fontSize:'1.2rem', letterSpacing:'0.08em',
                textTransform:'uppercase' as const, color:primaryColor }}>{websiteData.businessName}</span>}
        </Skeleton>
        <NavLinks textClass="text-amber-200/60" />
        <div className="flex items-center gap-3">
          <Skeleton isLoading={isLoading} className="flex-shrink-0 min-w-[130px] h-10">
            <button onClick={scrollToContact} style={{ border:`1px solid ${primaryColor}`, color:primaryColor, fontFamily:BODY, fontWeight:500,
              letterSpacing:'0.1em', backgroundColor:'transparent' }}
              className="hidden md:block px-6 py-2.5 text-xs uppercase hover:bg-amber-400/10 transition-colors whitespace-nowrap">
              {heroCta}
            </button>
          </Skeleton>
          <MobileMenu businessName={websiteData.businessName} accentColor={primaryColor} isDark={true} />
        </div>
      </nav>

      {/* CINEMATIC HERO */}
      <section id="hero" className="relative min-h-screen flex items-end pb-24 overflow-hidden">
        {heroImageUrl && !isLoading && (
          <div className="absolute inset-0">
            <img src={heroImageUrl} className="w-full h-full object-cover"
              style={{ filter:'brightness(0.38) saturate(0.82)' }} alt="" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background:`linear-gradient(to top,${BG} 18%,rgba(6,6,8,0.55) 55%,transparent 100%)` }} />
        {/* Gold light leak top */}
        {!isLoading && (
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background:`linear-gradient(90deg,transparent,${primaryColor},transparent)`,
              boxShadow:`0 0 40px 6px ${primaryColor}35` }} />
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-8 w-full">
          {!isLoading && (
            <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
              style={{ fontFamily:BODY, fontSize:'0.65rem', letterSpacing:'0.3em', color:primaryColor, fontWeight:600 }} className="uppercase mb-6">
              {websiteData.businessCategory || '—'}
            </motion.p>
          )}
          <Skeleton isLoading={isLoading} className="min-h-[14rem] mb-8">
            <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.1 }}
              style={{ fontFamily:DISPLAY, fontWeight:800, lineHeight:1.0,
                fontSize:getHeadlineFontSize(headlineSize,'clamp(2rem, 5vw, 5rem)'),
                letterSpacing:'-0.02em', textTransform:'uppercase' as const, color:TXT,
                textShadow:`0 0 60px rgba(212,168,67,0.22)`,
                overflowWrap:'break-word', wordBreak:'break-word' }}>
              {hl.main}
              {hl.main && hl.last ? <><br /><span style={{ color:primaryColor }}>{hl.last}</span></> : null}
            </motion.h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 min-h-[3rem] mb-10">
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.8, delay:0.4 }}
              style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.7, fontSize:'1.05rem',
                borderLeft:`2px solid ${primaryColor}`, paddingLeft:'1.25rem' }}>
              {hero?.subheadline || websiteData.tagline}
            </motion.p>
          </Skeleton>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.6 }}
            className="flex flex-wrap gap-4">
            <Skeleton isLoading={isLoading} className="min-w-[160px] h-14">
              <button style={{ backgroundColor:primaryColor, fontFamily:BODY, fontWeight:700, color:'#000',
                letterSpacing:'0.08em' }}
                className="px-10 py-4 text-xs uppercase hover:brightness-110 active:scale-95 transition-all shadow-lg whitespace-nowrap">
                {heroCta}
              </button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="min-w-[140px] h-14">
              <button style={{ fontFamily:BODY, color:TXT_M, border:'1px solid rgba(255,255,255,0.2)',
                letterSpacing:'0.08em', backgroundColor:'transparent' }}
                className="px-8 py-4 text-xs uppercase hover:bg-white/5 transition-colors whitespace-nowrap">
                Mehr erfahren
              </button>
            </Skeleton>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="mb-16">
            <p style={{ color:primaryColor, fontFamily:BODY, fontSize:'0.65rem', letterSpacing:'0.25em', fontWeight:600 }} className="uppercase mb-4">
              {sec(websiteData,'services')?.title || 'Angebot'}
            </p>
            <h2 style={{ fontFamily:DISPLAY, fontWeight:800, fontSize:getSectionHeadlineSize(headlineSize,'services'),
              textTransform:'uppercase' as const, letterSpacing:'-0.02em', color:TXT }}>
              {sec(websiteData,'services')?.headline || 'Unsere Spezialitäten'}
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isLoading ? Array(6).fill({}) : services.slice(0,6)).map((service: any, i: number) => {
              const Icon = iconSet[i % iconSet.length];
              return (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.08 }}>
                  <Skeleton isLoading={isLoading} className="min-h-[180px] rounded-2xl">
                    <div className="p-7 rounded-2xl h-full hover:-translate-y-1 transition-transform duration-200"
                      style={{ background:SURFACE, border:`1px solid ${BORDER}` }}>
                      <Icon size={22} style={{ color:primaryColor }} className="mb-5" />
                      <h3 style={{ fontFamily:DISPLAY, fontWeight:700, fontSize:'1.05rem', color:TXT,
                        textTransform:'uppercase' as const, letterSpacing:'0.02em' }} className="mb-3">
                        {service.title}
                      </h3>
                      <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.65, fontSize:'0.88rem' }}>{service.description}</p>
                    </div>
                  </Skeleton>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-8" style={{ borderTop:`1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8 }}>
            <p style={{ color:primaryColor, fontFamily:BODY, fontSize:'0.65rem', letterSpacing:'0.25em', fontWeight:600 }} className="uppercase mb-5">Über uns</p>
            <h2 style={{ fontFamily:DISPLAY, fontWeight:800, fontSize:getSectionHeadlineSize(headlineSize,'about'),
              textTransform:'uppercase' as const, letterSpacing:'-0.02em', color:TXT }} className="mb-6">
              {aboutHeadline}
            </h2>
            <p style={{ fontFamily:BODY, color:TXT_M, lineHeight:1.8, maxWidth:'55ch' }} className="mb-8">{aboutContent}</p>
            <button style={{ backgroundColor:primaryColor, fontFamily:BODY, fontWeight:700, color:'#000',
              letterSpacing:'0.08em' }}
              className="px-8 py-3.5 text-xs uppercase hover:brightness-110 transition-all whitespace-nowrap">
              {heroCta}
            </button>
          </motion.div>
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8, delay:0.2 }}>
            <Skeleton isLoading={isLoading} className="min-h-[420px] rounded-2xl">
              {aboutImg
                ? <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${BORDER}` }}>
                    <img src={aboutImg} className="w-full h-[460px] object-cover"
                      style={{ filter:'brightness(0.82) saturate(0.9)' }} alt={aboutHeadline} />
                  </div>
                : <div className="rounded-2xl h-[460px] flex items-center justify-center"
                    style={{ background:SURFACE, border:`1px solid ${BORDER}` }}>
                    <span style={{ color:primaryColor, fontFamily:DISPLAY, fontWeight:800, fontSize:'5rem',
                      textTransform:'uppercase' as const }}>{websiteData.businessName?.[0]}</span>
                  </div>}
            </Skeleton>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} heading={sec(websiteData,'testimonials')?.headline||'Stimmen'} dark={true} variant={1} headlineSize={headlineSize} />
      <DynamicAddonSections websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} displayFont={DISPLAY} bodyFont={BODY} headlineSize={headlineSize} dark={true} />
      <ContactSection websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} dark={true} displayFont={DISPLAY} bodyFont={BODY} headlineStyle={{ textTransform:'uppercase' as const, letterSpacing:'-0.02em', fontWeight:800 }} template="flux" headlineSize={headlineSize} />
      <DynamicFooter websiteData={websiteData} cs={{ ...safeCs, primary:primaryColor, text:TXT, textLight:TXT_M }} isLoading={isLoading} footerText={footerText} variant="minimal" logoStyle={{ fontFamily:DISPLAY, fontWeight:800, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:primaryColor }} />
    </div>
  );
}

export const getLayoutKeyByIndustry = (category: string = "") => {
  const cat = category.toLowerCase();
  if (cat.includes('bau') || cat.includes('industrie') || cat.includes('handwerk')) return 'BOLD';
  if (cat.includes('friseur') || cat.includes('beauty') || cat.includes('kosmetik') || cat.includes('spa')) return 'ELEGANT';
  // PULSE before CLEAN to avoid 'arzt' substring conflict
  if (cat.includes('krankenhaus') || cat.includes('klinik') || cat.includes('pflegedienst') || cat.includes('altenpflege')) return 'PULSE';
  if (cat.includes('arzt') || cat.includes('kanzlei') || cat.includes('praxis') || cat.includes('therapie')) return 'CLEAN';
  if (cat.includes('tischler') || cat.includes('schreiner') || cat.includes('elektro') || cat.includes('sanitär')) return 'CRAFT';
  if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport') || cat.includes('training')) return 'DYNAMIC';
  // FLUX before FRESH (nightlife beats casual dining)
  if (cat.includes('nacht') || cat.includes('club') || cat.includes('lounge') || cat.includes('konzert') || cat.includes('disko')) return 'FLUX';
  if (cat.includes('café') || cat.includes('bäckerei') || cat.includes('restaurant') || cat.includes('bar')) return 'FRESH';
  if (cat.includes('auto') || cat.includes('fahrzeug') || cat.includes('immobilien') || cat.includes('schmuck')) return 'LUXURY';
  // AURORA before MODERN (startups/SaaS get glassmorphism)
  if (cat.includes('startup') || cat.includes('cloud') || cat.includes('saas') || cat.includes('cybersecurity')) return 'AURORA';
  if (cat.includes('agentur') || cat.includes('it') || cat.includes('marketing') || cat.includes('software')) return 'MODERN';
  if (cat.includes('natur') || cat.includes('bio') || cat.includes('garten') || cat.includes('florist')) return 'NATURAL';
  // CLAY for family/children services
  if (cat.includes('kinder') || cat.includes('kita') || cat.includes('kindergarten') || cat.includes('familien')) return 'CLAY';
  if (cat.includes('coach') || cat.includes('yoga') || cat.includes('ernährung') || cat.includes('fotograf') || cat.includes('massage') || cat.includes('heilpraktik')) return 'EDEN';
  // NEXUS for creative portfolios & studios
  if (cat.includes('portfolio') || cat.includes('kreativstudio') || cat.includes('designstudio') || cat.includes('atelier')) return 'NEXUS';
  // FORGE before APEX: 'architektur' > 'architekt' specificity
  if (cat.includes('architektur') || cat.includes('galerie') || cat.includes('museum') || cat.includes('innenarchitektur')) return 'FORGE';
  if (cat.includes('beratung') || cat.includes('recht') || cat.includes('steuer') || cat.includes('finanz') || cat.includes('architekt') || cat.includes('ingenieur')) return 'APEX';
  return 'PREMIUM';
};

export const LayoutEngine = ({ gmbData, websiteData, isLoading }: any) => {
  const layoutKey = getLayoutKeyByIndustry(gmbData?.category);
  const layouts: any = {
    BOLD: BoldLayoutV2, ELEGANT: ElegantLayoutV2, CLEAN: CleanLayoutV2,
    CRAFT: CraftLayoutV2, DYNAMIC: DynamicLayoutV2, FRESH: FreshLayoutV2,
    LUXURY: LuxuryLayoutV2, MODERN: ModernLayoutV2, NATURAL: NaturalLayoutV2,
    PREMIUM: PremiumLayoutV2, EDEN: EdenLayoutV2, APEX: ApexLayoutV2,
    AURORA: AuroraLayoutV2, NEXUS: NexusLayoutV2, CLAY: ClayLayoutV2,
    FORGE: ForgeLayoutV2, PULSE: PulseLayoutV2, FLUX: FluxLayoutV2,
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
