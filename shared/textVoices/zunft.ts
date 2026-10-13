import type { TextVoice } from "./types";

export const ZUNFT: TextVoice = {
  id: "zunft",
  name: "Zunft",
  essence:
    "Tiefes Bordeaux, Siegel-Gold, klassische Serifen — Tradition, die man schmeckt.",
  industries: [
    "baeckerei",
    "konditorei",
    "metzgerei",
    "fleischerei",
    "brauerei",
    "weingut",
    "brennerei",
    "hofkaese",
    "schuhmacher",
    "aenderungsschneiderei",
    "änderungsschneiderei",
    "schneiderei",
  ],
  // Gastro-Pack (Bäckerei/Konditorei/Metzgerei — Produkte über Theke/
  // Vitrine) — Angebot-Panel startet im Speisekarten-Modus (B4c Task 7,
  // siehe TextVoice.prefersMenu).
  prefersMenu: true,
  llmHints: {
    do: [
      "traditionsbewusste, konkrete Sprache (Zutaten, Handwerkstechnik, Generationen)",
      "kurze, stolze Sätze wie ein Zunftbrief",
      "regionale und handwerkliche Begriffe korrekt verwenden",
    ],
    dont: [
      "Superlative und Ausrufezeichen",
      "Emojis",
      "Bio- oder Gesundheits-Heilsversprechen ohne Beleg",
    ],
  },
};
