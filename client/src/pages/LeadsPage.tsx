import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Mail, Loader2, ArrowRight, CheckCircle, ShoppingCart, AlertTriangle, Users,
  TrendingUp, Eye, ExternalLink, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// ── Funnel Step Config ──────────────────────────────────
const FUNNEL_STEPS = [
  {
    key: "email_captured",
    label: "E-Mail erfasst",
    description: "Besucher hat E-Mail eingegeben",
    icon: Mail,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    key: "onboarding_started",
    label: "Onboarding gestartet",
    description: "Besucher hat Onboarding begonnen",
    icon: ChevronRight,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    key: "onboarding_completed",
    label: "Onboarding abgeschlossen",
    description: "Website wurde vollständig konfiguriert",
    icon: CheckCircle,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    key: "converted",
    label: "Konvertiert",
    description: "Besucher hat Website gekauft",
    icon: ShoppingCart,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    key: "abandoned",
    label: "Abgebrochen",
    description: "Besucher hat nicht weitergemacht",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
  },
] as const;

type CaptureStatus = typeof FUNNEL_STEPS[number]["key"];

function getStepConfig(key: string) {
  return FUNNEL_STEPS.find(s => s.key === key) ?? FUNNEL_STEPS[0];
}

export default function LeadsPage() {
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updateDialogLead, setUpdateDialogLead] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<CaptureStatus>("email_captured");

  const { data: funnelData, isLoading: funnelLoading } = trpc.leads.funnel.useQuery();
  const { data: leadsData, isLoading: leadsLoading } = trpc.leads.list.useQuery({
    limit: 100,
    offset: 0,
    captureStatus: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateStatusMutation = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert");
      setUpdateDialogLead(null);
      utils.leads.list.invalidate();
      utils.leads.funnel.invalidate();
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const total = funnelData?.total ?? 0;
  const converted = funnelData?.converted ?? 0;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Lead-Funnel
        </h1>
        <p className="text-muted-foreground mt-1">
          Externe Leads aus der Landing Page – von E-Mail-Erfassung bis zur Conversion.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{funnelLoading ? "…" : total}</p>
                <p className="text-xs text-muted-foreground">Gesamt-Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{funnelLoading ? "…" : converted}</p>
                <p className="text-xs text-muted-foreground">Konvertiert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{funnelLoading ? "…" : `${conversionRate}%`}</p>
                <p className="text-xs text-muted-foreground">Conversion-Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Funnel-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funnelLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
              {FUNNEL_STEPS.filter(s => s.key !== "abandoned").map((step, idx, arr) => {
                const count = (funnelData as any)?.[step.key] ?? 0;
                const prevCount = idx > 0 ? ((funnelData as any)?.[arr[idx - 1].key] ?? 0) : total;
                const dropRate = prevCount > 0 ? (((prevCount - count) / prevCount) * 100).toFixed(0) : "0";
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-center gap-2 flex-1 min-w-[140px]">
                    <button
                      onClick={() => setStatusFilter(step.key)}
                      className={`flex-1 p-4 rounded-lg border ${step.bg} ${step.border} hover:opacity-80 transition-opacity text-left`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${step.color}`} />
                        <span className={`text-xs font-medium ${step.color}`}>{step.label}</span>
                      </div>
                      <p className="text-2xl font-bold">{count}</p>
                      {idx > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          -{dropRate}% Drop
                        </p>
                      )}
                    </button>
                    {idx < arr.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                );
              })}
              {/* Abandoned separately */}
              <div className="flex items-center gap-2 min-w-[140px]">
                <div className="w-px h-8 bg-border mx-1" />
                <button
                  onClick={() => setStatusFilter("abandoned")}
                  className="flex-1 p-4 rounded-lg border bg-red-500/10 border-red-500/20 hover:opacity-80 transition-opacity text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-xs font-medium text-red-400">Abgebrochen</span>
                  </div>
                  <p className="text-2xl font-bold">{funnelData?.abandoned ?? 0}</p>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step-Level Funnel */}
      <StepFunnel />

      {/* Leads Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Leads ({leadsData?.total ?? 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-52 h-9">
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  {FUNNEL_STEPS.map(s => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusFilter !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
                  Zurücksetzen
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (leadsData?.leads?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Noch keine externen Leads vorhanden.</p>
              <p className="text-sm mt-1">Leads entstehen wenn Besucher ihre E-Mail auf der Landing Page eingeben.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Website / Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead>Zuletzt aktualisiert</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsData?.leads?.map((lead: any) => {
                    const step = getStepConfig(lead.captureStatus);
                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm">
                              {lead.customerEmail || <span className="text-muted-foreground italic">Keine E-Mail</span>}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{lead.slug}</div>
                          {lead.industry && (
                            <div className="text-xs text-muted-foreground">{lead.industry}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={step.badge}>
                            {step.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(lead.updatedAt).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {lead.previewToken && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/preview/${lead.previewToken}`} target="_blank" rel="noopener">
                                  <Eye className="h-3 w-3 mr-1" /> Preview
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUpdateDialogLead(lead);
                                setNewStatus(lead.captureStatus as CaptureStatus);
                              }}
                            >
                              Status ändern
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={!!updateDialogLead} onOpenChange={(open) => { if (!open) setUpdateDialogLead(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lead-Status ändern</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Status für <span className="font-medium text-foreground">{updateDialogLead?.customerEmail || updateDialogLead?.slug}</span> ändern.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as CaptureStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUNNEL_STEPS.map(s => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUpdateDialogLead(null)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                if (updateDialogLead) {
                  updateStatusMutation.mutate({ id: updateDialogLead.id, captureStatus: newStatus });
                }
              }}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Step-Level Onboarding Funnel ──────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  businessCategory: "Branche",
  businessName: "Firmenname",
  addressingMode: "Du/Sie",
  brandLogo: "Logo",
  colorScheme: "Farbschema",
  heroPhoto: "Hauptbild",
  aboutPhoto: "Über-uns-Bild",
  headlineFont: "Schriftart",
  headlineSize: "Schriftgröße",
  tagline: "Slogan",
  description: "Beschreibung",
  usp: "USP",
  services: "Leistungen",
  legalOwner: "Inhaber",
  legalStreet: "Adresse",
  legalZipCity: "PLZ/Ort",
  legalEmail: "Impressums-E-Mail",
  legalPhone: "Telefon",
  openingHours: "Öffnungszeiten",
  legalVat: "USt-IdNr.",
  addons: "Add-ons",
  subpages: "Unterseiten",
  email: "E-Mail",
  hideSections: "Bereiche",
  preview: "Vorschau",
  checkout: "Checkout",
};

function StepFunnel() {
  const { data: steps, isLoading } = trpc.stats.stepFunnel.useQuery();

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Onboarding-Steps (Detail)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6 text-sm">
            Noch keine Step-Daten. Daten werden gesammelt sobald User das Onboarding durchlaufen.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...steps.map((s: any) => s.count), 1);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Onboarding-Steps (Detail)
        </CardTitle>
        <p className="text-xs text-muted-foreground">Wie viele User erreichen welchen Schritt?</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step: any, i: number) => {
            const pct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
            const prevCount = i > 0 ? steps[i - 1].count : step.count;
            const dropPct = prevCount > 0 ? (((prevCount - step.count) / prevCount) * 100).toFixed(0) : "0";
            return (
              <div key={step.step} className="flex items-center gap-3">
                <div className="w-32 text-xs text-right text-muted-foreground truncate shrink-0">
                  {STEP_LABELS[step.step] || step.step}
                </div>
                <div className="flex-1 h-7 bg-muted/30 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct > 60 ? '#22c55e' : pct > 30 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-semibold">
                    {step.count}
                  </span>
                </div>
                {i > 0 && Number(dropPct) > 0 && (
                  <span className="text-xs text-red-400 w-14 text-right shrink-0">-{dropPct}%</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
