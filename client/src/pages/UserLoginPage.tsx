import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Chrome, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProviderButtonProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  loading?: boolean;
}

function ProviderButton({ name, icon, color, onClick, loading }: ProviderButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      <span>Mit {name} anmelden</span>
    </motion.button>
  );
}

export default function UserLoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleLogin = async (provider: string) => {
    setLoading(provider);
    setError(null);

    try {
      // Get redirect from URL params or default to dashboard
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/my-website";

      const res = await fetch(`/api/auth/login-url?provider=${provider}&redirect=${encodeURIComponent(redirect)}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to get login URL");
      }

      // Redirect to OAuth server
      window.location.href = data.url;
    } catch (err) {
      console.error("[Login] Failed to initiate login:", err);
      setError("Login konnte nicht gestartet werden. Bitte versuche es erneut.");
      setLoading(null);
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

          <div className="space-y-3">
            {/* Google */}
            <ProviderButton
              name="Google"
              icon={<Chrome className="w-5 h-5" />}
              color="bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => handleLogin("google")}
              loading={loading === "google"}
            />

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-[#0a0a0a] text-xs text-white/40 uppercase tracking-wider">
                  oder
                </span>
              </div>
            </div>

            {/* Email (coming soon) */}
            <ProviderButton
              name="E-Mail"
              icon={<Mail className="w-5 h-5" />}
              color="bg-white/[0.05] text-white border border-white/10 hover:bg-white/[0.08]"
              onClick={() => navigate("/forgot-password")}
              loading={false}
            />
          </div>

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
