import type { TextVoice } from "./types";

export const MORGENLICHT: TextVoice = {
  id: "morgenlicht",
  name: "Morgenlicht",
  essence:
    "Warmes Morgenlicht, Naturmaterialien und ruhige Serifentypografie — Praxisgefühl wie Premium-Wellness.",
  industries: [
    "zahnarzt",
    "arzt",
    "physiotherapie",
    // GMB/SEO-Kategorie heißt „Physiotherapeut" — ohne diesen Eintrag fiel
    // die Branche in den Fallback-Pool (Abgleich 2026-08-29).
    "physiotherapeut",
    "ergotherapie",
    "logopaedie",
    "psychotherapie",
    "hebamme",
    "pflege",
    "tierarzt",
    "apotheke",
    "optiker",
    "hoerakustiker",
    "hörakustiker",
    "sanitaetshaus",
    "sanitätshaus",
    "podologie",
    "zahntechnik",
    "tagesmutter",
    "tagespflege",
  ],
  llmHints: {
    do: [
      "warm und beruhigend",
      "Patienten-Perspektive (Sie-Form)",
      "konkrete Entlastung benennen (Angst nehmen, erklären, Zeit)",
    ],
    dont: [
      "Fachjargon ohne Erklärung",
      "Dringlichkeit oder Druck",
      "Heilversprechen",
    ],
  },
};
