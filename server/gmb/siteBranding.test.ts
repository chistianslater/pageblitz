import { describe, expect, test } from "vitest";
import {
  extractBrandingSignals,
  pickAccentColor,
  parseColorTokens,
  parseFontFamilies,
  pickLogoUrl,
} from "./siteBranding";

const HTML = `<!doctype html><html><head>
<meta name="theme-color" content="#1f6feb">
<link rel="apple-touch-icon" href="/icons/touch.png">
<link rel="stylesheet" href="/assets/site.css">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400" rel="stylesheet">
<style>:root{--brand:#a3402a}h1{font-family:"Playfair Display",Georgia,serif}</style>
</head><body>
<header><a href="/"><img src="/img/logo-brandt.svg" alt="Schreinerei Brandt"></a></header>
<main><p style="color:#a3402a">Hallo</p></main>
</body></html>`;

describe("siteBranding: Logo finden (2026-09-03)", () => {
  test("Bild in Header/Nav mit Logo-Hinweis im Pfad gewinnt", () => {
    expect(pickLogoUrl(HTML, "https://brandt.example")).toBe(
      "https://brandt.example/img/logo-brandt.svg"
    );
  });

  test("ohne Logo-Bild greift apple-touch-icon", () => {
    const html = `<html><head><link rel="apple-touch-icon" href="/t.png"></head><body><header><img src="/img/hero.jpg" alt="Werkstatt"></header></body></html>`;
    expect(pickLogoUrl(html, "https://x.example")).toBe(
      "https://x.example/t.png"
    );
  });

  test("Bilder außerhalb von Header/Nav und .ico werden ignoriert", () => {
    const html = `<html><head><link rel="icon" href="/favicon.ico"></head><body><main><img src="/img/logo-big.png" alt="Logo"></main></body></html>`;
    expect(pickLogoUrl(html, "https://x.example")).toBeNull();
  });

  test("fremde Hosts werden nicht als Logo übernommen", () => {
    const html = `<html><body><nav><img src="https://cdn.fremd.example/logo.png" alt="Logo"></nav></body></html>`;
    expect(pickLogoUrl(html, "https://x.example")).toBeNull();
  });
});

describe("siteBranding: Farben (2026-09-03)", () => {
  test("sammelt Hex- und rgb-Werte samt theme-color, gezaehlt", () => {
    const tokens = parseColorTokens(HTML, ".btn{background:rgb(163,64,42)}");
    expect(tokens.get("#a3402a")).toBeGreaterThanOrEqual(3);
    expect(tokens.has("#1f6feb")).toBe(true);
  });

  test("Kurz-Hex wird expandiert, Weiß/Schwarz/Grau und Neon fallen weg", () => {
    const tokens = parseColorTokens(
      `<style>a{color:#fff}b{color:#000}c{color:#888}d{color:#0f0}e{color:#a34}</style>`,
      ""
    );
    expect(pickAccentColor(tokens)).toBe("#aa3344");
  });

  test("ohne brauchbare Farbe kein Vorschlag", () => {
    expect(
      pickAccentColor(parseColorTokens("<style>a{color:#fff}</style>", ""))
    ).toBeNull();
  });

  test("häufigste brauchbare Farbe gewinnt", () => {
    const tokens = new Map([
      ["#a3402a", 2],
      ["#2e7e78", 7],
    ]);
    expect(pickAccentColor(tokens)).toBe("#2e7e78");
  });
});

describe("siteBranding: Schriften (2026-09-03)", () => {
  test("liest font-family und Google-Fonts-Links, ohne Generika", () => {
    const fonts = parseFontFamilies(HTML, "");
    expect(fonts).toContain("Playfair Display");
    expect(fonts).toContain("Inter");
    expect(fonts).not.toContain("Georgia");
    expect(fonts).not.toContain("serif");
  });

  test("Überschriften-Schrift steht vorn, danach nach Häufigkeit", () => {
    expect(
      parseFontFamilies(
        `<style>p{font-family:Beta}p{font-family:Beta}h1{font-family:Alpha}</style>`,
        ""
      )
    ).toEqual(["Alpha", "Beta"]);
  });

  test("höchstens zwei Familien, häufigste zuerst", () => {
    const fonts = parseFontFamilies(
      `<style>h1{font-family:Alpha}h2{font-family:Alpha}p{font-family:Beta}i{font-family:Gamma}</style>`,
      ""
    );
    expect(fonts).toEqual(["Alpha", "Beta"]);
  });
});

describe("siteBranding: generierte Schriftnamen (Befund 2026-09-03)", () => {
  test("Next.js-Namen wie __Inter_7748ca werden auf die echte Familie zurückgeführt", () => {
    expect(
      parseFontFamilies(
        `<style>h1{font-family:__Sora_031933,sans-serif}body{font-family:__Inter_7748ca,__Inter_Fallback_7748ca,sans-serif}</style>`,
        ""
      )
    ).toEqual(["Sora", "Inter"]);
  });

  test("reine Hash-Namen ohne erkennbare Familie fallen weg", () => {
    expect(
      parseFontFamilies(`<style>p{font-family:__7748ca}</style>`, "")
    ).toEqual([]);
  });
});

describe("extractBrandingSignals", () => {
  test("bündelt Logo, Farbe und Schriften einer Seite", () => {
    expect(extractBrandingSignals(HTML, "https://brandt.example", [])).toEqual({
      logoUrl: "https://brandt.example/img/logo-brandt.svg",
      accent: "#a3402a",
      fonts: ["Playfair Display", "Inter"],
    });
  });

  test("nichts erkannt → alle Felder leer", () => {
    expect(
      extractBrandingSignals(
        "<html><body><p>Hi</p></body></html>",
        "https://x.example",
        []
      )
    ).toEqual({ logoUrl: null, accent: null, fonts: [] });
  });
});
