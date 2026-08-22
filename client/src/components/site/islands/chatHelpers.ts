/**
 * Reine Hilfsfunktionen für die KI-Chat-Insel (`ChatIsland.tsx`) — bewusst
 * ohne React/DOM-Abhängigkeit, damit sie ohne Rendering getestet werden
 * können. `getOrCreateSessionId` ist die einzige Funktion mit Seiteneffekt
 * (sessionStorage) und dadurch server-sicher (kein `window` während SSR).
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Wie viele Nachrichten maximal im Verlauf gehalten werden — deckt sich mit
 * dem Server-Trim in `server/_core/chatRoutes.ts` (`messages.slice(-15)`). */
export const CHAT_HISTORY_LIMIT = 15;

export const CHAT_FALLBACK_WELCOME = "Hallo! Wie kann ich helfen?";
export const CHAT_ERROR_LOCKED = "Der Chat ist nach der Freischaltung aktiv.";
export const CHAT_ERROR_QUOTA = "Der Chat ist diesen Monat ausgelastet.";
export const CHAT_ERROR_GENERIC =
  "Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es später erneut.";

/**
 * Ordnet einen HTTP-Status der passenden deutschen Fehlermeldung zu.
 * 404/403 → Add-on noch nicht freigeschaltet (Website ohne `addOnAiChat`
 * oder unbekannter Slug, siehe chatRoutes.ts `chat_not_available`). 429 →
 * Monatskontingent erschöpft ODER IP-Rate-Limit (beide vom Server als 429
 * gemeldet). Alles andere (5xx, Netzwerkfehler ohne Status, ...) → generisch.
 */
export function mapChatError(status: number | undefined): string {
  if (status === 404 || status === 403) return CHAT_ERROR_LOCKED;
  if (status === 429) return CHAT_ERROR_QUOTA;
  return CHAT_ERROR_GENERIC;
}

/** Kürzt den Verlauf auf die letzten `CHAT_HISTORY_LIMIT` Nachrichten. */
export function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-CHAT_HISTORY_LIMIT);
}

const SESSION_STORAGE_KEY = "pb_chat_session";

/**
 * Liest die stabile Session-ID aus `sessionStorage` oder legt eine neue an
 * (wie v1 `ChatWidget.tsx`). Gibt `""` zurück, wenn `window`/`sessionStorage`
 * fehlt (SSR über `renderToStaticMarkup` — dort gibt es kein `window`).
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined" || !window.sessionStorage) return "";
  let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}
