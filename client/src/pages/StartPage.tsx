import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Globe, Zap, ArrowRight, CheckCircle, Loader2, AlertCircle, Share2, Mail } from "lucide-react";
import { toast } from "sonner";

// Detect whether a URL looks like a Google Maps / share link
function isGoogleLink(url: string): boolean {
  return /share\.google\/|maps\.app\.goo\.gl\/|google\.com\/maps\/|maps\.google\.com\//.test(url);
}

// E-Mail-Validierungsfunktion
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function StartPage() {
  const [gmbUrl, setGmbUrl] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mode, setMode] = useState<"choice" | "gmb" | "manual">("choice");
  const [resolvedInfo, setResolvedInfo] = useState<{
    businessName: string | null;
    placeId: string | null;
    address: string | null;
    phone: string | null;
    category: string | null;
  } | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const resolveMutation = trpc.selfService.resolveLink.useMutation({
    onSuccess: (data) => {
      if (data.resolved && data.businessName) {
        setResolvedInfo({
          businessName: data.businessName,
          placeId: data.placeId ?? null,
          address: (data as any).address ?? null,
          phone: (data as any).phone ?? null,
          category: (data as any).category ?? null,
        });
        setResolveError(null);
        toast.success(`"${data.businessName}" gefunden!`);
      } else {
        setResolveError("Link konnte nicht aufgelöst werden. Du kannst trotzdem fortfahren.");
        toast.error("Link konnte nicht aufgelöst werden");
      }
    },
    onError: (err) => {
      setResolveError("Fehler beim Abrufen der Daten. Du kannst trotzdem fortfahren.");
      toast.error("Fehler beim Abrufen der Daten: " + err.message);
    },
  });

  const startMutation = trpc.selfService.start.useMutation({
    onSuccess: (data) => {
      toast.success("Website wird erstellt...");
      navigate(`/preview/${data.previewToken}/onboarding`);
    },
    onError: (err) => {
      toast.error("Fehler beim Erstellen: " + err.message);
    },
  });

  const handleUrlChange = (value: string) => {
    setGmbUrl(value);
    setResolvedInfo(null);
    setResolveError(null);
  };

  const validateEmail = (): boolean => {
    const email = customerEmail.trim();
    if (!email) {
      setEmailError("Bitte gib deine E-Mail-Adresse ein");
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError("Bitte gib eine gültige E-Mail-Adresse ein");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (value: string) => {
    setCustomerEmail(value);
    if (emailError && isValidEmail(value.trim())) {
      setEmailError(null);
    }
  };

  const handleResolveAndStart = async () => {
    if (!validateEmail()) return;

    const url = gmbUrl.trim();
    if (!url) {
      toast.error("Bitte gib einen Link ein");
      return;
    }

    if (isGoogleLink(url)) {
      // Resolve the link first to get business data
      resolveMutation.mutate({ url });
    } else {
      // Not a Google link – start without prefill
      toast.info("Link wird verarbeitet...");
      startMutation.mutate({
        gmbUrl: url,
        customerEmail: customerEmail.trim(),
        source: "external",
      });
    }
  };

  const handleStartWithResolved = () => {
    if (!validateEmail() || !resolvedInfo) return;
    startMutation.mutate({
      gmbUrl: gmbUrl.trim(),
      businessName: resolvedInfo.businessName || undefined,
      placeId: resolvedInfo.placeId || undefined,
      address: resolvedInfo.address || undefined,
      phone: resolvedInfo.phone || undefined,
      category: resolvedInfo.category || undefined,
      customerEmail: customerEmail.trim(),
      source: "external",
    });
  };

  const handleManualStart = () => {
    if (!validateEmail()) return;
    toast.info("Website wird erstellt...");
    startMutation.mutate({
      customerEmail: customerEmail.trim(),
      source: "external",
    });
  };

  const isLoading = resolveMutation.isPending || startMutation.isPending;

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

      {/* Card */}
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        {mode === "choice" && (
          <>
            <h1 className="text-white text-2xl font-bold mb-2 text-center">
              Wie möchtest du starten?
            </h1>
            <p className="text-slate-400 text-sm text-center mb-6">
              Mit deinem Google My Business-Profil geht es am schnellsten – wir füllen alles automatisch aus.
            </p>

            {/* Email Field - Required before starting */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 text-sm font-medium">Deine E-Mail-Adresse *</span>
              </div>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="max@beispiel.de"
                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12 ${emailError ? 'border-red-500' : ''}`}
                disabled={startMutation.isPending}
              />
              {emailError && (
                <p className="text-red-400 text-xs mt-1">{emailError}</p>
              )}
              <p className="text-slate-500 text-xs mt-1">
                Wir senden dir einen Link zur Website und Erinnerungen, falls du abbrechen möchtest.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMode("gmb")}
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

            {/* Trust signals */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: "⚡", text: "In 5 Min. fertig" },
                  { icon: "🎨", text: "Professionelles Design" },
                  { icon: "📱", text: "Mobiloptimiert" },
                ].map((item) => (
                  <div key={item.text} className="flex flex-col items-center gap-1">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-slate-400 text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === "gmb" && (
          <>
            <button
              onClick={() => { setMode("choice"); setResolvedInfo(null); setResolveError(null); }}
              className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
            >
              ← Zurück
            </button>
            <h1 className="text-white text-2xl font-bold mb-2">
              Google My Business Link
            </h1>
            <p className="text-slate-400 text-sm mb-1">
              Öffne Google Maps, suche dein Unternehmen und tippe auf <strong className="text-slate-300">„Teilen"</strong> – dann den Link hier einfügen.
            </p>

            {/* How-to hint */}
            <div className="mb-5 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2">
              <Share2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <p className="text-indigo-300 text-xs leading-relaxed">
                Alle Link-Formate werden unterstützt:<br />
                <span className="text-indigo-400 font-mono">share.google/…</span> · <span className="text-indigo-400 font-mono">maps.app.goo.gl/…</span> · <span className="text-indigo-400 font-mono">google.com/maps/place/…</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300 text-sm font-medium">Deine E-Mail-Adresse</span>
                </div>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="max@beispiel.de"
                  className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12 ${emailError ? 'border-red-500' : ''}`}
                  onKeyDown={(e) => e.key === "Enter" && gmbUrl.trim() && !isLoading && handleResolveAndStart()}
                  disabled={isLoading}
                />
                {emailError && (
                  <p className="text-red-400 text-xs mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <Input
                  value={gmbUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://share.google/…"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12"
                  onKeyDown={(e) => e.key === "Enter" && gmbUrl.trim() && !isLoading && handleResolveAndStart()}
                  disabled={isLoading}
                />
              </div>

              {/* Resolved info card */}
              {resolvedInfo && resolvedInfo.businessName && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-semibold">Unternehmen gefunden!</span>
                  </div>
                  <p className="text-white font-semibold text-base">{resolvedInfo.businessName}</p>
                  {resolvedInfo.address && (
                    <p className="text-slate-400 text-xs mt-1">{resolvedInfo.address}</p>
                  )}
                  {resolvedInfo.phone && (
                    <p className="text-slate-400 text-xs">{resolvedInfo.phone}</p>
                  )}
                </div>
              )}

              {/* Error */}
              {resolveError && (
                <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-700/50 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-amber-400 text-sm">{resolveError}</p>
                    <button
                      onClick={() => {
                        if (!validateEmail()) return;
                        startMutation.mutate({
                          gmbUrl: gmbUrl.trim(),
                          customerEmail: customerEmail.trim(),
                          source: "external",
                        });
                      }}
                      disabled={startMutation.isPending}
                      className="text-amber-300 text-xs underline mt-2 hover:text-amber-200"
                    >
                      Trotzdem ohne Daten fortfahren →
                    </button>
                  </div>
                </div>
              )}

              {/* Main CTA */}
              {resolvedInfo ? (
                <Button
                  onClick={handleStartWithResolved}
                  disabled={isLoading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                >
                  {startMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wird vorbereitet...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Mit diesen Daten starten
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleResolveAndStart}
                  disabled={!gmbUrl.trim() || isLoading}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {resolveMutation.isPending ? "Daten werden abgerufen…" : "Wird vorbereitet…"}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Jetzt starten
                    </div>
                  )}
                </Button>
              )}

              <button
                onClick={handleManualStart}
                disabled={isLoading}
                className="w-full text-slate-400 hover:text-white text-sm transition-colors py-2"
              >
                Ohne GMB-Link fortfahren →
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-8 text-center">
        Kein Konto erforderlich · Kostenlos testen · Erster Monat 39 €
      </p>
    </div>
  );
}
