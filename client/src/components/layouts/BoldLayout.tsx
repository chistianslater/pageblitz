/**
 * BOLD Layout V2 – Handwerk & Industrie
 * Typography: Space Grotesque (headlines) + Plus Jakarta Sans (body)
 * Feel: Strong, industrial, trustworthy, masculine
 * Structure: Full-bleed dark hero, large typography, industrial accents
 */
import { Star, ChevronRight, Play, Shield, Zap, Flower, Award, Clock, MapPin, Phone, Mail } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Skeleton Loading Component
const Skeleton = ({ isLoading, children, className = "" }: { isLoading: boolean, children: React.ReactNode, className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-md ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function BoldLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  return (
    <div className="bg-neutral-950 text-white selection:bg-orange-500 font-jakarta grain-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10 relative">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-black text-xl md:text-2xl uppercase tracking-tighter italic">{websiteData.businessName}</span>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-28 h-10">
          <button 
            style={{ backgroundColor: cs.primary }} 
            className="px-4 md:px-8 py-2.5 md:py-3 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform"
          >
            Projekt starten
          </button>
        </Skeleton>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[110vh] flex items-center overflow-hidden pt-20">
        <div className="absolute top-0 right-0 w-full lg:w-2/3 h-full relative group">
          <Skeleton isLoading={isLoading} className="absolute right-0 w-full h-full">
            <div 
              className="absolute right-0 w-full h-full opacity-60 grayscale group-hover:grayscale-0 transition-all duration-[2s]" 
              style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
            >
              <img src={heroImageUrl} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-neutral-950/80" />
            </div>
          </Skeleton>
          
          {/* Overlapping Industrial Accent */}
          <div className="absolute top-1/4 -left-12 w-24 h-96 bg-white/5 backdrop-blur-3xl border-l border-white/10 hidden lg:block skew-x-12 relative z-20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-30 w-full">
          <div className="max-w-4xl relative">
            {/* Absolute Text Overlay */}
            <div className="absolute -top-12 -left-6 text-xs font-black uppercase tracking-[1em] text-white/20 select-none">
              Engineering Excellence
            </div>
            
            <Skeleton isLoading={isLoading} className="w-full h-40 md:h-64">
              <h1 className="text-[14vw] md:text-[12vw] font-black leading-[0.75] uppercase tracking-tighter drop-shadow-2xl">
                Precision <br/> 
                <span className="italic outline-text" style={{ color: cs.primary }}>Beyond</span> <br/> 
                Limits
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-3/4 h-16 mt-4">
              <p className="mt-6 md:mt-10 max-w-md text-white/50 text-base md:text-lg">
                {websiteData.tagline}
              </p>
            </Skeleton>
            <div className="mt-8 md:mt-12 flex flex-wrap gap-4">
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button 
                  style={{ backgroundColor: cs.primary }}
                  className="px-6 md:px-10 py-4 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform"
                >
                  Projekt anfragen
                </button>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button className="px-6 md:px-10 py-4 border border-white/30 font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-colors">
                  Mehr erfahren
                </button>
              </Skeleton>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-10 text-[10vw] md:text-[15vw] font-black opacity-[0.02] select-none pointer-events-none">
          HARDCORE
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { num: "25+", label: "Jahre Erfahrung" },
              { num: "100%", label: "Qualität" },
              { num: "500+", label: "Projekte" },
              { num: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-black" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs md:text-sm uppercase tracking-widest text-white/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-64 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-16">
              Unsere <span style={{ color: cs.primary }}>Leistungen</span>
            </h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {websiteData.topServices?.map((service, i) => (
              <Skeleton key={i} isLoading={isLoading} className="h-64">
                <div className="p-6 md:p-8 border border-white/10 hover:border-white/30 transition-colors group">
                  <div className="w-12 h-12 mb-6 flex items-center justify-center" style={{ backgroundColor: cs.primary }}>
                    <Zap size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-4">{service.title}</h3>
                  <p className="text-white/50 text-sm md:text-base leading-relaxed">{service.description}</p>
                </div>
              </Skeleton>
            )) || [
              { title: "Industriemontage", description: "Professionelle Montage von Maschinen und Anlagen mit höchster Präzision." },
              { title: "Schweißtechnik", description: "Zertifizierte Schweißarbeiten für alle Materialien und Anforderungen." },
              { title: "Instandhaltung", description: "Wartung und Reparatur für maximale Betriebssicherheit und Langlebigkeit." }
            ].map((service, i) => (
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

      {/* About Section */}
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
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">
                  Präzision seit <span style={{ color: cs.primary }}>25 Jahren</span>
                </h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
                <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8">
                  Wir sind Ihr Partner für anspruchsvolle Industrieprojekte. Mit einem Team aus erfahrenen Fachkräften und modernster Technologie realisieren wir Ihre Vorhaben termingerecht und budgetkonform. Qualität steht bei uns an erster Stelle.
                </p>
              </Skeleton>
              <div className="flex flex-wrap gap-4">
                <Skeleton isLoading={isLoading} className="w-32 h-10">
                  <button 
                    style={{ backgroundColor: cs.primary }}
                    className="px-6 py-3 font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform"
                  >
                    Mehr erfahren
                  </button>
                </Skeleton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-72 h-12 mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-16">
              Kunden <span style={{ color: cs.primary }}>Stimmen</span>
            </h2>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Michael Weber", company: "Weber Industries", text: "Exzellente Arbeit! Termingerecht, präzise und professionell. Unsere neue Produktionsanlage läuft einwandfrei." },
              { name: "Sarah Müller", company: "Müller Bau AG", text: "Das Team hat unsere Erwartungen bei Großprojekten übertroffen. Absolute Empfehlung für Industriemontage." },
              { name: "Thomas Schmidt", company: "Schmidt GmbH", text: "Zuverlässiger Partner für komplexe Schweißarbeiten. Qualität und Sicherheit stehen bei ihnen an erster Stelle." }
            ].map((testimonial, i) => (
              <Skeleton key={i} isLoading={isLoading} className="h-72">
                <div className="p-6 md:p-8 border border-white/10 hover:border-white/30 transition-colors">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} fill="currentColor" className="text-yellow-500" />
                    ))}
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

      {/* Footer */}
      <footer className="py-16 md:py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <span className="font-black text-2xl uppercase tracking-tighter italic">{websiteData.businessName}</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-20 max-w-sm">
                <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-sm">
                  Ihr zuverlässiger Partner für industrielle Spitzenleistungen. Präzision, Qualität und Innovation seit 1999.
                </p>
              </Skeleton>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/40">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin size={16} style={{ color: cs.primary }} />
                  Industriestraße 123, 12345 Berlin
                </li>
                <li className="flex items-center gap-3 text-white/60 text-sm">
                  <Phone size={16} style={{ color: cs.primary }} />
                  +49 30 123456789
                </li>
                <li className="flex items-center gap-3 text-white/60 text-sm">
                  <Mail size={16} style={{ color: cs.primary }} />
                  info@example.com
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/40">Öffnungszeiten</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                <li className="flex justify-between">
                  <span>Mo - Fr</span>
                  <span>08:00 - 18:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sa</span>
                  <span>Nach Vereinbarung</span>
                </li>
                <li className="flex justify-between">
                  <span>So</span>
                  <span>Geschlossen</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-widest">
              © 2026 {websiteData.businessName}. Alle Rechte vorbehalten.
            </p>
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
