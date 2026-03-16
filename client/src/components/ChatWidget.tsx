import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, ChevronDown, CalendarDays } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  slug: string;
  primaryColor?: string;
  businessName?: string;
  welcomeMessage?: string;
  addOnBooking?: boolean;
  onBookingRequest?: () => void;
}

// Generate or retrieve a stable session ID
function getSessionId(): string {
  const key = "pb_chat_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

// Lighten a hex color for backgrounds
function lightenHex(hex: string, amount = 0.9): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

export default function ChatWidget({
  slug,
  primaryColor = "#2563eb",
  businessName = "Assistent",
  welcomeMessage,
  addOnBooking = false,
  onBookingRequest,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  const [proactiveVisible, setProactiveVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(getSessionId());

  const bgLight = lightenHex(primaryColor, 0.92);

  // Show proactive bubble after 8s
  useEffect(() => {
    if (hasOpened) return;
    const t = setTimeout(() => setProactiveVisible(true), 8000);
    return () => clearTimeout(t);
  }, [hasOpened]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setHasOpened(true);
    setProactiveVisible(false);

    // Add initial greeting if no messages yet
    if (messages.length === 0) {
      const greeting =
        welcomeMessage ||
        `Hallo! Ich bin der Assistent von ${businessName}. Wie kann ich dir helfen?`;
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [messages.length, welcomeMessage, businessName]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || leadCaptured) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setErrorMsg(null);

    try {
      const resp = await fetch(`/api/chat/${slug}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: sessionId.current,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (err.error === "rate_limit_ip" || err.error === "rate_limit_monthly") {
          setErrorMsg(err.message || "Der Chat ist gerade nicht verfügbar.");
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                err.message ||
                "Der Chat ist leider gerade nicht verfügbar. Bitte kontaktiere uns direkt.",
            },
          ]);
        } else {
          throw new Error("Fehler beim Laden der Antwort");
        }
        return;
      }

      const data = await resp.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);

      if (data.leadCaptured) {
        setLeadCaptured(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es nochmal.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, leadCaptured, messages, slug]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Determine contrast text color
  const isLightBg = parseInt(primaryColor.replace("#", "").slice(0, 2), 16) > 180;
  const textOnPrimary = isLightBg ? "#1e293b" : "#ffffff";

  return (
    <>
      {/* Proactive bubble */}
      {proactiveVisible && !open && (
        <div
          className="fixed bottom-24 right-6 z-[9998] max-w-[200px] cursor-pointer"
          onClick={handleOpen}
          style={{ animation: "fadeSlideIn 0.4s ease-out" }}
        >
          <div
            className="rounded-2xl rounded-br-sm px-4 py-2 text-sm shadow-lg"
            style={{ backgroundColor: primaryColor, color: textOnPrimary }}
          >
            {welcomeMessage || `Hallo! Kann ich dir helfen?`}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ backgroundColor: primaryColor, color: textOnPrimary }}
        aria-label={open ? "Chat schließen" : "Chat öffnen"}
      >
        {open ? <ChevronDown className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[9998] w-[340px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ maxHeight: "min(520px, calc(100dvh - 120px))" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ backgroundColor: primaryColor, color: textOnPrimary }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {businessName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm leading-tight">{businessName}</div>
                <div className="text-xs opacity-75">Online · antwortet sofort</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Chat schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ backgroundColor: bgLight }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm"
                      : "rounded-bl-sm bg-white shadow-sm text-gray-800"
                  }`}
                  style={
                    msg.role === "user"
                      ? { backgroundColor: primaryColor, color: textOnPrimary }
                      : {}
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Booking CTA after lead captured */}
            {addOnBooking && leadCaptured && onBookingRequest && (
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => { onBookingRequest(); setOpen(false); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor, color: textOnPrimary }}
                >
                  <CalendarDays className="w-4 h-4" />
                  Jetzt Termin buchen
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Booking banner (always visible when add-on active) */}
          {addOnBooking && onBookingRequest && !leadCaptured && (
            <div
              className="px-4 py-2 flex-shrink-0 border-t"
              style={{ backgroundColor: bgLight, borderColor: "#e2e8f0" }}
            >
              <button
                onClick={() => { onBookingRequest(); setOpen(false); }}
                className="flex items-center justify-center gap-2 w-full py-1.5 rounded-lg text-sm font-medium border transition-opacity hover:opacity-80"
                style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: "white" }}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Direkt Termin buchen
              </button>
            </div>
          )}

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 border-t flex-shrink-0 bg-white"
            style={{ borderColor: "#e2e8f0" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={leadCaptured ? "Wir melden uns bald bei dir!" : "Schreib eine Nachricht..."}
              disabled={loading || !!errorMsg || leadCaptured}
              className="flex-1 text-sm outline-none px-3 py-2 rounded-xl border border-gray-200 focus:border-gray-400 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading || !!errorMsg || leadCaptured}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: primaryColor, color: textOnPrimary }}
              aria-label="Senden"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </>
  );
}
