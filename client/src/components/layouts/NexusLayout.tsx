/**
 * NEXUS Layout – Bento Grid with Kinetic Typography
 * Inspired by: Apple Bento Grids, Linear.app, Vercel
 * For: Portfolios, Agencies, Consulting Firms
 * 
 * Key Features:
 * - Bento-Grid Layout: Asymmetric tiles (1×1, 1×2, 2×1, 2×2)
 * - Kinetic Typography: Animated character-by-character reveal
 * - Cards with different elevation levels
 * - Mix of large feature cards and small info tiles
 * - Border-radius: 24px for large, 16px for small
 * - Inter with tight letter-spacing for headlines
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, Users, TrendingUp, Clock, Award, Globe, Sparkles } from 'lucide-react';
import type { WebsiteData, ColorScheme } from '@shared/types';

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Kinetic Text Component - Character by character animation
const KineticText = ({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const characters = text.split('');
  
  return (
    <span className={className}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: delay + i * 0.03,
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

// Bento Card Component
const BentoCard = ({ 
  children, 
  className = '', 
  colSpan = 1, 
  rowSpan = 1,
  delay = 0,
  variant = 'default'
}: { 
  children: React.ReactNode; 
  className?: string; 
  colSpan?: number;
  rowSpan?: number;
  delay?: number;
  variant?: 'default' | 'primary' | 'accent';
}) => {
  const colSpanClass = colSpan === 2 ? 'md:col-span-2' : 'col-span-1';
  const rowSpanClass = rowSpan === 2 ? 'md:row-span-2' : 'row-span-1';
  
  const variants = {
    default: 'bg-white border-neutral-100',
    primary: 'text-white',
    accent: 'text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`${colSpanClass} ${rowSpanClass} ${className}`}
    >
      <div className={`h-full rounded-3xl p-8 border transition-shadow duration-300 hover:shadow-xl ${variants[variant]}`}>
        {children}
      </div>
    </motion.div>
  );
};

// Skeleton Loading
const Skeleton = ({ isLoading, children, className = '' }: { isLoading: boolean; children: React.ReactNode; className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-100 animate-pulse rounded-2xl ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function NexusLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryColor = cs.primary || '#0f172a';
  const accentColor = cs.accent || '#6366f1';

  // Bento Grid Items
  const bentoItems = [
    { id: 'hero', colSpan: 2, rowSpan: 2, variant: 'primary' as const },
    { id: 'stats', colSpan: 1, rowSpan: 2, variant: 'default' as const },
    { id: 'feature1', colSpan: 1, rowSpan: 1, variant: 'accent' as const },
    { id: 'feature2', colSpan: 1, rowSpan: 1, variant: 'default' as const },
    { id: 'testimonial', colSpan: 2, rowSpan: 1, variant: 'default' as const },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900">
      {/* Floating Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-100' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">{websiteData.businessName}</span>
          <button
            className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            Kontakt
          </button>
        </div>
      </motion.header>

      {/* Hero Section with Kinetic Typography */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton isLoading={isLoading} className="w-full max-w-4xl h-24 mx-auto mb-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[-0.03em] leading-[0.95]">
                <KineticText 
                  text={websiteData.tagline || websiteData.businessName || 'Excellence Delivered'} 
                  delay={0.2}
                />
              </h1>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-full max-w-xl h-16 mx-auto">
              <p className="text-xl text-neutral-500 max-w-xl mx-auto leading-relaxed">
                {websiteData.description || 'Strategie, Design und Technologie vereint zu außergewöhnlichen Ergebnissen.'}
              </p>
            </Skeleton>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {/* Main Hero Card - 2×2 */}
            <BentoCard colSpan={2} rowSpan={2} delay={0} variant="primary">
              <div 
                className="h-full flex flex-col justify-between rounded-2xl p-8 -m-8"
                style={{ backgroundColor: primaryColor }}
              >
                <div>
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="uppercase tracking-widest text-xs font-semibold">Featured</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {websiteData.sections?.find(s => s.type === 'hero')?.headline || 'Innovation trifft Exzellenz'}
                  </h2>
                  <p className="text-white/70 max-w-sm">
                    {websiteData.sections?.find(s => s.type === 'hero')?.subheadline || 'Entdecken Sie, wie wir Unternehmen transformieren.'}
                  </p>
                </div>
                <button className="group flex items-center gap-2 text-white font-medium hover:gap-3 transition-all">
                  Mehr erfahren <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </BentoCard>

            {/* Stats Card - 1×2 */}
            <BentoCard colSpan={1} rowSpan={2} delay={0.1}>
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <p className="text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>150+</p>
                    <p className="text-sm text-neutral-500 mt-1">Projekte realisiert</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold tracking-tight" style={{ color: accentColor }}>98%</p>
                    <p className="text-sm text-neutral-500 mt-1">Kundenzufriedenheit</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold tracking-tight text-neutral-900">12</p>
                    <p className="text-sm text-neutral-500 mt-1">Jahre Erfahrung</p>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Feature 1 - 1×1 */}
            <BentoCard delay={0.2} variant="accent">
              <div 
                className="h-full flex flex-col justify-between -m-8 p-8 rounded-3xl"
                style={{ backgroundColor: accentColor }}
              >
                <TrendingUp className="w-8 h-8 text-white/80" />
                <div>
                  <p className="text-white font-semibold">Growth</p>
                  <p className="text-white/60 text-sm">Skalieren Sie Ihr Geschäft</p>
                </div>
              </div>
            </BentoCard>

            {/* Feature 2 - 1×1 */}
            <BentoCard delay={0.3}>
              <div className="h-full flex flex-col justify-between">
                <Users className="w-8 h-8 text-neutral-400" />
                <div>
                  <p className="font-semibold text-neutral-900">Collaboration</p>
                  <p className="text-neutral-500 text-sm">Teamwork macht den Traum wahr</p>
                </div>
              </div>
            </BentoCard>

            {/* Testimonial - 2×1 */}
            <BentoCard colSpan={2} delay={0.4}>
              <div className="h-full flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex-shrink-0" />
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg text-neutral-600 italic mb-2">
                    "Außergewöhnliche Arbeit, die unsere Erwartungen weit übertroffen hat."
                  </p>
                  <p className="text-sm font-medium text-neutral-900">— Max Mustermann, CEO</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Award key={i} className="w-5 h-5" style={{ color: accentColor }} />
                  ))}
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Strategie & <span style={{ color: primaryColor }}>Execution</span>
              </h2>
              <p className="text-lg text-neutral-500 mb-8">
                Von der ersten Idee bis zur finalen Umsetzung begleiten wir Sie auf jedem Schritt.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Beratung', 'Design', 'Development', 'Marketing'].map((tag, i) => (
                  <span 
                    key={i}
                    className="px-4 py-2 rounded-full text-sm font-medium border"
                    style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock, title: 'Schnell', desc: 'Agile Methoden' },
                { icon: Award, title: 'Qualität', desc: 'Höchste Standards' },
                { icon: Globe, title: 'Global', desc: 'Internationale Präsenz' },
                { icon: Zap, title: 'Innovation', desc: 'Cutting-edge Tech' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <item.icon className="w-6 h-6 mb-3" style={{ color: primaryColor }} />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-12 md:p-16 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lassen Sie uns zusammenarbeiten
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Bereit für Ihr nächstes Projekt? Wir freuen uns darauf, von Ihnen zu hören.
            </p>
            <button
              className="px-8 py-4 rounded-full font-semibold bg-white transition-all hover:scale-105"
              style={{ color: primaryColor }}
            >
              Projekt starten
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} {websiteData.businessName}. Alle Rechte vorbehalten.
          </span>
          <div className="flex gap-6">
            <a href="#" className="text-neutral-400 hover:text-neutral-600 transition-colors text-sm">Impressum</a>
            <a href="#" className="text-neutral-400 hover:text-neutral-600 transition-colors text-sm">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
