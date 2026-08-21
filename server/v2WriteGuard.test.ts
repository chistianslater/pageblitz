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
});
