import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail, Loader2, Send, Clock, CheckCircle, AlertCircle,
  Eye, ExternalLink, Zap, ThumbsUp
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  generating: { label: "Generiert…", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Zap },
  draft:      { label: "Entwurf",    color: "bg-muted text-muted-foreground border-border",           icon: Clock },
  queued:     { label: "Wartet",     color: "bg-amber-500/20 text-amber-400 border-amber-500/30",     icon: Clock },
  sent:       { label: "Gesendet",   color: "bg-blue-500/20 text-blue-400 border-blue-500/30",        icon: Send },
  opened:     { label: "Geöffnet",   color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  replied:    { label: "Beantwortet",color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  bounced:    { label: "Fehlgeschlagen", color: "bg-red-500/20 text-red-400 border-red-500/30",      icon: AlertCircle },
};

const leadTypeLabel: Record<string, string> = {
  no_website:       "Keine Website",
  outdated_website: "Veraltete Website",
  poor_website:     "Schlechte Website",
  unknown:          "–",
};

const leadTypeColor: Record<string, string> = {
  no_website:       "bg-red-500/20 text-red-400 border-red-500/30",
  outdated_website: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  poor_website:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  unknown:          "bg-muted text-muted-foreground border-border",
};

export default function OutreachPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.outreach.list.useQuery({ limit: 200, offset: 0 });

  const approveMutation = trpc.outreach.approve.useMutation({
    onSuccess: (res) => {
      toast.success(`${res.approved} E-Mail${res.approved !== 1 ? "s" : ""} freigegeben`);
      setSelected(new Set());
      utils.outreach.list.invalidate();
    },
    onError: () => toast.error("Fehler beim Freigeben"),
  });

  const emails = data?.emails ?? [];
  const draftEmails = emails.filter((e: any) => e.status === "draft");
  const selectedDrafts = [...selected].filter(id => draftEmails.some((e: any) => e.id === id));

  const toggleAll = () => {
    if (selected.size === draftEmails.length && draftEmails.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(draftEmails.map((e: any) => e.id)));
    }
  };

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  // Stats
  const stats = {
    generating: emails.filter((e: any) => e.status === "generating").length,
    draft:      draftEmails.length,
    queued:     emails.filter((e: any) => e.status === "queued").length,
    sent:       emails.filter((e: any) => e.status === "sent").length,
    opened:     emails.filter((e: any) => e.status === "opened").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Outreach
          </h1>
          <p className="text-muted-foreground mt-1">
            Überprüfe generierte Entwürfe und gib sie zum Versand frei.
          </p>
        </div>
        {selectedDrafts.length > 0 && (
          <Button
            onClick={() => approveMutation.mutate({ emailIds: selectedDrafts })}
            disabled={approveMutation.isPending}
            className="gap-2"
          >
            {approveMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ThumbsUp className="h-4 w-4" />}
            {selectedDrafts.length} freigeben
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Generiert", value: stats.generating, color: "text-purple-400" },
          { label: "Entwürfe", value: stats.draft, color: "text-muted-foreground" },
          { label: "Wartet", value: stats.queued, color: "text-amber-400" },
          { label: "Gesendet", value: stats.sent, color: "text-blue-400" },
          { label: "Geöffnet", value: stats.opened, color: "text-emerald-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            E-Mail-Liste ({data?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Noch keine E-Mails generiert.</p>
              <p className="text-sm mt-1">Die Pipeline generiert automatisch Vorschau-Websites und erstellt Entwürfe.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selected.size === draftEmails.length && draftEmails.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Qualität</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email: any) => {
                    const config = statusConfig[email.status] || statusConfig.draft;
                    const Icon = config.icon;
                    const isDraft = email.status === "draft";
                    return (
                      <TableRow key={email.id} className={selected.has(email.id) ? "bg-primary/5" : ""}>
                        <TableCell>
                          {isDraft && (
                            <Checkbox
                              checked={selected.has(email.id)}
                              onCheckedChange={() => toggle(email.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{email.businessName || "–"}</div>
                          {email.businessWebsite && (
                            <a
                              href={email.businessWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {email.businessWebsite.replace(/^https?:\/\//, "").slice(0, 40)}
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {email.recipientEmail}
                        </TableCell>
                        <TableCell>
                          {email.leadType && email.leadType !== "unknown" ? (
                            <Badge variant="outline" className={`text-xs ${leadTypeColor[email.leadType] || ""}`}>
                              {leadTypeLabel[email.leadType] || email.leadType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">–</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${config.color} text-xs`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {email.previewUrl ? (
                            <a
                              href={email.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
                                <Eye className="h-3 w-3" />
                                Ansehen
                              </Button>
                            </a>
                          ) : email.status === "generating" ? (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" /> wird generiert
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {email.createdAt
                            ? new Date(email.createdAt).toLocaleDateString("de-DE", {
                                day: "2-digit", month: "2-digit", year: "2-digit",
                                hour: "2-digit", minute: "2-digit"
                              })
                            : "–"}
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
    </div>
  );
}
