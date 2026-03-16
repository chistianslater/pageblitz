import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Shield,
  Globe,
  Zap,
  Package,
  ExternalLink,
  Trash2,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// ── Components ───────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Aktiv", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    canceled: { label: "Gekündigt", cls: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    past_due: { label: "Zahlung ausstehend", cls: "bg-red-500/20 text-red-300 border-red-500/40" },
    trialing: { label: "Testphase", cls: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
    incomplete: { label: "Unvollständig", cls: "bg-slate-500/20 text-slate-400 border-slate-500/40" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-slate-500/20 text-slate-400 border-slate-500/40" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────

export default function AccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "subscription" | "security">("profile");

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Mutations
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil aktualisiert");
      setEditingProfile(false);
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren");
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Passwort geändert");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    },
    onError: (error) => {
      setPasswordError(error.message || "Fehler beim Ändern des Passworts");
    },
  });

  const billingPortalMutation = trpc.customer.createBillingPortalSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Öffnen des Kundenportals");
    },
  });

  // Fetch user's websites and subscriptions
  const { data: myWebsites, isLoading: websitesLoading } = trpc.customer.getMyWebsites.useQuery(
    undefined,
    { enabled: !!user }
  );

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ name, email });
  };

  const handleChangePassword = () => {
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("Passwort muss mindestens 8 Zeichen haben");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwörter stimmen nicht überein");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleLogout = async () => {
    await logout();
    // Small delay to ensure all state is cleared before redirect
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  // Check if user logged in with Google
  const isGoogleUser = user?.loginMethod === "google";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">Bitte melde dich an, um deinen Account zu verwalten.</p>
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-500">
            Zum Login
          </Button>
        </div>
      </div>
    );
  }

  // Get subscription info from first website (if any)
  const subscription = myWebsites?.[0]?.subscription;
  const website = myWebsites?.[0]?.website;
  const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";

  // Compute active paid add-ons from subscription.addOns (supports both storage formats)
  const subAddOns = (subscription?.addOns ?? {}) as Record<string, any>;
  const ADDON_INFO: Record<string, { label: string; price: string }> = {
    contactForm: { label: "Kontaktformular", price: "3,90 €/Mo" },
    gallery:     { label: "Bildergalerie",   price: "3,90 €/Mo" },
    menu:        { label: "Speisekarte",     price: "3,90 €/Mo" },
    pricelist:   { label: "Preisliste",      price: "3,90 €/Mo" },
  };
  const activeAddOns = (Object.keys(ADDON_INFO) as Array<keyof typeof ADDON_INFO>).filter(
    (k) => subAddOns[k] === true || subAddOns.features?.[k] === true
  );
  const BASE_PRICE_CENTS = 1990; // Jahresabo-Basis (Brutto inkl. MwSt.)
  const ADDON_PRICE_CENTS = 390;
  const totalCents = BASE_PRICE_CENTS + activeAddOns.length * ADDON_PRICE_CENTS;
  const totalStr = (totalCents / 100).toFixed(2).replace(".", ",");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/my-website")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Zurück zum Dashboard</span>
          </button>
          <div className="flex-1" />
          <h1 className="text-white font-bold text-lg">Mein Konto</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6"
        >
          {/* Sidebar */}
          <div className="space-y-4">
            {/* User Card */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-white font-semibold">{user.name || "Unbenannt"}</h2>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5" />
                <span className="capitalize">{isGoogleUser ? "Google" : "E-Mail"} Login</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate("/my-website")}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <Monitor className="w-5 h-5" />
                <span className="font-medium">Meine Website</span>
              </button>
              <div className="border-t border-slate-700/50" />
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "profile" ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profil</span>
              </button>
              <button
                onClick={() => setActiveTab("subscription")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "subscription" ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Abonnement</span>
                {hasActiveSubscription && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "security" ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Sicherheit</span>
              </button>
              <div className="border-t border-slate-700/50" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-medium">Abmelden</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {activeTab === "profile" && (
              <>
                <Section title="Persönliche Daten" icon={<User className="w-5 h-5 text-blue-400" />}>
                  {editingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Name</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="Dein Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">E-Mail</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="deine@email.de"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => setEditingProfile(false)}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-500"
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Speichern
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-400 text-sm">Name</span>
                        </div>
                        <span className="text-white">{user.name || "Nicht angegeben"}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-400 text-sm">E-Mail</span>
                        </div>
                        <span className="text-white">{user.email || "Nicht angegeben"}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-400 text-sm">Mitglied seit</span>
                        </div>
                        <span className="text-white">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("de-DE") : "Unbekannt"}
                        </span>
                      </div>
                      <Button
                        onClick={() => setEditingProfile(true)}
                        variant="outline"
                        className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  )}
                </Section>

                {/* Account Info */}
                <Section title="Account-Informationen" icon={<Package className="w-5 h-5 text-blue-400" />}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-400 text-sm">Anmeldemethode</span>
                      <span className="text-white capitalize">{isGoogleUser ? "Google" : "E-Mail"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-400 text-sm">Rolle</span>
                      <span className="text-white capitalize">
                        {user.role === "admin" ? "Administrator" : "Kunde"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-400 text-sm">Websites</span>
                      <span className="text-white">{myWebsites?.length || 0}</span>
                    </div>
                  </div>
                </Section>
              </>
            )}

            {activeTab === "subscription" && (
              <>
                {/* Current Subscription */}
                <Section title="Aktuelles Abonnement" icon={<CreditCard className="w-5 h-5 text-blue-400" />}>
                  {websitesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    </div>
                  ) : !myWebsites || myWebsites.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">Du hast noch keine aktive Website.</p>
                      <Button onClick={() => navigate("/start")} className="bg-blue-600 hover:bg-blue-500">
                        Website erstellen
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Status Card */}
                      <div className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/30 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              Pageblitz{activeAddOns.length > 0 ? ` + ${activeAddOns.length} Add-on${activeAddOns.length > 1 ? "s" : ""}` : ""}
                            </h3>
                            <p className="text-slate-400 text-sm">Alle Preise inkl. MwSt.</p>
                          </div>
                          <StatusBadge status={subscription?.status || "incomplete"} />
                        </div>

                        {/* Itemized breakdown */}
                        <div className="space-y-2 mb-4">
                          {/* Base plan */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Basis-Paket (Jahresabo)</span>
                            <span className="text-white font-semibold">19,90 €/Mo</span>
                          </div>
                          {/* Active add-ons */}
                          {activeAddOns.map((key) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-300">{ADDON_INFO[key].label}</span>
                                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">Aktiv</span>
                              </div>
                              <span className="text-emerald-400 font-semibold">+{ADDON_INFO[key].price}</span>
                            </div>
                          ))}
                          {/* Total – only if add-ons active */}
                          {activeAddOns.length > 0 && (
                            <div className="flex items-center justify-between text-sm border-t border-slate-700/60 pt-2 mt-2">
                              <span className="text-white font-bold">Gesamt</span>
                              <span className="text-white font-bold">{totalStr} €/Mo</span>
                            </div>
                          )}
                        </div>

                        {hasActiveSubscription && (
                          <div className="space-y-2 text-sm border-t border-slate-700/40 pt-3 mt-1">
                            <div className="flex items-center gap-2 text-emerald-400">
                              <CheckCircle className="w-4 h-4" />
                              <span>Website aktiv: {website?.slug}.pageblitz.de</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Nächste Zahlung:{" "}
                                {subscription?.currentPeriodEnd
                                  ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString("de-DE")
                                  : "Unbekannt"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => navigate(`/site/${website?.slug}`)}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Website öffnen
                        </Button>
                        <Button
                          onClick={() => navigate("/my-website")}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Bearbeiten
                        </Button>
                        {hasActiveSubscription && (
                          <Button
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            disabled={billingPortalMutation.isPending}
                            onClick={() => billingPortalMutation.mutate({ websiteId: website!.id })}
                          >
                            {billingPortalMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Kündigen
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Section>

              </>
            )}

            {activeTab === "security" && (
              <Section title="Sicherheit" icon={<Shield className="w-5 h-5 text-blue-400" />}>
                {isGoogleUser ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <h3 className="text-white font-semibold">Google-Authentifizierung aktiv</h3>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">
                      Du meldest dich über Google an. Dein Account ist durch Googles Sicherheitsinfrastruktur geschützt.
                    </p>
                    <div className="text-sm text-slate-400">
                      <p>Für Passwort-Änderungen besuche deine Google-Kontoeinstellungen.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium mb-4">Passwort ändern</h3>

                    {passwordError && (
                      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-400">{passwordError}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Aktuelles Passwort</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Neues Passwort</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-500 mt-1">Mindestens 8 Zeichen</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Passwort bestätigen</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                      className="mt-2 bg-blue-600 hover:bg-blue-500"
                    >
                      {changePasswordMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Passwort ändern"
                      )}
                    </Button>
                  </div>
                )}
              </Section>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
