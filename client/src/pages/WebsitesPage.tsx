import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe, Eye, Loader2, Wand2, ExternalLink, Mail, Building2, Star, RefreshCw,
  Sparkles, AlertTriangle, ShoppingCart, CreditCard, Trash2, XCircle, CheckCircle,
  Clock, TrendingDown, UserPlus, Database, Zap, Users
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// ── Status helpers ──────────────────────────────────────
const statusColors: Record<string, string> = {
  preview: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  sold: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-red-500/20 text-red-400 border-red-500/30",
};
const statusLabels: Record<string, string> = {
  preview: "Preview",
  sold: "Verkauft",
  active: "Aktiv",
  inactive: "Inaktiv",
};

const captureColors: Record<string, string> = {
  email_captured: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  onboarding_started: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  onboarding_completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  converted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  abandoned: "bg-red-500/20 text-red-400 border-red-500/30",
};
const captureLabels: Record<string, string> = {
  email_captured: "E-Mail erfasst",
  onboarding_started: "Onboarding gestartet",
  onboarding_completed: "Onboarding abgeschlossen",
  converted: "Konvertiert",
  abandoned: "Abgebrochen",
};

/**
 * Derive the logical funnel status from both website status and captureStatus.
 * An active/trialing/canceling website is always "converted" regardless of
 * what captureStatus says (prevents "Aktiv + Onboarding gestartet" contradiction).
 */
function getEffectiveCaptureStatus(w: any): string {
  if (w.status === "active" || w.status === "canceling" || w.status === "trialing") return "converted";
  if (w.status === "sold") {
    // Paid but onboarding not yet marked complete → at minimum onboarding_completed
    if (w.captureStatus === "onboarding_started" || w.captureStatus === "email_captured") return "onboarding_completed";
  }
  return w.captureStatus || "email_captured";
}

