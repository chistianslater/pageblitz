import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ArrowRight, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRIMARY = "#a3e635"; // Pageblitz neon lime

export default function LandingPageChatWidget() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
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
          const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
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

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const resp = await fetch("/api/landing-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId: sessionId.current }),
      });

      if (resp.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Du hast heute schon viele Fragen gestellt – komm gerne morgen wieder oder starte direkt kostenlos! 😊",
          },
        ]);
        return;
      }

      if (!resp.ok) throw new Error("server_error");

      const data = (await resp.json()) as { content: string; leadCaptured: boolean };
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      if (data.leadCaptured) setLeadCaptured(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ups – da lief etwas schief. Bitte versuche es nochmal! 🙏" },
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
      <AnimatePresence>
        {proactiveVisible && !open && (
          <motion.button
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            onClick={openChat}
            className="fixed bottom-24 right-6 z-[9990] max-w-[240px] text-left rounded-2xl px-4 py-3 shadow-xl border border-white/10 backdrop-blur-sm cursor-pointer"
            style={{ background: "rgba(20,20,30,0.95)" }}
          >
            <p className="text-white text-sm font-medium leading-snug">
              Hast du Fragen zu Pageblitz?
            </p>
            <p className="text-white/50 text-xs mt-0.5">Ich beantworte sie gerne! 👋</p>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => (open ? setOpen(false) : openChat())}
        className="fixed bottom-6 right-6 z-[9991] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-gray-900 transition-all"
        style={{ background: PRIMARY, boxShadow: `0 8px 32px ${PRIMARY}60` }}
        aria-label="Chat öffnen"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-6 z-[9990] w-[340px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: "#111118" }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 shrink-0"
              style={{ background: PRIMARY }}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">Mika · Pageblitz</div>
                <div className="text-white/70 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  Online · antwortet sofort
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0"
              style={{ background: "#111118" }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-white/8 text-white/90 rounded-bl-sm"
                    }`}
                    style={msg.role === "user" ? { background: PRIMARY } : {}}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/40"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA-Card (erscheint nach Bot-Empfehlung, Chat bleibt aktiv) */}
              {leadCaptured && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-3.5 border text-center"
                  style={{ background: `${PRIMARY}18`, borderColor: `${PRIMARY}40` }}
                >
                  <p className="text-white/70 text-xs mb-2.5 font-medium">✨ Starte jetzt kostenlos – in 3 Minuten live</p>
                  <button
                    onClick={() => navigate("/start?billing=yearly")}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm font-semibold text-gray-900 transition-all hover:brightness-110 active:scale-95"
                    style={{ background: PRIMARY }}
                  >
                    7 Tage gratis – keine Kreditkarte
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {errorMsg && (
                <p className="text-red-400 text-xs text-center">{errorMsg}</p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 border-t border-white/8 flex items-end gap-2 shrink-0"
              style={{ background: "#111118" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Frage stellen…"
                className="flex-1 resize-none bg-white/8 text-white text-sm placeholder-white/30 rounded-xl px-3 py-2.5 outline-none border border-white/10 focus:border-white/25 transition-colors min-h-[40px] max-h-[100px]"
                style={{ lineHeight: "1.4" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                style={{ background: PRIMARY }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <a
              href="mailto:hello@pageblitz.de"
              className="block text-center text-white/30 hover:text-white/60 text-[10px] mt-1.5 transition-colors"
            >
              Lieber direkt per E-Mail? hello@pageblitz.de
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
