import { describe, expect, test } from "vitest";
import sharp from "sharp";
import { laptopMockup, MOCKUP_BREITE, MOCKUP_HOEHE } from "./mockup";

/** Eine Aufnahme in den Maßen, die `aufnahme.ts` liefert. */
async function aufnahme(breite = 1280, hoehe = 900): Promise<Buffer> {
  return sharp({
    create: {
      width: breite,
      height: hoehe,
      channels: 3,
      background: { r: 220, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();
}

describe("laptopMockup", () => {
  test("liefert ein PNG in festen Maßen", async () => {
    const bild = await sharp(await laptopMockup(await aufnahme())).metadata();
    expect(bild.format).toBe("png");
    expect(bild.width).toBe(MOCKUP_BREITE);
    expect(bild.height).toBe(MOCKUP_HOEHE);
  });

  test("behält einen durchsichtigen Hintergrund", async () => {
    // Die Karte bestimmt, worauf der Laptop steht — ein weißer Kasten um das
    // Gerät wäre auf einem farbigen Motiv sofort sichtbar.
    const bild = sharp(await laptopMockup(await aufnahme()));
    expect((await bild.metadata()).channels).toBe(4);
    const ecke = await bild
      .clone()
      .extract({ left: 0, top: 0, width: 4, height: 4 })
      .raw()
      .toBuffer();
    expect(ecke[3]).toBe(0);
  });

  test("silbern als Standard — die Karte ist dunkel", async () => {
    // Ein schwarzer Laptop auf dunklem Karton verschwindet bis auf den
    // Bildschirm (Betreiber-Befund 2026-09-13). Geprüft am Deckelrand,
    // links neben der Bildschirmfläche.
    const roh = await sharp(await laptopMockup(await aufnahme()))
      .extract({ left: 88, top: 500, width: 4, height: 4 })
      .raw()
      .toBuffer();
    expect(roh[0]).toBeGreaterThan(180);
    expect(roh[3]).toBe(255);

    const dunkel = await sharp(await laptopMockup(await aufnahme(), "dunkel"))
      .extract({ left: 88, top: 500, width: 4, height: 4 })
      .raw()
      .toBuffer();
    expect(dunkel[0]).toBeLessThan(60);
  });

  test("staucht die Aufnahme nicht, sondern schneidet oben zu", async () => {
    // Eine verzerrte Website auf einer Karte, die für Websites wirbt, wäre
    // die schlechteste aller Anzeigen. Ein sehr langer Screenshot muss
    // deshalb beschnitten werden, nicht gequetscht.
    const lang = await aufnahme(1280, 3000);
    const bild = await sharp(await laptopMockup(lang)).metadata();
    expect(bild.width).toBe(MOCKUP_BREITE);
    expect(bild.height).toBe(MOCKUP_HOEHE);
  });
});
