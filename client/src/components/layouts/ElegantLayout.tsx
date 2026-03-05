/**
 * ELEGANT Layout V2 – Beauty & Lifestyle
 * Typography: Cormorant Garamond (serif headlines) + Jost (body)
 * Feel: Luxurious, airy, feminine, editorial
 * Structure: Split hero, arch imagery, generous whitespace, gold accents
 */
import { Star, Sparkles, Heart, Clock, MapPin, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
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

export default function ElegantLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const headline = websiteData.sections?.[0]?.headline || "Ihr Weg zu mehr Schönheit";
  const subheadline = websiteData.sections?.[0]?.subheadline || "Erleben Sie erstklassige Behandlungen in luxuriösem Ambiente.";

  return (
    <div className="bg-[#FFFDFB] text-neutral-900 font-jost grain-overlay">
      {/* Header */}
      <header className="py-6 md:py-10 text-center px-4 relative z-10">
        <Skeleton isLoading={isLoading} className="w-48 h-4 mx-auto mb-4">
          <h2 className="uppercase tracking-[0.4em] text-[10px] font-bold opacity-40 mb-4">
            Est. 2026 — Pure Luxury
          </h2>
        </Skeleton>
        <Skeleton isLoading={isLoading} className="w-64 h-10 mx-auto">
          <span className="font-serif italic text-2xl md:text-5xl">{websiteData.businessName}</span>
        </Skeleton>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-12 gap-12 md:gap-20 items-center min-h-[90vh] pb-12 md:pb-24 pt-12 relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-neutral-50/50 -z-10 skew-x-12 translate-x-1/2" />
        
        <div className="relative order-2 lg:order-1 lg:col-span-5">
          <Skeleton isLoading={isLoading} className="w-full aspect-[4/5] rounded-t-full">
            <div 
              className="overflow-hidden aspect-[4/5] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-t-full relative"
              style={{ borderRadius: '60% 60% 0 0 / 40% 40% 0 0' }}
            >
              <img 
                src={heroImageUrl} 
                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[3s] grayscale-[0.3] hover:grayscale-0" 
                alt=""
              />
              <div className="absolute inset-0 bg-neutral-200/10 mix-blend-overlay" />
            </div>
          </Skeleton>
          
          {/* Overlapping Badge */}
          <div className="absolute -bottom-10 -right-6 md:-right-12 bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-2xl shadow-2xl border border-neutral-100 relative z-20 max-w-[240px]">
            <div className="flex gap-1.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" className="text-yellow-500" />
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-800 mb-2 leading-tight">Voted #1 Beauty Experience</p>
            <p className="text-[9px] uppercase tracking-widest text-neutral-400">Berlin 2026 Edition</p>
          </div>
        </div>

        <motion.div 
          className="order-1 lg:order-2 lg:col-span-7 lg:pl-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Skeleton isLoading={isLoading} className="w-full h-32 md:h-64 mb-8">
            <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl leading-[0.8] italic font-light mb-10 md:mb-16 tracking-tighter">
              {headline.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 0 ? "block text-right" : "block text-left opacity-60"}>
                  {word}
                </span>
              ))}
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-full h-24 mb-10">
            <p className="text-lg md:text-2xl text-neutral-500 font-light leading-relaxed mb-12 max-w-lg italic border-l-2 border-neutral-200 pl-8">
              {subheadline}
            </p>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-48 h-16">
            <button 
              style={{ backgroundColor: cs.primary }} 
              className="px-10 md:px-16 py-5 md:py-6 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-transform shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)]"
            >
              Reserve Experience
            </button>
          </Skeleton>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "15+", label: "Jahre Expertise" },
              { num: "50k+", label: "Zufriedene Kunden" },
              { num: "4.9", label: "Sterne Bewertung" },
              { num: "100%", label: "Premium-Produkte" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 md:p-6">
                <p className="text-3xl md:text-4xl font-serif italic" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Unser Angebot</span>
              <h2 className="font-serif text-4xl md:text-6xl italic font-light">Unsere Leistungen</h2>
            </div>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {websiteData.topServices?.map((service, i) => (
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
            )) || [
              { title: "Gesichtsbehandlung", description: "Luxuriöse Pflege für strahlende Haut mit Premium-Produkten und sanften Massagetechniken." },
              { title: "Wellness-Massage", description: "Entspannende Ganzkörpermassage zur Stressreduktion und tiefer Entspannung." },
              { title: "Beauty-Behandlung", description: "Professionelle Make-up- und Styling-Services für besondere Anlässe und Alltag." }
            ].map((service, i) => (
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

      {/* About Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <Skeleton isLoading={isLoading} className="w-32 h-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Über uns</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-24 md:h-32 mb-6">
                <h2 className="font-serif text-4xl md:text-5xl italic font-light mb-6">
                  Wo Schönheit auf Wohlbefinden trifft
                </h2>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-8">
                <p className="text-neutral-500 font-light leading-relaxed text-base md:text-lg mb-6">
                  Seit über 15 Jahren kreieren wir einzigartige Erlebnisse, die Körper und Seele verwöhnen. Unser erfahrenes Team aus Beauty-Experten steht für höchste Qualität und individuelle Beratung.
                </p>
                <p className="text-neutral-500 font-light leading-relaxed text-base md:text-lg">
                  Wir nutzen ausschließlich Premium-Produkte und modernste Techniken, um Ihnen das beste Ergebnis zu garantieren.
                </p>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button 
                  style={{ backgroundColor: cs.primary }}
                  className="px-8 py-4 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg"
                >
                  Mehr erfahren
                </button>
              </Skeleton>
            </div>
            <Skeleton isLoading={isLoading} className="w-full aspect-[3/4] rounded-t-full order-1 lg:order-2">
              <div 
                className="overflow-hidden aspect-[3/4] shadow-2xl rounded-t-full"
                style={{ borderRadius: '50% 50% 0 0 / 30% 30% 0 0' }}
              >
                <img 
                  src={heroImageUrl} 
                  className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
                  alt=""
                />
              </div>
            </Skeleton>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton isLoading={isLoading} className="w-80 h-16 mx-auto mb-16">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-4">Kundenstimmen</span>
              <h2 className="font-serif text-4xl md:text-6xl italic font-light">Was unsere Kunden sagen</h2>
            </div>
          </Skeleton>
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {[
              { name: "Laura Schmidt", text: "Die beste Behandlung, die ich je hatte! Das Team ist unglaublich aufmerksam und professionell. Ich komme definitiv wieder!", rating: 5 },
              { name: "Sophie Weber", text: "Ein wahres Paradies der Entspannung. Die Atmosphäre ist wunderschön und die Ergebnisse überzeugen jedes Mal.", rating: 5 },
              { name: "Maria Klein", text: "Hervorragender Service und erstklassige Produkte. Endlich ein Studio, das meine Erwartungen übertrifft.", rating: 5 }
            ].map((testimonial, i) => (
              <Skeleton key={i} isLoading={isLoading} className="h-72">
                <div className="p-6 md:p-8 border border-neutral-200 bg-white hover:shadow-lg transition-all duration-500">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} size={14} fill="currentColor" className="text-yellow-500" />
                    ))}
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

      {/* Footer */}
      <footer className="py-16 md:py-24 px-4 md:px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-2">
              <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
                <span className="font-serif italic text-2xl md:text-3xl">{websiteData.businessName}</span>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-full h-16 max-w-sm">
                <p className="text-white/50 font-light leading-relaxed max-w-sm">
                  Ihr Premium-Studio für Beauty und Wellness. Wir verwöhnen Sie mit exklusiven Behandlungen in luxuriösem Ambiente.
                </p>
              </Skeleton>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-6 text-white/40">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/60 text-sm font-light">
                  <MapPin size={16} style={{ color: cs.primary }} />
                  Schönheitsallee 42, 10115 Berlin
                </li>
                <li className="flex items-center gap-3 text-white/60 text-sm font-light">
                  <Phone size={16} style={{ color: cs.primary }} />
                  +49 30 12345678
                </li>
                <li className="flex items-center gap-3 text-white/60 text-sm font-light">
                  <Mail size={16} style={{ color: cs.primary }} />
                  hello@example.com
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-6 text-white/40">Öffnungszeiten</h3>
              <ul className="space-y-3 text-white/60 text-sm font-light">
                <li className="flex justify-between">
                  <span>Mo - Fr</span>
                  <span>09:00 - 20:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Samstag</span>
                  <span>10:00 - 18:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sonntag</span>
                  <span>Geschlossen</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-light">
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
