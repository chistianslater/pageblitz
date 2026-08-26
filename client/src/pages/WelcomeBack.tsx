import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Clock, ArrowRight } from "lucide-react";

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
      navigate(`/onboarding/${previewToken}`);
    } catch (e: any) {
      setError(e?.message || "Etwas ist schiefgelaufen. Bitte versuch es in ein paar Minuten erneut.");
      setCreating(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lp-canvas p-6 text-lp-ink">
        <div className="w-full max-w-md rounded-[14px] border border-lp-line bg-lp-surface p-8 text-center">
          <h1 className="mb-2 text-xl font-semibold">Kein Token angegeben</h1>
          <p className="mb-6 text-sm text-lp-muted">
            Diese Seite erreichst du nur über einen Link aus deiner Email.
          </p>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-lp-accent px-6 py-3 font-medium text-lp-accent-ink transition-colors hover:bg-[#174a3b]"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  if (seedQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lp-canvas p-6 text-lp-ink">
        <div className="w-full max-w-[18rem]" role="status">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-lp-ink text-lg font-semibold text-lp-canvas">
              ↯
            </span>
            <span className="font-medium">Pageblitz</span>
          </div>
          <p className="lp-kicker mt-8">Einen Moment</p>
          <p className="mt-2 text-sm text-lp-muted">Deine Daten werden geladen …</p>
          <div className="mt-5 grid grid-cols-3 gap-1.5" aria-hidden="true">
            <span className="h-1 animate-pulse rounded-full bg-lp-accent motion-reduce:animate-none" />
            <span className="h-1 animate-pulse rounded-full bg-lp-accent [animation-delay:180ms] motion-reduce:animate-none" />
            <span className="h-1 animate-pulse rounded-full bg-lp-accent [animation-delay:360ms] motion-reduce:animate-none" />
          </div>
        </div>
      </div>
    );
  }

  if (seedQuery.error || !seedQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lp-canvas p-6 text-lp-ink">
        <div className="w-full max-w-md rounded-[14px] border border-lp-line bg-lp-surface p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e8df] text-lp-warn">
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="mb-2 text-xl font-semibold">Link nicht mehr gültig</h1>
          <p className="mb-6 text-sm text-lp-muted">
            {seedQuery.error?.message || "Dieser Link ist abgelaufen oder wurde bereits benutzt."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-lp-accent px-6 py-3 font-medium text-lp-accent-ink transition-colors hover:bg-[#174a3b]"
          >
            Neuen Entwurf starten
          </button>
        </div>
      </div>
    );
  }

  const { email, businessName: rawBusinessName } = seedQuery.data;
  // Platzhalter-Namen ("Lead (E-Mail erfasst)") als "kein Name" behandeln
  const businessName =
    rawBusinessName && !rawBusinessName.startsWith("Lead ") ? rawBusinessName : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-lp-canvas p-6 text-lp-ink">
      <div className="w-full max-w-lg rounded-[16px] border border-lp-line bg-lp-surface p-8 shadow-[0_28px_60px_-42px_rgba(29,26,23,0.55)] sm:p-10">
        <div className="mb-7 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-lp-ink text-xl font-semibold text-lp-canvas">
            ↯
          </span>
          <span className="font-medium">Pageblitz</span>
        </div>

        <p className="lp-kicker mb-3">Schön, dass du wieder da bist</p>
        <h1 className="mb-3 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">
          Willkommen zurück!
        </h1>
        <p className="mb-6 text-base leading-relaxed text-lp-muted">
          {businessName ? (
            <>
              Vor einer Woche hast du angefangen, eine Website für <strong className="text-lp-ink">{businessName}</strong> zu
              bauen. Deine Daten haben wir noch &ndash; in 60 Sekunden bauen wir dir einen frischen Entwurf.
            </>
          ) : (
            <>
              Deine Daten haben wir noch &ndash; in 60 Sekunden bauen wir dir einen frischen Website-Entwurf.
            </>
          )}
        </p>

        <div className="mb-6 rounded-[10px] border border-lp-line bg-lp-canvas p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-lp-muted">E-Mail-Adresse</p>
          <p className="text-sm font-medium">{email}</p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-lp-warn">{error}</p>
        )}

        <button
          onClick={handleStart}
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-lp-accent py-4 text-base font-semibold text-lp-accent-ink transition-colors hover:bg-[#174a3b] disabled:opacity-60"
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
          className="mt-3 w-full py-3 text-sm text-lp-muted transition-colors hover:text-lp-ink"
        >
          Nein, vielleicht später
        </button>
      </div>
    </div>
  );
}
