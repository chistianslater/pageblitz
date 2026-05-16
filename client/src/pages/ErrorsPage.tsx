import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Bug, AlertTriangle, CheckCircle, Activity, Search, RotateCcw, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

type Filter = "unresolved" | "resolved" | "all";
type Source = "react" | "window-error" | "unhandled-rejection" | "server" | "any";

const SOURCE_LABEL: Record<string, string> = {
  "react": "React Render",
  "window-error": "Window-Fehler",
  "unhandled-rejection": "Unhandled Promise",
  "server": "Server",
};

const SOURCE_COLOR: Record<string, string> = {
  "react": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "window-error": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "unhandled-rejection": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "server": "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

function formatTime(ts: string | Date | null | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
}

export default function ErrorsPage() {
  const [filter, setFilter] = useState<Filter>("unresolved");
  const [source, setSource] = useState<Source>("any");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const statsQuery = trpc.clientErrors.stats.useQuery();
  const listQuery = trpc.clientErrors.list.useQuery({
    filter,
    source: source === "any" ? undefined : source,
    search: search.trim() || undefined,
    limit: 100,
  });
  const markResolvedMutation = trpc.clientErrors.markResolved.useMutation();
  const reopenMutation = trpc.clientErrors.reopen.useMutation();
  const deleteMutation = trpc.clientErrors.delete.useMutation();

  const refetch = () => {
    listQuery.refetch();
    statsQuery.refetch();
  };

  const handleResolve = async (id: number) => {
    try {
      await markResolvedMutation.mutateAsync({ id });
      toast.success("Als gelöst markiert");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Fehler");
    }
  };

  const handleReopen = async (id: number) => {
    try {
      await reopenMutation.mutateAsync({ id });
      toast.success("Wieder geöffnet");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Fehler");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Wirklich löschen?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Gelöscht");
      setSelectedId(null);
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Fehler");
    }
  };

  const selected = listQuery.data?.rows.find((r) => r.id === selectedId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bug className="w-6 h-6" />
          Client Errors
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Crashes und Errors aus dem Browser deiner Besucher. Identische Errors werden zu einer Zeile zusammengefasst.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offen</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{statsQuery.data?.unresolved ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vorkommen offen</CardTitle>
            <Activity className="w-4 h-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{statsQuery.data?.totalOccurrences ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Letzte 24h</CardTitle>
            <Activity className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{statsQuery.data?.last24h ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gelöst</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{statsQuery.data?.resolved ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="In Message suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </div>

            <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unresolved">Nur offene</SelectItem>
                <SelectItem value="resolved">Nur gelöste</SelectItem>
                <SelectItem value="all">Alle</SelectItem>
              </SelectContent>
            </Select>

            <Select value={source} onValueChange={(v) => setSource(v as Source)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Alle Quellen</SelectItem>
                <SelectItem value="react">React Render</SelectItem>
                <SelectItem value="window-error">Window-Fehler</SelectItem>
                <SelectItem value="unhandled-rejection">Unhandled Promise</SelectItem>
                <SelectItem value="server">Server</SelectItem>
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
          <CardTitle className="text-base">
            {listQuery.data?.total ?? 0} Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="text-muted-foreground py-8 text-center">Lade…</div>
          ) : (listQuery.data?.rows.length ?? 0) === 0 ? (
            <div className="text-muted-foreground py-12 text-center flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <p>Keine Errors – alles ruhig!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Quelle</TableHead>
                  <TableHead>Nachricht</TableHead>
                  <TableHead className="w-20 text-right">Vorkomm.</TableHead>
                  <TableHead className="w-36">Zuletzt</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-32 text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.rows ?? []).map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => setSelectedId(row.id)}
                  >
                    <TableCell>
                      <Badge className={SOURCE_COLOR[row.source] ?? ""} variant="outline">
                        {SOURCE_LABEL[row.source] ?? row.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-mono text-xs text-foreground truncate" title={row.message}>
                        {row.message}
                      </div>
                      {row.url && (
                        <div className="text-xs text-muted-foreground truncate" title={row.url}>
                          {row.url.replace(/^https?:\/\/[^/]+/, "")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {row.occurrences}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatTime(row.lastSeenAt)}
                    </TableCell>
                    <TableCell>
                      {row.resolvedAt ? (
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                          Gelöst
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-300 border-amber-500/30">
                          Offen
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(row.id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className={SOURCE_COLOR[selected.source] ?? ""} variant="outline">
                    {SOURCE_LABEL[selected.source] ?? selected.source}
                  </Badge>
                  Error #{selected.id}
                </DialogTitle>
                <DialogDescription>
                  Fingerprint: <code className="text-xs">{selected.fingerprint.slice(0, 12)}</code>
                  &nbsp;·&nbsp; Vorkommen: <strong>{selected.occurrences}</strong>
                  &nbsp;·&nbsp; Zuerst: {formatTime(selected.firstSeenAt)}
                  &nbsp;·&nbsp; Zuletzt: {formatTime(selected.lastSeenAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Message</div>
                  <pre className="text-sm font-mono bg-muted p-3 rounded whitespace-pre-wrap break-words">{selected.message}</pre>
                </div>

                {selected.url && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">URL</div>
                    <div className="text-xs font-mono bg-muted p-3 rounded break-all">{selected.url}</div>
                  </div>
                )}

                {selected.stack && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Stack-Trace</div>
                    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap break-words max-h-96 overflow-y-auto">{selected.stack}</pre>
                  </div>
                )}

                {selected.componentStack && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">React Component Stack</div>
                    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto">{selected.componentStack}</pre>
                  </div>
                )}

                {selected.userAgent && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">User-Agent</div>
                    <div className="text-xs font-mono bg-muted p-3 rounded break-all">{selected.userAgent}</div>
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notiz</div>
                    <div className="text-sm bg-muted p-3 rounded">{selected.notes}</div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Löschen
                </Button>
                {selected.resolvedAt ? (
                  <Button variant="outline" size="sm" onClick={() => handleReopen(selected.id)}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Wieder öffnen
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleResolve(selected.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Als gelöst markieren
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  <X className="w-4 h-4 mr-1" /> Schließen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
