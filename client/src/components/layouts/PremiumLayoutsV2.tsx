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
import {
  ArrowRight, Phone, Star, Shield, Zap, CheckCircle2,
  ChevronRight, Play, Award, Clock, MapPin, Mail, Utensils, Flower,
  ChevronDown, ChevronUp, Instagram, Facebook, Quote, Dumbbell, Target, Gem, Ruler,
  Sparkles, Heart
} from 'lucide-react';
import type { WebsiteData, ColorScheme } from "@shared/types";

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
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-black text-xl md:text-2xl uppercase tracking-tighter italic">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-4 md:px-8 py-2.5 md:py-3 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">Projekt starten</button>
        </Skeleton>
      </nav>

      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <Skeleton isLoading={isLoading} className="absolute right-0 w-full lg:w-1/2 h-full">
          <div className="absolute right-0 w-full lg:w-1/2 h-full opacity-40 grayscale" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}>
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </div>
        </Skeleton>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <Skeleton isLoading={isLoading} className="w-full h-32 md:h-48">
              <h1 className="text-[12vw] md:text-[10vw] font-black leading-[0.8] uppercase tracking-tighter">Build <br/> <span className="italic" style={{ color: cs.primary }}>Beyond</span> <br/> Limits</h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mt-4">
              <p className="mt-6 md:mt-10 max-w-md text-white/50 text-base md:text-lg">{websiteData.tagline}</p>
            </Skeleton>
            <div className="mt-8 md:mt-12 flex flex-wrap gap-4">
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button style={{ backgroundColor: cs.primary }} className="px-6 md:px-10 py-4 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">Projekt anfragen</button>
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
            {[{ num: "25+", label: "Jahre Erfahrung" }, { num: "100%", label: "Qualität" }, { num: "500+", label: "Projekte" }, { num: "24/7", label: "Support" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-black" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs md:text-sm uppercase tracking-widest text-white/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-16">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {(websiteData.topServices || [{ title: "Industriemontage", description: "Professionelle Montage von Maschinen und Anlagen mit höchster Präzision." }, { title: "Schweißtechnik", description: "Zertifizierte Schweißarbeiten für alle Materialien und Anforderungen." }, { title: "Instandhaltung", description: "Wartung und Reparatur für maximale Betriebssicherheit und Langlebigkeit." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6 bg-neutral-900">
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
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">Präzision seit <span style={{ color: cs.primary }}>25 Jahren</span></h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
                <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8">Wir sind Ihr Partner für anspruchsvolle Industrieprojekte. Mit einem Team aus erfahrenen Fachkräften und modernster Technologie realisieren wir Ihre Vorhaben termingerecht und budgetkonform.</p>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-32 h-10">
                <button style={{ backgroundColor: cs.primary }} className="px-6 py-3 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">Mehr erfahren</button>
              </Skeleton>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-16">Kunden <span style={{ color: cs.primary }}>Stimmen</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[{ name: "Michael Weber", company: "Weber Industries", text: "Exzellente Arbeit! Termingerecht, präzise und professionell." }, { name: "Sarah Müller", company: "Müller Bau AG", text: "Das Team hat unsere Erwartungen bei Großprojekten übertroffen." }, { name: "Thomas Schmidt", company: "Schmidt GmbH", text: "Zuverlässiger Partner für komplexe Schweißarbeiten." }].map((testimonial, i) => (
              <Skeleton key={i} isLoading={isLoading} className="h-72">
                <div className="p-6 md:p-8 border border-white/10 hover:border-white/30 transition-colors">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" className="text-yellow-500" />)}
                  </div>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="font-bold uppercase tracking-tight">{testimonial.name}</p>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{testimonial.company}</p>
                  </div>
                </div>
              </Skeleton>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-16 md:py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <span className="font-black text-2xl uppercase tracking-tighter italic">{websiteData.businessName}</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-20 max-w-sm">
                <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-sm">Ihr zuverlässiger Partner für industrielle Spitzenleistungen. Präzision, Qualität und Innovation seit 1999.</p>
              </Skeleton>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/40">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/60 text-sm"><MapPin size={16} style={{ color: cs.primary }} /> Industriestraße 123</li>
                <li className="flex items-center gap-3 text-white/60 text-sm"><Phone size={16} style={{ color: cs.primary }} /> +49 30 123456789</li>
                <li className="flex items-center gap-3 text-white/60 text-sm"><Mail size={16} style={{ color: cs.primary }} /> info@example.com</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/40">Öffnungszeiten</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                <li className="flex justify-between"><span>Mo - Fr</span><span>08:00 - 18:00</span></li>
                <li className="flex justify-between"><span>Sa</span><span>Nach Vereinbarung</span></li>
                <li className="flex justify-between"><span>So</span><span>Geschlossen</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-widest">© 2026 {websiteData.businessName}. Alle Rechte vorbehalten.</p>
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
  const headline = websiteData.sections?.[0]?.headline || "Ihr Weg zu mehr Schönheit";
  const subheadline = websiteData.sections?.[0]?.subheadline || "Erleben Sie erstklassige Behandlungen in luxuriösem Ambiente.";

  return (
    <div className="bg-[#FFFDFB] text-neutral-900 font-light">
      <header className="py-6 md:py-10 text-center px-4">
        <Skeleton isLoading={isLoading} className="w-48 h-4 mx-auto mb-4">
          <h2 className="uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] font-bold opacity-40 mb-4">Est. 2026 — Pure Luxury</h2>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-64 h-10 mx-auto">
          <span className="font-serif italic text-2xl md:text-4xl">{websiteData.businessName}</span>
        </Skeleton>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 md:gap-20 items-center min-h-[70vh] md:min-h-[80vh] pb-12 md:pb-0">
        <div className="relative order-2 lg:order-1">
          <Skeleton isLoading={isLoading} className="w-full aspect-[3/4] rounded-t-full">
            <div className="overflow-hidden aspect-[3/4] shadow-2xl rounded-t-full" style={{ borderRadius: '50% 50% 0 0 / 30% 30% 0 0' }}>
              <img src={heroImageUrl} className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="" />
            </div>
          </Skeleton>
          <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-xl">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" className="text-yellow-500" />)}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-800">Kunden-Favorit</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight italic font-light mb-6 md:mb-8">{headline}</h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-20 mb-8">
            <p className="text-base md:text-lg text-neutral-500 font-light leading-relaxed mb-8 md:mb-12 max-w-md">{subheadline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-40 h-14">
            <button style={{ backgroundColor: cs.primary }} className="px-8 md:px-12 py-4 md:py-5 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg">Termin buchen</button>
          </Skeleton>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[{ num: "15+", label: "Jahre Expertise" }, { num: "50k+", label: "Zufriedene Kunden" }, { num: "4.9", label: "Sterne Bewertung" }, { num: "100%", label: "Premium-Produkte" }].map((stat, i) => (
              <div key={i} className="text-center p-4 md:p-6">
                <p className="text-3xl md:text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Unser Angebot</span>
              <h2 className="font-serif text-4xl md:text-6xl italic font-light">Unsere Leistungen</h2>
            </div>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {(websiteData.topServices || [{ title: "Gesichtsbehandlung", description: "Luxuriöse Pflege für strahlende Haut mit Premium-Produkten." }, { title: "Wellness-Massage", description: "Entspannende Ganzkörpermassage zur Stressreduktion." }, { title: "Beauty-Behandlung", description: "Professionelle Make-up- und Styling-Services." }]).map((service: any, i: number) => (
              <Skeleton key={i} isLoading={isLoading} className="h-80">
                <div className="p-6 md:p-10 border border-neutral-200 hover:shadow-xl transition-all duration-500 group bg-white">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: cs.primary + '20' }}>
                    <Sparkles size={20} style={{ color: cs.primary }} />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl italic mb-4">{service.title}</h3>
                  <p className="text-neutral-500 font-light leading-relaxed text-sm md:text-base">{service.description}</p>
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cs.primary }}>Ab 89€</span>
                  </div>
                </div>
              </Skeleton>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 md:px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <Skeleton isLoading={isLoading} className="w-32 h-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Über uns</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
                <h2 className="font-serif text-4xl md:text-5xl italic font-light mb-6">Wo Schönheit auf Wohlbefinden trifft</h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
                <p className="text-neutral-500 font-light leading-relaxed text-base md:text-lg mb-6">Seit über 15 Jahren kreieren wir einzigartige Erlebnisse, die Körper und Seele verwöhnen. Unser erfahrenes Team steht für höchste Qualität.</p>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button style={{ backgroundColor: cs.primary }} className="px-8 py-4 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg">Mehr erfahren</button>
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

      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Kundenstimmen</span>
              <h2 className="font-serif text-4xl md:text-6xl italic font-light">Was unsere Kunden sagen</h2>
            </div>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {[{ name: "Laura Schmidt", text: "Die beste Behandlung, die ich je hatte! Das Team ist unglaublich aufmerksam.", rating: 5 }, { name: "Sophie Weber", text: "Ein wahres Paradies der Entspannung. Die Atmosphäre ist wunderschön.", rating: 5 }, { name: "Maria Klein", text: "Hervorragender Service und erstklassige Produkte.", rating: 5 }].map((testimonial, i) => (
              <Skeleton key={i} isLoading={isLoading} className="h-72">
                <div className="p-6 md:p-8 border border-neutral-200 bg-white hover:shadow-lg transition-all duration-500">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" className="text-yellow-500" />)}
                  </div>
                  <p className="text-neutral-600 font-light leading-relaxed italic mb-6">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: cs.primary + '20' }}>
                      <Heart size={16} style={{ color: cs.primary }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-neutral-400 uppercase tracking-wider">Stammkundin</p>
                    </div>
                  </div>
                </div>
              </Skeleton>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-16 md:py-24 px-4 md:px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <span className="font-serif italic text-2xl md:text-3xl">{websiteData.businessName}</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-16 max-w-sm">
                <p className="text-white/50 font-light leading-relaxed max-w-sm">Ihr Premium-Studio für Beauty und Wellness. Wir verwöhnen Sie mit exklusiven Behandlungen.</p>
              </Skeleton>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-6 text-white/40">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/60 text-sm font-light"><MapPin size={16} style={{ color: cs.primary }} /> Schönheitsallee 42, Berlin</li>
                <li className="flex items-center gap-3 text-white/60 text-sm font-light"><Phone size={16} style={{ color: cs.primary }} /> +49 30 12345678</li>
                <li className="flex items-center gap-3 text-white/60 text-sm font-light"><Mail size={16} style={{ color: cs.primary }} /> hello@example.com</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-6 text-white/40">Öffnungszeiten</h3>
              <ul className="space-y-3 text-white/60 text-sm font-light">
                <li className="flex justify-between"><span>Mo - Fr</span><span>09:00 - 20:00</span></li>
                <li className="flex justify-between"><span>Samstag</span><span>10:00 - 18:00</span></li>
                <li className="flex justify-between"><span>Sonntag</span><span>Geschlossen</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-light">© 2026 {websiteData.businessName}. Alle Rechte vorbehalten.</p>
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
  return (
    <div className="bg-white text-slate-900">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-bold text-xl tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <div className="flex gap-4">
          <Skeleton isLoading={isLoading} className="w-24 h-10">
            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Leistungen</button>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-28 h-10">
            <button style={{ backgroundColor: cs.primary }} className="px-4 py-2 text-white text-sm font-medium rounded-md">Termin buchen</button>
          </Skeleton>
        </div>
      </nav>

      <section className="min-h-screen flex items-center pt-32 px-6">
        <div className="max-w-7xl mx-auto border-x border-slate-100 min-h-screen p-12 grid lg:grid-cols-2 gap-20">
          <div className="flex flex-col justify-center">
            <Skeleton isLoading={isLoading} className="w-full h-40">
              <span className="text-xs font-black uppercase tracking-widest mb-6 block" style={{ color: cs.primary }}>Medical Excellence</span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">Expert <br/> <span style={{ color: cs.primary }}>Precision</span></h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mt-6">
              <p className="text-slate-500 text-lg leading-relaxed max-w-md">{websiteData.tagline}</p>
            </Skeleton>
            <div className="mt-8 flex gap-4">
              <Skeleton isLoading={isLoading} className="w-40 h-12">
                <button style={{ backgroundColor: cs.primary }} className="px-6 py-3 text-white font-bold uppercase text-xs tracking-widest rounded-md">Kontakt</button>
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
            {[{ num: "20+", label: "Jahre Erfahrung" }, { num: "50k+", label: "Patienten" }, { num: "99%", label: "Zufriedenheit" }, { num: "24h", label: "Notfallservice" }].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-xl shadow-sm">
                <p className="text-3xl font-black" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4">Unsere Leistungen</h2>
            <p className="text-slate-500 text-center">Umfassende Versorgung mit modernster Technologie</p>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "Konsultation", description: "Ausführliche Beratung und Diagnose mit modernster Technik." }, { title: "Behandlung", description: "Schonende und effektive Therapieverfahren." }, { title: "Nachsorge", description: "Kontinuierliche Betreuung für langfristige Gesundheit." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Kompetenz und Fürsorge</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-slate-500 leading-relaxed">Unser erfahrenes Team steht für höchste medizinische Standards und menschliche Wärme. Wir nehmen uns Zeit für Sie.</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-bold text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-slate-400 text-sm max-w-sm">Ihr vertrauensvoller Partner für Gesundheit und Wohlbefinden.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><MapPin size={14} /> Musterstraße 123</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 12345678</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex justify-between"><span>Mo-Fr</span><span>08:00-18:00</span></li>
                <li className="flex justify-between"><span>Sa</span><span>09:00-14:00</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
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
  return (
    <div className="bg-white">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span className="font-black text-xl uppercase tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest">Anfragen</button>
        </Skeleton>
      </nav>

      <section className="grid lg:grid-cols-2 min-h-screen pt-20">
        <div className="p-12 lg:p-20 flex flex-col justify-center relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10">
            <Ruler className="mb-8" size={40} style={{ color: cs.primary }} />
            <Skeleton isLoading={isLoading} className="w-full h-40 relative z-10">
              <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8">Meister <br/> <span style={{ color: cs.primary }}>Qualität</span></h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-8">
              <p className="text-neutral-600 text-lg leading-relaxed max-w-md">{websiteData.tagline}</p>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-48 h-14">
              <button style={{ backgroundColor: cs.primary }} className="px-12 py-5 text-white font-bold uppercase tracking-widest text-xs">Projekt Planen</button>
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
            {[{ num: "30+", label: "Jahre Erfahrung" }, { num: "100%", label: "Handarbeit" }, { num: "TÜV", label: "Zertifiziert" }, { num: "5J", label: "Garantie" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-black" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-center mb-4">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "Maßanfertigung", description: "Individuelle Lösungen nach Ihren Wünschen und Vorstellungen." }, { title: "Reparatur", description: "Fachgerechte Reparatur und Restaurierung von Wertgegenständen." }, { title: "Beratung", description: "Persönliche Beratung für Ihr optimales Ergebnis." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
                <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Tradition & Innovation</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight">Handwerk mit <span style={{ color: cs.primary }}>Leidenschaft</span></h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24">
                <p className="text-neutral-600 leading-relaxed">Seit drei Generationen stehen wir für handwerkliche Perfektion. Jedes Projekt wird mit Präzision und Hingabe umgesetzt.</p>
              </Skeleton>
            </div>
            <Skeleton isLoading={isLoading} className="aspect-[4/3]">
              <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
            </Skeleton>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-black text-xl uppercase">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">Meisterbetrieb mit Tradition. Qualität, die überzeugt.</p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-center gap-2"><MapPin size={14} /> Handwerkerweg 45</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 87654321</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-500">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex justify-between"><span>Mo-Fr</span><span>07:00-17:00</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-500 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
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
  return (
    <div className="bg-black text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-black text-xl uppercase italic tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 font-black uppercase text-xs tracking-widest">Jetzt Starten</button>
        </Skeleton>
      </nav>

      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute right-0 w-[60%] h-full skew-x-[-12deg] translate-x-20 overflow-hidden" style={{ borderLeft: `8px solid ${cs.primary}` }}>
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover opacity-60 scale-125" alt="" />
          </Skeleton>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <Skeleton isLoading={isLoading} className="w-full h-64">
            <h1 className="text-[12vw] font-black uppercase italic tracking-tighter leading-[0.8]">No <br/> <span style={{ color: cs.primary }}>Limits</span></h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 h-16 mt-8">
            <p className="text-white/60 text-xl max-w-lg">{websiteData.tagline}</p>
          </Skeleton>
          <div className="mt-12 flex gap-4">
            <Skeleton isLoading={isLoading} className="w-40 h-14">
              <button style={{ backgroundColor: cs.primary }} className="px-8 py-4 font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">Training Buchen</button>
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
            {[{ num: "500+", label: "Mitglieder" }, { num: "50+", label: "Trainer" }, { num: "24/7", label: "Geöffnet" }, { num: "100%", label: "Motivation" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-5xl font-black italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-white/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic text-center mb-4">Unsere <span style={{ color: cs.primary }}>Trainings</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "Personal Training", description: "Individuelles 1:1 Training mit zertifizierten Profis." }, { title: "Gruppenkurse", description: "High-energy Kurse von Yoga bis HIIT." }, { title: "Krafttraining", description: "Modernste Geräte für maximale Ergebnisse." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6 bg-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-square">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Unsere Mission</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight">Grenzen <span style={{ color: cs.primary }}>überwinden</span></h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-white/60 leading-relaxed">Wir helfen Ihnen, Ihre fitness Ziele zu erreichen. Egal wo Sie starten – wir bringen Sie weiter.</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-black text-xl uppercase italic">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-white/50 text-sm max-w-sm">Dein Weg zu mehr Fitness und Wohlbefinden.</p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-white/40">Kontakt</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-center gap-2"><MapPin size={14} /> Sportweg 88</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 11223344</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-white/40">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex justify-between"><span>24/7</span><span>Geöffnet</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/30 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
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
  return (
    <div className="bg-[#FAF9F6] text-neutral-900">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-serif italic text-xl">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest rounded-full">Reservieren</button>
        </Skeleton>
      </nav>

      <section className="pt-40 pb-20 text-center px-6">
        <Skeleton isLoading={isLoading} className="mx-auto w-3/4 h-40">
          <h1 className="font-serif text-[8vw] leading-none mb-10 italic">Fresh <span style={{ color: cs.primary }}>Daily.</span></h1>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-2/3 h-16 mx-auto mb-10">
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">{websiteData.tagline}</p>
        </Skeleton>
        <div className="max-w-4xl mx-auto relative group px-6">
          <Skeleton isLoading={isLoading} className="rounded-[4rem] aspect-video">
            <img src={heroImageUrl} className="rounded-[4rem] shadow-2xl transition-all w-full h-full object-cover" alt="" />
          </Skeleton>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full flex items-center justify-center animate-spin-slow text-white font-bold text-[10px] tracking-widest px-4 text-center" style={{ backgroundColor: cs.primary }}>NATURAL • ORGANIC • FRESH •</div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ num: "100%", label: "Bio" }, { num: "Local", label: "Sourcing" }, { num: "Daily", label: "Fresh" }, { num: "Zero", label: "Waste" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-6xl italic text-center mb-4">Unser <span style={{ color: cs.primary }}>Angebot</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "Frühstück", description: "Regional und saisonal – jeden Morgen frisch für Sie zubereitet." }, { title: "Kaffee", description: "Spezialitätenkaffee aus nachhaltigem Anbau, fair gehandelt." }, { title: "Catering", description: "Für Ihre Events – frisch, lecker und nachhaltig." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-3xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Unsere Philosophie</span>
              <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">Echt. <span style={{ color: cs.primary }}>Frisch.</span> Lecker.</h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">Wir glauben an ehrliche Küche mit Zutaten, die man schmeckt. Alles frisch, nichts vorgekocht.</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-serif italic text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">Frisch zubereitet, täglich neu. Genießen Sie den Unterschied.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-center gap-2"><MapPin size={14} /> Frischestraße 12</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 99887766</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-neutral-500">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex justify-between"><span>Mo-Sa</span><span>08:00-20:00</span></li>
                <li className="flex justify-between"><span>So</span><span>09:00-18:00</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-500 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
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
  return (
    <div className="bg-black text-white selection:bg-yellow-500">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/10">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span className="font-serif italic text-xl tracking-wider">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-black font-bold uppercase text-xs tracking-widest">VIP Termin</button>
        </Skeleton>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20">
        <div className="absolute inset-0 opacity-40">
          <Skeleton isLoading={isLoading} className="w-full h-full">
            <img src={heroImageUrl} className="w-full h-full object-cover scale-105" alt="" />
          </Skeleton>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <Gem className="mx-auto mb-10" size={50} style={{ color: cs.primary }} />
          <Skeleton isLoading={isLoading} className="w-full h-32">
            <h1 className="font-serif italic text-[8vw] leading-none tracking-tight">Elegance <br/> Defined</h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-2/3 h-16 mx-auto mt-8">
            <p className="text-white/60 text-xl max-w-lg mx-auto">{websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-14 mx-auto mt-12">
            <button style={{ backgroundColor: cs.primary }} className="px-10 py-4 text-black font-black uppercase text-xs tracking-widest">Discover Excellence</button>
          </Skeleton>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ num: "40+", label: "Jahre" }, { num: "Premium", label: "Service" }, { num: "5★", label: "Rating" }, { num: "Exklusiv", label: "Collection" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-white/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-6xl italic text-center">Exklusive <span style={{ color: cs.primary }}>Services</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "VIP Beratung", description: "Persönliche Beratung in exklusivem Ambiente." }, { title: "Concierge", description: "Rundum-sorglos Service für anspruchsvolle Kunden." }, { title: "Premium Care", description: "Langfristige Begleitung und exklusive Vorteile." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6 bg-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3]">
            <img src={heroImageUrl} className="w-full h-full object-cover" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Heritage</span>
              <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">Exzellenz seit <span style={{ color: cs.primary }}>Generationen</span></h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-white/60 leading-relaxed">Seit vier Jahrzehnten stehen wir für unübertroffene Qualität und erstklassigen Service.</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-serif italic text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-white/50 text-sm max-w-sm">Exklusiv. Eleganz. Exzellenz.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/40">Kontakt</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-center gap-2"><MapPin size={14} /> Luxury Blvd 1</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 111222333</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/40">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex justify-between"><span>Mo-Sa</span><span>10:00-19:00</span></li>
                <li className="flex justify-between"><span>So</span><span>Nach Vereinbarung</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/30 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
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
  return (
    <div className="bg-white text-slate-900">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-bold text-xl tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <div className="flex gap-4">
          <Skeleton isLoading={isLoading} className="w-24 h-10">
            <button className="px-4 py-2 text-sm font-medium">Projekte</button>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-32 h-10">
            <button style={{ backgroundColor: cs.primary }} className="px-4 py-2 text-white text-sm font-medium rounded-lg">Kontakt</button>
          </Skeleton>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-40 grid lg:grid-cols-12 gap-16 items-center pt-32">
        <div className="lg:col-span-7">
          <Skeleton isLoading={isLoading} className="w-full h-64">
            <h1 className="text-[7vw] font-black tracking-tighter leading-[0.9] mb-12">Digital <br/> <span style={{ color: cs.primary }}>Innovation.</span></h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-8">
            <p className="text-slate-500 text-xl max-w-md">{websiteData.tagline}</p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-14">
            <div className="flex gap-4">
              <button style={{ backgroundColor: cs.primary }} className="px-8 py-4 text-white font-bold rounded-xl shadow-xl">Get Started</button>
              <button className="px-8 py-4 border border-slate-200 rounded-xl font-bold">Process</button>
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
            {[{ num: "200+", label: "Projekte" }, { num: "50+", label: "Kunden" }, { num: "15+", label: "Awards" }, { num: "99%", label: "Zufriedenheit" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-black" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4">Unsere <span style={{ color: cs.primary }}>Leistungen</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "Web Development", description: "Moderne Webanwendungen mit React, Node.js und mehr." }, { title: "UI/UX Design", description: "Benutzerfreundliche Designs, die begeistern." }, { title: "Consulting", description: "Strategische Beratung für digitale Transformation." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Über uns</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Innovation trifft <span style={{ color: cs.primary }}>Erfahrung</span></h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-slate-500 leading-relaxed">Wir kombinieren technisches Know-how mit kreativen Lösungen. Ihr Erfolg ist unser Antrieb.</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-bold text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-slate-400 text-sm max-w-sm">Digitalagentur für moderne Lösungen.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><MapPin size={14} /> Techstraße 42</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 444555666</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex justify-between"><span>Mo-Fr</span><span>09:00-18:00</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
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
  return (
    <div className="bg-[#FCF9F5] text-neutral-800 font-sans">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-neutral-200/50">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-serif italic text-xl">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest rounded-full">Beratung</button>
        </Skeleton>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-24 items-center pt-40">
        <Skeleton isLoading={isLoading} className="w-full h-80">
          <h1 className="font-serif text-[7vw] leading-[0.85] font-light mb-10">Pure <br/> <span style={{ color: cs.primary }} className="italic">Serenity.</span></h1>
          <p className="text-xl text-neutral-500 font-light italic leading-relaxed max-w-md">"Harmonizing body and soul through nature's finest elements."</p>
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
            {[{ num: "100%", label: "Natürlich" }, { num: "Bio", label: "Zertifiziert" }, { num: "Zero", label: "Waste" }, { num: "Local", label: "Sourced" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-6xl italic text-center">Natürliche <span style={{ color: cs.primary }}>Leistungen</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "Wellness", description: "Ganzheitliche Behandlungen für Körper und Geist." }, { title: "Naturkosmetik", description: "Reine Inhaltsstoffe aus kontrolliert biologischem Anbau." }, { title: "Beratung", description: "Individuelle Beratung für Ihren natürlichen Lebensstil." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-3xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-3xl" alt="" />
          </Skeleton>
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Philosophie</span>
              <h2 className="font-serif text-4xl md:text-5xl italic leading-tight">Zurück zur <span style={{ color: cs.primary }}>Natur</span></h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">Wir glauben an die Kraft der Natur. Alle unsere Produkte sind rein, nachhaltig und ethisch produziert.</p>
            </Skeleton>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-serif italic text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">Natürlich. Nachhaltig. Bewusst.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-center gap-2"><MapPin size={14} /> Naturweg 77</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 777888999</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-neutral-500">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex justify-between"><span>Mo-Sa</span><span>09:00-19:00</span></li>
                <li className="flex justify-between"><span>So</span><span>Geschlossen</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-500 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
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
  return (
    <div className="bg-white min-h-screen font-sans">
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <Skeleton isLoading={isLoading} className="w-40 h-8">
          <span className="font-bold text-xl tracking-tight">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-32 h-10">
          <button style={{ backgroundColor: cs.primary }} className="px-6 py-2.5 text-white font-bold uppercase text-xs tracking-widest">Kontakt</button>
        </Skeleton>
      </nav>

      <section className="grid lg:grid-cols-12 min-h-screen pt-20">
        <div className="lg:col-span-5 bg-neutral-900 text-white p-12 lg:p-24 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '50px 50px' }} />
          <Skeleton isLoading={isLoading} className="w-full h-64 relative z-10">
            <h1 className="text-[6vw] font-bold leading-[0.9] tracking-tighter">Strategic <br/> <span style={{ color: cs.primary }} className="italic font-serif">Impact.</span></h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mt-8 relative z-10">
            <p className="text-white/60 text-lg max-w-md">{websiteData.tagline}</p>
          </Skeleton>
        </div>
        <div className="lg:col-span-7 p-12 lg:p-24 flex items-center relative bg-white">
          <div className="absolute top-0 right-0 p-12 text-[15vw] font-black text-neutral-50 uppercase italic select-none leading-none">Executive</div>
          <Skeleton isLoading={isLoading} className="rounded-[4rem] aspect-video w-full shadow-2xl relative z-10">
            <img src={heroImageUrl} className="rounded-[4rem] w-full h-full object-cover" alt="" />
          </Skeleton>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ num: "25+", label: "Jahre" }, { num: "Fortune", label: "500" }, { num: "Global", label: "Presence" }, { num: "Boutique", label: "Service" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-black" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-center">Executive <span style={{ color: cs.primary }}>Services</span></h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6">
            {(websiteData.topServices || [{ title: "Strategie", description: "Maßgeschneiderte Unternehmensstrategien für nachhaltiges Wachstum." }, { title: "Consulting", description: "Expertise aus jahrelanger Erfahrung mit Top-Unternehmen." }, { title: "Implementation", description: "Praxisnahe Umsetzung mit messbaren Ergebnissen." }]).map((service: any, i: number) => (
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

      <section className="py-20 md:py-32 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <span className="text-xs font-black uppercase tracking-widest mb-4 block" style={{ color: cs.primary }}>Expertise</span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">Results <span style={{ color: cs.primary }}>Delivered</span></h2>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full h-24">
              <p className="text-neutral-600 leading-relaxed">Wir kombinieren strategisches Denken mit operativer Exzellenz. Ihr Erfolg ist unser Maßstab.</p>
            </Skeleton>
          </div>
          <Skeleton isLoading={isLoading} className="aspect-[4/3] rounded-2xl">
            <img src={heroImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          </Skeleton>
        </div>
      </section>

      <footer className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-4">
                <span className="font-bold text-xl">{websiteData.businessName}</span>
              </Skeleton>
              <p className="text-neutral-400 text-sm max-w-sm">Executive Excellence. Strategischer Impact.</p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-500">Kontakt</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-center gap-2"><MapPin size={14} /> Executive Plaza 1</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +49 30 123987456</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-500">Öffnungszeiten</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex justify-between"><span>Mo-Fr</span><span>08:00-18:00</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-500 text-xs">
            © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
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
