import { trpc } from "@/lib/trpc";
import { Loader2, Mail, Clock, CheckCircle, XCircle, AlertTriangle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  reminder_2h: "Reminder (2h)",
  reminder_24h: "Reminder (24h)",
  reminder_final: "Letzter Reminder",
  fresh_start_7d: "Neustart (7 Tage)",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  scheduled: { label: "Geplant", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
  sent:      { label: "Gesendet", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  cancelled: { label: "Abgebrochen", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: XCircle },
  skipped:   { label: "Übersprungen", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: AlertTriangle },
  bounced:   { label: "Bounce", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

function formatDate(d: any): string {
  if (!d) return "–";
  return new Date(d).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LifecycleEmailsPage() {
  const { data, isLoading } = trpc.website.lifecycleEmails.useQuery();

  const emails = data || [];
  const sentCount = emails.filter((e: any) => e.status === "sent").length;
  const scheduledCount = emails.filter((e: any) => e.status === "scheduled").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lifecycle-E-Mails</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Automatische Reminder und Re-Engagement-Mails · {emails.length} E-Mails total · {sentCount} gesendet · {scheduledCount} geplant
        </p>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Noch keine Lifecycle-E-Mails</p>
          <p className="text-sm mt-1">E-Mails werden automatisch geplant, wenn ein User seine E-Mail-Adresse eingibt.</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Empfänger</th>
                <th className="text-left px-4 py-3 font-medium">Typ</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Geplant für</th>
                <th className="text-left px-4 py-3 font-medium">Gesendet am</th>
                <th className="text-left px-4 py-3 font-medium">Website</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {emails.map((email: any) => {
                const statusCfg = STATUS_CONFIG[email.status] || STATUS_CONFIG.scheduled;
                const StatusIcon = statusCfg.icon;
                return (
                  <tr key={email.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate max-w-[200px]">{email.recipientEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{TYPE_LABELS[email.type] || email.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`gap-1 ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </Badge>
                      {email.cancelReason && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{email.cancelReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(email.scheduledFor)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(email.sentAt)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">#{email.websiteId}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
