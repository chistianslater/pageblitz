import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Zap, Play, CheckCircle, XCircle, Clock, Mail, Building2, Search, RefreshCw } from "lucide-react";

const INDUSTRIES = [
  { key: "friseur", label: "Friseur" },
  { key: "zahnarzt", label: "Zahnarzt" },
  { key: "physiotherapie", label: "Physiotherapie" },
  { key: "kosmetik", label: "Kosmetik" },
  { key: "rechtsanwalt", label: "Rechtsanwalt" },
  { key: "steuerberater", label: "Steuerberater" },
  { key: "elektriker", label: "Elektriker" },
  { key: "schreiner", label: "Schreiner" },
  { key: "maler", label: "Maler" },
  { key: "restaurant", label: "Restaurant" },
  { key: "baeckerei", label: "Bäckerei" },
  { key: "fitnessstudio", label: "Fitnessstudio" },
  { key: "immobilienmakler", label: "Immobilienmakler" },
  { key: "architekt", label: "Architekt" },
  { key: "fotograf", label: "Fotograf" },
  { key: "hundeschule", label: "Hundeschule" },
  { key: "reinigung", label: "Reinigung" },
  { key: "kfz", label: "KFZ-Werkstatt" },
  { key: "nagelstudio", label: "Nagelstudio" },
  { key: "yoga", label: "Yogastudio" },
];

const TOP_CITIES = [
  "berlin", "hamburg", "münchen", "köln", "frankfurt", "stuttgart", "düsseldorf",
  "leipzig", "dortmund", "essen", "bremen", "dresden", "hannover", "nürnberg",
  "duisburg", "bochum", "wuppertal", "bielefeld", "bonn", "münster",
];

const CITY_LABELS: Record<string, string> = {
  berlin: "Berlin", hamburg: "Hamburg", münchen: "München", köln: "Köln",
  frankfurt: "Frankfurt", stuttgart: "Stuttgart", düsseldorf: "Düsseldorf",
  leipzig: "Leipzig", dortmund: "Dortmund", essen: "Essen", bremen: "Bremen",
  dresden: "Dresden", hannover: "Hannover", nürnberg: "Nürnberg",
  duisburg: "Duisburg", bochum: "Bochum", wuppertal: "Wuppertal",
  bielefeld: "Bielefeld", bonn: "Bonn", münster: "Münster",
};

const INTERVAL_OPTIONS = [
  { value: 15, label: "15 Min" },
  { value: 30, label: "30 Min" },
  { value: 60, label: "1 Std" },
  { value: 120, label: "2 Std" },
  { value: 360, label: "6 Std" },
];

