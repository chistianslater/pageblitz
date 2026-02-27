import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import CookieBanner from "@/components/CookieBanner";
import { Loader2, Zap, AlertCircle, CheckCircle, MessageSquare, Bot, Calendar, Globe, Palette } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { WebsiteData, ColorScheme } from "@shared/types";

const addonIcons: Record<string, any> = { MessageSquare, Bot, Calendar, Globe };

const ADDONS = [
  { id: "contact-form", name: "Kontaktformular", description: "Professionelles Kontaktformular mit E-Mail-Benachrichtigung", price: 49, icon: "MessageSquare" },
  { id: "ai-chat", name: "KI-Chat", description: "Intelligenter Chatbot für automatische Kundenanfragen", price: 99, icon: "Bot" },
  { id: "booking", name: "Terminbuchung", description: "Online-Terminbuchungssystem für Ihre Kunden", price: 79, icon: "Calendar" },
  { id: "custom-domain", name: "Eigene Domain", description: "Verbinden Sie Ihre eigene Domain", price: 29, icon: "Globe" },
];

// Curated color presets for the color picker
const COLOR_PRESETS = [
  { label: "Original", value: null },
  { label: "Ozeanblau", value: "#1565c0" },
  { label: "Smaragd", value: "#2e7d32" },
  { label: "Rubin", value: "#c62828" },
  { label: "Violett", value: "#6a1b9a" },
  { label: "Bernstein", value: "#e65100" },
  { label: "Gold", value: "#c9a96e" },
  { label: "Anthrazit", value: "#37474f" },
  { label: "Koralle", value: "#e91e63" },
  { label: "Türkis", value: "#00838f" },
  { label: "Indigo", value: "#283593" },
  { label: "Terrakotta", value: "#b5451b" },
];

function applyCustomColor(base: ColorScheme, customPrimary: string): ColorScheme {
  // Derive secondary by darkening primary slightly
  const hex = customPrimary.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const darken = (v: number) => Math.max(0, Math.floor(v * 0.75));
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  const secondary = `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
  return {
    ...base,
    primary: customPrimary,
    secondary,
    gradient: `linear-gradient(135deg, ${customPrimary} 0%, ${secondary} 100%)`,
  };
}

export default function PreviewPage() {
  const params = useParams<{ token: string }>();
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customHex, setCustomHex] = useState("#1565c0");

  const { data, isLoading, error } = trpc.website.get.useQuery(
    { token: params.token },
    { enabled: !!params.token }
  );

  const baseColorScheme = useMemo(() => {
    if (!data) return null;
    return data.website.colorScheme as ColorScheme;
  }, [data]);

  const colorScheme = useMemo(() => {
    if (!baseColorScheme) return null;
    if (!customColor) return baseColorScheme;
    return applyCustomColor(baseColorScheme, customColor);
  }, [baseColorScheme, customColor]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Website wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !colorScheme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold mt-4 text-gray-900">Website nicht gefunden</h1>
          <p className="text-gray-500 mt-2">Der Preview-Link ist ungültig oder abgelaufen.</p>
        </div>
      </div>
    );
  }

  const websiteData = data.website.websiteData as WebsiteData;
  const heroImageUrl = (data.website as any).heroImageUrl as string | null | undefined;
  const layoutStyle = (data.website as any).layoutStyle as string | null | undefined;
  const business = data.business;

  // Navigate to onboarding
  const goToOnboarding = () => {
    window.location.href = `/preview/${params.token}/onboarding`;
  };

  return (
    <div>
      {/* Preview Banner with Color Picker */}
      <div className="sticky top-0 z-[60] bg-gray-900 text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Zap className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              Vorschau für <strong>{business?.name}</strong> – Diese Website wurde von Pageblitz erstellt
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Color Picker Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700 hover:bg-gray-600 transition-colors"
                title="Farbe anpassen"
              >
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Farbe anpassen</span>
                {customColor && (
                  <span className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0" style={{ backgroundColor: customColor }} />
                )}
              </button>

              {showColorPicker && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72 z-50">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Hausfarbe wählen</p>

                  {/* Preset Colors */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {COLOR_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setCustomColor(preset.value);
                          if (preset.value) setCustomHex(preset.value);
                          setShowColorPicker(false);
                        }}
                        className="flex flex-col items-center gap-1 group"
                        title={preset.label}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl border-2 transition-all group-hover:scale-110 ${customColor === preset.value ? "border-gray-900 scale-110" : "border-transparent"}`}
                          style={{
                            backgroundColor: preset.value || baseColorScheme?.primary || "#3b82f6",
                            boxShadow: customColor === preset.value ? "0 0 0 2px white, 0 0 0 4px " + (preset.value || baseColorScheme?.primary) : "none"
                          }}
                        />
                        <span className="text-[10px] text-gray-500 text-center leading-tight">{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Input */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 mb-2">Eigene Farbe (Hex)</p>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customHex}
                        onChange={e => setCustomHex(e.target.value)}
                        className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customHex}
                        onChange={e => {
                          const v = e.target.value;
                          setCustomHex(v);
                        }}
                        placeholder="#1565c0"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-900 font-mono"
                      />
                      <button
                        onClick={() => {
                          if (/^#[0-9a-fA-F]{6}$/.test(customHex)) {
                            setCustomColor(customHex);
                            setShowColorPicker(false);
                          } else {
                            toast.error("Ungültiger Hex-Code. Beispiel: #1565c0");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                        style={{ backgroundColor: colorScheme.primary }}
                      >
                        OK
                      </button>
                    </div>
                  </div>

                  {customColor && (
                    <button
                      onClick={() => { setCustomColor(null); setShowColorPicker(false); }}
                      className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Original-Farbe wiederherstellen
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={goToOnboarding}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Jetzt aktivieren – ab 79 €/Mo
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close color picker */}
      {showColorPicker && (
        <div className="fixed inset-0 z-[59]" onClick={() => setShowColorPicker(false)} />
      )}

      <WebsiteRenderer
        websiteData={websiteData}
        colorScheme={colorScheme}
        heroImageUrl={heroImageUrl}
        layoutStyle={layoutStyle}
        businessPhone={business?.phone || undefined}
        businessAddress={business?.address || undefined}
        businessEmail={business?.email || undefined}
        openingHours={business?.openingHours as string[] | undefined}
        businessCategory={(business as any)?.category || undefined}
        showActivateButton={true}
        onActivate={goToOnboarding}
      />
      <CookieBanner primaryColor={colorScheme?.primary} />
    </div>
  );
}
