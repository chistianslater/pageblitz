import type { TextVoice } from "./types";

export const SCHIMMER: TextVoice = {
  id: "schimmer",
  name: "Lichtlabor",
  essence:
    "Editoriale Präzision, Makrofotografie und warmes Karmin — Beauty ohne Klischees.",
  industries: [
    "kosmetikstudio",
    "kosmetik",
    "nagelstudio",
    "wellness",
    "spa",
    "aesthetik",
    "wimpern",
    "sonnenstudio",
    "juwelier",
    "goldschmiede",
    "modegeschaeft",
    "modegeschäft",
    "hochzeitsplaner",
  ],
  llmHints: {
    do: [
      "warm, präzise und erwachsen statt verspielt",
      "Ich-Perspektive der Behandlung (was die Kundin erlebt)",
      "Behandlungsablauf, Dauer, Preis und verwendete Produkte konkret benennen",
    ],
    dont: [
      "Heilversprechen oder medizinische Wirkaussagen",
      "Vorher-Nachher-Übertreibungen",
      "Fachjargon ohne Erklärung",
      "Rosa-Wellness-Klischees, Perlmutt-Orbs oder Glassmorphism",
    ],
  },
};
