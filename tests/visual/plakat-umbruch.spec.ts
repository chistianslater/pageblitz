import { test, expect, type Page } from "@playwright/test";

/**
 * Plakat-Umbruch (2026-10-13): große Zeile und Kapitel-Titel brechen nur
 * zwischen Wörtern, laufen nie über, und die Staffel stellt kein kurzes Wort
 * allein neben lange Zeilen („MASSARBEIT / AUS / HOLZ. PUNKT."). Gemessen im
 * Browser mit der echten League Gothic auf 320, 390 und 1440 px.
 */
const WIDTHS = [320, 390, 1440] as const;

const PREVIEW = "/dev/site-preview?system=plakat&pack=werkbank&fixture=full";
const PAGES: { name: string; url: string; even: boolean }[] = [
  // Fixture des Betreibers: „Massarbeit aus Holz. Punkt." (Schreinerei).
  { name: "Schreinerei-Fixture", url: PREVIEW, even: true },
  {
    name: "Maßarbeit",
    url: `${PREVIEW}&headline=${encodeURIComponent("Maßarbeit aus Holz. Punkt.")}`,
    even: true,
  },
  // Wie die Barbier-Seiten live: letzte Zeile läuft kurz aus, das ist erlaubt.
  {
    name: "Barbier live",
    url: `${PREVIEW}&headline=${encodeURIComponent("Herrenfriseur in der Remigiusstraße, Borken.")}`,
    even: true,
  },
  {
    name: "Showcase Zahnarzt",
    url: "/demo/system/plakat/zahnarzt?live=1",
    even: true,
  },
  {
    name: "Showcase Restaurant",
    url: "/demo/system/plakat/restaurant?live=1",
    even: true,
  },
  {
    name: "Showcase Barbier",
    url: "/demo/system/plakat/barbier?live=1",
    even: true,
  },
  {
    name: "Showcase Hersteller",
    url: "/demo/system/plakat/hersteller?live=1",
    even: true,
  },
  // Lange Wörter: Schrift wird kleiner, bricht aber nie im Wort.
  {
    name: "Langes Wort ohne Foto",
    url:
      `${PREVIEW}&ohnefoto=1&headline=${encodeURIComponent("Steuerberatungsgesellschaft am Markt")}` +
      `&kapitel=${encodeURIComponent("Steuerberatungsgesellschaft")}`,
    even: false,
  },
  // Riesenliste und große Stimme mit langen Wörtern.
  {
    name: "Lange Leistung und Stimme",
    url:
      `${PREVIEW}&leistung=${encodeURIComponent("Treppenrenovierung")}` +
      `&stimme=${encodeURIComponent("Steuerberatungsgesellschaft und Schreinerei: absolut empfehlenswert.")}`,
    even: false,
  },
  {
    name: "Lange Stimme",
    url: `${PREVIEW}&stimme=${encodeURIComponent(
      "Unsere Wohnzimmerschrankwand wurde millimetergenau eingepasst, termingerecht geliefert und sauber montiert. Jederzeit wieder, absolut empfehlenswert für jeden Innenausbau."
    )}`,
    even: false,
  },
  {
    name: "Fließsatz",
    url: `${PREVIEW}&headline=${encodeURIComponent(
      "Ihre Schreinerei für Einbauschränke, Treppen und Haustüren in Dortmund und Umgebung"
    )}&kapitel=${encodeURIComponent("Öffnungszeiten und Anfahrt")}`,
    even: false,
  },
];

type Measure = {
  sel: string;
  text: string;
  brokenWords: string[];
  overflow: number;
  inks: number[];
  staffel: boolean;
};

