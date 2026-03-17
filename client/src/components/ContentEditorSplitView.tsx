import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Send, Loader2, User, MousePointer, Check, X } from "lucide-react";
import WebsiteRenderer from "./WebsiteRenderer";
import type { WebsiteData, ColorScheme } from "@shared/types";

// ── Section metadata ──────────────────────────────────────────────────────────
const SECTION_META: Record<string, { label: string; hint: string }> = {
  hero:         { label: "Hero",           hint: "Überschrift, Slogan, CTA-Button" },
  about:        { label: "Über uns",       hint: "Text, Beschreibung, Story" },
  services:     { label: "Leistungen",     hint: "Services, Icons, Beschreibungen" },
  features:     { label: "Leistungen",     hint: "Services, Icons, Beschreibungen" },
  testimonials: { label: "Kundenstimmen",  hint: "Bewertungen, Namen, Texte" },
  process:      { label: "Prozess",        hint: "Schritte, Titel, Beschreibungen" },
  gallery:      { label: "Galerie",        hint: "Überschrift" },
  contact:      { label: "Kontakt",        hint: "Überschrift, Anleitung" },
  cta:          { label: "Call-to-Action", hint: "Headline, Button-Text" },
  menu:         { label: "Speisekarte",    hint: "Kategorien, Gerichte, Preise" },
  pricelist:    { label: "Preisliste",     hint: "Kategorien, Leistungen, Preise" },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: "assistant" | "user";
  content: string;
  pending?: boolean;
  // For suggest-mode: holds proposed data waiting for confirmation
  proposedData?: any;
  confirmed?: boolean; // true = accepted, false = rejected, undefined = pending decision
}

interface Props {
  websiteId: number;
  websiteData: WebsiteData;
  colorScheme: ColorScheme | undefined;
  website: any;
  business: any;
  onUpdate: () => void;
}

