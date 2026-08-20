import { describe, expect, test } from "vitest";
import express from "express";
import request from "supertest";
import { registerSsrRoutes } from "./routes";

describe("SSR routes", () => {
  test("dev-preview liefert HTML für werkbank/full", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get("/dev/site-preview?pack=werkbank&fixture=full");
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="leistungen"');
  });
  test("unbekanntes Pack → 400 mit Meldung", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get("/dev/site-preview?pack=disco&fixture=full");
    expect(res.status).toBe(400);
  });
});
