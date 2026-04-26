import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Globe, Zap, ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { CATEGORY_GROUPS } from "@shared/gmbCategories";

type Step = "choice" | "manual" | "gmb";

// ─────────────────────────── CategoryPicker ─────────────────────────────────

function CategoryPicker({ selected, onSelect, isDark }: { selected: string; onSelect: (cat: string) => void; isDark: boolean }) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? CATEGORY_GROUPS.flatMap((g) =>
        g.categories.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
      )
    : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Branche suchen oder eintippen…"
          className={`w-full ${isDark ? "bg-slate-700/60 border-slate-600/50 text-slate-200 placeholder-slate-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"} border text-sm px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-lime-500/60 focus:bg-lime-600/10 transition-all`}
        />
        {search && (
          <button onClick={() => setSearch("")} className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"} transition-colors`} aria-label="Suche löschen">✕</button>
        )}
      </div>
      {filtered !== null ? (
        <div className={`max-h-52 overflow-y-auto rounded-xl border ${isDark ? "border-slate-700/50 bg-slate-800/60 divide-slate-700/40" : "border-gray-200 bg-white divide-gray-100"} divide-y`}>
          {filtered.length === 0 ? (
            <div className="px-3 py-3 flex items-center justify-between gap-2">
              <span className={`${isDark ? "text-slate-400" : "text-gray-500"} text-sm`}>Keine Treffer – Branche trotzdem übernehmen?</span>
              <button onClick={() => onSelect(search.trim())} className="text-xs bg-lime-600 hover:bg-lime-500 text-gray-900 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">Übernehmen</button>
            </div>
          ) : (
            filtered.map((cat) => (
              <button key={cat} onClick={() => onSelect(cat)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  selected === cat
                    ? isDark ? "bg-lime-600/30 text-white" : "bg-lime-50 text-lime-700"
                    : isDark ? "text-slate-200 hover:bg-slate-700/60 hover:text-white" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}>{cat}</button>
            ))
          )}
        </div>
      ) : (
        <div className={`max-h-64 overflow-y-auto rounded-xl border ${isDark ? "border-slate-700/50 bg-slate-800/60 divide-slate-700/40" : "border-gray-200 bg-white divide-gray-100"} divide-y`}>
          {CATEGORY_GROUPS.map((group) => (
            <details key={group.group} className="group">
              <summary className={`flex items-center gap-2 px-3 py-2 cursor-pointer select-none ${isDark ? "text-slate-300 hover:text-white hover:bg-slate-700/40" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"} transition-colors text-xs font-semibold uppercase tracking-wide`}>
                <span>{group.icon}</span>
                <span className="flex-1">{group.group}</span>
                <span className={`${isDark ? "text-slate-500" : "text-gray-400"} group-open:rotate-90 transition-transform text-[10px]`}>▶</span>
              </summary>
              <div className="flex flex-wrap gap-1.5 px-3 pb-2 pt-1">
                {group.categories.map((cat) => (
                  <button key={cat} onClick={() => onSelect(cat)}
                    className={`text-xs border px-2.5 py-1.5 rounded-lg transition-all ${
                      selected === cat
                        ? "bg-lime-600/40 border-lime-500/60 text-white"
                        : isDark
                          ? "bg-slate-700/60 hover:bg-lime-600/30 border-slate-600/50 hover:border-lime-500/50 text-slate-200 hover:text-white"
                          : "bg-gray-100 hover:bg-lime-50 border-gray-200 hover:border-lime-500/50 text-gray-700 hover:text-gray-900"
                    }`}>{cat}</button>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StartPage() {
  const isDark = typeof window !== "undefined" && localStorage.getItem("lp-theme") === "dark";
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>("choice");

  // Manual step
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");

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

  // ── Mutations ─────────────────────────────────────────────────────────────
  const gmbSearchPublicMutation = trpc.search.gmbSearchPublic.useMutation();
  const autocompleteCityMutation = trpc.search.autocompleteCity.useMutation();
  const startMutation = trpc.selfService.start.useMutation();

  const isLoading = startMutation.isPending;

  // ── Manual → Start ────────────────────────────────────────────────────────
  const handleManualStart = async () => {
    if (!businessName.trim() || !category.trim()) return;
    try {
      const data = await startMutation.mutateAsync({
        businessName: businessName.trim(),
        category: category.trim(),
        customerEmail: user?.email || undefined,
        source: "external",
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

  // ── Container class ───────────────────────────────────────────────────────
  const outerCard = `w-full max-w-md rounded-2xl p-8 ${isDark ? "bg-slate-800/60 backdrop-blur border border-slate-700/50 shadow-2xl" : "bg-white border border-gray-200 shadow-lg"}`;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-8 ${isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-stone-50"}`}>

      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shadow-xl shadow-lime-500/30">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <span className={`${isDark ? "text-white" : "text-gray-900"} font-bold text-2xl tracking-tight`}>Pageblitz</span>
        <p className={`${isDark ? "text-slate-400" : "text-gray-500"} text-sm text-center max-w-xs`}>
          Deine professionelle Website in wenigen Minuten – automatisch aus deinen Daten.
        </p>
      </div>

      {/* Card */}
      <div className={outerCard}>

        {/* ── Choice ── */}
        {step === "choice" && (
          <>
            <h1 className={`${isDark ? "text-white" : "text-gray-900"} text-2xl font-bold mb-1 text-center`}>
              Wie möchtest du starten?
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-gray-500"} text-sm text-center mb-6`}>
              Mit deinem Google My Business-Profil geht es am schnellsten.
            </p>

            {isAuthenticated && user?.email && (
              <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className={`${isDark ? "text-emerald-300" : "text-emerald-600"} text-sm`}>{user.email}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setStep("gmb")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 ${isDark ? "border-lime-500/40 bg-lime-500/10 hover:bg-lime-500/20" : "border-lime-500/50 bg-lime-50 hover:bg-lime-100"} hover:border-lime-500/60 transition-all text-left group`}
              >
                <div className={`w-10 h-10 rounded-lg ${isDark ? "bg-lime-500/20" : "bg-lime-100"} flex items-center justify-center flex-shrink-0`}>
                  <Globe className={`w-5 h-5 ${isDark ? "text-lime-400" : "text-lime-600"}`} />
                </div>
                <div className="flex-1">
                  <div className={`${isDark ? "text-white" : "text-gray-900"} font-semibold text-sm`}>Mit Google My Business starten</div>
                  <div className={`${isDark ? "text-slate-400" : "text-gray-500"} text-xs mt-0.5`}>Daten werden automatisch übernommen – schnellster Weg</div>
                </div>
                <ArrowRight className={`w-4 h-4 ${isDark ? "text-lime-400" : "text-lime-600"} group-hover:translate-x-1 transition-transform`} />
              </button>

              <button
                onClick={() => setStep("manual")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 ${isDark ? "border-slate-600/40 bg-slate-700/30 hover:bg-slate-700/50 hover:border-slate-600/60" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"} transition-all text-left group`}
              >
                <div className={`w-10 h-10 rounded-lg ${isDark ? "bg-slate-600/30" : "bg-gray-100"} flex items-center justify-center flex-shrink-0`}>
                  <Zap className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-gray-500"}`} />
                </div>
                <div className="flex-1">
                  <div className={`${isDark ? "text-white" : "text-gray-900"} font-semibold text-sm`}>Ohne Google My Business starten</div>
                  <div className={`${isDark ? "text-slate-400" : "text-gray-500"} text-xs mt-0.5`}>Unternehmensname und Branche eingeben</div>
                </div>
                <ArrowRight className={`w-4 h-4 ${isDark ? "text-slate-400" : "text-gray-500"} group-hover:translate-x-1 transition-transform`} />
              </button>
            </div>
          </>
        )}

        {/* ── Manual ── */}
        {step === "manual" && (
          <>
            <button
              onClick={() => setStep("choice")}
              className={`${isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} text-sm mb-5 flex items-center gap-1 transition-colors`}
            >
              ← Zurück
            </button>

            <h1 className={`${isDark ? "text-white" : "text-gray-900"} text-2xl font-bold mb-1`}>Dein Unternehmen</h1>
            <p className={`${isDark ? "text-slate-400" : "text-gray-500"} text-sm mb-5`}>
              Kurz zwei Infos – dann zeigen wir dir passende Design-Vorlagen.
            </p>

            <div className="space-y-3">
              <Input
                autoFocus
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Unternehmensname"
                className={`${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"} h-12`}
              />

              {/* Selected category badge */}
              {category && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? "bg-lime-500/10 border-lime-500/20" : "bg-lime-50 border-lime-200"} border`}>
                  <CheckCircle className={`w-3.5 h-3.5 ${isDark ? "text-lime-400" : "text-lime-600"} shrink-0`} />
                  <span className={`${isDark ? "text-lime-300" : "text-lime-700"} text-sm`}>{category}</span>
                  <button onClick={() => setCategory("")} className={`ml-auto ${isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"} text-xs`}>✕</button>
                </div>
              )}
              {/* Category picker */}
              {!category && (
                <CategoryPicker selected={category} onSelect={setCategory} isDark={isDark} />
              )}

              <Button
                onClick={handleManualStart}
                disabled={!businessName.trim() || !category.trim() || isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Wird vorbereitet…</div>
                ) : (
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Jetzt starten</div>
                )}
              </Button>
            </div>
          </>
        )}

        {/* ── GMB Search ── */}
        {step === "gmb" && (
          <>
            <button
              onClick={() => { setStep("choice"); setResolvedInfo(null); setGmbSearchResults([]); setGmbSearchQuery(""); }}
              className={`${isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} text-sm mb-5 flex items-center gap-1 transition-colors`}
            >
              ← Zurück
            </button>

            <h1 className={`${isDark ? "text-white" : "text-gray-900"} text-2xl font-bold mb-1`}>
              Dein Unternehmen bei Google
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-gray-500"} text-sm mb-5`}>
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
                  className={`${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"} h-12 w-full`}
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
                      className={`${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"} h-12 w-full`}
                      disabled={gmbSearchLoading || isLoading}
                    />
                    {showCitySuggestions && citysuggestions.length > 0 && (
                      <div className={`absolute top-full left-0 right-0 mt-1 z-50 ${isDark ? "bg-slate-800 border-slate-600" : "bg-white border-gray-200"} border rounded-xl shadow-xl overflow-hidden`}>
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
                            className={`w-full text-left px-3 py-2.5 text-sm ${isDark ? "text-slate-200 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-50"} transition-colors`}
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
                    className="h-12 px-5 bg-lime-500 hover:bg-lime-400 text-gray-900 rounded-xl flex-shrink-0"
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
                  <p className={`${isDark ? "text-slate-400" : "text-gray-500"} text-xs`}>
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
                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-600/50 bg-slate-700/40 hover:border-lime-500/60 hover:bg-lime-500/10 transition-all text-left"
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