// ── Highlight style injector ──────────────────────────────────────────────────
function usePreviewHighlight(sectionId: string | null, previewKey: number) {
  useEffect(() => {
    const id = "pb-editor-highlight";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = sectionId
      ? `#${sectionId} { outline: 3px solid #3b82f6 !important; outline-offset: -3px !important; }`
      : "";
    return () => { if (el) el.textContent = ""; };
  }, [sectionId, previewKey]);
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ContentEditorSplitView({
  websiteId, websiteData, colorScheme, website, business, onUpdate,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Ich bin dein Website-Editor. Klicke auf einen Bereich in der Vorschau oder wähle eine Sektion aus — dann sage mir, was du ändern möchtest.",
  }]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [previewKey, setPreviewKey] = useState(0);

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  usePreviewHighlight(selectedSection, previewKey);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const applyMutation = trpc.customer.applyAiEdit.useMutation({
    onSuccess: (result) => {
      if (result.mode === "suggest") {
        // Show suggestion with confirm/reject buttons
        setMessages(msgs => [
          ...msgs.filter(m => !m.pending),
          {
            role: "assistant",
            content: result.aiMessage,
            proposedData: result.proposedData,
          },
        ]);
      } else {
        // Direct apply
        onUpdate();
        setPreviewKey(k => k + 1);
        setMessages(msgs => [
          ...msgs.filter(m => !m.pending),
          { role: "assistant", content: `✓ ${result.aiMessage}` },
        ]);
      }
    },
    onError: (err) => {
      setMessages(msgs => [
        ...msgs.filter(m => !m.pending),
        { role: "assistant", content: `Fehler: ${err.message || "Bitte versuche es nochmal."}` },
      ]);
    },
  });

  const confirmMutation = trpc.customer.confirmAiEdit.useMutation({
    onSuccess: () => {
      onUpdate();
      setPreviewKey(k => k + 1);
    },
  });

  // Accept a suggestion
  const handleAccept = useCallback((msgIndex: number, proposedData: any) => {
    setMessages(msgs => msgs.map((m, i) =>
      i === msgIndex ? { ...m, confirmed: true } : m
    ));
    confirmMutation.mutate({ websiteId, proposedData });
  }, [websiteId, confirmMutation]);

  // Reject a suggestion
  const handleReject = useCallback((msgIndex: number) => {
    setMessages(msgs => msgs.map((m, i) =>
      i === msgIndex ? { ...m, confirmed: false } : m
    ));
  }, []);

  // Select a section — scroll preview + update badge (no chat message)
  const selectSection = useCallback((sectionId: string) => {
    const meta = SECTION_META[sectionId];
    if (!meta) return;
    setSelectedSection(sectionId);

    // Scroll preview to section using getBoundingClientRect (works correctly with CSS zoom)
    const scrollEl = previewScrollRef.current;
    if (scrollEl) {
      const inner = scrollEl.querySelector(`#${sectionId}`) as HTMLElement | null;
      if (inner) {
        const containerRect = scrollEl.getBoundingClientRect();
        const elRect = inner.getBoundingClientRect();
        const scrollOffset = scrollEl.scrollTop + (elRect.top - containerRect.top) - 60;
        scrollEl.scrollTo({ top: Math.max(0, scrollOffset), behavior: "smooth" });
      }
    }

    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // Click detection on preview overlay
  const handlePreviewClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sectionIds = Object.keys(SECTION_META);

    // Walk up DOM from click target to find a section id
    let target = e.target as HTMLElement | null;
    while (target) {
      if (target.id && sectionIds.includes(target.id)) {
        selectSection(target.id);
        return;
      }
      target = target.parentElement;
    }

    // Fallback via elementsFromPoint
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    for (const el of els) {
      if (el instanceof HTMLElement && el.id && sectionIds.includes(el.id)) {
        selectSection(el.id);
        return;
      }
    }
  }, [selectSection]);

  // Send message to AI
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || applyMutation.isPending) return;

    const prefix = selectedSection
      ? `[Bearbeite Sektion: ${SECTION_META[selectedSection]?.label || selectedSection}] `
      : "";

    setMessages(msgs => [
      ...msgs,
      { role: "user", content: text },
      { role: "assistant", content: "...", pending: true },
    ]);
    setInput("");

    applyMutation.mutate({ websiteId, userMessage: prefix + text });
  }, [input, selectedSection, applyMutation, websiteId]);

  // Section chips from websiteData
  const sectionChips = (websiteData?.sections as any[] | undefined)
    ?.filter(s => SECTION_META[s.type])
    ?.map(s => ({ type: s.type, ...SECTION_META[s.type] })) ?? [];

  return (
    <div className="flex gap-3" style={{ height: "calc(100vh - 220px)", minHeight: 560 }}>

      {/* ── Left: Chat panel ─────────────────────────────────────────────── */}
      <div className="w-[38%] flex flex-col bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden flex-shrink-0">

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2 flex-shrink-0">
          <span className="text-blue-400 text-base">✦</span>
          <span className="text-white font-semibold text-sm">KI-Inhaltseditor</span>
          {selectedSection && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex-shrink-0">
              📍 {SECTION_META[selectedSection]?.label}
            </span>
          )}
        </div>

        {/* Section chips */}
        {sectionChips.length > 0 && (
          <div className="px-3 py-2 border-b border-slate-700/30 flex-shrink-0 flex flex-wrap gap-1.5">
            {sectionChips.map(s => (
              <button
                key={s.type}
                onClick={() => selectSection(s.type)}
                title={s.hint}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  selectedSection === s.type
                    ? "bg-blue-500/25 border-blue-500/60 text-blue-200"
                    : "bg-slate-700/40 border-slate-600/40 text-slate-400 hover:text-white hover:border-slate-500"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {!selectedSection && messages.length <= 1 && (
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-700/20 rounded-xl px-3 py-2.5 border border-slate-700/30">
              <MousePointer className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
              <span>Klicke auf einen Bereich in der Vorschau rechts, um ihn auszuwählen</span>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-400" style={{ fontSize: 9 }}>✦</span>
                </div>
              )}
              <div className="max-w-[88%] flex flex-col gap-1.5">
                <div className={`text-sm leading-relaxed px-3 py-2 rounded-2xl ${
                  msg.pending
                    ? "bg-slate-700/40 text-slate-500"
                    : msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-700/60 text-slate-200 rounded-bl-sm"
                }`}>
                  {msg.pending ? (
                    <span className="flex gap-1 items-center h-4">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : (
                    msg.content.split("**").map((part, j) =>
                      j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : <span key={j}>{part}</span>
                    )
                  )}
                </div>

                {/* Suggestion confirm/reject buttons */}
                {msg.proposedData && msg.confirmed === undefined && (
                  <div className="flex gap-1.5 pl-1">
                    <button
                      onClick={() => handleAccept(i, msg.proposedData)}
                      disabled={confirmMutation.isPending}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" /> Übernehmen
                    </button>
                    <button
                      onClick={() => handleReject(i)}
                      disabled={confirmMutation.isPending}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-700/40 border border-slate-600/40 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                    >
                      <X className="w-3 h-3" /> Verwerfen
                    </button>
                  </div>
                )}
                {msg.proposedData && msg.confirmed === true && (
                  <span className="pl-1 text-xs text-emerald-400">✓ Übernommen</span>
                )}
                {msg.proposedData && msg.confirmed === false && (
                  <span className="pl-1 text-xs text-slate-500">Verworfen</span>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-5 h-5 rounded-full bg-slate-600/80 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-2.5 h-2.5 text-slate-300" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-700/50 flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder={
                selectedSection
                  ? `${SECTION_META[selectedSection]?.label} bearbeiten…`
                  : "Was soll ich ändern?"
              }
              disabled={applyMutation.isPending}
              className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:border-blue-500 outline-none placeholder-slate-500 disabled:opacity-60 min-w-0"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || applyMutation.isPending}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            >
              {applyMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
          <p className="text-slate-600 text-xs text-center">Enter zum Senden · Sektion in Vorschau anklicken</p>
        </div>
      </div>

      {/* ── Right: Preview ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden min-w-0">

        {/* Browser bar */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 bg-slate-700/60 rounded-lg px-3 py-1 text-slate-400 text-xs font-mono truncate">
            {website.slug}.pageblitz.de
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
            <MousePointer className="w-3 h-3" />
            <span className="hidden sm:inline">Anklicken zum Auswählen</span>
          </div>
        </div>

        {/* Preview + click overlay */}
        <div className="flex-1 overflow-auto relative" ref={previewScrollRef}>
          <div key={previewKey} style={{ zoom: 0.75, contain: "layout" }}>
            <WebsiteRenderer
              websiteData={websiteData}
              colorScheme={colorScheme}
              heroImageUrl={website.heroImageUrl || undefined}
              aboutImageUrl={(website as any).aboutImageUrl || undefined}
              layoutStyle={(website as any).layoutStyle || undefined}
              businessPhone={business?.phone || undefined}
              businessAddress={business?.address || undefined}
              businessEmail={business?.email || undefined}
              slug={website.slug}
              contactFormLocked={false}
            />
          </div>

          {/* Transparent overlay captures clicks, passes them to handlePreviewClick */}
          <div
            className="absolute inset-0 cursor-crosshair"
            style={{ zIndex: 50 }}
            onClick={handlePreviewClick}
          />
        </div>
      </div>
    </div>
  );
}
