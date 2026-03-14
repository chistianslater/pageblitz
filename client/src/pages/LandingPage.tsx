import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView, useMotionValue } from "framer-motion";
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
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import {
  BoldLayoutV2, ElegantLayoutV2, CleanLayoutV2, CraftLayoutV2,
  DynamicLayoutV2, FreshLayoutV2, LuxuryLayoutV2, ModernLayoutV2,
  NaturalLayoutV2, PremiumLayoutV2, EdenLayoutV2, ApexLayoutV2,
} from "@/components/layouts/PremiumLayoutsV2";
import { PREDEFINED_COLOR_SCHEMES } from "@shared/layoutConfig";
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

const Navbar = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => {
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
            ? `${isDark ? "bg-[#0a0a0a]/80" : "bg-white/90"} backdrop-blur-xl border-b border-white/5 py-4`
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
            {/* Light/Dark toggle */}
            <button
              onClick={onToggle}
              title={isDark ? "Light Mode" : "Dark Mode"}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 text-white/60 hover:text-white transition-all duration-300"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Login icon */}
            <button
              onClick={() => navigate("/login")}
              title="Anmelden"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 text-white/60 hover:text-white transition-all duration-300"
            >
              <LogIn className="w-4 h-4" />
            </button>
            <Button
              onClick={() => navigate("/start")}
              className={`btn-shimmer rounded-full px-5 h-10 text-sm font-medium transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10" : "bg-violet-950 text-white hover:bg-violet-900 shadow-lg shadow-violet-950/25"}`}
            >
              Website erstellen
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            {/* Mobile theme toggle */}
            <button
              onClick={onToggle}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 text-white/60 transition-all duration-300"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 ${isDark ? "bg-[#0a0a0a]/95" : "bg-white/97"} backdrop-blur-xl pt-24 px-6 md:hidden`}
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

const FAQ_ITEMS = [
  {
    q: "Brauche ich technische Kenntnisse?",
    a: "Nein. Pageblitz ist für Menschen ohne IT-Kenntnisse gemacht. Du beantwortest ein paar Fragen über dein Unternehmen – den Rest erledigt die KI.",
  },
  {
    q: "Was passiert nach den 7 Tagen?",
    a: "Nach dem kostenlosen Testzeitraum kostet Pageblitz 19,90 €/Monat bei jährlicher Zahlung oder 24,90 €/Monat bei monatlicher Zahlung. Du wirst vorher per E-Mail erinnert. Wenn du nicht weiter machen möchtest, kannst du einfach kündigen.",
  },
  {
    q: "Kann ich meine eigene Domain verwenden?",
    a: "Ja. Du kannst deine bestehende Domain in wenigen Klicks verbinden. Alternativ bekommst du eine kostenlose Subdomain (deinname.pageblitz.de).",
  },
  {
    q: "Kann ich die Texte und Bilder später ändern?",
    a: "Ja, jederzeit. Schreib einfach im Chat was du ändern möchtest – z.B. \"Ändere die Headline auf...' oder 'Füge diese Leistung hinzu'. Keine Programmierkenntnisse nötig.",
  },
  {
    q: "Wie sieht meine Website aus?",
    a: "Pageblitz erstellt eine moderne, mobiloptimierte Website passend zu deiner Branche. Du kannst die Farben, Schriften und Layouts anpassen. Scroll nach oben und sieh dir die Beispiele an.",
  },
  {
    q: "Wie läuft die Kündigung ab?",
    a: "Ganz einfach: Schreibe uns eine E-Mail oder kündige direkt in deinem Account. Keine Mindestlaufzeiten, keine Kündigungsgebühren.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="py-24 border-y border-white/5">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4">FAQ</h2>
          <h3 className="text-3xl font-semibold text-white tracking-tight">Häufige Fragen</h3>
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-white font-medium text-sm">{item.q}</span>
                {openIndex === i
                  ? <ChevronUp className="w-4 h-4 text-white/40 shrink-0 ml-4" />
                  : <ChevronDown className="w-4 h-4 text-white/40 shrink-0 ml-4" />
                }
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-white/50 text-sm leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Stats with Count-Up ---

interface StatDef {
  target: number | null;
  format?: (n: number) => string;
  display?: string;
  label: string;
}
const STATS: StatDef[] = [
  {
    target: 1200,
    format: (n) => n >= 1000 ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, "0")}+` : `${n}+`,
    label: "Websites erstellt",
  },
  { target: null, display: "3 Min.", label: "Durchschnittliche Zeit" },
  { target: 85, format: (n) => `${n}%`, label: "SEO-Performance" },
  { target: null, display: "19,90€", label: "Pro Monat" },
];

const StatItem = ({ stat, index }: { stat: StatDef; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || stat.target === null) return;
    const duration = 1600;
    const startTime = performance.now();
    const target = stat.target;
    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress); // easeOutExpo
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(update);
      else setCount(target);
    };
    requestAnimationFrame(update);
  }, [isInView]);

  const displayValue =
    stat.target !== null ? stat.format!(count) : stat.display!;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center md:text-left"
    >
      <div className="text-3xl md:text-4xl font-semibold text-white mb-2 tracking-tight tabular-nums">
        {displayValue}
      </div>
      <div className="text-white/40 text-sm">{stat.label}</div>
    </motion.div>
  );
};

// --- Feature Cards with Mouse-Tracking 3D Tilt ---

const FeatureCard = ({ icon: Icon, title, description, index, isDark }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-80, 80], [5, -5]);
  const rotateY = useTransform(mouseX, [-80, 80], [-5, 5]);
  const springCfg = { stiffness: 180, damping: 22 };
  const rotXSpring = useSpring(rotateX, springCfg);
  const rotYSpring = useSpring(rotateY, springCfg);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX: rotXSpring, rotateY: rotYSpring, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative p-8 rounded-3xl border cursor-default transition-all duration-500 ${
        isDark
          ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]"
          : "bg-white border-gray-100 hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/60"
      }`}
    >
      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? "bg-gradient-to-b from-white/[0.02] to-transparent" : "bg-gradient-to-b from-violet-50/40 to-transparent"}`} />
      <div className="relative z-10">
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${
          isDark
            ? "bg-white/5 border-white/10"
            : "bg-violet-100 border-violet-200"
        }`}>
          <Icon className={`w-5 h-5 ${isDark ? "text-white/70" : "text-violet-600"}`} />
        </div>
        <h3 className={`text-lg font-semibold mb-3 tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
        <p className={`text-sm leading-relaxed transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-500"}`}>{description}</p>
      </div>
    </motion.div>
  );
};

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
  Eden: EdenLayoutV2,
  Apex: ApexLayoutV2,
};

