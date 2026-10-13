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
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useReducedMotion } from "framer-motion";
import "./dashboard/customer.css";
import { SubscriptionSummary } from "./dashboard/SubscriptionSummary";
import { formatDateDe } from "@shared/pricingTerm";

// ── Components ───────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-lp-surface border border-lp-line rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-lp-line bg-lp-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lp-accent/10 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-lp-ink">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: {
      label: "Aktiv",
      cls: "bg-lp-accent/10 text-lp-accent border-lp-accent/30",
    },
    trialing: {
      label: "Testphase",
      cls: "bg-lp-accent/10 text-lp-accent border-lp-accent/40",
    },
    canceling: {
      label: "Gekündigt",
      cls: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    canceled: {
      label: "Abgelaufen",
      cls: "bg-lp-canvas text-lp-muted border-lp-line",
    },
    past_due: {
      label: "Zahlung ausstehend",
      cls: "bg-red-500/20 text-red-300 border-red-500/40",
    },
    incomplete: {
      label: "Unvollständig",
      cls: "bg-lp-canvas text-lp-muted border-lp-line",
    },
  };
  const { label, cls } = map[status] || {
    label: status,
    cls: "bg-lp-canvas text-lp-muted border-lp-line",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────

export default function AccountPage() {
  const reduceMotion = useReducedMotion();
  const { user, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<
    "profile" | "subscription" | "security"
  >("profile");

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
    onError: error => {
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
    onError: error => {
      setPasswordError(error.message || "Fehler beim Ändern des Passworts");
    },
  });

  const billingPortalMutation =
    trpc.customer.createBillingPortalSession.useMutation({
      onSuccess: data => {
        window.location.href = data.url;
      },
      onError: error => {
        toast.error(error.message || "Fehler beim Öffnen des Kundenportals");
      },
    });

  const utils = trpc.useUtils();
  const refreshSubscription = () => utils.customer.getMyWebsites.invalidate();
  const cancelMutation = trpc.customer.cancelSubscription.useMutation({
    onSuccess: data => {
      toast.success(
        `Gekündigt zum ${formatDateDe(data.endsAt)}. Bis dahin bleibt deine Website online.`
      );
      void refreshSubscription();
    },
    onError: error => toast.error(error.message || "Kündigung fehlgeschlagen"),
  });
  const withdrawMutation = trpc.customer.withdrawCancellation.useMutation({
    onSuccess: () => {
      toast.success("Kündigung zurückgenommen — dein Abo läuft weiter.");
      void refreshSubscription();
    },
    onError: error => toast.error(error.message || "Das hat nicht geklappt"),
  });
  const switchMutation = trpc.customer.switchToYearly.useMutation({
    onSuccess: () => {
      toast.success("Jahrestarif gilt ab der nächsten Abbuchung.");
      void refreshSubscription();
    },
    onError: error => toast.error(error.message || "Wechsel fehlgeschlagen"),
  });

  // Fetch user's websites and subscriptions
  const { data: myWebsites, isLoading: websitesLoading } =
    trpc.customer.getMyWebsites.useQuery(undefined, { enabled: !!user });

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
      <div className="min-h-screen bg-lp-canvas pb-dash lp flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lp-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-lp-canvas pb-dash lp flex items-center justify-center">
        <div className="text-center text-lp-ink">
          <p className="mb-4">
            Bitte melde dich an, um deinen Account zu verwalten.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-lp-accent hover:bg-lp-accent/90"
          >
            Zum Login
          </Button>
        </div>
      </div>
    );
  }

  // Get subscription info from first website (if any)
  const subscription = myWebsites?.[0]?.subscription;
  const website = myWebsites?.[0]?.website;
  const hasActiveSubscription =
    subscription?.status === "active" ||
    subscription?.status === "trialing" ||
    subscription?.status === "canceling";
  const isCanceling = subscription?.status === "canceling";

  const nowSec = Math.floor(Date.now() / 1000);
  const subscriptionPending = cancelMutation.isPending
    ? "cancel"
    : withdrawMutation.isPending
      ? "withdraw"
      : switchMutation.isPending
        ? "switch"
        : billingPortalMutation.isPending
          ? "portal"
          : null;

  return (
    <div className="min-h-screen bg-lp-canvas text-lp-ink pb-dash lp">
      {/* Header */}
      <header className="border-b border-lp-line bg-lp-surface/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/my-website")}
            className="flex items-center gap-2 text-lp-muted hover:text-lp-ink transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Zurück zum Dashboard</span>
          </button>
          <div className="flex-1" />
          <h1 className="text-lp-ink font-bold text-lg">Mein Konto</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6"
        >
          {/* Sidebar */}
          <div className="space-y-4">
            {/* User Card */}
            <div className="bg-lp-surface border border-lp-line rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-gradient-to-br from-lp-accent to-lp-ink flex items-center justify-center text-lp-canvas text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lp-ink font-semibold truncate">
                    {user.name || "Unbenannt"}
                  </h2>
                  <p className="text-lp-muted text-sm truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-lp-muted">
                <Shield className="w-3.5 h-3.5" />
                <span className="capitalize">
                  {isGoogleUser ? "Google" : "E-Mail"} Login
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-lp-surface border border-lp-line rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate("/my-website")}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-lp-ink/80 hover:bg-lp-canvas/50 transition-colors"
              >
                <Monitor className="w-5 h-5" />
                <span className="font-medium">Meine Website</span>
              </button>
              <div className="border-t border-lp-line" />
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "profile"
                    ? "bg-lp-accent/10 text-lp-accent"
                    : "text-lp-ink/80 hover:bg-lp-canvas/50"
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profil</span>
              </button>
              <button
                onClick={() => setActiveTab("subscription")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "subscription"
                    ? "bg-lp-accent/10 text-lp-accent"
                    : "text-lp-ink/80 hover:bg-lp-canvas/50"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Abonnement</span>
                {hasActiveSubscription && (
                  <span
                    className={`ml-auto w-2 h-2 rounded-full ${isCanceling ? "bg-amber-400" : "bg-emerald-500"}`}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "security"
                    ? "bg-lp-accent/10 text-lp-accent"
                    : "text-lp-ink/80 hover:bg-lp-canvas/50"
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Sicherheit</span>
              </button>
              <div className="border-t border-lp-line" />
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
                <Section
                  title="Persönliche Daten"
                  icon={<User className="w-5 h-5 text-lp-accent" />}
                >
                  {editingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-lp-muted mb-2">
                          Name
                        </label>
                        <Input
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="bg-lp-canvas/50 border-lp-line text-lp-ink"
                          placeholder="Dein Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-lp-muted mb-2">
                          E-Mail
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="bg-lp-canvas/50 border-lp-line text-lp-ink"
                          placeholder="deine@email.de"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => setEditingProfile(false)}
                          variant="outline"
                          className="border-lp-line text-lp-ink/80 hover:bg-lp-canvas"
                        >
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="bg-lp-accent hover:bg-lp-accent/90"
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
                      <div className="flex items-center justify-between py-3 border-b border-lp-line">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-lp-muted" />
                          <span className="text-lp-muted text-sm">Name</span>
                        </div>
                        <span className="text-lp-ink">
                          {user.name || "Nicht angegeben"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-lp-line">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-lp-muted" />
                          <span className="text-lp-muted text-sm">E-Mail</span>
                        </div>
                        <span className="text-lp-ink">
                          {user.email || "Nicht angegeben"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-lp-muted" />
                          <span className="text-lp-muted text-sm">
                            Mitglied seit
                          </span>
                        </div>
                        <span className="text-lp-ink">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "de-DE"
                              )
                            : "Unbekannt"}
                        </span>
                      </div>
                      <Button
                        onClick={() => setEditingProfile(true)}
                        variant="outline"
                        className="mt-4 border-lp-line text-lp-ink/80 hover:bg-lp-canvas"
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  )}
                </Section>

                {/* Account Info */}
                <Section
                  title="Account-Informationen"
                  icon={<Package className="w-5 h-5 text-lp-accent" />}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-lp-muted text-sm">
                        Anmeldemethode
                      </span>
                      <span className="text-lp-ink capitalize">
                        {isGoogleUser ? "Google" : "E-Mail"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-lp-muted text-sm">Rolle</span>
                      <span className="text-lp-ink capitalize">
                        {user.role === "admin" ? "Administrator" : "Kunde"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-lp-muted text-sm">Websites</span>
                      <span className="text-lp-ink">
                        {myWebsites?.length || 0}
                      </span>
                    </div>
                  </div>
                </Section>
              </>
            )}

            {activeTab === "subscription" && (
              <>
                {/* Current Subscription */}
                <Section
                  title="Aktuelles Abonnement"
                  icon={<CreditCard className="w-5 h-5 text-lp-accent" />}
                >
                  {websitesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-lp-accent" />
                    </div>
                  ) : !myWebsites || myWebsites.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-lp-muted mb-4">
                        Du hast noch keine aktive Website.
                      </p>
                      <Button
                        onClick={() => navigate("/start")}
                        className="bg-lp-accent hover:bg-lp-accent/90"
                      >
                        Website gratis erstellen
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {subscription && (
                        <div className="flex justify-end">
                          <StatusBadge status={subscription.status} />
                        </div>
                      )}
                      {subscription ? (
                        <SubscriptionSummary
                          subscription={subscription}
                          websiteSlug={hasActiveSubscription ? website?.slug : null}
                          nowSec={nowSec}
                          pending={subscriptionPending}
                          onCancel={() =>
                            cancelMutation.mutate({ websiteId: website!.id })
                          }
                          onWithdraw={() =>
                            withdrawMutation.mutate({ websiteId: website!.id })
                          }
                          onSwitchToYearly={() =>
                            switchMutation.mutate({ websiteId: website!.id })
                          }
                          onOpenPortal={() =>
                            billingPortalMutation.mutate({
                              websiteId: website!.id,
                            })
                          }
                        />
                      ) : (
                        <p className="text-lp-muted text-sm">
                          Für diese Website ist noch kein Abo abgeschlossen.
                        </p>
                      )}

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => navigate(`/site/${website?.slug}`)}
                          variant="outline"
                          className="border-lp-line text-lp-ink/80 hover:bg-lp-canvas"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Website öffnen
                        </Button>
                        <Button
                          onClick={() => navigate("/my-website")}
                          variant="outline"
                          className="border-lp-line text-lp-ink/80 hover:bg-lp-canvas"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                  )}
                </Section>
              </>
            )}

            {activeTab === "security" && (
              <Section
                title="Sicherheit"
                icon={<Shield className="w-5 h-5 text-lp-accent" />}
              >
                {isGoogleUser ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-lp-accent" />
                      <h3 className="text-lp-ink font-semibold">
                        Google-Authentifizierung aktiv
                      </h3>
                    </div>
                    <p className="text-lp-ink/80 text-sm mb-4">
                      Du meldest dich über Google an. Dein Account ist durch
                      Googles Sicherheitsinfrastruktur geschützt.
                    </p>
                    <div className="text-sm text-lp-muted">
                      <p>
                        Für Passwort-Änderungen besuche deine
                        Google-Kontoeinstellungen.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lp-ink font-medium mb-4">
                      Passwort ändern
                    </h3>

                    {passwordError && (
                      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-400">{passwordError}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-lp-muted mb-2">
                        Aktuelles Passwort
                      </label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="bg-lp-canvas/50 border-lp-line text-lp-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-lp-muted mb-2">
                        Neues Passwort
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="bg-lp-canvas/50 border-lp-line text-lp-ink"
                      />
                      <p className="text-xs text-lp-muted mt-1">
                        Mindestens 8 Zeichen
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-lp-muted mb-2">
                        Passwort bestätigen
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="bg-lp-canvas/50 border-lp-line text-lp-ink"
                      />
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        changePasswordMutation.isPending ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="mt-2 bg-lp-accent hover:bg-lp-accent/90"
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
