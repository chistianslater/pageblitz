import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Globe, Zap, ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// Step 1 → 2
// "choice" → "gmb"
type Step = "choice" | "gmb";

export default function StartPage() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>("choice");
  const [gmbSearchQuery, setGmbSearchQuery] = useState("");
  const [gmbSearchRegion, setGmbSearchRegion] = useState("");
  const [gmbSearchResults, setGmbSearchResults] = useState<Array<{ placeId: string; name: string; address: string; phone: string | null; rating: number | null; reviewCount: number; category: string; website: string | null }>>([]);
  const [gmbSearchLoading, setGmbSearchLoading] = useState(false);
  const [citysuggestions, setCitySuggestions] = useState<Array<{ label: string; placeId: string }>>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resolvedInfo, setResolvedInfo] = useState<{
    businessName: string | null;
    placeId: string | null;
    address: string | null;
    phone: string | null;
    category: string | null;
    reviews: any[];
    openingHours: string[];
    rating: string | null;
    reviewCount: number | null;
  } | null>(null);
  const [, navigate] = useLocation();

  const gmbSearchPublicMutation = trpc.search.gmbSearchPublic.useMutation();
  const autocompleteCityMutation = trpc.search.autocompleteCity.useMutation();

  const startMutation = trpc.selfService.start.useMutation({
    onSuccess: (data) => {
      toast.success("Website wird erstellt...");
      navigate(`/preview/${data.previewToken}/onboarding`);
    },
    onError: (err) => {
      toast.error("Fehler beim Erstellen: " + err.message);
    },
  });

  const isLoading = startMutation.isPending;

  // ── Choice → Manual ─────────────────────────────────
  const handleManualStart = () => {
    toast.info("Website wird erstellt...");
    startMutation.mutate({ customerEmail: user?.email || undefined, source: "external" });
  };

  // ── Step 3: GMB Search ──────────────────────────────
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

  const handleStartWithResolved = () => {
    if (!resolvedInfo) return;
    startMutation.mutate({
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
  };

  // ── Step indicator ──────────────────────────────────
  const steps = [
    { id: "choice", label: "Start" },
    { id: "gmb", label: "Details" },
  ];
  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center px-4">
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

      {/* Step Indicator – only visible on gmb step */}
      {step === "gmb" && (
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < currentStepIndex
                  ? "bg-emerald-500 text-white"
                  : i === currentStepIndex
                  ? "bg-indigo-500 text-white ring-2 ring-indigo-400/40"
                  : "bg-slate-700 text-slate-400"
              }`}>
                {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs ${i === currentStepIndex ? "text-white" : "text-slate-500"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-slate-700 mx-1" />}
            </div>
          ))}
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">

        {/* ── Choice ── */}
        {step === "choice" && (
          <>
            <h1 className="text-white text-2xl font-bold mb-1 text-center">
              Wie möchtest du starten?
            </h1>
            <p className="text-slate-400 text-sm text-center mb-6">
              Mit deinem Google My Business-Profil geht es am schnellsten.
            </p>

            {/* Email badge – only for logged-in users */}
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
                onClick={handleManualStart}
                disabled={startMutation.isPending}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-600/40 bg-slate-700/30 hover:bg-slate-700/50 hover:border-slate-600/60 transition-all text-left group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-600/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">Ohne Google My Business starten</div>
                  <div className="text-slate-400 text-xs mt-0.5">Beantworte ein paar kurze Fragen im Chat</div>
                </div>
                {startMutation.isPending ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: GMB Search ── */}
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
              {/* Search inputs – stacked vertically */}
              <div className="flex flex-col gap-2">
                {/* Row 1: Unternehmensname */}
                <Input
                  autoFocus
                  value={gmbSearchQuery}
                  onChange={(e) => { setGmbSearchQuery(e.target.value); setGmbSearchResults([]); setResolvedInfo(null); }}
                  onKeyDown={(e) => e.key === "Enter" && !gmbSearchLoading && handleGmbSearch()}
                  placeholder="Unternehmensname"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12 w-full"
                  disabled={gmbSearchLoading || isLoading}
                />

                {/* Row 2: Stadt + Suche-Button */}
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
                    {/* Autocomplete dropdown – full width under city field */}
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
                              if (gmbSearchQuery.trim() && !gmbSearchLoading) {
                                handleGmbSearch();
                              }
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    )}
                  </Button>
                </div>
              </div>

              {/* Search results */}
              {gmbSearchResults.length > 0 && !resolvedInfo && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-xs">{gmbSearchResults.length} Ergebnis{gmbSearchResults.length !== 1 ? "se" : ""} gefunden:</p>
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
                    <button onClick={() => { setResolvedInfo(null); }} className="ml-auto text-slate-500 hover:text-slate-300 text-xs">Ändern</button>
                  </div>
                  <p className="text-white font-semibold">{resolvedInfo.businessName}</p>
                  {resolvedInfo.address && <p className="text-slate-400 text-xs mt-0.5">{resolvedInfo.address.split(",").slice(0, 2).join(",")}</p>}
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={handleStartWithResolved}
                disabled={!resolvedInfo || isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Wird vorbereitet…</div>
                ) : (
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Jetzt starten</div>
                )}
              </Button>

              <button
                onClick={handleManualStart}
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
