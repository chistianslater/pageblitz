/**
 * AURORA Layout – Glassmorphism with Animated Mesh Gradient
 * Inspired by: Apple Vision Pro, Microsoft Fluent Design
 * For: Tech Startups, Creative Agencies, SaaS Products
 * 
 * Key Features:
 * - Semi-transparent glass cards with backdrop-filter blur
 * - Animated mesh gradient background (3 overlapping color blobs)
 * - Floating glass navigation appearing on scroll
 * - Parallax motion elements on mouse movement
 * - Inter font for body, Space Grotesk for headlines
 * - Dynamic Violet/Cyan accent colors
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Globe, Shield, ChevronDown } from 'lucide-react';
import type { WebsiteData, ColorScheme } from '@shared/types';

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Glass Card Component with tilt effect
const GlassCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotation({
      x: (y - 0.5) * 10, // -5 to 5 degrees
      y: (x - 0.5) * -10, // -5 to 5 degrees
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      className={`aurora-glass rounded-3xl p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Animated Mesh Gradient Background
const MeshGradientBackground = ({ cs }: { cs: ColorScheme }) => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[120px]"
        style={{ backgroundColor: `${cs.primary}40` }}
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px]"
        style={{ backgroundColor: `${cs.accent}30` }}
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[80px]"
        style={{ backgroundColor: `${cs.secondary || cs.primary}20` }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// Skeleton Loading Component
const Skeleton = ({ isLoading, children, className = '' }: { isLoading: boolean; children: React.ReactNode; className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-white/10 animate-pulse rounded-xl backdrop-blur-sm ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function AuroraLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryColor = cs.primary || '#6366f1';
  const accentColor = cs.accent || '#06b6d4';

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <MeshGradientBackground cs={cs} />

      {/* Floating Glass Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className={`mx-6 transition-all duration-500 ${
          isScrolled 
            ? 'aurora-glass rounded-2xl px-6 py-3' 
            : 'bg-transparent px-0 py-0'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}30` }}
              >
                <Zap className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <span className="font-semibold text-lg tracking-tight">{websiteData.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm text-white/60 hover:text-white transition-colors">Leistungen</a>
              <a href="#about" className="text-sm text-white/60 hover:text-white transition-colors">Über uns</a>
              <a href="#contact" className="text-sm text-white/60 hover:text-white transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Skeleton isLoading={isLoading} className="w-48 h-8 mb-6">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}40` }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {websiteData.businessCategory || 'Tech & Innovation'}
              </div>
            </Skeleton>

            <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                {(() => {
                  const text = websiteData.tagline || websiteData.businessName || 'Innovation Powered';
                  const words = text.split(' ');
                  const mid = Math.ceil(words.length / 2);
                  return (
                    <>
                      <span className="text-white">{words.slice(0, mid).join(' ')}</span>
                      <br />
                      <span style={{ color: primaryColor }}>{words.slice(mid).join(' ')}</span>
                    </>
                  );
                })()}
              </h1>
            </Skeleton>

            <Skeleton isLoading={isLoading} className="w-full h-20 mb-8">
              <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                {websiteData.description || 'Wir entwickeln digitale Lösungen, die Ihr Unternehmen auf das nächste Level bringen. Mit modernster Technologie und kreativem Design.'}
              </p>
            </Skeleton>

            <div className="flex flex-wrap gap-4">
              <Skeleton isLoading={isLoading} className="w-40 h-14">
                <button
                  className="group px-8 py-4 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: cs.onPrimary || '#ffffff',
                  }}
                >
                  Projekt starten
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Skeleton>
              <Skeleton isLoading={isLoading} className="w-36 h-14">
                <button
                  className="aurora-glass px-8 py-4 rounded-full font-semibold text-sm text-white hover:bg-white/10 transition-all duration-300 border border-white/10"
                >
                  Mehr erfahren
                </button>
              </Skeleton>
            </div>
          </motion.div>

          {/* Right: Glass Cards Stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[500px] hidden lg:block"
          >
            <motion.div
              style={{ y: smoothY }}
              className="relative z-10"
            >
              <GlassCard className="absolute top-0 right-0 w-80" delay={0.1}>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Globe className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Global Reach</h3>
                    <p className="text-sm text-white/50">Internationale Präsenz und lokale Expertise vereint.</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="absolute top-40 right-20 w-80" delay={0.2}>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Shield className="w-6 h-6" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Enterprise Security</h3>
                    <p className="text-sm text-white/50">Höchste Sicherheitsstandards für Ihre Daten.</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="absolute top-80 right-10 w-72" delay={0.3}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-white/60">+500 Unternehmen</span>
                </div>
                <p className="text-sm text-white/50">Vertrauen Sie auf unsere Expertise wie zahlreiche andere Unternehmen.</p>
              </GlassCard>
            </motion.div>
          </motion.div>
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
            className="aurora-glass rounded-full p-3 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ChevronDown className="w-5 h-5 text-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Unsere <span style={{ color: primaryColor }}>Leistungen</span></h2>
            <p className="text-white/50 max-w-2xl mx-auto">Maßgeschneiderte Lösungen für Ihre digitalen Herausforderungen.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: 'Innovation', desc: 'Zukunftsweisende Technologien für Ihren Erfolg.', color: primaryColor },
              { icon: Globe, title: 'Digital Strategy', desc: 'Strategische Beratung für Ihre digitale Transformation.', color: accentColor },
              { icon: Shield, title: 'Security First', desc: 'Sicherheit integriert in jede Lösung von Beginn an.', color: primaryColor },
            ].map((service, i) => (
              <GlassCard key={i} delay={i * 0.1} className="h-full">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <service.icon className="w-7 h-7" style={{ color: service.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{service.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <GlassCard className="text-center py-16 px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit für die <span style={{ color: primaryColor }}>Zukunft</span>?
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Lassen Sie uns gemeinsam Ihr nächstes Projekt verwirklichen. Kontaktieren Sie uns für ein unverbindliches Gespräch.
            </p>
            <button
              className="px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: primaryColor,
                color: cs.onPrimary || '#ffffff',
              }}
            >
              Kontakt aufnehmen
            </button>
          </GlassCard>
        </div>
      </section>

      {/* Aurora-specific CSS */}
      <style>{`
        .aurora-glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .aurora-glass {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
