import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginShell } from "@/components/auth/LoginShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "E-Mail oder Passwort falsch.");
        return;
      }

      // Hard redirect to ensure fresh auth state
      window.location.href = "/admin";
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginShell
      eyebrow="Mitarbeiterbereich"
      title="Mitarbeiter-Login"
      description="Interner Zugang zum Pageblitz-Dashboard."
      footer={
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-lp-accent underline underline-offset-4"
        >
          Zum Kunden-Login
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="mb-2 block text-sm font-medium">
            E-Mail-Adresse
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lp-muted" />
            <Input
              id="admin-email"
              type="email"
              placeholder="name@pageblitz.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 border-lp-line bg-white pl-9"
              required
              autoFocus
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-medium"
          >
            Passwort
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lp-muted" />
            <Input
              id="admin-password"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12 border-lp-line bg-white pl-9"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && <p className="text-sm text-lp-warn">{error}</p>}

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-lp-accent text-lp-accent-ink hover:bg-[#174a3b]"
          disabled={loading}
        >
          {loading ? "Anmelden…" : "Anmelden"}
        </Button>
      </form>
    </LoginShell>
  );
}
