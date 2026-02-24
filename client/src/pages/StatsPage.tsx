import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Building2, Globe, Mail, ShoppingCart, Eye, CheckCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsPage() {
  const { data: stats, isLoading } = trpc.stats.dashboard.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Statistiken
        </h1>
        <p className="text-muted-foreground mt-1">
          Detaillierte Übersicht über alle Plattform-Metriken.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Building2} label="Unternehmen gesamt" value={stats?.totalBusinesses} loading={isLoading} color="text-blue-400" bgColor="bg-blue-500/10" />
        <MetricCard icon={Globe} label="Websites generiert" value={stats?.totalWebsites} loading={isLoading} color="text-emerald-400" bgColor="bg-emerald-500/10" />
        <MetricCard icon={Mail} label="E-Mails gesendet" value={stats?.sentEmails} loading={isLoading} color="text-amber-400" bgColor="bg-amber-500/10" />
        <MetricCard icon={ShoppingCart} label="Verkäufe" value={stats?.soldCount} loading={isLoading} color="text-purple-400" bgColor="bg-purple-500/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Website-Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBar label="Preview" value={stats?.previewCount ?? 0} total={stats?.totalWebsites ?? 1} color="bg-amber-400" icon={Eye} />
            <StatusBar label="Verkauft" value={stats?.soldCount ?? 0} total={stats?.totalWebsites ?? 1} color="bg-purple-400" icon={ShoppingCart} />
            <StatusBar label="Aktiv" value={stats?.activeCount ?? 0} total={stats?.totalWebsites ?? 1} color="bg-emerald-400" icon={CheckCircle} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Conversion-Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ConversionMetric
              label="Suche → Website"
              from={stats?.totalBusinesses ?? 0}
              to={stats?.totalWebsites ?? 0}
              fromLabel="Unternehmen"
              toLabel="Websites"
            />
            <ConversionMetric
              label="Website → Verkauf"
              from={stats?.totalWebsites ?? 0}
              to={(stats?.soldCount ?? 0) + (stats?.activeCount ?? 0)}
              fromLabel="Websites"
              toLabel="Verkäufe"
            />
            <ConversionMetric
              label="E-Mail → Verkauf"
              from={stats?.sentEmails ?? 0}
              to={(stats?.soldCount ?? 0) + (stats?.activeCount ?? 0)}
              fromLabel="E-Mails"
              toLabel="Verkäufe"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, loading, color, bgColor }: {
  icon: any; label: string; value?: number; loading: boolean; color: string; bgColor: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{value ?? 0}</div>
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBar({ label, value, total, color, icon: Icon }: {
  label: string; value: number; total: number; color: string; icon: any;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
        </div>
        <span className="font-medium">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ConversionMetric({ label, from, to, fromLabel, toLabel }: {
  label: string; from: number; to: number; fromLabel: string; toLabel: string;
}) {
  const rate = from > 0 ? Math.round((to / from) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold text-primary">{rate}%</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{from} {fromLabel}</span>
        <span>→</span>
        <span>{to} {toLabel}</span>
      </div>
    </div>
  );
}
