import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Send, Loader2, User, MousePointer, Check, X, Eye, Type, Crosshair, Undo2, HelpCircle, ChevronRight } from "lucide-react";
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

// Section type → actual DOM id
const SECTION_DOM_ID: Record<string, string> = {
  gallery:   "galerie",
  menu:      "speisekarte",
  pricelist: "preise",
};
function getDomId(type: string): string { return SECTION_DOM_ID[type] ?? type; }

const DOM_ID_TO_SECTION: Record<string, string> = {
  galerie: "gallery", speisekarte: "menu", preise: "pricelist",
};

// ── Inline-edit helpers ───────────────────────────────────────────────────────
// Keys we never want to make editable (technical/non-content fields)
const SKIP_KEYS = new Set([
  "id", "type", "icon", "rating", "step", "href", "url", "src",
  "layoutStyle", "colorScheme", "designTokens", "heroImage", "aboutImageUrl",
  "slug", "impressumHtml", "datenschutzHtml", "hasLegalPages",
  "seoTitle", "seoDescription", "hiddenSections",
]);

/** Normalize text for comparison: collapse whitespace, trim */
function normalizeText(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

/** Walk `data` and return the dot/bracket path to the first string that
 *  matches `text` (exact, whitespace-normalized, or whitespace-stripped). */
function findFieldPath(data: any, text: string, path = ""): string | null {
  if (typeof data === "string") {
    const a = normalizeText(data);
    const b = normalizeText(text);
    // 1. Exact or whitespace-normalized match
    if (a === b) return path || ".";
    // 2. Stripped whitespace match (handles split-span headlines like "Dein Fest,UnserGenuss")
    if (a.replace(/\s/g, "") === b.replace(/\s/g, "") && a.length > 3) return path || ".";
    return null;
  }
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const r = findFieldPath(data[i], text, `${path}[${i}]`);
      if (r !== null) return r;
    }
    return null;
  }
  if (typeof data === "object" && data !== null) {
    for (const key of Object.keys(data)) {
      if (SKIP_KEYS.has(key)) continue;
      const r = findFieldPath(data[key], text, path ? `${path}.${key}` : key);
      if (r !== null) return r;
    }
  }
  return null;
}

/** Return a deep clone of `data` with the value at `path` set to `value`. */
function updateFieldAtPath(data: any, path: string, value: string): any {
  const clone = JSON.parse(JSON.stringify(data));
  const parts = path.split(/[.\[\]]/).filter(Boolean);
  let cur: any = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    cur = /^\d+$/.test(p) ? cur[parseInt(p)] : cur[p];
  }
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) cur[parseInt(last)] = value;
  else cur[last] = value;
  return clone;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: "assistant" | "user";
  content: string;
  pending?: boolean;
  proposedData?: any;
  confirmed?: boolean;
}

interface Props {
  websiteId: number;
  websiteData: WebsiteData;
  colorScheme: ColorScheme | undefined;
  website: any;
  business: any;
  onUpdate: () => void;
}

type PreviewMode = "select" | "inline";

// ── Highlight for section-select mode ────────────────────────────────────────
function usePreviewHighlight(sectionId: string | null) {
  useEffect(() => {
    const id = "pb-editor-highlight";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
    const domId = sectionId ? getDomId(sectionId) : null;
    el.textContent = domId
      ? `#${domId} { outline: 3px solid #3b82f6 !important; outline-offset: -3px !important; }`
      : "";
    return () => { if (el) el.textContent = ""; };
  }, [sectionId]);
}

