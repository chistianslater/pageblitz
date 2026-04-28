import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trash2, Edit2, Shield, User, Globe, Calendar, Mail, X, Check, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function UsersPage() {
  const { data, isLoading, refetch } = trpc.userAdmin.list.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const updateMutation = trpc.userAdmin.update.useMutation({
    onSuccess: () => { toast.success("User aktualisiert"); setEditingId(null); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.userAdmin.delete.useMutation({
    onSuccess: () => { toast.success("User gelöscht"); setDeleteConfirm(null); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const startEdit = (user: any) => {
    setEditingId(user.id);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditRole(user.role);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Nutzer-Verwaltung
          </h1>
          <p className="text-muted-foreground mt-1">
            {data?.total ?? 0} registrierte Nutzer
          </p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Alle Nutzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !data?.users?.length ? (
            <p className="text-muted-foreground text-center py-8">Keine Nutzer vorhanden.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.users.map((user: any) => (
                <div key={user.id} className="py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {user.role === "admin"
                      ? <Shield className="w-5 h-5 text-primary" />
                      : <User className="w-5 h-5 text-muted-foreground" />}
                  </div>

                  {/* Info */}
                  {editingId === user.id ? (
                    <div className="flex-1 flex flex-wrap items-center gap-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm w-40"
                      />
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="E-Mail"
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm w-56"
                      />
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as any)}
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => updateMutation.mutate({ id: user.id, name: editName, email: editEmail, role: editRole })}
                        disabled={updateMutation.isPending}
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{user.name || "Kein Name"}</span>
                        {user.role === "admin" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">Admin</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {user.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString("de-DE")}
                        </span>
                        {user.loginMethod && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />{user.loginMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {editingId !== user.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(user)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate({ id: user.id })}
                            disabled={deleteMutation.isPending}
                            className="px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            {deleteMutation.isPending ? "..." : "Löschen"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground"
                          >
                            Abbrechen
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
