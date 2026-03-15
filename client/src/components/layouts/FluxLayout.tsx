/**
 * FLUX Layout – Dark Mode Premium with Cinematic Effects
 * Inspired by: Netflix, Spotify, Epic Games Store
 * For: Restaurants (Evening), Bars, Event Locations, DJs, Artists
 * 
 * Key Features:
 * - Deep dark background (oklch(0.08 0.02 270)) with subtle gradient
 * - Cinematic images: Full-width hero with overlay gradient
 * - Text with text-shadow glow for readability
 * - Accent light beams (simulated through gradient overlays)
 * - Smooth section transitions with fade-blur
 * - Gold/Copper accents on dark gray
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { MapPin, Clock, Phone, Instagram, Calendar, Music, Wine, Utensils } from 'lucide-react';
import type { WebsiteData, ColorScheme } from '@shared/types';

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Cinematic Container
const CinematicCard = ({ 
  children, 
  className = '', 
  delay = 0,
  glowColor = '#FFD700'
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  glowColor?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        boxShadow: `0 0 40px ${glowColor}20`,
        transition: { duration: 0.3 }
      }}
      className={`flux-card rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Ken Burns Effect Image
const KenBurnsImage = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ scale: 1 }}
        whileInView={{ scale: 1.1 }}
        viewport={{ once: true }}
        transition={{ duration: 20, ease: 'linear' }}
      />
    </div>
  );
};

// Glowing Text
const GlowingText = ({ children, className = '', color = '#FFD700' }: { children: React.ReactNode; className?: string; color?: string }) => {
  return (
    <span 
      className={`${className}`}
      style={{ 
        textShadow: `0 0 40px ${color}40`,
      }}
    >
      {children}
    </span>
  );
};

// Skeleton Loading
const Skeleton = ({ isLoading, children, className = '' }: { isLoading: boolean; children: React.ReactNode; className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-800 animate-pulse rounded-2xl ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function FluxLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const smoothScale = useSpring(heroScale, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cinematic colors
  const gold = cs.accent || '#D4AF37';
  const copper = '#B87333';
  const deepBg = '#0a0a0a';
  const surfaceBg = '#141414';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Fixed Background Gradient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${gold}10 0%, transparent 50%)`,
          }}
        />
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {/* Navigation - Transparent to Solid */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight">
            {websiteData?.businessName}
          </span>
          <div className="flex items-center gap-6">
            <a href="#menu" className="text-sm text-white/60 hover:text-white transition-colors hidden md:block">Menü</a>
            <a href="#events" className="text-sm text-white/60 hover:text-white transition-colors hidden md:block">Events</a>
            <a href="#contact" className="text-sm text-white/60 hover:text-white transition-colors hidden md:block">Kontakt</a>
            <button 
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ 
                backgroundColor: gold,
                color: '#0a0a0a',
                boxShadow: `0 0 20px ${gold}40`,
              }}
            >
              Reservieren
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Cinematic Full Width */}
      <section ref={heroRef} className="relative h-screen">
        {/* Background Image with Ken Burns */}
        <motion.div 
          style={{ opacity: heroOpacity, scale: smoothScale }}
          className="absolute inset-0"
        >
          <Skeleton isLoading={isLoading} className="absolute inset-0">
            <img
              src={heroImageUrl}
                alt={websiteData?.businessName}
              className="w-full h-full object-cover"
            />
          </Skeleton>
          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/80" />
        </motion.div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end pb-32 md:pb-40">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Skeleton isLoading={isLoading} className="w-32 h-8 mb-6">
                <span 
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                  style={{ 
                    backgroundColor: `${gold}20`,
                    border: `1px solid ${gold}40`,
                    color: gold 
                  }}
                >
                  {websiteData?.businessCategory || 'Restaurant & Bar'}
                </span>
              </Skeleton>

              <Skeleton isLoading={isLoading} className="w-full max-w-3xl h-32 mb-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6">
                  <GlowingText color={gold}>
                    {websiteData?.tagline || websiteData?.businessName || 'Ein Abend zum Genießen'}
                  </GlowingText>
                </h1>
              </Skeleton>

              <Skeleton isLoading={isLoading} className="w-full max-w-xl h-16">
                <p className="text-lg md:text-xl text-white/60 max-w-xl mb-8">
                  {websiteData?.description || 'Erleben Sie exzellente Küche, erstklassige Getränke und einzigartige Atmosphäre.'}
                </p>
              </Skeleton>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-4 rounded-full font-semibold text-[#0a0a0a] transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: gold,
                    boxShadow: `0 0 30px ${gold}50`,
                  }}
                >
                  Tisch reservieren
                </button>
                <button className="px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all">
                  Menü ansehen
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Info Bar */}
      <section className="border-y border-white/10 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: MapPin, label: 'Adresse', value: 'Musterstraße 123, Berlin' },
              { icon: Clock, label: 'Öffnungszeiten', value: 'Di-So: 18:00 - 02:00' },
              { icon: Phone, label: 'Reservierung', value: '+49 30 123 456 78' },
              { icon: Instagram, label: 'Social', value: '@flux_berlin' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${gold}15` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: gold }} />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section id="menu" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GlowingText color={gold}>Kulinarische Highlights</GlowingText>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Unsere Küche vereint traditionelle Aromen mit moderner Interpretation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Utensils, 
                title: 'Hauptgang', 
                items: ['Wagyu Beef', 'Trüffelrisotto', 'Lammkrone'],
                color: gold 
              },
              { 
                icon: Wine, 
                title: 'Getränke', 
                items: ['Signature Cocktails', 'Weinauswahl', 'Craft Beer'],
                color: copper 
              },
              { 
                icon: Music, 
                title: 'Ambiente', 
                items: ['Live DJ', 'Jazz Abende', 'Private Events'],
                color: gold 
              },
            ].map((category, i) => (
              <CinematicCard key={i} delay={i * 0.1} glowColor={category.color}>
                <div 
                  className="p-8 h-full"
                  style={{ backgroundColor: surfaceBg }}
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <category.icon className="w-7 h-7" style={{ color: category.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{category.title}</h3>
                  <ul className="space-y-3">
                    {category.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-white/70">
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CinematicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section with Ken Burns */}
      <section id="events" className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ backgroundColor: `${copper}20`, color: copper }}
              >
                Events
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <GlowingText color={copper}>Besondere Abende</GlowingText>
              </h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Von exklusiven Weinproben über Live-Konzerte bis hin zu privaten Feiern – 
                wir schaffen unvergessliche Momente.
              </p>
              
              <div className="space-y-4">
                {[
                  { day: 'Fr', date: '24', event: 'Jazz Night', time: '20:00' },
                  { day: 'Sa', date: '25', event: 'DJ Session', time: '22:00' },
                  { day: 'So', date: '26', event: 'Sunday Brunch', time: '11:00' },
                ].map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                    style={{ backgroundColor: surfaceBg }}
                  >
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-white/40">{event.day}</p>
                      <p className="text-2xl font-bold">{event.date}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold group-hover:text-white transition-colors">{event.event}</p>
                      <p className="text-sm text-white/40">{event.time} Uhr</p>
                    </div>
                    <Calendar className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <KenBurnsImage 
                src={heroImageUrl}
                alt="Event atmosphere"
                className="absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${gold}20 0%, transparent 60%)`,
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <GlowingText color={gold}>Reservieren Sie Ihren Tisch</GlowingText>
          </h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Erleben Sie einen unvergesslichen Abend. Wir empfehlen eine Reservierung, 
            besonders für Wochenenden.
          </p>
          <button 
            className="px-10 py-4 rounded-full font-semibold text-[#0a0a0a] text-lg transition-all hover:scale-105"
            style={{ 
              backgroundColor: gold,
              boxShadow: `0 0 40px ${gold}50`,
            }}
          >
            Jetzt reservieren
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-lg mb-4">{websiteData?.businessName}</h3>
              <p className="text-sm text-white/40">
                Einzigartige Momente, unvergessliche Erlebnisse.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <p className="text-sm text-white/40">
                Musterstraße 123<br/>
                10115 Berlin<br/>
                +49 30 123 456 78
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Öffnungszeiten</h4>
              <p className="text-sm text-white/40">
                Di-Do: 18:00 - 00:00<br/>
                Fr-Sa: 18:00 - 02:00<br/>
                So: 18:00 - 23:00
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Folgen Sie uns</h4>
              <div className="flex gap-4">
                {['Instagram', 'Facebook'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">
              © {new Date().getFullYear()} {websiteData?.businessName}. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-white/30 hover:text-white transition-colors">Impressum</a>
              <a href="#" className="text-sm text-white/30 hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Flux-specific CSS */}
      <style>{`
        /* Cinematic card styling */
        .flux-card {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s ease;
        }
        
        .flux-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
        }
        
        /* Text glow effect */
        .flux-glow {
          text-shadow: 0 0 40px currentColor;
        }
        
        /* Ken Burns animation */
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, -2%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        
        /* Cinematic grain overlay */
        .flux-grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .flux-card {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
