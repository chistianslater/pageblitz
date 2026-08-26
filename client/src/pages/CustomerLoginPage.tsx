import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginShell } from "@/components/auth/LoginShell";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get("error");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirect = urlParams.get("redirect") || "/my-website";
      const res = await fetch(
        `/api/auth/google/login-url?redirect=${encodeURIComponent(redirect)}`
      );
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to get login URL");
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("[Login] Failed to initiate Google login:", err);
      setError(
        "Google Login konnte nicht gestartet werden. Bitte versuche es erneut."
      );
      setLoading(false);
    }
  };

  const handleMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const redirect = urlParams.get("redirect") || "/my-website";
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), redirect }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Senden");
      setMagicLinkSent(true);
    } catch (err) {
      console.error("[Login] Failed to send magic link:", err);
      setError("Link konnte nicht gesendet werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginShell
      eyebrow="Kundenbereich"
      title="Willkommen zurück."
      description="Melde dich sicher an, um deine Website zu verwalten."
      footer={
        <>
          Noch kein Kunde?{" "}
          <a
            href="/start"
            className="font-medium text-lp-accent underline decoration-lp-accent/35 underline-offset-4"
          >
            Website kostenlos erstellen
          </a>
        </>
      }
    >
      {(error || urlError) && (
        <div className="mb-6 flex items-start gap-2 rounded-[10px] border border-[#e5c2b4] bg-[#fbf0ec] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-lp-warn" />
          <p className="text-sm text-lp-warn">
            {error ||
              (urlError === "auth_failed" &&
                "Anmeldung fehlgeschlagen. Bitte versuche es erneut.") ||
              urlError}
          </p>
        </div>
      )}

      {magicLinkSent ? (
        <div className="py-3 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5f1]">
            <Mail className="h-7 w-7 text-lp-accent" />
          </div>
          <h2 className="mb-2 text-lg font-medium">Link gesendet.</h2>
          <p className="mb-4 text-sm leading-[1.6] text-lp-muted">
            Wir haben einen sicheren Login-Link an
            <br />
            <span className="font-medium text-lp-ink">{email}</span>
            <br />
            gesendet.
          </p>
          <p className="text-xs text-lp-muted">
            Keine E-Mail erhalten? Prüfe deinen Spam-Ordner oder{" "}
            <button
              type="button"
              onClick={() => {
                setMagicLinkSent(false);
                setEmail("");
              }}
              className="text-lp-accent underline underline-offset-4"
            >
              versuche es erneut
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-full border border-lp-line bg-white px-4 py-3.5 font-medium text-lp-ink transition-colors hover:border-lp-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-lp-line border-t-lp-ink motion-reduce:animate-none" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Mit Google fortfahren
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-lp-line" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-lp-surface px-3 text-xs uppercase tracking-wider text-lp-muted">
                oder
              </span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-lp-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.de"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  className="h-12 border-lp-line bg-white pl-10 text-lp-ink placeholder:text-lp-muted focus-visible:border-lp-accent"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="h-12 w-full rounded-full bg-lp-accent py-3 font-medium text-lp-accent-ink hover:bg-[#174a3b]"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />
              ) : (
                <>
                  Login-Link senden
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-center text-xs text-lp-muted">
              Sicherer Einmal-Link – kein Passwort nötig.
            </p>
          </form>
        </>
      )}

      <div className="mt-8 border-t border-lp-line pt-5">
        <button
          type="button"
          onClick={() => navigate("/admin-login")}
          className="flex w-full items-center justify-center gap-2 text-sm text-lp-muted transition-colors hover:text-lp-ink"
        >
          Mitarbeiter-Login
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </LoginShell>
  );
}
