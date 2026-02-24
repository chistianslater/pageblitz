import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Mail, BarChart3, Building2, Eye, CheckCircle, ShoppingCart, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading } = trpc.stats.dashboard.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Willkommen bei Pageblitz – dein Überblick über alle Aktivitäten.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Unternehmen" value={stats?.totalBusinesses} loading={isLoading} color="text-blue-400" />
        <StatCard icon={Globe} label="Generierte Websites" value={stats?.totalWebsites} loading={isLoading} color="text-emerald-400" />
        <StatCard icon={Mail} label="E-Mails gesendet" value={stats?.sentEmails} loading={isLoading} color="text-amber-400" />
        <StatCard icon={ShoppingCart} label="Verkäufe" value={stats?.soldCount} loading={isLoading} color="text-purple-400" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preview</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.previewCount ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Websites im Preview-Modus</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktiv</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-emerald-400">{stats?.activeCount ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Live geschaltete Websites</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt E-Mails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.totalEmails ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Outreach-E-Mails insgesamt</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Schnellstart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickAction
              title="Unternehmen suchen"
              description="Finde Unternehmen ohne Website über Google Maps"
              href="/search"
              icon={<Building2 className="h-5 w-5" />}
            />
            <QuickAction
              title="Websites verwalten"
              description="Übersicht aller generierten Websites"
              href="/websites"
              icon={<Globe className="h-5 w-5" />}
            />
            <QuickAction
              title="Outreach starten"
              description="Kontaktiere potenzielle Kunden per E-Mail"
              href="/outreach"
              icon={<Mail className="h-5 w-5" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading, color }: {
  icon: any; label: string; value?: number; loading: boolean; color: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-16" /> : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAction({ title, description, href, icon }: {
  title: string; description: string; href: string; icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </a>
  );
}
