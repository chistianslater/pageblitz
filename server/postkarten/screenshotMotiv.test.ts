import { describe, expect, test } from "vitest";
import sharp from "sharp";
import {
  alsDruckJpeg,
  FREIZONEN_MM,
  innerhalb,
  LAYOUT_MM,
  motivPasstZumLayout,
  SICHER_FELD_MM,
  screenshotFenster,
  ueberschneiden,
  VORDERSEITE_MM,
  VORDERSEITE_PX,
  vorderseiteHtml,
} from "./screenshotMotiv";

describe("Vorderseite Batch B: Maße", () => {
  test("DIN lang mit 2 mm Beschnitt bei 300 dpi = 2528 × 1287 px", () => {
    expect(VORDERSEITE_MM).toEqual({ breite: 214, hoehe: 109 });
    expect(VORDERSEITE_PX).toEqual({ breite: 2528, hoehe: 1287 });
  });

  test("kein eigenes Element liegt unter QR, Preiszeile, Pfeil oder Kurz-Link", () => {
    // Diese Flächen legt die HeyMail-Vorlage B über unser Bild.
    for (const [name, feld] of Object.entries(LAYOUT_MM)) {
      for (const [zone, frei] of Object.entries(FREIZONEN_MM)) {
        expect(ueberschneiden(feld, frei), `${name} × ${zone}`).toBe(false);
      }
    }
  });

  test("alle Elemente bleiben im Sicherheitsabstand (5 mm im Endformat)", () => {
    for (const [name, feld] of Object.entries(LAYOUT_MM)) {
      expect(innerhalb(feld, SICHER_FELD_MM), name).toBe(true);
    }
  });

  test("die Aufnahme liefert mehr Pixel als das Screenshot-Feld im Druck braucht", () => {
    const f = screenshotFenster();
    const feldPx = (LAYOUT_MM.screenshot.b / 25.4) * 300;
    expect(f.breite * (f.dichte ?? 1)).toBeGreaterThan(feldPx);
    expect(f.breite / f.hoehe).toBeCloseTo(
      LAYOUT_MM.screenshot.b / LAYOUT_MM.screenshot.h,
      2
    );
  });
});

describe("vorderseiteHtml", () => {
  const html = vorderseiteHtml({
    text: {
      eyebrow: "Für Haar & Co <Bocholt>",
      headline: "Das ist deine neue Website.",
      copy: "Du wusstest nur nichts davon.",
    },
    screenshot: "data:image/png;base64,AAAA",
  });

  test("enthält Schlagzeile, Copy und Screenshot", () => {
    expect(html).toContain("Das ist deine neue Website.");
    expect(html).toContain("Du wusstest nur nichts davon.");
    expect(html).toContain('src="data:image/png;base64,AAAA"');
  });

  test("Betriebsnamen werden maskiert, nicht als HTML gelesen", () => {
    expect(html).toContain("Für Haar &amp; Co &lt;Bocholt&gt;");
  });

  test("Seite ist exakt druckgroß und schwarz wie Welle 1", () => {
    expect(html).toContain("width:2528px;height:1287px");
    expect(html).toContain("background:#0b0b0b");
  });
});

describe("alsDruckJpeg", () => {
  test("liefert ein JPEG im Druckmaß mit 300 dpi", async () => {
    const png = await sharp({
      create: { width: 2528, height: 1287, channels: 4, background: "#0b0b0b" },
    })
      .png()
      .toBuffer();
    const m = await sharp(await alsDruckJpeg(png)).metadata();
    expect(m.format).toBe("jpeg");
    expect([m.width, m.height]).toEqual([2528, 1287]);
    expect(m.density).toBe(300);
    expect(m.hasAlpha).toBe(false);
  });
});

describe("motivPasstZumLayout", () => {
  const laptop = "https://media.pageblitz.de/postkarten/AB12.png";
  const nackt = "https://media.pageblitz.de/postkarten/AB12.jpg";
  const screenshot =
    "https://media.pageblitz.de/postkarten/AB12-screenshot.jpg";

  test("Screenshot-Layout braucht das Screenshot-Motiv", () => {
    expect(motivPasstZumLayout("screenshot", screenshot)).toBe(true);
    expect(motivPasstZumLayout("screenshot", laptop)).toBe(false);
    expect(motivPasstZumLayout("screenshot", nackt)).toBe(false);
  });

  test("Standard (auch ohne Layout) nimmt kein Screenshot-Motiv", () => {
    expect(motivPasstZumLayout("standard", laptop)).toBe(true);
    expect(motivPasstZumLayout(null, laptop)).toBe(true);
    expect(motivPasstZumLayout(null, screenshot)).toBe(false);
  });

  test("ohne Motiv passt nichts", () => {
    expect(motivPasstZumLayout("standard", null)).toBe(false);
  });
});
