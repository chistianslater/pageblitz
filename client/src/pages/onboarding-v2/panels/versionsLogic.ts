import type { VersionTrigger } from "../../../../../server/onboardingV2/versions";

/**
 * Verlauf (2026-09-03): reine Anzeige-Helfer fürs Verlaufs-Panel — ohne
 * React/trpc, damit sie ohne Testharness unit-testbar bleiben.
 */

export const TRIGGER_LABELS: Record<VersionTrigger, string> = {
  generation: "Erstellt",
  chat: "KI-Chat",
  panel: "Panel",
  inline: "Direkt bearbeitet",
  restore: "Wiederhergestellt",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Kompakte deutsche Zeitangabe relativ zu `now`: „gerade eben", „vor 5 Min.", „heute, 09:07", „30.08., 18:30". */
export function formatVersionTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 60_000) return "gerade eben";
  if (diffMs < 60 * 60_000) return `vor ${Math.floor(diffMs / 60_000)} Min.`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) return `heute, ${time}`;
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}., ${time}`;
}

const UNDO_PREFIX = "Rückgängig: ";

export interface UndoButtonState {
  enabled: boolean;
  /** Knopftext: „Rückgängig" — direkt nach einem Rückgängig „Wiederholen". */
  text: "Rückgängig" | "Wiederholen";
  title: string;
}

/**
 * Zustand des Rückgängig-Knopfs aus der Verlaufsliste (jüngster zuerst).
 * Der jüngste Stand ist der aktuelle; ist er selbst ein Rückgängig-Schritt,
 * holt der nächste Klick den davor liegenden Stand zurück — also ein
 * Wiederholen, und so heißt der Knopf dann auch.
 */
export function undoButtonState(
  newestFirst: readonly { trigger: VersionTrigger; label: string }[]
): UndoButtonState {
  if (newestFirst.length < 2) {
    return {
      enabled: false,
      text: "Rückgängig",
      title: "Es gibt noch keinen früheren Stand",
    };
  }
  const latest = newestFirst[0];
  if (latest.trigger === "restore" && latest.label.startsWith(UNDO_PREFIX)) {
    return {
      enabled: true,
      text: "Wiederholen",
      title: `Wiederholen: ${latest.label.slice(UNDO_PREFIX.length)}`,
    };
  }
  return {
    enabled: true,
    text: "Rückgängig",
    title: `Rückgängig: ${latest.label}`,
  };
}
