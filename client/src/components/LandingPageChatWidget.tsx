import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, ArrowRight, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Farben ausschließlich aus den Landing-Tokens (`--lp-*`, client/src/index.css,
 * Brief docs/superpowers/specs/2026-08-23-landing-redesign-brief.md): das
 * Widget wird in LandingPage.tsx innerhalb von `<div class="lp">` gemountet,
 * die Custom Properties erben also auch in die fixed positionierten Teile.
 * Kein Neon-Lime, keine Verläufe, keine dunklen Flächen — Hairlines statt
 * Schatten, ein Grün (Accent #1f5f4b, auf Weiß ≈ 7:1).
 */
const LP = {
  canvas: "var(--lp-canvas)",
  surface: "var(--lp-surface)",
  ink: "var(--lp-ink)",
  muted: "var(--lp-muted)",
  line: "var(--lp-line)",
  accent: "var(--lp-accent)",
  accentInk: "var(--lp-accent-ink)",
} as const;

/**
 * Bewegung komplett in CSS (`.pb-chat-*` in client/src/animations.css) statt
 * framer-motion (B6 Task 8): Dieses Widget war der einzige framer-motion-
 * Konsument der Landingpage — der Async-`LazyMotion`-Loader aus dem Plan hätte
 * das Feature-Set (vendor-motion, ~40 kB gzip) zwar aus dem ersten Paint
 * genommen, aber weiterhin auf "/" geladen; mit CSS-Keyframes für Einblenden,
 * Icon-Wechsel und Tipp-Punkte fällt es auf "/" ganz weg (JS-Budget
 * < 150 kB gzip). Bewusst ohne Exit-Animationen (Sprechblase/Fenster
 * verschwinden sofort) — dafür bräuchte es AnimatePresence-Logik, die den
 * Mehrwert nicht trägt. Das Widget selbst lädt LandingPage.tsx erst nach
 * Idle/Interaktion per `lazy()`.
 */
export default function LandingPageChatWidget() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  // Die Landingpage ist seit dem Studio-Redesign (2026-08-23) immer hell —
  // kein `lp-theme`-Toggle mehr, das Panel hat nur noch die helle Variante.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [proactiveVisible, setProactiveVisible] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const sessionId = useRef<string>(
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("pb_lp_session") ||
          (() => {
            const id =
              Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem("pb_lp_session", id);
            return id;
          })()
      : "anon"
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Proactive bubble after 14 s
  useEffect(() => {
    if (hasOpened) return;
    const t = setTimeout(() => setProactiveVisible(true), 14000);
    return () => clearTimeout(t);
  }, [hasOpened]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const openChat = useCallback(() => {
    setOpen(true);
    setHasOpened(true);
    setProactiveVisible(false);
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! 👋 Ich bin Mika, deine persönliche Beraterin von Pageblitz. Hast du Fragen zu unserer Website-Lösung? Ich helfe dir gerne!",
        },
      ]);
    }
  }, [messages.length]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setErrorMsg(null);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const resp = await fetch("/api/landing-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: sessionId.current,
        }),
      });

      if (resp.status === 429) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content:
              "Du hast heute schon viele Fragen gestellt – komm gerne morgen wieder oder starte direkt kostenlos! 😊",
          },
        ]);
        return;
      }

      if (!resp.ok) throw new Error("server_error");

      const data = (await resp.json()) as {
        content: string;
        leadCaptured: boolean;
      };
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
      if (data.leadCaptured) setLeadCaptured(true);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Ups – da lief etwas schief. Bitte versuche es nochmal! 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, leadCaptured, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Proactive bubble */}
      {proactiveVisible && !open && (
        <button
          onClick={openChat}
          className="pb-chat-pop fixed bottom-24 right-6 z-[9990] max-w-[240px] text-left rounded-2xl px-4 py-3 border cursor-pointer"
          style={{
            background: LP.surface,
            borderColor: LP.line,
            boxShadow: "0 12px 28px -16px rgba(29,26,23,0.35)",
          }}
        >
          <p
            className="text-sm font-medium leading-snug"
            style={{ color: LP.ink }}
          >
            Hast du Fragen zu Pageblitz?
          </p>
          <p className="text-xs mt-0.5" style={{ color: LP.muted }}>
            Ich beantworte sie gerne! 👋
          </p>
        </button>
      )}

      {/* Floating Button */}
      <button
        onClick={() => (open ? setOpen(false) : openChat())}
        className="pb-chat-fab fixed bottom-6 right-6 z-[9991] w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          // Trigger in den Landing-Tokens (Accent-Grün, weiche Tiefe statt Glow).
          background: LP.accent,
          color: LP.accentInk,
          boxShadow: "0 12px 28px -12px rgba(29,26,23,0.5)",
        }}
        aria-label={open ? "Chat schließen" : "Chat öffnen"}
        aria-expanded={open}
        data-open={open ? "true" : "false"}
      >
        <span
          className="pb-chat-fab-icon pb-chat-fab-icon--close"
          aria-hidden="true"
        >
          <X className="w-6 h-6" />
        </span>
        <span
          className="pb-chat-fab-icon pb-chat-fab-icon--open"
          aria-hidden="true"
        >
          <MessageCircle className="w-6 h-6" />
        </span>
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="pb-chat-window fixed bottom-24 right-6 z-[9990] w-[340px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden border"
          style={{
            background: LP.surface,
            borderColor: LP.line,
            color: LP.ink,
            boxShadow: "0 24px 48px -24px rgba(29,26,23,0.35)",
          }}
        >
          {/* Header: Surface, Ink-Text, Hairline darunter — kein farbiger Balken */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 shrink-0 border-b"
            style={{ borderColor: LP.line }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: LP.accent, color: LP.accentInk }}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div
                className="font-semibold text-sm leading-tight"
                style={{ color: LP.ink }}
              >
                Mika · Pageblitz
              </div>
              <div
                className="text-xs flex items-center gap-1.5"
                style={{ color: LP.muted }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: LP.accent }}
                />
                Online · antwortet sofort
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: LP.accent, color: LP.accentInk }
                      : { background: LP.canvas, color: LP.ink }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center"
                  style={{ background: LP.canvas }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="pb-chat-dot w-1.5 h-1.5 rounded-full"
                      style={{
                        background: LP.muted,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CTA-Card (erscheint nach Bot-Empfehlung, Chat bleibt aktiv) */}
            {leadCaptured && (
              <div
                className="pb-chat-rise rounded-xl p-3.5 border text-center"
                style={{ background: LP.canvas, borderColor: LP.line }}
              >
                <p
                  className="text-xs mb-2.5 font-medium"
                  style={{ color: LP.muted }}
                >
                  ✨ Starte jetzt kostenlos – in 3 Minuten live
                </p>
                <button
                  onClick={() => navigate("/start?billing=yearly")}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
                  style={{ background: LP.accent, color: LP.accentInk }}
                >
                  7 Tage gratis – keine Kreditkarte
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {errorMsg && (
              <p
                className="text-xs text-center"
                style={{ color: "var(--lp-warn)" }}
              >
                {errorMsg}
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 border-t flex items-end gap-2 shrink-0"
            style={{ borderColor: LP.line }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Frage stellen…"
              className="flex-1 resize-none text-sm rounded-xl px-3 py-2.5 outline-none border transition-colors min-h-[40px] max-h-[100px] bg-lp-canvas text-lp-ink placeholder:text-lp-muted border-lp-line focus:border-lp-accent"
              style={{ lineHeight: "1.4" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Nachricht senden"
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{ background: LP.accent, color: LP.accentInk }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <a
            href="mailto:hello@pageblitz.de"
            className="block text-center text-[10px] pb-2 transition-colors hover:underline"
            style={{ color: LP.muted }}
          >
            Lieber direkt per E-Mail? hello@pageblitz.de
          </a>
        </div>
      )}
    </>
  );
}
