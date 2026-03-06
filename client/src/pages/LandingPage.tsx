import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Zap, 
  Globe, 
  MousePointer2, 
  Sparkles, 
  Rocket, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Smartphone, 
  Clock, 
  Star,
  ShieldCheck,
  ChevronRight,
  Play,
  ExternalLink,
  ArrowUpRight,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import {
  BoldLayoutV2, ElegantLayoutV2, CleanLayoutV2, CraftLayoutV2,
  DynamicLayoutV2, FreshLayoutV2, LuxuryLayoutV2, ModernLayoutV2,
  NaturalLayoutV2, PremiumLayoutV2
} from "@/components/layouts/PremiumLayoutsV2";
import type { ColorScheme } from "@shared/types";

// --- Animation Components ---

const GradientOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 1.5, ease: "easeOut" }}
    className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`}
  />
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Funktionen", href: "#features" },
    { label: "Beispiele", href: "#showcase" },
    { label: "Preise", href: "#pricing" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10 group-hover:shadow-white/20 transition-all">
              <Zap className="w-5 h-5 text-black" fill="black" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Pageblitz</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => navigate("/start")}
              className="text-white/70 hover:text-white hover:bg-white/5 text-sm"
            >
              Anmelden
            </Button>
            <Button 
              onClick={() => navigate("/start")}
              className="bg-white text-black hover:bg-white/90 rounded-full px-5 h-10 text-sm font-medium shadow-lg shadow-white/10"
            >
              Website erstellen
            </Button>
          </div>

          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl text-white/80 py-3 border-b border-white/10"
                >
                  {link.label}
                </a>
              ))}
              <Button 
                onClick={() => { setMobileMenuOpen(false); navigate("/start"); }}
                className="bg-white text-black hover:bg-white/90 rounded-full mt-6 h-14 text-lg font-medium"
              >
                Website erstellen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500"
  >
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-5 h-5 text-white/70" />
      </div>
      <h3 className="text-white text-lg font-semibold mb-3 tracking-tight">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const GhostWebsiteCreation = () => {
  const loopDuration = 8;
  
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/10] rounded-xl bg-[#0a0a0a] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
      {/* Browser Chrome */}
      <div className="relative h-10 bg-[#111] border-b border-white/10 flex items-center px-3 gap-2 z-30 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
        </div>
        <div className="flex-1 max-w-sm mx-auto h-5 bg-white/5 rounded-md flex items-center px-2 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500/40 mr-2" />
          <div className="h-1.5 bg-white/20 rounded-full w-20" />
        </div>
      </div>

      {/* Website Content Building - Loop Animation */}
      <div className="relative h-[calc(100%-2.5rem)] p-4 overflow-hidden">
        {/* Hero Section Building - Fades in and out */}
        <motion.div 
          className="h-20 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] mb-3 relative overflow-hidden border border-white/10"
        >
          {/* Background gradient sweep */}
          <motion.div
            animate={{ 
              x: ["-100%", "0%", "0%", "100%"],
              opacity: [0, 0.5, 0.5, 0]
            }}
            transition={{ 
              duration: loopDuration,
              repeat: Infinity,
              times: [0, 0.2, 0.6, 0.8],
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
          />
          
          {/* Text lines appearing */}
          <div className="absolute inset-0 p-4 flex flex-col justify-center gap-2">
            <motion.div
              animate={{ 
                width: ["0%", "70%", "70%", "0%"],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: loopDuration,
                repeat: Infinity,
                times: [0, 0.15, 0.65, 0.75],
                ease: "easeOut"
              }}
              className="h-4 bg-gradient-to-r from-white/40 to-white/20 rounded-full"
            />
            <motion.div
              animate={{ 
                width: ["0%", "50%", "50%", "0%"],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: loopDuration,
                repeat: Infinity,
                times: [0.05, 0.2, 0.6, 0.7],
                ease: "easeOut"
              }}
              className="h-2.5 bg-gradient-to-r from-white/25 to-white/10 rounded-full"
            />
          </div>

          {/* Button appearing */}
          <motion.div
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 1, 0.8]
            }}
            transition={{ 
              duration: loopDuration,
              repeat: Infinity,
              times: [0.1, 0.25, 0.55, 0.7]
            }}
            className="absolute bottom-4 left-4 w-20 h-6 bg-white/20 rounded-md"
          />
        </motion.div>

        {/* Features Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: [10, 0, 0, -10]
              }}
              transition={{ 
                duration: loopDuration,
                repeat: Infinity,
                times: [0.15 + i * 0.05, 0.3 + i * 0.05, 0.6, 0.75],
                ease: "easeOut"
              }}
              className="aspect-[4/3] rounded-md bg-white/[0.03] border border-white/[0.08] p-2 flex flex-col gap-1.5"
            >
              <motion.div 
                className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500/30 to-purple-500/20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
              <div className="space-y-1 flex-1">
                <motion.div 
                  className="h-1.5 bg-white/25 rounded-full"
                  animate={{ width: ["0%", "100%", "100%", "0%"] }}
                  transition={{ 
                    duration: loopDuration,
                    repeat: Infinity,
                    times: [0.2 + i * 0.05, 0.35 + i * 0.05, 0.55, 0.65]
                  }}
                />
                <motion.div 
                  className="h-1.5 bg-white/15 rounded-full"
                  animate={{ width: ["0%", "60%", "60%", "0%"] }}
                  transition={{ 
                    duration: loopDuration,
                    repeat: Infinity,
                    times: [0.22 + i * 0.05, 0.37 + i * 0.05, 0.53, 0.63]
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* About Section */}
        <div className="flex gap-2 h-16">
          <motion.div
            animate={{ 
              opacity: [0, 1, 1, 0],
              x: [-10, 0, 0, -10]
            }}
            transition={{ 
              duration: loopDuration,
              repeat: Infinity,
              times: [0.3, 0.45, 0.7, 0.8]
            }}
            className="w-1/2 rounded-md bg-white/[0.03] border border-white/[0.08] overflow-hidden"
          >
            <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
          </motion.div>
          <motion.div
            animate={{ 
              opacity: [0, 1, 1, 0],
              x: [10, 0, 0, 10]
            }}
            transition={{ 
              duration: loopDuration,
              repeat: Infinity,
              times: [0.32, 0.47, 0.68, 0.78]
            }}
            className="w-1/2 flex flex-col justify-center gap-1.5 py-1"
          >
            <motion.div
              animate={{ width: ["0%", "80%", "80%", "0%"] }}
              transition={{ duration: loopDuration, repeat: Infinity, times: [0.35, 0.5, 0.65, 0.75] }}
              className="h-3 bg-white/30 rounded-full"
            />
            {[0, 1, 2].map((i) => {
              const widthVal = 70 - i * 15;
              return (
                <motion.div
                  key={i}
                  animate={{ width: ["0%", `${widthVal}%`, `${widthVal}%`, "0%"] }}
                  transition={{ 
                    duration: loopDuration, 
                    repeat: Infinity, 
                    times: [0.37 + i * 0.02, 0.52 + i * 0.02, 0.63, 0.73]
                  }}
                  className="h-1.5 bg-white/15 rounded-full"
                />
              );
            })}
          </motion.div>
        </div>

        {/* Ghost Cursor - Confined to browser window */}
        <motion.div
          className="absolute z-50 pointer-events-none"
          animate={{ 
            x: [20, 100, 200, 280, 340, 240, 160, 80, 20],
            y: [30, 70, 130, 90, 140, 180, 120, 160, 30]
          }}
          transition={{ 
            duration: loopDuration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <MousePointer2 className="w-4 h-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="white" />
            {/* Click ripple */}
            <motion.div
              animate={{ 
                scale: [1, 2.5, 2.5],
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 1.2,
                times: [0, 0.3, 1]
              }}
              className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full -translate-x-1/4 -translate-y-1/4"
            />
          </div>
        </motion.div>

        {/* Section Labels */}
        <motion.div
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: loopDuration, repeat: Infinity, times: [0.2, 0.3, 0.6, 0.7] }}
          className="absolute top-16 right-3 px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/50"
        >
          Hero
        </motion.div>
        <motion.div
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: loopDuration, repeat: Infinity, times: [0.35, 0.45, 0.65, 0.75] }}
          className="absolute top-40 right-3 px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/50"
        >
          Features
        </motion.div>
        <motion.div
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: loopDuration, repeat: Infinity, times: [0.5, 0.6, 0.7, 0.8] }}
          className="absolute bottom-12 right-3 px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/50"
        >
          About
        </motion.div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
    </div>
  );
};

// --- Website Showcase Gallery with Live Layout Previews ---

const LAYOUT_COMPONENTS = {
  Bold: BoldLayoutV2,
  Elegant: ElegantLayoutV2,
  Clean: CleanLayoutV2,
  Craft: CraftLayoutV2,
  Dynamic: DynamicLayoutV2,
  Fresh: FreshLayoutV2,
  Luxury: LuxuryLayoutV2,
  Modern: ModernLayoutV2,
  Natural: NaturalLayoutV2,
  Premium: PremiumLayoutV2,
};

// Generate random color schemes
const generateRandomColorScheme = (): ColorScheme => {
  const hues = [0, 30, 60, 120, 180, 210, 240, 270, 300, 330];
  const hue = hues[Math.floor(Math.random() * hues.length)];
  const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
  const lightness = 45 + Math.floor(Math.random() * 20); // 45-65%
  
  const primary = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const secondary = `hsl(${hue}, ${saturation}%, ${Math.max(30, lightness - 15)}%)`;
  const accent = `hsl(${(hue + 30) % 360}, ${saturation}%, ${Math.min(70, lightness + 15)}%)`;
  
  return {
    primary,
    secondary,
    accent,
    background: "#fafafa",
    surface: "#ffffff",
    text: "#171717",
    textLight: "#737373",
    onPrimary: "#ffffff",
  };
};

// Mock website data for previews
const createMockWebsiteData = (name: string, industry: string) => ({
  business: {
    name,
    category: industry,
    address: "Musterstraße 123, 12345 Musterstadt",
    phone: "+49 123 456789",
    email: "info@example.de",
  },
  hero: {
    headline: name,
    subheadline: "Professionelle Dienstleistungen für Sie",
    description: "Wir bieten erstklassige Qualität und Service, der überzeugt. Kontaktieren Sie uns für ein unverbindliches Angebot.",
    ctaText: "Jetzt Termin vereinbaren",
    ctaLink: "#contact",
  },
  about: {
    text: "Seit über 10 Jahren sind wir Ihr verlässlicher Partner. Unser erfahrenes Team steht Ihnen mit Kompetenz und Engagement zur Seite.",
    usp: ["Qualitätsgarantie", "Persönliche Beratung", "Faire Preise"],
  },
  services: {
    headline: "Unsere Leistungen",
    items: [
      { title: "Beratung", description: "Individuelle Beratung nach Ihren Bedürfnissen", icon: "star" },
      { title: "Service", description: "Schneller und zuverlässiger Service", icon: "zap" },
      { title: "Support", description: "Rund um die Uhr für Sie da", icon: "phone" },
    ],
  },
  sections: [
    { type: "hero", headline: name, subheadline: "Professionelle Dienstleistungen" },
    { type: "about", text: "Über uns Text..." },
    { type: "services", headline: "Leistungen" },
    { type: "process", headline: "So funktioniert's", items: [
      { step: "1", title: "Anfrage", description: "Beschreiben Sie Ihr Projekt" },
      { step: "2", title: "Planung", description: "Wir erstellen ein Konzept" },
      { step: "3", title: "Umsetzung", description: "Professionelle Durchführung" },
    ]},
    { type: "cta", headline: "Bereit zu starten?", content: "Kontaktieren Sie uns jetzt" },
  ],
});

const websiteExamples = [
  { name: "Friseur Studio", industry: "Beauty & Wellness", layout: "Elegant" as const },
  { name: "Pizzeria Napoli", industry: "Restaurant", layout: "Bold" as const },
  { name: "Bauunternehmen", industry: "Handwerk", layout: "Craft" as const },
  { name: "Beauty Lounge", industry: "Beauty", layout: "Luxury" as const },
  { name: "Café Central", industry: "Gastronomie", layout: "Fresh" as const },
  { name: "Fitness Studio", industry: "Fitness", layout: "Dynamic" as const },
  { name: "Arztpraxis", industry: "Medizin", layout: "Clean" as const },
  { name: "Agentur", industry: "IT", layout: "Modern" as const },
];

// Live Preview Component with Autoscroll
interface LivePreviewCardProps {
  name: string;
  industry: string;
  layout: keyof typeof LAYOUT_COMPONENTS;
  delay?: number;
}

const LivePreviewCard = ({ name, industry, layout, delay = 0 }: LivePreviewCardProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [colorScheme] = useState(() => generateRandomColorScheme());
  const [isHovering, setIsHovering] = useState(false);
  const scrollPositionRef = useRef(0);
  const animationRef = useRef<number>();

  const LayoutComponent = LAYOUT_COMPONENTS[layout] || PremiumLayoutV2;
  const websiteData = createMockWebsiteData(name, industry);

  const startAutoScroll = useCallback(() => {
    if (!previewRef.current) return;
    
    const scrollStep = () => {
      if (previewRef.current && isHovering) {
        scrollPositionRef.current += 1.5;
        const maxScroll = previewRef.current.scrollHeight - previewRef.current.clientHeight;
        
        // Reset to top when reaching bottom for seamless loop
        if (scrollPositionRef.current >= maxScroll) {
          scrollPositionRef.current = 0;
        }
        
        previewRef.current.scrollTop = scrollPositionRef.current;
        animationRef.current = requestAnimationFrame(scrollStep);
      }
    };
    
    animationRef.current = requestAnimationFrame(scrollStep);
  }, [isHovering]);

  useEffect(() => {
    if (isHovering) {
      startAutoScroll();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering, startAutoScroll]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay }}
      className="snap-center shrink-0 w-[360px] md:w-[420px] group cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 mb-4 border border-white/10 group-hover:border-white/30 transition-all shadow-2xl">
        {/* Live Website Preview */}
        <div 
          ref={previewRef}
          className="absolute inset-0 overflow-hidden"
          style={{ scrollBehavior: "auto" }}
        >
          <div className="transform scale-[0.35] origin-top" style={{ width: "285.7%", height: "285.7%" }}>
            <LayoutComponent 
              websiteData={websiteData} 
              cs={colorScheme}
              heroImageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"
              isLoading={false}
            />
          </div>
        </div>
        
        {/* Gradient overlay for smooth fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />
        
        {/* Hover overlay with zoom icon */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform shadow-xl">
            <ArrowUpRight className="w-6 h-6 text-black" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <span className="text-white/80 text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
              Hover für Animation
            </span>
          </div>
        </div>

        {/* Layout badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded border border-white/20">
            {layout}
          </span>
        </div>
      </div>
      
      {/* Info */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-semibold group-hover:text-indigo-300 transition-colors">{name}</h4>
          <p className="text-white/50 text-sm">{industry}</p>
        </div>
        <div className="flex gap-1">
          <div 
            className="w-4 h-4 rounded-full border border-white/20" 
            style={{ backgroundColor: colorScheme.primary }}
          />
          <div 
            className="w-4 h-4 rounded-full border border-white/20" 
            style={{ backgroundColor: colorScheme.secondary }}
          />
          <div 
            className="w-4 h-4 rounded-full border border-white/20" 
            style={{ backgroundColor: colorScheme.accent }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const WebsiteShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 440;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  return (
    <section id="showcase" className="py-32 relative overflow-hidden">
      <GradientOrb className="w-[600px] h-[600px] bg-indigo-500/10 -right-40 top-20" delay={0.2} />
      
      <div className="max-w-7xl mx-auto px-6 mb-12 flex items-end justify-between">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/40 text-sm font-medium uppercase tracking-widest mb-3"
          >
            Live Beispiele
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-semibold text-white tracking-tight"
          >
            Websites, die verkaufen.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mt-3 text-sm"
          >
            Hover über die Vorschau, um die Animation zu sehen. Jedes Layout hat zufällige Farben.
          </motion.p>
        </div>
        
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-3 rounded-full border transition-all ${
              canScrollLeft 
                ? "border-white/20 text-white hover:bg-white/10" 
                : "border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-3 rounded-full border transition-all ${
              canScrollRight 
                ? "border-white/20 text-white hover:bg-white/10" 
                : "border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Gallery */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Spacer for max-width alignment */}
        <div className="shrink-0 w-[calc((100vw-1280px)/2)]" />
        
        {websiteExamples.map((site, i) => (
          <LivePreviewCard
            key={i}
            name={site.name}
            industry={site.industry}
            layout={site.layout}
            delay={i * 0.1}
          />
        ))}

              {/* Layout Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <span className="text-xs text-white/80 font-medium">{site.layout}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1 group-hover:text-white/80 transition-colors">{site.name}</h4>
                <p className="text-white/40 text-sm">{site.industry}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          </motion.div>
        ))}
        
        <div className="shrink-0 w-6" />
      </div>
    </section>
  );
};

// --- Main Page Component ---

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 font-sans">
      <Navbar />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GradientOrb className="w-[800px] h-[800px] bg-indigo-500/10 -left-40 -top-40" delay={0} />
        <GradientOrb className="w-[600px] h-[600px] bg-purple-500/10 right-0 top-1/4" delay={0.3} />
        <GradientOrb className="w-[400px] h-[400px] bg-blue-500/5 left-1/3 bottom-0" delay={0.5} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Hero Section with Animated Gradient Background */}
      <section className="relative min-h-screen">
        {/* Background Animation - Full screen */}
        <div className="absolute inset-0 h-screen">
          <BackgroundGradientAnimation 
            containerClassName="absolute inset-0"
            gradientBackgroundStart="rgb(10, 10, 15)"
            gradientBackgroundEnd="rgb(15, 15, 25)"
            firstColor="59, 130, 246"
            secondColor="147, 51, 234"
            thirdColor="99, 102, 241"
            fourthColor="79, 70, 229"
            fifthColor="139, 92, 246"
            pointerColor="99, 102, 241"
            size="70%"
            interactive={true}
          />
        </div>
        
        {/* Content Layer - Two Column Layout */}
        <div className="relative z-10 flex flex-col justify-center min-h-screen pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left Column - Text */}
              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm mb-8"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Jetzt mit GMB-Integration</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]"
                >
                  <span className="text-white">Websites die sich</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                    selbst erstellen.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-white/60 max-w-lg mb-8 leading-relaxed"
                >
                  Keine Templates. Kein Drag-and-Drop. Nur dein Google My Business Link 
                  und 3 Minuten Zeit. Die KI erledigt den Rest.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/start")}
                    className="bg-white text-black hover:bg-white/90 rounded-full h-14 px-8 text-base font-medium shadow-xl shadow-white/20 group"
                  >
                    Kostenlos starten
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="lg"
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-14 px-8 text-base border border-white/20 backdrop-blur-sm"
                  >
                    <Play className="mr-2 w-4 h-4" />
                    Demo ansehen
                  </Button>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-6 mt-10 pt-6 border-t border-white/10"
                >
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#0a0a0a] flex items-center justify-center text-xs text-white/80">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-white/60 text-sm">4.9 von 5 Sternen</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Animation */}
              <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative lg:pl-4"
              >
                <div className="relative">
                  {/* Glow behind the browser */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-full" />
                  <GhostWebsiteCreation />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: "1,200+", label: "Websites erstellt" },
              { value: "3 Min.", label: "Durchschnittliche Zeit" },
              { value: "85%", label: "SEO-Performance" },
              { value: "39€", label: "Pro Monat" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center md:text-left"
              >
                <div className="text-3xl md:text-4xl font-semibold text-white mb-2 tracking-tight">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Website Showcase Gallery */}
      <WebsiteShowcase />

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4"
            >
              Funktionen
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-semibold text-white tracking-tight"
            >
              Alles was du brauchst.<br />Nichts was du nicht brauchst.
            </motion.h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard 
              icon={Rocket} 
              title="KI-gestützte Erstellung"
              description="Keine leeren Seiten. Unsere KI generiert sofort vollständige Texte, Struktur und Bildvorschläge basierend auf deinem Unternehmen."
              index={0}
            />
            <FeatureCard 
              icon={Clock} 
              title="In 3 Minuten online"
              description="Vom Google Link zur fertigen Website. Keine Wartezeiten, keine technische Einrichtung. Sofort einsatzbereit."
              index={1}
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Perfekt für Mobilgeräte"
              description="Über 70% deiner Kunden kommen mobil. Jede Pageblitz Website ist automatisch für alle Bildschirme optimiert."
              index={2}
            />
            <FeatureCard 
              icon={Search} 
              title="SEO-optimiert"
              description="Technisch sauberer Code, schnelle Ladezeiten und strukturierte Daten. Damit deine Kunden dich auch finden."
              index={3}
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Rechtssicher"
              description="DSGVO-konforme Cookie-Banner, automatisch generierte Impressen und Datenschutzseiten, die auf dem aktuellen Stand gehalten werden."
              index={4}
            />
            <FeatureCard 
              icon={Globe} 
              title="Eigene Domain"
              description="Nutze deine eigene Domain oder eine kostenlose pageblitz.de Subdomain. SSL-Zertifikat inklusive."
              index={5}
            />
          </div>
        </div>
      </section>

      {/* How it Works - Minimalist */}
      <section className="py-32 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4">Der Ablauf</h2>
              <h3 className="text-3xl md:text-4xl font-semibold text-white mb-12 tracking-tight">So einfach geht's.</h3>
              
              <div className="space-y-10">
                {[
                  { step: "01", title: "Link eingeben", desc: "Füge deinen Google My Business Link ein oder starte manuell." },
                  { step: "02", title: "KI analysiert", desc: "Unsere KI liest deine Daten und erstellt passende Inhalte." },
                  { step: "03", title: "Anpassen", desc: "Ändere Texte, Farben und Bilder im Chat-Interface." },
                  { step: "04", title: "Veröffentlichen", desc: "Mit einem Klick ist deine Website live." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="text-sm font-medium text-white/20 pt-1">{item.step}</div>
                    <div>
                      <h4 className="text-white text-lg font-medium mb-2 group-hover:text-white/80 transition-colors">{item.title}</h4>
                      <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 p-2">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop" 
                  alt="Dashboard Interface"
                  className="rounded-2xl opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Clean */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4">Preise</h2>
            <h3 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Ein Preis. Alles inklusive.</h3>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative p-1 rounded-3xl bg-gradient-to-b from-white/20 to-white/5">
              <div className="bg-[#0a0a0a] rounded-[22px] p-10 border border-white/10">
                <div className="text-center mb-10">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium mb-6">
                    Pageblitz Pro
                  </div>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-6xl font-semibold text-white tracking-tight">39€</span>
                    <span className="text-white/40">/Monat</span>
                  </div>
                  <p className="text-white/40 text-sm">Monatlich kündbar. Keine versteckten Kosten.</p>
                </div>

                <div className="space-y-4 mb-10">
                  {[
                    "KI-generierte Website",
                    "Eigene Domain inklusive",
                    "SSL-Zertifikat",
                    "DSGVO-konformer Datenschutz",
                    "Premium Cloud Hosting",
                    "Chat-Support",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-white/40" />
                      <span className="text-white/70 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => navigate("/start")}
                  className="w-full bg-white text-black hover:bg-white/90 rounded-full h-14 text-base font-medium"
                >
                  Jetzt starten
                </Button>
                <p className="text-center text-white/30 text-xs mt-4">14 Tage kostenlos testen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-semibold text-white mb-8 tracking-tight">
            Bereit für deine<br />neue Website?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Überlass die Technik uns. Konzentrier dich auf dein Business.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/start")}
            className="bg-white text-black hover:bg-white/90 rounded-full h-16 px-12 text-lg font-medium shadow-xl shadow-white/10"
          >
            Kostenlos starten
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight">Pageblitz</span>
          </div>
          <div className="text-white/30 text-sm">
            © 2026 Pageblitz. Alle Rechte vorbehalten.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-white/40 hover:text-white/80 transition-colors">Impressum</a>
            <a href="#" className="text-white/40 hover:text-white/80 transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
