import { useState, useEffect } from "react";
import { Shield, X, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "pageblitz_cookie_consent";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

interface Props {
  /** Slug of the current website – used to build Datenschutz link */
  slug?: string;
  /** Primary color for the accept button */
  primaryColor?: string;
}

export default function CookieBanner({ slug, primaryColor = "#2563eb" }: Props) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so the page renders first
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (consent: Omit<ConsentState, "necessary" | "timestamp">) => {
    const state: ConsentState = {
      necessary: true,
      analytics: consent.analytics,
      marketing: consent.marketing,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const acceptNecessary = () => save({ analytics: false, marketing: false });
  const saveCustom = () => save({ analytics, marketing });

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie-Einstellungen"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Wir respektieren deine Privatsphäre
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Wir verwenden Cookies, um diese Website zu betreiben und zu verbessern.
                Notwendige Cookies sind immer aktiv.{" "}
                {slug && (
                  <a
                    href={`/site/${slug}/datenschutz`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-700"
                  >
                    Datenschutzerklärung
                  </a>
                )}
              </p>
            </div>
            <button
              onClick={acceptNecessary}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
              aria-label="Schließen (nur notwendige Cookies)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="px-6 pb-4 space-y-3 border-t border-gray-100 pt-4">
            {[
              {
                id: "necessary",
                label: "Notwendige Cookies",
                description: "Für den Betrieb der Website erforderlich (Session, Sicherheit). Können nicht deaktiviert werden.",
                checked: true,
                disabled: true,
                onChange: () => {},
              },
              {
                id: "analytics",
                label: "Analyse-Cookies",
                description: "Helfen uns zu verstehen, wie Besucher die Website nutzen (z.B. Seitenaufrufe, Verweildauer).",
                checked: analytics,
                disabled: false,
                onChange: () => setAnalytics(!analytics),
              },
              {
                id: "marketing",
                label: "Marketing-Cookies",
                description: "Ermöglichen personalisierte Werbung und Remarketing auf anderen Plattformen.",
                checked: marketing,
                disabled: false,
                onChange: () => setMarketing(!marketing),
              },
            ].map((cat) => (
              <label
                key={cat.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  cat.disabled ? "bg-gray-50 border-gray-200" : "cursor-pointer hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={cat.checked}
                    disabled={cat.disabled}
                    onChange={cat.onChange}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-5 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors order-3 sm:order-1 sm:mr-auto"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Weniger anzeigen" : "Einstellungen anpassen"}
          </button>

          <button
            onClick={acceptNecessary}
            className="w-full sm:w-auto order-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Nur notwendige
          </button>

          {expanded ? (
            <button
              onClick={saveCustom}
              className="w-full sm:w-auto order-1 sm:order-3 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Auswahl speichern
            </button>
          ) : (
            <button
              onClick={acceptAll}
              className="w-full sm:w-auto order-1 sm:order-3 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Alle akzeptieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