// Layout configurations matching the layout-preview pages exactly
const LAYOUT_CONFIG: Record<string, { 
  data: any; 
  heroImage: string; 
  scheme: string;
  label: string;
}> = {
  Bold: {
    label: "Bau & Handwerk",
    scheme: "trust",
    heroImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&fit=crop",
    data: {
      businessName: "Müller Bau GmbH",
      tagline: "Solide gebaut – seit 1987",
      googleRating: 4.8,
      googleReviewCount: 127,
      sections: [
        { type: "hero", headline: "Ihr Spezialist für Hochbau & Sanierung", subheadline: "Lange Wartezeiten? Nicht bei uns. Wir planen, bauen und liefern – termingerecht und zum Festpreis.", ctaText: "Angebot anfragen" },
        { type: "services", headline: "Unsere Leistungen", items: [
          { title: "Hochbau & Rohbau", description: "Von der Bodenplatte bis zum Dachstuhl – wir realisieren Ihr Bauprojekt mit modernster Technik und jahrzehntelanger Erfahrung." },
          { title: "Sanierung & Umbau", description: "Wir modernisieren Altbauten und schaffen neuen Wohnraum mit minimalem Aufwand für Sie als Bauherr." },
          { title: "Tiefbau & Erdarbeiten", description: "Fundamente, Kanalarbeiten, Entwässerung – unser Fuhrpark ist für jede Bautiefe ausgestattet." },
        ]},
        { type: "process", headline: "In 3 Schritten zum Festpreis", items: [
          { step: "1", title: "Beratungsgespräch", description: "Kostenloser Termin vor Ort – wir besichtigen gemeinsam und nehmen alle Maße auf." },
          { step: "2", title: "Detailofferte", description: "Sie erhalten ein transparentes Festpreisangebot ohne versteckte Kosten innerhalb von 48 Stunden." },
          { step: "3", title: "Baubeginn", description: "Nach Ihrer Freigabe starten wir zum vereinbarten Termin – pünktlich und professionell." },
        ]},
        { type: "about", headline: "35 Jahre Erfahrung im Hochbau", content: "Seit 1987 bauen wir für private Bauherren und gewerbliche Kunden im Raum München. Über 800 erfolgreich abgeschlossene Projekte sprechen für sich." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Industriestraße 14, 80339 München" },
          { icon: "Phone", description: "+49 89 123 456 78" },
          { icon: "Clock", description: "Mo–Fr: 07:00–17:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Das sagen unsere Kunden", items: [
          { author: "Thomas K.", rating: 5, description: "Absolut professionelle Arbeit. Unser Anbau wurde termingerecht und zum vereinbarten Preis fertiggestellt." },
          { author: "Sabine M.", rating: 5, description: "Von der Planung bis zur Übergabe – alles reibungslos. Sehr empfehlenswert!" },
          { author: "Georg F.", rating: 5, description: "Die Sanierung unseres Altbaus war eine große Aufgabe. Müller Bau hat sie perfekt gemeistert." },
        ]},
      ],
    },
  },
  Elegant: {
    label: "Beauty & Wellness",
    scheme: "fresh",
    heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80&fit=crop",
    data: {
      businessName: "Studio Belle",
      tagline: "Schönheit, die bewegt",
      googleRating: 4.9,
      googleReviewCount: 156,
      sections: [
        { type: "hero", headline: "Schönheit, die bewegt", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Termin buchen" },
        { type: "services", headline: "Unsere Services", items: [
          { title: "Haarpflege & Styling", description: "Von der klassischen Pflege bis zum modernen Statement-Look – wir bringen Ihren Stil zum Strahlen." },
          { title: "Kosmetik & Gesichtspflege", description: "Professionelle Gesichtsbehandlungen mit hochwertigen Produkten für jugendlich frische Haut." },
          { title: "Nägel & Maniküre", description: "Gepflegte Hände und perfekte Nägel – für jeden Anlass und jeden Stil." },
        ]},
        { type: "process", headline: "So funktioniert's", items: [
          { step: "1", title: "Termin buchen", description: "Online oder telefonisch – wir finden den passenden Termin für Sie." },
          { step: "2", title: "Beratung", description: "Wir besprechen Ihre Wünsche und erstellen einen individuellen Plan." },
          { step: "3", title: "Genießen", description: "Entspannen Sie sich bei unseren professionellen Behandlungen." },
        ]},
        { type: "about", headline: "Unser Konzept", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 09:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Kundenstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Clean: {
    label: "Medizin & Praxis",
    scheme: "natural",
    heroImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80&fit=crop",
    data: {
      businessName: "Dr. med. Lena Hoffmann",
      tagline: "Ihre Gesundheit in guten Händen",
      googleRating: 4.8,
      googleReviewCount: 94,
      sections: [
        { type: "hero", headline: "Ihre Gesundheit in guten Händen", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Termin vereinbaren" },
        { type: "services", headline: "Leistungen", items: [
          { title: "Allgemeinmedizin", description: "Umfassende Grundversorgung für die ganze Familie – von der Vorsorge bis zur akuten Behandlung." },
          { title: "Check-up & Vorsorge", description: "Regelmäßige Gesundheitschecks erkennen Risiken früh und sichern Ihre Lebensqualität langfristig." },
          { title: "Hausbesuche", description: "Für Patienten, die nicht mobil sind – wir kommen zu Ihnen nach Hause." },
        ]},
        { type: "process", headline: "Ablauf", items: [
          { step: "1", title: "Termin vereinbaren", description: "Online oder telefonisch – wir finden einen passenden Termin." },
          { step: "2", title: "Untersuchung", description: "Umfassende Diagnostik und persönliche Beratung." },
          { step: "3", title: "Behandlung", description: "Individuelle Therapie nach neuesten medizinischen Standards." },
        ]},
        { type: "about", headline: "Über die Praxis", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 09:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Patientenstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Craft: {
    label: "Tischler & Handwerk",
    scheme: "craft",
    heroImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&fit=crop",
    data: {
      businessName: "Tischler Grünwald",
      tagline: "Handwerk mit Seele",
      googleRating: 4.9,
      googleReviewCount: 112,
      sections: [
        { type: "hero", headline: "Handwerk mit Seele", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Angebot anfragen" },
        { type: "services", headline: "Leistungen", items: [
          { title: "Maßmöbel & Einbauküchen", description: "Jedes Möbelstück wird individuell für Sie geplant und gefertigt – Handarbeit vom Feinsten." },
          { title: "Treppen & Böden", description: "Holztreppen und Parkettböden die Generationen überdauern. Verlegt mit Präzision und Leidenschaft." },
          { title: "Renovierung & Restaurierung", description: "Alten Möbeln neues Leben einhauchen – wir restaurieren mit Respekt vor dem Original." },
        ]},
        { type: "process", headline: "So arbeiten wir", items: [
          { step: "1", title: "Beratung", description: "Wir besprechen Ihre Ideen und erstellen eine detaillierte Planung." },
          { step: "2", title: "Fertigung", description: "In unserer Werkstatt entsteht Ihr Maßwerk mit traditionellen Techniken." },
          { step: "3", title: "Montage", description: "Fachgerechte Installation bei Ihnen vor Ort – sauber und präzise." },
        ]},
        { type: "about", headline: "Unsere Werkstatt", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 09:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Kundenstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Dynamic: {
    label: "Fitness & Sport",
    scheme: "dynamic",
    heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&fit=crop",
    data: {
      businessName: "Iron Forge Gym",
      tagline: "Stärker werden. Jeden Tag.",
      googleRating: 4.7,
      googleReviewCount: 203,
      sections: [
        { type: "hero", headline: "Stärker werden. Jeden Tag.", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Training buchen" },
        { type: "services", headline: "Angebote", items: [
          { title: "Personal Training", description: "1:1-Betreuung mit unserem erfahrenen Trainer-Team – individuell auf Ihre Ziele abgestimmt." },
          { title: "Gruppentraining", description: "Gemeinsam stärker: HIIT, CrossFit, Boxen und Yoga in energiegeladener Gruppenatmosphäre." },
          { title: "Ernährungsberatung", description: "Die Basis für Ihren Erfolg: professionelle Ernährungspläne, die wirklich funktionieren." },
        ]},
        { type: "process", headline: "So starten Sie", items: [
          { step: "1", title: "Probetraining", description: "Vereinbaren Sie ein kostenloses Probetraining und lernen Sie uns kennen." },
          { step: "2", title: "Ziele definieren", description: "Gemeinsam erstellen wir einen individuellen Plan für Ihren Erfolg." },
          { step: "3", title: "Durchstarten", description: "Beginnen Sie Ihre Transformation mit professioneller Unterstützung." },
        ]},
        { type: "about", headline: "Unsere Mission", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 06:00–23:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Mitgliederstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Fresh: {
    label: "Café & Gastronomie",
    scheme: "warm",
    heroImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80&fit=crop",
    data: {
      businessName: "Café Morgenrot",
      tagline: "Frisch. Regional. Mit Liebe.",
      googleRating: 4.8,
      googleReviewCount: 178,
      sections: [
        { type: "hero", headline: "Frisch. Regional. Mit Liebe.", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Reservieren" },
        { type: "services", headline: "Angebot", items: [
          { title: "Frühstück & Brunch", description: "Hausgemachte Aufschnitte, regionale Bio-Eier und unser legendäres Sauerteigbrot – täglich ab 8 Uhr." },
          { title: "Mittagstisch", description: "Täglich wechselnde Gerichte mit saisonalen Zutaten direkt von Bauern aus der Region." },
          { title: "Catering & Events", description: "Für Ihre Veranstaltung liefern wir – von der Geburtstagsfeier bis zur Firmenveranstaltung." },
        ]},
        { type: "process", headline: "So funktioniert's", items: [
          { step: "1", title: "Reservieren", description: "Rufen Sie uns an oder reservieren Sie online – wir halten Ihren Tisch bereit." },
          { step: "2", title: "Genießen", description: "Entspannen Sie sich bei hausgemachten Köstlichkeiten in gemütlicher Atmosphäre." },
          { step: "3", title: "Wiederkommen", description: "Lassen Sie sich von unserer Qualität überzeugen und werden Sie Stammgast." },
        ]},
        { type: "about", headline: "Unsere Philosophie", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–So: 08:00–20:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Gästestimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Luxury: {
    label: "Premium & Exklusiv",
    scheme: "luxury",
    heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80&fit=crop",
    data: {
      businessName: "Galerie Noir",
      tagline: "Exzellenz ohne Kompromisse",
      googleRating: 4.9,
      googleReviewCount: 67,
      sections: [
        { type: "hero", headline: "Exzellenz ohne Kompromisse", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Termin vereinbaren" },
        { type: "services", headline: "Services", items: [
          { title: "Premium Beratung", description: "Diskrete Einzelberatung auf Einladung – für Kunden, die das Beste erwarten." },
          { title: "Exklusive Objekte", description: "Kuratierte Auswahl seltener Stücke aus den renommiertesten Häusern Europas." },
          { title: "Private Events", description: "Exklusive Abendveranstaltungen und Präsentationen für ausgewählte Gäste." },
        ]},
        { type: "process", headline: "So funktioniert's", items: [
          { step: "1", title: "Anfrage", description: "Rufen Sie uns an oder senden Sie eine Nachricht – wir melden uns innerhalb von 24 Stunden." },
          { step: "2", title: "Beratung", description: "Wir analysieren Ihre Situation und erarbeiten gemeinsam die optimale Lösung für Sie." },
          { step: "3", title: "Ergebnis", description: "Lehnen Sie sich zurück – wir kümmern uns um alles und informieren Sie zu jedem Schritt." },
        ]},
        { type: "about", headline: "Über uns", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 10:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Kundenstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Modern: {
    label: "IT & Agentur",
    scheme: "monochrome",
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&fit=crop",
    data: {
      businessName: "Pixel & Code Agency",
      tagline: "Digitale Lösungen die wirken",
      googleRating: 4.8,
      googleReviewCount: 89,
      sections: [
        { type: "hero", headline: "Digitale Lösungen die wirken", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Projekt starten" },
        { type: "services", headline: "Services", items: [
          { title: "Webdesign & Entwicklung", description: "Individuelle Websites und Web-Apps, die Ihre Marke perfekt repräsentieren und konvertieren." },
          { title: "SEO & Performance", description: "Mehr Sichtbarkeit, mehr Besucher, mehr Kunden – datengetriebene Strategien mit messbaren Ergebnissen." },
          { title: "Branding & Design", description: "Von der Visitenkarte bis zur kompletten Corporate Identity – wir schaffen Identitäten, die in Erinnerung bleiben." },
        ]},
        { type: "process", headline: "So arbeiten wir", items: [
          { step: "1", title: "Kennenlernen", description: "Wir besprechen Ihre Ziele und Anforderungen in einem unverbindlichen Erstgespräch." },
          { step: "2", title: "Konzeption", description: "Wir entwickeln eine maßgeschneiderte Strategie und präsentieren Ihnen unser Konzept." },
          { step: "3", title: "Umsetzung", description: "Agile Entwicklung mit regelmäßigen Updates – bis zum perfekten Ergebnis." },
        ]},
        { type: "about", headline: "Über die Agentur", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 09:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Kundenstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Natural: {
    label: "Natur & Bio",
    scheme: "elegant",
    heroImage: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&q=80&fit=crop",
    data: {
      businessName: "Naturheilpraxis Waldquelle",
      tagline: "Im Einklang mit der Natur",
      googleRating: 4.8,
      googleReviewCount: 134,
      sections: [
        { type: "hero", headline: "Im Einklang mit der Natur", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Beratung anfragen" },
        { type: "services", headline: "Angebote", items: [
          { title: "Naturheilkunde", description: "Ganzheitliche Therapieansätze, die den Menschen in seiner Einheit aus Körper, Geist und Seele sehen." },
          { title: "Kräuterkunde", description: "Heilpflanzen in der Behandlung: traditionelles Wissen, modern angewendet." },
          { title: "Entspannung", description: "Shiatsu, Aromatherapie und Meditation für innere Balance und nachhaltiges Wohlbefinden." },
        ]},
        { type: "process", headline: "So funktioniert's", items: [
          { step: "1", title: "Anfrage", description: "Rufen Sie uns an oder senden Sie eine Nachricht – wir melden uns innerhalb von 24 Stunden." },
          { step: "2", title: "Beratung", description: "Wir analysieren Ihre Situation und erarbeiten gemeinsam die optimale Lösung für Sie." },
          { step: "3", title: "Ergebnis", description: "Lehnen Sie sich zurück – wir kümmern uns um alles und informieren Sie zu jedem Schritt." },
        ]},
        { type: "about", headline: "Unsere Philosophie", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 09:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Kundenstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Premium: {
    label: "Business & Consulting",
    scheme: "vibrant",
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&fit=crop",
    data: {
      businessName: "Consulting Partners GmbH",
      tagline: "Strategie trifft Wirkung",
      googleRating: 4.9,
      googleReviewCount: 45,
      sections: [
        { type: "hero", headline: "Strategie trifft Wirkung", subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: "Kontakt aufnehmen" },
        { type: "services", headline: "Services", items: [
          { title: "Unternehmensberatung", description: "Strategische Weiterentwicklung, Prozessoptimierung und Change Management für nachhaltiges Wachstum." },
          { title: "M&A Advisory", description: "Diskreter Begleiter bei Unternehmenstransaktionen – von der Due Diligence bis zum Closing." },
          { title: "Executive Coaching", description: "Individuelle Führungskräfteentwicklung für Top-Manager und Geschäftsführer." },
        ]},
        { type: "process", headline: "So funktioniert's", items: [
          { step: "1", title: "Anfrage", description: "Rufen Sie uns an oder senden Sie eine Nachricht – wir melden uns innerhalb von 24 Stunden." },
          { step: "2", title: "Beratung", description: "Wir analysieren Ihre Situation und erarbeiten gemeinsam die optimale Lösung für Sie." },
          { step: "3", title: "Ergebnis", description: "Lehnen Sie sich zurück – wir kümmern uns um alles und informieren Sie zu jedem Schritt." },
        ]},
        { type: "about", headline: "Unsere Expertise", content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
        { type: "contact", headline: "Kontakt", items: [
          { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
          { icon: "Phone", description: "+49 89 987 654 32" },
          { icon: "Clock", description: "Mo–Fr: 09:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Kundenstimmen", items: [
          { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
          { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
          { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
        ]},
      ],
    },
  },
  Eden: {
    label: "Coaching & Therapie",
    scheme: "eden",
    heroImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1600&q=80&fit=crop",
    data: {
      businessName: "Laura Hoffmann Coaching",
      tagline: "Dein Weg zu mehr Leichtigkeit",
      googleRating: 4.9,
      googleReviewCount: 84,
      businessCategory: "Life Coaching",
      sections: [
        { type: "hero", headline: "Endlich ankommen – in dir selbst", subheadline: "Ich begleite dich auf dem Weg zu mehr Klarheit, innerer Stärke und einem Leben, das sich wirklich gut anfühlt.", ctaText: "Erstgespräch buchen" },
        { type: "services", headline: "Meine Angebote", items: [
          { title: "1:1 Coaching", description: "Individuelle Begleitung in persönlichen Sitzungen – für nachhaltige Veränderung auf allen Ebenen." },
          { title: "Online-Kurse", description: "Strukturierte Programme, die du in deinem eigenen Tempo durcharbeiten kannst – flexibel und tiefgreifend." },
          { title: "Gruppenworkshops", description: "Gemeinsam wachsen in einem sicheren Rahmen mit gleichgesinnten Menschen." },
        ]},
        { type: "about", headline: "Über mich", content: "Ich bin Laura, zertifizierter Life Coach mit über 10 Jahren Erfahrung. Mein Ansatz verbindet systemisches Coaching mit achtsamkeitsbasierten Methoden – für echte, spürbare Veränderung." },
        { type: "contact", items: [
          { icon: "MapPin", description: "München, Bayern" },
          { icon: "Mail", description: "hello@laurahoffmann.de" },
          { icon: "Phone", description: "+49 89 123 456 78" },
        ]},
        { type: "testimonials", headline: "Stimmen meiner Klienten", items: [
          { author: "Sophie K.", rating: 5, description: "Laura hat mir geholfen, endlich loszulassen. Ich fühle mich freier als je zuvor. Absolut empfehlenswert!" },
          { author: "Markus T.", rating: 5, description: "Professionell, einfühlsam und effektiv. In nur 3 Monaten haben sich mein Leben und mein Mindset grundlegend verändert." },
          { author: "Jana M.", rating: 5, description: "Die beste Investition, die ich je in mich gemacht habe. Danke, Laura!" },
        ]},
      ],
    },
  },
  Apex: {
    label: "Unternehmensberatung",
    scheme: "apex",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop",
    data: {
      businessName: "Brenner & Partner",
      tagline: "Strategie. Präzision. Ergebnis.",
      googleRating: 4.8,
      googleReviewCount: 56,
      businessCategory: "Unternehmensberatung",
      sections: [
        { type: "hero", headline: "Komplexe Probleme. Klare Lösungen.", subheadline: "Wir beraten mittelständische Unternehmen bei strategischen Transformationen, Prozessoptimierungen und digitalem Wandel – messbar, nachhaltig, präzise.", ctaText: "Beratung anfragen" },
        { type: "services", headline: "Leistungen", items: [
          { title: "Strategieberatung", description: "Von der Marktanalyse bis zur Umsetzung: Wir entwickeln mit Ihnen eine Strategie, die trägt." },
          { title: "Prozessoptimierung", description: "Wir identifizieren Ineffizienzen und schaffen schlanke, skalierbare Abläufe für nachhaltiges Wachstum." },
          { title: "Digitale Transformation", description: "Technologie als Hebel – wir begleiten Ihr Unternehmen sicher durch den digitalen Wandel." },
        ]},
        { type: "about", headline: "Über uns", content: "Brenner & Partner steht seit 2008 für analytische Präzision und strategische Klarheit. Unser Team aus 12 Senior-Beratern hat über 200 Projekte in 15 Branchen erfolgreich abgeschlossen." },
        { type: "contact", items: [
          { icon: "MapPin", description: "Frankfurt am Main" },
          { icon: "Mail", description: "kontakt@brenner-partner.de" },
          { icon: "Phone", description: "+49 69 876 543 21" },
          { icon: "Clock", description: "Mo–Fr: 08:00–18:00 Uhr" },
        ]},
        { type: "testimonials", headline: "Referenzen", items: [
          { author: "CFO, Mittelstand AG", rating: 5, description: "Die Zusammenarbeit mit Brenner & Partner hat unsere Rentabilität in 18 Monaten um 22 % gesteigert." },
          { author: "CEO, Tech GmbH", rating: 5, description: "Klare Analyse, umsetzbare Empfehlungen. Kein Berater-Blabla – nur Ergebnisse." },
          { author: "GF, Produktion KG", rating: 5, description: "Höchste Professionalität und tiefes Branchenverständnis. Uneingeschränkte Empfehlung." },
        ]},
      ],
    },
  },
};

// Extended color schemes with all 10 unique palettes
const EXTENDED_COLOR_SCHEMES: Record<string, ColorScheme> = {
  // 1. Preußisch Blau - Bold (Bau)
  trust: {
    primary: "#1B3D6F",
    secondary: "#0D2140",
    accent: "#C9A43A",
    background: "#ffffff",
    surface: "#F7F9FC",
    text: "#0D1B2A",
    textLight: "#64748b",
    onPrimary: "#ffffff",
  },
  // 2. Terracotta - Fresh (Gastronomie)
  warm: {
    primary: "#B44D1F",
    secondary: "#3D1A0A",
    accent: "#C4956A",
    background: "#FEFCFA",
    surface: "#F5EDE0",
    text: "#1E1208",
    textLight: "#7A6A56",
    onPrimary: "#ffffff",
  },
  // 3. Champagner - Elegant (Beauty)
  elegant: {
    primary: "#967B5C",
    secondary: "#1A1511",
    accent: "#F0EBE3",
    background: "#FDFBF8",
    surface: "#F7F3EE",
    text: "#1A1511",
    textLight: "#7A7065",
    onPrimary: "#ffffff",
  },
  // 4. Grafitmodern - Modern (IT) - DARK
  modern: {
    primary: "#bef264",
    secondary: "#0a0a0a",
    accent: "#ffffff",
    background: "#050505",
    surface: "#121212",
    text: "#ffffff",
    textLight: "rgba(255,255,255,0.6)",
    onPrimary: "#0a0a0a",
  },
  // 5. Schwarz-Weiß - Premium (Business)
  monochrome: {
    primary: "#1a1a1a",
    secondary: "#000000",
    accent: "#666666",
    background: "#ffffff",
    surface: "#f5f5f5",
    text: "#1a1a1a",
    textLight: "#6b7280",
    onPrimary: "#ffffff",
  },
  // 6. Deep Purple - Dynamic (Fitness)
  dynamic: {
    primary: "#4c1d95",
    secondary: "#1e1b4b",
    accent: "#c4b5a0",
    background: "#0f0a1a",
    surface: "#1e1b4b",
    text: "#fafafa",
    textLight: "rgba(250,250,250,0.6)",
    onPrimary: "#ffffff",
  },
  // 7. Slate Blue - Clean (Medizin)
  clean: {
    primary: "#475569",
    secondary: "#f1f5f9",
    accent: "#be7c7c",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textLight: "#64748b",
    onPrimary: "#ffffff",
  },
  // 8. Dark Charcoal - Luxury (Premium)
  luxury: {
    primary: "#1c1917",
    secondary: "#292524",
    accent: "#b87333",
    background: "#1c1917",
    surface: "#292524",
    text: "#fafaf9",
    textLight: "rgba(250,250,249,0.6)",
    onPrimary: "#ffffff",
  },
  // 9. Stone/Warm - Craft (Handwerk)
  craft: {
    primary: "#78716c",
    secondary: "#292524",
    accent: "#a0522d",
    background: "#fafaf9",
    surface: "#f5f5f4",
    text: "#292524",
    textLight: "#78716c",
    onPrimary: "#ffffff",
  },
  // 10. Blue-gray - Natural (Natur)
  natural: {
    primary: "#64748b",
    secondary: "#f8fafc",
    accent: "#d4a574",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#334155",
    textLight: "#64748b",
    onPrimary: "#ffffff",
  },
  // 11. Deep Red - Premium (Business)
  vibrant: {
    primary: "#9f1239",
    secondary: "#881337",
    accent: "#fda4af",
    background: "#fff1f2",
    surface: "#ffe4e6",
    text: "#881337",
    textLight: "#9f1239",
    onPrimary: "#ffffff",
  },
  // 12. Warm Sage - Eden (Coaching)
  eden: {
    primary: "#6B7D5E",
    secondary: "#3D4A35",
    accent: "#C4956A",
    background: "#FDFBF7",
    surface: "#F5F0E8",
    text: "#2A2820",
    textLight: "#7A7465",
    onPrimary: "#ffffff",
  },
  // 13. Navy Precision - Apex (Consulting)
  apex: {
    primary: "#0F1E3C",
    secondary: "#1B2D50",
    accent: "#C9A43A",
    background: "#ffffff",
    surface: "#F7F9FC",
    text: "#0F1E3C",
    textLight: "#4A5568",
    onPrimary: "#ffffff",
  },
};

// Get color scheme from extended list
const getColorScheme = (schemeId: string): ColorScheme => {
  return EXTENDED_COLOR_SCHEMES[schemeId] || EXTENDED_COLOR_SCHEMES["trust"];
};

// All available layouts (12 total – incl. EDEN & APEX)
const ALL_WEBSITE_EXAMPLES: Array<{ layout: keyof typeof LAYOUT_COMPONENTS }> = [
  { layout: "Bold" },
  { layout: "Elegant" },
  { layout: "Clean" },
  { layout: "Craft" },
  { layout: "Dynamic" },
  { layout: "Fresh" },
  { layout: "Luxury" },
  { layout: "Modern" },
  { layout: "Natural" },
  { layout: "Premium" },
  { layout: "Eden" },
  { layout: "Apex" },
];

/** Pick 5 random layouts from the full pool (stable per page-load) */
function pickRandom5(): Array<{ layout: keyof typeof LAYOUT_COMPONENTS }> {
  const shuffled = [...ALL_WEBSITE_EXAMPLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// Live Preview Component with Autoscroll
interface LivePreviewCardProps {
  layout: keyof typeof LAYOUT_COMPONENTS;
  delay?: number;
}

const LivePreviewCard = ({ layout, delay = 0 }: LivePreviewCardProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const config = LAYOUT_CONFIG[layout];
  const colorScheme = getColorScheme(config.scheme);
  const [isHovering, setIsHovering] = useState(false);
  const scrollPositionRef = useRef(0);
  const animationRef = useRef<number>();

  const LayoutComponent = LAYOUT_COMPONENTS[layout] || PremiumLayoutV2;

  // Smooth scroll back to top when mouse leaves
  const scrollToTop = useCallback(() => {
    if (!previewRef.current) return;
    
    const element = previewRef.current;
    const startPosition = element.scrollTop;
    const duration = 800; // ms
    const startTime = performance.now();
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutCubic(progress);
      
      element.scrollTop = startPosition * (1 - easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        scrollPositionRef.current = 0;
      }
    };
    
    requestAnimationFrame(animateScroll);
  }, []);

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
      // Scroll back to top when mouse leaves
      scrollToTop();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering, startAutoScroll, scrollToTop]);

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
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white mb-4 border border-white/10 group-hover:border-white/30 transition-all shadow-2xl">
        {/* Live Website Preview - scaled to fit */}
        <div 
          ref={previewRef}
          className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{ scrollBehavior: "auto" }}
        >
          <div 
            className="origin-top-left"
            style={{ 
              transform: "scale(0.28)", 
              transformOrigin: "top left",
              width: "357%",
              maxWidth: "357%",
              height: "auto",
              minHeight: "357%",
              overflowX: "hidden",
            }}
          >
            <LayoutComponent 
              websiteData={config.data} 
              cs={colorScheme}
              heroImageUrl={config.heroImage}
              isLoading={false}
            />
          </div>
        </div>
        
        {/* Gradient overlay for smooth fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

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
          <h4 className="text-white font-semibold group-hover:text-indigo-300 transition-colors">{config.data.businessName}</h4>
          <p className="text-white/50 text-sm">{config.label}</p>
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
  // Stable random selection of 5 layouts per page-load
  const [websiteExamples] = useState(() => pickRandom5());

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
            layout={site.layout}
            delay={i * 0.1}
          />
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
  const [billingYearly, setBillingYearly] = useState(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lp-theme") !== "light";
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("lp-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div
      className="lp-root min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 font-sans"
      data-lp-theme={isDark ? "dark" : "light"}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-400 z-[200] origin-left pointer-events-none"
        style={{ scaleX: smoothProgress }}
      />

      <Navbar isDark={isDark} onToggle={() => setIsDark((v) => !v)} />

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
        {/* Background Animation - Cross-fades between dark and light */}
        <div className="absolute inset-0 h-screen">
          {/* Dark animated gradient */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
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
          {/* Light gradient for light mode */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isDark ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 w-[400px] h-[400px] bg-indigo-300/15 rounded-full blur-[80px] pointer-events-none" />
          </div>
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border text-sm mb-8 transition-colors duration-500 ${isDark ? "bg-white/10 border-white/20 text-white/80" : "bg-indigo-100/80 border-indigo-200 text-indigo-800"}`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Webagentur kostet 3.000€+ – Pageblitz ab 19,90 €/Monat</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]">
                  <span className="block">
                    {["Deine", "professionelle"].map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.65, delay: 0.08 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                        className="text-white inline-block mr-3"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                  <motion.span
                    initial={{ opacity: 0, y: 32, filter: "blur(16px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 block"
                    style={{ backgroundSize: '200% 200%', animation: 'gradient-text-shimmer 8s ease infinite' }}
                  >
                    Website in 3 Minuten.
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-white/60 max-w-lg mb-8 leading-relaxed"
                >
                  Kein Webdesigner. Kein Monatelanges Warten. Kein 4-stelliges Budget.
                  Pageblitz erstellt deine Website automatisch – du musst nur dein Business beschreiben.
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
                    className={`btn-shimmer rounded-full h-14 px-8 text-base font-medium group transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90 shadow-xl shadow-white/20" : "bg-violet-950 text-white hover:bg-violet-900 shadow-xl shadow-violet-950/30"}`}
                  >
                    7 Tage gratis testen
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <button
                    onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}
                    className={`inline-flex items-center justify-center rounded-full h-14 px-8 text-base transition-all duration-300 cursor-pointer ${isDark ? "text-white/70 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.08]" : "text-violet-700 font-medium border border-violet-300 hover:border-violet-500 hover:text-violet-950 bg-transparent"}`}
                  >
                    Beispiele ansehen
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </button>
                </motion.div>

                {/* Trust signal */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 pt-6 border-t border-white/10"
                >
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>7 Tage gratis</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Danach 19,90 €/Monat</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Monatlich kündbar</span>
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
                  <div
                    className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-full pointer-events-none"
                    style={{ animation: 'gradient-orb-drift 14s ease-in-out infinite' }}
                  />
                  <GhostWebsiteCreation />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div
          className="absolute -left-40 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none"
          style={{ animation: 'gradient-orb-drift 18s ease-in-out infinite' }}
        />
        <div
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/6 rounded-full blur-3xl pointer-events-none"
          style={{ animation: 'gradient-orb-drift-alt 22s ease-in-out infinite' }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, i) => (
              <StatItem key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Für wen? Section */}
      <section className={`py-24 transition-colors duration-500 ${isDark ? "border-t border-white/5" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className={`text-3xl md:text-4xl font-semibold tracking-tight mb-4 transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}>
              Für wen ist Pageblitz?
            </h2>
            <p className={`text-lg max-w-xl mx-auto transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              Für alle, die Kunden über das Internet gewinnen wollen – ohne IT-Kenntnisse.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { emoji: "🔧", label: "Handwerker" },
              { emoji: "✂️", label: "Friseure" },
              { emoji: "🍽️", label: "Restaurants" },
              { emoji: "🏥", label: "Ärzte & Therapeuten" },
              { emoji: "💅", label: "Beauty & Wellness" },
              { emoji: "🏋️", label: "Fitnessstudios" },
              { emoji: "⚖️", label: "Anwälte & Berater" },
              { emoji: "📐", label: "Architekten" },
              { emoji: "🌸", label: "Einzelhandel" },
              { emoji: "🐾", label: "Tierärzte" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{
                  scale: 1.07,
                  y: -6,
                  transition: { type: "spring", stiffness: 380, damping: 18 },
                }}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-colors duration-500 cursor-default ${
                  isDark
                    ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20"
                    : "bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border-gray-100"
                }`}
              >
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: [-4, 4, -2, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {item.emoji}
                </motion.span>
                <span className={`text-sm font-medium text-center transition-colors duration-500 ${isDark ? "text-white/70" : "text-gray-700"}`}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className={`text-sm mb-6 transition-colors duration-500 ${isDark ? "text-white/30" : "text-gray-400"}`}>
              … und viele mehr. Wenn du ein lokales Unternehmen hast, ist Pageblitz für dich.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/start")}
              className={`btn-shimmer rounded-full h-12 px-8 text-sm font-medium transition-colors duration-500 ${
                isDark
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-violet-950 text-white hover:bg-violet-900"
              }`}
            >
              Meine Website erstellen
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Website Showcase Gallery */}
      <div id="showcase">
        <WebsiteShowcase />
      </div>

      {/* CTA after Showcase */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-white/60 text-lg mb-6">
            Gefällt dir, was du siehst? Erstelle jetzt deine eigene Website – in 3 Minuten.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/start")}
            className={`btn-shimmer rounded-full h-12 px-8 text-sm font-medium group transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-violet-950 text-white hover:bg-violet-900"}`}
          >
            Website jetzt erstellen
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/30 text-xs mt-3">7 Tage gratis · danach 19,90 €/Mo. · Jederzeit kündbar</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.h2
              initial={{ opacity: 0, x: -20, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4"
            >
              Warum Pageblitz?
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.12, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl font-semibold text-white tracking-tight"
            >
              Alles dabei.<br />Sofort einsatzbereit.
            </motion.h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={Rocket} title="Sofort fertige Texte" description="Keine leere Seite, kein Copy-Paste. Die KI schreibt deine Leistungsbeschreibungen, Über-uns-Texte und Seitentitel – passend zu deiner Branche." index={0} isDark={isDark} />
            <FeatureCard icon={Clock} title="In 3 Minuten online" description="Gib deinen Google My Business Link ein – und 3 Minuten später hat dein Business einen professionellen Webauftritt. Kein Warten, keine Einrichtung." index={1} isDark={isDark} />
            <FeatureCard icon={Smartphone} title="Sieht auf jedem Handy gut aus" description="Über 70% deiner Kunden googeln dich am Smartphone. Deine Website passt sich automatisch an – ohne dass du etwas tun musst." index={2} isDark={isDark} />
            <FeatureCard icon={Search} title="Wird bei Google gefunden" description="SEO-optimierter Code, strukturierte Daten und schnelle Ladezeiten – damit neue Kunden dich über Google entdecken, nicht nur Bestandskunden." index={3} isDark={isDark} />
            <FeatureCard icon={ShieldCheck} title="Kein Anwalt nötig" description="Impressum, Datenschutzerklärung und DSGVO-konforme Cookie-Banner werden automatisch generiert und aktuell gehalten." index={4} isDark={isDark} />
            <FeatureCard icon={Globe} title="Deine eigene Domain" description="Verbinde deine bestehende Domain oder nutze eine kostenlose .pageblitz.de Subdomain. SSL-Zertifikat und Hosting sind inklusive." index={5} isDark={isDark} />
          </div>
        </div>
      </section>

      {/* CTA after Features */}
      <div className="text-center pb-20">
        <Button
          size="lg"
          onClick={() => navigate("/start")}
          className={`btn-shimmer rounded-full h-12 px-8 text-sm font-medium group transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-violet-950 text-white hover:bg-violet-900"}`}
        >
          Jetzt starten
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-white/30 text-xs mt-3">7 Tage gratis · danach 19,90 €/Mo. · Jederzeit kündbar</p>
      </div>

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
              <div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none"
                style={{ animation: 'gradient-orb-drift-alt 16s ease-in-out infinite' }}
              />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
                {/* Mini preview cards for each step */}
                {[
                  { icon: "🔗", label: "Link eingefügt", sub: "google.com/maps/..." },
                  { icon: "🤖", label: "KI analysiert", sub: "Texte & Bilder werden generiert..." },
                  { icon: "✏️", label: "Anpassen im Chat", sub: "Farbe auf Marineblau ändern..." },
                  { icon: "🚀", label: "Live!", sub: "meinbusiness.pageblitz.de" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/5"
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="text-white text-sm font-medium">{s.label}</div>
                      <div className="text-white/40 text-xs font-mono mt-0.5">{s.sub}</div>
                    </div>
                    {i < 3 && (
                      <div className="ml-auto text-white/20 text-xs">→</div>
                    )}
                    {i === 3 && (
                      <div className="ml-auto">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Online
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Full-width CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/start")}
                  className="btn-shimmer w-full flex items-center justify-between bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-xl p-4 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">⚡</span>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">Jetzt kostenlos starten</div>
                      <div className="text-white/40 text-xs font-mono mt-0.5">7 Tage gratis · keine Kreditkarte</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 transition-colors duration-500 ${isDark ? "border-t border-white/5" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`text-3xl md:text-4xl font-semibold tracking-tight mb-3 transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Was Kunden sagen
            </motion.h2>
            <p className={`transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              Echte Unternehmer. Echte Ergebnisse.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Markus H.",
                role: "Elektroinstallateur, Hannover",
                initials: "MH",
                color: "bg-blue-100 text-blue-700",
                darkColor: "bg-blue-500/20 text-blue-300",
                text: "Ich hab keine Ahnung von Websites. Hab meinen Google-Link eingegeben und 5 Minuten später war meine Seite fertig. Sieht aus wie von einem Profi gemacht. Meine Kunden fragen, wer das designt hat.",
                stars: 5,
              },
              {
                name: "Sabine K.",
                role: "Friseursalon Elegance, München",
                initials: "SK",
                color: "bg-rose-100 text-rose-700",
                darkColor: "bg-rose-500/20 text-rose-300",
                text: "Früher hatte ich nur eine veraltete Website von 2018. Jetzt habe ich etwas Modernes, das auch auf dem Handy gut aussieht. Ich bekomme deutlich mehr Anfragen über die Seite als vorher.",
                stars: 5,
              },
              {
                name: "Thorsten B.",
                role: "Steuerberater, Hamburg",
                initials: "TB",
                color: "bg-emerald-100 text-emerald-700",
                darkColor: "bg-emerald-500/20 text-emerald-300",
                text: "Als Steuerberater weiß ich, was professionelles Webdesign kostet – schnell 3.000€ oder mehr. Für 19,90€ im Monat bekomme ich ein vergleichbares Ergebnis. Die Entscheidung war wirklich leicht.",
                stars: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32, scale: 0.95, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className={`rounded-2xl p-7 border flex flex-col gap-4 transition-colors duration-500 ${
                  isDark
                    ? "bg-white/[0.03] border-white/10 hover:border-white/20"
                    : "bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex gap-1">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className={`leading-relaxed text-sm flex-1 transition-colors duration-500 ${isDark ? "text-white/70" : "text-gray-700"}`}>
                  "{t.text}"
                </p>
                <div className={`flex items-center gap-3 pt-2 border-t transition-colors duration-500 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${isDark ? t.darkColor : t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {t.name}
                    </div>
                    <div className={`text-xs transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - with comparison */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div
          className="absolute -left-48 top-1/3 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"
          style={{ animation: 'gradient-orb-drift 20s ease-in-out infinite' }}
        />
        <div
          className="absolute -right-48 bottom-1/3 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none"
          style={{ animation: 'gradient-orb-drift-alt 24s ease-in-out infinite' }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4">Preise</h2>
            <h3 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Ein Preis. Alles inklusive.</h3>
          </div>

          <div className="flex justify-center">
            {/* Pricing card */}
            <div className={`relative p-1 rounded-3xl w-full max-w-md transition-colors duration-500 ${isDark ? "bg-gradient-to-b from-white/20 to-white/5" : "bg-gradient-to-b from-violet-200/60 to-violet-100/30"}`}>
              <div className={`rounded-[22px] p-10 border h-full flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-violet-200/60"}`}>
                <div className="text-center mb-10">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-5 transition-colors duration-500 ${isDark ? "bg-white/10 text-white/60" : "bg-violet-100 text-violet-700"}`}>
                    Pageblitz Pro
                  </div>
                  {/* Billing toggle */}
                  <div className="flex items-center justify-center mb-5">
                    <div className={`flex p-0.5 rounded-full border transition-colors duration-500 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
                      <button
                        onClick={() => setBillingYearly(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${billingYearly ? (isDark ? 'bg-white text-black' : 'bg-violet-950 text-white') : (isDark ? 'text-white/50 hover:text-white/70' : 'text-gray-500 hover:text-gray-700')}`}
                      >
                        Jährlich
                      </button>
                      <button
                        onClick={() => setBillingYearly(false)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!billingYearly ? (isDark ? 'bg-white text-black' : 'bg-violet-950 text-white') : (isDark ? 'text-white/50 hover:text-white/70' : 'text-gray-500 hover:text-gray-700')}`}
                      >
                        Monatlich
                      </button>
                    </div>
                    {billingYearly && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-medium whitespace-nowrap">
                        2 Monate gratis
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className={`text-6xl font-semibold tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}>{billingYearly ? '19,90€' : '24,90€'}</span>
                    <span className="text-white/40">/Monat</span>
                  </div>
                  <p className="text-white/40 text-sm">
                    {billingYearly ? 'Jährliche Abrechnung · Jederzeit kündbar.' : 'Monatliche Abrechnung · Jederzeit kündbar.'}
                  </p>
                </div>

                <div className="space-y-4 mb-10">
                  {[
                    "KI-generierte Website",
                    "Eigene Domain nutzbar (Add-on)",
                    "SSL-Zertifikat",
                    "DSGVO-konformer Datenschutz & Impressum",
                    "Premium Cloud Hosting",
                    "Änderungen jederzeit per Chat",
                    "Chat-Support",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500/80 shrink-0" />
                      <span className="text-white/70 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate("/start")}
                  className={`btn-shimmer w-full rounded-full h-14 text-base font-medium mt-auto transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-violet-950 text-white hover:bg-violet-900"}`}
                >
                  7 Tage gratis starten
                </Button>
                <p className="text-center text-white/30 text-xs mt-4">
                  7 Tage gratis · danach {billingYearly ? '19,90 €/Mo. (jährlich)' : '24,90 €/Mo.'} · Jederzeit kündbar
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Section – Pageblitz vs. Webagentur */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-white/40 text-sm font-medium uppercase tracking-widest mb-4">Vergleich</h2>
            <h3 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Pageblitz vs. Webagentur</h3>
            <p className="text-white/40 mt-4 text-base">Warum immer mehr Kleinunternehmer auf KI statt auf Agenturen setzen.</p>
          </div>
          <div className={`rounded-2xl border overflow-hidden transition-colors duration-500 ${isDark ? "border-white/10" : "border-gray-200"}`}>
            {/* Header */}
            <div className={`grid grid-cols-3 px-8 py-5 transition-colors duration-500 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <div className="text-white/40 text-sm font-medium uppercase tracking-wider"></div>
              <div className="text-center">
                <span className={`text-base font-medium transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-400"}`}>Webagentur</span>
              </div>
              <div className="text-center">
                <span className={`text-base font-semibold transition-colors duration-500 ${isDark ? "text-white" : "text-violet-950"}`}>Pageblitz ✦</span>
              </div>
            </div>
            {/* Rows */}
            {[
              { label: "Einmalige Kosten", agency: "2.000 – 8.000 €", us: "0 €" },
              { label: "Zeit bis zur fertigen Website", agency: "4 – 12 Wochen", us: "3 Minuten" },
              { label: "Monatliche Kosten", agency: "50 – 150 € Hosting & Wartung", us: billingYearly ? "19,90 €*" : "24,90 €" },
              { label: "Änderungen & Updates", agency: "Stundenabrechnung (~80 €/h)", us: "Inklusive" },
              { label: "Vertragslaufzeit", agency: "Oft 12–24 Monate", us: billingYearly ? "1 Monat" : "Monatlich kündbar" },
              { label: "Technisches Know-how nötig", agency: "Nein (aber Briefing-Aufwand)", us: "Nein" },
              { label: "DSGVO & Impressum", agency: "Meist kostenpflichtig extra", us: "Automatisch inklusive" },
              { label: "SSL & Hosting", agency: "Oft extra berechnet", us: "Inklusive" },
            ].map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 px-8 py-5 border-t transition-colors duration-500 ${isDark ? "border-white/5" : "border-gray-100"} ${i % 2 !== 0 ? (isDark ? 'bg-white/[0.015]' : 'bg-gray-50/60') : ''}`}
              >
                <div className={`text-sm font-medium self-center transition-colors duration-500 ${isDark ? "text-white/60" : "text-gray-700"}`}>{row.label}</div>
                <div className={`text-center text-sm self-center transition-colors duration-500 ${isDark ? "text-white/35" : "text-gray-400"}`}>{row.agency}</div>
                <div className={`text-center text-sm font-semibold self-center transition-colors duration-500 ${isDark ? "text-green-400" : "text-violet-700"}`}>{row.us}</div>
              </div>
            ))}
            {/* Footer CTA */}
            <div className={`border-t px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-500 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-violet-50/50 border-violet-100"}`}>
              <p className={`text-sm transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}>
                Ersparnis im ersten Jahr: <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>bis zu 8.000 €</span>
                {billingYearly && <span className={`block text-xs mt-1 ${isDark ? "text-white/30" : "text-gray-400"}`}>* bei jährlicher Zahlung · 24,90 €/Mo. bei monatlicher Abrechnung</span>}
              </p>
              <button
                onClick={() => navigate("/start")}
                className={`btn-shimmer flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-full transition-colors whitespace-nowrap ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-violet-950 text-white hover:bg-violet-900"}`}
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        {/* Animated gradient orbs */}
        <div
          className="absolute left-1/4 -top-20 w-[600px] h-[600px] -translate-x-1/2 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none"
          style={{ animation: 'gradient-orb-drift 22s ease-in-out infinite' }}
        />
        <div
          className="absolute right-1/4 -bottom-20 w-[500px] h-[500px] translate-x-1/2 bg-purple-500/6 rounded-full blur-3xl pointer-events-none"
          style={{ animation: 'gradient-orb-drift-alt 18s ease-in-out infinite' }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-white/40 text-sm font-medium uppercase tracking-widest mb-6"
          >
            Jetzt loslegen
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight"
          >
            Deine Website wartet.<br />Starte heute kostenlos.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22, duration: 0.6 }}
            className="text-lg text-white/50 mb-10 max-w-lg mx-auto leading-relaxed"
          >
            Kein Webdesigner. Kein technisches Wissen. Nur dein Unternehmen –
            professionell online in 3 Minuten.
          </motion.p>
          <div className="relative inline-flex justify-center">
            {/* Pulsing glow ring */}
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute inset-0 rounded-full blur-2xl pointer-events-none ${
                isDark ? "bg-white/20" : "bg-violet-500/35"
              }`}
            />
            <Button
              size="lg"
              onClick={() => navigate("/start")}
              className={`btn-shimmer relative rounded-full h-16 px-12 text-lg font-medium group transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10" : "bg-violet-950 text-white hover:bg-violet-900 shadow-xl shadow-violet-950/25"}`}
            >
              7 Tage gratis testen
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {["7 Tage gratis", "Ab 19,90 €/Mo.", "Monatlich kündbar", "In 3 Minuten fertig"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-white/40 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400/60" />
                {t}
              </div>
            ))}
          </div>
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
            <a href="/impressum" className="text-white/40 hover:text-white/80 transition-colors">Impressum</a>
            <a href="/datenschutz" className="text-white/40 hover:text-white/80 transition-colors">Datenschutz</a>
            <button
              onClick={() => window.dispatchEvent(new Event("pageblitz:open-cookie-settings"))}
              className="text-white/40 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Cookie Einstellungen
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
