/**
 * FORGE Layout – Brutalist with Editorial Touch
 * Inspired by: High-End Magazine Layouts, Balenciaga, A24
 * For: Architects, Designers, Galleries, Premium Services
 * 
 * Key Features:
 * - Oversized headlines (up to 15vw)
 * - Strong grid with visible borders
 * - Monochrome palette with one strong accent
 * - Asymmetric layout (60/40 or 70/30 splits)
 * - Editorial photo treatment: High contrast, slight grain
 * - Sharp angles, no border-radius
 * - Cormorant Garamond (Serif) + Space Grotesk
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowDownRight, Grid3X3, Type, Image as ImageIcon } from 'lucide-react';
import type { WebsiteData, ColorScheme } from '@shared/types';

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Brutalist Text Component
const BrutalistText = ({ children, className = '', as: Component = 'span' }: { children: React.ReactNode; className?: string; as?: any }) => {
  return (
    <Component className={`uppercase tracking-[-0.04em] leading-[0.9] ${className}`}>
      {children}
    </Component>
  );
};

// Sharp Container - No border radius
const SharpBox = ({ 
  children, 
  className = '', 
  border = true,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  border?: boolean;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`${border ? 'border-2 border-current' : ''} ${className}`}
      style={{ borderRadius: 0 }}
    >
      {children}
    </motion.div>
  );
};

// Skeleton Loading
const Skeleton = ({ isLoading, children, className = '' }: { isLoading: boolean; children: React.ReactNode; className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse ${className}`} style={{ borderRadius: 0 }}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function ForgeLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryColor = cs.primary || '#1a1a1a';
  const accentColor = cs.accent || '#ff0000';

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Navigation - Brutalist */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b-2 border-neutral-900 transition-all duration-300 ${
          isScrolled ? 'bg-white py-4' : 'bg-white py-6'
        }`}
      >
        <div className="max-w-[95vw] mx-auto px-6 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">{websiteData.businessName}</span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors">Arbeit</a>
            <a href="#about" className="text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors">Studio</a>
            <a href="#contact" className="text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors">Kontakt</a>
          </div>
          <button
            className="px-6 py-3 border-2 border-neutral-900 text-sm uppercase tracking-widest font-semibold hover:bg-neutral-900 hover:text-white transition-all duration-300"
            style={{ borderRadius: 0 }}
          >
            Start project
          </button>
        </div>
      </motion.nav>

      {/* Hero Section - Massive Typography */}
      <section className="pt-32 pb-0">
        <div className="border-b-2 border-neutral-900">
          <div className="max-w-[95vw] mx-auto px-6 py-12 md:py-20">
            <Skeleton isLoading={isLoading} className="w-full h-48 md:h-64 mb-4">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-light uppercase leading-[0.85] tracking-[-0.04em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {(() => {
                  const text = websiteData.tagline || websiteData.businessName || 'Excellence';
                  const words = text.split(' ');
                  if (words.length >= 2) {
                    return (
                      <>
                        <span className="block">{words[0]}</span>
                        <span className="block" style={{ color: accentColor }}>{words.slice(1).join(' ')}</span>
                      </>
                    );
                  }
                  return <span>{text}</span>;
                })()}
              </motion.h1>
            </Skeleton>
          </div>
        </div>

        {/* Split Layout - 65/35 */}
        <div className="grid md:grid-cols-[65%_35%] border-b-2 border-neutral-900">
          {/* Left: Image */}
          <motion.div 
            style={{ y: heroY }}
            className="relative aspect-[4/3] md:aspect-auto md:min-h-[60vh] border-b-2 md:border-b-0 md:border-r-2 border-neutral-900 overflow-hidden"
          >
            <Skeleton isLoading={isLoading} className="absolute inset-0">
              <img
                src={heroImageUrl}
                alt={websiteData.businessName}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              {/* Editorial grain overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </Skeleton>
          </motion.div>

          {/* Right: Content */}
          <div className="flex flex-col justify-between p-8 md:p-12">
            <div>
              <Skeleton isLoading={isLoading} className="w-full h-24 mb-6">
                <p className="text-lg md:text-xl leading-relaxed text-neutral-600" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                  {websiteData.description || 'Präzision und Ästhetik vereint. Wir schaffen Räume, die inspirieren und Formen, die begeistern.'}
                </p>
              </Skeleton>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Location</p>
                <p className="text-sm font-medium">Berlin, Germany</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-neutral-900" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b-2 border-neutral-900">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Projects', value: '127' },
            { label: 'Years', value: '15' },
            { label: 'Awards', value: '24' },
            { label: 'Team', value: '08' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`p-6 md:p-8 ${i < 3 ? 'border-b-2 md:border-b-0 md:border-r-2 border-neutral-900' : ''}`}
            >
              <p className="text-3xl md:text-4xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Work Section - Grid */}
      <section id="work" className="py-20 md:py-32">
        <div className="max-w-[95vw] mx-auto px-6">
          <div className="flex items-end justify-between mb-12 border-b-2 border-neutral-900 pb-6">
            <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Selected Work
            </h2>
            <div className="flex gap-2">
              <Grid3X3 className="w-5 h-5" />
              <span className="text-sm uppercase tracking-widest hidden md:inline">Grid View</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-neutral-900 border-2 border-neutral-900">
            {[
              { title: 'Villa Konrad', type: 'Architecture', year: '2024' },
              { title: 'Atelier Nord', type: 'Interior', year: '2023' },
              { title: 'Gallery Space', type: 'Exhibition', year: '2023' },
              { title: 'Urban Loft', type: 'Residential', year: '2022' },
            ].map((project, i) => (
              <SharpBox 
                key={i} 
                border={false}
                delay={i * 0.1}
                className="bg-white p-8 md:p-12 group cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                <div className="aspect-[4/3] bg-neutral-200 mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 to-neutral-400" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-neutral-500" />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-all duration-500" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-1 group-hover:text-neutral-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-neutral-500">{project.type}</p>
                  </div>
                  <span className="text-sm text-neutral-400">{project.year}</span>
                </div>
              </SharpBox>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Asymmetric */}
      <section id="about" className="border-t-2 border-neutral-900">
        <div className="grid md:grid-cols-[40%_60%]">
          {/* Left: Sticky Title */}
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-neutral-900 p-8 md:p-12 md:sticky md:top-0 md:h-screen flex flex-col justify-between">
            <div>
              <Type className="w-6 h-6 mb-6" />
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light uppercase leading-[0.9]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                The<br/>Studio
              </h2>
            </div>
            <p className="text-sm uppercase tracking-widest text-neutral-400">
              Est. 2009
            </p>
          </div>

          {/* Right: Content */}
          <div className="p-8 md:p-12">
            <div className="max-w-2xl">
              <p className="text-xl md:text-2xl leading-relaxed mb-12" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                Wir sind ein multidisziplinäres Designstudio, das an der Schnittstelle von Architektur, Kunst und Kommunikation arbeitet. 
                Unsere Projekte zeichnen sich durch konzeptionelle Stärke und ästhetische Präzision aus.
              </p>

              <div className="grid grid-cols-2 gap-px bg-neutral-900 border-2 border-neutral-900 mb-12">
                {[
                  { title: 'Architecture', desc: 'Gebäude & Räume' },
                  { title: 'Interior', desc: 'Innenräume' },
                  { title: 'Branding', desc: 'Markenidentität' },
                  { title: 'Digital', desc: 'Web & App' },
                ].map((service, i) => (
                  <div key={i} className="bg-white p-6 hover:bg-neutral-50 transition-colors cursor-pointer group">
                    <h3 className="font-semibold mb-1 group-hover:text-neutral-600 transition-colors">{service.title}</h3>
                    <p className="text-sm text-neutral-500">{service.desc}</p>
                  </div>
                ))}
              </div>

              {/* Large CTA */}
              <div className="border-2 border-neutral-900 p-8 md:p-12 bg-neutral-900 text-white">
                <p className="text-lg mb-6 text-neutral-400">
                  Haben Sie ein Projekt in Aussicht?
                </p>
                <a 
                  href="#contact" 
                  className="inline-flex items-center gap-4 text-2xl md:text-3xl font-light hover:text-neutral-300 transition-colors group"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                >
                  Lassen Sie uns sprechen
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 border-t-2 border-neutral-900">
        <div className="max-w-[95vw] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-24">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light uppercase leading-[0.9] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Start a<br/>Project
              </h2>
              <p className="text-lg text-neutral-600 mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                Erzählen Sie uns von Ihrem Projekt. Wir melden uns innerhalb von 48 Stunden.
              </p>
            </div>
            <div className="space-y-6">
              <div className="border-b-2 border-neutral-900 py-4">
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Email</p>
                <a href="mailto:hello@studio.com" className="text-xl hover:text-neutral-500 transition-colors">
                  hello@{websiteData.businessName?.toLowerCase().replace(/\s+/g, '')}.com
                </a>
              </div>
              <div className="border-b-2 border-neutral-900 py-4">
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Phone</p>
                <a href="tel:+493012345678" className="text-xl hover:text-neutral-500 transition-colors">
                  +49 30 123 456 78
                </a>
              </div>
              <div className="border-b-2 border-neutral-900 py-4">
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Address</p>
                <p className="text-xl">
                  Musterstraße 123<br/>
                  10115 Berlin
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-neutral-900 py-8">
        <div className="max-w-[95vw] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm uppercase tracking-widest">
            © {new Date().getFullYear()} {websiteData.businessName}
          </span>
          <div className="flex gap-8">
            <a href="#" className="text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors">Instagram</a>
            <a href="#" className="text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors">LinkedIn</a>
            <a href="#" className="text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors">Behance</a>
          </div>
        </div>
      </footer>

      {/* Forge-specific CSS */}
      <style>{`
        /* Editorial photo treatment */
        .forge-photo {
          filter: grayscale(100%) contrast(1.1);
          transition: filter 0.7s ease;
        }
        
        .forge-photo:hover {
          filter: grayscale(0%) contrast(1);
        }
        
        /* Text outline effect on hover */
        .forge-outline:hover {
          -webkit-text-stroke: 1px currentColor;
          -webkit-text-fill-color: transparent;
        }
        
        /* Sharp grid lines */
        .forge-grid {
          background-image: 
            linear-gradient(to right, #1a1a1a 1px, transparent 1px),
            linear-gradient(to bottom, #1a1a1a 1px, transparent 1px);
          background-size: 60px 60px;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .forge-photo {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
