import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Clock, CheckCircle, SkipForward, XCircle, AlertTriangle, Eye, MousePointerClick } from "lucide-react";

type StatusFilter = "any" | "scheduled" | "sent" | "cancelled" | "skipped" | "bounced";
type TypeFilter = "any" | "reminder_2h" | "reminder_24h" | "reminder_final" | "fresh_start_7d";

const TYPE_LABEL: Record<string, string> = {
  reminder_2h: "Erinnerung +2h",
  reminder_24h: "Hilfe +24h",
  reminder_final: "Letzter Aufruf",
  fresh_start_7d: "Fresh Start +7d",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Geplant",
  sent: "Gesendet",
  skipped: "Übersprungen",
  cancelled: "Abgebrochen",
  bounced: "Bounce",
};

const STATUS_COLOR: Record<string, string> = {
  scheduled: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  sent: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  skipped: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  cancelled: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  bounced: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function fmt(ts: string | Date | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
}

export default function LifecyclePage() {
  const [status, setStatus] = useState<StatusFilter>("any");
  const [type, setType] = useState<TypeFilter>("any");

  const statsQuery = trpc.lifecycle.adminStats.useQuery();
  const listQuery = trpc.lifecycle.adminList.useQuery({
    status: status === "any" ? undefined : status,
    type: type === "any" ? undefined : type,
    limit: 200,
  });

  const refetch = () => {
    listQuery.refetch();
    statsQuery.refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Lifecycle-Mails
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Automatische Reaktivierungs-Mails an Leads, die ihre Website nicht fertiggestellt haben.
        </p>
      </div>

      {/* Stats */}
      {(() => {
        const s = statsQuery.data;
        const sent = s?.sent ?? 0;
        const opened = s?.opened ?? 0;
        const clicked = s?.clicked ?? 0;
        const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
        const clickRate = sent > 0 ? Math.round((clicked / sent) * 100) : 0;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Geplant</CardTitle>
                <Clock className="w-4 h-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{s?.scheduled ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Gesendet</CardTitle>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{sent}</div>
                <div className="text-xs text-muted-foreground mt-1">{s?.sentLast24h ?? 0} in 24h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Geöffnet</CardTitle>
                <Eye className="w-4 h-4 text-violet-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{openRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">{opened} von {sent} Mails</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Geklickt</CardTitle>
                <MousePointerClick className="w-4 h-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{clickRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">{clicked} von {sent} Mails</div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Sekundär-Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><SkipForward className="w-3.5 h-3.5" /> {statsQuery.data?.skipped ?? 0} übersprungen</span>
        <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> {statsQuery.data?.cancelled ?? 0} abgebrochen</span>
        <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {statsQuery.data?.bounced ?? 0} Bounce</span>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Alle Status</SelectItem>
                <SelectItem value="scheduled">Geplant</SelectItem>
                <SelectItem value="sent">Gesendet</SelectItem>
                <SelectItem value="skipped">Übersprungen</SelectItem>
                <SelectItem value="cancelled">Abgebrochen</SelectItem>
                <SelectItem value="bounced">Bounce</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(v) => setType(v as TypeFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Alle Typen</SelectItem>
                <SelectItem value="reminder_2h">Erinnerung +2h</SelectItem>
                <SelectItem value="reminder_24h">Hilfe +24h</SelectItem>
                <SelectItem value="reminder_final">Letzter Aufruf</SelectItem>
                <SelectItem value="fresh_start_7d">Fresh Start +7d</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={refetch}>
              Neu laden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{listQuery.data?.total ?? 0} Mails</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="text-muted-foreground py-8 text-center">Lade…</div>
          ) : (listQuery.data?.rows.length ?? 0) === 0 ? (
            <div className="text-muted-foreground py-12 text-center flex flex-col items-center gap-2">
              <Mail className="w-8 h-8 text-slate-400" />
              <p>Noch keine Lifecycle-Mails.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empfänger</TableHead>
                  <TableHead className="w-40">Typ</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-40">Engagement</TableHead>
                  <TableHead className="w-40">Geplant für</TableHead>
                  <TableHead className="w-40">Gesendet am</TableHead>
                  <TableHead className="w-24 text-right">Website</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.rows ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.recipientEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABEL[row.type] ?? row.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLOR[row.status] ?? ""}>
                        {STATUS_LABEL[row.status] ?? row.status}
                      </Badge>
                      {row.cancelReason && (
                        <div className="text-xs text-muted-foreground mt-1">{row.cancelReason}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.status !== "sent" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {row.clickedAt ? (
                            <span className="flex items-center gap-1 text-amber-400" title={fmt(row.clickedAt)}>
                              <MousePointerClick className="w-3.5 h-3.5" /> Geklickt
                            </span>
                          ) : row.openedAt ? (
                            <span className="flex items-center gap-1 text-violet-400" title={fmt(row.openedAt)}>
                              <Eye className="w-3.5 h-3.5" /> Geöffnet
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Nicht geöffnet</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmt(row.scheduledFor)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmt(row.sentAt)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">#{row.websiteId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {(statsQuery.data?.bounced ?? 0) > 0 && (
        <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4" />
          {statsQuery.data?.bounced} Mail(s) sind gebounced – Empfänger-Adressen prüfen.
        </div>
      )}
    </div>
  );
}
