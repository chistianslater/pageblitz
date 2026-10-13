import type { TextVoice } from "./types";

export const GUSTO: TextVoice = {
  id: "gusto",
  name: "Gusto",
  essence:
    "Espresso-Dunkel, warmes Gold, kursive Serifen — ein Abend in einem Satz.",
  industries: [
    "restaurant",
    "trattoria",
    "weinbar",
    "bar",
    "catering",
    "bistro",
    "cafe",
    "kaffeehaus",
    "pizzeria",
    "pizza",
    "imbiss",
    "kneipe",
    "eiscafe",
    "eiscafé",
    "foodtruck",
    // Imbiss- und Wirtshaus-Vokabular (2026-09-26, Test „Kebabimbiss")
    "doener",
    "kebab",
    "burger",
    "grill",
    "falafel",
    "currywurst",
    "pommes",
    "sushi",
    "gaststaette",
    "lokal",
    "wirtshaus",
    "partyservice",
  ],
  // Gastro-Pack (Restaurant/Bar/Bistro/Catering) — Angebot-Panel startet im
  // Speisekarten-Modus (B4c Task 7, siehe TextVoice.prefersMenu).
  prefersMenu: true,
  llmHints: {
    do: [
      "sinnliche, kurze Sätze",
      "italienische/regionale Begriffe sparsam und korrekt",
      'Preise im Format „16,5" ohne Euro-Zeichen',
    ],
    dont: ["Superlativ-Stapel", 'das Wort "lecker"', "Emojis"],
  },
};
