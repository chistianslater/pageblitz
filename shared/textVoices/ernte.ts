import type { TextVoice } from "./types";

export const ERNTE: TextVoice = {
  id: "ernte",
  name: "Ernte",
  essence:
    "Cremepapier, tiefes Indigo und Honig-Formen — ein handgezeichnetes Kochbuch im Food-Magazin.",
  industries: [
    "feinkost",
    "delikatessen",
    "manufaktur",
    "naturkost",
    "bioladen",
    "unverpackt",
    "kaffeeroesterei",
    "kaffeerösterei",
    "roesterei",
    "rösterei",
    "imkerei",
    "honig",
    "teeladen",
    "confiserie",
    "schokoladenmanufaktur",
    "marmeladenmanufaktur",
    "senfmanufaktur",
    "brennerei",
  ],
  prefersMenu: true,
  llmHints: {
    do: [
      "warme, appetitliche Sprache mit Handwerksstolz",
      "Herkunft, Zutaten und kleine Chargen konkret benennen",
      "kurze Versal-Headlines plus eine emotionale Script-Zeile",
    ],
    dont: ["Industrie-Sprache", "Superlative", "Emojis"],
  },
};
