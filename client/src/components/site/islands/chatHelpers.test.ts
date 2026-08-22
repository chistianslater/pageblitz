import { afterEach, describe, expect, test } from "vitest";
import {
  CHAT_ERROR_GENERIC,
  CHAT_ERROR_LOCKED,
  CHAT_ERROR_QUOTA,
  getOrCreateSessionId,
  mapChatError,
  trimHistory,
  type ChatMessage,
} from "./chatHelpers";

describe("mapChatError", () => {
  test("404 → Freischaltungs-Hinweis", () => {
    expect(mapChatError(404)).toBe(CHAT_ERROR_LOCKED);
  });

  test("403 → Freischaltungs-Hinweis", () => {
    expect(mapChatError(403)).toBe(CHAT_ERROR_LOCKED);
  });

  test("429 → Kontingent-Hinweis", () => {
    expect(mapChatError(429)).toBe(CHAT_ERROR_QUOTA);
  });

  test("500 → generische Fehlermeldung", () => {
    expect(mapChatError(500)).toBe(CHAT_ERROR_GENERIC);
  });

  test("undefined (z. B. Netzwerkfehler ohne Response) → generische Fehlermeldung", () => {
    expect(mapChatError(undefined)).toBe(CHAT_ERROR_GENERIC);
  });
});

describe("trimHistory", () => {
  function buildMessages(count: number): ChatMessage[] {
    return Array.from({ length: count }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Nachricht ${i}`,
    }));
  }

  test("lässt kürzere Verläufe unverändert", () => {
    const messages = buildMessages(5);
    expect(trimHistory(messages)).toEqual(messages);
  });

  test("kürzt auf die letzten 15 Nachrichten", () => {
    const messages = buildMessages(20);
    const trimmed = trimHistory(messages);
    expect(trimmed).toHaveLength(15);
    expect(trimmed[0]).toEqual(messages[5]);
    expect(trimmed[14]).toEqual(messages[19]);
  });

  test("leerer Verlauf bleibt leer", () => {
    expect(trimHistory([])).toEqual([]);
  });
});

/**
 * Minimaler `sessionStorage`-Ersatz für die Tests: `vitest.config.ts` läuft
 * mit `environment: "node"` (kein jsdom) — es gibt also standardmäßig gar
 * kein globales `window`. Das deckt sich mit dem SSR-Fall (renderToStaticMarkup
 * hat auch kein `window`) und wird unten gezielt für den "im Browser"-Fall
 * gestellt.
 */
class MemorySessionStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("getOrCreateSessionId", () => {
  afterEach(() => {
    // @ts-expect-error – Test-Stub wieder entfernen, node-Umgebung hat kein window
    delete globalThis.window;
  });

  test("liefert '' ohne window (SSR über renderToStaticMarkup)", () => {
    expect(getOrCreateSessionId()).toBe("");
  });

  test("legt bei erstem Aufruf eine neue ID an und speichert sie", () => {
    // @ts-expect-error – minimaler window-Stub nur für diesen Test
    globalThis.window = { sessionStorage: new MemorySessionStorage() };
    const id = getOrCreateSessionId();
    expect(id).toMatch(/^[a-z0-9]+$/i);
    expect(window.sessionStorage.getItem("pb_chat_session")).toBe(id);
  });

  test("liefert bei wiederholtem Aufruf dieselbe ID (stabil pro Tab-Session)", () => {
    // @ts-expect-error – minimaler window-Stub nur für diesen Test
    globalThis.window = { sessionStorage: new MemorySessionStorage() };
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();
    expect(second).toBe(first);
  });
});
