import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Save,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface EditableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
}

function EditableSection({
  title,
  icon,
  children,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  saving,
}: EditableSectionProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Bearbeiten
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Abbrechen
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Speichern
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password editing state
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Mutations
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil aktualisiert");
      setEditingProfile(false);
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren");
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Passwort geändert");
      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    },
    onError: (error) => {
      setPasswordError(error.message || "Fehler beim Ändern des Passworts");
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ name, email });
  };

  const handleSavePassword = () => {
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
    navigate("/login");
  };

  // Check if user logged in with Google (no password)
  const isGoogleUser = user?.loginMethod === "google";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/my-website")}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Profil & Einstellungen
            </h1>
            <p className="text-white/50">
              Verwalte deine persönlichen Daten und Sicherheitseinstellungen
            </p>
          </div>

          {/* Profile Section */}
          <EditableSection
            title="Persönliche Daten"
            icon={<User className="w-5 h-5 text-indigo-400" />}
            isEditing={editingProfile}
            onEdit={() => {
              setName(user?.name || "");
              setEmail(user?.email || "");
              setEditingProfile(true);
            }}
            onCancel={() => setEditingProfile(false)}
            onSave={handleSaveProfile}
            saving={updateProfileMutation.isPending}
          >
            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Dein Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    E-Mail
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="deine@email.de"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-white/40" />
                  <span className="text-white">{user?.name || "Nicht angegeben"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/40" />
                  <span className="text-white">{user?.email || "Nicht angegeben"}</span>
                </div>
              </div>
            )}
          </EditableSection>

          {/* Password Section */}
          {isGoogleUser ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Sicherheit</h3>
                  <p className="text-sm text-white/50">
                    Du meldest dich über Google an
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-lg px-4 py-3">
                <Check className="w-4 h-4" />
                <span className="text-sm">
                  Dein Account ist durch Google gesichert
                </span>
              </div>
            </div>
          ) : (
            <EditableSection
              title="Passwort ändern"
              icon={<Lock className="w-5 h-5 text-indigo-400" />}
              isEditing={editingPassword}
              onEdit={() => setEditingPassword(true)}
              onCancel={() => {
                setEditingPassword(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError(null);
              }}
              onSave={handleSavePassword}
              saving={changePasswordMutation.isPending}
            >
              {editingPassword ? (
                <div className="space-y-4">
                  {passwordError && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-400">{passwordError}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Aktuelles Passwort
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Neues Passwort
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      Mindestens 8 Zeichen
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Passwort bestätigen
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-white/60">
                  Ändere dein Passwort, um deinen Account sicher zu halten.
                </p>
              )}
            </EditableSection>
          )}

          {/* Account Info */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Account-Informationen
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/50">Anmeldemethode</span>
                <span className="text-white capitalize">
                  {user?.loginMethod === "google" ? "Google" : user?.loginMethod || "E-Mail"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/50">Rolle</span>
                <span className="text-white capitalize">
                  {user?.role === "admin" ? "Administrator" : "Kunde"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-white/50">Mitglied seit</span>
                <span className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("de-DE") : "Unbekannt"}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
