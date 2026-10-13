import type { TextVoice } from "./types";

export const PATINA: TextVoice = {
  id: "patina",
  name: "Patina",
  essence:
    "Pergament, Terrakotta und Serifenkursive — wie ein gut gealtertes Journal.",
  industries: [
    "heilpraktiker",
    "naturheilkunde",
    "osteopathie",
    "yoga",
    "massage",
    "hofladen",
    "naturkosmetik",
    "pilates",
    "hotel",
    "boutique-hotel",
    "boutiquehotel",
    "boardinghouse",
    "lodging",
    "resort",
    "unterkunft",
    "lodge",
    "naturheilpraxis",
    "buchhandlung",
    "bestatter",
    "bestattungen",
  ],
  llmHints: {
    do: [
      "warme, einladende Sprache in der Sie-Form",
      "sinnliche, konkrete Bezüge zu Ort, Material und Atmosphäre statt Marketing-Floskeln",
      "kurze, ruhige Sätze wie ein persönliches Journal",
      "Wortwahl an die tatsächliche Kategorie koppeln (Hotel, Pension, Praxis, Hofladen, Wellness)",
    ],
    dont: [
      "Heilversprechen oder medizinische Diagnosen",
      "Superlative und Ausrufezeichen",
      "Emojis",
      "Heilpraktiker, Osteopathie, Massagepraxis — außer die Kategorie ist tatsächlich Heilkunde oder Wellness",
    ],
  },
};
