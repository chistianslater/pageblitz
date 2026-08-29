import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CHAT_FALLBACK_WELCOME,
  getOrCreateSessionId,
  mapChatError,
  trimHistory,
  type ChatMessage,
} from "./chatHelpers";
import { copySiteCssVars } from "./copySiteCssVars";
import { trapTabKey } from "./focusTrap";
import { notifyIslandOpened, subscribeToOtherIslandOpen } from "./islandEvents";

const ICON_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

function IconMessage(): React.ReactElement {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function IconClose(): React.ReactElement {
  return (
    <svg {...ICON_PROPS}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function IconSend(): React.ReactElement {
  return (
    <svg {...ICON_PROPS}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function ChatFabButton({
  disabled,
  open,
  panelId,
  triggerRef,
  onClick,
}: {
  disabled?: boolean;
  open?: boolean;
  panelId?: string;
  triggerRef?: React.Ref<HTMLButtonElement>;
  onClick?: () => void;
}): React.ReactElement {
  return (
    <button
      ref={triggerRef}
      type="button"
      className="pb-island-fab-btn pb-island-chat-fab"
      aria-label="Chat"
      aria-expanded={disabled ? undefined : open}
      aria-controls={disabled ? undefined : panelId}
      aria-disabled={disabled ? true : undefined}
      disabled={disabled}
      title={disabled ? "In der Vorschau nicht aktiv" : undefined}
      onClick={onClick}
    >
      {open ? <IconClose /> : <IconMessage />}
      <span className="pb-island-sr-only">Chat</span>
    </button>
  );
}

/**
 * KI-Chat-Insel: runder Button unten rechts öffnet ein klassisches
 * Chatfenster (Avatar-Header, Sprechblasen, Composer) gegen die bestehende
 * v1-Route `POST /api/chat/:slug/message` (unverändert, Body
 * `{ messages, sessionId }`, Antwort `{ content, leadCaptured }`).
 *
 * Client-only Widget: `client/src/site-islands/main.tsx` hydratisiert per
 * `createRoot` (nicht `hydrateRoot`) — das SSR-Markup (geschlossener Button +
 * `hidden`-Panel) dient nur dem flackerfreien ersten Bild und dem No-JS-Fall,
 * React übernimmt danach komplett neu, ein Hydration-Mismatch ist dadurch
 * ausgeschlossen.
 *
 * `businessName`/`welcomeMessage` kommen sowohl als normale Props (SSR +
 * `createRoot` direkt nach dem Rendern) als auch redundant als
 * `data-business-name`/`data-welcome`-Attribute auf dem Insel-Wurzelknoten
 * an (siehe `SiteIslands.tsx`) — Letztere liest `main.tsx` beim Hydrieren
 * aus, weil dort keine `WebsiteDataV2`/DB-Daten zur Verfügung stehen,
 * sondern nur das DOM.
 *
 * `disabled` (gesetzt von `SiteIslands` im CSR-Vorschau-Modus, siehe
 * `mode`-Prop dort): rendert nur den ausgegrauten Button, nie den Dialog —
 * verhindert echte `fetch`-Aufrufe gegen `/api/chat/:slug/message` aus
 * internen Vorschau-Bildschirmen (Dashboard/Editor), die dieselbe
 * Insel-Komponente client-seitig rendern wie die echte Kundenseite.
 *
 * Gegenseitiger Ausschluss mit `BookingIsland`: beide Panels teilen sich
 * denselben Fixpunkt unten rechts. `islandEvents.ts` meldet über ein
 * `window`-CustomEvent, wenn diese Insel öffnet; ist diese Insel offen und
 * die ANDERE Insel öffnet, schließt sie sich selbst (`closePanel`, inkl.
 * Fokus-Rückgabe an den eigenen Fab-Button).
 *
 * Das Panel wird nach `document.body` portaliert und verliert dadurch die
 * Pack-Tokens von `.pb-site` — `copySiteCssVars` legt sie als Inline-Style
 * auf das Fenster, plus Fallback-Schrift in `chatCss.ts`.
 */
export const ChatIsland: React.FC<{
  slug: string;
  businessName?: string;
  welcomeMessage?: string;
  disabled?: boolean;
}> = ({ slug, businessName, welcomeMessage, disabled = false }) => {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(getOrCreateSessionId);
  const [siteVars] = useState<Record<string, string>>(() => copySiteCssVars());
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const greeting = welcomeMessage || CHAT_FALLBACK_WELCOME;
  const title = businessName ? `Chat mit ${businessName}` : "Chat";

  // Beim Öffnen die Begrüßung als erste Assistenten-Nachricht einfügen
  // (nur einmal) und die Eingabe fokussieren.
  useEffect(() => {
    if (!open) return;
    setMessages(prev =>
      prev.length === 0 ? [{ role: "assistant", content: greeting }] : prev
    );
    inputRef.current?.focus();
  }, [open, greeting]);

  // Immer zur neuesten Nachricht scrollen.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages, busy]);

  // Schließt das Panel und gibt den Fokus an den auslösenden Fab-Button
  // zurück — sonst fällt der Fokus beim Schließen (Escape/X) auf
  // `document.body` und geht für Tastatur-/Screenreader-Nutzung verloren.
  function closePanel(): void {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function openPanel(): void {
    notifyIslandOpened("chat");
    setOpen(true);
  }

  // Escape schließt das Panel.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") closePanel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Schließt dieses Panel, sobald die Buchungs-Insel öffnet (gegenseitiger
  // Ausschluss, siehe islandEvents.ts) — nur abonniert, solange dieses Panel
  // selbst offen ist.
  useEffect(() => {
    if (!open) return;
    return subscribeToOtherIslandOpen("chat", closePanel);
  }, [open]);

  async function sendMessage(): Promise<void> {
    const text = input.trim();
    if (!text || busy) return;
    const nextHistory = trimHistory([
      ...messages,
      { role: "user", content: text },
    ]);
    setMessages(nextHistory);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/${slug}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory, sessionId }),
      });
      if (!res.ok) {
        setError(mapChatError(res.status));
        return;
      }
      const data = await res.json().catch(() => null);
      const content =
        typeof data?.content === "string"
          ? data.content
          : mapChatError(undefined);
      setMessages(prev =>
        trimHistory([...prev, { role: "assistant", content }])
      );
    } catch {
      setError(mapChatError(undefined));
    } finally {
      setBusy(false);
    }
  }

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    if (event.key === "Enter") {
      event.preventDefault();
      void sendMessage();
    }
  }

  const panel = (
    <div
      id={panelId}
      className="pb-island-panel pb-island-chat-panel"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      hidden={!open}
      style={siteVars as React.CSSProperties}
      onKeyDown={event => trapTabKey(event, event.currentTarget)}
    >
      <div className="pb-island-chat-header">
        <span className="pb-island-chat-avatar">
          <IconMessage />
        </span>
        <div className="pb-island-chat-header-text">
          <span className="pb-island-chat-title">{title}</span>
          <span className="pb-island-chat-status">
            <span className="pb-island-chat-status-dot" />
            Online
          </span>
        </div>
        <button
          type="button"
          className="pb-island-chat-close"
          onClick={closePanel}
          aria-label="Schließen"
        >
          <IconClose />
        </button>
      </div>
      <div
        className="pb-island-chat-body"
        role="log"
        aria-live="polite"
        ref={bodyRef}
      >
        {messages.map((msg, i) => (
          <p key={i} className={`pb-island-msg pb-island-msg--${msg.role}`}>
            {msg.content}
          </p>
        ))}
        {busy && (
          <p
            className="pb-island-msg pb-island-msg--assistant pb-island-msg--busy"
            aria-label="schreibt"
          >
            <span className="pb-island-chat-dots" aria-hidden="true">
              <span className="pb-island-chat-dot" />
              <span className="pb-island-chat-dot" />
              <span className="pb-island-chat-dot" />
            </span>
          </p>
        )}
      </div>
      {error && (
        <p className="pb-island-status" data-state="error" role="alert">
          {error}
        </p>
      )}
      <div className="pb-island-chat-composer">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Nachricht schreiben…"
          disabled={busy}
          aria-label="Nachricht an den Chat"
        />
        <button
          type="button"
          className="pb-island-chat-send"
          onClick={() => void sendMessage()}
          disabled={busy || !input.trim()}
          aria-label="Nachricht senden"
        >
          <IconSend />
        </button>
      </div>
    </div>
  );

  if (disabled) {
    return <ChatFabButton disabled />;
  }

  return (
    <>
      <ChatFabButton
        open={open}
        panelId={panelId}
        triggerRef={triggerRef}
        onClick={() => (open ? closePanel() : openPanel())}
      />
      {/*
        Portal statt verschachteltem Kind: `.pb-island--fab` (der Wurzelknoten
        dieser Insel, siehe SiteIslands.tsx) ist `position:fixed` und bekommt
        dadurch selbst einen eigenen Stacking-Context. Ein `z-index` auf dem
        Panel würde darin nur GEGEN den eigenen Button gewinnen, nicht gegen
        eine spätere Insel (z. B. die Terminbuchung) mit ihrem eigenen
        `.pb-island--fab`-Stacking-Context — bei gleichem z-index gewinnt dort
        schlicht die spätere DOM-Position, und deren Fab-Button würde das
        offene Chat-Panel überdecken und Klicks abfangen. Als Kind von
        `document.body` konkurriert das Panel stattdessen im selben
        (Root-)Stacking-Context wie alle `.pb-island--fab`-Wurzeln, wo sein
        höheres `z-index` (siehe islandsCss.ts) zuverlässig gewinnt. Ohne
        `document` (SSR über renderToStaticMarkup) bleibt das Panel inline —
        dort ist es ohnehin nur `hidden`-Markup ohne Interaktion.
      */}
      {typeof document !== "undefined"
        ? createPortal(panel, document.body)
        : panel}
    </>
  );
};
