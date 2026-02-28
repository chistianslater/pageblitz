import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Globe, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function StartPage() {
  const [gmbUrl, setGmbUrl] = useState("");
  const [mode, setMode] = useState<"choice" | "gmb" | "manual">("choice");
  const [, navigate] = useLocation();

  const startMutation = trpc.selfService.start.useMutation({
    onSuccess: (data) => {
      navigate(`/preview/${data.previewToken}/onboarding`);
    },
  });

  const handleGmbStart = () => {
    startMutation.mutate({ gmbUrl: gmbUrl.trim() || undefined });
  };

  const handleManualStart = () => {
    startMutation.mutate({});
  };

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
            <p className="text-slate-400 text-sm text-center mb-8">
              Mit deinem Google My Business-Profil geht es am schnellsten – wir füllen alles automatisch aus.
            </p>

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
                  <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
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
              onClick={() => setMode("choice")}
              className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
            >
              ← Zurück
            </button>
            <h1 className="text-white text-2xl font-bold mb-2">
              Google My Business Link
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Füge den Link zu deinem Google My Business-Profil ein. Du findest ihn, indem du auf Google Maps nach deinem Unternehmen suchst und auf "Teilen" klickst.
            </p>

            <div className="space-y-4">
              <div>
                <Input
                  value={gmbUrl}
                  onChange={(e) => setGmbUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12"
                  onKeyDown={(e) => e.key === "Enter" && gmbUrl.trim() && handleGmbStart()}
                />
                <p className="text-slate-500 text-xs mt-2">
                  Beispiel: https://maps.app.goo.gl/... oder https://www.google.com/maps/place/...
                </p>
              </div>

              <Button
                onClick={handleGmbStart}
                disabled={!gmbUrl.trim() || startMutation.isPending}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
              >
                {startMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Wird vorbereitet...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Jetzt starten
                  </div>
                )}
              </Button>

              <button
                onClick={handleManualStart}
                disabled={startMutation.isPending}
                className="w-full text-slate-400 hover:text-white text-sm transition-colors py-2"
              >
                Ohne GMB-Link fortfahren →
              </button>
            </div>

            {startMutation.isError && (
              <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 text-sm">
                Fehler beim Starten. Bitte versuche es erneut.
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-8 text-center">
        Kein Konto erforderlich · Kostenlos testen · Erster Monat 39 €
      </p>
    </div>
  );
}
