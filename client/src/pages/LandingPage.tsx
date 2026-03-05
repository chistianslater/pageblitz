import { useState, useEffect, useRef } from "react";
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
    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="group relative p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-700 overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
        <Icon className="w-6 h-6 text-white/80" />
      </div>
      <h3 className="font-clash text-xl font-bold mb-4 tracking-tight text-white uppercase">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed font-light">{description}</p>
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

// --- Website Showcase Gallery ---

const websiteExamples = [
  { 
    name: "Friseur Bocholt", 
    industry: "Beauty & Wellness",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop",
    layout: "Elegant"
  },
  { 
    name: "Pizzeria Napoli", 
    industry: "Restaurant",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
    layout: "Bold"
  },
  { 
    name: "Bauunternehmen Müller", 
    industry: "Handwerk",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop",
    layout: "Trust"
  },
  { 
    name: "Beauty Lounge", 
    industry: "Beauty",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80&auto=format&fit=crop",
    layout: "Luxury"
  },
  { 
    name: "Café Central", 
    industry: "Gastronomie",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80&auto=format&fit=crop",
    layout: "Warm"
  },
];

const WebsiteShowcase = () => {
  return (
    <section id="showcase" className="py-32 relative overflow-hidden">
      <GradientOrb className="w-[600px] h-[600px] bg-indigo-500/10 -right-40 top-20" delay={0.2} />
      
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
        >
          Selected Works
        </motion.h2>
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-clash text-4xl md:text-6xl font-black text-white tracking-tight uppercase"
        >
          Websites, die <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">überzeugen.</span>
        </motion.h3>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
        {/* Editorial Grid Layout */}
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group cursor-pointer relative"
          >
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-700">
              <img src={websiteExamples[0].image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">{websiteExamples[0].industry}</p>
                <h4 className="font-clash text-2xl md:text-3xl font-bold text-white uppercase">{websiteExamples[0].name}</h4>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-5 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group cursor-pointer relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-700">
              <img src={websiteExamples[1].image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">{websiteExamples[1].industry}</p>
                <h4 className="font-clash text-2xl font-bold text-white uppercase">{websiteExamples[1].name}</h4>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group cursor-pointer relative"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-700">
              <img src={websiteExamples[2].image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">{websiteExamples[2].industry}</p>
                <h4 className="font-clash text-2xl font-bold text-white uppercase">{websiteExamples[2].name}</h4>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-7 md:-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="group cursor-pointer relative"
          >
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-700">
              <img src={websiteExamples[3].image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">{websiteExamples[3].industry}</p>
                <h4 className="font-clash text-2xl md:text-4xl font-bold text-white uppercase">{websiteExamples[3].name}</h4>
              </div>
            </div>
          </motion.div>
        </div>
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 font-satoshi grain-overlay">
      <Navbar />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GradientOrb className="w-[800px] h-[800px] bg-blue-500/10 -left-40 -top-40" delay={0} />
        <GradientOrb className="w-[600px] h-[600px] bg-purple-500/10 right-0 top-1/4" delay={0.3} />
        
        {/* Subtle Mesh Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.15] mix-blend-screen pointer-events-none">
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[100px]" />
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Hero Section with Animated Gradient Background */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column - Text */}
            <div className="lg:col-span-7 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-10"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered Website Creation</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-clash text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.85] uppercase"
              >
                Websites <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 italic">
                  Redefined.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-white/50 max-w-lg mb-10 leading-relaxed font-light"
              >
                No templates. No drag-and-drop. Just your vision powered by advanced AI. 
                Get a production-grade website in less than 3 minutes.
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

      {/* Pricing Section - High End */}
      <section id="pricing" className="py-40 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
            >
              Pricing
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-clash text-4xl md:text-7xl font-black text-white tracking-tight uppercase"
            >
              Simple. <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Powerful.</span>
            </motion.h3>
          </div>

          <div className="max-w-2xl mx-auto relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-[1px] rounded-[3rem] bg-gradient-to-b from-white/20 to-transparent"
            >
              <div className="bg-[#0c0c0c] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32" />
                <div className="text-center mb-16 relative z-10">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
                    Full Access Plan
                  </div>
                  <div className="flex items-baseline justify-center gap-4 mb-6">
                    <span className="font-clash text-8xl md:text-9xl font-black text-white tracking-tighter">39€</span>
                    <span className="text-white/40 font-clash text-2xl uppercase tracking-widest italic">/mo</span>
                  </div>
                  <p className="text-white/40 text-base font-light max-w-sm mx-auto leading-relaxed">Cancel anytime. All features included. No hidden fees.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 mb-16 relative z-10">
                  {[
                    "AI Website Generation",
                    "Custom Domain Link",
                    "Enterprise SSL",
                    "GDPR Compliant",
                    "Ultra-Fast Hosting",
                    "24/7 Priority Support",
                  ].map((feature, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <span className="text-white/70 text-sm font-light tracking-wide">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => navigate("/start")}
                    className="w-full bg-white text-black hover:bg-neutral-200 rounded-full h-20 text-lg font-black uppercase tracking-[0.2em] shadow-[0_20px_60px_-10px_rgba(255,255,255,0.2)]"
                  >
                    Start Creating Now
                  </Button>
                </motion.div>
                <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] mt-8">Risk-free 14-day trial</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative overflow-hidden bg-white/[0.01]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="font-clash text-5xl md:text-8xl lg:text-9xl font-black text-white mb-12 tracking-tight uppercase leading-[0.85]"
          >
            Ready to <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Evolve?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/40 mb-16 max-w-xl mx-auto font-light leading-relaxed"
          >
            Don't settle for the ordinary. Give your brand the high-end digital presence it deserves.
          </motion.p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg"
              onClick={() => navigate("/start")}
              className="bg-white text-black hover:bg-neutral-200 rounded-full h-24 px-16 text-xl font-black uppercase tracking-[0.3em] shadow-[0_30px_100px_-15px_rgba(255,255,255,0.3)]"
            >
              Get Started <ArrowRight className="ml-4 w-6 h-6" />
            </Button>
          </motion.div>
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
