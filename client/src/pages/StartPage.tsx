import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { trackConversion } from "@/lib/tracking";
import { useLocation } from "wouter";
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { CATEGORY_GROUPS } from "@shared/gmbCategories";
import { BlitzMark, textLink, PRICE_YEARLY } from "@/components/landing/primitives";

type Step = "choice" | "manual" | "gmb";

// ── Studio-Look-Bausteine (Tokens `--lp-*` aus client/src/index.css) ────────

const FIELD =
  "h-12 w-full rounded-full border border-lp-line bg-white px-5 text-[1rem] text-lp-ink placeholder:text-lp-muted focus-visible:border-lp-accent focus-visible:outline-2 disabled:opacity-50";

const CTA =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-lp-accent text-[0.95rem] font-medium text-lp-accent-ink transition-[background-color,color,transform] duration-200 hover:bg-[#174a3b] active:scale-[0.98] disabled:bg-lp-line disabled:text-lp-muted disabled:active:scale-100";

// ─────────────────────────── CategoryPicker ─────────────────────────────────

function CategoryPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (cat: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? CATEGORY_GROUPS.flatMap(g =>
        g.categories.filter(c =>
          c.toLowerCase().includes(search.toLowerCase())
        )
      )
    : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <label htmlFor="category-search" className="sr-only">
          Branche
        </label>
        <input
          id="category-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Branche suchen oder eintippen…"
          className={`${FIELD} h-11 pr-11 text-[0.95rem]`}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-lp-muted transition-colors hover:text-lp-ink"
            aria-label="Suche löschen"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {filtered !== null ? (
        <div className="max-h-52 overflow-y-auto rounded-2xl border border-lp-line bg-lp-surface divide-y divide-lp-line">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm text-lp-muted">
                Keine Treffer – Branche trotzdem übernehmen?
              </span>
              <button
                onClick={() => onSelect(search.trim())}
                className="flex-shrink-0 rounded-full bg-lp-accent px-3.5 py-1.5 text-xs font-medium text-lp-accent-ink transition-colors hover:bg-[#174a3b]"
              >
                Übernehmen
              </button>
            </div>
          ) : (
            filtered.map(cat => (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  selected === cat
                    ? "bg-lp-accent text-lp-accent-ink"
                    : "text-lp-ink hover:bg-lp-canvas"
                }`}
              >
                {cat}
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-2xl border border-lp-line bg-lp-surface divide-y divide-lp-line">
          {CATEGORY_GROUPS.map(group => (
            <details key={group.group} className="group">
              <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-lp-muted transition-colors hover:text-lp-ink">
                <span>{group.icon}</span>
                <span className="flex-1">{group.group}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-lp-muted transition-transform group-open:rotate-90"
                />
              </summary>
              <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-1">
                {group.categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      selected === cat
                        ? "border-lp-accent bg-lp-accent text-lp-accent-ink"
                        : "border-lp-line bg-white text-lp-ink hover:border-lp-accent"
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

export default function StartPage() {
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
    rating: number | null; reviewCount: number; category: string | null; website: string | null;
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

  // ── Deep-Link aus dem Landingpage-Hero: /start?name=Muster%20GmbH ──────────
  // Wer im Hero seinen Firmennamen eingetippt hat, hat die Frage "wie möchtest
  // du starten?" faktisch schon beantwortet. Den Auswahl-Screen hier nochmal zu
  // zeigen, kostet nur einen Schritt. Wir gehen direkt in die GMB-Suche, weil
  // dort Adresse, Öffnungszeiten und Bewertungen automatisch mitkommen – das
  // ist der Moment, in dem der Nutzer seine eigene Website erkennt.
  // Findet die Suche nichts, bleibt er im GMB-Schritt und kann über "Zurück"
  // auf die manuelle Eingabe wechseln; der Name ist dort schon vorbelegt.
  const didPrefill = useRef(false);
  useEffect(() => {
    if (didPrefill.current) return;
    const name = new URLSearchParams(window.location.search).get("name")?.trim();
    if (!name) return;
    didPrefill.current = true;

    setBusinessName(name);
    setGmbSearchQuery(name);
    setStep("gmb");
    setGmbSearchLoading(true);
    gmbSearchPublicMutation
      .mutateAsync({ query: name })
      .then((res) => {
        setGmbSearchResults(res.results);
        if (res.results.length === 0) {
          toast.info("Kein Google-Eintrag gefunden – such nochmal oder starte ohne.");
        }
      })
      .catch(() => toast.error("Suche fehlgeschlagen – bitte nochmal versuchen."))
      .finally(() => setGmbSearchLoading(false));
    // Nur beim ersten Mount; didPrefill schützt zusätzlich gegen StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Manual → Start ────────────────────────────────────────────────────────
  const handleManualStart = async () => {
    if (!businessName.trim() || !category.trim()) return;
    try { (window as any).clarity?.("event", "start_manual"); (window as any).clarity?.("set", "start_category", category); } catch {}
    try {
      const data = await startMutation.mutateAsync({
        businessName: businessName.trim(),
        category: category.trim(),
        customerEmail: user?.email || undefined,
        source: "external",
      });
      trackConversion("form_start");
      toast.success("Website wird erstellt...");
      navigate(`/onboarding/${data.previewToken}`);
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
      trackConversion("form_start");
      toast.success("Website wird erstellt...");
      navigate(`/onboarding/${data.previewToken}`);
    } catch (err: any) {
      toast.error("Fehler beim Erstellen: " + err.message);
    }
  };

  return (
    <div className="lp flex min-h-screen flex-col bg-lp-canvas text-lp-ink">
      <main className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col px-5 pt-10 pb-12 sm:pt-14">
        {/* Logo-Zeile */}
        <div className="flex items-center gap-2.5 border-b border-lp-line pb-6">
          <BlitzMark />
          <span className="text-[1.05rem] font-medium tracking-[-0.01em]">
            Pageblitz
          </span>
        </div>

        {/* ── Choice ── */}
        {step === "choice" && (
          <div className="pt-10">
            <p className="lp-kicker mb-4">Website erstellen</p>
            <h1 className="text-[2rem] leading-[1.05] tracking-[-0.02em]">
              Wie möchtest du starten?
            </h1>
            <p className="mt-3 text-[1rem] leading-[1.6] text-lp-muted">
              Mit deinem Google My Business-Profil geht es am schnellsten.
            </p>

            {isAuthenticated && user?.email && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm text-lp-muted">
                <CheckCircle
                  className="h-4 w-4 shrink-0 text-lp-accent"
                  aria-hidden="true"
                />
                Angemeldet als {user.email}
              </p>
            )}

            <div className="mt-8 space-y-3">
              <button
                onClick={() => { setStep("gmb"); try { (window as any).clarity?.("event", "start_gmb"); } catch {} }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-lp-line bg-lp-surface p-5 text-left transition-colors hover:border-lp-accent"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium text-lp-ink">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-lp-accent"
                    />
                    Mit Google My Business starten
                  </div>
                  <div className="mt-1 text-sm text-lp-muted">
                    Daten werden automatisch übernommen – schnellster Weg
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-lp-muted transition-[color,transform] group-hover:translate-x-1 group-hover:text-lp-accent"
                  aria-hidden="true"
                />
              </button>

              <button
                onClick={() => setStep("manual")}
                className="group flex w-full items-center gap-4 rounded-2xl border border-lp-line bg-lp-surface p-5 text-left transition-colors hover:border-lp-accent"
              >
                <div className="flex-1">
                  <div className="font-medium text-lp-ink">
                    Ohne Google My Business starten
                  </div>
                  <div className="mt-1 text-sm text-lp-muted">
                    Unternehmensname und Branche eingeben
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-lp-muted transition-[color,transform] group-hover:translate-x-1 group-hover:text-lp-accent"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        )}

        {/* ── Manual ── */}
        {step === "manual" && (
          <div className="pt-10">
            <button onClick={() => setStep("choice")} className={`${textLink} text-sm`}>
              ← Zurück
            </button>

            <h1 className="mt-6 text-[2rem] leading-[1.05] tracking-[-0.02em]">
              Dein Unternehmen
            </h1>
            <p className="mt-3 text-[1rem] leading-[1.6] text-lp-muted">
              Kurz zwei Infos – dann zeigen wir dir passende Design-Vorlagen.
            </p>

            <div className="mt-8 space-y-3">
              <div>
                <label htmlFor="manual-business-name" className="sr-only">
                  Unternehmensname
                </label>
                <input
                  id="manual-business-name"
                  autoFocus
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Unternehmensname"
                  autoComplete="organization"
                  className={FIELD}
                />
              </div>

              {/* Selected category badge */}
              {category && (
                <div className="flex items-center gap-2 rounded-full border border-lp-line bg-lp-surface px-4 py-2.5">
                  <CheckCircle
                    className="h-4 w-4 shrink-0 text-lp-accent"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-lp-ink">{category}</span>
                  <button
                    onClick={() => setCategory("")}
                    className="ml-auto text-lp-muted transition-colors hover:text-lp-ink"
                    aria-label="Branche entfernen"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
              {/* Category picker */}
              {!category && (
                <CategoryPicker selected={category} onSelect={setCategory} />
              )}

              <button
                onClick={handleManualStart}
                disabled={!businessName.trim() || !category.trim() || isLoading}
                className={CTA}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Wird vorbereitet…
                  </>
                ) : (
                  <>
                    Jetzt starten
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── GMB Search ── */}
        {step === "gmb" && (
          <div className="pt-10">
            <button
              onClick={() => { setStep("choice"); setResolvedInfo(null); setGmbSearchResults([]); setGmbSearchQuery(""); }}
              className={`${textLink} text-sm`}
            >
              ← Zurück
            </button>

            <h1 className="mt-6 text-[2rem] leading-[1.05] tracking-[-0.02em]">
              Dein Unternehmen bei Google
            </h1>
            <p className="mt-3 text-[1rem] leading-[1.6] text-lp-muted">
              Suche deinen Betrieb – wir übernehmen alle Infos automatisch.
            </p>

            <div className="mt-8 space-y-4">
              {/* Search inputs */}
              <div className="flex flex-col gap-2">
                <div>
                  <label htmlFor="gmb-business-name" className="sr-only">
                    Unternehmensname
                  </label>
                  <input
                    id="gmb-business-name"
                    autoFocus
                    type="text"
                    value={gmbSearchQuery}
                    onChange={e => { setGmbSearchQuery(e.target.value); setGmbSearchResults([]); setResolvedInfo(null); }}
                    onKeyDown={e => e.key === "Enter" && !gmbSearchLoading && handleGmbSearch()}
                    placeholder="Unternehmensname"
                    autoComplete="organization"
                    className={FIELD}
                    disabled={gmbSearchLoading || isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <label htmlFor="gmb-region" className="sr-only">
                      Stadt (optional)
                    </label>
                    <input
                      id="gmb-region"
                      type="text"
                      value={gmbSearchRegion}
                      onChange={e => {
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
                      onKeyDown={e => {
                        if (e.key === "Enter" && !gmbSearchLoading) {
                          setShowCitySuggestions(false);
                          handleGmbSearch();
                        }
                        if (e.key === "Escape") setShowCitySuggestions(false);
                      }}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                      onFocus={() => citysuggestions.length > 0 && setShowCitySuggestions(true)}
                      placeholder="Stadt (optional)"
                      className={FIELD}
                      disabled={gmbSearchLoading || isLoading}
                    />
                    {showCitySuggestions && citysuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-lp-line bg-lp-surface shadow-[0_16px_32px_-16px_rgba(29,26,23,0.3)]">
                        {citysuggestions.map(s => (
                          <button
                            key={s.placeId}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => {
                              const cityName = s.label.split(",")[0].trim();
                              setGmbSearchRegion(cityName);
                              setCitySuggestions([]);
                              setShowCitySuggestions(false);
                              if (gmbSearchQuery.trim() && !gmbSearchLoading) handleGmbSearch();
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-lp-ink transition-colors hover:bg-lp-canvas"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleGmbSearch}
                    disabled={!gmbSearchQuery.trim() || gmbSearchLoading || isLoading}
                    aria-label="Suchen"
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lp-accent text-lp-accent-ink transition-[background-color,transform] duration-200 hover:bg-[#174a3b] active:scale-[0.98] disabled:bg-lp-line disabled:text-lp-muted disabled:active:scale-100"
                  >
                    {gmbSearchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Search className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Search results */}
              {gmbSearchResults.length > 0 && !resolvedInfo && (
                <div>
                  <p className="lp-kicker">
                    {gmbSearchResults.length} Ergebnis{gmbSearchResults.length !== 1 ? "se" : ""} gefunden
                  </p>
                  <ul className="mt-3 space-y-2">
                    {gmbSearchResults.map(result => (
                      <li key={result.placeId}>
                        <button
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
                          className="group flex w-full items-start gap-3 rounded-2xl border border-lp-line bg-lp-surface p-4 text-left transition-colors hover:border-lp-accent disabled:opacity-50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-lp-ink">{result.name}</p>
                            <p className="mt-0.5 truncate text-sm text-lp-muted">
                              {result.address.split(",").slice(0, 2).join(",")}
                            </p>
                            {result.rating && (
                              <p className="mt-1 text-xs text-lp-muted">
                                <span aria-hidden="true" className="text-lp-accent">★</span>{" "}
                                {result.rating.toFixed(1)} ({result.reviewCount} Bewertungen)
                              </p>
                            )}
                          </div>
                          <ArrowRight
                            className="mt-1 h-4 w-4 shrink-0 text-lp-muted transition-[color,transform] group-hover:translate-x-1 group-hover:text-lp-accent"
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No results */}
              {!gmbSearchLoading && gmbSearchResults.length === 0 && gmbSearchPublicMutation.isSuccess && !resolvedInfo && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-lp-line bg-lp-surface p-4">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-lp-warn"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-lp-ink">
                    Kein Treffer – versuche einen anderen Begriff oder ergänze die Stadt.
                  </p>
                </div>
              )}

              {/* Selected business confirmation */}
              {resolvedInfo && (
                <div className="rounded-2xl border border-lp-accent bg-lp-surface p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="h-4 w-4 shrink-0 text-lp-accent"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-lp-accent">
                      Unternehmen ausgewählt
                    </span>
                    <button
                      onClick={() => setResolvedInfo(null)}
                      className={`${textLink} ml-auto text-xs`}
                    >
                      Ändern
                    </button>
                  </div>
                  <p className="mt-2 font-medium text-lp-ink">{resolvedInfo.businessName}</p>
                  {resolvedInfo.address && (
                    <p className="mt-0.5 text-sm text-lp-muted">
                      {resolvedInfo.address.split(",").slice(0, 2).join(",")}
                    </p>
                  )}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleStartWithResolved}
                disabled={!resolvedInfo || isLoading}
                className={CTA}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Wird vorbereitet…
                  </>
                ) : (
                  <>
                    Jetzt starten
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="text-center">
                <button
                  onClick={() => setStep("manual")}
                  disabled={isLoading}
                  className={`${textLink} text-sm disabled:opacity-50`}
                >
                  Mein Unternehmen ist nicht dabei – manuell eingeben →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Fußzeile: wie die Landing-TrustLine */}
        <footer className="mt-auto pt-14">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-lp-line pt-5 text-[0.9rem] text-lp-muted">
            {["7 Tage gratis", `Danach ${PRICE_YEARLY}/Monat`, "Jederzeit kündbar"].map(item => (
              <li key={item} className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-lp-accent"
                />
                {item}
              </li>
            ))}
          </ul>
        </footer>
      </main>
    </div>
  );
}
