import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { assertV2SafeWrite } from "./v2WriteGuard";
import type { WebsiteDataV2 } from "../shared/siteContract/types";

function baseDoc(overrides: Partial<WebsiteDataV2> = {}): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: "werkbank",
    businessName: "Schreinerei Brandt",
    sections: [
      { type: "hero", headline: "Massarbeit." },
      {
        type: "services",
        headline: "Leistungen",
        items: [{ title: "Möbelbau" }],
      },
    ],
    seo: { title: "Schreinerei Brandt", description: "Möbelbau in Dortmund." },
    designRevision: 3,
    system: "werkstoff",
    palette: "kiefer",
    ...overrides,
  };
}

describe("assertV2SafeWrite", () => {
  test("greift nicht, wenn gespeichertes Dokument v1 ist", () => {
    expect(() =>
      assertV2SafeWrite({ headline: "irgendwas" }, { anything: "goes" })
    ).not.toThrow();
  });

  test("greift nicht, wenn gespeichertes Dokument fehlt (null/undefined)", () => {
    expect(() => assertV2SafeWrite(null, { anything: "goes" })).not.toThrow();
    expect(() =>
      assertV2SafeWrite(undefined, { anything: "goes" })
    ).not.toThrow();
  });

  test("lässt einen schema-validen v2-Write durch", () => {
    const stored = baseDoc();
    const next = { ...stored, tagline: "Neuer Slogan" };
    expect(() => assertV2SafeWrite(stored, next)).not.toThrow();
  });

  test("wirft TRPCError BAD_REQUEST bei korrumpierendem Write auf ein v2-Dokument", () => {
    const stored = baseDoc();
    // v1-Feldname "logoImageUrl" ist im strikten WebsiteDataV2Schema nicht erlaubt
    const corrupting = {
      ...stored,
      logoImageUrl: "https://example.com/logo.png",
    };
    expect(() => assertV2SafeWrite(stored, corrupting)).toThrow(TRPCError);
    try {
      assertV2SafeWrite(stored, corrupting);
      throw new Error("sollte vorher geworfen haben");
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect((e as TRPCError).code).toBe("BAD_REQUEST");
      expect((e as TRPCError).message).toContain(
        "unterstützt das neue Website-Format noch nicht"
      );
    }
  });

  test("wirft, wenn ein Pflichtfeld (sections) im Write fehlt", () => {
    const stored = baseDoc();
    const { sections: _omit, ...withoutSections } = stored as any;
    expect(() => assertV2SafeWrite(stored, withoutSections)).toThrow(TRPCError);
  });

  describe("nur rev 3 wird geschrieben (Packs entfernen)", () => {
    const expectRejected = (stored: unknown, next: unknown) => {
      try {
        assertV2SafeWrite(stored, next);
        throw new Error("sollte vorher geworfen haben");
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect((e as TRPCError).code).toBe("BAD_REQUEST");
        expect((e as TRPCError).message).toMatch(/Designsystem/);
      }
    };
    test("lehnt rev 2 ab", () => {
      const { system: _s, palette: _p, ...rest } = baseDoc();
      expectRejected(baseDoc(), { ...rest, designRevision: 2 });
    });
    test("lehnt ein Dokument ohne Revision ab", () => {
      const { system: _s, palette: _p, designRevision: _r, ...rest } = baseDoc();
      expectRejected(baseDoc(), rest);
    });
    test("lehnt rev 3 ohne System ab", () => {
      const { system: _s, ...rest } = baseDoc();
      expect(() => assertV2SafeWrite(baseDoc(), rest)).toThrow(TRPCError);
    });
    test("gilt auch, wenn das gespeicherte Dokument kein v2 ist", () => {
      const { system: _s, palette: _p, ...rest } = baseDoc();
      expectRejected(null, { ...rest, designRevision: 2 });
      expectRejected({ headline: "v1" }, { ...rest, designRevision: 1 });
    });
    test("rev 3 mit System auf leeres/v1-Dokument ist erlaubt", () => {
      expect(() => assertV2SafeWrite(null, baseDoc())).not.toThrow();
      expect(() => assertV2SafeWrite({ headline: "v1" }, baseDoc())).not.toThrow();
    });
  });
});
