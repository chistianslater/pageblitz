import { beforeEach, describe, expect, test, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../db", () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn().mockResolvedValue(undefined),
  getWebsiteBySlug: vi.fn(),
  upsertBusiness: vi.fn().mockResolvedValue(7),
  createGeneratedWebsite: vi.fn().mockResolvedValue(42),
  updateWebsite: vi.fn().mockResolvedValue(undefined),
  getSubscriptionByWebsiteId: vi.fn(),
  createSubscription: vi.fn().mockResolvedValue(9),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../_core/magicLinkAuth", () => ({
  issueSessionCookie: vi.fn(async (_req, res) => {
    res.cookie("app_session_id", "fake-session-token", { httpOnly: true });
  }),
}));

import * as db from "../db";
import { issueSessionCookie } from "../_core/magicLinkAuth";
import { registerDashboardDevSeed } from "./devDashboardSeed";

const mockedDb = vi.mocked(db);
const mockedIssueSessionCookie = vi.mocked(issueSessionCookie);

function app() {
  const a = express();
  registerDashboardDevSeed(a);
  return a;
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
});

describe("/dev/dashboard-seed", () => {
  test("production → 404 (nicht verfügbar)", async () => {
    process.env.NODE_ENV = "production";
    expect((await request(app()).get("/dev/dashboard-seed")).status).toBe(404);
    expect(mockedDb.createUser).not.toHaveBeenCalled();
  });

  test("unbekanntes Pack → 400", async () => {
    expect(
      (await request(app()).get("/dev/dashboard-seed?pack=disco")).status
    ).toBe(400);
  });

  test("neu: legt User, Business+Website (status active) und Subscription (status active) an, setzt Session-Cookie, redirectet auf /my-website", async () => {
    mockedDb.getUserByEmail
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        id: 5,
        openId: "dev-dashboard:dev-dashboard@example.test",
        email: "dev-dashboard@example.test",
        name: "Dev Dashboard",
      } as any);
    mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue(undefined);

    const res = await request(app()).get(
      "/dev/dashboard-seed?pack=werkbank&fixture=full"
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/my-website");
    expect(mockedDb.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "dev-dashboard@example.test",
      })
    );
    expect(mockedDb.createGeneratedWebsite).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "dev-dashboard-werkbank",
        status: "active",
        customerEmail: "dev-dashboard@example.test",
      })
    );
    expect(mockedDb.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        websiteId: 42,
        userId: 5,
        status: "active",
        checkoutEmail: "dev-dashboard@example.test",
      })
    );
    expect(mockedIssueSessionCookie).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        openId: "dev-dashboard:dev-dashboard@example.test",
        email: "dev-dashboard@example.test",
      })
    );
    expect(res.headers["set-cookie"]?.[0]).toMatch(/app_session_id=/);
  });

  test("json=1: antwortet mit websiteId/slug/previewToken statt Redirect", async () => {
    mockedDb.getUserByEmail.mockResolvedValue({
      id: 5,
      openId: "dev-dashboard:dev-dashboard@example.test",
      email: "dev-dashboard@example.test",
      name: "Dev Dashboard",
    } as any);
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      id: 42,
      previewToken: "t".repeat(32),
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 9,
      userId: 5,
      status: "active",
    } as any);

    const res = await request(app()).get(
      "/dev/dashboard-seed?pack=werkbank&fixture=full&json=1"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      websiteId: 42,
      slug: "dev-dashboard-werkbank",
      previewToken: "t".repeat(32),
    });
  });

  test("wiederholter Aufruf: findet User per E-Mail und Website per Slug, legt nichts doppelt an", async () => {
    mockedDb.getUserByEmail.mockResolvedValue({
      id: 5,
      openId: "dev-dashboard:dev-dashboard@example.test",
      email: "dev-dashboard@example.test",
      name: "Dev Dashboard",
    } as any);
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      id: 42,
      previewToken: "t".repeat(32),
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 9,
      userId: 5,
      status: "active",
    } as any);

    await request(app()).get(
      "/dev/dashboard-seed?pack=werkbank&fixture=full&json=1"
    );

    expect(mockedDb.createUser).not.toHaveBeenCalled();
    expect(mockedDb.createGeneratedWebsite).not.toHaveBeenCalled();
    expect(mockedDb.createSubscription).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ status: "active" })
    );
  });

  test("vorhandene Website ohne previewToken: erzeugt Token per updateWebsite", async () => {
    mockedDb.getUserByEmail.mockResolvedValue({
      id: 5,
      openId: "dev-dashboard:dev-dashboard@example.test",
      email: "dev-dashboard@example.test",
      name: "Dev Dashboard",
    } as any);
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      id: 42,
      previewToken: null,
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 9,
      userId: 5,
      status: "active",
    } as any);

    const res = await request(app()).get(
      "/dev/dashboard-seed?pack=werkbank&fixture=full&json=1"
    );

    expect(res.status).toBe(200);
    expect(res.body.previewToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        previewToken: expect.stringMatching(/^[A-Za-z0-9_-]{32}$/),
      })
    );
  });
});
