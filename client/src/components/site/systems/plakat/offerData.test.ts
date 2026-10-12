import { describe, expect, test } from "vitest";
import type { SystemSection } from "../shared";
import {
  galleryGroups,
  lateFigure,
  plakatPhotos,
  rowPrice,
  voiceOf,
} from "./offerData";

const hero = (imageUrl?: string): SystemSection => ({
  type: "hero",
  headline: "X",
  ...(imageUrl ? { imageUrl } : {}),
});
const gallery = (...urls: string[]): SystemSection => ({
  type: "gallery",
  images: urls.map(url => ({ url, alt: "" })),
});
const team = (...urls: (string | undefined)[]): SystemSection => ({
  type: "team",
  members: urls.map((imageUrl, i) => ({
    name: `P${i}`,
    ...(imageUrl ? { imageUrl } : {}),
  })),
});
const process: SystemSection = {
  type: "process",
  steps: [{ title: "Eins" }, { title: "Zwei" }],
};

describe("plakatPhotos: Einstieg → Team → Ablauf → Über uns → Galerie", () => {
  test("jedes Foto einmal; Teamfoto schlägt Galerie, Einstiegsfoto schlägt Team", () => {
    const { list } = plakatPhotos(
      [hero("h"), team("h", "t1", "t1"), gallery("t1", "g1")],
      []
    );
    const t = list.find(s => s.type === "team");
    expect(t?.type === "team" && t.members.map(m => m.imageUrl)).toEqual([
      undefined,
      "t1",
      undefined,
    ]);
    const g = list.find(s => s.type === "gallery");
    expect(g?.type === "gallery" && g.images.map(i => i.url)).toEqual(["g1"]);
  });

  test("Ablauf-Foto aus der Galerie nur, wenn ihr danach zwei bleiben", () => {
    expect(
      plakatPhotos([hero(), process, gallery("a", "b")], []).processPhoto
    ).toBeUndefined();
    const r = plakatPhotos([hero(), process, gallery("a", "b", "c")], []);
    expect(r.processPhoto).toBe("a");
    const g = r.list.find(s => s.type === "gallery");
    expect(g?.type === "gallery" && g.images.map(i => i.url)).toEqual([
      "b",
      "c",
    ]);
  });

  test("ausgeblendetes Über-uns-Foto hält kein Galeriefoto zurück", () => {
    const about = (imageUrl: string): SystemSection => ({ type: "about", body: "x", imageUrl });
    const s = [hero(), process, about("a"), gallery("a", "b", "c", "d")];
    expect(plakatPhotos(s, []).processPhoto).toBe("b");
    expect(plakatPhotos(s, ["about-media"]).processPhoto).toBe("a");
  });

  test("ausgeblendetes Einstiegsfoto zählt nicht als beansprucht", () => {
    const { list } = plakatPhotos([hero("h"), gallery("h")], ["hero-media"]);
    expect(list.some(s => s.type === "gallery")).toBe(true);
  });
});

describe("galleryGroups: Pille, Bogen, liegende Pille", () => {
  test("nie ein Foto allein, außer es gibt nur eins", () => {
    expect(galleryGroups(0)).toEqual([]);
    expect(galleryGroups(1)).toEqual([1]);
    expect(galleryGroups(2)).toEqual([2]);
    expect(galleryGroups(3)).toEqual([3]);
    expect(galleryGroups(4)).toEqual([2, 2]);
    expect(galleryGroups(7)).toEqual([3, 2, 2]);
    expect(galleryGroups(9)).toEqual([3, 3, 3]);
  });
});

describe("rowPrice: nur Preise aus den Daten", () => {
  test("Zahl → große Preiszeile, Tausender und Spanne bleiben wie geschrieben", () => {
    expect(rowPrice("28")).toEqual({ big: "28 €" });
    expect(rowPrice("1.200 €")).toEqual({ big: "1.200 €" });
    expect(rowPrice("25–35 €")).toEqual({ big: "25–35 €" });
    expect(rowPrice("ab 7,50 €")).toEqual({ big: "ab 7,50 €" });
  });
  test("langer Preistext bleibt klein (würde bei 320 px überlaufen)", () => {
    expect(rowPrice("ab 1.200 € zzgl. Anfahrt und Material")).toEqual({
      note: "ab 1.200 € zzgl. Anfahrt und Material",
    });
    expect(rowPrice("1 Std. 50 €")).toEqual({ note: "1 Std. 50 €" });
    expect(rowPrice("ab 12.500,00 €")).toEqual({ note: "ab 12.500,00 €" });
  });
  test("Text ohne lesbaren Preis → kleine Zeile, leer → nichts", () => {
    expect(rowPrice("auf Anfrage")).toEqual({ note: "auf Anfrage" });
    expect(rowPrice("  ")).toBeUndefined();
    expect(rowPrice(undefined)).toBeUndefined();
  });
});

describe("lateFigure", () => {
  test("späteste Schließzeit nach Mitternacht als Ziffer", () => {
    expect(
      lateFigure([
        { day: "Mo", hours: "11:00 – 24:00" },
        { day: "Fr", hours: "11:00 – 2:00" },
      ])
    ).toBe("02:00");
    expect(lateFigure([{ day: "Mo", hours: "10:00 – 19:00" }])).toBeUndefined();
  });
});

describe("voiceOf: Zitat, Sterne nur bei 5", () => {
  test("Sterne nur, wenn die gewählte Bewertung 5 trägt", () => {
    const five = voiceOf([
      {
        author: "Timo R.",
        text: "Schnell, sauber und freundlich. Bester Fade seit Jahren.",
        rating: 5,
      },
    ]);
    expect(five?.stars).toBe(true);
    const none = voiceOf([
      {
        author: "Timo R.",
        text: "Schnell, sauber und freundlich. Bester Fade seit Jahren.",
      },
    ]);
    expect(none?.stars).toBe(false);
    expect(none?.text).toBe(
      "Schnell, sauber und freundlich. Bester Fade seit Jahren."
    );
  });
  test("Sterne von genau der zitierten Bewertung (gleicher Autor, anderer Text)", () => {
    const v = voiceOf([
      { author: "Timo R.", text: "Gut.", rating: 4 },
      { author: "Timo R.", text: "Schnell, sauber und freundlich. Bester Fade seit Jahren.", rating: 5 },
    ]);
    expect(v?.stars).toBe(true);
    const w = voiceOf([
      { author: "Timo R.", text: "Schnell, sauber und freundlich. Bester Fade seit Jahren." },
      { author: "Timo R.", text: "Kurz.", rating: 5 },
    ]);
    expect(w?.stars).toBe(false);
  });
  test("Anführungszeichen aus dem Text fallen weg (setzt das Markup)", () => {
    expect(
      voiceOf([
        { author: "A", text: "„Um eins noch warm, knusprig und riesig.“" },
      ])?.text
    ).toBe("Um eins noch warm, knusprig und riesig.");
  });
});
