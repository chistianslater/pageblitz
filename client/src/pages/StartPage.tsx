import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Globe, Zap, ArrowRight, CheckCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type Step = "choice" | "manual" | "pick" | "gmb";

// ─────────────────────────── Layout variant helpers ──────────────────────────

const VARIANT_FAMILY_RANKINGS: Record<string, [string[], string[], string[]]> = {
  friseur:    [["aurora","nexus","bold","flux","dynamic"], ["elegant","luxury","natural","craft","forge"], ["clay","fresh","warm","pulse","clean","modern"]],
  beauty:     [["aurora","nexus","bold","flux","dynamic"], ["elegant","luxury","natural","craft","forge"], ["clay","fresh","warm","pulse","clean","modern"]],
  restaurant: [["flux","aurora","nexus","bold","dynamic"], ["natural","craft","forge","elegant","luxury"],  ["fresh","warm","clay","clean","modern","pulse"]],
  fitness:    [["dynamic","aurora","nexus","bold","flux"], ["craft","forge","natural","elegant","luxury"],  ["pulse","fresh","clean","clay","modern","warm"]],
  handwerk:   [["bold","nexus","aurora","flux","dynamic"], ["forge","craft","natural","elegant","luxury"],  ["clean","modern","pulse","clay","fresh","warm"]],
  medizin:    [["nexus","aurora","bold","flux","dynamic"], ["forge","natural","elegant","luxury","craft"],  ["pulse","clean","clay","modern","fresh","warm"]],
  beratung:   [["nexus","aurora","bold","flux","dynamic"], ["forge","elegant","luxury","natural","craft"],  ["pulse","clean","modern","clay","fresh","warm"]],
  tech:       [["aurora","nexus","dynamic","bold","flux"], ["forge","elegant","natural","luxury","craft"],  ["pulse","clean","modern","clay","fresh","warm"]],
  immobilien: [["nexus","aurora","bold","flux","dynamic"], ["luxury","forge","elegant","natural","craft"],  ["clean","modern","pulse","clay","fresh","warm"]],
  auto:       [["nexus","flux","bold","aurora","dynamic"], ["forge","luxury","craft","elegant","natural"],  ["clean","modern","pulse","clay","fresh","warm"]],
  fotografie: [["aurora","flux","nexus","bold","dynamic"], ["elegant","forge","luxury","natural","craft"],  ["clay","modern","pulse","clean","fresh","warm"]],
  hotel:      [["flux","aurora","bold","nexus","dynamic"], ["luxury","forge","elegant","natural","craft"],  ["warm","clay","fresh","clean","modern","pulse"]],
  garten:     [["aurora","nexus","bold","flux","dynamic"], ["natural","craft","forge","elegant","luxury"],  ["warm","fresh","clay","clean","modern","pulse"]],
};

const DEFAULT_RANKINGS: [string[], string[], string[]] = [
  ["nexus","aurora","bold","flux","dynamic"],
  ["forge","elegant","luxury","natural","craft"],
  ["clay","pulse","fresh","clean","modern","warm"],
];

const LAYOUT_LABELS: Record<string, string> = {
  aurora:"Aurora", nexus:"Nexus", bold:"Bold", flux:"Flux", dynamic:"Dynamic",
  forge:"Forge", elegant:"Elegant", luxury:"Luxury", natural:"Natural", craft:"Craft",
  clay:"Clay", pulse:"Pulse", fresh:"Fresh", clean:"Clean", warm:"Warm", modern:"Modern",
};

const LAYOUT_VIBES: Record<string, string> = {
  aurora:"Dunkel · Kosmisch", nexus:"Präzise · Navy", bold:"Stark · Schwarz-Gold",
  flux:"Dunkel · Warmes Gold", dynamic:"Energie · Diagonal", forge:"Edel · Zeitlos",
  elegant:"Warm · Éditoriel", luxury:"Premium · Cinématisch", natural:"Organisch · Erdtöne",
  craft:"Handwerk · Industrial", clay:"Soft · Verspielt", pulse:"Hell · Vertrauensvoll",
  fresh:"Frisch · Luftig", clean:"Klar · Minimalistisch", warm:"Herzlich · Einladend",
  modern:"Modern · Asymmetrisch",
};

