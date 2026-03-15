/**
 * CLAY Layout – Claymorphism with Soft 3D
 * Inspired by: Behance Trends, Dribbble 2024, Soft UI
 * For: Kindergartens, Therapists, Wellness, Lifestyle
 * 
 * Key Features:
 * - Clay-style cards: Double shadows (light + dark) for 3D effect
 * - Rounded "blob" shapes for containers
 * - Pastel color palette (Peach, Soft Blue, Mint)
 * - Soft, clearly visible shadows
 * - Rounded fonts (Nunito, Outfit) for friendly look
 * - Floating illustrations instead of photos
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Leaf, Star, Smile, Sun, Cloud, Flower2 } from 'lucide-react';
import type { WebsiteData, ColorScheme } from '@shared/types';

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Blob Shape Component
const Blob = ({ children, className = '', color = '#FFB6C1', delay = 0 }: { 
  children: React.ReactNode; 
  className?: string; 
  color?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`clay-blob ${className}`}
      style={{ 
        backgroundColor: color,
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      }}
    >
      {children}
    </motion.div>
  );
};

// Clay Card Component
const ClayCard = ({ 
  children, 
  className = '', 
  delay = 0,
  variant = 'light'
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  variant?: 'light' | 'dark' | 'colored';
}) => {
  const colors = {
    light: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
    dark: 'linear-gradient(145deg, #e8e8e8, #d8d8d8)',
    colored: 'linear-gradient(145deg, #FFE4E1, #FFC0CB)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 0.98, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      className={`clay-card rounded-[30px] ${className}`}
      style={{ background: colors[variant] }}
    >
      {children}
    </motion.div>
  );
};

// Floating Element Animation
const FloatingElement = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    animate={{ 
      y: [0, -15, 0],
      rotate: [0, 3, 0, -3, 0],
    }}
    transition={{ 
      duration: 6, 
      repeat: Infinity, 
      ease: 'easeInOut',
      delay 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Skeleton Loading
const Skeleton = ({ isLoading, children, className = '' }: { isLoading: boolean; children: React.ReactNode; className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-3xl ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function ClayLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pastel colors
  const peach = cs.primary || '#FFB6C1';
  const mint = cs.accent || '#98FF98';
  const sky = cs.secondary || '#B0E0E6';
  const cream = '#FFF8E7';

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Nunito', 'Outfit', sans-serif" }}>
      {/* Clay Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500 ${
          isScrolled ? 'clay-card mx-6 mt-4' : ''
        }`}
        style={{
          background: isScrolled ? 'linear-gradient(145deg, #ffffff, #f0f0f0)' : 'transparent',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: peach }}
            >
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-neutral-800">{websiteData.businessName}</span>
          </div>
          <button
            className="clay-card px-6 py-3 rounded-2xl font-semibold text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            Kontakt
          </button>
        </div>
      </motion.nav>

      {/* Hero Section with Blobs */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="relative z-10">
              <Skeleton isLoading={isLoading} className="w-full h-32 mb-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 leading-tight mb-6"
                >
                  {websiteData.tagline || websiteData.businessName || 'Mit Herz & Verstand'}
                </motion.h1>
              </Skeleton>

              <Skeleton isLoading={isLoading} className="w-full h-24 mb-8">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-neutral-600 leading-relaxed"
                >
                  {websiteData.description || 'Ein Ort der Entfaltung, des Wohlfühlens und der persönlichen Entwicklung. Wir begleiten Sie mit Herz und Fachkompetenz.'}
                </motion.p>
              </Skeleton>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <button
                  className="clay-card px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: peach }}
                >
                  Termin buchen
                </button>
                <button
                  className="clay-card px-8 py-4 rounded-2xl font-semibold text-neutral-700"
                  style={{ backgroundColor: sky }}
                >
                  Mehr erfahren
                </button>
              </motion.div>
            </div>

            {/* Right: Floating Illustrations */}
            <div className="relative h-[400px] hidden lg:block">
              {/* Large blob background */}
              <Blob 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-30" 
                color={peach}
                delay={0}
              />

              {/* Floating elements */}
              <FloatingElement delay={0} className="absolute top-10 left-10">
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center clay-card"
                  style={{ backgroundColor: peach }}
                >
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </FloatingElement>

              <FloatingElement delay={1} className="absolute top-20 right-20">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center clay-card"
                  style={{ backgroundColor: mint }}
                >
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </FloatingElement>

              <FloatingElement delay={2} className="absolute bottom-20 left-20">
                <div 
                  className="w-24 h-24 rounded-3xl flex items-center justify-center clay-card"
                  style={{ backgroundColor: sky }}
                >
                  <Sun className="w-10 h-10 text-white" />
                </div>
              </FloatingElement>

              <FloatingElement delay={1.5} className="absolute bottom-10 right-10">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center clay-card"
                  style={{ backgroundColor: '#FFE4B5' }}
                >
                  <Star className="w-6 h-6 text-white" />
                </div>
              </FloatingElement>

              {/* Main illustration card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 clay-card rounded-[40px] overflow-hidden"
              >
                <img
                  src={heroImageUrl}
                  alt="Willkommen"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with Clay Cards */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ backgroundColor: `${peach}30`, color: peach }}
            >
              Unsere Angebote
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">
              Für Ihr <span style={{ color: peach }}>Wohlbefinden</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Smile, 
                title: 'Beratung', 
                desc: 'Individuelle Betreuung und persönliche Beratung für Ihre Bedürfnisse.',
                color: peach 
              },
              { 
                icon: Sparkles, 
                title: 'Workshops', 
                desc: 'Kreative Workshops und Kurse für alle Altersgruppen.',
                color: mint 
              },
              { 
                icon: Flower2, 
                title: 'Therapie', 
                desc: 'Professionelle Therapieangebote in entspannter Atmosphäre.',
                color: sky 
              },
            ].map((service, i) => (
              <ClayCard key={i} delay={i * 0.1} variant="light">
                <div className="p-8">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: service.color }}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-3">{service.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{service.desc}</p>
                </div>
              </ClayCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Blob Shapes */}
      <section className="py-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative h-[300px]">
              <Blob className="absolute top-0 left-0 w-64 h-64 opacity-40" color={mint} />
              <Blob className="absolute bottom-0 right-0 w-48 h-48 opacity-30" color={peach} delay={0.2} />
              <div className="absolute inset-0 flex items-center justify-center">
                <ClayCard className="w-72 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-white"
                          style={{ backgroundColor: i === 1 ? peach : i === 2 ? mint : sky }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600 font-medium">+200 zufriedene Gäste</span>
                  </div>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    "Eine wunderbare Erfahrung! Das Team ist so herzlich und kompetent."
                  </p>
                </ClayCard>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
                Warum unsere Gäste <span style={{ color: peach }}>zurückkommen</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Heart, text: 'Herzliche, familiäre Atmosphäre' },
                  { icon: Sparkles, text: 'Individuelle Betreuung' },
                  { icon: Cloud, text: 'Entspannende Umgebung' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl clay-card"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: i === 0 ? peach : i === 1 ? mint : sky }}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-neutral-700">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <ClayCard className="p-12 md:p-16 text-center" variant="colored">
            <div className="flex justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center clay-card"
                style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
              >
                <Heart className="w-10 h-10" style={{ color: peach }} />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Bereit für einen Besuch?
            </h2>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Wir freuen uns darauf, Sie kennenzulernen. Buchen Sie jetzt Ihren Termin.
            </p>
            <button
              className="clay-card px-10 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
              style={{ backgroundColor: peach }}
            >
              Termin vereinbaren
            </button>
          </ClayCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 clay-card mx-6 mb-6 rounded-[30px]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: peach }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-neutral-800">{websiteData.businessName}</span>
          </div>
          <span className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Mit ♥ gemacht
          </span>
        </div>
      </footer>

      {/* Clay-specific CSS */}
      <style>{`
        .clay-card {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.08),
            -8px -8px 16px rgba(255, 255, 255, 0.8),
            inset 2px 2px 4px rgba(255, 255, 255, 0.5),
            inset -2px -2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .clay-card:hover {
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.1),
            -12px -12px 24px rgba(255, 255, 255, 0.9),
            inset 2px 2px 4px rgba(255, 255, 255, 0.5),
            inset -2px -2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .clay-blob {
          animation: blob-morph 8s ease-in-out infinite;
        }
        
        @keyframes blob-morph {
          0%, 100% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% { 
            border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%;
            transform: rotate(5deg);
          }
          75% {
            border-radius: 40% 50% 60% 30% / 60% 30% 40% 50%;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .clay-blob {
            animation: none;
          }
          .clay-card {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
