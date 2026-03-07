import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("E-Mail wurde gesendet");
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Senden");
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    requestReset.mutate({ email });
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Zurück zum Login</span>
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-8"
        >
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-indigo-400" />
                </div>
                <h1 className="text-xl font-semibold text-white mb-2">
                  Passwort vergessen?
                </h1>
                <p className="text-sm text-white/50">
                  Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="deine@email.de"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={requestReset.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-500"
                >
                  {requestReset.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Wird gesendet...
                    </>
                  ) : (
                    "Link senden"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                E-Mail gesendet!
              </h2>
              <p className="text-sm text-white/50 mb-6">
                Wenn ein Account mit <strong className="text-white/70">{email}</strong> existiert, 
                erhältst du in Kürze eine E-Mail mit Anweisungen.
              </p>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Zum Login
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
