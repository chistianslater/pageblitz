import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface ChatLeadsTabProps {
  websiteId: number;
  website: any;
  onGoToAddons: () => void;
}

/** Chat-Leads + Gespräche des KI-Chat-Add-ons — unabhängig vom Studio,
 * bleibt vollständig im Dashboard (Cutover-Spec §2). */
export function ChatLeadsTab({
  websiteId,
  website,
  onGoToAddons,
}: ChatLeadsTabProps) {
  const {
    data,
    isLoading,
    refetch: refetchLeads,
  } = trpc.customer.getChatLeads.useQuery({ websiteId });
  const { data: transcriptData, isLoading: transcriptsLoading } =
    trpc.customer.getChatTranscripts.useQuery({ websiteId });
  const markRead = trpc.customer.markChatLeadRead.useMutation({
    onSuccess: () => refetchLeads(),
  });
  const deleteLead = trpc.customer.deleteChatLead.useMutation({
    onSuccess: () => refetchLeads(),
  });
  const deleteTranscript = trpc.customer.deleteChatTranscript.useMutation();
  const aiChatEnabled = !!(website as any).addOnAiChat;
  const [activeSubTab, setActiveSubTab] = useState<"leads" | "transcripts">(
    "leads"
  );
  const [expandedTranscript, setExpandedTranscript] = useState<number | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  if (!aiChatEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-lp-accent/10 border border-lp-accent/20 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-lp-accent" />
        </div>
        <h3 className="text-lp-ink font-semibold text-lg mb-2">
          KI-Chat noch nicht aktiviert
        </h3>
        <p className="text-lp-muted text-sm max-w-sm mb-5">
          Aktiviere den KI-Chat, damit Besucher direkt auf deiner Website mit
          dir interagieren können – Leads landen dann hier.
        </p>
        <button
          onClick={onGoToAddons}
          className="bg-lp-accent hover:bg-lp-accent/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Zu Add-ons → KI-Chat aktivieren
        </button>
      </div>
    );
  }

  const leads = data?.leads ?? [];
  const transcripts = transcriptData?.transcripts ?? [];
  const unread = leads.filter((l: any) => !l.readAt).length;

  function downloadTranscriptJson(transcript: any) {
    const messages =
      (transcript.messages as Array<{ role: string; content: string }>) ?? [];
    const date = transcript.createdAt
      ? new Date(transcript.createdAt).toLocaleString("de-DE")
      : "";
    const visitorName = transcript.visitorName || "Unbekannt";
    const lines: string[] = [
      `Chat-Gespräch`,
      `──────────────────────────────`,
      `Besucher:  ${visitorName}`,
      `Datum:     ${date}`,
      `──────────────────────────────`,
      "",
      ...messages.map(m => {
        const role = m.role === "assistant" ? "Bot" : "Besucher";
        return `[${role}]\n${m.content}\n`;
      }),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${visitorName.replace(/\s+/g, "-")}-${transcript.sessionId.slice(0, 6)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 bg-lp-surface border border-lp-line rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveSubTab("leads")}
          className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${activeSubTab === "leads" ? "bg-lp-accent text-white" : "text-lp-muted hover:text-lp-ink"}`}
        >
          Leads
          {unread > 0 && (
            <span className="ml-1.5 bg-lp-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("transcripts")}
          className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${activeSubTab === "transcripts" ? "bg-lp-accent text-white" : "text-lp-muted hover:text-lp-ink"}`}
        >
          Gespräche
          {transcripts.length > 0 && (
            <span className="ml-1.5 bg-lp-line text-lp-ink/80 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {transcripts.length}
            </span>
          )}
        </button>
      </div>

      {/* LEADS sub-tab */}
      {activeSubTab === "leads" &&
        (isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-lp-accent" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-lp-surface border border-lp-line rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-lp-muted" />
            </div>
            <h3 className="text-lp-ink font-semibold text-lg mb-2">
              Noch keine Leads
            </h3>
            <p className="text-lp-muted text-sm max-w-sm">
              Sobald Website-Besucher ihren Namen und Kontakt im Chat
              hinterlassen, erscheinen sie hier.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lp-ink font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-lp-accent" />
                Chat-Leads
              </h2>
              <span className="text-lp-muted text-sm">
                {leads.length} insgesamt
              </span>
            </div>
            {leads.map((lead: any) => (
              <div
                key={lead.id}
                className={`bg-lp-surface border rounded-xl p-4 transition-all ${lead.readAt ? "border-lp-line" : "border-lp-accent/40 ring-1 ring-lp-accent/10"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-lp-ink font-medium text-sm">
                        {lead.visitorName || "Unbekannt"}
                      </span>
                      {!lead.readAt && (
                        <span className="bg-lp-accent/10 text-lp-accent text-xs px-2 py-0.5 rounded-full border border-lp-accent/30">
                          Neu
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-lp-accent hover:text-lp-accent transition-colors flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                    {lead.summary && (
                      <p className="text-lp-muted text-xs mt-1.5 leading-relaxed">
                        {lead.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-lp-muted text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {!lead.readAt && (
                      <button
                        onClick={() =>
                          markRead.mutate({ leadId: lead.id, websiteId })
                        }
                        className="text-xs text-lp-muted hover:text-lp-ink transition-colors"
                      >
                        Als gelesen markieren
                      </button>
                    )}
                    {deleteConfirmId === lead.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-lp-muted">Löschen?</span>
                        <button
                          onClick={() => {
                            deleteLead.mutate({ leadId: lead.id, websiteId });
                            setDeleteConfirmId(null);
                          }}
                          className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                          Ja
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs text-lp-muted hover:text-lp-ink/80 transition-colors"
                        >
                          Nein
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(lead.id)}
                        className="p-1 rounded-lg text-lp-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Lead löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* TRANSCRIPTS sub-tab */}
      {activeSubTab === "transcripts" &&
        (transcriptsLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-lp-accent" />
          </div>
        ) : transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-lp-surface border border-lp-line rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-lp-muted" />
            </div>
            <h3 className="text-lp-ink font-semibold text-lg mb-2">
              Noch keine Gespräche
            </h3>
            <p className="text-lp-muted text-sm max-w-sm">
              Geführte Chat-Gespräche werden hier für 30 Tage gespeichert.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lp-ink font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-lp-accent" />
                Chat-Gespräche
              </h2>
              <span className="text-lp-muted text-xs">
                30 Tage Aufbewahrung
              </span>
            </div>
            {transcripts.map((t: any) => {
              const messages: Array<{ role: string; content: string }> =
                t.messages ?? [];
              const isExpanded = expandedTranscript === t.id;
              const expiresIn = Math.ceil(
                (new Date(t.expiresAt).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={t.id}
                  className="bg-lp-surface border border-lp-line rounded-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 p-4">
                    <button
                      onClick={() =>
                        setExpandedTranscript(isExpanded ? null : t.id)
                      }
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                    >
                      <div className="w-8 h-8 bg-lp-accent/15 border border-lp-accent/25 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-lp-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lp-ink text-sm font-medium">
                            {t.visitorName || "Anonymer Besucher"}
                          </span>
                          <span className="text-lp-muted text-xs">
                            {t.messageCount} Nachrichten
                          </span>
                        </div>
                        {t.summary && (
                          <p className="text-lp-muted text-xs mt-0.5 truncate">
                            {t.summary}
                          </p>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-lp-muted flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${expiresIn <= 3 ? "text-orange-400 border-orange-500/30 bg-orange-500/10" : "text-lp-muted border-lp-line"}`}
                      >
                        {expiresIn}d
                      </span>
                      <button
                        onClick={() => downloadTranscriptJson(t)}
                        title="Als JSON herunterladen"
                        className="p-1.5 rounded-lg text-lp-muted hover:text-lp-ink hover:bg-lp-canvas/50 transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          deleteTranscript.mutate({
                            transcriptId: t.id,
                            websiteId,
                          })
                        }
                        title="Löschen"
                        className="p-1.5 rounded-lg text-lp-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded transcript */}
                  {isExpanded && (
                    <div className="border-t border-lp-line px-4 py-3 space-y-2 max-h-80 overflow-y-auto">
                      <div className="text-lp-muted text-xs mb-3">
                        {new Date(t.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}Session {t.sessionId.slice(0, 8)}…
                      </div>
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-lp-accent/10 border border-lp-accent/30 text-lp-ink"
                                : "bg-lp-canvas border border-lp-line/40 text-lp-ink/80"
                            }`}
                          >
                            <span className="text-[10px] font-medium opacity-60 block mb-0.5">
                              {msg.role === "user"
                                ? "Besucher"
                                : "KI-Assistent"}
                            </span>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}
