/**
 * Winziger Event-Bus für die gegenseitige Exklusivität der Fab-Panels
 * (KI-Chat, Terminbuchung): beide teilen sich denselben Fixpunkt unten
 * rechts (`.pb-island--fab`, siehe islandsCss.ts) — offen gleichzeitig
 * überlappen sich ihre Panels. `main.tsx` mountet jede Insel als eigenen
 * React-Root (`createRoot` je `data-island`-Knoten) — es gibt keinen
 * gemeinsamen React-Kontext, über den sie sonst voneinander wüssten, daher
 * `window`-CustomEvent statt eines In-Memory-Emitters.
 */
const EVENT_NAME = "pb-island:open";

export type IslandName = "chat" | "booking";

interface IslandOpenDetail {
  island: IslandName;
}

/** Meldet, dass die angegebene Insel ihr Panel geöffnet hat. */
export function notifyIslandOpened(island: IslandName): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<IslandOpenDetail>(EVENT_NAME, { detail: { island } })
  );
}

/**
 * Ruft `onOtherIslandOpened`, sobald eine ANDERE Insel als `island` öffnet.
 * Gibt eine Cleanup-Funktion zurück (direkt als `useEffect`-Rückgabewert
 * nutzbar). Ohne `window` (SSR über renderToStaticMarkup) ein No-Op mit
 * No-Op-Cleanup.
 */
export function subscribeToOtherIslandOpen(
  island: IslandName,
  onOtherIslandOpened: () => void
): () => void {
  if (typeof window === "undefined") return () => {};
  function handler(event: Event): void {
    const detail = (event as CustomEvent<IslandOpenDetail>).detail;
    if (detail && detail.island !== island) onOtherIslandOpened();
  }
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
