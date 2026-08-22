import { beforeEach, describe, expect, test, vi } from "vitest";
import express from "express";
import request from "supertest";
import { TRPCError } from "@trpc/server";

vi.mock("./db", () => ({
  getWebsiteBySlug: vi.fn(),
  getBusinessById: vi.fn(),
  createContactSubmission: vi.fn(),
  countRecentSubmissionsByIp: vi.fn(),
  getOnboardingByWebsiteId: vi.fn(),
}));
vi.mock("./_core/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

import * as db from "./db";
import { sendEmail } from "./_core/email";
import { registerContactRoutes, submitContactRequest } from "./contactSubmit";

const mockedDb = vi.mocked(db);
const mockedSendEmail = vi.mocked(sendEmail);

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  registerContactRoutes(app);
  return app;
}

const v2Doc = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
  features: { contactForm: true },
};

// status "active" (verkauft) statt "preview" — die meisten bestehenden
// Tests erwarten eine Owner-Mail beim Erfolgsfall (Finding I3: im
// Preview-Status wird KEINE Mail verschickt, siehe eigener Test unten).
const WEBSITE = {
  id: 1,
  slug: "brandt",
  businessId: 7,
  contactEmail: null,
  status: "active",
  websiteData: v2Doc,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getWebsiteBySlug.mockResolvedValue(WEBSITE as any);
  mockedDb.getBusinessById.mockResolvedValue({
    id: 7,
    name: "Schreinerei Brandt",
    email: "info@brandt.de",
  } as any);
  mockedDb.countRecentSubmissionsByIp.mockResolvedValue(0);
  mockedDb.createContactSubmission.mockResolvedValue(1);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue(undefined);
});

// ── submitContactRequest (Unit) ─────────────────────────────────────────────

