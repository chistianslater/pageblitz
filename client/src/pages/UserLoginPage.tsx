import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Get redirect from URL params or default to dashboard
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/my-website";

      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), redirect }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Senden des Links");
      }

      setSent(true);
    } catch (err) {
      console.error("[Login] Failed to send magic link:", err);
      setError("Link konnte nicht gesendet werden. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
              <Zap className="h-5 w-5 text-black" fill="black" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Page<span className="text-indigo-400">blitz</span>
            </span>
          </div>
          <p className="text-sm text-white/50">Dein Kunden-Dashboard</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-white mb-2">
              Willkommen zurück
            </h1>
            <p className="text-sm text-white/50">
              Melde dich an, um deine Websites zu verwalten
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <p className="text-sm text-red-400 text-center">{error}</p>
            </motion.div>
          )}

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Link gesendet!</h3>
              <p className="text-sm text-white/60 mb-4">
                Wir haben dir einen sicheren Login-Link an<br />
                <span className="text-white font-medium">{email}</span><br />
                gesendet. Klicke auf den Link, um dich einzuloggen.
              </p>
              <p className="text-xs text-white/40">
                Keine E-Mail erhalten? Prüfe deinen Spam-Ordner oder{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  versuche es erneut
                </button>
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-white/[0.05] border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3 h-auto rounded-xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Login-Link senden
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-white/40 text-center">
                Wir senden dir einen sicheren Link – kein Passwort nötig.
              </p>
            </form>
          )}

          {/* Admin Link */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => navigate("/admin-login")}
              className="w-full flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <span>Mitarbeiter-Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm text-white/30"
        >
          Noch kein Kunde?{" "}
          <a href="/start" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Website erstellen
          </a>
        </motion.p>
      </div>
    </div>
  );
}
