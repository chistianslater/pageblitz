/**
 * PULSE Layout – Neumorphism with Progress Rings
 * Inspired by: Apple Watch UI, Health Apps, Dashboards
 * For: Fitness Studios, Doctors, Coaches, Consultants
 * 
 * Key Features:
 * - Soft UI: Cards appear "pressed" or "raised"
 * - Circular progress indicators for services/stats
 * - Double shadow technique for 3D effect
 * - Soft accent colors (Sage Green, Soft Coral, Lavender)
 * - Circular elements for call-to-actions
 * - Soft gradient transitions between sections
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Activity, Heart, Target, Zap, TrendingUp, Clock, Award, ChevronRight } from 'lucide-react';
import type { WebsiteData, ColorScheme } from '@shared/types';

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  isLoading?: boolean;
}

// Neumorphic Card - Raised style
const NeuCard = ({ 
  children, 
  className = '', 
  delay = 0,
  pressed = false,
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  pressed?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`neu-raised rounded-3xl ${pressed ? 'neu-pressed' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Circular Progress Ring
const ProgressRing = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = '#10B981',
  children,
  delay = 0,
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string;
  children?: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        setAnimatedProgress(progress);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, progress, delay]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

import { useRef } from 'react';

// Skeleton Loading
const Skeleton = ({ isLoading, children, className = '' }: { isLoading: boolean; children: React.ReactNode; className?: string }) => {
  if (!isLoading) return <>{children}</>;
  return (
    <div className={`bg-gray-200 animate-pulse rounded-3xl ${className}`}>
      <div className="opacity-0">{children}</div>
    </div>
  );
};

export default function PulseLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Soft, health-focused colors
  const sageGreen = cs.primary || '#10B981';
  const softCoral = cs.accent || '#F87171';
  const lavender = cs.secondary || '#A78BFA';

  return (
    <div className="min-h-screen bg-[#e8e8e8] text-gray-800">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
          isScrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className={`max-w-6xl mx-auto flex items-center justify-between transition-all duration-500 ${
          isScrolled ? 'neu-raised rounded-2xl px-6 py-3' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center">
              <Activity className="w-5 h-5" style={{ color: sageGreen }} />
            </div>
            <span className="font-bold text-lg">{websiteData?.businessName}</span>
          </div>
          <button className="neu-raised px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg active:shadow-inner">
            Termin buchen
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <Skeleton isLoading={isLoading} className="w-48 h-10 mb-6">
                <div className="inline-flex items-center gap-2 neu-pressed px-4 py-2 rounded-xl">
                  <Zap className="w-4 h-4" style={{ color: sageGreen }} />
                  <span className="text-sm font-semibold" style={{ color: sageGreen }}>
                    {websiteData?.businessCategory || 'Health & Fitness'}
                  </span>
                </div>
              </Skeleton>

              <Skeleton isLoading={isLoading} className="w-full h-40 mb-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  {websiteData?.tagline || websiteData?.businessName || 'Erreichen Sie Ihre Ziele'}
                </h1>
              </Skeleton>

              <Skeleton isLoading={isLoading} className="w-full h-24 mb-8">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {websiteData?.description || 'Professionelle Betreuung für Ihre Gesundheit und Fitness. Mit maßgeschneiderten Plänen und persönlicher Unterstützung.'}
                </p>
              </Skeleton>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="neu-raised px-8 py-4 rounded-2xl font-bold text-white transition-all hover:shadow-xl active:shadow-inner active:scale-[0.98]"
                  style={{ backgroundColor: sageGreen }}
                >
                  Jetzt starten
                </button>
                <button className="neu-raised px-8 py-4 rounded-2xl font-semibold transition-all hover:shadow-lg active:shadow-inner active:scale-[0.98]">
                  Mehr erfahren
                </button>
              </div>
            </div>

            {/* Right: Progress Rings Dashboard */}
            <motion.div style={{ y: smoothY }} className="hidden lg:block">
              <NeuCard className="p-8">
                <div className="grid grid-cols-2 gap-8">
                  {/* Progress Ring 1 */}
                  <div className="flex flex-col items-center">
                    <ProgressRing progress={85} color={sageGreen} delay={0.2}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">85%</p>
                        <p className="text-xs text-gray-500">Erfolgsrate</p>
                      </div>
                    </ProgressRing>
                  </div>
                  
                  {/* Progress Ring 2 */}
                  <div className="flex flex-col items-center">
                    <ProgressRing progress={92} color={softCoral} delay={0.4}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">92%</p>
                        <p className="text-xs text-gray-500">Zufriedenheit</p>
                      </div>
                    </ProgressRing>
                  </div>
                  
                  {/* Progress Ring 3 */}
                  <div className="flex flex-col items-center">
                    <ProgressRing progress={78} color={lavender} delay={0.6}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">500+</p>
                        <p className="text-xs text-gray-500">Kunden</p>
                      </div>
                    </ProgressRing>
                  </div>
                  
                  {/* Progress Ring 4 */}
                  <div className="flex flex-col items-center">
                    <ProgressRing progress={95} color={sageGreen} delay={0.8}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-xs text-gray-500">Jahre Erfahrung</p>
                      </div>
                    </ProgressRing>
                  </div>
                </div>
              </NeuCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, value: '2,500+', label: 'Trainingssessions', color: softCoral },
              { icon: Target, value: '98%', label: 'Zielerreichung', color: sageGreen },
              { icon: TrendingUp, value: '4.9', label: 'Durchschnittsnote', color: lavender },
              { icon: Award, value: '15', label: 'Zertifizierungen', color: sageGreen },
            ].map((stat, i) => (
              <NeuCard key={i} delay={i * 0.1} className="p-6 text-center">
                <div 
                  className="w-12 h-12 rounded-xl neu-pressed flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </NeuCard>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unsere <span style={{ color: sageGreen }}>Leistungen</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Maßgeschneiderte Programme für Ihre individuellen Bedürfnisse.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Activity, 
                title: 'Personal Training', 
                desc: 'Einzelbetreuung mit individuellem Trainingsplan.',
                features: ['Individuelle Pläne', 'Fortschritts-Tracking', 'Ernährungsberatung'],
                color: sageGreen 
              },
              { 
                icon: Clock, 
                title: 'Gruppenkurse', 
                desc: 'Motivierende Kurse in kleinen Gruppen.',
                features: ['Yoga & Pilates', 'HIIT Training', 'Entspannung'],
                color: softCoral 
              },
              { 
                icon: Heart, 
                title: 'Gesundheitscoaching', 
                desc: 'Ganzheitliche Betreuung für Körper und Geist.',
                features: ['Stressmanagement', 'Schlafhygiene', 'Work-Life-Balance'],
                color: lavender 
              },
            ].map((service, i) => (
              <NeuCard key={i} delay={i * 0.1} className="p-8">
                <div 
                  className="w-16 h-16 rounded-2xl neu-pressed flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <service.icon className="w-8 h-8" style={{ color: service.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: service.color }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </NeuCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <NeuCard className="p-12 md:p-16 text-center">
            <div className="flex justify-center mb-8">
              <div 
                className="w-24 h-24 rounded-full neu-pressed flex items-center justify-center"
                style={{ backgroundColor: `${sageGreen}15` }}
              >
                <Target className="w-12 h-12" style={{ color: sageGreen }} />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit für den <span style={{ color: sageGreen }}>ersten Schritt</span>?
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Vereinbaren Sie ein kostenloses Erstgespräch und lassen Sie uns gemeinsam Ihre Ziele definieren.
            </p>
            <button 
              className="neu-raised px-10 py-4 rounded-2xl font-bold text-white transition-all hover:shadow-xl active:shadow-inner"
              style={{ backgroundColor: sageGreen }}
            >
              Termin vereinbaren
              <ChevronRight className="w-5 h-5 inline-block ml-2" />
            </button>
          </NeuCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="neu-pressed rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${sageGreen}20` }}
                  >
                    <Activity className="w-5 h-5" style={{ color: sageGreen }} />
                  </div>
                  <span className="font-bold text-lg">{websiteData?.businessName}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Professionelle Betreuung für Ihre Gesundheit und Fitness.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Kontakt</h4>
                <p className="text-sm text-gray-500">
                  Musterstraße 123<br/>
                  10115 Berlin<br/>
                  +49 30 123 456 78
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Öffnungszeiten</h4>
                <p className="text-sm text-gray-500">
                  Mo-Fr: 06:00 - 22:00<br/>
                  Sa: 08:00 - 20:00<br/>
                  So: 10:00 - 18:00
                </p>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-300 text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} {websiteData?.businessName}. Alle Rechte vorbehalten.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Pulse-specific CSS */}
      <style>{`
        /* Neumorphic Raised Style */
        .neu-raised {
          background: #e8e8e8;
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.08),
            -8px -8px 16px rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
        }
        
        .neu-raised:hover {
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.1),
            -12px -12px 24px rgba(255, 255, 255, 1);
        }
        
        /* Neumorphic Pressed Style */
        .neu-pressed {
          background: #e8e8e8;
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.06),
            inset -4px -4px 8px rgba(255, 255, 255, 0.7);
        }
        
        /* Circular buttons */
        .neu-circular {
          border-radius: 50%;
          aspect-ratio: 1;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .neu-raised,
          .neu-pressed {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