async function measure(
  page: Page
): Promise<{ items: Measure[]; pageOverflow: number }> {
  return page.evaluate(() => {
    const SEL =
      ".pk-display, .pk-title, .pk-page-title, .pk-row-name, .pk-voice-text p";
    const items = [...document.querySelectorAll<HTMLElement>(SEL)].map(el => {
      const brokenWords: string[] = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent ?? "";
        for (const m of text.matchAll(/\S+/g)) {
          const r = document.createRange();
          r.setStart(n, m.index!);
          r.setEnd(n, m.index! + m[0].length);
          const tops = new Set(
            [...r.getClientRects()].map(q => Math.round(q.top))
          );
          if (tops.size > 1) brokenWords.push(m[0]);
        }
      }
      const box = el.getBoundingClientRect();
      const r = document.createRange();
      r.selectNodeContents(el);
      const right = Math.max(...[...r.getClientRects()].map(q => q.right));
      const staffel =
        el.classList.contains("pk-display") &&
        !el.classList.contains("pk-display--flow") &&
        getComputedStyle(el.querySelector("span") ?? el).display === "block";
      const inks = staffel
        ? [...el.querySelectorAll("span")].map(s => {
            const q = document.createRange();
            q.selectNodeContents(s);
            const rects = [...q.getClientRects()];
            return (
              Math.max(...rects.map(x => x.right)) -
              Math.min(...rects.map(x => x.left))
            );
          })
        : [];
      return {
        sel: el.className,
        text: (el.textContent ?? "").slice(0, 60),
        brokenWords,
        overflow: Math.max(el.scrollWidth - el.clientWidth, right - box.right),
        inks,
        staffel,
      };
    });
    // Riesenliste: Preis liegt neben dem Namen (ohne Überdeckung) oder darunter.
    const rowClash = [...document.querySelectorAll<HTMLElement>(".pk-row")].flatMap(row => {
      const name = row.querySelector(".pk-row-name")!.getBoundingClientRect();
      const priceEl = row.querySelector(".pk-row-price");
      const box = row.getBoundingClientRect();
      if (!priceEl) return [];
      const price = priceEl.getBoundingClientRect();
      const beside = price.left >= name.right - 0.5;
      const below = price.top >= name.bottom - 0.5;
      const inside = price.right <= box.right + 0.5;
      return beside || below ? (inside ? [] : [`${row.textContent} läuft rechts über`]) : [`${row.textContent} überdeckt den Namen`];
    });
    return {
      items,
      rowClash,
      rows: document.querySelectorAll(".pk-row-name").length,
      voice: document.querySelectorAll(".pk-voice-text p").length,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
}

for (const p of PAGES) {
  for (const width of WIDTHS) {
    test(`Plakat-Umbruch: ${p.name} ${width}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(p.url);
      await page.evaluate(() => document.fonts.ready);
      const { items, rowClash, rows, voice, pageOverflow } = await measure(page);
      expect(pageOverflow).toBeLessThanOrEqual(0);
      expect(rowClash).toEqual([]);
      if (p.url.startsWith(PREVIEW)) {
        expect(rows, "Riesenliste gemessen").toBeGreaterThan(0);
        expect(voice, "Stimme gemessen").toBeGreaterThan(0);
      }
      expect(items.length).toBeGreaterThan(1);
      for (const it of items) {
        expect(it.brokenWords, `${it.sel} „${it.text}“`).toEqual([]);
        expect(it.overflow, `${it.sel} „${it.text}“`).toBeLessThanOrEqual(1);
        if (p.even && it.staffel && it.inks.length > 1) {
          // Kein kurzes Wort allein vor langen Zeilen: jede Zeile vor der
          // letzten ≥ 45 % der längsten, die letzte ≥ 27 % (fit.ts: 50 % /
          // 30 % in Rechenbreiten; Spielraum für Rundung/Kerning).
          const max = Math.max(...it.inks);
          const msg = `${it.text}: ${it.inks.map(Math.round).join(" / ")}`;
          for (const w of it.inks.slice(0, -1))
            expect(w, msg).toBeGreaterThanOrEqual(0.45 * max);
          expect(it.inks[it.inks.length - 1], msg).toBeGreaterThanOrEqual(
            0.27 * max
          );
        }
      }
    });
  }
}
