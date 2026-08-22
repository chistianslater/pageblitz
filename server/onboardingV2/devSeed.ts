import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { getFixture } from "../../shared/siteContract/fixtures";
import { PACK_IDS, type PackId } from "../../shared/siteContract/types";
import {
  createGeneratedWebsite, createOnboarding, getOnboardingByWebsiteId,
  getWebsiteBySlug, updateOnboarding, updateWebsite, upsertBusiness,
} from "../db";

/**
 * Nur Entwicklung/Test: legt eine v2-Preview-Website aus einer Fixture an
 * (oder setzt sie zurück) und leitet ins Studio. Macht das Studio ohne
 * LLM-Lauf testbar (Playwright-Baselines, manuelles Durchklicken).
 */
async function handleStudioSeed(req: Request, res: Response): Promise<void> {
  if (process.env.NODE_ENV === "production") { res.status(404).send("Not found"); return; }
  const pack = typeof req.query.pack === "string" ? req.query.pack : "werkbank";
  const fixture = req.query.fixture === "minimal" ? "minimal" : "full";
  if (!(PACK_IDS as readonly string[]).includes(pack)) { res.status(400).send(`Unbekanntes Pack: "${pack}"`); return; }
  const packId = pack as PackId;
  const slug = `studio-seed-${packId}-${fixture}`;
  const doc = { ...getFixture(packId, fixture), slug };

  let websiteId: number; let token: string;
  const existing = await getWebsiteBySlug(slug);
  if (existing && existing.previewToken) {
    websiteId = existing.id; token = existing.previewToken;
    await updateWebsite(websiteId, { websiteData: doc as any, layoutStyle: packId, status: "preview" });
    const onboarding = await getOnboardingByWebsiteId(websiteId);
    if (onboarding) await updateOnboarding(websiteId, { studioProgress: {}, legalOwner: null, legalEmail: null, legalStreet: null, legalZip: null, legalCity: null, updatedAt: Date.now() });
    else await createOnboarding({ websiteId, status: "in_progress", stepCurrent: 0, createdAt: Date.now(), updatedAt: Date.now() });
  } else {
    const businessId = await upsertBusiness({
      name: doc.businessName, slug, placeId: `self-studio-seed-${packId}`,
      category: doc.businessCategory ?? "", address: "", phone: "", email: null,
      googleReviews: null, openingHours: null, rating: null, reviewCount: null,
    });
    token = nanoid(32);
    websiteId = await createGeneratedWebsite({
      businessId, slug, status: "preview", previewToken: token, onboardingStatus: "in_progress",
      source: "external", customerEmail: null, captureStatus: "onboarding_started",
      layoutVersion: 2, layoutStyle: packId, websiteData: doc as any,
    });
    await createOnboarding({ websiteId, status: "in_progress", stepCurrent: 0, createdAt: Date.now(), updatedAt: Date.now() });
  }
  if (req.query.json === "1") { res.json({ token, websiteId }); return; }
  res.redirect(302, `/onboarding/${token}`);
}

export function registerStudioDevSeed(app: Express): void {
  app.get("/dev/studio-seed", (req, res) => {
    handleStudioSeed(req, res).catch(err => {
      console.error("[dev/studio-seed] fehlgeschlagen:", err);
      res.status(500).send(err instanceof Error ? err.message : "Seed fehlgeschlagen");
    });
  });
}