function formatTime(iso: string | null) {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PipelinePage() {
  const utils = trpc.useUtils();

  const { data: status, isLoading, refetch } = trpc.outreach.getPipelineStatus.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const setConfig = trpc.outreach.setPipelineConfig.useMutation({
    onSuccess: () => utils.outreach.getPipelineStatus.invalidate(),
  });

  const trigger = trpc.outreach.triggerPipeline.useMutation({
    onSuccess: (res) => {
      utils.outreach.getPipelineStatus.invalidate();
      toast.success(`Lauf abgeschlossen: ${res.msg}`);
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  // Local edit state – synced from server
  const [dailyLimit, setDailyLimit] = useState(50);
  const [batchSize, setBatchSize] = useState(5);
  const [intervalMin, setIntervalMin] = useState(60);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (status?.config) {
      setDailyLimit(status.config.dailyLimit);
      setBatchSize(status.config.batchSize);
      setIntervalMin(status.config.intervalMinutes);
      setSelectedIndustries(status.config.targetIndustryKeys || []);
      setSelectedCities(status.config.targetCitySlugs || []);
      setDirty(false);
    }
  }, [status?.config]);

  const handleToggleEnabled = async (enabled: boolean) => {
    await setConfig.mutateAsync({ enabled });
  };

  const handleSaveConfig = async () => {
    await setConfig.mutateAsync({
      dailyLimit,
      batchSize,
      intervalMinutes: intervalMin,
      targetIndustryKeys: selectedIndustries,
      targetCitySlugs: selectedCities,
    });
    setDirty(false);
  };

  const toggleIndustry = (key: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setDirty(true);
  };

  const toggleCity = (slug: string) => {
    setSelectedCities((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    setDirty(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Pipeline-Status wird geladen...
      </div>
    );
  }

  const config = status?.config;
  const isEnabled = config?.enabled ?? false;
  const isRunning = status?.isRunning ?? false;
  const todayCount = status?.todayCount ?? 0;
  const todayLimit = config?.dailyLimit ?? 50;
  const totalQueued = status?.totalQueued ?? 0;
  const totalFound = status?.totalFound ?? 0;
  const totalEmailsFound = status?.totalEmailsFound ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Outreach Pipeline</h1>
          {isRunning && (
            <Badge variant="secondary" className="gap-1 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Läuft...
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Status + Enable toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-semibold text-lg">
                  {isEnabled ? "Pipeline aktiv" : "Pipeline inaktiv"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <div>
                  Letzter Lauf:{" "}
                  <span className="text-foreground">
                    {formatTime(status?.lastRunAt ?? null)}
                  </span>
                </div>
                {status?.lastRunResult && (
                  <div>
                    Ergebnis:{" "}
                    <span className="text-foreground">{status.lastRunResult}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleEnabled}
                disabled={setConfig.isPending}
              />
              <Button
                onClick={() => trigger.mutate()}
                disabled={trigger.isPending || isRunning}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {trigger.isPending || isRunning ? "Läuft..." : "Jetzt ausführen"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground text-sm">
              <Mail className="h-4 w-4" />
              Heute
            </div>
            <div className="text-2xl font-bold">
              {todayCount}
              <span className="text-base font-normal text-muted-foreground">
                /{todayLimit}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground text-sm">
              <Mail className="h-4 w-4" />
              Gesamt eingereiht
            </div>
            <div className="text-2xl font-bold">{totalQueued}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground text-sm">
              <Building2 className="h-4 w-4" />
              Unternehmen
            </div>
            <div className="text-2xl font-bold">{totalFound}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground text-sm">
              <Search className="h-4 w-4" />
              Emails gefunden
            </div>
            <div className="text-2xl font-bold">{totalEmailsFound}</div>
          </CardContent>
        </Card>
      </div>

      {/* Config section */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Limits row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dailyLimit">Tageslimit (Emails)</Label>
              <Input
                id="dailyLimit"
                type="number"
                min={1}
                max={200}
                value={dailyLimit}
                onChange={(e) => {
                  setDailyLimit(Number(e.target.value));
                  setDirty(true);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batchSize">Batch-Größe pro Lauf</Label>
              <Input
                id="batchSize"
                type="number"
                min={1}
                max={20}
                value={batchSize}
                onChange={(e) => {
                  setBatchSize(Number(e.target.value));
                  setDirty(true);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Intervall</Label>
              <div className="flex gap-2 flex-wrap">
                {INTERVAL_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={intervalMin === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setIntervalMin(opt.value);
                      setDirty(true);
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Industry toggles */}
          <div>
            <Label className="mb-2 block">
              Branchen{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (leer = alle)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => {
                const active = selectedIndustries.includes(ind.key);
                return (
                  <button
                    key={ind.key}
                    onClick={() => toggleIndustry(ind.key)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {ind.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* City toggles */}
          <div>
            <Label className="mb-2 block">
              Städte{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (leer = alle)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {TOP_CITIES.map((slug) => {
                const active = selectedCities.includes(slug);
                return (
                  <button
                    key={slug}
                    onClick={() => toggleCity(slug)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {CITY_LABELS[slug] || slug}
                  </button>
                );
              })}
            </div>
          </div>

          {dirty && (
            <div className="flex justify-end">
              <Button onClick={handleSaveConfig} disabled={setConfig.isPending}>
                {setConfig.isPending ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lauf-Protokoll
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!status?.runLog?.length ? (
            <div className="text-center text-muted-foreground py-6 text-sm">
              Noch keine Läufe aufgezeichnet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 pr-4 font-medium">Zeitpunkt</th>
                    <th className="text-left py-2 pr-4 font-medium">Nachricht</th>
                    <th className="text-right py-2 font-medium">Eingereiht</th>
                  </tr>
                </thead>
                <tbody>
                  {status.runLog.slice(0, 20).map((entry, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                        {formatTime(entry.at)}
                      </td>
                      <td className="py-2 pr-4">{entry.msg}</td>
                      <td className="py-2 text-right">
                        <Badge variant={entry.queued > 0 ? "default" : "secondary"}>
                          {entry.queued}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
