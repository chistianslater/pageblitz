import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CHAT_FALLBACK_WELCOME,
  getOrCreateSessionId,
  mapChatError,
  trimHistory,
  type ChatMessage,
} from "./chatHelpers";

/**
 * KI-Chat-Insel: schwebender Button unten rechts öffnet ein Panel mit
 * Verlauf + Eingabe, das gegen die bestehende v1-Route
 * `POST /api/chat/:slug/message` chattet (unverändert, Body
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
 */
export const ChatIsland: React.FC<{
  slug: string;
  businessName?: string;
  welcomeMessage?: string;
}> = ({ slug, businessName, welcomeMessage }) => {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(getOrCreateSessionId);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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

  // Escape schließt das Panel.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
      className="pb-island-panel"
      role="dialog"
      aria-label={title}
      hidden={!open}
    >
      <div className="pb-island-panel-header">
        <span>{title}</span>
        <button
          type="button"
          className="pb-island-panel-close"
          onClick={() => setOpen(false)}
        >
          Schließen
        </button>
      </div>
      <div
        className="pb-island-panel-body"
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
            aria-hidden="true"
          >
            …
          </p>
        )}
      </div>
      {error && (
        <p className="pb-island-status" data-state="error" role="alert">
          {error}
        </p>
      )}
      <div className="pb-island-panel-input-row">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Deine Nachricht…"
          disabled={busy}
          aria-label="Nachricht an den Chat"
        />
        <button
          type="button"
          className="pb-island-panel-send"
          onClick={() => void sendMessage()}
          disabled={busy || !input.trim()}
        >
          Senden
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="pb-island-fab-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
      >
        Chat
      </button>
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