// ── Hover CSS for inline-edit mode ────────────────────────────────────────────
function useInlineHoverStyle(active: boolean) {
  useEffect(() => {
    const id = "pb-inline-hover";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
    el.textContent = active ? `
      .pb-preview-inner h1:not([contenteditable="true"]):hover,
      .pb-preview-inner h2:not([contenteditable="true"]):hover,
      .pb-preview-inner h3:not([contenteditable="true"]):hover,
      .pb-preview-inner h4:not([contenteditable="true"]):hover,
      .pb-preview-inner p:not([contenteditable="true"]):hover,
      .pb-preview-inner span:not([contenteditable="true"]):hover,
      .pb-preview-inner a:not([contenteditable="true"]):hover,
      .pb-preview-inner button:not([contenteditable="true"]):hover,
      .pb-preview-inner li:not([contenteditable="true"]):hover {
        outline: 2px dashed rgba(245,158,11,0.55) !important;
        outline-offset: 2px !important;
        cursor: text !important;
      }
      .pb-preview-inner [contenteditable="true"] {
        outline: 2px solid #f59e0b !important;
        outline-offset: 2px !important;
        background: rgba(245,158,11,0.06) !important;
        cursor: text !important;
        min-width: 4px;
      }
      .pb-preview-inner h1[contenteditable="true"],
      .pb-preview-inner h2[contenteditable="true"],
      .pb-preview-inner h3[contenteditable="true"],
      .pb-preview-inner h4[contenteditable="true"],
      .pb-preview-inner h5[contenteditable="true"],
      .pb-preview-inner h6[contenteditable="true"],
      .pb-preview-inner span[contenteditable="true"],
      .pb-preview-inner a[contenteditable="true"],
      .pb-preview-inner button[contenteditable="true"],
      .pb-preview-inner li[contenteditable="true"] {
        white-space: nowrap !important;
        display: inline-block !important;
      }
    ` : "";
    return () => { if (el) el.textContent = ""; };
  }, [active]);
}

// ── Tutorial overlay ──────────────────────────────────────────────────────────
const TUTORIAL_KEY = "pb_editor_tutorial_v1";
const TUTORIAL_STEPS = [
  {
    icon: "✦",
    title: "KI-Modus",
    body: "Wähle eine Sektion über die Chips oder klicke direkt in die Vorschau — dann beschreibe der KI im Chat, was du ändern möchtest.",
    highlight: "select",
  },
  {
    icon: "T",
    title: "Text-Modus",
    body: "Schalte oben auf [T Text] um und klicke direkt auf jeden Text in der Vorschau. Ein Cursor öffnet sich — bearbeite direkt, Enter zum Speichern.",
    highlight: "inline",
  },
  {
    icon: "↩",
    title: "Undo",
    body: "Jede Änderung wird gespeichert. Mit dem Pfeil-Zurück-Button oben kannst du Schritte rückgängig machen (bis zu 20 Schritte).",
    highlight: "undo",
  },
];

function EditorTutorial({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const s = TUTORIAL_STEPS[step];
  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
      <div className="bg-slate-800 border border-slate-600/60 rounded-2xl p-6 mx-4 max-w-xs w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">
            {s.icon}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Schritt {step + 1} / {TUTORIAL_STEPS.length}</p>
            <p className="text-white font-semibold text-sm">{s.title}</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed mb-5">{s.body}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? "bg-blue-400" : "bg-slate-600"}`} />
            ))}
          </div>
          <button
            onClick={() => isLast ? onClose() : setStep(s => s + 1)}
            className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {isLast ? "Los geht's!" : "Weiter"} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const HISTORY_MAX = 20;

