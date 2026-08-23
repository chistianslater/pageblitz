import { beforeEach, describe, expect, test, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../db", () => ({
  getWebsiteBySlug: vi.fn(),
  upsertBusiness: vi.fn().mockResolvedValue(7),
  createGeneratedWebsite: vi.fn().mockResolvedValue(42),
  updateWebsite: vi.fn().mockResolvedValue(undefined),
  updateBusiness: vi.fn().mockResolvedValue(undefined),
  createOnboarding: vi.fn().mockResolvedValue(1),
  getOnboardingByWebsiteId: vi.fn().mockResolvedValue(undefined),
  updateOnboarding: vi.fn().mockResolvedValue(undefined),
}));
import * as db from "../db";
import { registerStudioDevSeed } from "./devSeed";
const mockedDb = vi.mocked(db);

function app() {
  const a = express();
  registerStudioDevSeed(a);
  return a;
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
});

describe("/dev/studio-seed", () => {
  test("production → 404", async () => {
    process.env.NODE_ENV = "production";
    expect((await request(app()).get("/dev/studio-seed")).status).toBe(404);
  });
  test("neu: legt Business+Website+Onboarding an und leitet ins Studio", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
    const res = await request(app()).get("/dev/studio-seed?pack=kanzlei");
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/onboarding\/[A-Za-z0-9_-]{32}$/);
    expect(mockedDb.createGeneratedWebsite).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "studio-seed-kanzlei-full",
        status: "preview",
      })
    );
    expect(mockedDb.createOnboarding).toHaveBeenCalled();
  });
  test("vorhanden: setzt Fixture zurück, erzeugt nichts Neues, json=1 liefert Token", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      id: 42,
      previewToken: "t".repeat(32),
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
    } as any);
    const res = await request(app()).get(
      "/dev/studio-seed?pack=werkbank&json=1"
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "t".repeat(32), websiteId: 42 });
    expect(mockedDb.createGeneratedWebsite).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({ stylePackId: "werkbank" }),
      })
    );
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ studioProgress: {} })
    );
  });
  test("vorhanden aber ohne previewToken: erzeugt Token, updated Website, keine Neuanlage", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      id: 42,
      previewToken: null,
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
    } as any);
    const res = await request(app()).get("/dev/studio-seed?pack=werkbank");
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/onboarding\/[A-Za-z0-9_-]{32}$/);
    expect(mockedDb.createGeneratedWebsite).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        previewToken: expect.stringMatching(/^[A-Za-z0-9_-]{32}$/),
      })
    );
  });
  test("unbekanntes Pack → 400", async () => {
    expect(
      (await request(app()).get("/dev/studio-seed?pack=disco")).status
    ).toBe(400);
  });
  test("needsCategory=1 neu: Website ohne Dokument, Business mit leerer Kategorie und eigener placeId (Task 5)", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
    const res = await request(app()).get(
      "/dev/studio-seed?pack=werkbank&needsCategory=1"
    );
    expect(res.status).toBe(302);
    expect(mockedDb.upsertBusiness).toHaveBeenCalledWith(
      expect.objectContaining({
        placeId: "self-studio-seed-werkbank-nocategory",
        category: "",
      })
    );
    expect(mockedDb.createGeneratedWebsite).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "studio-seed-werkbank-nocategory",
        websiteData: null,
      })
    );
  });
  test("needsCategory=1 vorhanden: Dokument genullt UND Kategorie zurückgesetzt (Reset nach vorigem Testlauf)", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      id: 42,
      businessId: 7,
      previewToken: "t".repeat(32),
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
    } as any);
    const res = await request(app()).get(
      "/dev/studio-seed?pack=werkbank&needsCategory=1&json=1"
    );
    expect(res.status).toBe(200);
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ websiteData: null })
    );
    expect(mockedDb.updateBusiness).toHaveBeenCalledWith(7, { category: "" });
  });
  test("fixture=features: Slug trägt Fixture-Kennung, Dokument bekommt aktive Add-ons", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
    const res = await request(app()).get(
      "/dev/studio-seed?pack=werkbank&fixture=features"
    );
    expect(res.status).toBe(302);
    expect(mockedDb.createGeneratedWebsite).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "studio-seed-werkbank-features",
        websiteData: expect.objectContaining({
          features: {
            contactForm: true,
            aiChat: true,
            booking: true,
            subpages: true,
          },
        }),
      })
    );
  });
});