// ── Main Page ───────────────────────────────────────────
export default function WebsitesPage() {
  const utils = trpc.useUtils();
  const { data: businessData } = trpc.business.list.useQuery({ limit: 500, offset: 0 });
  const { data: websiteData, isLoading: webLoading } = trpc.website.list.useQuery({ limit: 500, offset: 0 });

  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [backlogSelectedIds, setBacklogSelectedIds] = useState<Set<number>>(new Set());
  const [backlogBulkDeleteOpen, setBacklogBulkDeleteOpen] = useState(false);

  const backlogBulkDeleteMutation = trpc.business.bulkDelete.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.deleted} Unternehmen erfolgreich gelöscht.`);
      setBacklogSelectedIds(new Set());
      setBacklogBulkDeleteOpen(false);
      utils.business.list.invalidate();
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
    },
    onError: (err: any) => toast.error("Bulk-Delete fehlgeschlagen: " + err.message),
  });

  const generateMutation = trpc.website.generate.useMutation({
    onSuccess: () => {
      toast.success("Website erfolgreich generiert!");
      setGeneratingId(null);
      utils.website.list.invalidate();
      utils.business.list.invalidate();
      utils.stats.dashboard.invalidate();
    },
    onError: (err) => {
      toast.error("Generierung fehlgeschlagen: " + err.message);
      setGeneratingId(null);
    },
  });

  const allWebsites = websiteData?.websites || [];
  const allBusinesses = businessData?.businesses || [];

  // Tab 1: GMB-Backlog – only real GMB businesses (with placeId) without a generated website
  const businessesWithoutWebsite = allBusinesses.filter(b =>
    !allWebsites.some((w: any) => w.businessId === b.id) &&
    b.placeId &&
    !b.placeId.startsWith("self-") &&
    !b.placeId.startsWith("email-")
  );

  // Tab 2: Admin-generated
  const adminWebsites = allWebsites.filter((w: any) => w.source === "admin" || !w.source);

  // Tab 3: Externally generated
  const externalWebsites = allWebsites.filter((w: any) => w.source === "external");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Websites
        </h1>
        <p className="text-muted-foreground mt-1">
          Übersicht über alle Leads, generierten Websites und externe Anfragen.
        </p>
      </div>

      <Tabs defaultValue="backlog" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border h-auto p-1 gap-1">
          <TabsTrigger value="backlog" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Database className="h-4 w-4" />
            GMB-Backlog
            <Badge variant="outline" className="ml-1 text-xs px-1.5 py-0 h-5">
              {businessesWithoutWebsite.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Zap className="h-4 w-4" />
            Admin-generiert
            <Badge variant="outline" className="ml-1 text-xs px-1.5 py-0 h-5">
              {adminWebsites.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Users className="h-4 w-4" />
            Extern-generiert
            <Badge variant="outline" className="ml-1 text-xs px-1.5 py-0 h-5">
              {externalWebsites.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: GMB-Backlog ── */}
        <TabsContent value="backlog">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5 text-primary" />
                    GMB-Backlog – noch nicht generiert ({businessesWithoutWebsite.length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Von Google My Business gescrapte Unternehmen, für die noch keine Website generiert wurde.
                  </p>
                </div>
                {backlogSelectedIds.size > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{backlogSelectedIds.size} ausgewählt</span>
                    <Button variant="outline" size="sm" onClick={() => setBacklogSelectedIds(new Set())}>Auswahl aufheben</Button>
                    <Dialog open={backlogBulkDeleteOpen} onOpenChange={setBacklogBulkDeleteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" /> {backlogSelectedIds.size} löschen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-400" />
                            {backlogSelectedIds.size} Unternehmen löschen
                          </DialogTitle>
                          <DialogDescription>Diese Aktion kann nicht rükgängig gemacht werden.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-red-300">Alle ausgewählten Unternehmen und zugehörige Daten werden dauerhaft gelöscht.</p>
                        </div>
                        <DialogFooter className="gap-2">
                          <Button variant="outline" onClick={() => setBacklogBulkDeleteOpen(false)}>Abbrechen</Button>
                          <Button variant="destructive" onClick={() => backlogBulkDeleteMutation.mutate({ ids: Array.from(backlogSelectedIds) })} disabled={backlogBulkDeleteMutation.isPending}>
                            {backlogBulkDeleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            {backlogSelectedIds.size} endgültig löschen
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {businessesWithoutWebsite.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Alle Unternehmen haben bereits eine Website.</p>
                </div>
              ) : (() => {
                const allBacklogIds = businessesWithoutWebsite.map(b => b.id);
                const allBacklogSelected = allBacklogIds.length > 0 && allBacklogIds.every(id => backlogSelectedIds.has(id));
                return (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-10">
                            <Checkbox
                              checked={allBacklogSelected}
                              onCheckedChange={() => setBacklogSelectedIds(allBacklogSelected ? new Set() : new Set(allBacklogIds))}
                              aria-label="Alle auswählen"
                              className="border-muted-foreground/50"
                            />
                          </TableHead>
                          <TableHead>Unternehmen</TableHead>
                          <TableHead>Branche</TableHead>
                          <TableHead>Bewertung</TableHead>
                          <TableHead>Lead-Typ</TableHead>
                          <TableHead className="text-right">Aktion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {businessesWithoutWebsite.map((b) => (
                          <TableRow key={b.id} className={backlogSelectedIds.has(b.id) ? "bg-primary/5" : undefined}>
                            <TableCell>
                              <Checkbox
                                checked={backlogSelectedIds.has(b.id)}
                                onCheckedChange={() => {
                                  setBacklogSelectedIds(prev => {
                                    const next = new Set(prev);
                                    next.has(b.id) ? next.delete(b.id) : next.add(b.id);
                                    return next;
                                  });
                                }}
                                className="border-muted-foreground/50"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{b.name}</div>
                              <div className="text-xs text-muted-foreground">{b.address}</div>
                            </TableCell>
                            <TableCell className="text-sm">{b.category || "–"}</TableCell>
                            <TableCell>
                              {b.rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                  <span className="text-sm">{String(b.rating)}</span>
                                </div>
                              ) : "–"}
                            </TableCell>
                            <TableCell>
                              <BusinessLeadTypeBadge hasWebsite={!!b.hasWebsite} leadType={b.leadType} website={b.website} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setGeneratingId(b.id);
                                    generateMutation.mutate({ businessId: b.id });
                                  }}
                                  disabled={generatingId !== null}
                                >
                                  {generatingId === b.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Wand2 className="h-4 w-4 mr-2" />
                                  )}
                                  Generieren
                                </Button>
                                <DeleteBusinessDialog business={b} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Admin-generiert ── */}
        <TabsContent value="admin">
          <AdminWebsitesTab websites={adminWebsites} isLoading={webLoading} />
        </TabsContent>

        {/* ── Tab 3: Extern-generiert ── */}
        <TabsContent value="external">
          <ExternalWebsitesTab websites={externalWebsites} isLoading={webLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Tab 2: Admin-generierte Websites ───────────────────
function AdminWebsitesTab({ websites, isLoading }: { websites: any[]; isLoading: boolean }) {
  const utils = trpc.useUtils();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const bulkDeleteMutation = trpc.website.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deleted} Website(s) erfolgreich gelöscht.`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
    },
    onError: (err) => toast.error("Bulk-Delete fehlgeschlagen: " + err.message),
  });

  const allIds = websites.map((w) => w.id);
  const allSelected = allIds.length > 0 && allIds.every((id: number) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  }
  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-primary" />
              Admin-generierte Websites ({websites.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Websites, die du oder das System über die Admin-Oberfläche generiert hat.
            </p>
          </div>
          {someSelected && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{selectedIds.size} ausgewählt</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                Auswahl aufheben
              </Button>
              <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" /> {selectedIds.size} löschen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-red-400" />
                      {selectedIds.size} Websites löschen
                    </DialogTitle>
                    <DialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-300">Alle ausgewählten Websites, Onboarding-Daten und Abonnements werden dauerhaft gelöscht.</p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Abbrechen</Button>
                    <Button variant="destructive" onClick={() => bulkDeleteMutation.mutate({ ids: Array.from(selectedIds) })} disabled={bulkDeleteMutation.isPending}>
                      {bulkDeleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      {selectedIds.size} endgültig löschen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : websites.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Noch keine Admin-generierten Websites.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Alle auswählen" className="border-muted-foreground/50" />
                  </TableHead>
                  <TableHead>Unternehmen</TableHead>
                  <TableHead>Branche</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {websites.map((w: any) => (
                  <TableRow key={w.id} className={selectedIds.has(w.id) ? "bg-primary/5" : undefined}>
                    <TableCell>
                      <Checkbox checked={selectedIds.has(w.id)} onCheckedChange={() => toggleSelect(w.id)} className="border-muted-foreground/50" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{w.business?.name || "Unbekannt"}</div>
                      <div className="text-xs text-muted-foreground">{w.slug}</div>
                    </TableCell>
                    <TableCell className="text-sm">{w.industry || "–"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[w.status] || ""}>
                        {statusLabels[w.status] || w.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(w.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/preview/${w.previewToken}`} target="_blank" rel="noopener">
                            <Eye className="h-3 w-3 mr-1" /> Preview
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/site/${w.slug}`} target="_blank" rel="noopener">
                            <ExternalLink className="h-3 w-3 mr-1" /> Live
                          </a>
                        </Button>
                        <CheckoutDialog website={w} />
                        <ActivateWebsiteButton website={w} />
                        <TestSubscriptionButton website={w} />
                        <UnlockAllAddonsButton website={w} />
                        <RegenerateDialog website={w} />
                        <OutreachDialog website={w} />
                        <DeleteWebsiteDialog website={w} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Tab 3: Extern-generierte Websites ──────────────────
function ExternalWebsitesTab({ websites, isLoading }: { websites: any[]; isLoading: boolean }) {
  const utils = trpc.useUtils();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const bulkDeleteMutation = trpc.website.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deleted} Website(s) erfolgreich gelöscht.`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      utils.website.list.invalidate();
    },
    onError: (err) => toast.error("Bulk-Delete fehlgeschlagen: " + err.message),
  });

  const updateStatusMutation = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert");
      utils.website.list.invalidate();
      utils.leads.funnel.invalidate();
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const filtered = statusFilter === "all" ? websites : websites.filter((w: any) => w.captureStatus === statusFilter);
  const allIds = filtered.map((w: any) => w.id);
  const allSelected = allIds.length > 0 && allIds.every((id: number) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  }
  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const captureStatusOptions = [
    { value: "all", label: "Alle Status" },
    { value: "email_captured", label: "E-Mail erfasst" },
    { value: "onboarding_started", label: "Onboarding gestartet" },
    { value: "onboarding_completed", label: "Onboarding abgeschlossen" },
    { value: "converted", label: "Konvertiert" },
    { value: "abandoned", label: "Abgebrochen" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Extern-generierte Websites ({websites.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Websites, die externe Besucher über die Landing Page selbst gestartet haben.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setSelectedIds(new Set()); }}>
              <SelectTrigger className="w-52 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {captureStatusOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {someSelected && (
              <>
                <span className="text-sm text-muted-foreground">{selectedIds.size} ausgewählt</span>
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>Auswahl aufheben</Button>
                <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" /> {selectedIds.size} löschen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-400" />
                        {selectedIds.size} Websites löschen
                      </DialogTitle>
                      <DialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-300">Alle ausgewählten Websites werden dauerhaft gelöscht.</p>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Abbrechen</Button>
                      <Button variant="destructive" onClick={() => bulkDeleteMutation.mutate({ ids: Array.from(selectedIds) })} disabled={bulkDeleteMutation.isPending}>
                        {bulkDeleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        {selectedIds.size} endgültig löschen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Keine externen Websites{statusFilter !== "all" ? " mit diesem Status" : ""}.</p>
            <p className="text-sm mt-1">Externe Websites entstehen, wenn Besucher die Landing Page nutzen.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Alle auswählen" className="border-muted-foreground/50" />
                  </TableHead>
                  <TableHead>E-Mail / Slug</TableHead>
                  <TableHead>Branche</TableHead>
                  <TableHead>Funnel-Status</TableHead>
                  <TableHead>Website-Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((w: any) => (
                  <TableRow key={w.id} className={selectedIds.has(w.id) ? "bg-primary/5" : undefined}>
                    <TableCell>
                      <Checkbox checked={selectedIds.has(w.id)} onCheckedChange={() => toggleSelect(w.id)} className="border-muted-foreground/50" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {w.customerEmail ? (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {w.customerEmail}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Keine E-Mail</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{w.slug}</div>
                    </TableCell>
                    <TableCell className="text-sm">{w.industry || "–"}</TableCell>
                    <TableCell>
                      {(() => { const eff = getEffectiveCaptureStatus(w); return (
                        <Badge variant="outline" className={captureColors[eff] || ""}>
                          {captureLabels[eff] || eff}
                        </Badge>
                      ); })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[w.status] || ""}>
                        {statusLabels[w.status] || w.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(w.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {w.previewToken && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/preview/${w.previewToken}`} target="_blank" rel="noopener">
                              <Eye className="h-3 w-3 mr-1" /> Preview
                            </a>
                          </Button>
                        )}
                        <ExternalLeadStatusDialog website={w} onUpdate={(id, status) => updateStatusMutation.mutate({ id, captureStatus: status as any })} isPending={updateStatusMutation.isPending} />
                        <DeleteWebsiteDialog website={w} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── External Lead Status Dialog ─────────────────────────
function ExternalLeadStatusDialog({ website, onUpdate, isPending }: { website: any; onUpdate: (id: number, status: string) => void; isPending: boolean }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(website.captureStatus || "email_captured");
  const options = [
    { value: "email_captured", label: "E-Mail erfasst" },
    { value: "onboarding_started", label: "Onboarding gestartet" },
    { value: "onboarding_completed", label: "Onboarding abgeschlossen" },
    { value: "converted", label: "Konvertiert" },
    { value: "abandoned", label: "Abgebrochen" },
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Status</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Funnel-Status ändern</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {website.customerEmail || website.slug}
          </DialogDescription>
        </DialogHeader>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={() => { onUpdate(website.id, status); setOpen(false); }} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Reusable Sub-Components ─────────────────────────────
function RegenerateDialog({ website }: { website: any }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [generateAiImage, setGenerateAiImage] = useState(false);

  const regenerateMutation = trpc.website.regenerate.useMutation({
    onSuccess: (data) => {
      toast.success("Website erfolgreich neu generiert!", {
        action: { label: "Preview öffnen", onClick: () => window.open(`/preview/${data.previewToken}`, "_blank") },
        duration: 6000,
      });
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
      setOpen(false);
    },
    onError: (err) => toast.error("Regenerierung fehlgeschlagen: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
          <RefreshCw className="h-3 w-3 mr-1" /> Neu generieren
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-400" /> Website neu generieren
          </DialogTitle>
          <DialogDescription>
            Die KI erstellt komplett neue Texte und ein neues Layout für{" "}
            <span className="font-medium text-foreground">{website.business?.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">Der bisherige Preview-Link wird ungültig.</p>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <div>
                <Label htmlFor="ai-image-regen" className="text-sm font-medium cursor-pointer">KI-Bild generieren</Label>
                <p className="text-xs text-muted-foreground">Erstellt ein einzigartiges Hero-Bild via KI</p>
              </div>
            </div>
            <Switch id="ai-image-regen" checked={generateAiImage} onCheckedChange={setGenerateAiImage} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={regenerateMutation.isPending}>Abbrechen</Button>
          <Button onClick={() => regenerateMutation.mutate({ websiteId: website.id, generateAiImage })} disabled={regenerateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {regenerateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />KI generiert…</> : <><RefreshCw className="h-4 w-4 mr-2" />Jetzt neu generieren</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckoutDialog({ website }: { website: any }) {
  const [open, setOpen] = useState(false);
  const [subpages, setSubpages] = useState(0);
  const [gallery, setGallery] = useState(false);
  const [contactForm, setContactForm] = useState(false);

  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => { setOpen(false); toast.info("Weiterleitung zu Stripe..."); window.open(data.url, "_blank"); },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const totalMonthly = 79 + subpages * 9.9 + (gallery ? 4.9 : 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300" disabled={website.status === "active"}>
          <CreditCard className="h-3 w-3 mr-1" />
          {website.status === "active" ? "Aktiv" : "Kaufen"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-emerald-400" /> Website kaufen</DialogTitle>
          <DialogDescription>Wähle dein Paket für <span className="font-medium text-foreground">{website.business?.name}</span></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex justify-between items-center">
              <div><p className="font-semibold">Basis-Paket</p><p className="text-sm text-muted-foreground">1-seitige Website, Impressum & Datenschutz</p></div>
              <span className="text-xl font-bold text-emerald-400">79€/Mo</span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Add-ons</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div><Label className="font-medium cursor-pointer">Unterseiten</Label><p className="text-xs text-muted-foreground">+9,90€/Monat pro Seite</p></div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSubpages(Math.max(0, subpages - 1))}>-</Button>
                <span className="w-6 text-center font-medium">{subpages}</span>
                <Button variant="outline" size="sm" onClick={() => setSubpages(subpages + 1)}>+</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div><Label htmlFor="gallery-toggle" className="font-medium cursor-pointer">Bildergalerie</Label><p className="text-xs text-muted-foreground">+4,90€/Monat</p></div>
              <Switch id="gallery-toggle" checked={gallery} onCheckedChange={setGallery} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div><Label htmlFor="form-toggle" className="font-medium cursor-pointer">Kontaktformular</Label><p className="text-xs text-muted-foreground">Inklusive</p></div>
              <Switch id="form-toggle" checked={contactForm} onCheckedChange={setContactForm} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-border flex justify-between items-center">
            <span className="font-semibold">Gesamt</span>
            <span className="text-2xl font-bold">{totalMonthly.toFixed(2).replace(".", ",")}€/Mo</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => checkoutMutation.mutate({ websiteId: website.id, addOns: { subpages, gallery, contactForm } })} disabled={checkoutMutation.isPending}>
            {checkoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
            Jetzt kaufen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OutreachDialog({ website }: { website: any }) {
  const [email, setEmail] = useState(website.business?.email || "");
  const [subject, setSubject] = useState(`Ihre neue Website ist fertig – ${website.business?.name}`);
  const [body, setBody] = useState(
    `Sehr geehrte Damen und Herren,\n\nwir haben eine professionelle Website für ${website.business?.name || "Ihr Unternehmen"} erstellt.\n\nSchauen Sie sich die Vorschau hier an:\n${window.location.origin}/preview/${website.previewToken}\n\nBei Interesse können Sie die Website direkt aktivieren.\n\nMit freundlichen Grüßen\nIhr Pageblitz Team`
  );
  const sendMutation = trpc.outreach.send.useMutation({
    onSuccess: () => toast.success("E-Mail erfolgreich gesendet!"),
    onError: (err) => toast.error("Fehler: " + err.message),
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Mail className="h-3 w-3 mr-1" /> E-Mail</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Outreach E-Mail senden</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div><label className="text-sm text-muted-foreground mb-1.5 block">Empfänger E-Mail</label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
          <div><label className="text-sm text-muted-foreground mb-1.5 block">Betreff</label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div><label className="text-sm text-muted-foreground mb-1.5 block">Nachricht</label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} /></div>
          <Button className="w-full" onClick={() => { if (!email) { toast.error("E-Mail-Adresse erforderlich"); return; } sendMutation.mutate({ businessId: website.businessId, websiteId: website.id, recipientEmail: email, subject, body }); }} disabled={sendMutation.isPending}>
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            E-Mail senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteWebsiteDialog({ website }: { website: any }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const deleteMutation = trpc.website.delete.useMutation({
    onMutate: async () => {
      await utils.website.list.cancel();
      const previous = utils.website.list.getData({ limit: 500, offset: 0 });
      utils.website.list.setData({ limit: 500, offset: 0 }, (old: any) => {
        if (!old) return old;
        return { ...old, websites: old.websites.filter((w: any) => w.id !== website.id), total: (old.total ?? 1) - 1 };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success(`Website "${website.business?.name || website.slug}" wurde gelöscht.`);
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
      setOpen(false);
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) utils.website.list.setData({ limit: 500, offset: 0 }, ctx.previous);
      toast.error("Löschen fehlgeschlagen: " + err.message);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-red-400" /> Website löschen</DialogTitle>
          <DialogDescription>
            Möchtest du die Website für{" "}
            <span className="font-medium text-foreground">{website.business?.name || website.slug}</span>{" "}
            wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">Die Website, alle Onboarding-Daten und Abonnement-Informationen werden dauerhaft gelöscht.</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: website.id })} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Endgültig löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestSubscriptionButton({ website }: { website: any }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const createTestSub = trpc.customer.createTestSubscription.useMutation({
    onSuccess: () => { utils.website.list.invalidate(); toast.success("Test-Abo erstellt!"); },
    onError: (err) => toast.error(err.message),
  });
  if (!user) return null;
  return (
    <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
      onClick={() => createTestSub.mutate({ websiteId: website.id, userId: user.id })}
      disabled={createTestSub.isPending} title="Verknüpft diese Website mit deinem Account (für Test-Zwecke)">
      {createTestSub.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1" />}
      Test-Abo
    </Button>
  );
}

function UnlockAllAddonsButton({ website }: { website: any }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const unlockMutation = trpc.customer.unlockAllAddons.useMutation({
    onSuccess: () => { utils.website.list.invalidate(); toast.success("Alle Add-ons freigeschaltet! 🎉"); },
    onError: (err) => toast.error(err.message),
  });
  if (!user) return null;
  return (
    <Button variant="outline" size="sm" className="text-purple-400 border-purple-400/30 hover:bg-purple-400/10"
      onClick={() => unlockMutation.mutate({ websiteId: website.id, userId: user.id })}
      disabled={unlockMutation.isPending} title="Schaltet alle Add-ons für Testzwecke frei (ohne Stripe)">
      {unlockMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
      Alle Add-ons
    </Button>
  );
}

function ActivateWebsiteButton({ website }: { website: any }) {
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.website.updateStatus.useMutation({
    onSuccess: () => { utils.website.list.invalidate(); toast.success("Website-Status aktualisiert"); },
    onError: (err) => toast.error(err.message),
  });
  if (website.status === "active") {
    return (
      <Button variant="outline" size="sm" className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
        onClick={() => updateStatusMutation.mutate({ id: website.id, status: "preview" })} disabled={updateStatusMutation.isPending}>
        {updateStatusMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
        Deaktivieren
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
      onClick={() => updateStatusMutation.mutate({ id: website.id, status: "active" })} disabled={updateStatusMutation.isPending}>
      {updateStatusMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
      Aktivieren
    </Button>
  );
}

function DeleteBusinessDialog({ business }: { business: any }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const deleteMutation = trpc.business.delete.useMutation({
    onMutate: async () => {
      await utils.business.list.cancel();
      const previous = utils.business.list.getData({ limit: 500, offset: 0 });
      utils.business.list.setData({ limit: 500, offset: 0 }, (old: any) => {
        if (!old) return old;
        return { ...old, businesses: old.businesses.filter((b: any) => b.id !== business.id), total: (old.total ?? 1) - 1 };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success(`Unternehmen "${business.name}" wurde gelöscht.`);
      utils.business.list.invalidate();
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
      setOpen(false);
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) utils.business.list.setData({ limit: 500, offset: 0 }, ctx.previous);
      toast.error("Löschen fehlgeschlagen: " + err.message);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-red-400" /> Unternehmen löschen</DialogTitle>
          <DialogDescription>
            Möchtest du <span className="font-medium text-foreground">{business.name}</span> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">Das Unternehmen und alle zugehörigen Websites, Onboarding-Daten und Abonnements werden dauerhaft gelöscht.</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: business.id })} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Endgültig löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type LeadType = "no_website" | "outdated_website" | "poor_website" | "unknown";

function BusinessLeadTypeBadge({ hasWebsite, leadType, website }: { hasWebsite: boolean; leadType?: string | null; website?: string | null }) {
  const lt = leadType as LeadType | undefined;
  const link = website ? (
    <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
      className="text-xs text-blue-400 hover:underline truncate max-w-[160px] block mt-0.5">
      {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  ) : null;

  if (!hasWebsite || lt === "no_website") return <Badge variant="outline" className="text-red-400 border-red-400/30 gap-1"><XCircle className="h-3 w-3" /> Keine Website</Badge>;
  if (lt === "outdated_website") return <div><Badge variant="outline" className="text-amber-400 border-amber-400/30 gap-1"><Clock className="h-3 w-3" /> Veraltete Website</Badge>{link}</div>;
  if (lt === "poor_website") return <div><Badge variant="outline" className="text-orange-400 border-orange-400/30 gap-1"><TrendingDown className="h-3 w-3" /> Schlechte Website</Badge>{link}</div>;
  return <div><Badge variant="outline" className="text-emerald-400 border-emerald-400/30 gap-1"><CheckCircle className="h-3 w-3" /> Hat Website</Badge>{link}</div>;
}