function getLayoutVariants(industryKey: string, round: number): string[] {
  const families = VARIANT_FAMILY_RANKINGS[industryKey] || DEFAULT_RANKINGS;
  return families.map((fam) => fam[round % fam.length]);
}

function getCategoryKey(cat: string): string {
  const c = cat.toLowerCase();
  if (/friseur|haar|barber|salon|beauty|kosmetik|nail/.test(c)) return "friseur";
  if (/restaurant|gastro|küche|essen|pizza|burger|sushi|bistro|café|cafe/.test(c)) return "restaurant";
  if (/bäckerei|bäcker|konditor/.test(c)) return "restaurant";
  if (/fitness|gym|sport|yoga|pilates|training/.test(c)) return "fitness";
  if (/bau|handwerk|elektriker|sanitär|klempner|maler|dachdecker/.test(c)) return "handwerk";
  if (/arzt|medizin|zahnarzt|apotheke|klinik|pflege|therapie/.test(c)) return "medizin";
  if (/beratung|consulting|coach|steuer|rechts|anwalt/.test(c)) return "beratung";
  if (/tech|software|digital|app|it\b|web/.test(c)) return "tech";
  if (/immobilien|makler/.test(c)) return "immobilien";
  if (/auto|kfz|werkstatt|fahrzeug/.test(c)) return "auto";
  if (/foto|fotografie|photo/.test(c)) return "fotografie";
  if (/hotel|pension|unterkunft/.test(c)) return "hotel";
  if (/garten|landschaft/.test(c)) return "garten";
  return "beratung";
}

const DESKTOP_IFRAME_W = 1280;
const PREVIEW_IFRAME_H = 2400;
const CARD_H = 420;

