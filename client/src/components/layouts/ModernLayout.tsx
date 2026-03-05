/**
 * MODERN Layout V2 – Tech & Agency
 * Typography: Clash Display (headlines) + Satoshi (body)
 * Feel: Clean, minimal, professional, tech-forward
 * Structure: Modern grid layout, floating elements, gradient accents
 */
import { ChevronRight, Play } from "lucide-react";
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

export default function ModernLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  return (
    <div className="bg-white text-slate-900 overflow-hidden relative font-satoshi">
      {/* Background Gradient Mesh */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-10 pointer-events-none" 
        style={{ backgroundColor: cs.primary }} 
      />
      
      {/* Navigation */}
      <nav className="px-4 md:px-10 py-6 md:py-8 flex justify-between items-center relative z-10">
        <Skeleton isLoading={isLoading} className="w-32 h-8">
          <span className="font-clash font-black tracking-tight text-xl md:text-2xl uppercase italic">{websiteData.businessName}</span>
        </Skeleton>
        <div className="hidden md:flex gap-6 md:gap-10 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
          <Skeleton isLoading={isLoading} className="w-16 h-4">
            <a href="#" className="hover:opacity-100 transition-opacity">Expertise</a>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-16 h-4">
            <a href="#" className="hover:opacity-100 transition-opacity">Showcase</a>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-16 h-4">
            <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
          </Skeleton>
        </div>
        <button className="md:hidden p-2">
          <div className="w-6 h-0.5 bg-slate-900 mb-1.5" />
          <div className="w-6 h-0.5 bg-slate-900 mb-1.5" />
          <div className="w-6 h-0.5 bg-slate-900" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 grid lg:grid-cols-12 gap-8 md:gap-10 items-center">
        <motion.div 
          className="lg:col-span-7"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Skeleton isLoading={isLoading} className="w-full h-32 md:h-48 mb-6">
            <h1 className="font-clash text-5xl md:text-7xl lg:text-9xl font-black tracking-tight leading-[0.85] mb-6 md:mb-10 uppercase">
              Forward <br/> 
              <span style={{ color: cs.primary }}>Thinking</span> <br/> 
              Design.
            </h1>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="w-3/4 h-16 mb-6">
            <p className="text-base md:text-xl text-slate-500 mb-6 md:mb-10 max-w-lg leading-relaxed">
              {websiteData.tagline}
            </p>
          </Skeleton>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Skeleton isLoading={isLoading} className="w-40 h-14">
              <button 
                style={{ backgroundColor: cs.primary }} 
                className="px-6 md:px-10 py-4 md:py-5 text-white font-bold rounded-full flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform text-sm md:text-base uppercase tracking-widest"
              >
                Inquire now <ChevronRight size={18}/>
              </button>
            </Skeleton>
            <Skeleton isLoading={isLoading} className="w-40 h-14">
              <button className="px-6 md:px-10 py-4 md:py-5 border-2 border-slate-100 rounded-full font-bold flex items-center gap-2 md:gap-3 hover:bg-slate-50 transition-all text-sm md:text-base uppercase tracking-widest">
                <Play size={18} fill="currentColor"/> View Demo
              </button>
            </Skeleton>
          </div>
        </motion.div>
        <motion.div 
          className="lg:col-span-5 relative mt-8 lg:mt-0"
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <Skeleton isLoading={isLoading} className="w-full aspect-[4/5] rounded-[2rem]">
            <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
              <img 
                src={heroImageUrl} 
                className="w-full aspect-[4/5] object-cover hover:scale-110 transition-transform duration-1000" 
                alt=""
              />
            </div>
          </Skeleton>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "98%", label: "Satisfaction" },
              { num: "250+", label: "Projects" },
              { num: "12+", label: "Experience" },
              { num: "24/7", label: "Availability" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-clash text-3xl md:text-5xl font-black tracking-tight" style={{ color: cs.primary }}>{stat.num}</p>
                <p className="font-satoshi text-xs uppercase tracking-[0.2em] text-slate-400 mt-1 md:mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
