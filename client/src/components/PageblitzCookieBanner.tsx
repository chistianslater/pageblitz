/**
 * DSGVO Cookie-Banner für Pageblitz.de
 * GA4, Clarity und Meta Pixel werden erst nach Einwilligung geladen.
 * Rybbit ist einwilligungsfrei (cookielos).
 */

import { useState, useEffect } from "react";
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
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Kurze Verzögerung, damit die Seite zuerst rendert
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Kann von außen via window.dispatchEvent(new Event('pageblitz:open-cookie-settings')) geöffnet werden
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
    return () => window.removeEventListener("pageblitz:open-cookie-settings", handler);
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
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie-Einstellungen"
    >
      <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0f1117]/95 backdrop-blur-xl">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cookie className="w-4.5 h-4.5 text-indigo-400" style={{ width: 18, height: 18 }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white mb-1">
                Cookies & Datenschutz
              </h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Wir nutzen Cookies, um Pageblitz zu verbessern. Notwendige Cookies (Session, Auth)
                sind immer aktiv.{" "}
                <a
                  href="/datenschutz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-0.5 transition-colors"
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
          <div className="px-5 pb-4 space-y-2 border-t border-white/8 pt-4">
            {/* Necessary – always on */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-white">
                  Notwendig{" "}
                  <span className="text-white/30 font-normal ml-1">– immer aktiv</span>
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  Session-Verwaltung, Authentifizierung, CSRF-Schutz. Rybbit (cookielos, keine Einwilligung nötig).
                </p>
              </div>
            </div>

            {CATEGORIES.map((cat) => {
              const checked = cat.id === "analytics" ? analytics : marketing;
              const toggle = cat.id === "analytics"
                ? () => setAnalytics((v) => !v)
                : () => setMarketing((v) => !v);

              return (
                <label
                  key={cat.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/8 cursor-pointer hover:bg-white/4 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={toggle}
                      className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">
                      {cat.label}{" "}
                      <span className="text-white/30 font-normal">– {cat.tools}</span>
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{cat.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors order-3 sm:order-1 sm:mr-auto"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Weniger" : "Einstellungen anpassen"}
          </button>

          <button
            onClick={handleNecessaryOnly}
            className="w-full sm:w-auto order-2 px-4 py-2 rounded-xl border border-white/12 text-xs font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-colors"
          >
            Nur notwendige
          </button>

          {expanded ? (
            <button
              onClick={handleSaveCustom}
              className="w-full sm:w-auto order-1 sm:order-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Auswahl speichern
            </button>
          ) : (
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto order-1 sm:order-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Alle akzeptieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