export default function StartPage() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>("choice");

  // Manual step
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");

  // Pick step
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [variantRound, setVariantRound] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // GMB step
  const [gmbSearchQuery, setGmbSearchQuery] = useState("");
  const [gmbSearchRegion, setGmbSearchRegion] = useState("");
  const [gmbSearchResults, setGmbSearchResults] = useState<Array<{
    placeId: string; name: string; address: string; phone: string | null;
    rating: number | null; reviewCount: number; category: string; website: string | null;
    openingHours?: string[];
  }>>([]);
  const [gmbSearchLoading, setGmbSearchLoading] = useState(false);
  const [citysuggestions, setCitySuggestions] = useState<Array<{ label: string; placeId: string }>>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resolvedInfo, setResolvedInfo] = useState<{
    businessName: string | null; placeId: string | null; address: string | null;
    phone: string | null; category: string | null; reviews: any[];
    openingHours: string[]; rating: string | null; reviewCount: number | null;
  } | null>(null);
  const [, navigate] = useLocation();

  // Measure grid width for iframe scale
  useEffect(() => {
    if (step !== "pick" || !gridRef.current) return;
    const obs = new ResizeObserver(() => {
      if (!gridRef.current) return;
      // 3 columns, gap-4 (16px) × 2 = 32px total gap
      setCardWidth(Math.floor((gridRef.current.offsetWidth - 32) / 3));
    });
    obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, [step]);

  const scale = cardWidth > 0 ? cardWidth / DESKTOP_IFRAME_W : 0;
  const industryKey = getCategoryKey(category);
  const layouts = getLayoutVariants(industryKey, variantRound);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const gmbSearchPublicMutation = trpc.search.gmbSearchPublic.useMutation();
  const autocompleteCityMutation = trpc.search.autocompleteCity.useMutation();
  const startMutation = trpc.selfService.start.useMutation();
  const selectTemplateMutation = trpc.selfService.selectWebsiteTemplate.useMutation();

  const isLoading = startMutation.isPending || selectTemplateMutation.isPending;

  // ── Manual → Pick ─────────────────────────────────────────────────────────
  const handleManualNext = () => {
    const key = getCategoryKey(category);
    const variants = getLayoutVariants(key, 0);
    setSelectedLayout(variants[0]);
    setVariantRound(0);
    setStep("pick");
  };

  // ── Andere zeigen ─────────────────────────────────────────────────────────
  const handleNextRound = () => {
    const next = variantRound + 1;
    const key = getCategoryKey(category);
    const variants = getLayoutVariants(key, next);
    setVariantRound(next);
    setSelectedLayout(variants[0]);
  };

  // ── Pick → Start ──────────────────────────────────────────────────────────
  const handleStartWithLayout = async () => {
    if (!selectedLayout) return;
    try {
      const data = await startMutation.mutateAsync({
        businessName: businessName.trim() || undefined,
        category: category.trim() || undefined,
        customerEmail: user?.email || undefined,
        source: "external",
      });
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "conversion", { send_to: "AW-16545728698/24hCCMT9wI8cELqRz9E9" });
      }
      await selectTemplateMutation.mutateAsync({
        websiteId: data.websiteId,
        layoutStyle: selectedLayout,
      });
      toast.success("Website wird erstellt...");
      navigate(`/preview/${data.previewToken}/onboarding`);
    } catch (err: any) {
      toast.error("Fehler beim Erstellen: " + err.message);
    }
  };

  // ── GMB Search ────────────────────────────────────────────────────────────
  const handleGmbSearch = async () => {
    const q = gmbSearchQuery.trim();
    if (!q) return;
    setGmbSearchLoading(true);
    setGmbSearchResults([]);
    setResolvedInfo(null);
    try {
      const res = await gmbSearchPublicMutation.mutateAsync({
        query: q,
        region: gmbSearchRegion.trim() || undefined,
      });
      setGmbSearchResults(res.results);
      if (res.results.length === 0) toast.info("Keine Ergebnisse – versuche es mit einem anderen Begriff.");
    } finally {
      setGmbSearchLoading(false);
    }
  };

  const handleStartWithResolved = async () => {
    if (!resolvedInfo) return;
    try {
      const data = await startMutation.mutateAsync({
        businessName: resolvedInfo.businessName || undefined,
        placeId: resolvedInfo.placeId || undefined,
        address: resolvedInfo.address || undefined,
        phone: resolvedInfo.phone || undefined,
        category: resolvedInfo.category || undefined,
        customerEmail: user?.email || undefined,
        source: "external",
        googleReviews: resolvedInfo.reviews.length > 0 ? resolvedInfo.reviews : undefined,
        openingHours: resolvedInfo.openingHours.length > 0 ? resolvedInfo.openingHours : undefined,
        rating: resolvedInfo.rating || undefined,
        reviewCount: resolvedInfo.reviewCount || undefined,
      });
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "conversion", { send_to: "AW-16545728698/24hCCMT9wI8cELqRz9E9" });
      }
      toast.success("Website wird erstellt...");
      navigate(`/preview/${data.previewToken}/onboarding`);
    } catch (err: any) {
      toast.error("Fehler beim Erstellen: " + err.message);
    }
  };

  // ── Container width switches for pick step ────────────────────────────────
  const outerCard = step === "pick"
    ? "w-full max-w-4xl bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
    : "w-full max-w-md bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center px-4 py-8">

      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <span className="text-white font-bold text-2xl tracking-tight">Pageblitz</span>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          Deine professionelle Website in wenigen Minuten – automatisch aus deinen Daten.
        </p>
      </div>

      {/* Card */}
      <div className={outerCard}>

        {/* ── Choice ── */}
        {step === "choice" && (
          <>
            <h1 className="text-white text-2xl font-bold mb-1 text-center">
              Wie möchtest du starten?
            </h1>
            <p className="text-slate-400 text-sm text-center mb-6">
              Mit deinem Google My Business-Profil geht es am schnellsten.
            </p>

            {isAuthenticated && user?.email && (
              <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 text-sm">{user.email}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setStep("gmb")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500/60 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">Mit Google My Business starten</div>
                  <div className="text-slate-400 text-xs mt-0.5">Daten werden automatisch übernommen – schnellster Weg</div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setStep("manual")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-600/40 bg-slate-700/30 hover:bg-slate-700/50 hover:border-slate-600/60 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-600/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">Ohne Google My Business starten</div>
                  <div className="text-slate-400 text-xs mt-0.5">Unternehmensname und Branche eingeben</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        )}

        {/* ── Manual ── */}
        {step === "manual" && (
          <>
            <button
              onClick={() => setStep("choice")}
              className="text-slate-400 hover:text-white text-sm mb-5 flex items-center gap-1 transition-colors"
            >
              ← Zurück
            </button>

            <h1 className="text-white text-2xl font-bold mb-1">Dein Unternehmen</h1>
            <p className="text-slate-400 text-sm mb-5">
              Kurz zwei Infos – dann zeigen wir dir passende Design-Vorlagen.
            </p>

            <div className="space-y-3">
              <Input
                autoFocus
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && businessName.trim() && category.trim()) handleManualNext();
                }}
                placeholder="Unternehmensname"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12"
              />
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && businessName.trim() && category.trim()) handleManualNext();
                }}
                placeholder="Branche (z.B. Friseur, Restaurant, Handwerker)"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12"
              />
              <Button
                onClick={handleManualNext}
                disabled={!businessName.trim() || !category.trim()}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl"
              >
                <div className="flex items-center gap-2">
                  Weiter <ArrowRight className="w-4 h-4" />
                </div>
              </Button>
            </div>
          </>
        )}

        {/* ── Pick ── */}
        {step === "pick" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep("manual")}
                className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                ← Zurück
              </button>
              <button
                onClick={handleNextRound}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Andere zeigen
              </button>
            </div>

            <h1 className="text-white text-xl font-bold mb-1">Wähle deinen Stil</h1>
            <p className="text-slate-400 text-sm mb-5">
              Klicke auf das Design, das am besten zu{" "}
              <span className="text-white font-medium">{businessName}</span> passt.
            </p>

            {/* 3-column preview grid */}
            <div ref={gridRef} className="grid grid-cols-3 gap-4 mb-6">
              {layouts.map((layout) => {
                const isSelected = selectedLayout === layout;
                return (
                  <button
                    key={layout}
                    onClick={() => setSelectedLayout(layout)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all text-left focus:outline-none ${
                      isSelected
                        ? "border-indigo-500 shadow-lg shadow-indigo-500/30"
                        : "border-slate-600/40 hover:border-slate-500/60"
                    }`}
                  >
                    {/* iframe wrapper */}
                    <div
                      className="relative overflow-hidden bg-white"
                      style={{ height: CARD_H }}
                    >
                      {scale > 0 && (
                        <iframe
                          src={`/layout-preview/${layout.toUpperCase()}?scheme=trust`}
                          width={DESKTOP_IFRAME_W}
                          height={PREVIEW_IFRAME_H}
                          scrolling="no"
                          style={{
                            border: "none",
                            pointerEvents: "none",
                            transformOrigin: "top left",
                            transform: `scale(${scale})`,
                            display: "block",
                          }}
                          title={`${LAYOUT_LABELS[layout] || layout} preview`}
                        />
                      )}
                      {/* Bottom fade */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    {/* Label strip */}
                    <div className={`px-3 py-2 ${isSelected ? "bg-indigo-500/20" : "bg-slate-700/40"}`}>
                      <p className="text-white text-sm font-semibold leading-tight">
                        {LAYOUT_LABELS[layout] || layout}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-tight">
                        {LAYOUT_VIBES[layout] || ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleStartWithLayout}
              disabled={!selectedLayout || isLoading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird vorbereitet…
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Jetzt starten
                </div>
              )}
            </Button>
          </>
        )}

        {/* ── GMB Search ── */}
        {step === "gmb" && (
          <>
            <button
              onClick={() => { setStep("choice"); setResolvedInfo(null); setGmbSearchResults([]); setGmbSearchQuery(""); }}
              className="text-slate-400 hover:text-white text-sm mb-5 flex items-center gap-1 transition-colors"
            >
              ← Zurück
            </button>

            <h1 className="text-white text-2xl font-bold mb-1">
              Dein Unternehmen bei Google
            </h1>
            <p className="text-slate-400 text-sm mb-5">
              Suche deinen Betrieb – wir übernehmen alle Infos automatisch.
            </p>

            <div className="space-y-4">
              {/* Search inputs */}
              <div className="flex flex-col gap-2">
                <Input
                  autoFocus
                  value={gmbSearchQuery}
                  onChange={(e) => { setGmbSearchQuery(e.target.value); setGmbSearchResults([]); setResolvedInfo(null); }}
                  onKeyDown={(e) => e.key === "Enter" && !gmbSearchLoading && handleGmbSearch()}
                  placeholder="Unternehmensname"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12 w-full"
                  disabled={gmbSearchLoading || isLoading}
                />

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={gmbSearchRegion}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGmbSearchRegion(val);
                        setShowCitySuggestions(true);
                        if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
                        if (val.trim().length >= 2) {
                          cityDebounceRef.current = setTimeout(async () => {
                            try {
                              const res = await autocompleteCityMutation.mutateAsync({ input: val.trim() });
                              setCitySuggestions(res.suggestions);
                            } catch { /* ignore */ }
                          }, 300);
                        } else {
                          setCitySuggestions([]);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !gmbSearchLoading) {
                          setShowCitySuggestions(false);
                          handleGmbSearch();
                        }
                        if (e.key === "Escape") setShowCitySuggestions(false);
                      }}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                      onFocus={() => citysuggestions.length > 0 && setShowCitySuggestions(true)}
                      placeholder="Stadt (optional)"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12 w-full"
                      disabled={gmbSearchLoading || isLoading}
                    />
                    {showCitySuggestions && citysuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden">
                        {citysuggestions.map((s) => (
                          <button
                            key={s.placeId}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const cityName = s.label.split(",")[0].trim();
                              setGmbSearchRegion(cityName);
                              setCitySuggestions([]);
                              setShowCitySuggestions(false);
                              if (gmbSearchQuery.trim() && !gmbSearchLoading) handleGmbSearch();
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleGmbSearch}
                    disabled={!gmbSearchQuery.trim() || gmbSearchLoading || isLoading}
                    className="h-12 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex-shrink-0"
                  >
                    {gmbSearchLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>

              {/* Search results */}
              {gmbSearchResults.length > 0 && !resolvedInfo && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-xs">
                    {gmbSearchResults.length} Ergebnis{gmbSearchResults.length !== 1 ? "se" : ""} gefunden:
                  </p>
                  {gmbSearchResults.map((result) => (
                    <button
                      key={result.placeId}
                      disabled={isLoading}
                      onClick={() => {
                        setResolvedInfo({
                          businessName: result.name,
                          placeId: result.placeId,
                          address: result.address,
                          phone: result.phone,
                          category: result.category,
                          reviews: [],
                          openingHours: result.openingHours || [],
                          rating: result.rating ? String(result.rating) : null,
                          reviewCount: result.reviewCount,
                        });
                        setGmbSearchResults([]);
                      }}
                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-600/50 bg-slate-700/40 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{result.name}</p>
                        <p className="text-xs text-slate-400 truncate">{result.address.split(",").slice(0, 2).join(",")}</p>
                        {result.rating && (
                          <p className="text-xs text-amber-400 mt-0.5">★ {result.rating.toFixed(1)} ({result.reviewCount} Bewertungen)</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {!gmbSearchLoading && gmbSearchResults.length === 0 && gmbSearchPublicMutation.isSuccess && !resolvedInfo && (
                <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-700/50 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-400 text-sm">Kein Treffer – versuche einen anderen Begriff oder ergänze die Stadt.</p>
                </div>
              )}

              {/* Selected business confirmation */}
              {resolvedInfo && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-semibold">Unternehmen ausgewählt</span>
                    <button
                      onClick={() => setResolvedInfo(null)}
                      className="ml-auto text-slate-500 hover:text-slate-300 text-xs"
                    >
                      Ändern
                    </button>
                  </div>
                  <p className="text-white font-semibold">{resolvedInfo.businessName}</p>
                  {resolvedInfo.address && (
                    <p className="text-slate-400 text-xs mt-0.5">{resolvedInfo.address.split(",").slice(0, 2).join(",")}</p>
                  )}
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={handleStartWithResolved}
                disabled={!resolvedInfo || isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird vorbereitet…
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Jetzt starten
                  </div>
                )}
              </Button>

              <button
                onClick={() => setStep("manual")}
                disabled={isLoading}
                className="w-full text-slate-400 hover:text-white text-sm transition-colors py-2"
              >
                Mein Unternehmen ist nicht dabei – manuell eingeben →
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-8 text-center">
        7 Tage gratis · danach 19,90 €/Monat · Jederzeit kündbar
      </p>
    </div>
  );
}
