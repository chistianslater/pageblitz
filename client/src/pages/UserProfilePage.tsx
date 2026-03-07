import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Lock, Mail, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  
  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEditing, setIsEditing] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Mutations
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil aktualisiert");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Speichern");
    },
  });
  
  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Passwort geändert");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Ändern des Passworts");
    },
  });
  
  const handleSaveProfile = () => {
    updateProfile.mutate({ name, email: email || undefined });
  };
  
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Das neue Passwort muss mindestens 8 Zeichen haben");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };
  
  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  
  if (!user) {
    navigate("/login");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate("/my-website")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Zurück</span>
          </button>
          <div className="flex-1" />
          <h1 className="text-lg font-semibold text-white">Mein Profil</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Profil</CardTitle>
                    <CardDescription className="text-white/50">
                      Deine persönlichen Informationen
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/70">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                    placeholder="Dein Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10 bg-white/5 border-white/10 text-white disabled:opacity-50"
                      placeholder="deine@email.de"
                    />
                  </div>
                </div>
                
                <div className="pt-2 flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={updateProfile.isPending}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500"
                      >
                        {updateProfile.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Speichern
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setName(user.name || "");
                          setEmail(user.email || "");
                          setIsEditing(false);
                        }}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Abbrechen
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Bearbeiten
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Password Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Passwort</CardTitle>
                    <CardDescription className="text-white/50">
                      Ändere dein Passwort
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Passwort ändern
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current" className="text-white/70">Aktuelles Passwort</Label>
                      <Input
                        id="current"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new" className="text-white/70">Neues Passwort</Label>
                      <Input
                        id="new"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <p className="text-xs text-white/40">Mindestens 8 Zeichen</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-white/70">Passwort bestätigen</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={changePassword.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                      >
                        {changePassword.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Passwort ändern
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Account-Informationen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-white/50">Login-Methode</p>
                    <p className="text-white capitalize">{user.loginMethod || "OAuth"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/50">Rolle</p>
                    <p className="text-white capitalize">{user.role}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/50">Registriert am</p>
                    <p className="text-white">{new Date(user.createdAt).toLocaleDateString("de-DE")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/50">Letzter Login</p>
                    <p className="text-white">{new Date(user.lastSignedIn).toLocaleDateString("de-DE")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
