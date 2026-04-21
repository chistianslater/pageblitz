import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Clock, ArrowRight, Sparkles } from "lucide-react";

export default function WelcomeBack() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") || "";
    setToken(t);
  }, []);

  const seedQuery = trpc.lifecycle.resolveSeed.useQuery(
    { token },
    { enabled: !!token, retry: false },
  );
  const consumeMutation = trpc.lifecycle.consumeSeed.useMutation();
  const captureEmailMutation = trpc.selfService.captureEmail.useMutation();

  const handleStart = async () => {
    if (!seedQuery.data) return;
    setCreating(true);
    setError(null);
    try {
      await consumeMutation.mutateAsync({ token });
      // Neuen Website-Entwurf anlegen mit der bekannten Email
      const { websiteId: _wid, previewToken } = await captureEmailMutation.mutateAsync({
        email: seedQuery.data.email,
      });
      navigate(`/preview/${previewToken}/onboarding`);
    } catch (e: any) {
      setError(e?.message || "Etwas ist schiefgelaufen. Bitte versuch es in ein paar Minuten erneut.");
      setCreating(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Kein Token angegeben</h1>
          <p className="text-slate-600 text-sm mb-6">
            Diese Seite erreichst du nur über einen Link aus deiner Email.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  if (seedQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500">Lade deine Daten…</div>
      </div>
    );
  }

  if (seedQuery.error || !seedQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Link nicht mehr gültig</h1>
          <p className="text-slate-600 text-sm mb-6">
            {seedQuery.error?.message || "Dieser Link ist abgelaufen oder wurde bereits benutzt."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
          >
            Neuen Entwurf starten
          </button>
        </div>
      </div>
    );
  }

  const { email, businessName } = seedQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 sm:p-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center mb-6">
          <Sparkles className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight">
          Willkommen zurück!
        </h1>
        <p className="text-slate-600 text-base leading-relaxed mb-6">
          {businessName ? (
            <>
              Vor einer Woche hast du angefangen, eine Website für <strong className="text-slate-900">{businessName}</strong> zu
              bauen. Deine Daten haben wir noch &ndash; in 60 Sekunden bauen wir dir einen frischen Entwurf.
            </>
          ) : (
            <>
              Deine Daten haben wir noch &ndash; in 60 Sekunden bauen wir dir einen frischen Website-Entwurf.
            </>
          )}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email-Adresse</p>
          <p className="text-sm text-slate-900 font-medium">{email}</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleStart}
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold text-base transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60"
        >
          {creating ? "Baue neuen Entwurf…" : (
            <>
              Neuen Entwurf bauen
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-3 py-3 text-slate-500 hover:text-slate-700 text-sm transition-colors"
        >
          Nein, vielleicht später
        </button>
      </div>
    </div>
  );
}
