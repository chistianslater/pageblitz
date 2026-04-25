import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

export default function SupportChatsPage() {
  const { data, isLoading, refetch } = trpc.website.supportChats.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const chats = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support-Chats</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Alle Hilfe-Chat-Verläufe der letzten 7 Tage · {chats.length} Gespräche
        </p>
      </div>

      {chats.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Noch keine Support-Chats</p>
          <p className="text-sm mt-1">Neue Chats erscheinen hier automatisch.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat: any) => {
            const messages = (chat.messages || []) as Array<{ role: string; content: string }>;
            const isExpanded = expandedId === chat.id;
            const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
            const createdAt = chat.createdAt ? new Date(chat.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–";
            const updatedAt = chat.updatedAt ? new Date(chat.updatedAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–";

            return (
              <div key={chat.id} className="border rounded-xl overflow-hidden bg-card">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : chat.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-lime-500/15 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-lime-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {lastUserMsg?.content?.slice(0, 80) || "Leerer Chat"}
                        {(lastUserMsg?.content?.length || 0) > 80 ? "..." : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{createdAt}</span>
                      <span>·</span>
                      <span>{chat.messageCount || messages.length} Nachrichten</span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{chat.sessionId?.slice(0, 8)}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t px-5 py-4 bg-muted/30">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] text-sm px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap ${
                            msg.role === "user"
                              ? "bg-lime-500/20 text-foreground rounded-br-sm"
                              : "bg-muted text-foreground/80 rounded-bl-sm"
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                      <span>Letzte Aktivität: {updatedAt}</span>
                      <span>Session: {chat.sessionId || "–"}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
