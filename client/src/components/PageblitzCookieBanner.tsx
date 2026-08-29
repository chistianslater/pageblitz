/**
 * DSGVO Cookie-Banner für Pageblitz.de
 * GA4, Clarity und Meta Pixel werden erst nach Einwilligung geladen.
 * Rybbit ist einwilligungsfrei (cookielos).
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Cookie, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { getStoredConsent, saveConsent } from "@/lib/consent";

type Category = {
  id: "analytics" | "marketing";
  label: string;
  tools: string;
  description: string;
};

const CATEGORIES: Category[] = [
  {
    id: "analytics",
    label: "Analyse",
    tools: "Google Analytics 4, Microsoft Clarity",
    description:
      "Hilft uns zu verstehen, wie Besucher mit Pageblitz interagieren – anonymisierte Seitenstatistiken und Session-Heatmaps.",
  },
  {
    id: "marketing",
    label: "Marketing",
    tools: "Google Ads, Meta Pixel (Facebook)",
    description:
      "Ermöglicht die Messung von Werbekampagnen (Google Ads Conversions) und Remarketing auf Facebook/Instagram.",
  },
];

export default function PageblitzCookieBanner() {
  const [location] = useLocation();
  // Die Landing "/" ist dunkel (Nachtschicht) — der globale Banner bekommt
  // dort einen dunklen Token-Scope (.pb-cookie-dark in index.css); überall
  // sonst (Start-Funnel, Dashboard) bleibt der helle Studio-Look.
  const isDarkLanding = location === "/";
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const stored = getStoredConsent();
      if (stored) {
        setAnalytics(stored.analytics);
        setMarketing(stored.marketing);
      }
      setExpanded(true);
      setVisible(true);
    };
    window.addEventListener("pageblitz:open-cookie-settings", handler);
    return () =>
      window.removeEventListener("pageblitz:open-cookie-settings", handler);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
  };

  const handleNecessaryOnly = () => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
  };

  const handleSaveCustom = () => {
    saveConsent({ analytics, marketing });
    setVisible(false);
  };

  return (
    <div
      // pointer-events-none auf dem vollbreiten Wrapper: sonst fängt die
      // transparente Fläche links/rechts neben dem Panel alle Klicks ab —
      // der Chat-Button unten rechts (LandingPageChatWidget) war bei
      // sichtbarem Banner nicht anklickbar. Das Panel selbst schaltet sie
      // wieder ein.
      className={`fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-5 pointer-events-none ${
        isDarkLanding ? "pb-cookie-dark" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Cookie-Einstellungen"
      style={{ fontFamily: "var(--lp-font)" }}
    >
      {/* Studio-Look (Landing-Tokens `--lp-*` aus client/src/index.css):
          helle Surface, Hairline-Rahmen, Ink-Text, ein Grün — kein Dark-Panel,
          kein Neon-Lime. Der Banner ist global (auch /start, Dashboard). */}
      <div
        className="max-w-2xl mx-auto rounded-2xl overflow-hidden border pointer-events-auto"
        style={{
          background: "var(--lp-surface)",
          borderColor: "var(--lp-line)",
          color: "var(--lp-ink)",
          boxShadow: "0 24px 48px -24px rgba(29,26,23,0.35)",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: "var(--lp-accent)",
                color: "var(--lp-accent-ink)",
              }}
            >
              <Cookie style={{ width: 18, height: 18 }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold mb-1">
                Cookies & Datenschutz
              </h2>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--lp-muted)" }}
              >
                Wir nutzen Cookies, um Pageblitz zu verbessern. Notwendige
                Cookies (Session, Auth) sind immer aktiv.{" "}
                <a
                  href="/datenschutz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 inline-flex items-center gap-0.5 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--lp-accent)" }}
                >
                  Datenschutzerklärung
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Expandable categories */}
        {expanded && (
          <div
            className="px-5 pb-4 space-y-2 border-t pt-4"
            style={{ borderColor: "var(--lp-line)" }}
          >
            {/* Necessary – always on */}
            <div
              className="flex items-start gap-3 p-3 rounded-xl border"
              style={{
                borderColor: "var(--lp-line)",
                background: "var(--lp-canvas)",
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className="w-4 h-4 rounded border-2 flex items-center justify-center"
                  style={{
                    borderColor: "var(--lp-accent)",
                    backgroundColor: "var(--lp-accent)",
                    color: "var(--lp-accent-ink)",
                  }}
                >
                  <svg
                    className="w-2.5 h-2.5"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">
                  Notwendig{" "}
                  <span
                    className="font-normal ml-1"
                    style={{ color: "var(--lp-muted)" }}
                  >
                    – immer aktiv
                  </span>
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--lp-muted)" }}
                >
                  Session-Verwaltung, Authentifizierung, CSRF-Schutz. Rybbit
                  (cookielos, keine Einwilligung nötig).
                </p>
              </div>
            </div>

            {CATEGORIES.map(cat => {
              const checked = cat.id === "analytics" ? analytics : marketing;
              const toggle =
                cat.id === "analytics"
                  ? () => setAnalytics(v => !v)
                  : () => setMarketing(v => !v);

              return (
                <label
                  key={cat.id}
                  className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-lp-canvas"
                  style={{ borderColor: "var(--lp-line)" }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={toggle}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: "var(--lp-accent)" }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      {cat.label}{" "}
                      <span
                        className="font-normal"
                        style={{ color: "var(--lp-muted)" }}
                      >
                        – {cat.tools}
                      </span>
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--lp-muted)" }}
                    >
                      {cat.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs underline-offset-2 hover:underline transition-colors order-3 sm:order-1 sm:mr-auto"
            style={{ color: "var(--lp-muted)" }}
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {expanded ? "Weniger" : "Einstellungen anpassen"}
          </button>

          <button
            onClick={handleNecessaryOnly}
            className="w-full sm:w-auto order-2 px-4 py-2 rounded-full border text-xs font-medium transition-colors hover:bg-lp-canvas"
            style={{ borderColor: "var(--lp-line)", color: "var(--lp-ink)" }}
          >
            Nur notwendige
          </button>

          {expanded ? (
            <button
              onClick={handleSaveCustom}
              className="w-full sm:w-auto order-1 sm:order-3 px-4 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--lp-accent)",
                color: "var(--lp-accent-ink)",
              }}
            >
              Auswahl speichern
            </button>
          ) : (
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto order-1 sm:order-3 px-4 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--lp-accent)",
                color: "var(--lp-accent-ink)",
              }}
            >
              Alle akzeptieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
