import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Sparkles, Plus, Trash2, Send, ChevronRight, ChevronLeft, Clock, Zap, Check, Monitor, X, Pencil, Upload, ImageIcon, Save, Edit2, Settings2, Mail, CheckCircle, GripVertical, Eye } from "lucide-react";
import { toast } from "sonner";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import MacbookMockup from "@/components/MacbookMockup";
import ChatWidget from "@/components/ChatWidget";
import StockPhotoSearch from "@/components/StockPhotoSearch";
import type { WebsiteData, ColorScheme } from "@shared/types";
import { convertOpeningHoursToGerman } from "@shared/hours";
import { translateGmbCategory, CATEGORY_GROUPS } from "@shared/gmbCategories";
import { getContrastColor } from "@shared/colorContrast";
import { FONT_OPTIONS, LOGO_FONT_OPTIONS, PREDEFINED_COLOR_SCHEMES, DEFAULT_LAYOUT_COLOR_SCHEMES, LAYOUT_FONTS, withOnColors, prefersSansSerif, generateRandomColorScheme } from "@shared/layoutConfig";
import { getGalleryImages, getHeroImageUrl, getAboutImageUrl, getRawIndustryColors } from "@shared/industryImages";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";

// ── A/B Template Variant Picker ──────────────────────────────────────────────

/**
 * Industry-specific ranked ordering within each of the 3 design families.
 * Tuple: [bold_dark_family[], elegant_refined_family[], clean_warm_family[]]
 * `round` indexes into each family — "Andere zeigen" increments round.
 */
const VARIANT_FAMILY_RANKINGS: Record<string, [string[], string[], string[]]> = {
  friseur:       [["aurora","nexus","bold","flux","dynamic"], ["elegant","luxury","natural","craft","forge"], ["clay","fresh","warm","pulse","clean","modern"]],
  beauty:        [["aurora","nexus","bold","flux","dynamic"], ["elegant","luxury","natural","craft","forge"], ["clay","fresh","warm","pulse","clean","modern"]],
  restaurant:    [["flux","aurora","nexus","bold","dynamic"], ["natural","craft","forge","elegant","luxury"],  ["fresh","warm","clay","clean","modern","pulse"]],
  food:          [["flux","aurora","nexus","bold","dynamic"], ["natural","craft","forge","elegant","luxury"],  ["fresh","warm","clay","clean","modern","pulse"]],
  baeckerei:     [["flux","aurora","nexus","bold","dynamic"], ["natural","craft","forge","elegant","luxury"],  ["fresh","warm","clay","clean","modern","pulse"]],
  fitness:       [["dynamic","aurora","nexus","bold","flux"], ["craft","forge","natural","elegant","luxury"],  ["pulse","fresh","clean","clay","modern","warm"]],
  bauunternehmen:[["bold","nexus","aurora","flux","dynamic"], ["forge","craft","natural","elegant","luxury"],  ["clean","modern","pulse","clay","fresh","warm"]],
  handwerk:      [["bold","nexus","aurora","flux","dynamic"], ["forge","craft","natural","elegant","luxury"],  ["clean","modern","pulse","clay","fresh","warm"]],
  medizin:       [["nexus","aurora","bold","flux","dynamic"], ["forge","natural","elegant","luxury","craft"],  ["pulse","clean","clay","modern","fresh","warm"]],
  medical:       [["nexus","aurora","bold","flux","dynamic"], ["forge","natural","elegant","luxury","craft"],  ["pulse","clean","clay","modern","fresh","warm"]],
  beratung:      [["nexus","aurora","bold","flux","dynamic"], ["forge","elegant","luxury","natural","craft"],  ["pulse","clean","modern","clay","fresh","warm"]],
  legal:         [["nexus","aurora","bold","flux","dynamic"], ["forge","elegant","luxury","natural","craft"],  ["pulse","clean","modern","clay","fresh","warm"]],
  tech:          [["aurora","nexus","dynamic","bold","flux"], ["forge","elegant","natural","luxury","craft"],  ["pulse","clean","modern","clay","fresh","warm"]],
  immobilien:    [["nexus","aurora","bold","flux","dynamic"], ["luxury","forge","elegant","natural","craft"],  ["clean","modern","pulse","clay","fresh","warm"]],
  auto:          [["nexus","flux","bold","aurora","dynamic"], ["forge","luxury","craft","elegant","natural"],  ["clean","modern","pulse","clay","fresh","warm"]],
  automotive:    [["nexus","flux","bold","aurora","dynamic"], ["forge","luxury","craft","elegant","natural"],  ["clean","modern","pulse","clay","fresh","warm"]],
  fotografie:    [["aurora","flux","nexus","bold","dynamic"], ["elegant","forge","luxury","natural","craft"],  ["clay","modern","pulse","clean","fresh","warm"]],
  hospitality:   [["aurora","flux","nexus","bold","dynamic"], ["luxury","elegant","forge","natural","craft"],  ["warm","fresh","clay","clean","modern","pulse"]],
  bar:           [["flux","aurora","bold","nexus","dynamic"], ["luxury","forge","elegant","natural","craft"],  ["warm","clay","fresh","clean","modern","pulse"]],
  hotel:         [["flux","aurora","bold","nexus","dynamic"], ["luxury","forge","elegant","natural","craft"],  ["warm","clay","fresh","clean","modern","pulse"]],
  garten:        [["aurora","nexus","bold","flux","dynamic"], ["natural","craft","forge","elegant","luxury"],  ["warm","fresh","clay","clean","modern","pulse"]],
  nature:        [["aurora","nexus","bold","flux","dynamic"], ["natural","craft","forge","elegant","luxury"],  ["warm","fresh","clay","clean","modern","pulse"]],
  cleaning:      [["nexus","bold","aurora","flux","dynamic"], ["forge","craft","natural","elegant","luxury"],  ["clean","pulse","modern","clay","fresh","warm"]],
  education:     [["nexus","aurora","bold","flux","dynamic"], ["natural","forge","elegant","luxury","craft"],  ["clean","pulse","modern","clay","fresh","warm"]],
  fastfood:      [["bold","nexus","aurora","flux","dynamic"], ["craft","forge","natural","elegant","luxury"],  ["fresh","warm","clay","clean","modern","pulse"]],
};

const DEFAULT_VARIANT_RANKINGS: [string[], string[], string[]] = [
  ["nexus","aurora","bold","flux","dynamic"],
  ["forge","elegant","luxury","natural","craft"],
  ["clay","pulse","fresh","clean","modern","warm"],
];

/** Returns 3 layout names — one per design family — based on industry + round. */
function getVariantLayouts(industryKey: string, round: number): string[] {
  const families = VARIANT_FAMILY_RANKINGS[industryKey] || DEFAULT_VARIANT_RANKINGS;
  return families.map((family) => family[round % family.length]);
}

/** Friendly display names per layout style. */
const LAYOUT_LABELS: Record<string, string> = {
  aurora: "Aurora",  nexus: "Nexus",    bold: "Bold",    flux: "Flux",    dynamic: "Dynamic",
  forge: "Forge",    elegant: "Elegant",luxury: "Luxury", natural: "Natural", craft: "Craft",
  clay: "Clay",      pulse: "Pulse",    fresh: "Fresh",  clean: "Clean",  warm: "Warm", modern: "Modern",
  vibrant: "Vibrant",trust: "Trust",
};

/** Short mood line shown under each preview. */
const LAYOUT_VIBES: Record<string, string> = {
  aurora:  "Dunkel · Kosmisch",    nexus:   "Präzise · Navy",        bold:    "Stark · Schwarz-Gold",
  flux:    "Dunkel · Warmes Gold", dynamic: "Energie · Diagonal",    forge:   "Edel · Zeitlos",
  elegant: "Warm · Éditoriel",     luxury:  "Premium · Cinématisch", natural: "Organisch · Erdtöne",
  craft:   "Handwerk · Industrial",clay:    "Soft · Verspielt",      pulse:   "Hell · Vertrauensvoll",
  fresh:   "Frisch · Luftig",      clean:   "Klar · Minimalistisch", warm:    "Herzlich · Einladend",
  modern:  "Modern · Asymmetrisch",vibrant: "Neon · Energie",        trust:   "Klassisch · Professionell",
};

/**
 * Full-screen carousel picker — one live layout preview at a time.
 *
 * Each preview is an <iframe src="/variant-preview?websiteId=…&layout=…">
 * with width=1280. The iframe has its own 1280 px viewport so every Tailwind
 * responsive breakpoint (md:, lg:, …) fires correctly and the layout looks
 * exactly like the desktop version – just scaled down to fit the card.
 *
 * All 3 variant iframes are mounted up-front (visibility:hidden for inactive
 * ones) so switching between styles is instant – no reload delay.
 */
const DESKTOP_IFRAME_W = 1280;
const MOBILE_IFRAME_W  = 390;
// Viewport heights: must match real screen sizes so 100vh/min-h-screen
// renders correctly. Card's overflow:hidden clips to the visible area.
const DESKTOP_IFRAME_H = 900;
const MOBILE_IFRAME_H  = 844;  // iPhone 14 viewport height

function VariantPickerScreen({ websiteId, heroImageUrl, industryKey, onConfirm, onSkip }: {
  websiteId: number;
  websiteData?: any;
  heroImageUrl?: string;
  aboutImageUrl?: string;
  industryKey: string;
  onConfirm: (layoutStyle: string) => void;
  onSkip: () => void;
}) {
  const [round, setRound]         = useState(() => Math.floor(Math.random() * 5));
  const [activeIdx, setActiveIdx] = useState(0);
  const cardRef                   = useRef<HTMLDivElement>(null);
  const [scale, setScale]         = useState(0.3);
  const [iframeW, setIframeW]     = useState(MOBILE_IFRAME_W);
  const [iframeH, setIframeH]     = useState(MOBILE_IFRAME_H);
  const selectMutation            = trpc.selfService.selectWebsiteTemplate.useMutation();

  // On narrow cards (phones) use a 390 px mobile iframe so the layout is readable.
  // On wider cards (desktop) use the full 1280 px desktop iframe.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => {
      const cw = el.clientWidth;
      const mobile = cw < 600;
      const iw = mobile ? MOBILE_IFRAME_W : DESKTOP_IFRAME_W;
      const ih = mobile ? MOBILE_IFRAME_H : DESKTOP_IFRAME_H;
      setIframeW(iw);
      setIframeH(ih);
      setScale(cw / iw);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const variants = getVariantLayouts(industryKey, round);
  const selected  = variants[activeIdx];

  const goNext = () => setActiveIdx((i) => (i + 1) % variants.length);
  const goPrev = () => setActiveIdx((i) => (i + variants.length - 1) % variants.length);
  const handleOtherLayouts = () => { setRound((r) => r + 1); setActiveIdx(0); };

  const handleConfirm = async () => {
    const cs = (DEFAULT_LAYOUT_COLOR_SCHEMES as Record<string, any>)[selected];
    try {
      await selectMutation.mutateAsync({ websiteId, layoutStyle: selected, colorScheme: cs ?? undefined });
    } catch { /* non-critical */ }
    onConfirm(selected);
  };

  const accentColor = ((DEFAULT_LAYOUT_COLOR_SCHEMES as Record<string, any>)[selected] as any)?.primary ?? "#6366f1";

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col overflow-hidden select-none">

      {/* ── Header ── */}
      <div className="flex-shrink-0 pt-4 pb-2 px-6 text-center">
        <h1 className="text-xl font-bold text-white mb-0.5">Welcher Stil passt zu dir?</h1>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          Farben &amp; Inhalte lassen sich jederzeit anpassen.
        </p>
      </div>

      {/* ── Preview row — fills remaining vertical space ── */}
      <div className="flex-1 min-h-0 flex items-center gap-2 px-3 py-2">

        {/* Prev arrow */}
        <button type="button" onClick={goPrev}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/*
          Card — self-stretch so it fills the full height of the flex row.
          overflow:hidden clips the absolutely-positioned iframes to this box.
        */}
        <div
          ref={cardRef}
          className="flex-1 self-stretch min-w-0 rounded-xl overflow-hidden relative"
          style={{ boxShadow: `0 0 0 2px ${accentColor}44, 0 20px 48px -8px rgba(0,0,0,0.85)` }}
        >
          {/* One iframe per variant — inactive ones hidden via display:none */}
          {variants.map((layout, i) => (
            <iframe
              key={`${round}-${layout}-${heroImageUrl ?? ""}`}
              src={`/variant-preview?websiteId=${websiteId}&layout=${layout}`}
              width={iframeW}
              height={iframeH}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                display: i === activeIdx ? "block" : "none",
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                pointerEvents: "none",
                border: "none",
              }}
              title={`Preview ${layout}`}
            />
          ))}

          {/* Fade-out at the bottom so the crop looks intentional */}
          <div className="absolute bottom-0 inset-x-0 h-14 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(2,6,23,0.95))" }} />
        </div>

        {/* Next arrow */}
        <button type="button" onClick={goNext}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Dot indicators + layout name ── */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-2 pb-1">
        <div className="flex gap-2">
          {variants.map((_, i) => (
            <button key={i} type="button" onClick={() => setActiveIdx(i)}
              className={`rounded-full transition-all ${i === activeIdx ? "w-5 h-2 bg-blue-400" : "w-2 h-2 bg-slate-600 hover:bg-slate-500"}`} />
          ))}
        </div>
        <div className="text-center">
          <span className="text-white text-sm font-semibold">{LAYOUT_LABELS[selected] ?? selected}</span>
          <span className="text-slate-500 text-xs"> · {LAYOUT_VIBES[selected]}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 px-6 pt-1.5"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))" }}>
        <button type="button" onClick={handleConfirm} disabled={selectMutation.isPending}
          className="w-full max-w-xs py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
          {selectMutation.isPending ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Wird gespeichert…</>
          ) : (
            <>Dieses Design übernehmen <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
          )}
        </button>
        <button type="button" onClick={handleOtherLayouts}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors py-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Andere Stile zeigen
        </button>
        <button type="button" onClick={onSkip}
          className="text-slate-600 hover:text-slate-400 text-xs transition-colors py-0.5">
          Überspringen
        </button>
      </div>
    </div>
  );
}

// ── Epic Loading Screen Component ───────────────────────────────────────────

// Star data stored in refs – never causes React re-renders
interface WarpStarData {
  x: number; y: number; z: number; size: number; speed: number; hue: number;
}

