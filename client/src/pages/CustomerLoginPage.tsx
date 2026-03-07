import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Zap, Chrome, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Check for error in URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get("error");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirect = urlParams.get("redirect") || "/my-website";
      const res = await fetch(`/api/auth/google/login-url?redirect=${encodeURIComponent(redirect)}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to get login URL");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("[Login] Failed to initiate Google login:", err);
      setError("Google Login konnte nicht gestartet werden. Ist Google OAuth konfiguriert?");
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
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

      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Senden");
      }

      setMagicLinkSent(true);
    } catch (err) {
      console.error("[Login] Failed to send magic link:", err);
      setError("Link konnte nicht gesendet werden.");
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
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
              <Zap className="h-6 w-6 text-black" fill="black" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Page<span className="text-indigo-400">blitz</span>
            </span>
          </div>
          <p className="text-sm text-white/50">Kunden-Login</p>
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
              Melde dich an, um deine Website zu verwalten
            </p>
          </div>

          {/* Error Messages */}
          {(error || urlError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">
                {error || (urlError === "auth_failed" && "Anmeldung fehlgeschlagen. Bitte versuche es erneut.") || urlError}
              </p>
            </motion.div>
          )}

          {magicLinkSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Link gesendet!</h3>
              <p className="text-sm text-white/60 mb-4">
                Wir haben dir einen sicheren Login-Link an<br />
                <span className="text-white font-medium">{email}</span><br />
                gesendet.
              </p>
              <p className="text-xs text-white/40">
                Keine E-Mail erhalten? Prüfe deinen Spam-Ordner oder{" "}
                <button
                  onClick={() => { setMagicLinkSent(false); setEmail(""); }}
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  versuche es erneut
                </button>
              </p>
            </motion.div>
          ) : (
            <>
              {/* Google Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium bg-white text-gray-900 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <Chrome className="w-5 h-5" />
                )}
                <span>Mit Google anmelden</span>
              </motion.button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#131313] text-xs text-white/40 uppercase tracking-wider">
                    oder
                  </span>
                </div>
              </div>

              {/* Magic Link Form */}
              <form onSubmit={handleMagicLink} className="space-y-4">
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
                      className="pl-10 bg-white/[0.05] border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 h-auto rounded-xl"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Magic Link senden
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-white/40 text-center">
                  Wir senden dir einen sicheren Link – kein Passwort nötig.
                </p>
              </form>
            </>
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