export default function ContentEditorSplitView({
  websiteId, websiteData, colorScheme, website, business, onUpdate,
}: Props) {
  const [localData, setLocalData] = useState<WebsiteData>(websiteData);
  const [previewingProposal, setPreviewingProposal] = useState(false);
  const savedDataRef = useRef<WebsiteData>(websiteData);
  const localDataRef = useRef<WebsiteData>(websiteData);

  // Undo history: array of past states, most recent last
  const historyRef = useRef<WebsiteData[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem(TUTORIAL_KEY));
  const closeTutorial = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setShowTutorial(false);
  }, []);

  // Sync when parent re-fetches
  useEffect(() => {
    if (!previewingProposal) {
      setLocalData(websiteData);
      savedDataRef.current = websiteData;
      localDataRef.current = websiteData;
    }
  }, [websiteData, previewingProposal]);

  useEffect(() => { localDataRef.current = localData; }, [localData]);

  /** Push current state onto undo stack before applying a change */
  const pushHistory = useCallback((snapshot: WebsiteData) => {
    historyRef.current = [...historyRef.current, snapshot].slice(-HISTORY_MAX);
    setCanUndo(true);
  }, []);

  // Forward ref so handleUndo can call confirmMutation before it's defined
  const confirmMutateRef = useRef<(data: WebsiteData) => void>(() => {});

  /** Undo last saved change */
  const handleUndo = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    historyRef.current = history.slice(0, -1);
    setCanUndo(historyRef.current.length > 0);
    setLocalData(prev);
    savedDataRef.current = prev;
    localDataRef.current = prev;
    setPreviewingProposal(false);
    confirmMutateRef.current(prev);
    onUpdate();
  }, [onUpdate]);

  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Ich bin dein Website-Editor. Klicke auf einen Bereich in der Vorschau oder wähle eine Sektion aus — dann sage mir, was du ändern möchtest.",
  }]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("select");

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track element currently being inline-edited
  const inlineActiveRef = useRef<{ el: HTMLElement; path: string; original: string } | null>(null);

  usePreviewHighlight(previewMode === "select" ? selectedSection : null);
  useInlineHoverStyle(previewMode === "inline");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── tRPC mutations ──────────────────────────────────────────────────────────
  const applyMutation = trpc.customer.applyAiEdit.useMutation({
    onSuccess: (result) => {
      if (result.mode === "chat") {
        setMessages(msgs => [...msgs.filter(m => !m.pending), { role: "assistant", content: result.aiMessage }]);
      } else if (result.mode === "suggest") {
        setLocalData(result.proposedData as WebsiteData);
        localDataRef.current = result.proposedData as WebsiteData;
        setPreviewingProposal(true);
        setMessages(msgs => [...msgs.filter(m => !m.pending), {
          role: "assistant", content: result.aiMessage, proposedData: result.proposedData,
        }]);
      } else {
        const newData = (result as any).updatedData as WebsiteData;
        if (newData) {
          pushHistory(savedDataRef.current);
          setLocalData(newData); savedDataRef.current = newData; localDataRef.current = newData;
        }
        setPreviewingProposal(false);
        onUpdate();
        setMessages(msgs => [...msgs.filter(m => !m.pending), { role: "assistant", content: `✓ ${result.aiMessage}` }]);
      }
    },
    onError: (err) => {
      setMessages(msgs => [...msgs.filter(m => !m.pending), { role: "assistant", content: `Fehler: ${err.message || "Bitte versuche es nochmal."}` }]);
    },
  });

  const confirmMutation = trpc.customer.confirmAiEdit.useMutation({
    onSuccess: (result) => {
      const newData = (result as any).updatedData as WebsiteData;
      if (newData) { setLocalData(newData); savedDataRef.current = newData; localDataRef.current = newData; }
      setPreviewingProposal(false);
      onUpdate();
    },
  });

  // Wire forward ref after mutation is defined
  useEffect(() => {
    confirmMutateRef.current = (data: WebsiteData) =>
      confirmMutation.mutate({ websiteId, proposedData: data });
  });

  const handleAccept = useCallback((msgIndex: number, proposedData: any) => {
    pushHistory(savedDataRef.current);
    setMessages(msgs => msgs.map((m, i) => i === msgIndex ? { ...m, confirmed: true } : m));
    confirmMutation.mutate({ websiteId, proposedData });
  }, [websiteId, confirmMutation, pushHistory]);

  const handleReject = useCallback((msgIndex: number) => {
    setMessages(msgs => msgs.map((m, i) => i === msgIndex ? { ...m, confirmed: false } : m));
    setLocalData(savedDataRef.current);
    localDataRef.current = savedDataRef.current;
    setPreviewingProposal(false);
  }, []);

  // ── Inline editing ──────────────────────────────────────────────────────────
  /** Finish an active inline edit: save if text changed */
  const finishInlineEdit = useCallback((entry: { el: HTMLElement; path: string; original: string }) => {
    const newText = (entry.el.textContent ?? "").trim();
    entry.el.contentEditable = "false";
    inlineActiveRef.current = null;

    if (newText === entry.original || newText === "") {
      // No change or cleared — restore original
      entry.el.textContent = entry.original;
      return;
    }

    pushHistory(localDataRef.current);
    const newData = updateFieldAtPath(localDataRef.current, entry.path, newText);
    setLocalData(newData as WebsiteData);
    savedDataRef.current = newData as WebsiteData;
    localDataRef.current = newData as WebsiteData;
    confirmMutateRef.current(newData as WebsiteData);
    onUpdate();
  }, [websiteId, onUpdate, pushHistory]);

  /** Activate inline editing on a specific element */
  const activateInlineEdit = useCallback((el: HTMLElement, path: string, text: string) => {
    inlineActiveRef.current = { el, path, original: text };
    el.contentEditable = "true";

    requestAnimationFrame(() => {
      el.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (_) { /* ignore selection errors */ }
    });

    const onBlur = () => {
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("keydown", onKeyDown);
      setTimeout(() => {
        if (inlineActiveRef.current?.el === el) finishInlineEdit(inlineActiveRef.current);
      }, 0);
    };
    const onKeyDown = (ke: KeyboardEvent) => {
      if (ke.key === "Enter" && !ke.shiftKey) {
        ke.preventDefault();
        el.blur();
      }
      // Space activates button elements by default — prevent that so the user can type spaces
      if (ke.key === " " && el.tagName === "BUTTON") {
        ke.preventDefault();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(" ");
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
      if (ke.key === "Escape") {
        el.textContent = text;
        el.contentEditable = "false";
        el.removeEventListener("blur", onBlur);
        el.removeEventListener("keydown", onKeyDown);
        inlineActiveRef.current = null;
      }
    };
    el.addEventListener("blur", onBlur);
    el.addEventListener("keydown", onKeyDown);
  }, [finishInlineEdit]);

  /** Native click handler for inline-edit mode (attached via useEffect, not React event) */
  const inlineClickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  useEffect(() => {
    inlineClickHandlerRef.current = (e: MouseEvent) => {
      // Skip form inputs
      const directTarget = e.target as HTMLElement | null;
      if (!directTarget) return;
      const tag0 = directTarget.tagName;
      if (tag0 === "INPUT" || tag0 === "TEXTAREA" || tag0 === "SELECT") return;

      const TEXT_TAGS = new Set(["h1","h2","h3","h4","h5","h6","p","span","a","li","button","label","strong","em","small"]);

      // Use elementsFromPoint to collect ALL elements at the click coordinate,
      // ordered from topmost (visually on top) to bottommost.
      // This bypasses hero gradient/overlay divs that would otherwise intercept e.target.
      const allEls = document.elementsFromPoint(e.clientX, e.clientY);

      // Find the .pb-preview-inner container so we only consider elements inside it
      const previewInner = previewScrollRef.current?.querySelector(".pb-preview-inner");
      if (!previewInner) return;

      // Build candidate list: text-tag elements inside the preview
      const candidates: HTMLElement[] = [];
      for (const el of allEls) {
        if (!(el instanceof HTMLElement)) continue;
        if (!previewInner.contains(el)) continue;
        if (!TEXT_TAGS.has(el.tagName.toLowerCase())) continue;
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") continue;
        candidates.push(el);
      }

      // Try each candidate (innermost/topmost first) to find one that maps to a data field
      for (const el of candidates) {
        if (el === inlineActiveRef.current?.el) return; // clicking the active element

        // Own direct text nodes only (avoids matching a container that concatenates children)
        const ownText = Array.from(el.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent ?? "")
          .join("")
          .trim();

        const fullText = (el.textContent ?? "").trim();

        // Prefer own text (leaf); fallback to full text (handles e.g. <a><span>text</span></a>)
        const textsToTry = ownText.length >= 2
          ? [ownText, fullText]
          : fullText.length >= 2 ? [fullText] : [];

        for (const text of textsToTry) {
          if (text.length < 2) continue;
          const path = findFieldPath(localDataRef.current, text);
          if (path) {
            if (inlineActiveRef.current) finishInlineEdit(inlineActiveRef.current);
            activateInlineEdit(el, path, text);
            return;
          }
        }
      }
    };
  }, [activateInlineEdit, finishInlineEdit]);

  // Attach/detach native click listener based on mode
  useEffect(() => {
    const container = previewScrollRef.current;
    if (!container || previewMode !== "inline") return;
    const handler = (e: MouseEvent) => inlineClickHandlerRef.current?.(e);
    container.addEventListener("click", handler);
    return () => container.removeEventListener("click", handler);
  }, [previewMode]);

  // ── Section select mode ─────────────────────────────────────────────────────
  const selectSection = useCallback((sectionType: string) => {
    const meta = SECTION_META[sectionType];
    if (!meta) return;
    setSelectedSection(sectionType);
    const domId = getDomId(sectionType);
    const scrollEl = previewScrollRef.current;
    if (scrollEl) {
      const inner = scrollEl.querySelector(`#${domId}`) as HTMLElement | null;
      if (inner) {
        const containerRect = scrollEl.getBoundingClientRect();
        const elRect = inner.getBoundingClientRect();
        const scrollOffset = scrollEl.scrollTop + (elRect.top - containerRect.top) - 60;
        scrollEl.scrollTo({ top: Math.max(0, scrollOffset), behavior: "smooth" });
      }
    }
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const handlePreviewClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sectionTypes = Object.keys(SECTION_META);
    const allDomIds = new Set([...sectionTypes, ...Object.keys(DOM_ID_TO_SECTION)]);
    const resolveId = (domId: string): string => DOM_ID_TO_SECTION[domId] ?? domId;
    let target = e.target as HTMLElement | null;
    while (target) {
      if (target.id && allDomIds.has(target.id)) { selectSection(resolveId(target.id)); return; }
      target = target.parentElement;
    }
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    for (const el of els) {
      if (el instanceof HTMLElement && el.id && allDomIds.has(el.id)) { selectSection(resolveId(el.id)); return; }
    }
  }, [selectSection]);

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

  // Switch modes: finish any active inline edit
  const switchMode = useCallback((mode: PreviewMode) => {
    if (inlineActiveRef.current) finishInlineEdit(inlineActiveRef.current);
    setPreviewMode(mode);
    if (mode === "select") setSelectedSection(null);
  }, [finishInlineEdit]);

  const sectionChips = (websiteData?.sections as any[] | undefined)
    ?.filter(s => SECTION_META[s.type])
    ?.map(s => ({ type: s.type, ...SECTION_META[s.type] })) ?? [];

  return (
    <div className="flex gap-3" style={{ height: "calc(100vh - 220px)", minHeight: 560 }}>

      {/* ── Left: Chat panel ─────────────────────────────────────────────── */}
      <div className="w-[38%] flex flex-col bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden flex-shrink-0 relative">

        {/* Tutorial overlay */}
        {showTutorial && <EditorTutorial onClose={closeTutorial} />}

        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2 flex-shrink-0">
          <span className="text-blue-400 text-base">✦</span>
          <span className="text-white font-semibold text-sm">KI-Inhaltseditor</span>

          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Letzte Änderung rückgängig machen"
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Tutorial re-open */}
          <button
            onClick={() => setShowTutorial(true)}
            title="Hilfe anzeigen"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors flex-shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {selectedSection && previewMode === "select" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex-shrink-0">
              📍 {SECTION_META[selectedSection]?.label}
            </span>
          )}
        </div>

        {sectionChips.length > 0 && (
          <div className="px-3 py-2 border-b border-slate-700/30 flex-shrink-0 flex flex-wrap gap-1.5">
            {sectionChips.map(s => (
              <button key={s.type} onClick={() => { switchMode("select"); selectSection(s.type); }} title={s.hint}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  selectedSection === s.type && previewMode === "select"
                    ? "bg-blue-500/25 border-blue-500/60 text-blue-200"
                    : "bg-slate-700/40 border-slate-600/40 text-slate-400 hover:text-white hover:border-slate-500"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {previewMode === "inline" ? (
            <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-500/10 rounded-xl px-3 py-2.5 border border-amber-500/20">
              <Type className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Klicke direkt auf einen Text in der Vorschau, um ihn zu bearbeiten. <strong className="text-amber-300">Enter</strong> zum Speichern, <strong className="text-amber-300">Esc</strong> zum Abbrechen.</span>
            </div>
          ) : (
            !selectedSection && messages.length <= 1 && (
              <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-700/20 rounded-xl px-3 py-2.5 border border-slate-700/30">
                <MousePointer className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
                <span>Klicke auf einen Bereich in der Vorschau rechts, um ihn auszuwählen</span>
              </div>
            )
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
                  msg.pending ? "bg-slate-700/40 text-slate-500"
                  : msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-slate-700/60 text-slate-200 rounded-bl-sm"
                }`}>
                  {msg.pending ? (
                    <span className="flex gap-1 items-center h-4">
                      {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </span>
                  ) : (
                    msg.content.split("**").map((part, j) =>
                      j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : <span key={j}>{part}</span>
                    )
                  )}
                </div>
                {msg.proposedData && msg.confirmed === undefined && (
                  <div className="flex gap-1.5 pl-1">
                    <button onClick={() => handleAccept(i, msg.proposedData)} disabled={confirmMutation.isPending}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
                      <Check className="w-3 h-3" /> Übernehmen
                    </button>
                    <button onClick={() => handleReject(i)} disabled={confirmMutation.isPending}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-700/40 border border-slate-600/40 text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                      <X className="w-3 h-3" /> Verwerfen
                    </button>
                  </div>
                )}
                {msg.proposedData && msg.confirmed === true && <span className="pl-1 text-xs text-emerald-400">✓ Übernommen</span>}
                {msg.proposedData && msg.confirmed === false && <span className="pl-1 text-xs text-slate-500">Verworfen</span>}
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

        <div className="p-3 border-t border-slate-700/50 flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder={selectedSection ? `${SECTION_META[selectedSection]?.label} bearbeiten…` : "Was soll ich ändern?"}
              disabled={applyMutation.isPending}
              className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:border-blue-500 outline-none placeholder-slate-500 disabled:opacity-60 min-w-0"
            />
            <button onClick={handleSend} disabled={!input.trim() || applyMutation.isPending}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors">
              {applyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-slate-600 text-xs text-center">Enter zum Senden · Sektion in Vorschau anklicken</p>
        </div>
      </div>

      {/* ── Right: Preview ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden min-w-0">

        {/* Browser bar + mode toggle */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3 flex-shrink-0">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 bg-slate-700/60 rounded-lg px-3 py-1 text-slate-400 text-xs font-mono truncate">
            {website.slug}.pageblitz.de
          </div>

          {previewingProposal ? (
            <span className="flex items-center gap-1 text-xs text-amber-400 flex-shrink-0">
              <Eye className="w-3 h-3" /> Vorschau
            </span>
          ) : (
            /* Mode toggle */
            <div className="flex items-center rounded-lg overflow-hidden border border-slate-600/50 flex-shrink-0">
              <button
                onClick={() => switchMode("select")}
                title="Sektion auswählen für KI-Chat"
                className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors ${
                  previewMode === "select"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}>
                <Crosshair className="w-3 h-3" />
                <span className="hidden sm:inline">KI</span>
              </button>
              <button
                onClick={() => switchMode("inline")}
                title="Texte direkt bearbeiten"
                className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors ${
                  previewMode === "inline"
                    ? "bg-amber-500/80 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}>
                <Type className="w-3 h-3" />
                <span className="hidden sm:inline">Text</span>
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto relative" ref={previewScrollRef}>
          <div className="pb-preview-inner" style={{ zoom: 0.75, contain: "layout" }}>
            <WebsiteRenderer
              websiteData={localData}
              colorScheme={colorScheme}
              heroImageUrl={website.heroImageUrl || undefined}
              aboutImageUrl={(website as any).aboutImageUrl || undefined}
              layoutStyle={(website as any).layoutStyle || undefined}
              layoutVersion={(website as any)?.layoutVersion ?? undefined}
              slug={website.slug}
            />
          </div>

          {/* Overlay: only in select mode — captures section clicks.
              In inline mode there is NO overlay so clicks reach the actual elements. */}
          {previewMode === "select" && (
            <div
              className="absolute inset-0 cursor-crosshair"
              style={{ zIndex: 50 }}
              onClick={handlePreviewClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
