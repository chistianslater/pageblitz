import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Send, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(sessionStorage.getItem("pb_support_session") || crypto.randomUUID());

  useEffect(() => {
    sessionStorage.setItem("pb_support_session", sessionId.current);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    setMsgCount((c) => c + 1);

    try {
      const res = await fetch("/api/support-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, sessionId: sessionId.current }),
      });

      if (res.status === 429) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Du hast das Nachrichtenlimit erreicht. Bitte schreibe uns direkt eine E-Mail." }]);
        setShowTicketForm(true);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      if (data.showSupportForm) setShowTicketForm(true);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Verbindungsfehler. Bitte versuche es erneut." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendTicket = async () => {
    if (!ticketEmail.trim() || !ticketMessage.trim()) return;
    setTicketLoading(true);
    try {
      await fetch("/api/support-chat/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ticketName.trim(),
          email: ticketEmail.trim(),
          message: ticketMessage.trim(),
          chatHistory: messages,
          page: window.location.pathname,
        }),
      });
      setTicketSent(true);
    } catch {
      setTicketSent(true);
    } finally {
      setTicketLoading(false);
    }
  };

  const autoEscalate = msgCount >= 5 && !showTicketForm;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[9980] w-12 h-12 rounded-full bg-slate-700 border border-slate-600 shadow-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
            aria-label="Hilfe"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[9981] w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-80px)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-lime-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold leading-tight">Hilfe & Support</div>
                  <div className="text-slate-400 text-xs">Frag mich alles zu Pageblitz</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {showTicketForm && !ticketSent ? (
              /* Ticket form */
              <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
                <button onClick={() => setShowTicketForm(false)} className="flex items-center gap-1 text-slate-400 hover:text-white text-xs transition-colors self-start">
                  <ArrowLeft className="w-3 h-3" /> Zurück zum Chat
                </button>
                <h3 className="text-white text-sm font-semibold">Direkt an unser Team schreiben</h3>
                <p className="text-slate-400 text-xs">Wir melden uns schnellstmöglich bei dir.</p>
                <input
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                  placeholder="Dein Name (optional)"
                  className="bg-slate-800 border border-slate-600 text-white text-sm px-3 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:border-lime-500 transition-colors"
                />
                <input
                  value={ticketEmail}
                  onChange={(e) => setTicketEmail(e.target.value)}
                  placeholder="Deine E-Mail-Adresse *"
                  type="email"
                  required
                  className="bg-slate-800 border border-slate-600 text-white text-sm px-3 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:border-lime-500 transition-colors"
                />
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Beschreibe dein Anliegen... *"
                  rows={4}
                  required
                  className="bg-slate-800 border border-slate-600 text-white text-sm px-3 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:border-lime-500 transition-colors resize-none"
                />
                <button
                  onClick={sendTicket}
                  disabled={!ticketEmail.trim() || !ticketMessage.trim() || ticketLoading}
                  className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-40"
                >
                  {ticketLoading ? "Wird gesendet..." : "Nachricht senden"}
                </button>
              </div>
            ) : ticketSent ? (
              /* Ticket confirmation */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-lime-500/20 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-lime-400" />
                </div>
                <h3 className="text-white font-semibold">Nachricht gesendet!</h3>
                <p className="text-slate-400 text-sm">Wir melden uns so schnell wie möglich bei dir.</p>
                <button
                  onClick={() => { setTicketSent(false); setShowTicketForm(false); }}
                  className="text-slate-400 hover:text-white text-xs mt-2 transition-colors"
                >
                  Zurück zum Chat
                </button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center pt-8 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-lime-500/10 flex items-center justify-center mx-auto">
                        <HelpCircle className="w-6 h-6 text-lime-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium mb-1">Wie kann ich dir helfen?</p>
                        <p className="text-slate-500 text-xs">Frag mich zu Layouts, Bildern, Preisen, Add-Ons...</p>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          "Wie lade ich mein Logo hoch?",
                          "Was kosten die Add-Ons?",
                          "Kann ich meine Farben ändern?",
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="block w-full text-left text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-3 py-2 rounded-lg transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-lime-500 text-gray-900 rounded-br-sm"
                            : "bg-slate-800 text-slate-200 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Auto-escalation hint */}
                {autoEscalate && (
                  <div className="px-4 pb-2">
                    <button
                      onClick={() => setShowTicketForm(true)}
                      className="w-full text-xs text-lime-400 hover:text-lime-300 bg-lime-500/10 border border-lime-500/20 rounded-lg py-2 transition-colors"
                    >
                      Nicht die richtige Antwort? Direkt an unser Team schreiben
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="shrink-0 px-3 py-3 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Deine Frage..."
                      disabled={loading}
                      className="flex-1 bg-slate-800 text-white text-sm px-3 py-2.5 rounded-xl placeholder-slate-500 outline-none border border-slate-700 focus:border-lime-500 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="w-10 h-10 rounded-xl bg-lime-500 hover:bg-lime-400 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                    >
                      {loading ? <Loader2 className="w-4 h-4 text-gray-900 animate-spin" /> : <Send className="w-4 h-4 text-gray-900" />}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="w-full text-slate-500 hover:text-slate-300 text-[10px] mt-2 transition-colors text-center"
                  >
                    Lieber direkt an den Support schreiben?
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
