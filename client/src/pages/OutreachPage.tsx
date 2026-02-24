import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Loader2, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: Clock },
  sent: { label: "Gesendet", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Send },
  opened: { label: "Geöffnet", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: CheckCircle },
  replied: { label: "Beantwortet", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  bounced: { label: "Fehlgeschlagen", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertCircle },
};

export default function OutreachPage() {
  const { data, isLoading } = trpc.outreach.list.useQuery({ limit: 100, offset: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Outreach
        </h1>
        <p className="text-muted-foreground mt-1">
          Übersicht aller gesendeten E-Mails an potenzielle Kunden.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            E-Mail-Verlauf ({data?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data?.emails?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Noch keine E-Mails gesendet.</p>
              <p className="text-sm mt-1">Generiere zuerst Websites und sende dann Outreach-E-Mails.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Empfänger</TableHead>
                    <TableHead>Betreff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gesendet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.emails?.map((email: any) => {
                    const config = statusConfig[email.status] || statusConfig.draft;
                    const Icon = config.icon;
                    return (
                      <TableRow key={email.id}>
                        <TableCell className="font-medium">{email.recipientEmail}</TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">{email.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {email.sentAt ? new Date(email.sentAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–"}
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
