import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
} from "framer-motion";
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
  MessageCircle,
  CalendarCheck,
  Bot,
} from "lucide-react";
import LandingPageChatWidget from "@/components/LandingPageChatWidget";
import { Button } from "@/components/ui/button";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { PackShowcase } from "@/components/landing/PackShowcase";
import { PACK_IDS } from "@shared/siteContract/types";
import { getConstitution } from "@shared/stylePacks";
import { HOME_FAQ_ITEMS } from "@shared/faq";
import { SEO_INDUSTRY_LINKS } from "@shared/seoIndustryLinks";

// --- Animation Components ---

const GradientOrb = ({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 1, ease: "easeOut" }}
    className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`}
  />
);

const Navbar = ({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) => {
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? `${isDark ? "bg-[#0a0a0a]/80 border-b border-white/5" : "bg-white/90 border-b border-gray-200/60"} backdrop-blur-xl py-4`
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all ${isDark ? "bg-white shadow-white/10 group-hover:shadow-white/20" : "bg-gray-900 shadow-gray-900/10 group-hover:shadow-gray-900/20"}`}
            >
              <Zap
                className={`w-5 h-5 ${isDark ? "text-black" : "text-white"}`}
                fill={isDark ? "black" : "white"}
              />
            </div>
            <span
              className={`font-semibold text-lg tracking-tight transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Pageblitz
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm px-4 py-2 rounded-lg transition-all ${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
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
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${isDark ? "border-white/20 hover:border-white/40 text-white/60 hover:text-white" : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900"}`}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            {/* Login icon */}
            <button
              onClick={() => navigate("/login")}
              title="Anmelden"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${isDark ? "border-white/20 hover:border-white/40 text-white/60 hover:text-white" : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900"}`}
            >
              <LogIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/start")}
              className="btn-nav-cta rounded-full px-5 h-10 text-sm font-semibold text-gray-900 transition-all duration-300 hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
              }}
            >
              Website gratis erstellen ✦
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            {/* Mobile theme toggle */}
            <button
              onClick={onToggle}
              title={isDark ? "Light Mode" : "Dark Mode"}
              aria-label={isDark ? "Light Mode" : "Dark Mode"}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${isDark ? "border-white/20 text-white/60" : "border-gray-300 text-gray-600"}`}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              className={`p-2 ${isDark ? "text-white" : "text-gray-900"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
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
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl py-3 border-b ${isDark ? "text-white/80 border-white/10" : "text-gray-700 border-gray-200"}`}
                >
                  {link.label}
                </a>
              ))}
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/start");
                }}
                className={`rounded-full mt-6 h-14 text-lg font-medium ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-[#a3e635] text-gray-900 hover:bg-[#bef264]"}`}
              >
                Website gratis erstellen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Aus shared/faq.ts, damit sichtbarer FAQ-Block, Server-Prerender und
// FAQPage-Schema nicht wieder auseinanderlaufen.
const FAQ_ITEMS = HOME_FAQ_ITEMS;

const FaqSection = ({ isDark }: { isDark: boolean }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section
      className={`py-24 border-y transition-colors duration-500 ${isDark ? "border-white/5" : "border-gray-200"}`}
    >
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className={`text-sm font-medium uppercase tracking-widest mb-4 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            FAQ
          </p>
          <h2
            className={`text-3xl font-semibold tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Häufige Fragen
          </h2>
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden transition-colors duration-500 ${isDark ? "border-white/8 bg-white/[0.02]" : "border-gray-200 bg-white"}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span
                  className={`font-medium text-sm transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {item.q}
                </span>
                {openIndex === i ? (
                  <ChevronUp
                    className={`w-4 h-4 shrink-0 ml-4 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                  />
                ) : (
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 ml-4 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                  />
                )}
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
                    <p
                      className={`px-6 pb-5 text-sm leading-relaxed transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
                    >
                      {item.a}
                    </p>
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
    format: n =>
      n >= 1000
        ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, "0")}+`
        : `${n}+`,
    label: "Websites erstellt",
  },
  { target: null, display: "3 Min.", label: "Durchschnittliche Zeit" },
  { target: 85, format: n => `${n}%`, label: "SEO-Performance" },
  { target: null, display: "19,90€", label: "Pro Monat" },
];

const StatItem = ({
  stat,
  index,
  isDark,
}: {
  stat: StatDef;
  index: number;
  isDark: boolean;
}) => {
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
      <div
        className={`text-3xl md:text-4xl font-semibold mb-2 tracking-tight tabular-nums transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {displayValue}
      </div>
      <div
        className={`text-sm transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
      >
        {stat.label}
      </div>
    </motion.div>
  );
};

// --- Feature Cards with Mouse-Tracking 3D Tilt ---

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
  isDark,
}: any) => {
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
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        rotateX: rotXSpring,
        rotateY: rotYSpring,
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative p-8 rounded-3xl border cursor-default transition-all duration-500 ${
        isDark
          ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]"
          : "bg-white border-gray-100 hover:border-lime-200 hover:shadow-md hover:shadow-lime-100/60"
      }`}
    >
      <div
        className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? "bg-gradient-to-b from-white/[0.02] to-transparent" : "bg-gradient-to-b from-lime-50/40 to-transparent"}`}
      />
      <div className="relative z-10">
        <div
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${
            isDark
              ? "bg-white/5 border-white/10"
              : "bg-lime-100 border-lime-200"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${isDark ? "text-white/70" : "text-lime-600"}`}
          />
        </div>
        <h3
          className={`text-lg font-semibold mb-3 tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h3>
        <p
          className={`text-sm leading-relaxed transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
};

/** Rotation im Hero-Ghost-Screen zeigt alle 14 Style Packs (echte SSR-Demo statt fester v1-Layout-Namen, siehe `server/ssr/routes.ts` `/demo/:pack`). */
const HERO_PREVIEW_PACKS = PACK_IDS;
const ROTATE_INTERVAL = 5000;
const SKELETON_DURATION = 2800;

const GhostWebsiteCreation = () => {
  const [phase, setPhase] = useState<"skeleton" | "live">("skeleton");
  const [currentIdx, setCurrentIdx] = useState(() =>
    Math.floor(Math.random() * HERO_PREVIEW_PACKS.length)
  );
  const [containerW, setContainerW] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const skeletonTimer = setTimeout(() => setPhase("live"), SKELETON_DURATION);
    return () => clearTimeout(skeletonTimer);
  }, []);

  useEffect(() => {
    if (phase !== "live") return;
    const interval = setInterval(() => {
      setCurrentIdx(i => (i + 1) % HERO_PREVIEW_PACKS.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setContainerW(el.offsetWidth));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const packId = HERO_PREVIEW_PACKS[currentIdx];
  const packName = getConstitution(packId).name;
  const IFRAME_W = 1280;
  const iframeScale = containerW > 0 ? containerW / IFRAME_W : 0.5;

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/10] rounded-2xl bg-white border border-gray-200/80 shadow-2xl shadow-black/8 overflow-hidden">
      {/* Browser Chrome */}
      <div className="relative h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-2 z-30 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 max-w-md mx-auto h-6 bg-white rounded-md flex items-center px-2.5 border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0" />
          <span className="text-[10px] text-gray-600 font-mono truncate">
            dein-unternehmen.pageblitz.de
          </span>
        </div>
      </div>

      {/* Content area */}
      <div
        ref={contentRef}
        className="relative h-[calc(100%-2.5rem)] overflow-hidden bg-white"
      >
        {/* Phase 1: Skeleton wireframe building animation */}
        <motion.div
          className="absolute inset-0 z-10 bg-white p-5"
          animate={{ opacity: phase === "skeleton" ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ pointerEvents: phase === "skeleton" ? "auto" : "none" }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-lime-300/20 to-transparent" />
          </motion.div>

          {/* Wireframe blocks building in */}
          <div className="space-y-3">
            {/* Nav bar */}
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "80px" }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="h-3 bg-gray-200 rounded-full"
              />
              <div className="flex gap-3">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "40px", opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                    className="h-2 bg-gray-100 rounded-full"
                  />
                ))}
              </div>
            </div>
            {/* Hero block */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ transformOrigin: "top" }}
              className="h-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/60 flex flex-col justify-center items-center gap-2 px-8"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="h-4 bg-gray-200 rounded-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "45%" }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="h-2.5 bg-gray-150 rounded-full"
                style={{ backgroundColor: "#e8e8e8" }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3, duration: 0.3, type: "spring" }}
                className="h-6 w-24 bg-lime-400 rounded-md mt-1"
              />
            </motion.div>
            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5 + i * 0.15, duration: 0.4 }}
                  className="aspect-[4/3] rounded-lg bg-gray-50 border border-gray-200/50 p-3 flex flex-col gap-2"
                >
                  <div className="w-5 h-5 rounded bg-lime-300/40" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-1.5 bg-gray-200 rounded-full w-full" />
                    <div
                      className="h-1.5 bg-gray-150 rounded-full w-3/4"
                      style={{ backgroundColor: "#efefef" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            {/* About block */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.1, duration: 0.4 }}
              className="h-14 rounded-lg bg-gray-50 border border-gray-200/50"
            />
          </div>
        </motion.div>

        {/* Phase 2: Real layout iframes */}
        <AnimatePresence mode="wait">
          {phase === "live" && (
            <motion.div
              key={packId}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <iframe
                src={`/demo/${packId}`}
                width={IFRAME_W}
                height={2400}
                scrolling="no"
                style={{
                  border: "none",
                  pointerEvents: "none",
                  transformOrigin: "top left",
                  transform: `scale(${iframeScale})`,
                  display: "block",
                  width: `${IFRAME_W}px`,
                  height: "2400px",
                }}
                title={`${packName} Vorschau`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />

        {/* Glassmorphism Pack-Badge */}
        {phase === "live" && (
          <motion.div
            key={`badge-${packId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute bottom-4 right-4 z-30 px-3.5 py-1.5 rounded-full text-[11px] text-white font-semibold tracking-wide"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            ✦ {packName}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });
  const [billingYearly, setBillingYearly] = useState(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lp-theme");
      return stored === "dark"; // light unless user explicitly chose dark
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("lp-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const [heroBusinessName, setHeroBusinessName] = useState("");

  const handleHeroStart = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      billing: billingYearly ? "yearly" : "monthly",
    });
    const name = heroBusinessName.trim();
    if (name) params.set("name", name);
    navigate(`/start?${params.toString()}`);
  };

  return (
    <div
      className={`lp-root min-h-screen font-sans transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white selection:bg-white/20" : "bg-stone-50 text-gray-900 selection:bg-lime-200/40"}`}
      data-lp-theme={isDark ? "dark" : "light"}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-lime-400 z-[200] origin-left pointer-events-none"
        style={{ scaleX: smoothProgress }}
      />

      <Navbar isDark={isDark} onToggle={() => setIsDark(v => !v)} />

      {/* Background Effects */}
      <div
        className={`fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
      >
        <GradientOrb
          className="w-[800px] h-[800px] bg-lime-500/10 -left-40 -top-40"
          delay={0}
        />
        <GradientOrb
          className="w-[600px] h-[600px] bg-lime-500/10 right-0 top-1/4"
          delay={0.3}
        />
        <GradientOrb
          className="w-[400px] h-[400px] bg-lime-400/5 left-1/3 bottom-0"
          delay={0.5}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Hero Section with Animated Gradient Background */}
      <section className="relative min-h-screen">
        {/* Background Animation - Cross-fades between dark and light */}
        <div className="absolute inset-0 h-screen">
          {/* Dark animated gradient — only mount in dark mode */}
          {isDark && (
            <div className="absolute inset-0">
              <BackgroundGradientAnimation
                containerClassName="absolute inset-0"
                gradientBackgroundStart="rgb(8, 10, 8)"
                gradientBackgroundEnd="rgb(12, 15, 10)"
                firstColor="163, 230, 53"
                secondColor="132, 204, 22"
                thirdColor="190, 242, 100"
                fourthColor="101, 163, 13"
                fifthColor="212, 255, 0"
                pointerColor="190, 242, 100"
                size="70%"
                interactive={true}
              />
            </div>
          )}
          {/* Light gradient for light mode */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${isDark ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-white to-lime-50/20" />
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-stone-200/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-stone-200/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 w-[400px] h-[400px] bg-lime-100/15 rounded-full blur-[80px] pointer-events-none" />
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border text-sm mb-8 transition-colors duration-500 ${isDark ? "bg-white/10 border-white/20 text-white/80" : "bg-lime-100/80 border-lime-200 text-lime-800"}`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    Webagentur kostet 3.000€+ – Pageblitz ab 19,90 €/Monat
                  </span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]">
                  <span className="block">
                    {["Deine", "professionelle"].map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.08 + i * 0.12,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={`inline-block mr-3 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`text-transparent bg-clip-text block ${isDark ? "bg-gradient-to-r from-lime-300 via-lime-400 to-yellow-300" : "bg-gradient-to-r from-lime-600 via-lime-500 to-lime-600"}`}
                    style={{
                      backgroundSize: "200% 200%",
                      animation: "gradient-text-shimmer 8s ease infinite",
                    }}
                  >
                    Website in 3 Minuten.
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`text-lg max-w-lg mb-8 leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}
                >
                  Kein Webdesigner. Kein Monatelanges Warten. Kein 4-stelliges
                  Budget. Pageblitz erstellt deine Website automatisch – du
                  musst nur dein Business beschreiben.
                </motion.p>

                {/* Einstieg direkt im Hero.
                    Vorher führte der CTA auf /start, wo als Erstes ein
                    Auswahl-Screen stand ("Wie möchtest du starten?") – also drei
                    Screens, bevor der Nutzer irgendetwas von seiner Website
                    sieht. Wer hier den Firmennamen eintippt, hat sich schon
                    festgelegt und überspringt die Auswahl komplett.
                    Leeres Feld ist erlaubt und führt auf den bisherigen Weg. */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <form
                    onSubmit={handleHeroStart}
                    className="flex flex-col sm:flex-row gap-3 max-w-lg"
                  >
                    <input
                      type="text"
                      value={heroBusinessName}
                      onChange={e => setHeroBusinessName(e.target.value)}
                      placeholder="Wie heißt dein Unternehmen?"
                      aria-label="Unternehmensname"
                      autoComplete="organization"
                      className={`flex-1 h-14 px-5 rounded-full text-base outline-none border transition-all duration-300 ${
                        isDark
                          ? "bg-white/[0.06] border-white/15 text-white placeholder:text-white/40 focus:border-lime-400/60 focus:bg-white/[0.09]"
                          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-600 shadow-sm focus:border-lime-500 focus:shadow-md"
                      }`}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="btn-shimmer rounded-full h-14 px-8 text-base font-medium group transition-all shadow-xl shadow-lime-500/30 shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                        color: "#0a0a0a",
                      }}
                    >
                      Website erstellen
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("showcase")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className={`inline-flex items-center gap-1.5 text-sm transition-colors duration-300 cursor-pointer self-start ${isDark ? "text-white/50 hover:text-white/80" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Erst Beispiele ansehen
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Trust signal */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className={`flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 pt-6 border-t transition-colors duration-500 ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <div
                    className={`flex items-center gap-2 text-sm transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>7 Tage gratis</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Danach 19,90 €/Monat</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Monatlich kündbar</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Animation */}
              <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative lg:pl-4"
              >
                <div className="relative">
                  {/* Glow behind the browser */}
                  <div
                    className="absolute -inset-4 bg-gradient-to-r from-lime-400/20 via-lime-500/15 to-yellow-400/15 blur-3xl rounded-full pointer-events-none"
                    style={{
                      animation: "gradient-orb-drift 14s ease-in-out infinite",
                    }}
                  />
                  <GhostWebsiteCreation />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`py-20 border-y relative overflow-hidden transition-colors duration-500 ${isDark ? "border-white/5" : "border-gray-200"}`}
      >
        {/* Animated gradient orbs */}
        <div
          className={`absolute -left-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${isDark ? "bg-lime-500/8 opacity-100" : "opacity-0"}`}
          style={{ animation: "gradient-orb-drift 18s ease-in-out infinite" }}
        />
        <div
          className={`absolute -right-40 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${isDark ? "bg-lime-500/6 opacity-100" : "opacity-0"}`}
          style={{
            animation: "gradient-orb-drift-alt 22s ease-in-out infinite",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, i) => (
              <StatItem key={i} stat={stat} index={i} isDark={isDark} />
            ))}
          </div>
        </div>
      </section>

      {/* Für wen? Section */}
      <section
        className={`py-24 transition-colors duration-500 ${isDark ? "border-t border-white/5" : "bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className={`text-3xl md:text-4xl font-semibold tracking-tight mb-4 transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Für wen ist Pageblitz?
            </h2>
            <p
              className={`text-lg max-w-xl mx-auto transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
            >
              Für alle, die Kunden über das Internet gewinnen wollen – ohne
              IT-Kenntnisse.
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
                transition={{
                  delay: i * 0.05,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  scale: 1.07,
                  y: -6,
                  transition: { type: "spring", stiffness: 380, damping: 18 },
                }}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-colors duration-500 cursor-default ${
                  isDark
                    ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20"
                    : "bg-gray-50 hover:bg-lime-50 hover:border-lime-200 border-gray-100"
                }`}
              >
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: [-4, 4, -2, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {item.emoji}
                </motion.span>
                <span
                  className={`text-sm font-medium text-center transition-colors duration-500 ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p
              className={`text-sm mb-6 transition-colors duration-500 ${isDark ? "text-white/30" : "text-gray-600"}`}
            >
              … und viele mehr. Wenn du ein lokales Unternehmen hast, ist
              Pageblitz für dich.
            </p>
            <Button
              size="lg"
              onClick={() =>
                navigate(
                  `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                )
              }
              className="btn-shimmer rounded-full h-12 px-8 text-sm font-medium transition-all shadow-lg shadow-lime-500/30"
              style={{
                background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                color: "#0a0a0a",
              }}
            >
              Meine Website gratis erstellen
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Style-Pack-Showcase */}
      <PackShowcase isDark={isDark} />

      {/* CTA after Showcase */}
      <section
        className={`py-16 border-y transition-colors duration-500 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p
            className={`text-lg mb-6 transition-colors duration-500 ${isDark ? "text-white/60" : "text-gray-600"}`}
          >
            Gefällt dir, was du siehst? Erstelle jetzt deine eigene Website – in
            3 Minuten.
          </p>
          <Button
            size="lg"
            onClick={() =>
              navigate(`/start?billing=${billingYearly ? "yearly" : "monthly"}`)
            }
            className="btn-shimmer rounded-full h-12 px-8 text-sm font-medium group transition-all shadow-lg shadow-lime-500/30"
            style={{
              background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
              color: "#0a0a0a",
            }}
          >
            Website jetzt gratis erstellen
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p
            className={`text-xs mt-3 transition-colors duration-500 ${isDark ? "text-white/30" : "text-gray-600"}`}
          >
            7 Tage gratis · danach 19,90 €/Mo. · Jederzeit kündbar
          </p>
        </div>
      </section>

      {/* GMB Feature Callout */}
      <section className="py-20 relative overflow-hidden">
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
        >
          <div className="absolute left-1/4 top-0 w-96 h-96 bg-lime-500/8 blur-[120px] rounded-full" />
          <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-lime-400/8 blur-[100px] rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`rounded-3xl border p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-lime-50/60 border-lime-200/60"}`}
          >
            {/* Left: Google Maps icon + illustration */}
            <div className="flex-shrink-0 relative">
              <div
                className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center shadow-xl ${isDark ? "bg-[#1a1a2e] border border-white/10" : "bg-white border border-lime-100"}`}
              >
                <svg
                  viewBox="0 0 48 48"
                  className="w-14 h-14 md:w-20 md:h-20"
                  fill="none"
                >
                  <path
                    d="M24 4C15.163 4 8 11.163 8 20c0 10.5 16 28 16 28s16-17.5 16-28c0-8.837-7.163-16-16-16z"
                    fill="#EA4335"
                  />
                  <circle cx="24" cy="20" r="6" fill="white" />
                </svg>
              </div>
              <div
                className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${isDark ? "bg-emerald-500 text-white" : "bg-emerald-500 text-white"}`}
              >
                1
              </div>
            </div>

            {/* Right: Text */}
            <div className="flex-1 text-center md:text-left">
              <div
                className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 ${isDark ? "bg-lime-500/20 text-lime-300 border border-lime-500/30" : "bg-lime-100 text-lime-700 border border-lime-200"}`}
              >
                <span>⚡</span> 1-Klick Import
              </div>
              <h3
                className={`text-2xl md:text-3xl font-semibold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Google My Business?
                <br />
                Einfach einfügen – fertig.
              </h3>
              <p
                className={`text-base leading-relaxed mb-6 max-w-lg ${isDark ? "text-white/55" : "text-slate-600"}`}
              >
                Du hast bereits ein Google-Profil? Dann ist deine Website in 3
                Minuten fertig. Einfach deinen{" "}
                <strong className={isDark ? "text-white/80" : "text-slate-800"}>
                  Google My Business Link
                </strong>{" "}
                einfügen – Name, Adresse, Öffnungszeiten, Fotos und Bewertungen
                werden automatisch übernommen. Kein Abtippen, kein Aufwand.
              </p>
              <div className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-3">
                <button
                  onClick={() =>
                    navigate(
                      `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                    )
                  }
                  className="btn-shimmer flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-full transition-all shadow-lg shadow-lime-500/25"
                  style={{
                    background:
                      "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                    color: "#0a0a0a",
                  }}
                >
                  Jetzt GMB-Daten importieren
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span
                  className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}
                >
                  7 Tage kostenlos testen · danach 19,90 €/Mo.
                </span>
              </div>
            </div>
          </motion.div>
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
              className={`text-sm font-medium uppercase tracking-widest mb-4 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
            >
              Warum Pageblitz?
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                delay: 0.12,
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`text-3xl md:text-5xl font-semibold tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Alles dabei.
              <br />
              Sofort einsatzbereit.
            </motion.h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={Rocket}
              title="Sofort fertige Texte"
              description="Keine leere Seite, kein Copy-Paste. Die KI schreibt deine Leistungsbeschreibungen, Über-uns-Texte und Seitentitel – passend zu deiner Branche."
              index={0}
              isDark={isDark}
            />
            <FeatureCard
              icon={Clock}
              title="In 3 Minuten online"
              description="Gib deinen Google My Business Link ein – und 3 Minuten später hat dein Business einen professionellen Webauftritt. Kein Warten, keine Einrichtung."
              index={1}
              isDark={isDark}
            />
            <FeatureCard
              icon={Smartphone}
              title="Sieht auf jedem Handy gut aus"
              description="Über 70% deiner Kunden googeln dich am Smartphone. Deine Website passt sich automatisch an – ohne dass du etwas tun musst."
              index={2}
              isDark={isDark}
            />
            <FeatureCard
              icon={Search}
              title="Wird bei Google gefunden"
              description="SEO-optimierter Code, strukturierte Daten und schnelle Ladezeiten – damit neue Kunden dich über Google entdecken, nicht nur Bestandskunden."
              index={3}
              isDark={isDark}
            />
            <FeatureCard
              icon={MessageCircle}
              title="KI-Chat der verkauft"
              description="Ein KI-Assistent auf deiner Website beantwortet Kundenfragen 24/7 und erfasst automatisch Leads – während du schläfst."
              index={4}
              isDark={isDark}
            />
            <FeatureCard
              icon={CalendarCheck}
              title="Terminbuchung 24/7"
              description="Kunden buchen Termine direkt auf deiner Website – ohne Telefonieren, ohne Wartezeiten. Vollautomatisch, rund um die Uhr."
              index={5}
              isDark={isDark}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Kein Anwalt nötig"
              description="Impressum, Datenschutzerklärung und DSGVO-konforme Cookie-Banner werden automatisch generiert und aktuell gehalten."
              index={6}
              isDark={isDark}
            />
            <FeatureCard
              icon={Globe}
              title="Deine eigene Domain"
              description="Verbinde deine bestehende Domain oder nutze eine kostenlose .pageblitz.de Subdomain. SSL-Zertifikat und Hosting sind inklusive."
              index={7}
              isDark={isDark}
            />
          </div>
        </div>
      </section>

      {/* CTA after Features */}
      <div className="text-center pb-20">
        <Button
          size="lg"
          onClick={() =>
            navigate(`/start?billing=${billingYearly ? "yearly" : "monthly"}`)
          }
          className={`btn-shimmer rounded-full h-12 px-8 text-sm font-medium group transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-[#a3e635] text-gray-900 hover:bg-[#bef264]"}`}
        >
          Jetzt starten
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p
          className={`text-xs mt-3 transition-colors duration-500 ${isDark ? "text-white/30" : "text-gray-600"}`}
        >
          7 Tage gratis · danach 19,90 €/Mo. · Jederzeit kündbar
        </p>
      </div>

      {/* How it Works - Minimalist */}
      <section
        className={`py-32 border-y transition-colors duration-500 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p
                className={`text-sm font-medium uppercase tracking-widest mb-4 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                Der Ablauf
              </p>
              <h2
                className={`text-3xl md:text-4xl font-semibold mb-12 tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                So einfach geht's.
              </h2>

              <div className="space-y-10">
                {[
                  {
                    step: "01",
                    title: "Link eingeben",
                    desc: "Füge deinen Google My Business Link ein oder starte manuell.",
                  },
                  {
                    step: "02",
                    title: "KI analysiert",
                    desc: "Unsere KI liest deine Daten und erstellt passende Inhalte.",
                  },
                  {
                    step: "03",
                    title: "Anpassen",
                    desc: "Ändere Texte, Farben und Bilder im Chat-Interface.",
                  },
                  {
                    step: "04",
                    title: "Veröffentlichen",
                    desc: "Mit einem Klick ist deine Website live.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div
                      className={`text-sm font-medium pt-1 transition-colors duration-500 ${isDark ? "text-white/20" : "text-gray-600"}`}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h4
                        className={`text-lg font-medium mb-2 transition-colors duration-500 ${isDark ? "text-white group-hover:text-white/80" : "text-gray-900 group-hover:text-gray-700"}`}
                      >
                        {item.title}
                      </h4>
                      <p
                        className={`text-sm leading-relaxed transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className={`absolute inset-0 blur-3xl pointer-events-none transition-opacity duration-500 ${isDark ? "bg-gradient-to-r from-lime-500/10 to-lime-500/10 opacity-100" : "opacity-0"}`}
                style={{
                  animation: "gradient-orb-drift-alt 16s ease-in-out infinite",
                }}
              />
              <div
                className={`relative rounded-3xl border p-8 space-y-4 transition-colors duration-500 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-lg shadow-gray-100"}`}
              >
                {/* Mini preview cards for each step */}
                {[
                  {
                    icon: "🔗",
                    label: "Link eingefügt",
                    sub: "google.com/maps/...",
                  },
                  {
                    icon: "🤖",
                    label: "KI analysiert",
                    sub: "Texte & Bilder werden generiert...",
                  },
                  {
                    icon: "✏️",
                    label: "Anpassen im Chat",
                    sub: "Farbe auf Marineblau ändern...",
                  },
                  {
                    icon: "🚀",
                    label: "Live!",
                    sub: "meinbusiness.pageblitz.de",
                  },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-4 rounded-xl p-4 border transition-colors duration-500 ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div
                        className={`text-sm font-medium transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {s.label}
                      </div>
                      <div
                        className={`text-xs font-mono mt-0.5 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                      >
                        {s.sub}
                      </div>
                    </div>
                    {i < 3 && (
                      <div
                        className={`ml-auto text-xs transition-colors duration-500 ${isDark ? "text-white/20" : "text-gray-600"}`}
                      >
                        →
                      </div>
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
                  transition={{
                    delay: 0.65,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(
                      `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                    )
                  }
                  className={`btn-shimmer w-full flex items-center justify-between rounded-xl p-4 transition-all duration-300 cursor-pointer group border ${isDark ? "bg-white/10 hover:bg-white/15 border-white/10 hover:border-white/25" : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">⚡</span>
                    <div className="text-left">
                      <div
                        className={`text-sm font-medium transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Jetzt kostenlos starten
                      </div>
                      <div
                        className={`text-xs font-mono mt-0.5 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                      >
                        7 Tage gratis testen · dann 19,90 €/Mo.
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 group-hover:translate-x-1 transition-all duration-200 ${isDark ? "text-white/50 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"}`}
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KI-Chat Spotlight ─────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        {isDark && (
          <GradientOrb
            className="w-[600px] h-[600px] bg-lime-400/8 -left-40 top-10"
            delay={0.2}
          />
        )}
        {isDark && (
          <GradientOrb
            className="w-[400px] h-[400px] bg-lime-500/8 right-0 bottom-0"
            delay={0.4}
          />
        )}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
                style={{
                  background: "rgba(163,230,53,0.12)",
                  borderColor: "rgba(163,230,53,0.3)",
                  color: "#a3e635",
                }}
              >
                <Bot className="w-3.5 h-3.5" />
                Add-on · nur 9,90 €/Monat
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.08,
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 leading-[1.1] transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Dein 24/7
                <br />
                <span style={{ color: "#a3e635" }}>Vertriebsmitarbeiter.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.18, duration: 0.6 }}
                className={`text-lg mb-8 leading-relaxed transition-colors duration-500 ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                Der KI-Chat beantwortet Kundenfragen automatisch, erfasst
                Kontaktdaten und benachrichtigt dich per E-Mail – auch nachts,
                am Wochenende und im Urlaub.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28, duration: 0.55 }}
                className="space-y-3 mb-10"
              >
                {[
                  {
                    emoji: "💬",
                    text: "Beantwortet Fragen zu Leistungen, Preisen & Öffnungszeiten",
                  },
                  {
                    emoji: "📩",
                    text: "Erfasst Name, E-Mail & Telefon von Interessenten automatisch",
                  },
                  {
                    emoji: "🔔",
                    text: "Du bekommst sofort eine E-Mail, wenn ein neuer Lead erfasst wurde",
                  },
                  {
                    emoji: "📅",
                    text: "Kombinierbar mit Terminbuchung – Kunden buchen direkt im Chat",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors duration-500 ${isDark ? "bg-white/[0.03] border-white/8" : "bg-gray-50 border-gray-100"}`}
                  >
                    <span className="text-lg leading-none mt-0.5 shrink-0">
                      {item.emoji}
                    </span>
                    <span
                      className={`text-sm leading-relaxed transition-colors duration-500 ${isDark ? "text-white/70" : "text-gray-700"}`}
                    >
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  navigate(
                    `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                  )
                }
                className="btn-shimmer flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-gray-900 transition-all"
                style={{
                  background: "#a3e635",
                  boxShadow: "0 8px 28px rgba(163,230,53,0.35)",
                }}
              >
                KI-Chat jetzt freischalten
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <p
                className={`mt-3 text-xs transition-colors duration-500 ${isDark ? "text-white/30" : "text-gray-600"}`}
              >
                Im Basis-Paket wählbar · 7 Tage gratis testen
              </p>
            </div>

            {/* Right: Mock chat preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2,
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              {/* Phone frame */}
              <div className="relative mx-auto max-w-[320px]">
                <div
                  className="rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/50"
                  style={{ background: "#111118" }}
                >
                  {/* Chat header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{ background: "#a3e635" }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">
                        Müller Haartechnik
                      </div>
                      <div className="text-white/70 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                        Online · antwortet sofort
                      </div>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="px-4 py-4 space-y-3 min-h-[320px]">
                    {[
                      {
                        role: "assistant",
                        text: "Hallo! 👋 Wie kann ich dir helfen?",
                        delay: 0,
                      },
                      {
                        role: "user",
                        text: "Was kostet ein Herrenhaarschnitt?",
                        delay: 0.4,
                      },
                      {
                        role: "assistant",
                        text: "Ein Herrenhaarschnitt kostet bei uns ab 28 €, mit Waschen & Styling 35 €. 💈 Soll ich direkt einen Termin für dich buchen?",
                        delay: 0.9,
                      },
                      {
                        role: "user",
                        text: "Ja gerne, am Freitag?",
                        delay: 1.5,
                      },
                      {
                        role: "assistant",
                        text: "Super! Wie ist dein Name und deine Handynummer? Dann können wir dich kurz bestätigen. 😊",
                        delay: 2.0,
                      },
                    ].map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + msg.delay, duration: 0.4 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "text-white rounded-br-sm"
                              : "bg-white/10 text-white/85 rounded-bl-sm"
                          }`}
                          style={
                            msg.role === "user" ? { background: "#a3e635" } : {}
                          }
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}

                    {/* Lead captured indicator */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.8 }}
                      className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-xl px-3 py-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                      <span className="text-green-400 text-xs font-medium">
                        Lead erfasst – E-Mail an dich gesendet!
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Floating price badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                  className="absolute -right-8 top-16 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 text-center"
                >
                  <div className="text-2xl font-bold text-gray-900">9,90€</div>
                  <div className="text-gray-600 text-xs">/Monat</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Terminbuchung Highlight ────────────────────────────────────────── */}
      <section
        className={`py-20 transition-colors duration-500 ${isDark ? "border-y border-white/5 bg-white/[0.015]" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-20 h-20 rounded-3xl border flex items-center justify-center shrink-0"
              style={{
                background: "rgba(99,102,241,0.15)",
                borderColor: "rgba(99,102,241,0.3)",
              }}
            >
              <CalendarCheck
                className="w-10 h-10"
                style={{ color: "#6366f1" }}
              />
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 border"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  borderColor: "rgba(99,102,241,0.3)",
                  color: "#6366f1",
                }}
              >
                Add-on · nur 4,90 €/Monat
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className={`text-2xl md:text-3xl font-semibold tracking-tight mb-3 transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Terminbuchung – direkt auf deiner Website.
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.14 }}
                className={`text-base leading-relaxed transition-colors duration-500 ${isDark ? "text-white/55" : "text-gray-600"}`}
              >
                Kein Telefonieren, kein Hin-und-Her per WhatsApp. Kunden wählen
                einfach ihren Wunschtermin – du siehst alles in deinem Kalender.
                Kostet weniger als eine Tasse Kaffee pro Monat.
              </motion.p>
            </div>
            <motion.button
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                navigate(
                  `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                )
              }
              className="btn-shimmer flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-lg shadow-lime-500/25"
              style={{
                background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                color: "#0a0a0a",
              }}
            >
              Jetzt einrichten
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className={`py-24 transition-colors duration-500 ${isDark ? "border-t border-white/5" : "bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-amber-400 text-amber-400"
                />
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
            <p
              className={`transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
            >
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
                initial={{
                  opacity: 0,
                  y: 32,
                  scale: 0.95,
                  filter: "blur(6px)",
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className={`rounded-2xl p-7 border flex flex-col gap-4 transition-colors duration-500 ${
                  isDark
                    ? "bg-white/[0.03] border-white/10 hover:border-white/20"
                    : "bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex gap-1">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p
                  className={`leading-relaxed text-sm flex-1 transition-colors duration-500 ${isDark ? "text-white/70" : "text-gray-700"}`}
                >
                  "{t.text}"
                </p>
                <div
                  className={`flex items-center gap-3 pt-2 border-t transition-colors duration-500 ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${isDark ? t.darkColor : t.color}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div
                      className={`text-sm font-semibold transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {t.name}
                    </div>
                    <div
                      className={`text-xs transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                    >
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
          className={`absolute -left-48 top-1/3 w-[500px] h-[500px] bg-lime-600/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
          style={{ animation: "gradient-orb-drift 20s ease-in-out infinite" }}
        />
        <div
          className={`absolute -right-48 bottom-1/3 w-[400px] h-[400px] bg-lime-600/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
          style={{
            animation: "gradient-orb-drift-alt 24s ease-in-out infinite",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p
              className={`text-sm font-medium uppercase tracking-widest mb-4 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
            >
              Preise
            </p>
            <h2
              className={`text-3xl md:text-4xl font-semibold tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Ein Preis. Alles inklusive.
            </h2>
          </div>

          <div className="flex justify-center">
            {/* Pricing card */}
            <div
              className={`relative p-1 rounded-3xl w-full max-w-md transition-colors duration-500 ${isDark ? "bg-gradient-to-b from-white/20 to-white/5" : "bg-gradient-to-b from-lime-200/60 to-lime-100/30"}`}
            >
              <div
                className={`rounded-[22px] p-10 border h-full flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-lime-200/60"}`}
              >
                <div className="text-center mb-10">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-5 transition-colors duration-500 ${isDark ? "bg-white/10 text-white/60" : "bg-lime-100 text-lime-700"}`}
                  >
                    Pageblitz Pro
                  </div>
                  {/* Billing toggle */}
                  <div className="flex items-center justify-center mb-5">
                    <div
                      className={`flex p-0.5 rounded-full border transition-colors duration-500 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}
                    >
                      <button
                        onClick={() => setBillingYearly(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${billingYearly ? (isDark ? "bg-white text-black" : "bg-lime-500 text-gray-900") : isDark ? "text-white/50 hover:text-white/70" : "text-gray-600 hover:text-gray-700"}`}
                      >
                        Jährlich
                      </button>
                      <button
                        onClick={() => setBillingYearly(false)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!billingYearly ? (isDark ? "bg-white text-black" : "bg-lime-500 text-gray-900") : isDark ? "text-white/50 hover:text-white/70" : "text-gray-600 hover:text-gray-700"}`}
                      >
                        Monatlich
                      </button>
                    </div>
                    {billingYearly && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-800"}`}
                      >
                        2 Monate gratis
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span
                      className={`text-6xl font-semibold tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {billingYearly ? "19,90€" : "24,90€"}
                    </span>
                    <span
                      className={`transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                    >
                      /Monat
                    </span>
                  </div>
                  <p
                    className={`text-sm transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
                  >
                    {billingYearly
                      ? "Jährliche Abrechnung · Jederzeit kündbar."
                      : "Monatliche Abrechnung · Jederzeit kündbar."}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    "KI-generierte Website",
                    "SSL-Zertifikat",
                    "DSGVO-konformer Datenschutz & Impressum",
                    "Premium Cloud Hosting",
                    "Änderungen jederzeit per Chat",
                    "Chat-Support",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500/80 shrink-0" />
                      <span
                        className={`text-sm transition-colors duration-500 ${isDark ? "text-white/70" : "text-gray-700"}`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add-ons */}
                <div
                  className={`rounded-2xl p-5 mb-8 border transition-colors duration-500 ${isDark ? "bg-white/[0.03] border-white/8" : "bg-gray-50 border-gray-200"}`}
                >
                  <p
                    className={`text-xs font-medium uppercase tracking-widest mb-4 transition-colors duration-500 ${isDark ? "text-white/35" : "text-gray-600"}`}
                  >
                    Optionale Add-ons
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        icon: "🤖",
                        label: "KI-Chat Assistent",
                        price: "+9,90 €/Mo.",
                      },
                      {
                        icon: "📅",
                        label: "Terminbuchung",
                        price: "+4,90 €/Mo.",
                      },
                      {
                        icon: "✉️",
                        label: "Kontaktformular",
                        price: "+3,90 €/Mo.",
                      },
                      {
                        icon: "🖼️",
                        label: "Bildergalerie",
                        price: "+3,90 €/Mo.",
                      },
                      {
                        icon: "👥",
                        label: "Team-Sektion",
                        price: "+3,90 €/Mo.",
                      },
                      {
                        icon: "🍽️",
                        label: "Speisekarte",
                        price: "+3,90 €/Mo.",
                      },
                      { icon: "💶", label: "Preisliste", price: "+3,90 €/Mo." },
                    ].map(({ icon, label, price }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`text-sm transition-colors duration-500 ${isDark ? "text-white/60" : "text-gray-600"}`}
                        >
                          <span className="mr-2">{icon}</span>
                          {label}
                        </span>
                        <span
                          className={`text-xs font-medium transition-colors duration-500 ${isDark ? "text-white/35" : "text-gray-600"}`}
                        >
                          {price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() =>
                    navigate(
                      `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                    )
                  }
                  className={`btn-shimmer w-full rounded-full h-14 text-base font-medium mt-auto transition-colors duration-300 ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-[#a3e635] text-gray-900 hover:bg-[#bef264]"}`}
                >
                  7 Tage gratis starten
                </Button>
                <p
                  className={`text-center text-xs mt-4 transition-colors duration-500 ${isDark ? "text-white/30" : "text-gray-600"}`}
                >
                  7 Tage gratis · danach{" "}
                  {billingYearly ? "19,90 €/Mo. (jährlich)" : "24,90 €/Mo."} ·
                  Jederzeit kündbar
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
            <p
              className={`text-sm font-medium uppercase tracking-widest mb-4 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
            >
              Vergleich
            </p>
            <h2
              className={`text-3xl md:text-4xl font-semibold tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Pageblitz vs. Webagentur
            </h2>
            <p
              className={`mt-4 text-base transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
            >
              Warum immer mehr Kleinunternehmer auf KI statt auf Agenturen
              setzen.
            </p>
          </div>
          <div
            className={`rounded-2xl border overflow-hidden transition-colors duration-500 ${isDark ? "border-white/10" : "border-gray-200"}`}
          >
            {/* Header */}
            <div
              className={`grid grid-cols-3 px-8 py-5 transition-colors duration-500 ${isDark ? "bg-white/5" : "bg-gray-50"}`}
            >
              <div
                className={`text-sm font-medium uppercase tracking-wider transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
              ></div>
              <div className="text-center">
                <span
                  className={`text-base font-medium transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
                >
                  Webagentur
                </span>
              </div>
              <div className="text-center">
                <span
                  className={`text-base font-semibold transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Pageblitz ✦
                </span>
              </div>
            </div>
            {/* Rows */}
            {[
              {
                label: "Einmalige Kosten",
                agency: "2.000 – 8.000 €",
                us: "0 €",
              },
              {
                label: "Zeit bis zur fertigen Website",
                agency: "4 – 12 Wochen",
                us: "3 Minuten",
              },
              {
                label: "Monatliche Kosten",
                agency: "50 – 150 € Hosting & Wartung",
                us: billingYearly ? "19,90 €*" : "24,90 €",
              },
              {
                label: "Änderungen & Updates",
                agency: "Stundenabrechnung (~80 €/h)",
                us: "Inklusive",
              },
              {
                label: "Vertragslaufzeit",
                agency: "Oft 12–24 Monate",
                us: billingYearly ? "1 Monat" : "Monatlich kündbar",
              },
              {
                label: "Technisches Know-how nötig",
                agency: "Nein (aber Briefing-Aufwand)",
                us: "Nein",
              },
              {
                label: "DSGVO & Impressum",
                agency: "Meist kostenpflichtig extra",
                us: "Automatisch inklusive",
              },
              {
                label: "SSL & Hosting",
                agency: "Oft extra berechnet",
                us: "Inklusive",
              },
            ].map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 px-8 py-5 border-t transition-colors duration-500 ${isDark ? "border-white/5" : "border-gray-100"} ${i % 2 !== 0 ? (isDark ? "bg-white/[0.015]" : "bg-gray-50/60") : ""}`}
              >
                <div
                  className={`text-sm font-medium self-center transition-colors duration-500 ${isDark ? "text-white/60" : "text-gray-700"}`}
                >
                  {row.label}
                </div>
                <div
                  className={`text-center text-sm self-center transition-colors duration-500 ${isDark ? "text-white/35" : "text-gray-600"}`}
                >
                  {row.agency}
                </div>
                <div
                  className={`text-center text-sm font-semibold self-center transition-colors duration-500 ${isDark ? "text-green-400" : "text-lime-700"}`}
                >
                  {row.us}
                </div>
              </div>
            ))}
            {/* Footer CTA */}
            <div
              className={`border-t px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-500 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-lime-50/50 border-lime-100"}`}
            >
              <p
                className={`text-sm transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
              >
                Ersparnis im ersten Jahr:{" "}
                <span
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  bis zu 8.000 €
                </span>
                {billingYearly && (
                  <span
                    className={`block text-xs mt-1 ${isDark ? "text-white/30" : "text-gray-600"}`}
                  >
                    * bei jährlicher Zahlung · 24,90 €/Mo. bei monatlicher
                    Abrechnung
                  </span>
                )}
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                  )
                }
                className={`btn-shimmer flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-full transition-colors whitespace-nowrap ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-[#a3e635] text-gray-900 hover:bg-[#bef264]"}`}
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection isDark={isDark} />

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${isDark ? "bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" : ""}`}
        />
        {/* Animated gradient orbs */}
        <div
          className={`absolute left-1/4 -top-20 w-[600px] h-[600px] -translate-x-1/2 bg-lime-500/8 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
          style={{ animation: "gradient-orb-drift 22s ease-in-out infinite" }}
        />
        <div
          className={`absolute right-1/4 -bottom-20 w-[500px] h-[500px] translate-x-1/2 bg-lime-500/6 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
          style={{
            animation: "gradient-orb-drift-alt 18s ease-in-out infinite",
          }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-sm font-medium uppercase tracking-widest mb-6 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            Jetzt loslegen
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`text-4xl md:text-5xl font-semibold mb-6 tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Deine Website wartet.
            <br />
            Starte heute kostenlos.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22, duration: 0.6 }}
            className={`text-lg mb-10 max-w-lg mx-auto leading-relaxed transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
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
                isDark ? "bg-white/20" : "bg-lime-500/35"
              }`}
            />
            <Button
              size="lg"
              onClick={() =>
                navigate(
                  `/start?billing=${billingYearly ? "yearly" : "monthly"}`
                )
              }
              className="btn-shimmer relative rounded-full h-16 px-12 text-lg font-medium group transition-all shadow-xl shadow-lime-500/25"
              style={{
                background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                color: "#0a0a0a",
              }}
            >
              gratis ausprobieren
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              "7 Tage gratis",
              "Ab 19,90 €/Mo.",
              "Monatlich kündbar",
              "In 3 Minuten fertig",
            ].map(t => (
              <div
                key={t}
                className={`flex items-center gap-2 text-sm transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
              >
                <CheckCircle2 className="w-4 h-4 text-green-400/60" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Page Chat Widget */}
      <LandingPageChatWidget />

      {/* Branchen-Verlinkung.
          Die 37 Branchenseiten unter /website-erstellen/* waren vorher aus der
          App heraus überhaupt nicht verlinkt – sie standen nur in der Sitemap
          und hingen damit als Waisenseiten in der Luft. Bewusst <a href> statt
          wouter-<Link>: das sind serverseitig gerenderte Routen, ein
          Client-Side-Navigate würde dort im SPA-404 landen. */}
      <section
        className={`py-14 border-t transition-colors duration-500 ${isDark ? "border-white/5" : "border-gray-200"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`text-sm font-medium uppercase tracking-widest mb-6 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
          >
            Website erstellen – nach Branche
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {SEO_INDUSTRY_LINKS.map(industry => (
              <a
                key={industry.slug}
                href={`/website-erstellen/${industry.slug}`}
                className={`text-sm transition-colors ${isDark ? "text-white/50 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Website für {industry.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 border-t transition-colors duration-500 ${isDark ? "border-white/5" : "border-gray-200"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${isDark ? "bg-white shadow-white/10" : "bg-gray-900 shadow-gray-900/10"}`}
            >
              <Zap
                className={`w-5 h-5 ${isDark ? "text-black" : "text-white"}`}
                fill={isDark ? "black" : "white"}
              />
            </div>
            <span
              className={`font-semibold text-lg tracking-tight transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Pageblitz
            </span>
          </div>
          <div
            className={`text-sm transition-colors duration-500 ${isDark ? "text-white/30" : "text-gray-600"}`}
          >
            © 2026 Pageblitz. Alle Rechte vorbehalten.
          </div>
          <div className="flex gap-6 text-sm">
            <a
              href="/impressum"
              className={`transition-colors ${isDark ? "text-white/40 hover:text-white/80" : "text-gray-600 hover:text-gray-700"}`}
            >
              Impressum
            </a>
            <a
              href="/datenschutz"
              className={`transition-colors ${isDark ? "text-white/40 hover:text-white/80" : "text-gray-600 hover:text-gray-700"}`}
            >
              Datenschutz
            </a>
            <button
              onClick={() =>
                window.dispatchEvent(
                  new Event("pageblitz:open-cookie-settings")
                )
              }
              className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${isDark ? "text-white/40 hover:text-white/80" : "text-gray-600 hover:text-gray-700"}`}
            >
              Cookie Einstellungen
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