describe("submitContactRequest", () => {
  test("Honeypot befüllt → {ok:true}, keine Submission, keine Mail", async () => {
    const result = await submitContactRequest({
      slug: "brandt",
      name: "Bot",
      email: "bot@spam.com",
      message: "Spam",
      website_url: "http://spam.example",
      ip: "1.2.3.4",
    });
    expect(result).toEqual({ ok: true });
    expect(mockedDb.getWebsiteBySlug).not.toHaveBeenCalled();
    expect(mockedDb.createContactSubmission).not.toHaveBeenCalled();
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  test("unbekannter Slug → TRPCError NOT_FOUND", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
    await expect(
      submitContactRequest({
        slug: "unbekannt",
        name: "Anna",
        email: "anna@example.com",
        message: "Hallo",
        ip: "1.2.3.4",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mockedDb.createContactSubmission).not.toHaveBeenCalled();
  });

  test("Rate-Limit erreicht (5/h) → TRPCError TOO_MANY_REQUESTS", async () => {
    mockedDb.countRecentSubmissionsByIp.mockResolvedValue(5);
    await expect(
      submitContactRequest({
        slug: "brandt",
        name: "Anna",
        email: "anna@example.com",
        message: "Hallo",
        ip: "1.2.3.4",
      })
    ).rejects.toBeInstanceOf(TRPCError);
    expect(mockedDb.createContactSubmission).not.toHaveBeenCalled();
  });

  test("Erfolg → speichert Submission und benachrichtigt den Owner per Mail", async () => {
    const result = await submitContactRequest({
      slug: "brandt",
      name: "Anna",
      email: "anna@example.com",
      phone: "0171123456",
      message: "Interesse an einem Termin",
      ip: "1.2.3.4",
    });
    expect(result).toEqual({ ok: true });
    expect(mockedDb.createContactSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ websiteId: 1, name: "Anna" })
    );
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "info@brandt.de" })
    );
  });

  test("Owner-Mail escaped alle Eingaben (Name/E-Mail/Telefon/Business) gegen HTML-Injection", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "<b onmouseover=alert(1)>Schreinerei</b>",
      email: "info@brandt.de",
    } as any);

    await submitContactRequest({
      slug: "brandt",
      name: "<img src=x onerror=alert(1)>",
      email: "anna@example.com",
      phone: '"><script>alert(1)</script>',
      message: "Hallo",
      ip: "1.2.3.4",
    });

    const call = mockedSendEmail.mock.calls[0][0] as { html: string };
    expect(call.html).toContain("&lt;img");
    expect(call.html).not.toContain("<img");
    expect(call.html).not.toContain("<script>");
    expect(call.html).not.toContain("<b onmouseover=alert(1)>");
  });

  // ── Finding I3: Kontaktformular-Add-on gaten ────────────────────────────

  test("v2-Dokument ohne features.contactForm → NOT_FOUND, keine Submission, keine Mail", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      ...WEBSITE,
      websiteData: { ...v2Doc, features: { contactForm: false } },
    } as any);

    await expect(
      submitContactRequest({
        slug: "brandt",
        name: "Anna",
        email: "anna@example.com",
        message: "Hallo",
        ip: "1.2.3.4",
      })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Kontaktformular nicht aktiv",
    });
    expect(mockedDb.createContactSubmission).not.toHaveBeenCalled();
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  test("v2-Dokument ganz ohne features-Feld → NOT_FOUND (contactForm nicht aktiv)", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      ...WEBSITE,
      websiteData: { ...v2Doc, features: undefined },
    } as any);

    await expect(
      submitContactRequest({
        slug: "brandt",
        name: "Anna",
        email: "anna@example.com",
        message: "Hallo",
        ip: "1.2.3.4",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mockedDb.createContactSubmission).not.toHaveBeenCalled();
  });

  test("v1-Website (kein v2-Dokument) mit onboarding.addOnContactForm=true → erlaubt", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      ...WEBSITE,
      websiteData: { headline: "Altes Dokument" },
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      addOnContactForm: true,
    } as any);

    const result = await submitContactRequest({
      slug: "brandt",
      name: "Anna",
      email: "anna@example.com",
      message: "Hallo",
      ip: "1.2.3.4",
    });

    expect(result).toEqual({ ok: true });
    expect(mockedDb.createContactSubmission).toHaveBeenCalledTimes(1);
  });

  test("v1-Website mit onboarding.addOnContactForm=false → NOT_FOUND", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      ...WEBSITE,
      websiteData: { headline: "Altes Dokument" },
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      addOnContactForm: false,
    } as any);

    await expect(
      submitContactRequest({
        slug: "brandt",
        name: "Anna",
        email: "anna@example.com",
        message: "Hallo",
        ip: "1.2.3.4",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("v1-Website ganz ohne Onboarding-Zeile → NOT_FOUND (kein Add-on nachweisbar)", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      ...WEBSITE,
      websiteData: { headline: "Altes Dokument" },
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue(undefined);

    await expect(
      submitContactRequest({
        slug: "brandt",
        name: "Anna",
        email: "anna@example.com",
        message: "Hallo",
        ip: "1.2.3.4",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("status 'preview' → Submission wird gespeichert, aber KEINE Owner-Mail verschickt", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      ...WEBSITE,
      status: "preview",
    } as any);

    const result = await submitContactRequest({
      slug: "brandt",
      name: "Anna",
      email: "anna@example.com",
      message: "Hallo",
      ip: "1.2.3.4",
    });

    expect(result).toEqual({ ok: true });
    expect(mockedDb.createContactSubmission).toHaveBeenCalledTimes(1);
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });
});

// ── POST /api/site/:slug/contact (Express, supertest) ───────────────────────

describe("POST /api/site/:slug/contact", () => {
  test("JSON ok", async () => {
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/json")
      .send({ name: "Anna", email: "anna@example.com", message: "Hallo" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockedDb.createContactSubmission).toHaveBeenCalledTimes(1);
  });

  test("Honeypot befüllt (JSON) → Zod lehnt ab, keine Submission", async () => {
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/json")
      .send({
        name: "Bot",
        email: "bot@spam.com",
        message: "Spam",
        website_url: "http://spam.example",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(mockedDb.createContactSubmission).not.toHaveBeenCalled();
  });

  test("Ungültige Eingabe (fehlender Name) → 400", async () => {
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/json")
      .send({ email: "anna@example.com", message: "Hallo" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ ok: false, error: expect.any(String) });
  });

  test("Rate-Limit (JSON) → 429 mit deutscher Meldung", async () => {
    mockedDb.countRecentSubmissionsByIp.mockResolvedValue(5);
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/json")
      .send({ name: "Anna", email: "anna@example.com", message: "Hallo" });

    expect(res.status).toBe(429);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/Zu viele Anfragen/);
  });

  test("unbekannter Slug (JSON) → 404", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
    const res = await request(buildApp())
      .post("/api/site/unbekannt/contact")
      .set("Content-Type", "application/json")
      .send({ name: "Anna", email: "anna@example.com", message: "Hallo" });

    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  test("Form-POST (urlencoded) → 303 Redirect mit ?kontakt=gesendet#kontakt auf Referer-Pfad", async () => {
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Referer", "http://127.0.0.1/site/brandt")
      .send("name=Anna&email=anna%40example.com&message=Hallo");

    expect(res.status).toBe(303);
    expect(res.headers.location).toBe("/site/brandt?kontakt=gesendet#kontakt");
    expect(mockedDb.createContactSubmission).toHaveBeenCalledTimes(1);
  });

  test("Form-POST ohne Referer → Redirect-Fallback auf '/'", async () => {
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("name=Anna&email=anna%40example.com&message=Hallo");

    expect(res.status).toBe(303);
    expect(res.headers.location).toBe("/?kontakt=gesendet#kontakt");
  });

  test("Form-POST mit fremdem Referer (anderer Host) → Redirect-Fallback auf '/'", async () => {
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Referer", "http://evil.example/phishing")
      .send("name=Anna&email=anna%40example.com&message=Hallo");

    expect(res.status).toBe(303);
    expect(res.headers.location).toBe("/?kontakt=gesendet#kontakt");
  });

  test("Form-POST mit protokollrelativem Referer-Pfad ('//evil.com/x') → kein Open-Redirect, Fallback auf '/'", async () => {
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Referer", "http://127.0.0.1//evil.com/x")
      .send("name=Anna&email=anna%40example.com&message=Hallo");

    expect(res.status).toBe(303);
    expect(res.headers.location).toBe("/?kontakt=gesendet#kontakt");
    expect(res.headers.location.startsWith("//")).toBe(false);
  });

  test("Form-POST bei Rate-Limit → 303 Redirect mit ?kontakt=fehler", async () => {
    mockedDb.countRecentSubmissionsByIp.mockResolvedValue(5);
    const res = await request(buildApp())
      .post("/api/site/brandt/contact")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Referer", "http://127.0.0.1/site/brandt")
      .send("name=Anna&email=anna%40example.com&message=Hallo");

    expect(res.status).toBe(303);
    expect(res.headers.location).toBe("/site/brandt?kontakt=fehler#kontakt");
  });
});
