import { describe, expect, test, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { WebsiteDataV2 } from "../shared/siteContract/types";

vi.mock("./db", () => ({
  getWebsiteById: vi.fn(),
  updateWebsite: vi.fn(),
}));
vi.mock("./ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));

import * as db from "./db";
import { invalidateSsrCache } from "./ssr/routes";
import {
  applyChatConfig,
  applyContactFormConfig,
  sanitizeChatConfig,
  sanitizeContactFormConfig,
} from "./customerAddonConfig";

const mockedDb = vi.mocked(db);
const mockedInvalidate = vi.mocked(invalidateSsrCache);

function v2Doc(overrides: Partial<WebsiteDataV2> = {}): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: "werkbank",
    businessName: "Schreinerei Brandt",
    sections: [{ type: "hero", headline: "Massarbeit." }],
    seo: { title: "Schreinerei Brandt", description: "Möbelbau." },
    ...overrides,
  };
}

describe("sanitizeContactFormConfig", () => {
  test("leere Strings fallen auf Defaults zurück", () => {
    expect(
      sanitizeContactFormConfig({ nameLabel: "   ", successMessage: "" })
    ).toBeUndefined();
  });

  test("trimmt Labels und verwirft leere Custom-Felder", () => {
    const next = sanitizeContactFormConfig({
      nameLabel: "  Vorname  ",
      customFields: [
        { id: "firma", label: " Firma ", required: true },
        { id: "leer", label: "   " },
      ],
    });
    expect(next).toEqual({
      nameLabel: "Vorname",
      customFields: [{ id: "firma", label: "Firma", required: true }],
    });
  });

  test("Telefon pflichtig erzwingt sichtbares Feld", () => {
    const next = sanitizeContactFormConfig({ phoneRequired: true });
    expect(next).toEqual({ phoneEnabled: true, phoneRequired: true });
  });

  test("Telefon aus + pflichtig → Pflicht fällt weg", () => {
    const next = sanitizeContactFormConfig({
      phoneEnabled: false,
      phoneRequired: true,
    });
    expect(next).toEqual({ phoneEnabled: false });
  });

  test("ungültige Custom-Feld-ID → BAD_REQUEST", () => {
    expect(() =>
      sanitizeContactFormConfig({
        customFields: [{ id: "1bad", label: "X" }],
      })
    ).toThrow(TRPCError);
  });
});

describe("sanitizeChatConfig", () => {
  test("leere Eingabe → undefined", () => {
    expect(sanitizeChatConfig({})).toBeUndefined();
  });

  test("trimmt Wissen und lowercaset E-Mail", () => {
    expect(
      sanitizeChatConfig({
        extraKnowledge: "  Parken hinter dem Haus.  ",
        notificationEmail: "TEAM@Example.DE",
      })
    ).toEqual({
      extraKnowledge: "Parken hinter dem Haus.",
      notificationEmail: "team@example.de",
    });
  });
});

describe("applyContactFormConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedDb.updateWebsite.mockResolvedValue(undefined as any);
  });

  test("schreibt contactFormConfig ins v2-Dokument und invalidiert SSR-Cache", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "brandt",
      websiteData: v2Doc(),
    } as any);

    const saved = await applyContactFormConfig(42, {
      nameLabel: "Ihr Name",
      phoneEnabled: false,
    });

    expect(saved).toEqual({ nameLabel: "Ihr Name", phoneEnabled: false });
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).websiteData.contactFormConfig).toEqual(saved);
    expect((patch as any).websiteData.businessName).toBe("Schreinerei Brandt");
    expect(mockedInvalidate).toHaveBeenCalledWith("brandt");
  });

  test("leere Config entfernt Overrides wieder", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "brandt",
      websiteData: v2Doc({
        contactFormConfig: { nameLabel: "Alt" },
      }),
    } as any);

    const saved = await applyContactFormConfig(42, {});
    expect(saved).toBeUndefined();
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).websiteData.contactFormConfig).toBeUndefined();
  });

  test("v1-Dokument → BAD_REQUEST, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "brandt",
      websiteData: { version: 1, name: "Alt" },
    } as any);

    await expect(
      applyContactFormConfig(42, { nameLabel: "Name" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});

describe("applyChatConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedDb.updateWebsite.mockResolvedValue(undefined as any);
  });

  test("schreibt chatConfig und lässt contactFormConfig unangetastet", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 7,
      slug: "atelier",
      websiteData: v2Doc({
        contactFormConfig: { submitLabel: "Senden" },
      }),
    } as any);

    const saved = await applyChatConfig(7, {
      extraKnowledge: "Wir haben dienstags frei.",
    });
    expect(saved).toEqual({ extraKnowledge: "Wir haben dienstags frei." });
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).websiteData.chatConfig).toEqual(saved);
    expect((patch as any).websiteData.contactFormConfig).toEqual({
      submitLabel: "Senden",
    });
  });
});