const EpicGenerationLoading = ({ phase, progress }: { phase: string; progress: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<WarpStarData[]>([]);

  // Canvas-based warp animation – zero React re-renders per frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 80 : 220;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random(),
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.012 + 0.005,
        hue: [200, 180, 220][Math.floor(Math.random() * 3)],
      }));
    };
    init();
    window.addEventListener("resize", init);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      starsRef.current.forEach((s) => {
        const prevZ = s.z;
        s.z -= s.speed;
        if (s.z <= 0.01) {
          s.z = 1; s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2;
          s.hue = [200, 180, 220][Math.floor(Math.random() * 3)];
          return;
        }
        const scale = 1 / s.z;
        const prevScale = 1 / prevZ;
        const sx = cx + s.x * cx * scale * 1.4;
        const sy = cy + s.y * cy * scale * 1.4;
        const px = cx + s.x * cx * prevScale * 1.4;
        const py = cy + s.y * cy * prevScale * 1.4;
        const opacity = Math.min(0.9, (1 - s.z) * 0.85 + 0.1);
        const grad = ctx.createLinearGradient(px, py, sx, sy);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, `hsla(${s.hue},100%,82%,${opacity})`);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.4, s.size * scale * 1.5);
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(draw);
    };
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", init);
    };
  }, []);

  const phaseEmojis: Record<string, string> = {
    "Analysiere dein Unternehmen...": "🔍",
    "Erstelle Texte...": "✍️",
    "Generiere Design...": "🎨",
    "Finalisiere deine Website...": "🚀",
    "Optimiere Bilder...": "📸",
    "Baue Struktur auf...": "🏗️",
    "Füge Interaktivität hinzu...": "⚡",
    "Lade Assets...": "📦",
    "Bereite Live-Vorschau vor...": "👁️",
  };

  return (
    <div className="relative overflow-hidden bg-[#0a0a0a]" style={{ height: "100dvh" }}>
      {/* Gradient orbs – mobile-sized, no heavy motion animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-blue-500/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] bg-purple-500/20 rounded-full blur-[70px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[350px] max-h-[350px] bg-indigo-500/15 rounded-full blur-[60px]" />
      </div>

      {/* Warp Speed – Canvas-rendered, zero React re-renders */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          {/* Pulsing rings */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600"
          />
          
          {/* KI-Symbol: Einzelner pulsierender Stern */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
                rotate: [0, 10, 0, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title with gradient text */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
            Deine Website wird
          </span>
          <br />
          <span className="text-white">erstellt</span>
        </motion.h1>

        {/* Phase indicator with emoji */}
        <motion.div
          key={phase}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="text-2xl">{phaseEmojis[phase] || "⚡"}</span>
          <span className="text-slate-300 text-lg">{phase || "Initialisiere..."}</span>
        </motion.div>

        {/* Epic Progress Bar */}
        <div className="w-full max-w-md relative">
          {/* Progress bar background with glow */}
          <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
            <motion.div
              className="h-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Gradient fill */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500" />
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          
          {/* Progress glow */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 rounded-full blur-lg -z-10"
            style={{ width: `${progress}%`, margin: "0 auto", left: 0, right: 0 }}
          />
        </div>

        {/* Progress percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center gap-2"
        >
          <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 tabular-nums">
            {Math.round(progress)}
          </span>
          <span className="text-2xl text-slate-500">%</span>
        </motion.div>

        {/* Tech specs floating badges */}
        <div
          className="absolute left-0 right-0 flex justify-center gap-4 flex-wrap px-4 pb-8"
          style={{ bottom: "env(safe-area-inset-bottom)" }}
        >
          {["KI-gestützt", "SEO-optimiert", "Mobile-ready", "Blitzschnell"].map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm backdrop-blur-sm"
            >
              {tag}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Types ────────────────────────────────────────────────────────────────────

interface SubPage {
  id: string;
  name: string;
  description: string;
}

interface GalleryAlbum {
  id: string;
  name: string;
  images: string[]; // first image = cover
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface PriceListItem {
  name: string;
  price: string;
}

interface PriceListCategory {
  id: string;
  name: string;
  items: PriceListItem[];
}

interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
  from2?: string; // optional second time slot (e.g. after lunch break)
  to2?: string;
}

const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

interface OnboardingData {
  businessCategory: string;
  businessName: string;
  tagline: string;
  description: string;
  usp: string;
  topServices: { title: string; description: string }[];
  targetAudience: string;
  legalOwner: string;
  legalStreet: string;
  legalZip: string;
  legalCity: string;
  legalEmail: string;
  legalPhone: string;
  openingHours: DayHours[] | null;
  legalVatId: string;
  colorScheme: ColorScheme;
  heroPhotoUrl: string; // selected or uploaded hero photo URL
  aboutPhotoUrl: string; // selected or uploaded about/second photo URL
  brandLogo: string; // base64 or "font:<fontName>"
  headlineFont: string; // Serif or Sans-serif font name
  headlineSize: 'large' | 'medium' | 'small'; // Headline font size
  addOnContactForm: boolean;
  contactFormFields: { id: string; label: string; placeholder: string; type: "text" | "email" | "textarea" | "select"; required: boolean; options?: string[] }[];
  addOnGallery: boolean;
  addOnGalleryData: { headline?: string; mode?: 'single' | 'albums'; images: string[]; albums: GalleryAlbum[] };
  addOnMenu: boolean;       // Speisekarte (Restaurant, Café, Bäckerei)
  addOnMenuData: { headline?: string; categories: MenuCategory[] };
  addOnPricelist: boolean;  // Preisliste (Friseur, Beauty, Fitness)
  addOnPricelistData: { headline?: string; categories: PriceListCategory[] };
  addOnAiChat: boolean;     // KI-Chat-Widget
  chatWelcomeMessage: string; // Begrüßungsnachricht für KI-Chat
  addOnBooking: boolean;    // Terminbuchung
  addressingMode: 'du' | 'Sie'; // Besucher duzen oder siezen
  subPages: SubPage[];
  email: string; // for FOMO reminder
  topServicesSkipped?: boolean;
  // Optional fields loaded from database
  brandColor?: string;
  brandSecondaryColor?: string;
  logoUrl?: string;
  photoUrls?: string[];
}

type ChatStep =
  | "welcome"
  | "businessCategory"
  | "businessName"
  | "tagline"
  | "description"
  | "usp"
  | "services"
  | "targetAudience"
  | "legalOwner"
  | "legalStreet"
  | "legalZipCity"
  | "legalEmail"
  | "legalPhone"
  | "openingHours"
  | "legalVat"
  | "colorScheme"
  | "brandColor"
  | "brandSecondaryColor"
  | "heroPhoto"
  | "aboutPhoto"
  | "brandLogo"
  | "headlineFont"
  | "headlineSize"
  | "addons"
  | "editAiChat"
  | "editMenu"
  | "editPricelist"
  | "editGallery"
  | "subpages"
  | "email"
  | "addressingMode"
  | "hideSections"
  | "preview"
  | "checkout";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: number;
  step?: ChatStep; // which step this user message answered
}

// ── Constants ────────────────────────────────────────────────────────────────

const FOMO_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const COLOR_SCHEMES = PREDEFINED_COLOR_SCHEMES;

const STEP_ORDER: ChatStep[] = [
  "businessCategory",  // 1. Branche erfassen (für Bilder/Farben)
  "businessName",      // 2. Unternehmensname erfassen
  "addressingMode",    // 3. Besucher duzen oder siezen
  "brandLogo",         // 4. Logo / Schriftart für Logo
  "colorScheme",       // 4. Farben
  "heroPhoto",         // 5. Hauptbild
  "aboutPhoto",        // 6. Über-uns-Bild
  "headlineFont",      // 7. Überschriften-Schriftart
  "headlineSize",      // 8. Überschriften-Größe
  "tagline",
  "description",
  "usp",
  "services",
  "legalOwner",
  "legalStreet",
  "legalZipCity",
  "legalEmail",
  "legalPhone",
  "openingHours",
  "legalVat",
  "addons",
  "editAiChat",
  "editMenu",
  "editPricelist",
  "editGallery",
  "subpages",
  "email",
  "hideSections",
  "preview",
  "checkout",
];

// Maps each onboarding step to the section ID used in the layout components.
// Layout IDs come from PremiumLayoutsV2.tsx: hero, leistungen, ueber-uns, kontakt, galerie, speisekarte, preise
const STEP_TO_SECTION_ID: Record<ChatStep, string | null> = {
  welcome: null,
  businessCategory: "hero",
  colorScheme: "hero",
  brandColor: "hero",
  brandSecondaryColor: "hero",
  heroPhoto: "hero",
  aboutPhoto: "ueber-uns",
  brandLogo: "hero",
  headlineFont: "hero",
  headlineSize: "hero",
  businessName: "hero",
  addressingMode: null,
  tagline: "hero",
  description: "ueber-uns",
  usp: "leistungen",
  services: "leistungen",
  targetAudience: "kontakt",
  legalOwner: null,
  legalStreet: null,
  legalZipCity: null,
  legalEmail: null,
  legalPhone: null,
  openingHours: "kontakt",
  legalVat: null,
  addons: null,
  editAiChat: null,
  editMenu: "speisekarte",
  editPricelist: "preise",
  editGallery: "galerie",
  subpages: null,
  email: null,
  hideSections: null,
  preview: null,
  checkout: null,
};

// ── Helper ───────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2);
}

function useCountdown(expiresAt: number | null) {
  const [remaining, setRemaining] = useState<number>(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  previewToken?: string;
  websiteId?: number;
}

const LAYOUTS_WITHOUT_ABOUT_IMAGE = ["trust", "dynamic", "bold"];

export default function OnboardingChat({ previewToken, websiteId: websiteIdProp }: Props) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Billing interval – read from URL param (passed from LandingPage), default: yearly
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(() => {
    const param = new URLSearchParams(window.location.search).get("billing");
    return param === "monthly" ? "monthly" : "yearly";
  });

  // ── Website data ────────────────────────────────────────────────────────
  const { data: siteData, isLoading: siteLoading, error: siteError, refetch: refetchSiteData } = trpc.website.get.useQuery(
    { token: previewToken, id: websiteIdProp },
    { 
      enabled: !!(previewToken || websiteIdProp),
      retry: 2,
      retryDelay: 1000,
    }
  );

  // Show error toast if website loading fails
  useEffect(() => {
    if (siteError) {
      console.error("Website loading error:", siteError);
      toast.error("Fehler beim Laden der Website: " + siteError.message);
    }
  }, [siteError]);


  const websiteId = siteData?.website?.id ? Number(siteData.website.id) : undefined;
  const business = siteData?.business;
  // Hide FOMO banner once checkout is completed (sold = paid, active = live)
  const isPaid = siteData?.website?.status === "sold" || siteData?.website?.status === "active";

  // ── Dynamic step order based on layout and websiteData ──────────────────
  // These mirror data.addOn* but are declared before `data` to avoid
  // "used before declaration" TypeScript errors in the useMemo below.
  const [_addOnMenu, _setAddOnMenu] = useState(false);
  const [_addOnPricelist, _setAddOnPricelist] = useState(false);
  const [_addOnGallery, _setAddOnGallery] = useState(false);
  const [_addOnAiChat, _setAddOnAiChat] = useState(false);
  const dynamicStepOrder = useMemo(() => {
    const layout = (siteData?.website as any)?.layoutStyle as string | undefined;
    const websiteDataRaw = siteData?.website?.websiteData as any;
    const sections = websiteDataRaw?.sections || [];
    const hasAbout = sections.some((s: any) => s.type === "about");
    // For non-GMB users the initial generation runs with empty category → random layout
    // from the "general" pool (may include layouts without about-image like "trust").
    // Since the real layout is re-assigned on final generation, always show aboutPhoto
    // for non-GMB users regardless of the preliminary layoutStyle.
    const isGmbFlow = !!(business?.placeId && !business.placeId.startsWith("self-"));
    const layoutHasAboutImage = !isGmbFlow || !layout || !LAYOUTS_WITHOUT_ABOUT_IMAGE.includes(layout);
    const hasCustomerEmail = !!(siteData?.website as any)?.customerEmail;

    return STEP_ORDER.filter((step) => {
      // Show aboutPhoto for any layout that visually supports an about image.
      // Don't gate on hasAbout (section presence in DB): the siteData may not
      // yet be loaded when dynamicStepOrder is first computed, leading to the
      // step being silently skipped on initial render.
      if (step === "aboutPhoto") return layoutHasAboutImage;
      if (step === "editAiChat") return _addOnAiChat;
      if (step === "editMenu") return _addOnMenu;
      if (step === "editPricelist") return _addOnPricelist;
      if (step === "editGallery") return _addOnGallery;
      if (step === "email") return !hasCustomerEmail; // Skip email step if already provided
      // Opening hours only for manual onboarding (GMB already has hours from Google)
      if (step === "openingHours") return !isGmbFlow;
      return true;
    });
  }, [siteData?.website, _addOnMenu, _addOnPricelist, _addOnGallery, _addOnAiChat]);

  // ── Chat state ──────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>("welcome");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingServices, setIsGeneratingServices] = useState(false);
  const [serviceSuggestions, setServiceSuggestions] = useState<{ title: string; description: string }[]>([]);
  const [initialServices, setInitialServices] = useState<{ title: string; description: string }[]>([]);

  // ── Edit mode state for revisiting completed steps ───────────────────────
  // When user clicks a completed step to edit, we store the original position
  // so we can return there after editing
  const [editMode, setEditMode] = useState<{ isEditing: boolean; returnToStep: ChatStep | null }>({ isEditing: false, returnToStep: null });

  // ── Exit intent ──────────────────────────────────────────────────────────
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentEmail, setExitIntentEmail] = useState("");
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  // Only show exit-intent overlay once per session (not on every upward mouse move)
  const exitIntentShownRef = useRef(false);
  const [isGeneratingInitialWebsite, setIsGeneratingInitialWebsite] = useState(false);

  useEffect(() => {
    // Check if user has email (either from auth or from data)
    const hasUserEmail = !!(isAuthenticated && user?.email);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep === "welcome" || currentStep === "checkout" || currentStep === "preview") return;
      e.preventDefault();
    };

    // Exit intent (mouse leaves window upwards) – shows at most once per session
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && currentStep !== "checkout" && currentStep !== "preview" && currentStep !== "email" && !exitIntentShownRef.current) {
        exitIntentShownRef.current = true;
        if (hasUserEmail) {
          setShowExitConfirmation(true);
        } else {
          setShowExitIntent(true);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("mouseout", handleMouseOut);
      // Cleanup localStorage on unmount (checkout or preview step)
      if (currentStep === "checkout" || currentStep === "preview") {
        localStorage.removeItem(`generating_${previewToken || websiteIdProp}`);
      }
    };
  }, [currentStep, isGeneratingInitialWebsite, isAuthenticated, user?.email, previewToken, websiteIdProp]);
  const [showSkipServicesWarning, setShowSkipServicesWarning] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set<string>());
  // Section reordering (drag & drop in hideSections step)
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);
  const [gmbÜbernommenEditMode, setGmbÜbernommenEditMode] = useState(false);
  // Opening hours widget state
  const [hoursState, setHoursState] = useState<DayHours[]>(() =>
    WEEKDAYS.map((day, i) => ({ day, open: i < 5, from: "09:00", to: "18:00" }))
  );
  const [quickReplySelected, setQuickReplySelected] = useState(false);
  const [inPlaceEditId, setInPlaceEditId] = useState<string | null>(null);
  const [inPlaceEditValue, setInPlaceEditValue] = useState("");
  const [showIndividualColors, setShowIndividualColors] = useState(false);
  const [previewScrollTop, setPreviewScrollTop] = useState(0);
  const [previewNotification, setPreviewNotification] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendReason, setExtendReason] = useState<string>("");
  const [extendSubmitting, setExtendSubmitting] = useState(false);
  const [extendSuccess, setExtendSuccess] = useState<string | null>(null);
  const [extendError, setExtendError] = useState<string | null>(null);

  const extendMutation = trpc.lifecycle.extendByPreviewToken.useMutation();
  const reservationQuery = trpc.lifecycle.getReservation.useQuery(
    { previewToken: previewToken || "" },
    { enabled: !!previewToken, staleTime: 30_000 },
  );

  const handleExtend = async () => {
    if (!previewToken) return;
    setExtendSubmitting(true);
    setExtendError(null);
    try {
      const res = await extendMutation.mutateAsync({
        previewToken,
        reason: extendReason || undefined,
      });
      if (res.newReservedUntil) {
        const newMs = new Date(res.newReservedUntil).getTime();
        // Sync lokalen FOMO-Timer mit neuer Backend-Deadline
        const key = `pageblitz_fomo_${previewToken || websiteIdProp}`;
        localStorage.setItem(key, String(newMs));
        setFomoExpiresAt(newMs);
      }
      setExtendSuccess(
        res.remainingExtensions && res.remainingExtensions > 0
          ? `Super – du hast jetzt 24 Stunden mehr Zeit. Du kannst noch ${res.remainingExtensions}× verlängern.`
          : "Super – du hast jetzt 24 Stunden mehr Zeit. Das war deine letzte Verlängerung.",
      );
      reservationQuery.refetch();
    } catch (e: any) {
      setExtendError(e?.message || "Verlängerung fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setExtendSubmitting(false);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);

  // Refs für Kaskaden-Update bei Branchen-Änderung
  const prevCategoryRef = useRef<string>('');
  const contentPhaseRef = useRef<'skeleton' | 'colors' | 'images' | 'texts' | 'complete'>('skeleton');
  // Guard: Phase-2 KI-Textgenerierung nur einmal ausführen (verhindert Re-Trigger bei State-Changes)
  const contentGenerationAttemptedRef = useRef(false);

  // Auto-scroll preview to current section
  useEffect(() => {
    const sectionId = STEP_TO_SECTION_ID[currentStep];
    if (!sectionId || !previewInnerRef.current) return;

    // Try id selector first (PremiumLayoutsV2 uses id="hero", id="leistungen" etc.),
    // fall back to data-section attribute for any future components that use it.
    const element = previewInnerRef.current.querySelector(`#${sectionId}`) ||
                    previewInnerRef.current.querySelector(`[data-section="${sectionId}"]`);
    if (!element) return;

    const container = previewInnerRef.current;
    const viewportHeight = 1280 * 0.62;

    // Walk up offsetParent chain to get total offset from the container div,
    // because offsetTop alone only reaches the nearest positioned ancestor.
    let elementTop = 0;
    let el: HTMLElement | null = element as HTMLElement;
    while (el && el !== container) {
      elementTop += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
    }

    // Cap to avoid white space at the bottom
    const maxScroll = Math.max(0, container.scrollHeight - viewportHeight);
    const targetScroll = Math.max(0, Math.min(elementTop - viewportHeight * 0.25, maxScroll));

    setPreviewScrollTop(targetScroll);
  }, [currentStep]);

  // ── Onboarding data ─────────────────────────────────────────────────────
  const [data, setData] = useState<OnboardingData>({
    businessCategory: "",
    businessName: "",
    tagline: "",
    description: "",
    usp: "",
    topServices: [],
    targetAudience: "",
    legalOwner: "",
    legalStreet: "",
    legalZip: "",
    legalCity: "",
    legalEmail: "",
    legalPhone: "",
    openingHours: null,
    legalVatId: "",
    colorScheme: withOnColors({
      primary: "#3B82F6",
      secondary: "#1E3A8A",
      accent: "#60A5FA",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
      textLight: "#475569"
    }),
    heroPhotoUrl: "",
    aboutPhotoUrl: "",
    brandLogo: "",
    headlineFont: "",
    headlineSize: "large", // Default: extra groß
    addressingMode: 'du',
  addOnContactForm: true,
    contactFormFields: [
      { id: "name", label: "Name", placeholder: "Max Mustermann", type: "text", required: true },
      { id: "subject", label: "Betreff", placeholder: "Ihr Anliegen", type: "text", required: true },
      { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht...", type: "textarea", required: true },
    ],
    addOnGallery: false,
    addOnGalleryData: { headline: "Unsere Galerie", mode: 'single', images: [], albums: [] },
    addOnMenu: false,
    addOnMenuData: { headline: "Unsere Speisekarte", categories: [{ id: "cat1", name: "Hauptspeisen", items: [{ name: "", description: "", price: "" }] }] },
    addOnPricelist: false,
    addOnPricelistData: { headline: "Unsere Preise", categories: [{ id: "cat1", name: "Leistungen", items: [{ name: "", price: "" }] }] },
    addOnAiChat: false,
    chatWelcomeMessage: "",
    addOnBooking: false,
    subPages: [],
    email: "",
  });

  // ── FOMO timer ──────────────────────────────────────────────────────────
  const [fomoExpiresAt, setFomoExpiresAt] = useState<number | null>(null);
  const countdown = useCountdown(fomoExpiresAt);

  useEffect(() => {
    const key = `pageblitz_fomo_${previewToken || websiteIdProp}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setFomoExpiresAt(parseInt(stored));
    } else {
      const exp = Date.now() + FOMO_DURATION_MS;
      localStorage.setItem(key, String(exp));
      setFomoExpiresAt(exp);
    }
  }, [previewToken, websiteIdProp]);

  // ── tRPC queries ────────────────────────────────────────────────────────
  const { data: existingOnboarding } = trpc.onboarding.get.useQuery(
    { websiteId: websiteId! },
    { enabled: !!websiteId }
  );

  // Fetch GMB photos early so the preview shows real business photos immediately,
  // not stock placeholders. Only runs for GMB businesses (real placeId).
  const { data: earlyGmbData } = trpc.onboarding.getGmbPhotos.useQuery(
    { websiteId: websiteId! },
    { enabled: !!websiteId, staleTime: Infinity }
  );

  // Pre-fill hero/about photos with GMB photos as soon as they're available,
  // so the preview shows real business images from the start.
  // The user can still swap them at the heroPhoto/aboutPhoto step.
  useEffect(() => {
    const photos = earlyGmbData?.photos;
    if (!photos || photos.length === 0) return;
    setData(prev => ({
      ...prev,
      heroPhotoUrl:  prev.heroPhotoUrl  || photos[0],
      aboutPhotoUrl: prev.aboutPhotoUrl || photos[1] || photos[0],
    }));
  }, [earlyGmbData]);

  // Load existing onboarding data when available
  useEffect(() => {
    if (!existingOnboarding) return;

    // Helper to safely convert topServices from DB format
    const rawTopServices = (existingOnboarding as any).topServices;
    const safeTopServices: { title: string; description: string }[] | undefined =
      Array.isArray(rawTopServices) && rawTopServices.length > 0
        ? rawTopServices.map((s: any) => ({ title: s.title || '', description: s.description || '' }))
        : undefined;

    // Sync basic onboarding data
    setData(p => ({
      ...p,
      // Business info
      businessCategory: existingOnboarding.businessCategory || p.businessCategory,
      businessName: existingOnboarding.businessName || p.businessName,
      tagline: existingOnboarding.tagline || p.tagline,
      description: existingOnboarding.description || p.description,
      usp: existingOnboarding.usp || p.usp,
      targetAudience: existingOnboarding.targetAudience || p.targetAudience,
      topServices: safeTopServices || p.topServices,
      // Legal data
      legalOwner: existingOnboarding.legalOwner || p.legalOwner,
      legalStreet: existingOnboarding.legalStreet || p.legalStreet,
      legalZip: existingOnboarding.legalZip || p.legalZip,
      legalCity: existingOnboarding.legalCity || p.legalCity,
      legalEmail: existingOnboarding.legalEmail || p.legalEmail,
      legalPhone: existingOnboarding.legalPhone || p.legalPhone,
      legalVatId: existingOnboarding.legalVatId || p.legalVatId,
      // Brand
      brandColor: (existingOnboarding as any).brandColor || p.brandColor,
      brandSecondaryColor: (existingOnboarding as any).brandSecondaryColor || p.brandSecondaryColor,
      headlineFont: existingOnboarding.headlineFont || p.headlineFont,
      addressingMode: ((existingOnboarding as any).addressingMode as 'du' | 'Sie') || p.addressingMode,
      // Photos
      logoUrl: (existingOnboarding as any).logoUrl || p.logoUrl,
      heroPhotoUrl: existingOnboarding.heroPhotoUrl || p.heroPhotoUrl,
      aboutPhotoUrl: existingOnboarding.aboutPhotoUrl || p.aboutPhotoUrl,
      photoUrls: (existingOnboarding as any).photoUrls || p.photoUrls,
      // Subpages
      subPages: (existingOnboarding as any).subPages || p.subPages,
    }));

    // Sync add-on boolean flags
    if (existingOnboarding.addOnMenu !== undefined && existingOnboarding.addOnMenu !== null) {
      setData(p => ({ ...p, addOnMenu: existingOnboarding.addOnMenu! }));
      _setAddOnMenu(existingOnboarding.addOnMenu!);
    }
    if (existingOnboarding.addOnPricelist !== undefined && existingOnboarding.addOnPricelist !== null) {
      setData(p => ({ ...p, addOnPricelist: existingOnboarding.addOnPricelist! }));
      _setAddOnPricelist(existingOnboarding.addOnPricelist!);
    }
    if (existingOnboarding.addOnGallery !== undefined && existingOnboarding.addOnGallery !== null) {
      setData(p => ({ ...p, addOnGallery: existingOnboarding.addOnGallery! }));
      _setAddOnGallery(existingOnboarding.addOnGallery!);
    }
    if (existingOnboarding.addOnContactForm !== undefined && existingOnboarding.addOnContactForm !== null) {
      setData(p => ({ ...p, addOnContactForm: existingOnboarding.addOnContactForm! }));
    }
    if (existingOnboarding.addOnAiChat !== undefined && existingOnboarding.addOnAiChat !== null) {
      setData(p => ({ ...p, addOnAiChat: existingOnboarding.addOnAiChat! }));
      _setAddOnAiChat(existingOnboarding.addOnAiChat!);
    }
    if (existingOnboarding.addOnBooking !== undefined && existingOnboarding.addOnBooking !== null) {
      setData(p => ({ ...p, addOnBooking: existingOnboarding.addOnBooking! }));
    }
    if (existingOnboarding.chatWelcomeMessage) {
      setData(p => ({ ...p, chatWelcomeMessage: existingOnboarding.chatWelcomeMessage! }));
    }
    // Sync contact form fields - default to simple fields for onboarding
    if (existingOnboarding.contactFormFields) {
      setData(p => ({ ...p, contactFormFields: existingOnboarding.contactFormFields! }));
    }

    // Sync add-on data (menu, pricelist, gallery)
    if (existingOnboarding.addOnMenuData) {
      const menuData = existingOnboarding.addOnMenuData as any;
      setData(p => ({
        ...p,
        addOnMenuData: {
          headline: menuData.headline || p.addOnMenuData.headline,
          categories: menuData.categories || p.addOnMenuData.categories
        }
      }));
    }
    if (existingOnboarding.addOnPricelistData) {
      const pricelistData = existingOnboarding.addOnPricelistData as any;
      setData(p => ({
        ...p,
        addOnPricelistData: {
          headline: pricelistData.headline || p.addOnPricelistData.headline,
          categories: pricelistData.categories || p.addOnPricelistData.categories
        }
      }));
    }
    // Gallery: restore images, mode and albums
    const savedGallery = (existingOnboarding as any).addOnGalleryData as any;
    const galleryImages = (existingOnboarding as any).photoUrls || savedGallery?.images || [];
    const galleryMode = savedGallery?.mode || 'single';
    const galleryAlbums: GalleryAlbum[] = savedGallery?.albums || [];
    setData(p => ({
      ...p,
      addOnGalleryData: {
        headline: savedGallery?.headline || p.addOnGalleryData.headline,
        mode: galleryMode,
        images: galleryImages.length > 0 ? galleryImages : p.addOnGalleryData.images,
        albums: galleryAlbums.length > 0 ? galleryAlbums : p.addOnGalleryData.albums,
      }
    }));

    // Restore section order and visibility from hideSections step
    const rawSectionOrder = (existingOnboarding as any).sectionOrder;
    if (Array.isArray(rawSectionOrder) && rawSectionOrder.length > 0) {
      setSectionOrder(rawSectionOrder);
    }
    const rawHiddenSections = (existingOnboarding as any).hiddenSections;
    if (Array.isArray(rawHiddenSections) && rawHiddenSections.length > 0) {
      setHiddenSections(new Set<string>(rawHiddenSections));
    }
  }, [existingOnboarding]);

  // Synchronize add-on states with data to ensure edit steps appear when selected in real-time
  useEffect(() => {
    if (data.addOnMenu !== _addOnMenu) {
      _setAddOnMenu(data.addOnMenu);
    }
    if (data.addOnPricelist !== _addOnPricelist) {
      _setAddOnPricelist(data.addOnPricelist);
    }
    if (data.addOnGallery !== _addOnGallery) {
      _setAddOnGallery(data.addOnGallery);
    }
    if (data.addOnAiChat !== _addOnAiChat) {
      _setAddOnAiChat(data.addOnAiChat);
    }
  }, [data.addOnMenu, data.addOnPricelist, data.addOnGallery, data.addOnAiChat, _addOnMenu, _addOnPricelist, _addOnGallery, _addOnAiChat]);

  // ── Stable localStorage key – available immediately from props (no async) ──
  // For /preview/TOKEN/onboarding: uses previewToken (always present, no waiting for siteData)
  // For /website/ID/onboarding:    uses websiteIdProp (always present)
  // This replaces the old approach of using the async `websiteId` from siteData.
  const onboardingStorageKey = previewToken
    ? `onboarding_step_token_${previewToken}`
    : websiteIdProp
    ? `onboarding_step_${websiteIdProp}`
    : null;

  // ── Resume from database when onboarding data loads ────────────────────
  // This effect runs when onboarding data is loaded from the server
  // and restores the step position if user returns to an ongoing onboarding
  useEffect(() => {
    // Only proceed if we have onboarding data and are still at welcome step
    if (!existingOnboarding || currentStep !== 'welcome') return;

    // First check localStorage (takes precedence)
    const savedStep = onboardingStorageKey
      ? localStorage.getItem(onboardingStorageKey)
      : null;

    if (savedStep && savedStep !== 'welcome') {
      setCurrentStep(savedStep as ChatStep);
      return;
    }

    // If no localStorage, check stepCurrent from database
    const dbStepCurrent = existingOnboarding?.stepCurrent;
    if (dbStepCurrent !== undefined && dbStepCurrent !== null) {
      const stepIndex = dbStepCurrent;
      if (stepIndex >= 0 && stepIndex < STEP_ORDER.length) {
        const targetStep = STEP_ORDER[stepIndex];
        if (targetStep && targetStep !== 'welcome') {
          setCurrentStep(targetStep);
          // Also save to localStorage for next time
          if (onboardingStorageKey) {
            localStorage.setItem(onboardingStorageKey, targetStep);
          }
        }
      }
    }
  }, [existingOnboarding, currentStep, onboardingStorageKey]);

  // ── tRPC mutations ──────────────────────────────────────────────────────
  const saveStepMutation = trpc.onboarding.saveStep.useMutation();
  const completeMutation = trpc.onboarding.complete.useMutation();
  const checkoutMutation = trpc.checkout.createSession.useMutation();
  const generateTextMutation = trpc.onboarding.generateText.useMutation();
  const suggestServicesMutation = trpc.onboarding.suggestServices.useMutation();
  const uploadLogoMutation = trpc.onboarding.uploadLogo.useMutation();
  const generateWebsiteAsyncMutation = trpc.selfService.generateWebsiteAsync.useMutation();
  const trpcContext = trpc.useContext();
  const updateCaptureStatusMutation = trpc.selfService.updateCaptureStatus.useMutation();
  const sendLeadEmailMutation = trpc.selfService.sendLeadEmail.useMutation();
  const saveCustomerEmailMutation = trpc.selfService.saveCustomerEmail.useMutation();
  const generateInitialContentMutation = trpc.selfService.generateInitialContent.useMutation();
  // ── Variant picker state ────────────────────────────────────────────────
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState("");
  // Track if initial content is being generated for skeleton loading
  const [isGeneratingInitialContent, setIsGeneratingInitialContent] = useState(() => {
    // Check localStorage for generation in progress (persists across reloads)
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`generating_${previewToken || websiteIdProp}`) === 'true';
    }
    return false;
  });
  
  // Content revelation phases for progressive onboarding
  // 'skeleton': Everything is skeleton (start)
  // 'colors': Colors ready, everything else skeleton
  // 'images': Colors + Images ready, text skeleton
  // 'texts': Colors + Images + Text ready, services skeleton
  // 'complete': Everything ready
  const [contentPhase, setContentPhase] = useState<'skeleton' | 'colors' | 'images' | 'texts' | 'complete'>(() => {
    // Check localStorage for persisted phase
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`contentPhase_${previewToken || websiteIdProp}`);
      return (saved as any) || 'skeleton';
    }
    return 'skeleton';
  });

  // Tracks whether the user has explicitly confirmed their business category.
  // Only after confirmation do we reveal the actual website (exit skeleton phase).
  // On resume: if contentPhase was already past skeleton, treat category as confirmed.
  const [categoryConfirmed, setCategoryConfirmed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`contentPhase_${previewToken || websiteIdProp}`);
      return saved !== null && saved !== 'skeleton';
    }
    return false;
  });

  // Progressive reveal: hero area clears after Du/Sie is confirmed.
  // On resume: if content generation already completed, Du/Sie was definitely answered → skip overlay.
  const [heroRevealed, setHeroRevealed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`contentPhase_${previewToken || websiteIdProp}`);
      if (saved === 'complete') return true;
    }
    return false;
  });

  // Safety net: if existingOnboarding loads with addressingMode already set, lift the overlay.
  // Handles the case where user reloads mid-flow past the Du/Sie step.
  useEffect(() => {
    if (!heroRevealed && (existingOnboarding as any)?.addressingMode) {
      setHeroRevealed(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(existingOnboarding as any)?.addressingMode]);

  // Progressive reveal: lower content area clears after text generation finishes.
  // On resume: skip overlay only if fully complete.
  const [contentRevealed, setContentRevealed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`contentPhase_${previewToken || websiteIdProp}`);
      return saved === 'complete';
    }
    return false;
  });


  // ── Pre-fill colors from existing colorScheme ───────────────────────────
  useEffect(() => {
    if (siteData?.website?.colorScheme && !initialized) {
      const cs = siteData.website.colorScheme as ColorScheme;
      setData((prev) => ({
        ...prev,
        colorScheme: {
          ...withOnColors({
            primary: cs.primary || prev.colorScheme.primary,
            secondary: cs.secondary || prev.colorScheme.secondary,
            accent: cs.accent || prev.colorScheme.accent,
            background: cs.background || prev.colorScheme.background,
            surface: cs.surface || prev.colorScheme.surface,
            text: cs.text || prev.colorScheme.text,
            textLight: cs.textLight || prev.colorScheme.textLight,
            gradient: cs.gradient || prev.colorScheme.gradient,
          }),
          ...(cs.darkBackground ? { darkBackground: cs.darkBackground } : {}),
          ...(cs.lightText ? { lightText: cs.lightText } : {}),
        }
      }));
    }
  }, [siteData?.website?.colorScheme, initialized]);

  // ── Pre-fill from existing websiteData ─────────────────────────────────
  useEffect(() => {
    if (siteData?.website?.websiteData && !initialized) {
      const wd = siteData.website.websiteData as WebsiteData;
      setData((prev) => ({
        ...prev,
        businessName: wd.businessName || prev.businessName,
        tagline: wd.tagline || prev.tagline,
        description: wd.description || prev.description,
        ...(wd.designTokens?.headlineFont ? { headlineFont: wd.designTokens.headlineFont } : {}),
        // If there's an AI-suggested logo font in designTokens, use it as default
        ...(wd.designTokens?.headlineFont && !prev.brandLogo ? { brandLogo: `font:${wd.designTokens.headlineFont}` } : {}),
      }));

      const svcSection = wd.sections?.find((s) => s.type === "services");
      if (svcSection?.items) {
        const svcs = svcSection.items.map((i) => ({ title: i.title || "", description: i.description || "" }));
        setInitialServices(svcs);
        setData((prev) => {
          if (prev.topServices.length === 0) {
            return { ...prev, topServices: svcs };
          }
          return prev;
        });
      }
    }
  }, [siteData?.website?.websiteData, initialized]);

  // ── Persist current step across page reloads ────────────────────────────
  // Save step whenever it changes.
  // Only remove on 'checkout' (payment completed) – NOT on 'preview', so that
  // reloading or re-opening the link returns the user to the preview step instead
  // of restarting from the beginning.
  useEffect(() => {
    if (!onboardingStorageKey) return;
    if (currentStep === 'checkout') {
      localStorage.removeItem(onboardingStorageKey);
    } else if (currentStep !== 'welcome') {
      localStorage.setItem(onboardingStorageKey, currentStep);
    }
  }, [currentStep, onboardingStorageKey]);

  // ── Pre-fill from GMB data ──────────────────────────────────────────────
  useEffect(() => {
    if (business && !initialized) {
      setData((prev) => ({
        ...prev,
        businessName: business.name || prev.businessName,
        businessCategory: translateGmbCategory((business as any).category || "") || prev.businessCategory,
        legalEmail: business.email || prev.legalEmail,
        legalPhone: business.phone || prev.legalPhone,
        email: business.email || prev.email,
      }));
    }
  }, [business, initialized]);

  // ── Pre-fill from website/business data (for non-GMB flows) ───────────────
  useEffect(() => {
    if (!business && siteData?.website && !initialized) {
      // For non-GMB flows, pre-fill from website data if available
      const businessData = (siteData.business || {}) as any;
      const websiteData = (siteData.website.websiteData || {}) as any;
      
      setData((prev) => ({
        ...prev,
        businessName: websiteData.businessName || businessData.name || prev.businessName,
        businessCategory: websiteData.businessCategory || businessData.category || prev.businessCategory,
      }));
    }
  }, [business, siteData?.website, initialized]);

  // ── Scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Bot message helper (word-by-word typing animation) ─────────────────
  const addBotMessage = useCallback((content: string, delay = 600) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      // Show 3-dot indicator for `delay` ms, then start word-by-word typing
      setTimeout(() => {
        const msgId = genId();
        const words = content.split(" ");
        // Insert empty message first
        setMessages((prev) => [
          ...prev,
          { id: msgId, role: "bot", content: "", timestamp: Date.now() },
        ]);
        // Type word by word
        const WPM = 280; // words per minute
        const msPerWord = Math.max(20, Math.min(60000 / WPM, 80));
        let wordIdx = 0;
        const interval = setInterval(() => {
          wordIdx++;
          const partial = words.slice(0, wordIdx).join(" ");
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, content: partial } : m))
          );
          if (wordIdx >= words.length) {
            clearInterval(interval);
            setIsTyping(false);
            resolve();
          }
        }, msPerWord);
      }, delay);
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: genId(), role: "user", content, timestamp: Date.now(), step: currentStep },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // ── Quick-reply suggestions per step ──────────────────────────────────
  const getQuickReplies = useCallback(
    (step: ChatStep): string[] => {
      const name = data.businessName || business?.name || "";
      switch (step) {
        case "businessCategory":
          return [
            "Restaurant",
            "Friseur",
            "Bauunternehmen",
            "Fitness-Studio",
            "Anwaltskanzlei",
            "Zahnarzt",
            "Handwerk",
            "Bar/Tapas",
          ];
        case "businessName": {
          const isGmb = !!(business?.placeId && !business.placeId.startsWith("self-"));
          return isGmb && name ? ["Ja, stimmt!"] : [];
        }
        case "addressingMode":
          return [];
        case "tagline":
          return [
            "Damit Sie sich keine Sorgen mehr machen müssen.",
            "Ihr Problem gelöst. Ihr Ziel erreicht.",
            "Schnell. Zuverlässig. Damit Sie sich aufs Wesentliche konzentrieren.",
          ];
        case "usp":
          return [
            "Kostenloser Vor-Ort-Termin – damit Sie sofort wissen, woran Sie sind",
            "Festpreisgarantie – kein Stress mit unerwarteten Rechnungen",
            "24h-Erreichbarkeit, weil Probleme keine Bürozeiten kennen",
          ];
        case "targetAudience":
          return [
            "Privathaushalte in der Region",
            "Gewerbliche Kunden & Unternehmen",
            "Privat- und Gewerbekunden",
          ];
        case "legalOwner": {
          // Do NOT suggest business name – legalOwner must be a real person's full name
          return [];
        }
        case "legalStreet": {
          // Extract street from GMB address (format: "Straße 12, PLZ Stadt, Land")
          const suggestions: string[] = [];
          if (business?.address) {
            const parts = business.address.split(",");
            if (parts.length >= 1) {
              const street = parts[0].trim();
              if (street && /\d/.test(street)) suggestions.push(street);
            }
          }
          return suggestions;
        }
        case "legalZipCity": {
          // Extract zip+city from GMB address
          const suggestions: string[] = [];
          if (business?.address) {
            const parts = business.address.split(",");
            if (parts.length >= 2) {
              // Try second part which often is "PLZ Stadt"
              const zipCity = parts[1].trim();
              if (/^\d{5}\s+.+/.test(zipCity)) suggestions.push(zipCity);
              else if (parts.length >= 3) {
                const alt = parts[2].trim();
                if (/^\d{5}\s+.+/.test(alt)) suggestions.push(alt);
              }
            }
          }
          return suggestions;
        }
        case "legalEmail": {
          if (data.legalEmail) return [data.legalEmail];
          const emailSuggestions: string[] = [];
          // Prefer the email the user entered before starting onboarding
          if (data.email) emailSuggestions.push(data.email);
          if (business?.email && business.email !== data.email) emailSuggestions.push(business.email);
          return emailSuggestions;
        }
        case "legalPhone":
          return data.legalPhone ? [data.legalPhone] : (business?.phone ? [business.phone] : []);
        case "openingHours":
          return ["Überspringen"];
        case "email":
          return data.legalEmail ? [data.legalEmail] : (business?.email ? [business.email] : []);
        default:
          return [];
      }
    },
    [data.businessName, data.businessCategory, data.legalEmail, data.email, business?.name, business?.address, business?.email, business?.placeId]
  );
  // ── Step promptss ────────────────────────────────────────────────────────
  const getStepPrompt = useCallback(
    (step: ChatStep): string => {
      const name = data.businessName || business?.name || "dein Unternehmen";
      switch (step) {
        case "businessCategory":
          return `Hallo! Bevor wir starten – welche **Branche** ist dein Unternehmen?\n\nBeispiel: Restaurant, Friseur, Bauunternehmen, Fitness-Studio, Anwaltskanzlei, etc.\n\nDas hilft mir, deine Website perfekt auf deine Branche abzustimmen!`;
        case "welcome":
          return `Hey! 👋 Ich bin dein persönlicher Website-Assistent. Ich helfe dir in wenigen Minuten, deine Website mit echten Infos zu befüllen – damit sie nicht mehr generisch klingt, sondern wirklich nach **${name}** aussieht.\n\nKlingt gut? Dann lass uns starten! 🚀`;
        case "businessName": {
          const isGmb = !!(business?.placeId && !business.placeId.startsWith("self-"));
          return isGmb && data.businessName
            ? `Wie lautet der offizielle Name deines Unternehmens? Ich habe **${data.businessName}** vorausgefüllt – stimmt das so?`
            : `Wie lautet der offizielle Name deines Unternehmens?`;
        }
        case "addressingMode":
          return `Kurze Frage zur Sprache deiner Website: Sollen deine Besucher **geduzt** oder **gesiezt** werden?\n\n*Das beeinflusst alle Texte – von Überschriften bis zu Call-to-Actions.*`;
        case "tagline":
          return `Super! Jetzt brauchen wir einen knackigen Slogan für **${data.businessName}** – einen Satz, der sofort klar macht, was ihr macht und warum ihr besonders seid.\n\nBeispiel: *"Qualität, die bleibt – seit 1998"* oder *"Ihr Dach in besten Händen"*\n\nOder soll ich dir einen Vorschlag machen? 💡\n\n*💡 Keine Sorge: Du kannst alle Texte später jederzeit ändern.*`;
        case "description":
          return `Perfekt! Jetzt eine kurze Beschreibung deines Unternehmens – 2-3 Sätze, die erklären, was ihr macht, für wen und was euch auszeichnet.\n\nKein Stress, ich kann dir auch einen Entwurf generieren! ✨\n\n*📸 Fotos, Texte und Farben kannst du übrigens später jederzeit austauschen.*`;
        case "usp":
          return `Was macht **${data.businessName}** einzigartig? Was können Kunden bei euch bekommen, was sie woanders nicht finden?\n\nDein Alleinstellungsmerkmal (USP) – in einem Satz. Ich helfe dir gerne dabei! 🎯`;
        case "services":
          return `Welche sind eure Top-Leistungen? Nenn mir 2-4 Dinge, die ihr am häufigsten anbietet.\n\nIch habe unten Felder vorbereitet – füll sie aus oder lass mich Vorschläge machen! 🔧\n\n*✅ Du kannst Leistungen später jederzeit ergänzen oder ändern.*`;
        case "targetAudience": {
          const cat = (data.businessCategory || "Dienstleistung").toLowerCase();
          let example = "Privatkunden und kleine Unternehmen in der Region";
          if (cat.includes("friseur") || cat.includes("hair") || cat.includes("beauty")) {
            example = "Damen und Herren in Köln, die Wert auf einen modernen Haarschnitt legen";
          } else if (cat.includes("restaurant") || cat.includes("essen") || cat.includes("food") || cat.includes("café")) {
            example = "Feinschmecker und Familien, die gerne in gemütlicher Atmosphäre speisen";
          } else if (cat.includes("bau") || cat.includes("handwerk") || cat.includes("dach")) {
            example = "Privathaushalte in Köln, die ein neues Dach brauchen oder sanieren möchten";
          } else if (cat.includes("arzt") || cat.includes("zahnarzt") || cat.includes("medizin")) {
            example = "Patienten, die eine kompetente und einfühlsame zahnärztliche Betreuung suchen";
          } else if (cat.includes("anwalt") || cat.includes("beratung") || cat.includes("recht")) {
            example = "Unternehmen und Privatpersonen, die rechtliche Unterstützung im Arbeitsrecht benötigen";
          }
          return `Für wen macht ihr das alles? Beschreib kurz eure idealen Kunden – wer ruft euch an, wer schreibt euch?\n\nBeispiel: *"${example}"*`;
        }
        case "legalOwner":
          return `📋 **Abschnitt 2: Rechtliche Pflichtangaben**\n\nFür ein vollständiges Impressum und eine korrekte Datenschutzerklärung brauche ich noch ein paar Angaben. Das dauert nur 2 Minuten!\n\nWer ist der **Inhaber oder Geschäftsführer**? (Vollständiger Name, z.B. „Max Mustermann")\n\n*🔒 Diese Angaben sind gesetzlich vorgeschrieben und werden nur im Impressum angezeigt.*`;
        case "legalStreet":
          return `Wie lautet die **Straße und Hausnummer** der Geschäftsadresse?\n\nBeispiel: *Musterstraße 12*`;
        case "legalZipCity":
          return `Und die **Postleitzahl und Stadt**?\n\nBeispiel: *50667 Köln*`;
        case "legalEmail": {
          const prefilledEmail = data.email || business?.email;
          return prefilledEmail
            ? `Welche **E-Mail-Adresse** soll im Impressum stehen? (Pflichtangabe – muss erreichbar sein)\n\nIch schlage **${prefilledEmail}** vor – einfach bestätigen oder eine andere eingeben.`
            : `Welche **E-Mail-Adresse** soll im Impressum stehen? (Pflichtangabe – muss erreichbar sein)\n\nBeispiel: *info@musterfirma.de*`;
        }
        case "legalPhone":
          return `Welche **Telefonnummer** soll im Impressum und auf der Website stehen?\n\nBeispiel: *+49 2871 123456*`;
        case "openingHours":
          return `Zu welchen Zeiten bist du für Kunden erreichbar? 🕐\n\nGib deine Öffnungszeiten ein oder überspringe diesen Schritt – du kannst sie jederzeit später im Dashboard anpassen.`;
        case "legalVat":
          return `Hast du eine **Umsatzsteuer-ID**? (z.B. DE123456789)\n\nFalls nicht vorhanden oder du Kleinunternehmer bist, schreib einfach "Nein" oder lass das Feld leer.`;
        case "hideSections":
          return `Wir sind fast fertig! 🎉 Hier siehst du alle Bereiche, die wir für dich vorbereitet haben. Standardmäßig sind alle aktiv (**grüner Haken**).\n\nFalls du einen Bereich zum Start doch lieber ausblenden möchtest, klicke ihn einfach an. Keine Sorge – du kannst alles später jederzeit im Dashboard wieder ändern!`;
        case "colorScheme":
          return `🎨 **Gestalte den Look deiner Website!**\n\nWähle ein Farbschema, das zu deinem Unternehmen passt. Alle Schemen wurden nach farbpsychologischen Aspekten optimiert.\n\n*💡 Keine Angst: Du kannst jede einzelne Farbe später in deinem Dashboard noch feiner anpassen!*`;
        case "heroPhoto": {
          const total = dynamicStepOrder.filter((s) => s === "heroPhoto" || s === "aboutPhoto").length;
          const intro = total > 1 
            ? `Schön! Wir gehen jetzt nacheinander die **${total} wichtigsten Bilder** deiner Website durch. Starten wir mit dem **Hauptbild**!` 
            : `Schön! Jetzt wählen wir das **Hauptbild** für deine Website.`;
          return `${intro} Du kannst ein eigenes Foto hochladen oder aus unseren Vorschlägen wählen – passend zu deiner Branche.`;
        }
        case "aboutPhoto": {
          const total = dynamicStepOrder.filter((s) => s === "heroPhoto" || s === "aboutPhoto").length;
          return `Super! Jetzt wählen wir noch ein **zweites Bild** (2/${total}) für den "Über uns"-Bereich deiner Website. Dieses Bild erscheint im Abschnitt, der dein Unternehmen vorstellt.`;
        }
        case "brandLogo":
          return `Hast du ein **Logo**? Du kannst es hier hochladen.\n\nFalls nicht – kein Problem! Ich zeige dir drei verschiedene Schriftarten, mit denen wir deinen Firmennamen als Logo darstellen können. Wähle einfach deinen Favoriten.`;
        case "headlineFont":
          return `Perfekt! Jetzt wählen wir noch die **Schriftart für deine Überschriften**. Das gibt deiner Website einen ganz eigenen Charakter!\n\nMöchtest du eine **elegante Serifenschrift** (klassisch, zeitlos) oder eine **moderne Serifenlose** (clean, aktuell)?`;
        case "headlineSize":
          return `Fast fertig! Wie groß sollen deine Überschriften sein?\n\n🔹 **Extra groß** – Dramatisch, mutig, für kurze, kraftvolle Statements\n🔹 **Groß** – Ausgewogen, klassisch, gut lesbar\n🔹 **Normal** – Dezent, elegant, für längere Texte`;
        case "addons":
          return `⚡ **Abschnitt 3: Extras & Fertigstellung**\n\nFast geschafft! Möchtest du deine Website noch um optionale Features erweitern? Du kannst diese später jederzeit dazu buchen oder wieder entfernen.`;
        case "editAiChat":
          return `Du hast den **KI-Chat** aktiviert! 🤖\n\nMit welcher Nachricht soll dein KI-Assistent Besucher begrüßen?\n\nBeispiel: *"Hallo! Ich bin der digitale Assistent von ${name}. Wie kann ich dir helfen?"*\n\n*Du kannst das später jederzeit im Dashboard anpassen.*`;
        case "editMenu":
          return `Du hast die **Speisekarte** aktiviert! 📖\n\nHier kannst du schon mal ein paar Gerichte eintragen. Keine Sorge, du kannst das später jederzeit vervollständigen oder jetzt einfach überspringen.`;
        case "editPricelist":
          return `Du hast die **Preisliste** aktiviert! 🏷️\n\nHier kannst du deine wichtigsten Leistungen und Preise eintragen. Du kannst das auch später machen oder jetzt ein paar Beispiele hinzufügen.`;
        case "editGallery":
          return `Du hast die **Bildergalerie** aktiviert! 🖼️\n\nWähle hier die ersten Bilder für deine Galerie aus. Du kannst unsere Vorschläge nutzen oder eigene Fotos hochladen. Du kannst bis zu 12 Bilder wählen.`;
        case "subpages":
          return `Brauchst du zusätzliche Unterseiten? Zum Beispiel *"Projekte"*, *"Referenzen"* oder *"Team"*.\n\nDu kannst sie hier vormerken und nach der Freischaltung in deinem **Kunden-Dashboard** ganz einfach mit Inhalten füllen. Jede individuelle Unterseite kostet nur +2,50 €/Monat.\n\n*⚖️ Wichtig: Die rechtlich notwendigen Seiten wie **Impressum** und **Datenschutz** sind bereits kostenlos enthalten und müssen hier nicht hinzugefügt werden.*`;
        case "email":
          return `Fast fertig! 🎊 An welche E-Mail-Adresse sollen wir deine Website-Infos und die Freischalt-Bestätigung schicken?`;
        case "preview":
          return `🎉 **Deine Website ist fertig personalisiert!**\n\nKlicke auf **„Vollbild-Vorschau öffnen"**, um deine echte Website mit deinen echten Daten zu sehen und alle Funktionen zu testen!\n\n*💡 Keine Sorge: Fotos, Texte, Farben – alles kann nach der Freischaltung jederzeit geändert werden. Du bist nicht festgelegt!*`;
        case "checkout":
          return `Bereit zum Freischalten? 🚀 Wähle dein Paket und starte durch!`;
        default:
          return "Nächster Schritt...";
      }
    },
    [data.businessName, data.email, business?.name, business?.email, business?.placeId, data.headlineFont]
  );

  // ── Initialize chat ─────────────────────────────────────────────────────
  // ── Auto-generate website if websiteData is missing ────────────────────
  useEffect(() => {
    if (siteLoading || !websiteId || isGeneratingInitialWebsite) return;
    const hasWebsiteData = !!(siteData?.website?.websiteData);
    if (!hasWebsiteData) {
      setIsGeneratingInitialWebsite(true);
      // Mark generation in progress in localStorage (persists across reloads)
      localStorage.setItem(`generating_${previewToken || websiteIdProp}`, 'true');
      // Für GMB-Flows: 9 Phasen, für non-GMB: nur 5 Phasen (schneller)
      const isGmbFlow = !!(business?.placeId && !business.placeId.startsWith("self-"));
      const allPhases = [
        "Analysiere dein Unternehmen...",
        "Erstelle Texte...",
        "Generiere Design...",
        "Optimiere Bilder...",
        "Baue Struktur auf...",
        "Füge Interaktivität hinzu...",
        "Lade Assets...",
        "Bereite Live-Vorschau vor...",
        "Finalisiere deine Website...",
      ];
      // Non-GMB: Nur erste 5 Phasen zeigen, dafür schneller durchlaufen
      const phases = isGmbFlow ? allPhases : allPhases.slice(0, 5);
      const phaseDuration = isGmbFlow ? 2000 : 1500; // Non-GMB: 1.5s pro Phase
      
      let phaseIdx = 0;
      setGenerationPhase(phases[0]);
      setGenerationProgress(10);
      
      // Start async generation and poll for status
      generateWebsiteAsyncMutation.mutateAsync({ websiteId }).then(async (response) => {
        const jobId = response.jobId;
        
        // Poll for status every 500ms (0.5 seconds) for smoother progress
        const pollInterval = setInterval(async () => {
          try {
            const status = await trpcContext.selfService.getGenerationStatus.fetch({ jobId });
            
            // Update progress from server (0-100)
            if (status.progress > 0) {
              setGenerationProgress(status.progress);
            }
            
            // Update phase text based on progress
            const phaseIndex = Math.min(
              Math.floor((status.progress / 100) * phases.length),
              phases.length - 1
            );
            setGenerationPhase(phases[phaseIndex]);
            
            // Check if completed or failed
            if (status.status === "completed") {
              clearInterval(pollInterval);
              setGenerationProgress(100);
              setGenerationPhase("Website bereit!");
              // Reset generation state and clear localStorage
              setIsGeneratingInitialWebsite(false);
              localStorage.removeItem(`generating_${previewToken || websiteIdProp}`);
              // Refetch then show variant picker (instead of immediate reload)
              refetchSiteData().then(() => {
                setShowVariantPicker(true);
              });
            } else if (status.status === "failed") {
              clearInterval(pollInterval);
              setIsGeneratingInitialWebsite(false);
              localStorage.removeItem(`generating_${previewToken || websiteIdProp}`);
              console.error("Website generation failed:", status.error);
              toast.error("Fehler bei der Website-Erstellung: " + (status.error || "Unbekannter Fehler"));
            }
          } catch (pollErr) {
            console.error("Error polling generation status:", pollErr);
            // Don't stop polling on transient errors
          }
        }, 2000); // Poll every 2 seconds
        
        // Store interval for cleanup
        return () => clearInterval(pollInterval);
      }).catch((err) => {
        setIsGeneratingInitialWebsite(false);
        localStorage.removeItem(`generating_${previewToken || websiteIdProp}`);
        console.error("Failed to start website generation:", err);
        toast.error("Fehler beim Starten der Website-Erstellung: " + (err.message || "Unbekannter Fehler"));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteLoading, websiteId, siteData?.website?.websiteData]);

  useEffect(() => {
    if (!siteLoading && !initialized && !isGeneratingInitialWebsite) {
      setInitialized(true);
      
      // Update captureStatus and send welcome email for external leads
      if (websiteId && siteData?.website?.source === "external") {
        updateCaptureStatusMutation.mutate({
          websiteId,
          captureStatus: "onboarding_started",
        });

        // Email disabled during development
        // sendLeadEmailMutation.mutate({ websiteId, template: "onboardingStarted" });
      }

      const initChat = async () => {
        const source = siteData?.website?.source;
        const customerEmail = (siteData?.website as any)?.customerEmail as string | undefined;
        const hasEmail = !!customerEmail;

        // If customerEmail exists, auto-save it as the notification email
        if (hasEmail && customerEmail) {
          setData((p) => ({ ...p, email: customerEmail }));
          // Also save to database silently
          if (websiteId) {
            try {
              await saveStepMutation.mutateAsync({ 
                websiteId, 
                step: STEP_ORDER.indexOf("email"), 
                data: { email: customerEmail } 
              });
            } catch (e) {
              // Silent fail - not critical
              console.warn("[Onboarding] Could not auto-save email step:", e);
            }
          }
        }

        // Resume from saved step - check localStorage first (stable key, no async), then database
        const savedStep = onboardingStorageKey
          ? localStorage.getItem(onboardingStorageKey)
          : null;

        if (savedStep && savedStep !== 'welcome') {
          const step = savedStep as ChatStep;
          setCurrentStep(step);
          // checkout and preview are pure UI steps – no bot message needed, the UI renders directly
          if (step !== 'checkout' && step !== 'preview') {
            await addBotMessage(getStepPrompt(step), 800);
          }
          return;
        }

        // If no localStorage, check if we have stepCurrent from database.
        // Exception: for admin-generated outreach websites, NEVER restore from DB step
        // on first customer visit (localStorage empty = fresh customer). The admin
        // generation process may have written a stepCurrent that would skip the
        // entire customization flow for the prospect.
        const isAdminFreshVisit = source === "admin" && !savedStep;
        const dbStepCurrent = existingOnboarding?.stepCurrent;
        if (!isAdminFreshVisit && dbStepCurrent !== undefined && dbStepCurrent !== null) {
          // Map step number to ChatStep (only resume if user has actually progressed past step 0)
          const stepIndex = dbStepCurrent;
          if (stepIndex > 0 && stepIndex < STEP_ORDER.length) {
            const targetStep = STEP_ORDER[stepIndex];
            if (targetStep && targetStep !== 'welcome') {
              setCurrentStep(targetStep);
              // Also save to localStorage for next time
              if (onboardingStorageKey) {
                localStorage.setItem(onboardingStorageKey, targetStep);
              }
              if (targetStep !== 'checkout' && targetStep !== 'preview') {
                await addBotMessage(getStepPrompt(targetStep), 800);
              }
              return;
            }
          }
        }

        if ((source === "admin" || source === "external") && (business as any)?.category) {
          // GMB lead (admin outreach or self-service): pre-select category from Google, let user confirm
          const translatedCategory = translateGmbCategory((business as any).category);
          setData((p) => ({ ...p, businessCategory: translatedCategory }));
          setCurrentStep("businessCategory");
          const greeting = source === "admin"
            ? `Hallo! 👋 Deine Website ist bereits fertig – schau sie dir gerne rechts an! Bevor wir zum Checkout gehen, möchten wir noch ein paar Kleinigkeiten mit dir abstimmen.\n\nZuerst: Ich habe deine Branche aus Google erkannt: **${translatedCategory}** ✅\n\nPasst das so, oder möchtest du eine andere Branche auswählen?`
            : `Ich habe deine Branche aus Google erkannt: **${translatedCategory}** ✅\n\nPasst das so, oder möchtest du eine andere Branche auswählen?`;
          await addBotMessage(greeting, 800);
        } else if (source === "admin") {
          setCurrentStep("businessCategory");
          await addBotMessage(
            `Hallo! 👋 Deine Website ist bereits fertig – schau sie dir gerne rechts an! Bevor wir zum Checkout gehen, möchten wir noch ein paar Kleinigkeiten mit dir abstimmen.\n\nZuerst: In welcher **Branche** bist du tätig? (z.B. Friseur, Restaurant, Handwerker …)`,
            800
          );
        } else {
          setCurrentStep("businessCategory");
          await addBotMessage(getStepPrompt("businessCategory"), 800);
        }
      };
      initChat();
    }
  }, [siteLoading, initialized, isGeneratingInitialWebsite, addBotMessage, getStepPrompt, websiteId, siteData?.website?.source, existingOnboarding, onboardingStorageKey]);

  // ── Show full preview whenever the email step is active ─────────────────
  // Covers both admin outreach sites AND the new external try-before-email flow.
  // Fires on every relevant change so it also catches resumed sessions (localStorage
  // step restoration bypasses initChat, so we can't rely on a one-time initChat call).
  useEffect(() => {
    const isIncomplete = contentPhase === 'skeleton' || contentPhase === 'colors' || contentPhase === 'images' || contentPhase === 'texts';
    if (!isIncomplete) return;
    const source = siteData?.website?.source;
    const hasData = !!(siteData?.website?.websiteData);
    const shouldReveal =
      source === "admin" ||
      (source === "external" && hasData && currentStep === "email");
    if (shouldReveal) {
      setContentPhase('complete');
      setCategoryConfirmed(true);
      setHeroRevealed(true);
      setContentRevealed(true);
      if (previewToken || websiteIdProp) {
        localStorage.setItem(`contentPhase_${previewToken || websiteIdProp}`, 'complete');
      }
    }
  }, [siteData?.website?.source, siteData?.website?.websiteData, currentStep, contentPhase, previewToken, websiteIdProp]);

  // ── Progressive content revelation based on user input ─────────

  // Phase 1: When businessCategory is explicitly confirmed by user -> show colors
  // Uses categoryConfirmed (not data.businessCategory) to avoid revealing the website
  // before the user has answered the category question (prevents premature skeleton exit
  // when businessCategory is pre-filled from GMB data or existingOnboarding).
  useEffect(() => {
    if (categoryConfirmed && contentPhase === 'skeleton') {
      setContentPhase('colors');
      localStorage.setItem(`contentPhase_${previewToken || websiteIdProp}`, 'colors');
      
      // Auto-select color scheme based on category
      const industryColors: Record<string, any> = {
        'restaurant': { primary: '#c45c26', secondary: '#f4a261', accent: '#e76f51' },
        'friseur': { primary: '#9a8b7a', secondary: '#f8f6f3', accent: '#c4a882' },
        'bau': { primary: '#4a5568', secondary: '#bfa880', accent: '#e2e8f0' },
        'handwerk': { primary: '#4a5568', secondary: '#bfa880', accent: '#e2e8f0' },
        'fitness': { primary: '#2d3748', secondary: '#4a6b6b', accent: '#e2e8f0' },
        'medizin': { primary: '#64748b', secondary: '#94a3b8', accent: '#e8ded4' },
        'immobilien': { primary: '#1e3a5f', secondary: '#c9a227', accent: '#f5f3f0' },
        'beratung': { primary: '#1e3a5f', secondary: '#9a8b7a', accent: '#e8ded4' },
        'cafe': { primary: '#6b4e3d', secondary: '#d4a574', accent: '#f5e6d3' },
        'hotel': { primary: '#c9a227', secondary: '#2d2d2d', accent: '#f5f3f0' },
        'default': { primary: '#475569', secondary: '#bfa880', accent: '#e2e8f0' },
      };
      
      const category = data.businessCategory?.toLowerCase() || '';
      const matchedKey = Object.keys(industryColors).find(k => category.includes(k)) || 'default';
      const colors = industryColors[matchedKey];
      
      setData(prev => ({
        ...prev,
        colorScheme: {
          ...prev.colorScheme,
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent,
        },
      }));
      
      // After 500ms, reveal images – for GMB flow skip straight to 'complete'
      // because the server already generated full content; 'images' would leave
      // isLoading=true indefinitely since Phase 2 is skipped for GMB.
      setTimeout(() => {
        const isGmb = !!business?.placeId && !business.placeId.startsWith("self-");
        const nextPhase = isGmb ? 'complete' : 'images';
        setContentPhase(nextPhase);
        localStorage.setItem(`contentPhase_${previewToken || websiteIdProp}`, nextPhase);
      }, 500);
    }
  }, [categoryConfirmed, contentPhase, data.businessCategory, previewToken, websiteIdProp]);
  
  // Phase 2: When both category AND name are entered -> generate texts
  useEffect(() => {
    const hasCategory = !!data.businessCategory?.trim();
    const hasName = !!data.businessName?.trim();
    const hasWebsiteId = !!websiteId;
    const isGmbFlow = !!business?.placeId && !business.placeId.startsWith("self-");
    
    // Only proceed if we're at images phase AND addressingMode was confirmed (heroRevealed).
    // This ensures Du/Sie preference is captured before text generation starts.
    if (hasCategory && hasName && hasWebsiteId && !isGmbFlow && contentPhase === 'images' &&
        heroRevealed &&
        !isGeneratingInitialContent && !generateInitialContentMutation.isPending &&
        !contentGenerationAttemptedRef.current) {

      // Guard against double-trigger (state changes can re-fire this effect)
      contentGenerationAttemptedRef.current = true;

      setContentPhase('texts');
      localStorage.setItem(`contentPhase_${previewToken || websiteIdProp}`, 'texts');
      setIsGeneratingInitialContent(true);
      localStorage.setItem(`generating_${previewToken || websiteIdProp}`, 'true');

      generateInitialContentMutation.mutateAsync({
        websiteId,
        businessName: data.businessName,
        businessCategory: data.businessCategory,
        addressingMode: (data.addressingMode as 'du' | 'Sie') || 'du',
      }).then((result) => {
        if (result.success) {
          // Update local data state with generated content + services
          setData(prev => ({
            ...prev,
            tagline: result.tagline || prev.tagline,
            description: result.description || prev.description,
            topServices: result.services?.map((svc: any) => ({
              title: svc.title,
              description: svc.description,
            })) || prev.topServices,
          }));

          toast.success("Website-Texte & Leistungen wurden generiert!", { duration: 2000 });

          // Mark as complete + progressive reveal: lower content area now visible
          setContentPhase('complete');
          localStorage.setItem(`contentPhase_${previewToken || websiteIdProp}`, 'complete');
          setContentRevealed(true);

          // Refetch to update preview
          setTimeout(() => {
            refetchSiteData();
          }, 300);
        }
      }).catch((err) => {
        console.error("Initial content generation failed:", err);
        // Recover gracefully: show website as-is, don't leave stuck skeleton
        setContentPhase('complete');
        localStorage.setItem(`contentPhase_${previewToken || websiteIdProp}`, 'complete');
        setContentRevealed(true);
        toast.error("Texte konnten nicht generiert werden. Du kannst sie später bearbeiten.", { duration: 4000 });
      }).finally(() => {
        setIsGeneratingInitialContent(false);
        localStorage.removeItem(`generating_${previewToken || websiteIdProp}`);
      });
    }
  }, [data.businessCategory, data.businessName, websiteId, business?.placeId, contentPhase,
      heroRevealed, isGeneratingInitialContent, generateInitialContentMutation.isPending, previewToken, websiteIdProp]);

  // Halte contentPhaseRef synchron (damit Kaskaden-useEffect ohne Dependency-Array darauf zugreifen kann)
  useEffect(() => { contentPhaseRef.current = contentPhase; }, [contentPhase]);

  // ── Kaskaden-Update bei Branchen-Änderung ──────────────────────────────
  useEffect(() => {
    const prev = prevCategoryRef.current;
    const next = data.businessCategory;
    prevCategoryRef.current = next;

    // Nicht auslösen bei Erstbefüllung oder wenn sich nichts geändert hat
    if (!prev || !next || prev === next) return;

    // Nur nach abgeschlossenem Onboarding-Initial-Flow
    if (contentPhaseRef.current !== 'complete') return;

    // 1. Fotos aktualisieren (nur explizite Unsplash-Stock-Fotos ersetzen)
    // Leere URLs bleiben leer → HeroPhotoStep wählt später das erste GMB-Foto automatisch
    // GMB-Fotos (lh3.googleusercontent.com, maps.googleapis.com) und eigene Uploads bleiben erhalten
    const isStockHero = !!data.heroPhotoUrl && data.heroPhotoUrl.includes('unsplash.com');
    const isStockAbout = !!data.aboutPhotoUrl && data.aboutPhotoUrl.includes('unsplash.com');

    setData(prev => ({
      ...prev,
      ...(isStockHero  ? { heroPhotoUrl:  getHeroImageUrl(next, data.businessName)  } : {}),
      ...(isStockAbout ? { aboutPhotoUrl: getAboutImageUrl(next, data.businessName) } : {}),
    }));

    // 2. Farbschema zurücksetzen
    const rawColors = getRawIndustryColors(next, data.businessName);
    const newColorScheme = withOnColors(rawColors as any);
    setData(prev => ({ ...prev, colorScheme: newColorScheme }));

    // 3. Preview-Toast (kein Bot-Message – stört den laufenden Chat-Flow nicht)
    setPreviewNotification(`✨ Wird auf „${next}" aktualisiert...`);
    setTimeout(() => setPreviewNotification(null), 4000);

    // 4. KI-Texte neu generieren
    if (websiteId) {
      generateInitialContentMutation.mutateAsync({
        websiteId,
        businessName: data.businessName,
        businessCategory: next,
      }).then((result) => {
        if (result.success) {
          setData(prev => ({
            ...prev,
            tagline:     result.tagline     || prev.tagline,
            description: result.description || prev.description,
            topServices: result.services?.map((svc: any) => ({
              title:       svc.title       || '',
              description: svc.description || '',
            })) || prev.topServices,
          }));
          setTimeout(() => { refetchSiteData(); }, 300);
        }
      }).catch((err) => {
        console.error("Cascade content regeneration failed:", err);
        // Kein Toast – alte Texte bleiben stillschweigend erhalten
      });
    }
  }, [data.businessCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AI text generation ──────────────────────────────────────────────────
  const generateWithAI = async (field: keyof OnboardingData) => {
    if (!websiteId) return;
    const validFields = ["tagline", "description", "usp", "targetAudience"] as const;
    type ValidField = typeof validFields[number];
    if (!validFields.includes(field as ValidField)) return;
    setIsGenerating(true);
    try {
      const context = `Unternehmensname: ${data.businessName || business?.name || ""}, Branche: ${data.businessCategory || business?.category || "Handwerk"}, Adresse: ${business?.address || ""}, Beschreibung: ${data.description || ""}`;
      const result = await generateTextMutation.mutateAsync({
        websiteId,
        field: field as ValidField,
        context,
      });
      if (result.text) {
        setInputValue(result.text);
        toast.success("Text generiert! Du kannst ihn noch anpassen.");
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("429") || msg.includes("overloaded") || msg.includes("Too Many")) {
        toast.error("KI gerade überlastet – bitte in 10 Sekunden nochmal versuchen.");
      } else {
        toast.error("KI-Generierung fehlgeschlagen");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateServicesWithAI = async () => {
    if (!websiteId || isGeneratingServices) return;
    setIsGeneratingServices(true);
    try {
      const context = `Unternehmensname: ${data.businessName || business?.name || ""}, Branche: ${data.businessCategory || business?.category || "Handwerk"}, Adresse: ${business?.address || ""}`;
      const result = await suggestServicesMutation.mutateAsync({ websiteId, context });
      if (result.services && result.services.length > 0) {
        const suggested = result.services.map((s: { title: string; description: string }) => ({ 
          title: s.title, 
          description: s.description 
        }));
        setServiceSuggestions(suggested);
        
        // If current services are empty, pre-fill them for convenience
        if (data.topServices.length === 0 || (data.topServices.length === 1 && !data.topServices[0].title)) {
          setData((p) => ({ ...p, topServices: suggested.slice(0, 3) }));
          toast.success("Vorschläge generiert und eingefügt! Du kannst sie noch anpassen.");
        } else {
          toast.success("Neue Vorschläge generiert! Du kannst sie unten auswählen.");
        }
      }
    } catch {
      toast.error("KI-Vorschläge konnten nicht geladen werden");
    } finally {
      setIsGeneratingServices(false);
    }
  };

  // ── Step advancement ────────────────────────────────────────────────────
  // Steps that get a visual section divider in the chat (instead of a chat bubble)
  const SECTION_DIVIDERS: Partial<Record<ChatStep, { icon: string; title: string; subtitle: string }>> = {
    legalOwner: { icon: "📋", title: "Abschnitt 2: Rechtliche Angaben", subtitle: "Impressum & Datenschutz – dauert nur 2 Minuten" },
    addons: { icon: "⚡", title: "Abschnitt 3: Extras & Fertigstellung", subtitle: "Optionale Features und letzter Schliff" },
  };

  const logStepMutation = trpc.onboarding.logStep.useMutation();

  const advanceToStep = useCallback(
    async (nextStep: ChatStep) => {
      setCurrentStep(nextStep);

      // Synchronously update localStorage to avoid race condition on quick page refresh
      // checkout and preview are saved too so reload brings the user back to the right place
      if (onboardingStorageKey) {
        localStorage.setItem(onboardingStorageKey, nextStep);
      }

      // ── Analytics: track step progression ──
      const stepIdx = STEP_ORDER.indexOf(nextStep as any);
      if (websiteId && stepIdx >= 0) {
        logStepMutation.mutate({ websiteId, step: nextStep, stepIndex: stepIdx, event: "reached" });
      }
      try {
        (window as any).gtag?.("event", "onboarding_step", { step_name: nextStep, step_index: stepIdx });
        (window as any).clarity?.("set", "onboarding_step", nextStep);
      } catch {}

      // If this step has a section divider, inject it as a special message type
      const divider = SECTION_DIVIDERS[nextStep];
      if (divider) {
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: "divider" as any, content: JSON.stringify(divider), timestamp: Date.now() },
        ]);
        await new Promise((r) => setTimeout(r, 400));
      }

      // Show step prompt
      await addBotMessage(getStepPrompt(nextStep), divider ? 200 : 800);
      setTimeout(() => {
        if (["tagline", "description", "usp", "targetAudience"].includes(nextStep)) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 900);
    },
    [addBotMessage, getStepPrompt, SECTION_DIVIDERS, onboardingStorageKey]
  );

  const goToNextStep = useCallback(async () => {
    const idx = dynamicStepOrder.indexOf(currentStep);
    const next = dynamicStepOrder[idx + 1];

    // If in edit mode, return to the original position instead of advancing –
    // UNLESS the next step is an addon config step (editAiChat, editMenu, etc.)
    // that was just activated; those must always be completed even in edit mode.
    if (editMode.isEditing && editMode.returnToStep) {
      const addonConfigSteps: ChatStep[] = ["editAiChat", "editMenu", "editPricelist", "editGallery"];
      if (next && addonConfigSteps.includes(next)) {
        await advanceToStep(next);
        return;
      }
      addBotMessage(`✓ Gespeichert! Ich bringe dich zurück zu deinem aktuellen Schritt...`, 400);
      await new Promise(resolve => setTimeout(resolve, 600));
      const returnStep = editMode.returnToStep;
      setCurrentStep(returnStep);
      setEditMode({ isEditing: false, returnToStep: null });
      await addBotMessage(getStepPrompt(returnStep), 400);
      return;
    }

    if (next) {
      await advanceToStep(next);
    }
  }, [currentStep, dynamicStepOrder, advanceToStep, editMode.isEditing, editMode.returnToStep]);

  // Helper to save step data without blocking chat advancement
  const trySaveStep = async (stepIdx: number, stepData: Record<string, unknown>) => {
    if (!websiteId) return;
    try {
      await saveStepMutation.mutateAsync({ websiteId, step: stepIdx, data: stepData });
      refetchSiteData();
    } catch (e) {
      console.warn("[Onboarding] saveStep failed (non-blocking):", e);
    }
  };

  const handleSubmit = async (value?: string) => {
    // value=undefined means use inputValue; value="" means explicit empty (e.g. businessName confirm)
    const val = value !== undefined ? value.trim() : inputValue.trim();
    const isExplicitEmpty = value === "";
    if (!val && !isExplicitEmpty && !["addons", "subpages", "preview", "checkout", "legalVat", "openingHours"].includes(currentStep)) return;

    setInputValue("");

    const stepIdx = dynamicStepOrder.indexOf(currentStep);
    const nextStep = dynamicStepOrder[stepIdx + 1] as ChatStep;

    try {
      switch (currentStep) {
        case "businessName": {
          const confirmationPattern = /^(ja|j|yes|y|yep|yup|stimmt|ok|okay|klar)$/i;
          if (val && confirmationPattern.test(val.trim())) {
            addUserMessage(`Ja, "${data.businessName}" stimmt! ✓`);
            await trySaveStep(stepIdx, { businessName: data.businessName });
          } else if (val) {
            addUserMessage(val);
            setData((p) => ({ ...p, businessName: val }));
            await trySaveStep(stepIdx, { businessName: val });
          } else {
            addUserMessage(`Ja, "${data.businessName}" stimmt! ✓`);
            await trySaveStep(stepIdx, { businessName: data.businessName });
          }
          break;
        }
        case "tagline":
        case "description":
        case "usp":
        case "targetAudience": {
          // AI intent detection: if user asks for a suggestion, trigger AI generation
          const aiIntentPattern = /vorschlag|generier|mach mir|erstell|schreib|idee|hilf|automatisch|ki|ai\b/i;
          if (aiIntentPattern.test(val)) {
            addUserMessage(val);
            addBotMessage("Klar, ich generiere dir einen Vorschlag! ✨", 200);
            await generateWithAI(currentStep as keyof OnboardingData);
            return; // Don't advance, let user review and submit
          }
          // Use submitted value or fallback to inputValue if empty
          const finalValue = val || inputValue;
          if (!finalValue) return; // Don't submit empty
          
          addUserMessage(finalValue);
          setData((p) => ({ ...p, [currentStep]: finalValue }));
          await trySaveStep(stepIdx, { [currentStep]: finalValue });
          break;
        }
        case "legalOwner": {
          if (val.trim().split(/\s+/).length < 2) {
            toast.error("Bitte gib deinen vollständigen Namen ein (Vor- und Nachname)");
            return;
          }
          addUserMessage(val);
          setData((p) => ({ ...p, legalOwner: val }));
          await trySaveStep(stepIdx, { legalOwner: val });
          break;
        }
        case "legalStreet": {
          if (!val.trim()) { toast.error("Bitte gib Straße und Hausnummer ein"); return; }
          if (!/\d/.test(val)) { toast.error("Bitte gib auch die Hausnummer an (z.B. Musterstraße 12)"); return; }
          addUserMessage(val);
          setData((p) => ({ ...p, legalStreet: val }));
          await trySaveStep(stepIdx, { legalStreet: val });
          break;
        }
        case "legalZipCity": {
          const zipCityMatch = val.trim().match(/^(\d{5})\s+(.+)$/);
          if (!zipCityMatch) { toast.error("Bitte im Format 'PLZ Stadt' eingeben, z.B. 50667 Köln"); return; }
          const zip = zipCityMatch[1];
          const city = zipCityMatch[2];
          addUserMessage(val);
          setData((p) => ({ ...p, legalZip: zip, legalCity: city }));
          await trySaveStep(stepIdx, { legalZip: zip, legalCity: city });
          break;
        }
        case "legalEmail": {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) { toast.error("Bitte gib eine gültige E-Mail-Adresse ein (z.B. info@firma.de)"); return; }
          addUserMessage(val);
          setData((p) => ({ ...p, legalEmail: val.trim() }));
          await trySaveStep(stepIdx, { legalEmail: val.trim() });
          break;
        }
        case "legalPhone": {
          const phoneVal = val.trim();
          if (!phoneVal) { toast.error("Bitte gib eine Telefonnummer ein"); return; }
          addUserMessage(phoneVal);
          setData((p) => ({ ...p, legalPhone: phoneVal }));
          await trySaveStep(stepIdx, { legalPhone: phoneVal });
          break;
        }
        case "openingHours": {
          // Handled exclusively via the UI widget (Übernehmen/Überspringen buttons)
          // Text "Überspringen" from quickReply skips without saving
          addUserMessage("Überspringen");
          setData((p) => ({ ...p, openingHours: null }));
          await trySaveStep(stepIdx, { openingHours: null });
          break;
        }
        case "legalVat": {
          // Empty input or explicit "no" = Kleinunternehmer (no VAT ID)
          const trimmed = val.trim();
          const skip = ["nein", "keine", "n/a", "-", ""].includes(trimmed.toLowerCase()) || trimmed === "";
          const vatRegex = /^DE\d{9}$/i;
          if (!skip && !vatRegex.test(trimmed)) { toast.error("USt-IdNr. muss das Format DE123456789 haben. Schreib 'Nein' oder lass das Feld leer, wenn du keine hast."); return; }
          const vatId = skip ? "" : trimmed.toUpperCase();
          addUserMessage(skip ? "Keine USt-IdNr. (Kleinunternehmer)" : vatId);
          setData((p) => ({ ...p, legalVatId: vatId }));
          await trySaveStep(stepIdx, { legalVatId: vatId });
          break;
        }
        case "email": {
          // Basic email validation
          if (!val.includes("@") || !val.includes(".")) {
            toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
          }
          addUserMessage(val);
          setData((p) => ({ ...p, email: val }));
          // Fire Google Ads conversion for all onboarding starts
          try { (window as any).gtag?.("event", "conversion", { send_to: "AW-16545728698/24hCCMT9wI8cELqRz9E9", value: 1.0, currency: "EUR" }); } catch {}
          // Save as customerEmail in DB when email is captured at the START of onboarding
          const alreadyHasEmail = !!(siteData?.website as any)?.customerEmail;
          // Only do the "capture email → businessCategory" flow when user is at the
          // BEGINNING of the onboarding (businessCategory not yet set).
          // If they've already gone through all content steps, go to the normal next step.
          const isAtStart = !data.businessCategory;
          if (!alreadyHasEmail && websiteId && isAtStart) {
            saveCustomerEmailMutation.mutate(
              { websiteId, email: val },
              {
                onSuccess: () => {
                  toast.success("E-Mail gespeichert! ✅");
                  try { (window as any).gtag?.("event", "conversion", { send_to: "AW-16545728698/24hCCMT9wI8cELqRz9E9", value: 1.0, currency: "EUR" }); } catch {}
                  refetchSiteData();
                },
                onError: () => {
                  toast.error("E-Mail konnte nicht gespeichert werden.");
                },
              }
            );
          }
          break;
        }
        case "businessCategory":
          if (val) {
            addUserMessage(val);
            setData((p) => ({ ...p, businessCategory: val }));
            await trySaveStep(stepIdx, { businessCategory: val });
            setCategoryConfirmed(true); // Triggers contentPhase skeleton → colors transition
          }
          break;
        case "addressingMode":
          // val is "du" or "Sie" – handled by button clicks in the step UI
          break;
        case "colorScheme":
        case "brandLogo":
        case "heroPhoto":
        case "aboutPhoto":
        case "services":
        case "addons":
        case "editMenu":
        case "editPricelist":
        case "editGallery":
        case "subpages":
          // These are handled by the interactive UI below
          return;
        case "hideSections":
          // handled by interactive UI
          break;
        case "preview":
          addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
          break;
        case "checkout":
          break;
      }
    } catch (e) {
      console.error("[Onboarding] handleSubmit error:", e);
    }

    // Always advance to next step, even if save failed
    if (nextStep) {
      // If in edit mode, return to the original position instead of advancing
      if (editMode.isEditing && editMode.returnToStep) {
        addBotMessage(`✓ Gespeichert! Ich bringe dich zurück zu deinem aktuellen Schritt...`, 400);
        await new Promise(resolve => setTimeout(resolve, 600));
        const returnStep = editMode.returnToStep;
        setCurrentStep(returnStep);
        setEditMode({ isEditing: false, returnToStep: null });
        // Show the prompt for the step we're returning to
        await addBotMessage(getStepPrompt(returnStep), 400);
      } else {
        await advanceToStep(nextStep);
      }
    }
  };

  // ── Checkout ────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!websiteId) return;
    try {
      // Complete onboarding first
      await completeMutation.mutateAsync({ websiteId });
      
      // Update captureStatus and send completion email for external leads
      if (siteData?.website?.source === "external") {
        updateCaptureStatusMutation.mutate({
          websiteId,
          captureStatus: "onboarding_completed",
        });
        
        // Email disabled during development
        // sendLeadEmailMutation.mutate({ websiteId, template: "onboardingCompleted" });
      }
      
      // Then create checkout session
      const session = await checkoutMutation.mutateAsync({
        websiteId,
        billingInterval,
        addOns: {
          contactForm: data.addOnContactForm,
          gallery:     data.addOnGallery,
          menu:        _addOnMenu,
          pricelist:   _addOnPricelist,
          aiChat:      _addOnAiChat,
          booking:     data.addOnBooking,
        },
      });
      window.open(session.url, "_blank");
      toast.success("Du wirst zu Stripe weitergeleitet...");
    } catch (e: any) {
      toast.error(e.message || "Fehler beim Checkout");
    }
  };

  // ── Live preview data: merge chat inputs into websiteData in real-time ──
  const liveWebsiteData = useMemo((): WebsiteData | undefined => {
    const base = siteData?.website?.websiteData as WebsiteData | undefined;
    if (!base) return undefined;

    // Deep-clone to avoid mutating the original
    const patched: WebsiteData = JSON.parse(JSON.stringify(base));

    // Patch top-level fields
    if (data.businessName) patched.businessName = data.businessName;
    if (data.tagline) patched.tagline = data.tagline;
    if (data.description) patched.description = data.description;

    // Filter hidden sections
    if (hiddenSections.size > 0) {
      patched.sections = patched.sections.filter((s) => !hiddenSections.has(s.type));
    }

    // Patch sections
    patched.sections = patched.sections.map((section) => {
      if (section.type === "hero") {
        return {
          ...section,
          headline: data.tagline || section.headline,
          subheadline: data.description || section.subheadline,
        };
      }
      if (section.type === "about") {
        return {
          ...section,
          content: data.description || section.content,
          headline: data.businessName ? `Über ${data.businessName}` : section.headline,
        };
      }
      if (section.type === "services") {
        // If user explicitly skipped services (topServices is empty array after skip), remove section
        if (data.topServicesSkipped) return null;
        const filledServices = data.topServices.filter((s) => s.title.trim());
        if (filledServices.length > 0) {
          return {
            ...section,
            items: filledServices.map((s) => ({ title: s.title, description: s.description })),
          };
        }
      }
      if (section.type === "cta") {
        return {
          ...section,
          content: data.targetAudience || section.content,
        };
      }
      return section;
    }).filter(Boolean) as typeof patched.sections;

    // Add Menu section if active
    if (data.addOnMenu && !hiddenSections.has("menu")) {
      const filledCategories = data.addOnMenuData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
      if (filledCategories.length > 0) {
        patched.sections.push({
          type: "menu",
          headline: data.addOnMenuData.headline || "Unsere Speisekarte",
          items: filledCategories.flatMap(c => c.items.filter(i => i.name.trim()).map(i => ({
            title: i.name,
            description: i.description,
            price: i.price,
            category: c.name
          }))) as any
        });
      }
    }

    // Add Pricelist section if active
    if (data.addOnPricelist && !hiddenSections.has("pricelist")) {
      const filledCategories = data.addOnPricelistData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
      if (filledCategories.length > 0) {
        patched.sections.push({
          type: "pricelist",
          headline: data.addOnPricelistData.headline || "Unsere Preise",
          items: filledCategories.flatMap(c => c.items.filter(i => i.name.trim()).map(i => ({
            title: i.name,
            price: i.price,
            category: c.name
          }))) as any
        });
      }
    }

    // Add or update Gallery section if active
    if (data.addOnGallery && !hiddenSections.has("gallery")) {
      const isAlbumMode = data.addOnGalleryData.mode === 'albums';
      const existingGalleryIdx = patched.sections.findIndex(s => s.type === "gallery");

      let gallerySection: any;
      if (isAlbumMode) {
        // Album mode: save albums array; cover = first image of each album
        gallerySection = {
          type: "gallery" as const,
          headline: data.addOnGalleryData.headline || "Unsere Galerie",
          content: "",
          mode: "albums",
          albums: data.addOnGalleryData.albums,
          items: [], // empty in album mode
        };
      } else {
        // Single mode: flat masonry grid
        const gmbFallback = earlyGmbData?.photos?.length ? earlyGmbData.photos : null;
        const fallbackImages = gmbFallback || getGalleryImages(data.businessCategory, data.businessName);
        const galleryImages = data.addOnGalleryData.images.length > 0
          ? data.addOnGalleryData.images
          : fallbackImages;
        const galleryItems = galleryImages.map((img: string, i: number) => ({
          title: `Projekt ${i + 1}`,
          imageUrl: img,
        }));
        gallerySection = {
          type: "gallery" as const,
          headline: data.addOnGalleryData.headline || "Unsere Galerie",
          content: "Entdecken Sie einige Einblicke in unsere Arbeit und Projekte.",
          mode: "single",
          albums: [],
          items: galleryItems,
        };
      }

      if (existingGalleryIdx > -1) {
        patched.sections[existingGalleryIdx] = gallerySection;
      } else {
        patched.sections.push(gallerySection);
      }
    }

    // Ensure contact section exists so it can be shown (locked or unlocked)
    if (!patched.sections.some(s => s.type === "contact") && !hiddenSections.has("contact")) {
      patched.sections.push({
        type: "contact",
        headline: "Kontaktier uns",
        content: "Hast du Fragen? Schreib uns einfach eine Nachricht.",
        ctaText: "Nachricht senden"
      });
    }

    // Apply custom section order from hideSections drag-and-drop step
    // Hero always stays first; non-hero sections are sorted by sectionOrder.
    if (sectionOrder.length > 0) {
      const heroSec = patched.sections.find((s: any) => s.type === "hero");
      const others  = patched.sections.filter((s: any) => s.type !== "hero");
      others.sort((a: any, b: any) => {
        const ai = sectionOrder.indexOf(a.type);
        const bi = sectionOrder.indexOf(b.type);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      patched.sections = heroSec ? [heroSec, ...others] : others;
    }

    // Expose section order to layout components for CSS ordering
    if (sectionOrder.length > 0) {
      (patched as any)._sectionOrder = [...sectionOrder];
    }

    // Patch colorScheme override
    if (data.colorScheme) {
      (patched as any)._colorSchemeOverride = data.colorScheme;
    }

    // Patch headline font into designTokens
    if (data.headlineFont) {
      patched.designTokens = {
        ...(patched.designTokens || {} as any),
        headlineFont: data.headlineFont,
      };
    }

    // Patch logo font or image URL (used by layout components for nav/footer logo)
    if (data.brandLogo?.startsWith("font:")) {
      (patched as any).logoFont = data.brandLogo.replace("font:", "");
      delete (patched as any).logoImageUrl;
    } else if (data.brandLogo?.startsWith("url:")) {
      (patched as any).logoImageUrl = data.brandLogo.replace("url:", "");
      delete (patched as any).logoFont;
    }

    // Patch addOnContactForm state for ContactSection lock
    (patched as any).addOnContactForm = data.addOnContactForm;

    // Patch addOnBooking state so fullscreen preview shows booking section
    (patched as any).addOnBooking = data.addOnBooking;

    // Patch contact form fields for dynamic form rendering
    (patched as any).contactFormFields = data.contactFormFields;

    // Patch about photo URL for "Über uns" section image
    if (data.aboutPhotoUrl) {
      (patched as any).aboutImageUrl = data.aboutPhotoUrl;
    }

    // Expose slug for legal links (Impressum/Datenschutz) in live preview
    const slug = siteData?.website?.slug;
    if (slug) {
      (patched as any)._slug = slug;
    }

    // Patch contact section with user-entered legal data + opening hours
    {
      const contactIdx = patched.sections.findIndex((s: any) => s.type === "contact");
      const contactSec: any = contactIdx > -1 ? patched.sections[contactIdx] : { type: "contact", headline: "Kontakt", items: [] };
      const items: any[] = [...(contactSec.items || [])];
      const setItem = (icon: string, value: string) => {
        if (!value) return;
        const idx = items.findIndex((i: any) => i.icon === icon);
        if (idx > -1) items[idx] = { ...items[idx], description: value };
        else items.push({ icon, description: value });
      };
      // Address from legal data
      const street = data.legalStreet || "";
      const zipCity = data.legalZip && data.legalCity ? `${data.legalZip} ${data.legalCity}` : (data.legalCity || "");
      const address = [street, zipCity].filter(Boolean).join(", ");
      setItem("MapPin", address);
      setItem("Phone", data.legalPhone || "");
      setItem("Mail", data.legalEmail || "");
      // Opening hours: format DayHours[] → compact string
      if (data.openingHours && data.openingHours.length > 0) {
        const openDays = data.openingHours.filter(d => d.open);
        if (openDays.length > 0) {
          const hoursStr = openDays.map(d => {
            const slot1 = `${d.from}–${d.to}`;
            const slot2 = d.from2 && d.to2 ? `, ${d.from2}–${d.to2}` : "";
            return `${d.day.slice(0, 2)}: ${slot1}${slot2}`;
          }).join(" · ");
          setItem("Clock", hoursStr);
        }
      }
      const updated = { ...contactSec, items };
      if (contactIdx > -1) patched.sections[contactIdx] = updated;
      else patched.sections.push(updated);
    }

    return patched;
  }, [
    siteData?.website?.websiteData,
    data.businessName,
    data.tagline,
    data.description,
    data.topServices,
    data.topServicesSkipped,
    data.colorScheme,
    data.headlineFont,
    data.brandLogo,
    data.aboutPhotoUrl,
    data.addOnContactForm,
    data.addOnGallery,
    data.addOnGalleryData,
    data.addOnMenu,
    data.addOnMenuData,
    data.addOnPricelist,
    data.addOnPricelistData,
    data.contactFormFields,
    data.legalStreet, data.legalZip, data.legalCity, data.legalPhone, data.legalEmail,
    data.openingHours,
    hiddenSections,
    sectionOrder,
    siteData?.website?.slug,
  ]);

  // ── Section list for hideSections drag-and-drop step ────────────────────
  const SECTION_LABELS: Record<string, { label: string; emoji: string }> = {
    about:        { label: "Über uns",              emoji: "👤" },
    services:     { label: "Leistungen",            emoji: "🔧" },
    testimonials: { label: "Kundenstimmen",         emoji: "⭐" },
    gallery:      { label: "Bildergalerie",         emoji: "🖼️" },
    contact:      { label: "Kontaktbereich",        emoji: "📬" },
    // cta: not rendered by any layout – intentionally excluded
    features:     { label: "Vorteile",              emoji: "✅" },
    team:         { label: "Team",                  emoji: "👥" },
    faq:          { label: "FAQ",                   emoji: "❓" },
    menu:         { label: "Speisekarte",           emoji: "📖" },
    pricelist:    { label: "Preisliste",            emoji: "🏷️" },
    process:      { label: "Ablauf",                emoji: "⚙️" },
  };

  const allSectionsForHideStep = useMemo(() => {
    const base = siteData?.website?.websiteData as any;
    const fromBase = (base?.sections || []).filter((s: any) => s.type !== "hero");
    const list = [...fromBase];
    if (data.addOnMenu     && !list.some(s => s.type === "menu"))      list.push({ type: "menu" });
    if (data.addOnPricelist && !list.some(s => s.type === "pricelist")) list.push({ type: "pricelist" });
    if (data.addOnGallery  && !list.some(s => s.type === "gallery"))   list.push({ type: "gallery" });
    if (!list.some(s => s.type === "contact"))                          list.push({ type: "contact" });
    const full = list.map((s: any) => ({ type: s.type, ...(SECTION_LABELS[s.type] ?? { label: s.type, emoji: "📄" }) }));
    return Array.from(new Map(full.map(s => [s.type, s])).values());
  }, [siteData?.website?.websiteData, data.addOnMenu, data.addOnPricelist, data.addOnGallery]);

  // Initialise sectionOrder once when the hideSections step first appears
  useEffect(() => {
    if (currentStep === "hideSections" && sectionOrder.length === 0 && allSectionsForHideStep.length > 0) {
      setSectionOrder(allSectionsForHideStep.map(s => s.type));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, allSectionsForHideStep.length]);

  // ── Price calculation ───────────────────────────────────────────────────
  const BASE_PRICE_MONTHLY   = 24.90; // 24,90 €/Monat (monatliche Abrechnung)
  const BASE_PRICE_YEARLY    = 19.90; // 19,90 €/Monat (jährliche Abrechnung)
  const ADDON_PRICE          = 3.90;  // 3,90 € pro Standard-Add-on
  const ADDON_PRICE_AI_CHAT  = 9.90;  // 9,90 € KI-Chat
  const ADDON_PRICE_BOOKING  = 4.90;  // 4,90 € Terminbuchung

  const totalPrice = () => {
    const base  = billingInterval === "yearly" ? BASE_PRICE_YEARLY : BASE_PRICE_MONTHLY;
    let addons  = 0;
    if (data.addOnContactForm) addons += ADDON_PRICE;
    if (data.addOnGallery)     addons += ADDON_PRICE;
    if (_addOnMenu)            addons += ADDON_PRICE;
    if (_addOnPricelist)       addons += ADDON_PRICE;
    if (_addOnAiChat)          addons += ADDON_PRICE_AI_CHAT;
    if (data.addOnBooking)     addons += ADDON_PRICE_BOOKING;
    return (base + addons).toFixed(2).replace(".", ",");
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (siteLoading || isGeneratingInitialWebsite) {
    return <EpicGenerationLoading phase={generationPhase} progress={generationProgress} />;
  }

  const websiteData = siteData?.website?.websiteData as WebsiteData | undefined;
  // Fallback to local data.colorScheme so preview works even when DB value is null
  const colorScheme = (siteData?.website?.colorScheme ?? data.colorScheme ?? undefined) as ColorScheme | undefined;
  const heroImageUrl = (siteData?.website as any)?.heroImageUrl as string | undefined;
  const aboutImageUrl = (siteData?.website as any)?.aboutImageUrl as string | undefined;
  const layoutStyle = (siteData?.website as any)?.layoutStyle as string | undefined;
  const slug = siteData?.website?.slug;

  // ── Variant picker (shown once after generation completes) ───────────────
  if (showVariantPicker && websiteId && websiteData) {
    const industryKey: string = ((siteData?.website as any)?.industry as string) || "general";
    return (
      <VariantPickerScreen
        websiteId={websiteId}
        websiteData={websiteData}
        heroImageUrl={heroImageUrl}
        aboutImageUrl={aboutImageUrl}
        industryKey={industryKey}
        onConfirm={() => {
          setShowVariantPicker(false);
          refetchSiteData();
        }}
        onSkip={() => {
          setShowVariantPicker(false);
          refetchSiteData();
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >

      {/* ── Fullscreen preview overlay ──────────────────────────────────── */}
      {/* Condition: only showFullPreview — data availability is handled inside
          so the overlay ALWAYS renders when the button is pressed. */}
      {showFullPreview && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
          {/* Browser chrome bar */}
          <div
            className="flex items-center gap-3 px-4 bg-slate-900 border-b border-slate-700 flex-shrink-0"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              height: "calc(44px + env(safe-area-inset-top))",
            }}
          >
            <div className="flex gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md text-xs text-slate-400 bg-slate-800 border border-slate-700 mx-3 min-w-0">
              <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="truncate">
                {previewToken ? `pageblitz.de/preview/${previewToken}` : "deine-website.pageblitz.de"}
              </span>
            </div>
            {/* Desktop: "Website freischalten" CTA when on preview step */}
            {currentStep === "preview" && (
              <button
                onClick={async () => {
                  setShowFullPreview(false);
                  addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
                  await advanceToStep("checkout");
                }}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/20 flex-shrink-0"
              >
                <Zap className="w-3 h-3" /> Website freischalten
              </button>
            )}
            {/* Desktop close button */}
            <button
              onClick={() => setShowFullPreview(false)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" /> Schließen
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setShowFullPreview(false)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Website content — always use iframe so that:
              • position:fixed navbars inside layouts are confined to the
                iframe viewport and can NEVER overlap our chrome bar / close
                buttons in the parent window
              • no browser-history side-effects from in-page navigation
              If the preview URL isn't available yet, show a spinner.        */}
          {previewToken ? (
            <iframe
              key={previewToken}
              src={`/preview/${previewToken}`}
              className="flex-1 w-full border-0"
              title="Website Vorschau"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-950">
              <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          )}

          {/* Mobile back bar */}
          <div
            className="lg:hidden bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/60 flex-shrink-0"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {currentStep === "preview" ? (
              <div className="flex gap-2 px-3 py-2">
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    setShowFullPreview(false);
                    addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
                    await advanceToStep("checkout");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  <Zap className="w-4 h-4" /> Website freischalten
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowFullPreview(false)}
                className="w-full flex items-center justify-center gap-2 py-3 mx-3 my-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                style={{ width: "calc(100% - 24px)" }}
              >
                <ChevronLeft className="w-4 h-4" /> Zurück zum Chat
              </button>
            )}
          </div>
        </div>
      )}

      {/* FOMO Header – only shown before payment */}
      {!isPaid && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 text-sm font-medium flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            ⚡ Diese Website ist noch{" "}
            <strong className="font-bold tabular-nums">{countdown}</strong> für dich reserviert
          </span>
          {reservationQuery.data?.canExtend !== false && (
            <button
              type="button"
              onClick={() => {
                setExtendSuccess(null);
                setExtendError(null);
                setExtendReason("");
                setShowExtendModal(true);
              }}
              className="underline underline-offset-2 decoration-white/50 hover:decoration-white text-white/90 hover:text-white text-xs sm:text-sm"
            >
              Du brauchst mehr Zeit?
            </button>
          )}
        </div>
      )}

      {/* Extend-Reservation Modal */}
      {showExtendModal && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !extendSubmitting && setShowExtendModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {extendSuccess ? (
              <>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Alles klar!</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{extendSuccess}</p>
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                >
                  Weiter
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Du brauchst mehr Zeit?</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Kein Problem – wir verlängern deine Reservierung um <strong>24 Stunden</strong>. Magst du uns kurz sagen, was dich gerade abhält? (Optional, hilft uns, Pageblitz besser zu machen.)
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    { v: "besprechen", t: "Ich möchte mit Partner oder Team besprechen" },
                    { v: "content", t: "Ich muss noch Fotos oder Texte besorgen" },
                    { v: "alternativen", t: "Ich vergleiche gerade andere Anbieter" },
                    { v: "zeit", t: "Kurz keine Zeit gehabt" },
                    { v: "other", t: "Anderer Grund" },
                  ].map((opt) => (
                    <label
                      key={opt.v}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        extendReason === opt.v
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="extendReason"
                        value={opt.v}
                        checked={extendReason === opt.v}
                        onChange={(e) => setExtendReason(e.target.value)}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm text-slate-700">{opt.t}</span>
                    </label>
                  ))}
                </div>
                {extendError && (
                  <p className="text-red-600 text-sm mb-4">{extendError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowExtendModal(false)}
                    disabled={extendSubmitting}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleExtend}
                    disabled={extendSubmitting}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {extendSubmitting ? "Verlängere…" : "Um 24 Stunden verlängern"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Chat panel – smooth slide */}
        <div
          className="flex w-full lg:w-[360px] flex-col lg:border-r border-slate-700/50 flex-1 lg:flex-none items-stretch overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxWidth: chatHidden ? 0 : undefined,
            width: chatHidden ? 0 : undefined,
            minWidth: chatHidden ? 0 : undefined,
            opacity: chatHidden ? 0 : 1,
            pointerEvents: chatHidden ? "none" : undefined,
          }}
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-sm">Pageblitz Assistent</h1>
              <p className="text-slate-400 text-xs">Personalisiert deine Website in Minuten</p>
            </div>
            {/* Price badge */}
            <div className="flex-shrink-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-center">
              <p className="text-amber-300 text-xs font-bold leading-tight">Ab 19,90 €</p>
              <p className="text-amber-400/70 text-[10px] leading-tight">/Monat</p>
            </div>

          </div>

          {/* Mobile-only progress bar + step navigation (desktop shows it in the preview panel header) */}
          {currentStep !== "welcome" && currentStep !== "checkout" && (() => {
            const totalSteps = dynamicStepOrder.filter((s) => s !== "welcome").length;
            const rawIdx = dynamicStepOrder.indexOf(currentStep);
            // Guard: if step isn't in dynamicStepOrder yet (add-on states still loading), don't render
            if (rawIdx === -1) return null;
            const currentIdx = rawIdx;
            const pct = totalSteps > 0 ? Math.round((currentIdx / totalSteps) * 100) : 0;

            // Completed steps – same labels as desktop
            const stepLabels: Record<string, string> = {
              businessCategory: "Branche", businessName: "Name", addressingMode: "Anrede",
              brandLogo: "Logo", colorScheme: "Farben", heroPhoto: "Foto", aboutPhoto: "Über uns",
              headlineFont: "Schrift", headlineSize: "Größe", tagline: "Claim",
              description: "Beschreibung", usp: "USP", services: "Leistungen",
              legalOwner: "Impressum", legalStreet: "Adresse", legalZipCity: "Ort",
              legalEmail: "E-Mail", legalPhone: "Telefon", legalVat: "Steuer",
              addons: "Extras", editAiChat: "KI-Chat", editMenu: "Speisekarte", editPricelist: "Preise",
              editGallery: "Galerie", subpages: "Unterseiten", openingHours: "Öffnungszeiten",
              email: "Kontakt", hideSections: "Anzeige",
            };
            const completedSteps = dynamicStepOrder
              .slice(0, currentIdx)
              .filter(s => s !== "welcome" && s !== "checkout" && s !== "preview");

            return (
              <div className="lg:hidden border-b border-slate-700/50 bg-slate-800/40 flex-shrink-0">
                {/* Scrollable step pills – shown when not in edit mode and steps exist */}
                {!editMode.isEditing && completedSteps.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider flex-shrink-0">Bearbeiten:</span>
                    {completedSteps.map(step => (
                      <button
                        key={step}
                        onClick={() => {
                          setEditMode({ isEditing: true, returnToStep: currentStep });
                          setCurrentStep(step);
                        }}
                        className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-700/60 active:bg-slate-600 text-slate-300 border border-slate-600/50 transition-colors"
                        style={{ touchAction: "manipulation" }}
                      >
                        {stepLabels[step] || step}
                      </button>
                    ))}
                  </div>
                )}
                {/* Edit-mode return button */}
                {editMode.isEditing && editMode.returnToStep && (
                  <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                    <span className="text-[10px] text-amber-400">⚡ Bearbeitungsmodus</span>
                    <button
                      onClick={() => {
                        setCurrentStep(editMode.returnToStep!);
                        setEditMode({ isEditing: false, returnToStep: null });
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/30 active:bg-amber-600/50 text-amber-200 border border-amber-500/50 transition-colors"
                      style={{ touchAction: "manipulation" }}
                    >
                      Zurück zum aktuellen Schritt
                    </button>
                  </div>
                )}
                {/* Progress bar + counter */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium tabular-nums flex-shrink-0">
                    {currentIdx}&thinsp;/&thinsp;{totalSteps}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Messages + Input: flex column, messages scroll, input sticky */}
          <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {messages.map((msg) => {
              // Section divider rendering
              if ((msg.role as string) === "divider") {
                let divInfo: { icon: string; title: string; subtitle: string } | null = null;
                try { divInfo = JSON.parse(msg.content); } catch {}
                if (!divInfo) return null;
                return (
                  <div key={msg.id} className="flex items-center gap-3 my-2 px-1">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                    <div className="flex items-center gap-2 bg-slate-700/80 border border-slate-600/60 rounded-xl px-4 py-2 flex-shrink-0 shadow-sm">
                      <span className="text-base">{divInfo.icon}</span>
                      <div>
                        <p className="text-white text-xs font-bold leading-tight">{divInfo.title}</p>
                        <p className="text-slate-400 text-xs leading-tight">{divInfo.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  </div>
                );
              }

              return (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  {/* In-place edit mode */}
                  {msg.role === "user" && inPlaceEditId === msg.id ? (
                    <div className="flex flex-col gap-2 max-w-[85%]">
                      {/* Category picker */}
                      {msg.step === "businessCategory" ? (
                        <div className="flex flex-col gap-3 bg-slate-700/80 rounded-xl p-3 border border-blue-500">
                          <p className="text-slate-300 text-xs">Branche wählen:</p>
                          <CategoryPicker
                            selected={inPlaceEditValue}
                            onSelect={(cat) => {
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: cat } : m));
                              setData((p) => ({ ...p, businessCategory: cat }));
                              setInPlaceEditId(null);
                            }}
                          />
                          <button
                            onClick={() => setInPlaceEditId(null)}
                            className="self-start px-2 py-1 text-xs rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
                          >Abbrechen</button>
                        </div>
                      ) : /* Color picker for color steps */
                      (msg.step === "brandColor" || msg.step === "brandSecondaryColor") ? (
                        <div className="flex flex-col gap-3 bg-slate-700/80 rounded-xl p-3 border border-blue-500">
                          <p className="text-slate-300 text-xs">
                            {msg.step === "brandColor" ? "Hauptfarbe wählen:" : "Sekundärfarbe wählen:"}
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/) ? inPlaceEditValue : "#3b82f6"}
                              onChange={(e) => setInPlaceEditValue(e.target.value)}
                              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-500 bg-transparent"
                              style={{ padding: "2px" }}
                            />
                            <div className="flex-1">
                              <div
                                className="w-full h-10 rounded-lg border border-slate-500"
                                style={{ backgroundColor: inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/) ? inPlaceEditValue : "#3b82f6" }}
                              />
                              <p className="text-slate-400 text-xs mt-1 font-mono">{inPlaceEditValue}</p>
                            </div>
                          </div>
                          {/* Quick presets */}
                          <div className="flex flex-wrap gap-1.5">
                            {["#2563eb","#16a34a","#dc2626","#d97706","#7c3aed","#0891b2","#db2777","#1a1a1a","#f5f5f5","#b8860b"].map((c) => (
                              <button
                                key={c}
                                onClick={() => setInPlaceEditValue(c)}
                                className="w-6 h-6 rounded-full border-2 transition-all"
                                style={{ backgroundColor: c, borderColor: inPlaceEditValue === c ? "white" : "transparent" }}
                                title={c}
                              />
                            ))}
                          </div>
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setInPlaceEditId(null)}
                              className="px-2 py-1 text-xs rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
                            >Abbrechen</button>
                            <button
                              onClick={() => {
                                const step = msg.step;
                                if (!step || !inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/)) { setInPlaceEditId(null); return; }
                                const newVal = inPlaceEditValue;
                                setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                                setData((p) => ({ ...p, [step]: newVal }));
                                setInPlaceEditId(null);
                              }}
                              className="px-2 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >Übernehmen</button>
                          </div>
                        </div>
                      ) : (
                        <>
                        <textarea
                          className="bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-blue-500 outline-none resize-none min-h-[60px] w-full"
                          value={inPlaceEditValue}
                          onChange={(e) => setInPlaceEditValue(e.target.value)}
                          autoFocus
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              const step = msg.step;
                              if (!step || !inPlaceEditValue.trim()) { setInPlaceEditId(null); return; }
                              const newVal = inPlaceEditValue.trim();
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                              if (step === "legalZipCity") {
                                const m = newVal.match(/^(\d{5})\s+(.+)$/);
                                if (m) setData((p) => ({ ...p, legalZip: m[1], legalCity: m[2] }));
                              } else if (step in data) {
                                setData((p) => ({ ...p, [step]: newVal }));
                              }
                              setInPlaceEditId(null);
                            }
                            if (e.key === "Escape") setInPlaceEditId(null);
                          }}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setInPlaceEditId(null)}
                            className="px-2 py-1 text-xs rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
                          >Abbrechen</button>
                          <button
                            onClick={() => {
                              const step = msg.step;
                              if (!step || !inPlaceEditValue.trim()) { setInPlaceEditId(null); return; }
                              const newVal = inPlaceEditValue.trim();
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                              if (step === "legalZipCity") {
                                const m = newVal.match(/^(\d{5})\s+(.+)$/);
                                if (m) setData((p) => ({ ...p, legalZip: m[1], legalCity: m[2] }));
                              } else if (step in data) {
                                setData((p) => ({ ...p, [step]: newVal }));
                              }
                              setInPlaceEditId(null);
                            }}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                          >Speichern</button>
                        </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "bot"
                            ? "bg-slate-700/80 text-slate-100 rounded-tl-sm"
                            : "bg-blue-600 text-white rounded-tr-sm"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.+?)\*/g, "<em>$1</em>")
                            .replace(/\n/g, "<br/>"),
                        }}
                      />
                      {msg.role === "user" && msg.step && (
                        <button
                          onClick={() => {
                            setInPlaceEditId(msg.id);
                            setInPlaceEditValue(msg.content);
                          }}
                          className="w-8 h-8 rounded-md bg-slate-600/50 hover:bg-slate-500/50 active:bg-slate-500/70 flex items-center justify-center transition-colors flex-shrink-0"
                          style={{ touchAction: "manipulation" }}
                          title="Antwort bearbeiten"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-300" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-slate-700/80 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Interactive step UI with futuristic transitions */}
            {!isTyping && (
              <AnimatePresence mode="wait">
                {currentStep === "services" && (
                <motion.div
                  key="services-step"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="ml-9 space-y-3"
                >
                {/* Suggestions Section */}
                {(serviceSuggestions.length > 0 || initialServices.length > 0) && (
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-4">
                    {/* Initial Suggestions */}
                    {initialServices.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3" /> Vorschläge aus Entwurf
                          </p>
                          <button 
                            onClick={() => {
                              const currentValid = data.topServices.filter(s => s.title.trim());
                              const toAdd = initialServices.filter(s => !currentValid.some(ts => ts.title === s.title));
                              setData(p => ({ ...p, topServices: [...currentValid, ...toAdd] }));
                              toast.success(`${toAdd.length} Leistungen hinzugefügt!`);
                            }}
                            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors uppercase font-bold tracking-wider underline underline-offset-2"
                          >
                            Alle übernehmen
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {initialServices.map((s, idx) => {
                            const currentValid = data.topServices.filter(ts => ts.title.trim());
                            const isAlreadyAdded = currentValid.some(ts => ts.title === s.title);
                            return (
                              <button
                                key={`init-${idx}`}
                                onClick={() => {
                                  if (isAlreadyAdded) {
                                    setData(p => ({ ...p, topServices: p.topServices.filter(ts => ts.title !== s.title) }));
                                    toast.success(`"${s.title}" entfernt`);
                                  } else {
                                    setData(p => ({ ...p, topServices: [...currentValid, s] }));
                                    toast.success(`"${s.title}" hinzugefügt!`);
                                  }
                                }}
                                className={`text-left p-2 rounded-xl border transition-all group ${
                                  isAlreadyAdded 
                                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.1)]" 
                                    : "bg-slate-700/40 border-slate-600/50 hover:border-slate-500"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-[11px] font-bold truncate ${isAlreadyAdded ? 'text-blue-300' : 'text-slate-300 group-hover:text-white'}`}>
                                    {s.title}
                                  </span>
                                  {isAlreadyAdded ? (
                                    <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                  ) : (
                                    <Plus className="w-3 h-3 text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" /> KI-Vorschläge
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={generateServicesWithAI}
                            disabled={isGeneratingServices}
                            className="text-[10px] text-violet-400 hover:text-violet-200 transition-colors uppercase font-bold tracking-wider"
                          >
                            {isGeneratingServices ? "Lädt..." : "Neu generieren"}
                          </button>
                          {serviceSuggestions.length > 0 && (
                            <button 
                              onClick={() => {
                                const currentValid = data.topServices.filter(s => s.title.trim());
                                const toAdd = serviceSuggestions.filter(s => !currentValid.some(ts => ts.title === s.title));
                                setData(p => ({ ...p, topServices: [...currentValid, ...toAdd] }));
                                toast.success(`${toAdd.length} Leistungen hinzugefügt!`);
                              }}
                              className="text-[10px] text-violet-400 hover:text-violet-200 transition-colors uppercase font-bold tracking-wider underline underline-offset-2"
                            >
                              Alle übernehmen
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {serviceSuggestions.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {serviceSuggestions.map((s, idx) => {
                            const currentValid = data.topServices.filter(ts => ts.title.trim());
                            const isAlreadyAdded = currentValid.some(ts => ts.title === s.title);
                            return (
                              <button
                                key={`ai-${idx}`}
                                onClick={() => {
                                  if (isAlreadyAdded) {
                                    setData(p => ({ ...p, topServices: p.topServices.filter(ts => ts.title !== s.title) }));
                                    toast.success(`"${s.title}" entfernt`);
                                  } else {
                                    setData(p => ({ ...p, topServices: [...currentValid, s] }));
                                    toast.success(`"${s.title}" hinzugefügt!`);
                                  }
                                }}
                                className={`text-left p-2 rounded-xl border transition-all group ${
                                  isAlreadyAdded 
                                    ? "bg-violet-500/10 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.1)]" 
                                    : "bg-slate-700/40 border-slate-600/50 hover:border-violet-500/40"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-[11px] font-bold truncate ${isAlreadyAdded ? 'text-violet-300' : 'text-slate-300 group-hover:text-violet-200'}`}>
                                    {s.title}
                                  </span>
                                  {isAlreadyAdded ? (
                                    <Check className="w-3 h-3 text-violet-400 flex-shrink-0" />
                                  ) : (
                                    <Plus className="w-3 h-3 text-slate-500 group-hover:text-violet-400 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-[9px] text-slate-500 line-clamp-1 leading-tight group-hover:text-slate-400">
                                  {s.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          onClick={generateServicesWithAI}
                          disabled={isGeneratingServices}
                          className="w-full py-3 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 transition-colors flex flex-col items-center justify-center gap-1 group"
                        >
                          {isGeneratingServices ? (
                            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                              <span className="text-[11px] text-violet-300 font-bold uppercase tracking-wider">KI-Vorschläge generieren</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Manual List Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Deine Auswahl</p>
                    <button 
                      onClick={() => setData(p => ({ ...p, topServices: [] }))}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase font-bold tracking-wider"
                    >
                      Alle leeren
                    </button>
                  </div>
                  
                  {data.topServices.length === 0 ? (
                    <div className="py-8 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl">
                      <p className="text-xs text-slate-500">Noch keine Leistungen hinzugefügt.</p>
                      <button 
                        onClick={() => setData(p => ({ ...p, topServices: [{ title: "", description: "" }] }))}
                        className="text-xs text-blue-400 font-bold mt-2 hover:underline"
                      >
                        Erste Leistung anlegen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.topServices.map((svc, i) => (
                        <div key={i} className="bg-slate-700/60 rounded-xl p-3 space-y-2 border border-slate-600/30">
                          <div className="flex items-center gap-2">
                            <input
                              className="flex-1 bg-slate-600/50 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder={`Name der Leistung (z.B. Haarschnitt)`}
                              value={svc.title}
                              onChange={(e) => {
                                const updated = [...data.topServices];
                                updated[i] = { ...updated[i], title: e.target.value };
                                setData((p) => ({ ...p, topServices: updated }));
                              }}
                            />
                            <button
                              onClick={() => {
                                const updated = data.topServices.filter((_, idx) => idx !== i);
                                setData((p) => ({ ...p, topServices: updated }));
                              }}
                              className="flex-shrink-0 text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-600/50"
                              title="Leistung entfernen"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            className="w-full bg-slate-600/50 text-white text-[11px] px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Kurze Beschreibung (optional)"
                            value={svc.description}
                            onChange={(e) => {
                              const updated = [...data.topServices];
                              updated[i] = { ...updated[i], description: e.target.value };
                              setData((p) => ({ ...p, topServices: updated }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skip warning dialog */}
                {showSkipServicesWarning && (
                  <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-3 space-y-2">
                    <p className="text-amber-200 text-xs font-semibold">⚠️ Wirklich ohne Leistungen fortfahren?</p>
                    <p className="text-amber-300/80 text-xs leading-relaxed">
                      Websites ohne Leistungsübersicht konvertieren deutlich schlechter. Kunden wollen auf einen Blick sehen, was du anbietest – das ist oft der wichtigste Faktor für eine Anfrage.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSkipServicesWarning(false)}
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Doch eintragen
                      </button>
                      <button
                        onClick={async () => {
                          setShowSkipServicesWarning(false);
                          addUserMessage("Keine Leistungen anzeigen");
                          setData((p) => ({ ...p, topServices: [], topServicesSkipped: true }));
                          await trySaveStep(STEP_ORDER.indexOf("services"), { topServices: [] });
                          await goToNextStep();
                        }}
                        className="flex-1 text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Trotzdem überspringen
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setData((p) => ({ ...p, topServices: [...p.topServices, { title: "", description: "" }] }))}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Leistung hinzufügen
                  </button>
                  {!showSkipServicesWarning && (
                    <button
                      onClick={() => setShowSkipServicesWarning(true)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      Keine Leistungen anzeigen
                    </button>
                  )}
                  {/* Weiter-Button im fixen Bottom-Bar */}
              </div>
            </motion.div>
          )}

          {currentStep === "businessCategory" && (
            <motion.div
              key="businessCategory-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
              {/* GMB pre-selected category banner */}
              {data.businessCategory && (
                <div className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/40 rounded-xl px-3 py-2">
                  <span className="text-emerald-400 text-xs">✓ Aus Google My Business:</span>
                  <span className="text-emerald-200 text-sm font-medium">{data.businessCategory}</span>
                  <button
                    onClick={async () => {
                      addUserMessage(`Branche: ${data.businessCategory} ✓`);
                      await trySaveStep(STEP_ORDER.indexOf("businessCategory"), { businessCategory: data.businessCategory });
                      setCategoryConfirmed(true);
                      await goToNextStep();
                    }}
                    className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Übernehmen
                  </button>
                </div>
              )}
              <CategoryPicker
                selected={data.businessCategory}
                onSelect={(cat) => handleSubmit(cat)}
              />
            </motion.div>
          )}

          {currentStep === "colorScheme" && (
            <motion.div
              key="colorScheme-step"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => {
                        setData((p) => ({
                          ...p,
                          colorScheme: {
                            ...scheme.colors,
                            // Preserve user-set dark overrides when switching scheme
                            ...(p.colorScheme.darkBackground ? { darkBackground: p.colorScheme.darkBackground } : {}),
                            ...(p.colorScheme.lightText ? { lightText: p.colorScheme.lightText } : {}),
                          }
                        }));
                        setShowIndividualColors(false);
                      }}
                      className={`text-left p-4 rounded-2xl border-2 transition-all group ${
                        JSON.stringify(data.colorScheme) === JSON.stringify(scheme.colors)
                          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                          : "border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className={`text-sm font-bold transition-colors ${
                          JSON.stringify(data.colorScheme) === JSON.stringify(scheme.colors) ? "text-white" : "text-slate-200 group-hover:text-white"
                        }`}>
                          {scheme.label}
                        </p>
                        {JSON.stringify(data.colorScheme) === JSON.stringify(scheme.colors) && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mb-3 line-clamp-2 italic">
                        {scheme.description}
                      </p>
                      <div className="flex gap-1">
                        {[scheme.colors.primary, scheme.colors.secondary, scheme.colors.accent, scheme.colors.background].map((c, i) => (
                          <div key={i} className="h-6 flex-1 rounded-md border border-white/10" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 🎲 Random Color Generator Button */}
                <button
                  onClick={() => {
                    const randomScheme = generateRandomColorScheme();
                    setData((p) => ({ ...p, colorScheme: randomScheme.colors }));
                    setShowIndividualColors(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl border-2 border-purple-500/50 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-300 hover:text-purple-200 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Überrasch mich! (Zufallsmix)
                </button>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowIndividualColors(!showIndividualColors)}
                    className={`w-full py-3 px-4 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider ${
                      showIndividualColors 
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-400" 
                        : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                    Farben individuell anpassen
                  </button>

                  {showIndividualColors && (() => {
                    const cs = data.colorScheme as any;

                    // Dark section fallbacks (these fields may not exist yet in colorScheme)
                    const darkDefaults: Record<string, string> = {
                      darkBackground: '#0a0a0a',
                      darkSurface: '#1a1a2e',
                      lightText: '#ffffff',
                      lightTextMuted: '#9ca3af',
                    };

                    const getValue = (key: string) =>
                      cs[key] ?? darkDefaults[key] ?? '';

                    const handleColorChange = (key: string, newValue: string) => {
                      setData(p => {
                        const newScheme = { ...(p.colorScheme as any), [key]: newValue };
                        if (['primary', 'secondary', 'accent', 'surface', 'background'].includes(key)) {
                          newScheme[`on${key.charAt(0).toUpperCase() + key.slice(1)}`] = getContrastColor(newValue);
                        }
                        return { ...p, colorScheme: newScheme };
                      });
                    };

                    const colorGroups = [
                      {
                        label: "Basis", dot: "bg-blue-400",
                        keys: [
                          { key: "primary", label: "Hauptfarbe" },
                          { key: "accent", label: "Akzentfarbe" },
                          { key: "background", label: "Hintergrund (helle Layouts)" },
                          { key: "text", label: "Textfarbe" },
                          { key: "textLight", label: "Gedämpfte Schrift" },
                        ],
                      },
                      {
                        label: "Dunkle Layouts & Sektionen", dot: "bg-purple-400",
                        keys: [
                          { key: "darkBackground", label: "Hintergrund (dunkle Layouts)" },
                          { key: "lightText", label: "Heller Text" },
                        ],
                      },
                    ];

                    return (
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {colorGroups.map(({ label, dot, keys }, gi) => (
                          <div key={label} className={gi > 0 ? "mt-4 pt-4 border-t border-slate-700/50" : ""}>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot}`} />
                              {label}
                            </p>
                            <div className="space-y-0.5">
                              {keys.map(item => {
                                const rawVal = getValue(item.key);
                                const colorVal = /^#[0-9A-Fa-f]{6}$/.test(rawVal) ? rawVal : '#888888';
                                return (
                                  <div key={item.key} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-700/40 transition-colors">
                                    <div
                                      className="w-7 h-7 rounded-md border border-slate-600/80 flex-shrink-0 overflow-hidden relative shadow-sm"
                                      style={{ backgroundColor: colorVal }}
                                    >
                                      <input
                                        type="color"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        value={colorVal}
                                        onChange={(e) => handleColorChange(item.key, e.target.value)}
                                      />
                                    </div>
                                    <span className="text-[11px] text-slate-300 flex-1 min-w-0 truncate">{item.label}</span>
                                    <input
                                      type="text"
                                      className="w-[76px] bg-slate-700/60 text-slate-200 text-[11px] px-2 py-1 rounded-md outline-none border border-slate-600/50 font-mono text-center focus:border-blue-500/60 transition-colors"
                                      value={rawVal}
                                      placeholder="#000000"
                                      onChange={(e) => {
                                        const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                                          setData(p => ({ ...p, colorScheme: { ...(p.colorScheme as any), [item.key]: v } }));
                                          if (v.length === 7) handleColorChange(item.key, v);
                                        }
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-700/50">
                          Kontrast-Farben (Text auf farbigen Hintergründen) werden automatisch berechnet.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    addUserMessage(`Farbschema ausgewählt ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("colorScheme"), { colorScheme: data.colorScheme });
                    await goToNextStep();
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  Farben übernehmen <ChevronRight className="w-4 h-4" />
                </button>
            </motion.div>
          )}

          {currentStep === "heroPhoto" && (
            <motion.div
              key="heroPhoto-step"
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9"
            >
              <HeroPhotoStep
                businessCategory={data.businessCategory}
                heroPhotoUrl={data.heroPhotoUrl}
                websiteId={websiteId}
                onSelect={(url) => setData((p) => ({ ...p, heroPhotoUrl: url }))}
                onNext={async () => {
                  const url = data.heroPhotoUrl || "";
                  const label = url ? "Hauptbild ausgewählt ✓" : "Bestehendes Hauptbild behalten ✓";
                  addUserMessage(label);
                  await trySaveStep(STEP_ORDER.indexOf("heroPhoto"), { heroPhotoUrl: url });
                  await goToNextStep();
                }}
              />
            </motion.div>
          )}

          {currentStep === "aboutPhoto" && (
            <motion.div
              key="aboutPhoto-step"
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9"
            >
              <HeroPhotoStep
                businessCategory={data.businessCategory}
                heroPhotoUrl={data.aboutPhotoUrl}
                websiteId={websiteId}
                isAboutPhoto
                onSelect={(url) => setData((p) => ({ ...p, aboutPhotoUrl: url }))}
                onNext={async () => {
                  const url = data.aboutPhotoUrl || "";
                  const label = url ? "Über-uns-Bild ausgewählt ✓" : "Bestehendes Bild behalten ✓";
                  addUserMessage(label);
                  await trySaveStep(STEP_ORDER.indexOf("aboutPhoto"), { aboutPhotoUrl: url });
                  await goToNextStep();
                }}
              />
            </motion.div>
          )}

          {currentStep === "addressingMode" && (
            <motion.div
              key="addressingMode-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
              {/* Du */}
              <button
                onClick={async () => {
                  addUserMessage("Duzen – \"du\" 👋");
                  setData((p) => ({ ...p, addressingMode: 'du' }));
                  const idx = dynamicStepOrder.indexOf("addressingMode");
                  await trySaveStep(idx, { addressingMode: 'du' });
                  // Progressive reveal: Layer 1 lifts after Du/Sie choice
                  setHeroRevealed(true);
                  const _isGmb = !!business?.placeId && !business.placeId.startsWith("self-");
                  if (_isGmb) {
                    // GMB: regenerate text with the chosen addressing mode
                    if (websiteId) {
                      setIsGeneratingInitialContent(true);
                      generateInitialContentMutation.mutateAsync({
                        websiteId,
                        businessName: data.businessName,
                        businessCategory: data.businessCategory,
                        addressingMode: 'du',
                      }).then((result) => {
                        if (result.success) {
                          setData(prev => ({
                            ...prev,
                            tagline: result.tagline || prev.tagline,
                            description: result.description || prev.description,
                            topServices: result.services?.map((s: any) => ({
                              title: s.title, description: s.description,
                            })) || prev.topServices,
                          }));
                        }
                      }).catch(console.error).finally(() => {
                        setIsGeneratingInitialContent(false);
                        setTimeout(() => setContentRevealed(true), 600);
                      });
                    } else {
                      setTimeout(() => setContentRevealed(true), 1000);
                    }
                  }
                  await goToNextStep();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-700/50 bg-slate-800/40 hover:border-blue-500/60 hover:bg-blue-500/10 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">
                  👋
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Du – informell</div>
                  <div className="text-slate-400 text-xs mt-0.5">„Wir helfen <span className="text-blue-400">dir</span>" · modern, direkt, nahbar</div>
                  <div className="text-slate-500 text-[10px] mt-1">Passt gut zu: Restaurants, Friseure, Fitnessstudios, Shops, Startups</div>
                </div>
              </button>

              {/* Sie */}
              <button
                onClick={async () => {
                  addUserMessage("Siezen – \"Sie\" 🤝");
                  setData((p) => ({ ...p, addressingMode: 'Sie' }));
                  const idx = dynamicStepOrder.indexOf("addressingMode");
                  await trySaveStep(idx, { addressingMode: 'Sie' });
                  // Progressive reveal: Layer 1 lifts after Du/Sie choice
                  setHeroRevealed(true);
                  const _isGmb = !!business?.placeId && !business.placeId.startsWith("self-");
                  if (_isGmb) {
                    // GMB: regenerate text with the chosen addressing mode
                    if (websiteId) {
                      setIsGeneratingInitialContent(true);
                      generateInitialContentMutation.mutateAsync({
                        websiteId,
                        businessName: data.businessName,
                        businessCategory: data.businessCategory,
                        addressingMode: 'Sie',
                      }).then((result) => {
                        if (result.success) {
                          setData(prev => ({
                            ...prev,
                            tagline: result.tagline || prev.tagline,
                            description: result.description || prev.description,
                            topServices: result.services?.map((s: any) => ({
                              title: s.title, description: s.description,
                            })) || prev.topServices,
                          }));
                        }
                      }).catch(console.error).finally(() => {
                        setIsGeneratingInitialContent(false);
                        setTimeout(() => setContentRevealed(true), 600);
                      });
                    } else {
                      setTimeout(() => setContentRevealed(true), 1000);
                    }
                  }
                  await goToNextStep();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-700/50 bg-slate-800/40 hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl flex-shrink-0">
                  🤝
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Sie – formell</div>
                  <div className="text-slate-400 text-xs mt-0.5">„Wir helfen <span className="text-emerald-400">Ihnen</span>" · professionell, seriös, vertrauensvoll</div>
                  <div className="text-slate-500 text-[10px] mt-1">Passt gut zu: Anwälte, Steuerberater, Ärzte, Immobilien, Handwerk</div>
                </div>
              </button>
            </motion.div>
          )}

          {currentStep === "brandLogo" && (
            <motion.div
              key="brandLogo-step"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
                <p className="text-slate-400 text-xs">Wähle eine Schriftart für deinen Firmennamen als Logo:</p>
                {LOGO_FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.font}
                    onClick={() => setData((p) => ({ ...p, brandLogo: `font:${opt.font}` }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${data.brandLogo === `font:${opt.font}` ? "border-blue-500 bg-blue-500/10" : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600"}`}
                  >
                    <p className="text-white text-lg mb-1" style={opt.style}>{data.businessName || business?.name || "Mein Unternehmen"}</p>
                    <p className="text-slate-400 text-xs">{opt.label}</p>
                  </button>
                ))}

                {/* Logo upload option */}
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-xs mb-2">Oder eigenes Logo hochladen:</p>
                  {data.brandLogo?.startsWith("url:") ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-blue-500/10">
                      <img src={data.brandLogo.replace("url:", "")} alt="Logo" className="h-10 w-auto max-w-[120px] object-contain rounded" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Logo hochgeladen ✓</p>
                        <button
                          onClick={() => setData((p) => ({ ...p, brandLogo: "font:Montserrat" }))}
                          className="text-slate-400 text-xs hover:text-white transition-colors"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/40 hover:border-slate-500 cursor-pointer transition-all ${uploadLogoMutation.isPending ? "opacity-50 pointer-events-none" : ""}`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !websiteId) return;
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("Logo darf maximal 2 MB groß sein.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            try {
                              const result = await uploadLogoMutation.mutateAsync({
                                websiteId,
                                imageData: base64,
                                mimeType: file.type,
                              });
                              setData((p) => ({ ...p, brandLogo: `url:${result.url}` }));
                              toast.success("Logo erfolgreich hochgeladen!");
                            } catch {
                              toast.error("Upload fehlgeschlagen. Bitte erneut versuchen.");
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      {uploadLogoMutation.isPending ? (
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-white text-sm">{uploadLogoMutation.isPending ? "Wird hochgeladen…" : "Bild auswählen"}</p>
                        <p className="text-slate-400 text-xs">PNG, JPG oder SVG · max. 2 MB</p>
                      </div>
                      <Upload className="w-4 h-4 text-slate-500 ml-auto" />
                    </label>
                  )}
                </div>

                {/* Weiter-Button im fixen Bottom-Bar */}
            </motion.div>
          )}

          {currentStep === "headlineFont" && (
            <motion.div
              key="headlineFont-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
              <p className="text-slate-400 text-xs">Wähle eine Schriftart für deine Überschriften – die Vorschau ändert sich sofort:</p>
                <div className="space-y-2">
                  {(() => {
                    const hideSerifs = prefersSansSerif(data.businessCategory);
                    return (
                      <>
                        {!hideSerifs && (
                          <div>
                            <p className="text-slate-300 text-xs font-semibold mb-2 text-center uppercase tracking-widest opacity-50">Serifenschriften (klassisch, edel)</p>
                            {FONT_OPTIONS.serif.map((opt) => (
                              <button
                                key={opt.font}
                                onClick={() => setData((p) => ({ ...p, headlineFont: opt.font }))}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left mb-3 group ${
                                  data.headlineFont === opt.font
                                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                    : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600"
                                }`}
                              >
                                <p className="text-white text-lg" style={{ fontFamily: `'${opt.font}', serif`, fontWeight: 700 }}>
                                  {opt.label}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className={!hideSerifs ? "mt-6" : ""}>
                          <p className="text-slate-300 text-xs font-semibold mb-2 text-center uppercase tracking-widest opacity-50">Serifenlose (modern, progressiv)</p>
                          {FONT_OPTIONS.sans.map((opt) => (
                            <button
                              key={opt.font}
                              onClick={() => setData((p) => ({ ...p, headlineFont: opt.font }))}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left mb-3 group ${
                                data.headlineFont === opt.font
                                  ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                    : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600"
                                }`}
                              >
                                <p className="text-white text-lg" style={{ fontFamily: `'${opt.font}', sans-serif`, fontWeight: 700 }}>
                                  {opt.label}
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                {/* Weiter-Button im fixen Bottom-Bar */}
            </motion.div>
          )}

          {currentStep === "headlineSize" && (
            <motion.div
              key="headlineSize-step"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
              <p className="text-slate-400 text-xs">Wähle die Größe deiner Überschriften:</p>
                <div className="space-y-2">
                  {[
                    { value: 'large', label: 'Extra groß', desc: 'Dramatisch, mutig', sample: 'PROJEKT' },
                    { value: 'medium', label: 'Groß', desc: 'Ausgewogen, klassisch', sample: 'PROJEKT' },
                    { value: 'small', label: 'Normal', desc: 'Dezent, elegant', sample: 'PROJEKT' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setData((p) => ({ ...p, headlineSize: opt.value as 'large' | 'medium' | 'small' }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left mb-3 group ${
                        data.headlineSize === opt.value
                          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                          : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{opt.label}</p>
                          <p className="text-slate-400 text-xs">{opt.desc}</p>
                        </div>
                        <p 
                          className="text-white/80 font-bold" 
                          style={{ 
                            fontSize: opt.value === 'large' ? '2rem' : opt.value === 'medium' ? '1.5rem' : '1.1rem',
                            fontFamily: data.headlineFont || 'inherit'
                          }}
                        >
                          {opt.sample}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Weiter-Button im fixen Bottom-Bar */}
            </motion.div>
          )}

          {currentStep === "addons" && (
            <motion.div
              key="addons-step"
              initial={{ opacity: 0, scale: 0.9, rotateY: -5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 5 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-2"
            >
                {/* Build industry-specific addon list */}
                {(() => {
                  const cat = data.businessCategory.toLowerCase();
                  // Broad food industry detection
                  const isFood = /restaurant|café|cafe|bistro|bäckerei|bakery|bar|tapas|pizza|sushi|burger|imbiss|gastronomie|lieferservice|delivery|lieferdienst|catering|food|kueche|küche|steakhouse|grill|gasthaus|wirtshaus|tavern|taverne|pizzeria|trattoria|osteria|ristorante/.test(cat);
                  
                  // For everything else, we offer a pricelist
                  const showMenu = isFood;
                  const showPricelist = !isFood;

                  const addons: { key: keyof OnboardingData; label: string; price: string; desc: string; emoji: string }[] = [
                    { key: "addOnContactForm" as const, label: "Kontaktformular", price: "+3,90 €/Monat", desc: "Kunden können direkt anfragen", emoji: "📬" },
                    { key: "addOnGallery" as const, label: "Bildergalerie", price: "+3,90 €/Monat", desc: "Zeig deine Projekte & Fotos", emoji: "🖼️" },
                    ...(showMenu ? [{ key: "addOnMenu" as const, label: "Speisekarte", price: "+3,90 €/Monat", desc: "Deine Gerichte übersichtlich präsentieren", emoji: "📖" }] : []),
                    ...(showPricelist ? [{ key: "addOnPricelist" as const, label: "Preisliste", price: "+3,90 €/Monat", desc: "Deine Leistungen mit Preisen", emoji: "🏷️" }] : []),
                    { key: "addOnAiChat" as const, label: "KI-Chat", price: "+9,90 €/Monat", desc: "Beantwortet Kundenfragen automatisch 24/7", emoji: "🤖" },
                    { key: "addOnBooking" as const, label: "Terminbuchung", price: "+4,90 €/Monat", desc: "Kunden buchen Termine direkt auf der Website", emoji: "📅" },
                  ];

                  return addons.map((addon) => (
                    <button
                      key={addon.key}
                      onClick={() => setData((p) => ({ ...p, [addon.key]: !(p as any)[addon.key] }))}
                      style={{ touchAction: "manipulation" }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        (data as any)[addon.key]
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${(data as any)[addon.key] ? "border-blue-500 bg-blue-500" : "border-slate-500"}`}>
                        {(data as any)[addon.key] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-lg">{addon.emoji}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{addon.label}</p>
                        <p className="text-slate-400 text-xs">{addon.desc}</p>
                      </div>
                      <span className="text-blue-400 text-xs font-medium">{addon.price}</span>
                    </button>
                  ));
                })()}

                {/* Contact Form Info */}
                {data.addOnContactForm && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mt-2">
                    <p className="text-blue-300 text-xs">
                      <strong>📬 Kontaktformular:</strong> Name, Betreff und Nachricht werden angezeigt.
                      Du kannst das Formular später im Kundenportal noch bearbeiten.
                    </p>
                  </div>
                )}
                {/* Booking Info */}
                {data.addOnBooking && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                    <p className="text-emerald-300 text-xs">
                      <strong>📅 Terminbuchung:</strong> Du kannst deine Services und Verfügbarkeit nach der Freischaltung im Kunden-Dashboard einrichten.
                    </p>
                  </div>
                )}
                {/* Weiter-Button wird im fixen Bottom-Bar gerendert (siehe unten) */}
            </motion.div>
          )}

          {currentStep === "editAiChat" && (
            <motion.div
              key="editAiChat-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Begrüßungsnachricht</p>
                <textarea
                  rows={3}
                  value={data.chatWelcomeMessage}
                  onChange={e => setData(p => ({ ...p, chatWelcomeMessage: e.target.value }))}
                  placeholder={`Hallo! Ich bin der digitale Assistent von ${data.businessName || "unserem Unternehmen"}. Wie kann ich dir helfen?`}
                  className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50 resize-none placeholder-slate-500"
                />
                <p className="text-slate-500 text-xs">Der KI-Chat begrüßt Besucher auf deiner Website mit dieser Nachricht. Du kannst sie später im Dashboard jederzeit ändern.</p>
              </div>
              <button
                onClick={() => {
                  const suggestion = `Hallo! Ich bin der digitale Assistent von ${data.businessName || "unserem Unternehmen"}. Wie kann ich dir helfen?`;
                  setData(p => ({ ...p, chatWelcomeMessage: suggestion }));
                }}
                className="w-full text-xs text-slate-400 hover:text-white py-2 px-3 rounded-xl border border-slate-600/50 hover:border-slate-500 bg-slate-700/40 transition-colors"
              >
                💡 Vorschlag übernehmen
              </button>
              {/* Weiter-Button wird im fixen Bottom-Bar gerendert (siehe unten) */}
            </motion.div>
          )}

          {currentStep === "editMenu" && (
            <motion.div
              key="editMenu-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-4"
            >
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Überschrift der Sektion</p>
                  <input
                    className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                    value={data.addOnMenuData.headline}
                    onChange={(e) => {
                      setData(p => ({ ...p, addOnMenuData: { ...p.addOnMenuData, headline: e.target.value } }));
                    }}
                    placeholder="z.B. Unsere Speisekarte"
                  />
                </div>

                {data.addOnMenuData.categories.map((cat, catIdx) => (
                  <div key={cat.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-transparent text-white text-base font-bold outline-none border-b border-slate-700 focus:border-blue-500 pb-1"
                        value={cat.name}
                        onChange={(e) => {
                          const updated = { ...data.addOnMenuData };
                          updated.categories[catIdx].name = e.target.value;
                          setData(p => ({ ...p, addOnMenuData: updated }));
                        }}
                        placeholder="Kategorie (z.B. Hauptgerichte)"
                      />
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnMenuData };
                          updated.categories = updated.categories.filter((_, i) => i !== catIdx);
                          setData(p => ({ ...p, addOnMenuData: updated }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-slate-700/40 rounded-xl p-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              className="flex-1 bg-slate-600/50 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.name}
                              onChange={(e) => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items[itemIdx].name = e.target.value;
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              placeholder="Name des Gerichts"
                            />
                            <input
                              className="w-20 bg-slate-600/50 text-white text-sm px-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-mono text-right"
                              value={item.price}
                              onChange={(e) => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items[itemIdx].price = e.target.value;
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              placeholder="12,50"
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              className="flex-1 bg-slate-600/30 text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.description}
                              onChange={(e) => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items[itemIdx].description = e.target.value;
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              placeholder="Beschreibung (Zutaten, etc.)"
                            />
                            <button 
                              onClick={() => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items = updated.categories[catIdx].items.filter((_, i) => i !== itemIdx);
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnMenuData };
                          updated.categories[catIdx].items.push({ name: "", description: "", price: "" });
                          setData(p => ({ ...p, addOnMenuData: updated }));
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Gericht hinzufügen
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setData(p => ({ 
                        ...p, 
                        addOnMenuData: { 
                          categories: [...p.addOnMenuData.categories, { id: genId(), name: "", items: [{ name: "", description: "", price: "" }] }] 
                        } 
                      }));
                    }}
                    className="flex items-center justify-center gap-2 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-xl border border-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Weitere Kategorie hinzufügen
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        addUserMessage("Speisekarte später ausfüllen");
                        await goToNextStep();
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Mache ich später
                    </button>
                    <button
                      onClick={async () => {
                        const filledCategories = data.addOnMenuData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
                        addUserMessage(`Speisekarte gespeichert (${filledCategories.length} Kategorien) ✓`);
                        await trySaveStep(STEP_ORDER.indexOf("editMenu"), { addOnMenuData: { categories: filledCategories } });
                        await goToNextStep();
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      Speichern & weiter <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
            </motion.div>
          )}

          {currentStep === "editPricelist" && (
            <motion.div
              key="editPricelist-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-4"
            >
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Überschrift der Sektion</p>
                  <input
                    className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                    value={data.addOnPricelistData.headline}
                    onChange={(e) => {
                      setData(p => ({ ...p, addOnPricelistData: { ...p.addOnPricelistData, headline: e.target.value } }));
                    }}
                    placeholder="z.B. Unsere Preise"
                  />
                </div>

                {data.addOnPricelistData.categories.map((cat, catIdx) => (
                  <div key={cat.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-transparent text-white text-base font-bold outline-none border-b border-slate-700 focus:border-blue-500 pb-1"
                        value={cat.name}
                        onChange={(e) => {
                          const updated = { ...data.addOnPricelistData };
                          updated.categories[catIdx].name = e.target.value;
                          setData(p => ({ ...p, addOnPricelistData: updated }));
                        }}
                        placeholder="Kategorie (z.B. Haarschnitte)"
                      />
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnPricelistData };
                          updated.categories = updated.categories.filter((_, i) => i !== catIdx);
                          setData(p => ({ ...p, addOnPricelistData: updated }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2 items-center">
                          <input
                            className="flex-1 bg-slate-600/50 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                            value={item.name}
                            onChange={(e) => {
                              const updated = { ...data.addOnPricelistData };
                              updated.categories[catIdx].items[itemIdx].name = e.target.value;
                              setData(p => ({ ...p, addOnPricelistData: updated }));
                            }}
                            placeholder="Leistung"
                          />
                          <input
                            className="w-20 bg-slate-600/50 text-white text-sm px-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-mono text-right"
                            value={item.price}
                            onChange={(e) => {
                              const updated = { ...data.addOnPricelistData };
                              updated.categories[catIdx].items[itemIdx].price = e.target.value;
                              setData(p => ({ ...p, addOnPricelistData: updated }));
                            }}
                            placeholder="ab 25,-"
                          />
                          <button 
                            onClick={() => {
                              const updated = { ...data.addOnPricelistData };
                              updated.categories[catIdx].items = updated.categories[catIdx].items.filter((_, i) => i !== itemIdx);
                              setData(p => ({ ...p, addOnPricelistData: updated }));
                            }}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnPricelistData };
                          updated.categories[catIdx].items.push({ name: "", price: "" });
                          setData(p => ({ ...p, addOnPricelistData: updated }));
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Leistung hinzufügen
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setData(p => ({ 
                        ...p, 
                        addOnPricelistData: { 
                          categories: [...p.addOnPricelistData.categories, { id: genId(), name: "", items: [{ name: "", price: "" }] }] 
                        } 
                      }));
                    }}
                    className="flex items-center justify-center gap-2 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-xl border border-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Weitere Kategorie hinzufügen
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        addUserMessage("Preisliste später ausfüllen");
                        await goToNextStep();
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Mache ich später
                    </button>
                    <button
                      onClick={async () => {
                        const filledCategories = data.addOnPricelistData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
                        addUserMessage(`Preisliste gespeichert (${filledCategories.length} Kategorien) ✓`);
                        await trySaveStep(STEP_ORDER.indexOf("editPricelist"), { addOnPricelistData: { categories: filledCategories } });
                        await goToNextStep();
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      Speichern & weiter <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
            </motion.div>
          )}

          {currentStep === "editGallery" && (
            <motion.div
              key="editGallery-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-4"
            >
              {/* Überschrift */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Überschrift der Galerie</p>
                <input
                  className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                  value={data.addOnGalleryData.headline}
                  onChange={(e) => setData(p => ({ ...p, addOnGalleryData: { ...p.addOnGalleryData, headline: e.target.value } }))}
                  placeholder="z.B. Unsere Galerie"
                />
              </div>

              {/* Modus-Switch */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Galerie-Typ</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['single', 'albums'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setData(p => ({ ...p, addOnGalleryData: { ...p.addOnGalleryData, mode } }))}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                        data.addOnGalleryData.mode === mode
                          ? 'bg-blue-600/20 border-blue-500/60 text-white'
                          : 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'single' ? (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                          Einzelgalerie
                        </>
                      ) : (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="10" rx="1"/><rect x="3" y="16" width="8" height="5" rx="1"/><rect x="13" y="16" width="8" height="5" rx="1"/></svg>
                          Alben
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Einzelgalerie */}
              {data.addOnGalleryData.mode !== 'albums' && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-4">
                  <p className="text-slate-400 text-xs font-medium">Bilder auswählen:</p>
                  <MultiPhotoSelector
                    websiteId={String(websiteId || "")}
                    selectedPhotos={data.addOnGalleryData.images}
                    onUpdate={(urls) => setData(p => ({ ...p, addOnGalleryData: { ...p.addOnGalleryData, images: urls } }))}
                    industry={data.businessCategory}
                  />
                </div>
              )}

              {/* Alben-Modus */}
              {data.addOnGalleryData.mode === 'albums' && (
                <div className="space-y-3">
                  {data.addOnGalleryData.albums.map((album, albumIdx) => (
                    <div key={album.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                      {/* Album-Header */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Album {albumIdx + 1}</p>
                          <input
                            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                            value={album.name}
                            onChange={(e) => {
                              const updated = [...data.addOnGalleryData.albums];
                              updated[albumIdx] = { ...updated[albumIdx], name: e.target.value };
                              setData(p => ({ ...p, addOnGalleryData: { ...p.addOnGalleryData, albums: updated } }));
                            }}
                            placeholder="z.B. Hochzeiten"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = data.addOnGalleryData.albums.filter((_, i) => i !== albumIdx);
                            setData(p => ({ ...p, addOnGalleryData: { ...p.addOnGalleryData, albums: updated } }));
                          }}
                          className="mt-5 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>

                      {/* Cover-Vorschau */}
                      {album.images.length > 0 && (
                        <div className="flex items-center gap-2">
                          <img src={album.images[0]} alt="Cover" className="w-12 h-12 rounded-lg object-cover border border-slate-600/50" />
                          <p className="text-slate-400 text-[10px]">Albumbild: erstes Foto</p>
                        </div>
                      )}

                      {/* Fotos für dieses Album */}
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Fotos ({album.images.length})</p>
                        <MultiPhotoSelector
                          websiteId={String(websiteId || "")}
                          selectedPhotos={album.images}
                          onUpdate={(urls) => {
                            const updated = [...data.addOnGalleryData.albums];
                            updated[albumIdx] = { ...updated[albumIdx], images: urls };
                            setData(p => ({ ...p, addOnGalleryData: { ...p.addOnGalleryData, albums: updated } }));
                          }}
                          industry={data.businessCategory}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Album hinzufügen */}
                  <button
                    onClick={() => {
                      const newAlbum: GalleryAlbum = { id: `album-${Date.now()}`, name: '', images: [] };
                      setData(p => ({ ...p, addOnGalleryData: { ...p.addOnGalleryData, albums: [...p.addOnGalleryData.albums, newAlbum] } }));
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-600/60 text-slate-400 hover:text-white hover:border-blue-500/50 text-sm transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Album hinzufügen
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === "subpages" && (
            <motion.div
              key="subpages-step"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-4"
            >
              {/* Coming Soon overlay wrapper */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Blurred content behind overlay */}
                <div className="select-none pointer-events-none opacity-40 blur-[1px]">
              {/* Info Card */}
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-white text-xs font-bold leading-tight">Später bearbeitbar</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Hier markierst du deine Wunsch-Seiten. Den Inhalt (Texte, Bilder) kannst du nach der Freischaltung ganz entspannt im **Dashboard** pflegen.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-blue-500/20">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" /> Impressum & Datenschutz (inklusive)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {data.subPages.map((page, i) => (
                    <div key={page.id} className="bg-slate-700/60 rounded-xl p-3 flex gap-2 items-start group border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                      <div className="flex-1 space-y-1.5">
                        <input
                          className="w-full bg-slate-600/50 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Seitenname (z.B. Über uns)"
                          value={page.name}
                          onChange={(e) => {
                            const updated = [...data.subPages];
                            updated[i] = { ...updated[i], name: e.target.value };
                            setData((p) => ({ ...p, subPages: updated }));
                          }}
                        />
                        <input
                          className="w-full bg-slate-600/50 text-white text-[11px] px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Notiz zum Inhalt (optional)"
                          value={page.description}
                          onChange={(e) => {
                            const updated = [...data.subPages];
                            updated[i] = { ...updated[i], description: e.target.value };
                            setData((p) => ({ ...p, subPages: updated }));
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setData((p) => ({ ...p, subPages: p.subPages.filter((_, j) => j !== i) }))}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-600/50 mt-1"
                        title="Unterseite entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <button
                    className="flex items-center justify-center gap-2 text-xs bg-slate-700/50 text-slate-300 py-2.5 rounded-xl border border-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" /> Neue Unterseite hinzufügen <span className="text-blue-400 font-bold">(+9,90 €)</span>
                  </button>
                </div>
                </div>{/* end blurred content */}

                {/* Coming Soon overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-[2px] rounded-2xl z-10">
                  <div className="flex flex-col items-center gap-3 text-center px-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-indigo-300 text-xs font-semibold uppercase tracking-widest">Coming Soon</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                      Unterseiten sind in Kürze verfügbar. Wir arbeiten daran!
                    </p>
                  </div>
                </div>
              </div>{/* end relative wrapper */}

              {/* Weiter-Button im fixen Bottom-Bar */}
            </motion.div>
          )}

          {currentStep === "legalOwner" && business && business.placeId && !business.placeId.startsWith("self-") && (business.address || business.phone || business.email) && (
            <motion.div
              key="legalOwner-gmb-step"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 mt-2"
            >
                {!gmbÜbernommenEditMode ? (
                  <div className="space-y-2">
                    {/* Name field — always required, GMB doesn't provide this */}
                    <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl px-3 py-2.5 space-y-2">
                      <p className="text-xs text-amber-300 font-medium">👤 Pflichtangabe für Impressum</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-14 flex-shrink-0">Inhaber</span>
                        <input
                          type="text"
                          value={data.legalOwner || ""}
                          onChange={(e) => setData((p) => ({ ...p, legalOwner: e.target.value }))}
                          placeholder="Vorname Nachname"
                          className="flex-1 bg-slate-700/60 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-600/50 outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-500"
                        />
                      </div>
                    </div>
                    {/* Preview of the GMB data to be imported */}
                    {(() => {
                      const parts = business.address ? business.address.split(",") : [];
                      const street = parts[0]?.trim() || "";
                      const zipCityRaw = parts[1]?.trim() || parts[2]?.trim() || "";
                      const zipCityMatch = zipCityRaw.match(/(\d{5})\s+(.+)$/);
                      const zip = zipCityMatch?.[1] || "";
                      const city = zipCityMatch?.[2] || "";
                      return (
                        <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl px-3 py-2.5 space-y-1">
                          <p className="text-[10px] text-slate-500 mb-1">Aus Google übernommen:</p>
                          {street && <p className="text-xs text-slate-300">📍 {street}{zip && city ? `, ${zip} ${city}` : ""}</p>}
                          {business.phone && <p className="text-xs text-slate-300">📞 {business.phone}</p>}
                          {business.email && <p className="text-xs text-slate-300">✉️ {business.email}</p>}
                        </div>
                      );
                    })()}
                    <button
                      onClick={async () => {
                        if (!data.legalOwner || data.legalOwner.trim().split(/\s+/).length < 2) {
                          toast.error("Bitte gib deinen vollständigen Namen ein (Vor- und Nachname)");
                          return;
                        }
                        const parts = business.address ? business.address.split(",") : [];
                        const street = parts[0]?.trim() || "";
                        const zipCityRaw = parts[1]?.trim() || parts[2]?.trim() || "";
                        const zipCityMatch = zipCityRaw.match(/(\d{5})\s+(.+)$/);
                        const zip = zipCityMatch?.[1] || "";
                        const city = zipCityMatch?.[2] || "";
                        const phone = business.phone || "";
                        const email = business.email || "";
                        setData((p) => ({
                          ...p,
                          legalStreet: street || p.legalStreet,
                          legalZip: zip || p.legalZip,
                          legalCity: city || p.legalCity,
                          legalPhone: phone || p.legalPhone,
                          legalEmail: email || p.legalEmail,
                        }));
                        const summary = [
                          `Inhaber: ${data.legalOwner.trim()}`,
                          street && `Straße: ${street}`,
                          zip && city && `PLZ/Stadt: ${zip} ${city}`,
                          phone && `Telefon: ${phone}`,
                          email && `E-Mail: ${email}`,
                        ].filter(Boolean).join(" · ");
                        addUserMessage(`📍 GMB-Daten übernommen – ${summary}`);
                        const stepIdx = STEP_ORDER.indexOf("legalOwner");
                        await trySaveStep(stepIdx, { legalOwner: data.legalOwner.trim() });
                        if (street) await trySaveStep(stepIdx + 1, { legalStreet: street });
                        if (zip && city) await trySaveStep(stepIdx + 2, { legalZip: zip, legalCity: city });
                        if (email) await trySaveStep(stepIdx + 3, { legalEmail: email });
                        if (phone) await trySaveStep(stepIdx + 4, { legalPhone: phone });
                        await advanceToStep("legalVat");
                      }}
                      className="w-full flex items-center justify-center gap-2 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-3 py-2.5 rounded-xl transition-all font-medium"
                    >
                      ✓ Diese Daten übernehmen
                    </button>
                  </div>
                ) : (
                  /* Edit mode: show fields inline */
                  <div className="bg-slate-800/80 border border-slate-600/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-400 font-medium">📍 GMB-Daten bearbeiten</span>
                      <button
                        onClick={() => setGmbÜbernommenEditMode(false)}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {[
                      { label: "Inhaber", key: "legalOwner" as const, placeholder: "Vorname Nachname" },
                      { label: "Straße", key: "legalStreet" as const, placeholder: "Musterstraße 1" },
                      { label: "PLZ", key: "legalZip" as const, placeholder: "12345" },
                      { label: "Stadt", key: "legalCity" as const, placeholder: "Musterstadt" },
                      { label: "Telefon", key: "legalPhone" as const, placeholder: "+49 123 456789" },
                      { label: "E-Mail", key: "legalEmail" as const, placeholder: "info@firma.de" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-14 flex-shrink-0">{label}</span>
                        <input
                          type="text"
                          value={data[key] || ""}
                          onChange={(e) => setData((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="flex-1 bg-slate-700/60 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-600/50 outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                        />
                      </div>
                    ))}
                    <button
                      onClick={async () => {
                        if (!data.legalOwner || data.legalOwner.trim().split(/\s+/).length < 2) {
                          toast.error("Bitte gib deinen vollständigen Namen ein (Vor- und Nachname)");
                          return;
                        }
                        setGmbÜbernommenEditMode(false);
                        const stepIdx = STEP_ORDER.indexOf("legalOwner");
                        await trySaveStep(stepIdx, { legalOwner: data.legalOwner.trim() });
                        if (data.legalStreet) await trySaveStep(stepIdx + 1, { legalStreet: data.legalStreet });
                        if (data.legalZip && data.legalCity) await trySaveStep(stepIdx + 2, { legalZip: data.legalZip, legalCity: data.legalCity });
                        if (data.legalEmail) await trySaveStep(stepIdx + 3, { legalEmail: data.legalEmail });
                        if (data.legalPhone) await trySaveStep(stepIdx + 4, { legalPhone: data.legalPhone });
                        await advanceToStep("legalVat");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors mt-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Bestätigen & weiter
                    </button>
                  </div>
                )}
            </motion.div>
          )}

          {/* Pencil to re-open edit mode after GMB data was confirmed */}
          {currentStep !== "legalOwner" && ["legalStreet","legalZipCity","legalEmail","legalPhone","legalVat"].includes(currentStep) && data.legalStreet && (
            <motion.div
              key="legal-edit-pencil"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-9 mt-1"
            >
                <button
                  onClick={() => {
                    setGmbÜbernommenEditMode(true);
                    // Go back to legalOwner step to show the edit panel
                    setCurrentStep("legalOwner" as any);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  title="GMB-Daten nachträglich bearbeiten"
                >
                  <Pencil className="w-3 h-3" /> Angaben bearbeiten
                </button>
            </motion.div>
          )}

          {currentStep === "openingHours" && (
            <motion.div
              key="openingHours-step"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
              {/* Quick-select buttons */}
              <div className="flex flex-wrap gap-2 mb-1">
                {[
                  { label: "Mo – Fr", action: () => setHoursState(h => h.map((d, i) => ({ ...d, open: i < 5 }))) },
                  { label: "Mo – Sa", action: () => setHoursState(h => h.map((d, i) => ({ ...d, open: i < 6 }))) },
                  { label: "Täglich", action: () => setHoursState(h => h.map(d => ({ ...d, open: true }))) },
                  { label: "Alle gleiche Zeit", action: () => {
                    const first = hoursState.find(d => d.open);
                    if (!first) return;
                    setHoursState(h => h.map(d => d.open ? { ...d, from: first.from, to: first.to } : d));
                  }},
                ].map(({ label, action }) => (
                  <button key={label} onClick={action}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 transition-colors">
                    {label}
                  </button>
                ))}
              </div>

              {/* 7-day grid */}
              <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden divide-y divide-white/5">
                {hoursState.map((dh, i) => (
                  <div key={dh.day} className="flex items-center gap-3 px-3 py-2.5">
                    {/* Toggle */}
                    <button
                      onClick={() => setHoursState(h => h.map((d, j) => j === i ? { ...d, open: !d.open } : d))}
                      className={`w-9 h-5 rounded-full flex-shrink-0 transition-colors relative ${dh.open ? 'bg-emerald-500' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${dh.open ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    {/* Day name */}
                    <span className={`text-sm w-24 flex-shrink-0 ${dh.open ? 'text-white' : 'text-slate-500'}`}>
                      {dh.day.slice(0, 2)}
                    </span>
                    {dh.open ? (
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        {/* First time slot */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={dh.from}
                            onChange={e => setHoursState(h => h.map((d, j) => j === i ? { ...d, from: e.target.value } : d))}
                            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-[88px] focus:outline-none focus:border-blue-400"
                          />
                          <span className="text-slate-500 text-xs">–</span>
                          <input
                            type="time"
                            value={dh.to}
                            onChange={e => setHoursState(h => h.map((d, j) => j === i ? { ...d, to: e.target.value } : d))}
                            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-[88px] focus:outline-none focus:border-blue-400"
                          />
                          {/* Add second slot button */}
                          {!dh.from2 && (
                            <button
                              onClick={() => setHoursState(h => h.map((d, j) => j === i ? { ...d, from2: "13:00", to2: "18:00" } : d))}
                              className="ml-1 w-6 h-6 flex-shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors"
                              title="Zweites Zeitfenster hinzufügen (z.B. nach Mittagspause)"
                            >+</button>
                          )}
                        </div>
                        {/* Second time slot (optional, e.g. after lunch break) */}
                        {dh.from2 !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="time"
                              value={dh.from2}
                              onChange={e => setHoursState(h => h.map((d, j) => j === i ? { ...d, from2: e.target.value } : d))}
                              className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-[88px] focus:outline-none focus:border-blue-400"
                            />
                            <span className="text-slate-500 text-xs">–</span>
                            <input
                              type="time"
                              value={dh.to2}
                              onChange={e => setHoursState(h => h.map((d, j) => j === i ? { ...d, to2: e.target.value } : d))}
                              className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-[88px] focus:outline-none focus:border-blue-400"
                            />
                            <button
                              onClick={() => setHoursState(h => h.map((d, j) => j === i ? { ...d, from2: undefined, to2: undefined } : d))}
                              className="ml-1 w-6 h-6 flex-shrink-0 rounded-full bg-white/10 hover:bg-red-500/30 text-slate-400 hover:text-red-400 text-xs flex items-center justify-center transition-colors"
                              title="Zweites Zeitfenster entfernen"
                            >×</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 flex-1">Geschlossen</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={async () => {
                    const stepIdx = dynamicStepOrder.indexOf("openingHours");
                    const saved = hoursState;
                    addUserMessage(`${saved.filter(d => d.open).length} Tage eingetragen`);
                    setData(p => ({ ...p, openingHours: saved }));
                    await trySaveStep(stepIdx, { openingHours: saved });
                    const next = dynamicStepOrder[stepIdx + 1];
                    if (next) await advanceToStep(next);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Übernehmen ✓
                </button>
                <button
                  onClick={async () => {
                    const stepIdx = dynamicStepOrder.indexOf("openingHours");
                    addUserMessage("Überspringen");
                    setData(p => ({ ...p, openingHours: null }));
                    await trySaveStep(stepIdx, { openingHours: null });
                    const next = dynamicStepOrder[stepIdx + 1];
                    if (next) await advanceToStep(next);
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 text-sm rounded-xl transition-colors border border-white/10"
                >
                  Überspringen
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === "hideSections" && (
            <motion.div
              key="hideSections-step"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-2"
            >
                {/* Build the display list from sectionOrder (or fallback to allSectionsForHideStep) */}
                {(() => {
                  const displaySections = sectionOrder.length > 0
                    ? sectionOrder
                        .map(type => allSectionsForHideStep.find(s => s.type === type))
                        .filter((s): s is NonNullable<typeof s> => Boolean(s))
                    : allSectionsForHideStep;

                  const handleDragStart = (idx: number) => setDraggedSectionIdx(idx);
                  const handleDragOver  = (e: React.DragEvent, idx: number) => {
                    e.preventDefault();
                    if (draggedSectionIdx === null || draggedSectionIdx === idx) return;
                    const next    = [...sectionOrder];
                    const dragged = next[draggedSectionIdx];
                    next.splice(draggedSectionIdx, 1);
                    next.splice(idx, 0, dragged);
                    setSectionOrder(next);
                    setDraggedSectionIdx(idx);
                  };
                  const handleDragEnd = () => setDraggedSectionIdx(null);

                  return (
                    <>
                      {/* Sortable + toggleable section list */}
                      <div className="space-y-1.5">
                        {displaySections.map((sec, idx) => {
                          const isHidden    = hiddenSections.has(sec.type);
                          const isDragging  = draggedSectionIdx === idx;
                          return (
                            <div
                              key={sec.type}
                              draggable
                              onDragStart={() => handleDragStart(idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDragEnd={handleDragEnd}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-[11px] font-medium transition-all select-none ${
                                isDragging
                                  ? "opacity-40 border-blue-500/60 bg-blue-500/10 scale-[0.98]"
                                  : isHidden
                                  ? "border-slate-700 bg-slate-800/40 text-slate-500"
                                  : "border-emerald-500/50 bg-emerald-500/10 text-emerald-50"
                              }`}
                            >
                              {/* Drag handle */}
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0" />
                              {/* Emoji */}
                              <span className="flex-shrink-0 text-base leading-none">{sec.emoji}</span>
                              {/* Label */}
                              <span className={`flex-1 leading-tight ${isHidden ? "line-through text-slate-600" : ""}`}>
                                {sec.label}
                              </span>
                              {/* Visibility toggle */}
                              <button
                                onClick={() =>
                                  setHiddenSections((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(sec.type)) next.delete(sec.type);
                                    else next.add(sec.type);
                                    return next;
                                  })
                                }
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                                  isHidden
                                    ? "border-slate-600 bg-slate-700 hover:border-slate-500"
                                    : "border-emerald-500 bg-emerald-500 hover:bg-emerald-400"
                                }`}
                              >
                                {!isHidden && <Check className="w-3 h-3 text-white" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Hints */}
                      <div className="space-y-1 mt-2">
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <GripVertical className="w-3 h-3 flex-shrink-0" />
                          Reihenfolge per Drag &amp; Drop ändern – oder später im Dashboard
                        </p>
                        {hiddenSections.size > 0 && (
                          <p className="text-xs text-amber-400/80">
                            {hiddenSections.size} Bereich{hiddenSections.size > 1 ? "e" : ""} ausgeblendet – jederzeit wieder aktivierbar.
                          </p>
                        )}
                      </div>

                      {/* Weiter-Button im fixen Bottom-Bar */}
                    </>
                  );
                })()}
            </motion.div>
          )}

          {currentStep === "preview" && (
            <motion.div
              key="preview-step"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
              {/* Fullscreen interactive preview */}
              {previewToken && (
                <button
                  onClick={() => setShowFullPreview(true)}
                  className="w-full border border-slate-500/60 hover:border-blue-500/60 hover:bg-blue-500/10 text-slate-300 hover:text-white font-medium px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Monitor className="w-4 h-4" /> Vollbild-Vorschau öffnen
                </button>
              )}
              <button
                onClick={async () => {
                  addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
                  await advanceToStep("checkout");
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Website freischalten
              </button>
            </motion.div>
          )}

          {currentStep === "checkout" && (
            <motion.div
              key="checkout-step"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="ml-9 space-y-3"
            >
                {/* Billing interval toggle */}
                <div className="flex rounded-xl overflow-hidden border border-slate-600 mb-1">
                  <button
                    onClick={() => setBillingInterval("yearly")}
                    className={`flex-1 py-2 px-2 text-sm font-medium transition-all flex flex-col items-center gap-0.5 ${
                      billingInterval === "yearly"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>Jährlich · <span className="font-bold">19,90 €</span>/Mo</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-normal transition-all ${
                      billingInterval === "yearly"
                        ? "bg-green-500/30 text-green-300"
                        : "bg-slate-600/40 text-slate-500"
                    }`}>2 Monate gratis</span>
                  </button>
                  <button
                    onClick={() => setBillingInterval("monthly")}
                    className={`flex-1 py-2 px-2 text-sm font-medium transition-all flex flex-col items-center gap-0.5 ${
                      billingInterval === "monthly"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>Monatlich · <span className="font-bold">24,90 €</span>/Mo</span>
                    {/* spacer so both buttons stay the same height */}
                    <span className="text-xs opacity-0 px-2 py-0.5">–</span>
                  </button>
                </div>

                <div className="bg-slate-700/60 rounded-xl p-4 space-y-2">
                  {/* Line items */}
                  <div className="space-y-2 pb-2 border-b border-slate-600">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Basis-Website</span>
                      <span>{billingInterval === "yearly" ? "19,90" : "24,90"} €/Monat</span>
                    </div>
                    {data.addOnContactForm && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>+ Kontaktformular</span>
                        <span>+3,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnGallery && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>+ Bildergalerie</span>
                        <span>+3,90 €/Monat</span>
                      </div>
                    )}
                    {_addOnMenu && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>+ Speisekarte</span>
                        <span>+3,90 €/Monat</span>
                      </div>
                    )}
                    {_addOnPricelist && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>+ Preisliste</span>
                        <span>+3,90 €/Monat</span>
                      </div>
                    )}
                    {_addOnAiChat && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>+ KI-Chat</span>
                        <span>+9,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnBooking && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>+ Terminbuchung</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-1 flex justify-between font-bold text-white text-base">
                    <span>Gesamt</span>
                    <span>{totalPrice()} €/Monat</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-0.5">
                    {billingInterval === "yearly"
                      ? "Jährliche Abrechnung · monatlich abbuchbar · Jederzeit kündbar"
                      : "Monatliche Abrechnung · Jederzeit kündbar"}
                  </p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setLegalConsent((v) => !v)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      legalConsent ? "border-green-500 bg-green-500" : "border-slate-500 bg-transparent group-hover:border-slate-400"
                    }`}
                  >
                    {legalConsent && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-slate-400 leading-relaxed" onClick={() => setLegalConsent((v) => !v)}>
                    Ich bestätige, dass alle Angaben (insbesondere Impressum & Datenschutz) korrekt und vollständig sind. Ich übernehme die alleinige Verantwortung für die Richtigkeit dieser Daten. Pageblitz haftet nicht für fehlerhafte oder unvollständige Angaben.
                  </span>
                </label>
                <button
                  onClick={handleCheckout}
                  disabled={completeMutation.isPending || checkoutMutation.isPending || !legalConsent}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold px-5 py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completeMutation.isPending || checkoutMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><Zap className="w-5 h-5" /> Jetzt für {totalPrice()} €/Mo freischalten</>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  7 Tage gratis testen • Keine Einrichtungsgebühr • SSL inklusive
                </p>
            </motion.div>
          )}
              </AnimatePresence>
            )}

        <div ref={messagesEndRef} />
        </div>
        {/* Input area – sticky at bottom */}
          {!["services", "addons", "editAiChat", "subpages", "preview", "checkout", "welcome", "colorScheme", "brandLogo", "businessCategory", "openingHours", "heroPhoto", "aboutPhoto", "headlineFont", "headlineSize", "editGallery", "hideSections"].includes(currentStep) && (
            <div className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-slate-700/50">
              {/* Quick-reply chips – above input */}
              {!isTyping && !quickReplySelected && getQuickReplies(currentStep).length > 0 && (
                <div className="pt-3 pb-2">
                  <p className="text-xs text-slate-500 mb-2 font-medium">Schnellantworten:</p>
                  <div className="flex flex-wrap gap-2">
                    {getQuickReplies(currentStep).map((reply) => (
                      <button
                        key={reply}
                        onClick={() => {
                          setQuickReplySelected(true);
                          if (currentStep === "businessName" && reply === "Ja, stimmt!") {
                            handleSubmit("");
                          } else {
                            handleSubmit(reply);
                          }
                        }}
                        className="text-sm bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 hover:border-blue-400/70 text-blue-200 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {/* AI generate button for text fields */}
                {["tagline", "description", "usp", "targetAudience"].includes(currentStep) && (
                  <div className="relative flex-shrink-0 group/ai">
                    <button
                      onClick={() => generateWithAI(currentStep as keyof OnboardingData)}
                      disabled={isGenerating}
                      className="w-10 h-10 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/60 flex items-center justify-center transition-all ai-glow-btn"
                      title="Mit KI generieren"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 text-violet-300 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-violet-300" />
                      )}
                    </button>
                    {/* Tooltip – anchored to left edge so it never overflows off-screen */}
                    <div className="absolute bottom-full left-0 mb-2 w-48 pointer-events-none opacity-0 group-hover/ai:opacity-100 transition-opacity duration-200 z-20">
                      <div className="bg-violet-900/95 border border-violet-500/50 text-violet-100 text-xs px-3 py-2 rounded-lg shadow-lg text-center leading-snug">
                        ✨ Automatisch von KI<br/>generieren lassen
                        {/* Arrow points to the button center (~left-5 ≈ 20px = half of w-10 button) */}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-violet-900/95" />
                      </div>
                    </div>
                  </div>
                )}
                {["tagline", "description", "usp", "targetAudience"].includes(currentStep) ? (
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    rows={3}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-resize
                      const el = e.target as HTMLTextAreaElement;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 160) + "px";
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    placeholder={
                      currentStep === "tagline"
                        ? `z.B. "Ihr ${(data as any).businessCategory || 'Fachbetrieb'} in ${data.legalCity || 'Ihrer Stadt'}"`
                        : currentStep === "description"
                        ? "Was macht dein Unternehmen besonders? (2-3 Sätze)"
                        : currentStep === "usp"
                        ? "z.B. 'Wir sind der einzige Anbieter in der Region, der...' "
                        : currentStep === "targetAudience"
                        ? `z.B. "Damen und Herren in ${data.legalCity || 'Köln'}, die Wert auf..."`
                        : "Deine Antwort... (Shift+Enter für neue Zeile)"
                    }
                    className="flex-1 bg-slate-700/60 text-white text-sm px-4 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50 resize-none leading-relaxed"
                    style={{ minHeight: "72px", maxHeight: "160px" }}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    placeholder={
                      currentStep === "businessName"
                        ? data.businessName || "Unternehmensname eingeben..."
                        : currentStep === "legalOwner"
                        ? "Vorname Nachname"
                        : currentStep === "legalStreet"
                        ? "Musterstraße 12"
                        : currentStep === "legalZipCity"
                        ? "50667 Köln"
                        : currentStep === "legalEmail"
                        ? "info@musterfirma.de"
                        : currentStep === "legalVat"
                        ? "DE123456789 – oder leer lassen (Kleinunternehmer)"
                        : currentStep === "email"
                        ? "deine@email.de"
                        : "Deine Antwort..."
                    }
                    className="flex-1 bg-slate-700/60 text-white text-sm px-4 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                  />
                )}
                <button
                  onClick={() => handleSubmit()}
                  disabled={!inputValue.trim() && currentStep !== "businessName" && currentStep !== "legalVat"}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>


            </div>
          )}
          {/* Weiter-Buttons für UI-Schritte – außerhalb des Scroll-Containers (sticky auf Mobile) */}
          {currentStep === "addons" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  let snapshot: OnboardingData | null = null;
                  setData(p => { snapshot = p; return p; });
                  const d = snapshot ?? data;
                  const selected = [];
                  if (d.addOnContactForm) selected.push("Kontaktformular");
                  if (d.addOnGallery) selected.push("Bildergalerie");
                  if (d.addOnMenu) selected.push("Speisekarte");
                  if (d.addOnPricelist) selected.push("Preisliste");
                  if (d.addOnAiChat) selected.push("KI-Chat");
                  if (d.addOnBooking) selected.push("Terminbuchung");
                  addUserMessage(selected.length > 0 ? `Ich nehme: ${selected.join(", ")} ✓` : "Keine Extras nötig");
                  await trySaveStep(STEP_ORDER.indexOf("addons"), {
                    addOnContactForm: d.addOnContactForm,
                    contactFormFields: d.contactFormFields,
                    addOnGallery: d.addOnGallery,
                    addOnMenu: d.addOnMenu,
                    addOnPricelist: d.addOnPricelist,
                    addOnAiChat: d.addOnAiChat,
                    addOnBooking: d.addOnBooking,
                  });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "editAiChat" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  const msg = data.chatWelcomeMessage.trim() || `Hallo! Ich bin der digitale Assistent von ${data.businessName || "unserem Unternehmen"}. Wie kann ich dir helfen?`;
                  if (!data.chatWelcomeMessage.trim()) {
                    setData(p => ({ ...p, chatWelcomeMessage: msg }));
                  }
                  addUserMessage(`🤖 Begrüßung: "${msg.slice(0, 60)}${msg.length > 60 ? "…" : ""}"`);
                  await trySaveStep(STEP_ORDER.indexOf("editAiChat"), { chatWelcomeMessage: msg });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "brandLogo" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping || uploadLogoMutation.isPending}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  const logo = data.brandLogo || "font:Montserrat";
                  const label = logo.startsWith("url:") ? "Eigenes Logo" : logo.replace("font:", "");
                  addUserMessage(`Logo gewählt: ${label} ✓`);
                  await trySaveStep(STEP_ORDER.indexOf("brandLogo"), { brandLogo: logo });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "headlineFont" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping || !data.headlineFont}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  addUserMessage(`Schriftart gewählt: ${data.headlineFont} ✓`);
                  await trySaveStep(STEP_ORDER.indexOf("headlineFont"), { headlineFont: data.headlineFont });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "headlineSize" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  const sizeLabel = data.headlineSize === 'large' ? 'Extra groß' : data.headlineSize === 'medium' ? 'Groß' : 'Normal';
                  addUserMessage(`Schriftgröße gewählt: ${sizeLabel} ✓`);
                  await trySaveStep(STEP_ORDER.indexOf("headlineSize"), { headlineSize: data.headlineSize });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "services" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping || saveStepMutation.isPending}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  const filtered = data.topServices.filter((s) => s.title.trim());
                  if (filtered.length === 0) {
                    setShowSkipServicesWarning(true);
                    return;
                  }
                  addUserMessage(filtered.map((s) => `✓ ${s.title}`).join("\n"));
                  await trySaveStep(STEP_ORDER.indexOf("services"), { topServices: filtered });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "editGallery" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  const count = data.addOnGalleryData.images.length;
                  addUserMessage(count > 0 ? `${count} Bilder für die Galerie ausgewählt ✓` : "Standard-Bilder für die Galerie behalten");
                  await trySaveStep(STEP_ORDER.indexOf("editGallery"), {
                    galleryHeadline: data.addOnGalleryData.headline,
                    galleryImages: data.addOnGalleryData.images,
                    galleryMode: data.addOnGalleryData.mode,
                    galleryAlbums: data.addOnGalleryData.albums,
                    addOnGalleryData: data.addOnGalleryData,
                  });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "subpages" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  addUserMessage("Keine Unterseiten");
                  await trySaveStep(STEP_ORDER.indexOf("subpages"), { addOnSubpages: [] });
                  await goToNextStep();
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === "hideSections" && (
            <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-slate-700/50 bg-slate-900/95">
              <button
                disabled={isTyping}
                style={{ touchAction: "manipulation" }}
                onClick={async () => {
                  if (isTyping) return;
                  const hidden = Array.from(hiddenSections);
                  addUserMessage(hidden.length === 0 ? "Alle Bereiche anzeigen ✓" : `Ausgeblendet: ${hidden.join(", ")}`);
                  const stepIdx = dynamicStepOrder.indexOf("hideSections");
                  trySaveStep(stepIdx, {
                    sectionOrder: sectionOrder.length > 0 ? [...sectionOrder] : [],
                    hiddenSections: hidden,
                  });
                  await advanceToStep("preview");
                }}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* Mobile: preview shortcut button – only shown on small screens, hidden on preview step (has its own button) */}
          {liveWebsiteData && colorScheme && currentStep !== "preview" && (
            <div className="lg:hidden px-3 pb-3 pt-1 flex-shrink-0">
              <button
                onClick={() => setShowFullPreview(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/40 text-slate-300 hover:text-white text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                Website-Vorschau anzeigen
              </button>
            </div>
          )}
          </div>{/* end messages+input wrapper */}
        </div>
        {/* Preview panel – MacBook mockup (desktop only) */}
        <div className="hidden lg:flex relative flex-1 overflow-y-auto bg-gradient-to-br from-slate-800 to-slate-900 flex-col">
          {/* Preview top bar: chat toggle + progress bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/50">
            {/* Chat toggle button – always visible here */}
            <button
              onClick={() => setChatHidden((v) => !v)}
              className="flex items-center gap-1.5 text-xs bg-slate-700/60 hover:bg-slate-600/60 border border-slate-600/50 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              title={chatHidden ? "Chat einblenden" : "Chat ausblenden"}
            >
              {chatHidden ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              {chatHidden ? "Chat einblenden" : "Chat ausblenden"}
            </button>
            {/* Progress bar with clickable completed steps */}
            {currentStep !== "welcome" && currentStep !== "checkout" && (() => {
              const totalSteps = dynamicStepOrder.filter((s) => s !== "welcome").length;
              const currentIdx = dynamicStepOrder.indexOf(currentStep);
              // Guard: if step isn't in dynamicStepOrder yet (add-on states still loading), don't render
              if (currentIdx === -1) return null;
              const progress = Math.round((currentIdx / totalSteps) * 100);

              // Get completed steps (all steps before current)
              const completedSteps = dynamicStepOrder.slice(0, currentIdx).filter((s) =>
                s !== "welcome" && s !== "checkout" && s !== "preview"
              );

              // Step labels for display
              const stepLabels: Record<string, string> = {
                businessCategory: "Branche",
                businessName: "Name",
                addressingMode: "Anrede",
                brandLogo: "Logo",
                colorScheme: "Farben",
                heroPhoto: "Foto",
                aboutPhoto: "Über uns",
                headlineFont: "Schrift",
                headlineSize: "Größe",
                tagline: "Claim",
                description: "Beschreibung",
                usp: "USP",
                services: "Leistungen",
                legalOwner: "Impressum",
                legalStreet: "Adresse",
                legalZipCity: "Ort",
                legalEmail: "E-Mail",
                legalPhone: "Telefon",
                openingHours: "Öffnungszeiten",
                legalVat: "Steuer",
                addons: "Extras",
                editAiChat: "KI-Chat",
                editMenu: "Speisekarte",
                editPricelist: "Preise",
                editGallery: "Galerie",
                subpages: "Unterseiten",
                email: "Kontakt",
                hideSections: "Anzeige",
                preview: "Vorschau",
              };

              return (
                <div className="flex flex-col flex-1 gap-2">
                  {/* Edit mode indicator */}
                  {editMode.isEditing && editMode.returnToStep && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-400">⚡ Bearbeitungsmodus</span>
                      <button
                        onClick={() => {
                          setCurrentStep(editMode.returnToStep!);
                          setEditMode({ isEditing: false, returnToStep: null });
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 transition-colors border border-amber-500/50"
                      >
                        Zurück zu aktuellem Schritt
                      </button>
                    </div>
                  )}
                  {/* Completed steps - clickable pills */}
                  {!editMode.isEditing && completedSteps.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Bearbeiten:</span>
                      {completedSteps.map((step, idx) => (
                        <button
                          key={step}
                          onClick={() => {
                            // Enter edit mode: save current position and jump to selected step
                            setEditMode({ isEditing: true, returnToStep: currentStep });
                            setCurrentStep(step);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors border border-slate-600/50"
                          title={`Zurück zu: ${stepLabels[step] || step}`}
                        >
                          {stepLabels[step] || step}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">Schritt {currentIdx} / {totalSteps}</span>
                  </div>
                </div>
              );
            })()}
          </div>
          {liveWebsiteData && colorScheme ? (
            <MacbookMockup
              label="Live-Vorschau deiner Website"
              innerRef={previewInnerRef}
              externalScrollTop={previewScrollTop}
              onScrollChange={setPreviewScrollTop}
            >
              {/* Crossfade wrapper: placeholder fades out, skeleton template fades in */}
              <div className="relative">
                {/* Branchen-Update Toast – erscheint über dem Preview, stört Chat-Flow nicht */}
                {previewNotification && (
                  <div
                    className="absolute top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-violet-600/90 px-4 py-2 text-[11px] font-medium text-white shadow-lg backdrop-blur-sm pointer-events-none"
                    style={{ animation: 'fadeInDown 0.25s ease' }}
                  >
                    {previewNotification}
                  </div>
                )}
                {/* White wireframe placeholder – fades out when category is chosen */}
                <div
                  className="absolute inset-0 z-10 w-full bg-white overflow-hidden"
                  style={{
                    opacity: contentPhase === 'skeleton' ? 1 : 0,
                    transition: 'opacity 0.45s ease',
                    pointerEvents: contentPhase === 'skeleton' ? 'auto' : 'none',
                    minHeight: '100vh',
                  }}
                >
                  {/* Subtle grid */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }} />
                  {/* Wireframe blocks */}
                  <div className="relative z-10 p-5 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="h-3 w-14 bg-slate-200 rounded-full animate-pulse" />
                      <div className="flex gap-2">
                        {[0, 100, 200].map(d => (
                          <div key={d} className="h-2 w-8 bg-slate-100 rounded-full animate-pulse" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                    <div className="h-28 bg-slate-100 rounded-lg border border-slate-200/80 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="h-16 bg-slate-100/80 rounded border border-slate-200/60 animate-pulse" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                    <div className="space-y-2 pt-1">
                      {[{ w: '75%', d: 400 }, { w: '55%', d: 500 }, { w: '35%', d: 600 }].map(({ w, d }) => (
                        <div key={d} className="h-1.5 bg-slate-200/70 rounded-full animate-pulse" style={{ width: w, animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                    <div className="h-16 bg-slate-100/70 rounded border border-slate-200/50 animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 bg-slate-100/60 rounded animate-pulse" style={{ animationDelay: '450ms' }} />
                      <div className="h-12 bg-slate-100/60 rounded animate-pulse" style={{ animationDelay: '550ms' }} />
                    </div>
                    <div className="space-y-2 pt-1">
                      {[{ w: '60%', d: 700 }, { w: '40%', d: 800 }].map(({ w, d }) => (
                        <div key={d} className="h-1.5 bg-slate-200/40 rounded-full animate-pulse" style={{ width: w, animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                  {/* Center hint */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 px-5 py-3 space-y-1.5 shadow-md">
                      <Sparkles className="w-5 h-5 text-indigo-400 mx-auto" />
                      <p className="text-slate-700 text-xs font-medium">Vorschau erscheint hier</p>
                      <p className="text-slate-400 text-[10px]">beantworte die Fragen im Chat</p>
                    </div>
                  </div>
                </div>

                {/* Website – fades in when category is entered; skeleton mode prevents flash */}
                <div style={{
                  opacity: contentPhase === 'skeleton' ? 0 : 1,
                  transition: 'opacity 0.6s ease',
                  position: 'relative',
                }}>
                  <WebsiteRenderer
                    websiteData={liveWebsiteData}
                    businessCategory={data.businessCategory || (business as any)?.category || undefined}
                    colorScheme={{
                        ...colorScheme,
                        ...data.colorScheme,
                      } as any}
                    heroImageUrl={data.heroPhotoUrl || heroImageUrl}
                    aboutImageUrl={data.aboutPhotoUrl || aboutImageUrl}
                    layoutStyle={layoutStyle}
                    layoutVersion={(siteData?.website as any)?.layoutVersion ?? undefined}
                    headlineFontOverride={data.headlineFont || undefined}
                    headlineSize={data.headlineSize}
                    isLoading={contentPhase === 'skeleton' || contentPhase === 'colors' || contentPhase === 'images' || isGeneratingInitialContent}
                  />
                  {_addOnAiChat && liveWebsiteData && (
                    <ChatWidget
                      slug={siteData?.website?.slug || "preview"}
                      primaryColor={(data.colorScheme as any)?.primary || colorScheme?.primary || "#2563eb"}
                      businessName={liveWebsiteData.businessName || data.businessName || "Assistent"}
                      welcomeMessage={data.chatWelcomeMessage || undefined}
                      addOnBooking={!!data.addOnBooking}
                      onBookingRequest={() => {}}
                    />
                  )}

                  {/* ── Magic progressive reveal overlays ─────────────────────────────
                      These "fog of war" layers lift one by one as the user fills in info,
                      creating the feeling that the website is being built before their eyes.
                  ─────────────────────────────────────────────────────────────────────── */}

                  {/* Layer 1: Full overlay – clears after businessName confirmed (hero reveal) */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(8,12,35,0.72) 0%, rgba(12,18,50,0.65) 100%)',
                      opacity: heroRevealed ? 0 : 1,
                      transition: 'opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1)',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  />

                  {/* Layer 2: Lower content overlay – clears after text generation complete */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '38%', left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(8,12,35,0) 0%, rgba(8,12,35,0.68) 18%, rgba(8,12,35,0.68) 100%)',
                      opacity: contentRevealed ? 0 : 1,
                      transition: 'opacity 1.3s cubic-bezier(0.4, 0, 0.2, 1) 0.45s',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  />
                </div>
              </div>
            </MacbookMockup>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 min-h-[400px]">
              <div className="text-center">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-slate-600" />
                <p className="text-sm">Vorschau wird geladen...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exit intent modal */}
      {showExitIntent && (() => {
        const knownEmail = data.email || data.legalEmail;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

              {knownEmail ? (
                /* ── Saved-state: email already known ── */
                <>
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-xl">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tight">Fortschritt gespeichert ✓</h2>
                      {!isPaid && (
                        <p className="text-emerald-100 text-sm font-medium leading-relaxed">
                          Deine Website ist noch <span className="text-white font-bold tabular-nums">{countdown}</span> für dich reserviert.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-8 space-y-5">
                    <p className="text-slate-300 text-sm leading-relaxed text-center">
                      Du kannst jederzeit weitermachen – wir haben alles gespeichert.
                    </p>

                    {/* Email badge */}
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">Gespeichert unter</p>
                        <p className="text-emerald-200 text-sm font-medium truncate">{knownEmail}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowExitIntent(false)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Weiter bearbeiten
                    </button>
                  </div>
                </>
              ) : (
                /* ── Capture-state: no email yet ── */
                <>
                  <div className="bg-gradient-to-br from-blue-600 to-violet-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400/20 rounded-full blur-xl" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-xl">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tight">Warte kurz! ⚡</h2>
                      <p className="text-blue-100 text-sm font-medium leading-relaxed">
                        Deine Website ist nur noch <span className="text-white font-bold tabular-nums">{countdown}</span> für dich reserviert.
                      </p>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <p className="text-slate-300 text-sm leading-relaxed text-center">
                        Hinterlasse deine E-Mail-Adresse, damit wir deinen Bearbeitungsstand speichern können und du später weitermachen kannst.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="email"
                          placeholder="deine@email.de"
                          value={exitIntentEmail}
                          onChange={(e) => setExitIntentEmail(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
                        />
                        <button
                          onClick={async () => {
                            const email = exitIntentEmail.trim();
                            if (!email || !email.includes("@") || !email.includes(".")) {
                              toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
                              return;
                            }
                            setData(p => ({ ...p, email }));
                            await trySaveStep(STEP_ORDER.indexOf("email"), { email });
                            if (websiteId) {
                              saveCustomerEmailMutation.mutate({ websiteId, email });
                            }
                            toast.success("Fortschritt gespeichert! Du kannst nun jederzeit zurückkehren.");
                            setShowExitIntent(false);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                        >
                          Fortschritt speichern & weiter
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowExitIntent(false)}
                      className="w-full text-slate-500 hover:text-slate-300 text-xs font-semibold uppercase tracking-widest transition-colors"
                    >
                      Doch nicht schließen
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        );
      })()}

      {/* Exit confirmation modal for logged-in users */}
      {showExitConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-center relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-xl">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 leading-tight">Achtung! ⚡</h2>
                <p className="text-emerald-100 text-sm font-medium leading-relaxed">
                  Du verlässt gerade deine Seite, obwohl sie noch nicht fertig ist.
                </p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-emerald-300 text-sm font-medium">
                      E-Mail gespeichert:
                    </p>
                    <p className="text-white font-semibold">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed text-center">
                  Wir haben dir eine E-Mail mit deinem persönlichen Link geschickt.
                  Über diesen Link kannst du deine Seite jederzeit fertigstellen.
                </p>

                <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs mb-1">Deine Website ist reserviert für:</p>
                  <p className="text-white font-mono text-lg font-bold tabular-nums">{countdown}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowExitConfirmation(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  Weiter bearbeiten
                </button>

                <button
                  onClick={() => setShowExitConfirmation(false)}
                  className="w-full text-slate-500 hover:text-slate-300 text-xs font-semibold uppercase tracking-widest transition-colors py-2"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── MultiPhotoSelector (for Gallery) ──────────────────────────────────────────

interface MultiPhotoSelectorProps {
  websiteId: string;
  selectedPhotos: string[];
  onUpdate: (urls: string[]) => void;
  industry: string;
}

function MultiPhotoSelector({ websiteId, selectedPhotos, onUpdate, industry }: MultiPhotoSelectorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const uploadLogoMutation = trpc.onboarding.uploadLogo.useMutation();
  const gmbInitializedRef = useRef(false);

  const { data: suggestionsData, isLoading: isLoadingSuggestions } = trpc.onboarding.getPhotoSuggestions.useQuery(
    { category: industry },
    { enabled: !!industry }
  );

  const { data: gmbData } = trpc.onboarding.getGmbPhotos.useQuery(
    { websiteId: parseInt(websiteId || "0") },
    { enabled: !!websiteId && websiteId !== "0", staleTime: Infinity }
  );
  const gmbPhotos = (gmbData?.photos || []).filter(url => !brokenImages.has(url));

  // Pre-select all GMB photos when the gallery is still empty
  useEffect(() => {
    if (gmbInitializedRef.current) return;
    if (!gmbData?.photos?.length) return;
    if (selectedPhotos.length > 0) { gmbInitializedRef.current = true; return; }
    gmbInitializedRef.current = true;
    onUpdate(gmbData.photos);
  }, [gmbData]);

  const photos = suggestionsData?.suggestions || [];

  const togglePhoto = (url: string) => {
    if (selectedPhotos.includes(url)) {
      onUpdate(selectedPhotos.filter(u => u !== url));
    } else {
      onUpdate([...selectedPhotos, url]);
    }
  };

  return (
    <div className="space-y-4">
      {/* GMB photo section */}
      {gmbPhotos.length > 0 && (
        <div className="space-y-2">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Deine Google-Fotos</p>
          <div className="grid grid-cols-3 gap-2">
            {gmbPhotos.map((url, idx) => (
              <button
                key={url + idx}
                onClick={() => togglePhoto(url)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedPhotos.includes(url) ? "border-blue-500 ring-2 ring-blue-500/20" : "border-transparent hover:border-slate-500"
                }`}
              >
                <img
                  src={url}
                  alt={`Google Foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setBrokenImages(prev => new Set(prev).add(url))}
                />
                {selectedPhotos.includes(url) && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 text-[8px] text-white/80">
                  GMB
                </div>
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider pt-1">Oder Stockfoto wählen</p>
        </div>
      )}

      {/* Stock photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {isLoadingSuggestions ? (
          <div className="col-span-3 py-10 flex flex-col items-center justify-center gap-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <p className="text-slate-500 text-[10px]">Passende Fotos werden geladen…</p>
          </div>
        ) : (
          photos.filter(p => !brokenImages.has(p.url)).map((photo, idx) => (
            <button
              key={idx}
              onClick={() => togglePhoto(photo.url)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedPhotos.includes(photo.url) ? "border-blue-500 ring-2 ring-blue-500/20" : "border-transparent hover:border-slate-500"
              }`}
            >
              <img
                src={photo.thumb || photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover"
                onError={() => setBrokenImages(prev => new Set(prev).add(photo.url))}
              />
              {selectedPhotos.includes(photo.url) && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 text-[8px] text-white/80">
                Vorschlag
              </div>
            </button>
          ))
        )}
      </div>

      {/* Upload option */}
      <div className="border-t border-slate-700 pt-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedPhotos.filter(url => !photos.some(p => p.url === url) && !gmbPhotos.includes(url)).map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-blue-500 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button 
                onClick={() => onUpdate(selectedPhotos.filter(u => u !== url))}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
          <label className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-700/40 hover:border-slate-500 cursor-pointer transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0 || !websiteId) return;
                
                if (selectedPhotos.length + files.length > 12) {
                  toast.error("Maximal 12 Bilder insgesamt erlaubt.");
                  return;
                }

                setIsUploading(true);
                for (const file of files) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} ist zu groß (max. 5 MB).`);
                    continue;
                  }

                  const reader = new FileReader();
                  const promise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                  });
                  reader.readAsDataURL(file);
                  
                  try {
                    const base64 = (await promise).split(",")[1];
                    const result = await uploadLogoMutation.mutateAsync({
                      websiteId: parseInt(websiteId),
                      imageData: base64,
                      mimeType: file.type,
                    });
                    onUpdate([...selectedPhotos, result.url]);
                    selectedPhotos.push(result.url); // locally update for loop
                  } catch {
                    toast.error(`Upload von ${file.name} fehlgeschlagen.`);
                  }
                }
                setIsUploading(false);
              }}
            />
            {isUploading ? (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-wider text-center px-1">Hochladen</span>
          </label>
        </div>
        <p className="text-[10px] text-slate-500">Bilder auswählen oder eigene hochladen (PNG, JPG, WebP · max. 5 MB)</p>
      </div>
    </div>
  );
}

// ── HeroPhotoStep ─────────────────────────────────────────────────────────────

// ── CategoryPicker ─────────────────────────────────────────────────────────
function CategoryPicker({ selected, onSelect }: { selected: string; onSelect: (cat: string) => void }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? CATEGORY_GROUPS.flatMap((g) =>
        g.categories.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Search field */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Branche suchen oder eintippen…"
          className="w-full bg-slate-700/60 border border-slate-600/50 text-slate-200 placeholder-slate-500 text-sm px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-blue-500/60 focus:bg-blue-600/10 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Suche löschen"
          >✕</button>
        )}
      </div>

      {/* Filtered flat list */}
      {filtered !== null ? (
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-800/60 divide-y divide-slate-700/40">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 flex items-center justify-between gap-2">
              <span className="text-slate-400 text-sm">Keine Treffer – Branche trotzdem übernehmen?</span>
              <button
                onClick={() => onSelect(search.trim())}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              >
                Übernehmen
              </button>
            </div>
          ) : (
            filtered.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  selected === cat
                    ? "bg-blue-600/30 text-white"
                    : "text-slate-200 hover:bg-slate-700/60 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))
          )}
        </div>
      ) : (
        /* Grouped list (no search active) */
        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-800/60 divide-y divide-slate-700/40">
          {CATEGORY_GROUPS.map((group) => (
            <details key={group.group} className="group">
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors text-xs font-semibold uppercase tracking-wide">
                <span>{group.icon}</span>
                <span className="flex-1">{group.group}</span>
                <span className="text-slate-500 group-open:rotate-90 transition-transform text-[10px]">▶</span>
              </summary>
              <div className="flex flex-wrap gap-1.5 px-3 pb-2 pt-1">
                {group.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`text-xs border px-2.5 py-1.5 rounded-lg transition-all ${
                      selected === cat
                        ? "bg-blue-600/40 border-blue-500/60 text-white"
                        : "bg-slate-700/60 hover:bg-blue-600/30 border-slate-600/50 hover:border-blue-500/50 text-slate-200 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

interface HeroPhotoStepProps {
  businessCategory: string;
  heroPhotoUrl: string;
  websiteId?: number;
  isAboutPhoto?: boolean;
  onSelect: (url: string) => void;
  onNext: () => Promise<void>;
}

function HeroPhotoStep({ businessCategory, heroPhotoUrl, websiteId, isAboutPhoto, onSelect, onNext }: HeroPhotoStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const uploadLogoMutation = trpc.onboarding.uploadLogo.useMutation();

  const { data: suggestionsData, isLoading: isLoadingSuggestions } = trpc.onboarding.getPhotoSuggestions.useQuery(
    { category: businessCategory },
    { enabled: !!businessCategory }
  );
  const { data: gmbData } = trpc.onboarding.getGmbPhotos.useQuery(
    { websiteId: websiteId! },
    { enabled: !!websiteId }
  );
  const gmbPhotos = (gmbData?.photos || []).map((url) => ({ url, thumb: url, alt: "Google My Business Foto", isGmb: true }));

  // Auto-select first GMB photo if nothing chosen yet
  useEffect(() => {
    if (gmbPhotos.length > 0 && !heroPhotoUrl) {
      const idx = isAboutPhoto ? 1 : 0;
      const photo = gmbPhotos[idx] || gmbPhotos[0];
      if (photo) onSelect(photo.url);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gmbData]);

  const photos = suggestionsData?.suggestions || [
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70", alt: "Modernes Büro" },
    { url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=70", alt: "Helles Büro" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=70", alt: "Gebäude" },
  ];

  return (
    <div className="ml-9 space-y-3">
      <p className="text-slate-400 text-xs">
        {isAboutPhoto
          ? 'Wähle ein Foto für den "Über uns"-Bereich deiner Website:'
          : "Wähle ein passendes Foto für den Hero-Bereich deiner Website:"}
      </p>

      {/* GMB photos section */}
      {gmbPhotos.length > 0 && (
        <div className="space-y-2">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Deine Google-Fotos</p>
          <div className="grid grid-cols-3 gap-2">
            {gmbPhotos.filter(p => !brokenImages.has(p.url)).map((photo, idx) => (
              <button
                key={photo.url + idx}
                onClick={() => onSelect(heroPhotoUrl === photo.url ? "" : photo.url)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  heroPhotoUrl === photo.url
                    ? "border-blue-400 ring-2 ring-blue-400/40"
                    : "border-slate-600/40 hover:border-slate-400"
                }`}
                title={photo.alt}
              >
                <img
                  src={photo.thumb}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setBrokenImages(prev => { const next = new Set(prev); next.add(photo.url); return next; })}
                />
                {heroPhotoUrl === photo.url && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide pt-1">Oder Stockfoto wählen</p>
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {isLoadingSuggestions ? (
          <div className="col-span-3 py-12 flex flex-col items-center justify-center gap-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-xs">Passende Fotos werden geladen…</p>
          </div>
        ) : (
          (photos as any[]).filter(p => {
            const url = typeof p === "string" ? p : p.url;
            return !brokenImages.has(url);
          }).map((photo, idx) => {
            const url = typeof photo === "string" ? photo : photo.url;
            const thumb = typeof photo === "string" ? photo : photo.thumb || photo.url;
            const alt = typeof photo === "string" ? businessCategory : photo.alt;

            return (
              <button
                key={url + idx}
                onClick={() => onSelect(heroPhotoUrl === url ? "" : url)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  heroPhotoUrl === url
                    ? "border-blue-400 ring-2 ring-blue-400/40"
                    : "border-slate-600/40 hover:border-slate-400"
                }`}
                title={alt}
              >
                <img
                  src={thumb}
                  alt={alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => {
                    setBrokenImages(prev => {
                      const next = new Set(prev);
                      next.add(url);
                      return next;
                    });
                  }}
                />
                {heroPhotoUrl === url && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Stock Photo Search */}
      <div className="border-t border-slate-700 pt-3 space-y-2">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Stock-Foto suchen</p>
        <StockPhotoSearch
          defaultQuery={businessCategory}
          selectedUrl={heroPhotoUrl}
          onSelect={(url) => onSelect(url)}
          perPage={9}
        />
      </div>

      {/* Upload option */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-slate-400 text-xs mb-2">Oder eigenes Foto hochladen:</p>
        {heroPhotoUrl && !photos.some((p) => p.url === heroPhotoUrl) ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-blue-500/10">
            <img src={heroPhotoUrl} alt="Eigenes Foto" className="h-12 w-20 object-cover rounded" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Eigenes Foto ✓</p>
              <button
                onClick={() => onSelect("")}
                className="text-slate-400 text-xs hover:text-white transition-colors"
              >
                Entfernen
              </button>
            </div>
          </div>
        ) : (
          <label className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/40 hover:border-slate-500 cursor-pointer transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !websiteId) return;
                if (file.size > 5 * 1024 * 1024) {
                  alert("Foto darf maximal 5 MB groß sein.");
                  return;
                }
                setIsUploading(true);
                const reader = new FileReader();
                reader.onload = async () => {
                  const base64 = (reader.result as string).split(",")[1];
                  try {
                    const result = await uploadLogoMutation.mutateAsync({
                      websiteId,
                      imageData: base64,
                      mimeType: file.type,
                    });
                    onSelect(result.url);
                  } catch {
                    alert("Upload fehlgeschlagen. Bitte erneut versuchen.");
                  } finally {
                    setIsUploading(false);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className="text-white text-sm">{isUploading ? "Wird hochgeladen…" : "Foto hochladen"}</p>
              <p className="text-slate-400 text-xs">JPG, PNG oder WebP · max. 5 MB</p>
            </div>
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { onSelect(""); onNext(); }}
          className="flex-1 text-xs text-slate-400 hover:text-slate-300 px-3 py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
        >
          Bestehendes behalten
        </button>
        <button
          disabled={isUploading}
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Weiter <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
