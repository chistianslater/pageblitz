import "dotenv/config";
import "@shared/zodLocale";
import compression from "compression";
import express from "express";
import { createServer } from "http";
import net from "net";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerAdminAuthRoutes } from "./adminAuth";
import { registerGoogleAuthRoutes } from "./googleAuth";
import { registerMagicLinkAuthRoutes } from "./magicLinkAuth";
import { registerChatRoutes } from "./chatRoutes";
import { registerLandingChatRoutes } from "./landingChatRoutes";
import { registerSupportChatRoutes } from "./supportChatRoutes";
import { registerBookingRoutes } from "./bookingRoutes";
import { registerContactRoutes } from "../contactSubmit";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./static";
import { registerStripeWebhook } from "../stripeWebhook";
import {
  SEO_INDUSTRIES,
  DE_CITIES,
  generateLandingPageHTML,
  generateOverviewHTML,
} from "../seo/landingPages";
import {
  BLOG_POSTS,
  getBlogPost,
  renderBlogIndexHTML,
  renderBlogPostHTML,
} from "../seo/blog";
import {
  buildSitemapXml,
  buildLocalBusinessSchema,
  extractCity,
  escapeHtml,
} from "../seo/metaInjection";
import {
  listActiveWebsites,
  getWebsiteBySlugWithBusiness,
  updateOutreachEmail,
} from "../db";
import { generateHomePrerender, buildHomeFaqSchema } from "../seo/homePage";
import { outreachEmails } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { registerSsrRoutes } from "../ssr/routes";
import { registerStudioDevSeed } from "../onboardingV2/devSeed";
import { registerDashboardDevSeed } from "../onboardingV2/devDashboardSeed";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  // Hinter Nginx terminiert TLS am Proxy — ohne trust proxy liest Express
  // req.protocol/req.secure immer "http" (Nginx spricht Node lokal per HTTP
  // an), was z.B. SSR-Canonicals auf http:// setzt. "1" vertraut dem ersten
  // Hop (unserem eigenen Nginx) und liest X-Forwarded-Proto/-For von dort.
  app.set("trust proxy", 1);
  const server = createServer(app);

  // ── Compression (gzip/brotli) for all text responses ──────────────────────
  app.use(compression({ threshold: 1024 }));

  // Stripe webhook MUST be registered BEFORE express.json() for signature verification
  registerStripeWebhook(app);

  // Resend webhook für Email-Tracking (open/click/bounce). Deckt sowohl
  // Outreach- als auch Lifecycle-Mails ab – die email_id matcht jeweils nur
  // eine der beiden Tabellen, das andere Update trifft 0 Rows (harmlos).
  app.post("/api/webhooks/resend", express.json(), async (req, res) => {
    try {
      const { type, data } = req.body ?? {};
      if (!type || !data?.email_id) {
        res.json({ ok: true });
        return;
      }
      const db = await (await import("../db")).getDb();
      if (db) {
        const { lifecycleEmails } = await import("../../drizzle/schema");
        const { eq: eqOp, and: andOp, isNull } = await import("drizzle-orm");
        const emailId = data.email_id as string;
        const now = new Date();

        if (type === "email.opened") {
          await db
            .update(outreachEmails)
            .set({ status: "opened" })
            .where(eq(outreachEmails.resendEmailId, emailId));
          // Lifecycle: openedAt nur setzen, wenn noch nicht gesetzt (erstes Öffnen)
          await db
            .update(lifecycleEmails)
            .set({ openedAt: now })
            .where(
              andOp(
                eqOp(lifecycleEmails.resendEmailId, emailId),
                isNull(lifecycleEmails.openedAt)
              )
            );
        } else if (type === "email.clicked") {
          await db
            .update(outreachEmails)
            .set({ status: "opened" })
            .where(eq(outreachEmails.resendEmailId, emailId));
          // Klick impliziert Öffnung – beide Felder setzen (openedAt nur falls leer)
          await db
            .update(lifecycleEmails)
            .set({ clickedAt: now })
            .where(eqOp(lifecycleEmails.resendEmailId, emailId));
          await db
            .update(lifecycleEmails)
            .set({ openedAt: now })
            .where(
              andOp(
                eqOp(lifecycleEmails.resendEmailId, emailId),
                isNull(lifecycleEmails.openedAt)
              )
            );
        } else if (type === "email.bounced" || type === "email.complained") {
          await db
            .update(outreachEmails)
            .set({ status: "bounced" })
            .where(eq(outreachEmails.resendEmailId, emailId));
          await db
            .update(lifecycleEmails)
            .set({ status: "bounced" })
            .where(eqOp(lifecycleEmails.resendEmailId, emailId));
        }
      }
    } catch (err) {
      console.error("[Resend Webhook] Error:", err);
    }
    res.json({ ok: true });
  });
  // ── Client-Error Logging (vor express.json mit kleinerem Limit) ──────────
  // Fängt Errors vom ErrorBoundary + window.onerror + unhandledrejection.
  // Schreibt in DB (client_errors, gruppiert via Fingerprint) + Console (PM2).
  // Rate-Limit: max 200 Errors/Stunde pro IP (in-memory).
  const clientErrorBuckets = new Map<
    string,
    { count: number; resetAt: number }
  >();
  app.post(
    "/api/client-error",
    express.json({ limit: "32kb" }),
    async (req, res) => {
      try {
        const ip = (req.ip || req.headers["x-forwarded-for"] || "unknown")
          .toString()
          .slice(0, 64);
        const now = Date.now();
        const bucket = clientErrorBuckets.get(ip);
        if (bucket && bucket.resetAt > now) {
          if (bucket.count > 200) {
            res.json({ ok: true, throttled: true });
            return;
          }
          bucket.count++;
        } else {
          clientErrorBuckets.set(ip, {
            count: 1,
            resetAt: now + 60 * 60 * 1000,
          });
        }

        const body = req.body ?? {};
        const source = String(body.source || "react");
        const validSources = [
          "react",
          "window-error",
          "unhandled-rejection",
          "server",
        ] as const;
        const safeSource = (validSources as readonly string[]).includes(source)
          ? source
          : "react";
        const message = String(body.message || "Unknown error").slice(0, 1000);
        const stack = body.stack ? String(body.stack).slice(0, 6000) : null;
        const componentStack = body.componentStack
          ? String(body.componentStack).slice(0, 4000)
          : null;
        const url = body.url ? String(body.url).slice(0, 1024) : null;
        const userAgent = body.userAgent
          ? String(body.userAgent).slice(0, 500)
          : null;

        // Fingerprint: source + message + erste 2 Stack-Frames → gruppiert identische Errors
        const stackPrefix = stack
          ? stack.split("\n").slice(0, 3).join("\n")
          : "";
        const fingerprint = crypto
          .createHash("sha256")
          .update(`${safeSource}|${message}|${stackPrefix}`)
          .digest("hex")
          .slice(0, 64);

        // Console (für tail -f / PM2 logs)
        console.error(`[Client Error] ${safeSource}`, {
          message,
          url,
          ip,
          fingerprint: fingerprint.slice(0, 8),
        });

        // DB-Upsert: bei doppeltem Fingerprint → occurrences++, lastSeenAt update
        try {
          const { getDb } = await import("../db");
          const { clientErrors } = await import("../../drizzle/schema");
          const { sql } = await import("drizzle-orm");
          const db = await getDb();
          if (db) {
            await db
              .insert(clientErrors)
              .values({
                fingerprint,
                source: safeSource as any,
                message,
                stack,
                componentStack,
                url,
                userAgent,
                ip,
              })
              .onDuplicateKeyUpdate({
                set: {
                  occurrences: sql`${clientErrors.occurrences} + 1`,
                  lastSeenAt: new Date(),
                  stack: sql`COALESCE(${clientErrors.stack}, VALUES(stack))`, // behalte ersten Stack
                  url: sql`VALUES(url)`,
                  userAgent: sql`VALUES(userAgent)`,
                  ip: sql`VALUES(ip)`,
                  // Resolved-Status zurücksetzen bei neuem Auftreten:
                  resolvedAt: sql`NULL`,
                  resolvedBy: sql`NULL`,
                },
              });
          }
        } catch (dbErr) {
          console.warn(
            "[Client Error] DB-Insert fehlgeschlagen (Tabelle existiert?):",
            dbErr
          );
        }
      } catch (err) {
        console.warn("[Client Error] log endpoint error:", err);
      }
      res.json({ ok: true });
    }
  );

  // Bucket-Cleanup alle 30 Min (verhindert Memory-Leak)
  setInterval(
    () => {
      const now = Date.now();
      for (const [ip, b] of clientErrorBuckets) {
        if (b.resetAt <= now) clientErrorBuckets.delete(ip);
      }
    },
    30 * 60 * 1000
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Google OAuth for customer authentication
  registerGoogleAuthRoutes(app);
  // Simple password login for self-hosted admin
  registerAdminAuthRoutes(app);
  // Passwordless Magic-Link login for customers
  registerMagicLinkAuthRoutes(app);
  registerChatRoutes(app);
  registerLandingChatRoutes(app);
  registerSupportChatRoutes(app);
  registerBookingRoutes(app);
  // Kontaktformular-Insel: No-JS-Fallback (Form-POST) + JSON-Fetch (Hydration)
  registerContactRoutes(app);
  // Lifecycle-Email Routes (Extension + Unsubscribe, HMAC-signed)
  {
    const { verifyLifecycleToken } = await import("./lifecycleScheduler");
    const { extendReservation, unsubscribeEmail } = await import(
      "./lifecycleScheduler"
    );

    const renderInfoPage = (
      title: string,
      message: string,
      cta?: { label: string; href: string }
    ) => `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Pageblitz</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f7f5f1; margin: 0; padding: 40px 16px; color: #1d1a17; }
  .card { max-width: 520px; margin: 0 auto; background: #fdfcfa; border: 1px solid #ddd6c9; border-radius: 14px; padding: 40px 32px; }
  h1 { font-size: 22px; margin: 0 0 16px 0; }
  p { font-size: 15px; line-height: 1.6; color: #3f3a34; margin: 0 0 16px 0; }
  a.cta { display: inline-block; margin-top: 16px; background: #1f5f4b; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 15px; }
  .logo { font-size: 18px; font-weight: 600; color: #1d1a17; margin-bottom: 24px; }
</style></head><body>
  <div class="card">
    <div class="logo">Pageblitz</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${cta ? `<a class="cta" href="${cta.href}">${cta.label}</a>` : ""}
  </div>
</body></html>`;

    app.get("/api/lifecycle/extend", async (req, res) => {
      const token = (req.query.token as string) || "";
      const verified = verifyLifecycleToken(token);
      if (!verified || verified.action !== "extend") {
        res
          .status(400)
          .send(
            renderInfoPage(
              "Link ungültig",
              "Dieser Verlängerungs-Link ist abgelaufen oder ungültig. Wenn du Hilfe brauchst, antworte einfach auf die letzte Email."
            )
          );
        return;
      }
      const result = await extendReservation(verified.websiteId);
      if (!result.success) {
        res
          .status(400)
          .send(
            renderInfoPage(
              "Verlängerung nicht möglich",
              result.error ||
                "Leider konnte die Reservierung nicht verlängert werden."
            )
          );
        return;
      }
      const untilDe =
        result.newReservedUntil?.toLocaleString("de-DE", {
          dateStyle: "full",
          timeStyle: "short",
        }) || "später";
      const remaining = result.remainingExtensions ?? 0;
      const remainText =
        remaining > 0
          ? `Du kannst die Reservierung bei Bedarf noch ${remaining}× verlängern.`
          : "Das war deine letzte Verlängerung – bei Fragen: antworte einfach auf die Email.";
      const { getWebsiteById } = await import("../db");
      const website = await getWebsiteById(verified.websiteId);
      const ctaHref = website?.previewToken
        ? `/onboarding/${website.previewToken}`
        : "/";
      res.send(
        renderInfoPage(
          "Reservierung verlängert",
          `Alles klar – dein Website-Entwurf ist jetzt bis <strong>${untilDe}</strong> für dich reserviert. ${remainText}`,
          { label: "Weiter zu deiner Website", href: ctaHref }
        )
      );
    });

    app.get("/api/lifecycle/unsubscribe", async (req, res) => {
      const token = (req.query.token as string) || "";
      const verified = verifyLifecycleToken(token);
      if (!verified || verified.action !== "unsubscribe") {
        res
          .status(400)
          .send(
            renderInfoPage(
              "Link ungültig",
              "Dieser Abmelde-Link ist abgelaufen oder ungültig."
            )
          );
        return;
      }
      await unsubscribeEmail(verified.email);
      res.send(
        renderInfoPage(
          "Abgemeldet",
          "Du bekommst keine weiteren automatischen Erinnerungen von uns. Falls du doch noch Hilfe brauchst, schreib uns einfach: christian@pageblitz.de"
        )
      );
    });
  }
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // ── SEO Routes ─────────────────────────────────────────────────────────────
  // Must be registered BEFORE the SPA catch-all handler

  // robots.txt
  app.get("/robots.txt", (_req, res) => {
    res
      .type("text/plain")
      .send(
        "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://pageblitz.de/sitemap.xml"
      );
  });

  // llms.txt (Audit 2026-08-30, Punkt 5): kompakte Orientierung für
  // KI-Crawler (GPTBot, ClaudeBot, PerplexityBot — robots.txt lässt sie zu).
  app.get("/llms.txt", (_req, res) => {
    res
      .type("text/plain")
      .send(
        [
          "# Pageblitz",
          "",
          "> Pageblitz erstellt per KI in ca. 3 Minuten eine fertige Website",
          "> für Kleinunternehmen in Deutschland (Friseure, Handwerker,",
          "> Restaurants u. v. m.). Basis 19,90 €/Monat (jährlich) bzw.",
          "> 24,90 €/Monat (monatlich), 7 Tage gratis testen, DSGVO-konform,",
          "> Hosting in Deutschland inklusive.",
          "",
          "## Wichtige Seiten",
          "",
          "- [Startseite](https://pageblitz.de/): Produkt, Preise, FAQ",
          "- [Website erstellen nach Branche](https://pageblitz.de/website-erstellen): 37 Branchen-Übersicht",
          "- [Beispiel Branche](https://pageblitz.de/website-erstellen/friseur): Friseur-Website",
          "- [Blog](https://pageblitz.de/blog): Anleitungen für Kleinunternehmer (Impressum, Website-Pflichten)",
          "",
          "## Kontakt",
          "",
          "- [Impressum](https://pageblitz.de/impressum)",
        ].join("\n")
      );
  });

  // Dynamic sitemap.xml – includes all active customer websites + landing pages
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const activeWebsites = await listActiveWebsites();
      const landingPageUrls = Object.values(SEO_INDUSTRIES).flatMap(ind => [
        {
          loc: `https://pageblitz.de/website-erstellen/${ind.slug}`,
          priority: "0.8",
          changefreq: "monthly",
        },
        ...DE_CITIES.map(city => ({
          loc: `https://pageblitz.de/website-erstellen/${ind.slug}/${city.slug}`,
          priority: "0.6",
          changefreq: "monthly",
        })),
      ]);
      const urls = [
        { loc: "https://pageblitz.de/", priority: "1.0", changefreq: "weekly" },
        {
          loc: "https://pageblitz.de/website-erstellen",
          priority: "0.9",
          changefreq: "monthly",
        },
        {
          loc: "https://pageblitz.de/blog",
          priority: "0.7",
          changefreq: "weekly",
        },
        ...BLOG_POSTS.map(post => ({
          loc: `https://pageblitz.de/blog/${post.slug}`,
          priority: "0.7",
          changefreq: "monthly",
        })),
        ...landingPageUrls,
        // Interne Demo-Seiten (admin-demo-<userId>) gehören nicht in die
        // öffentliche Sitemap (Audit 2026-08-30, Punkt 3).
        ...activeWebsites
          .filter(w => !w.slug.startsWith("admin-demo-"))
          .map(w => ({
            loc: `https://pageblitz.de/site/${w.slug}`,
            priority: "0.5",
            changefreq: "monthly",
          })),
      ];
      res.type("application/xml").send(buildSitemapXml(urls));
    } catch (err) {
      console.error("[SEO] sitemap.xml error:", err);
      res.status(500).send("<!-- sitemap generation error -->");
    }
  });

  // Programmatic landing pages – served as full HTML (no JS dependency for crawlers)
  const LANDING_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

  app.get("/website-erstellen", (_req, res) => {
    res.setHeader("Cache-Control", LANDING_CACHE);
    res.type("text/html").send(generateOverviewHTML());
  });

  // Blog (SEO-Task 2, 2026-08-31): SSR-HTML wie die programmatischen
  // Pages — kein SPA-Bundle, Inhalte in server/seo/blog.ts.
  app.get("/blog", (_req, res) => {
    res.setHeader("Cache-Control", LANDING_CACHE);
    res.type("text/html").send(renderBlogIndexHTML());
  });

  app.get("/blog/:slug", (req, res) => {
    const post = getBlogPost(req.params.slug);
    if (!post) return res.redirect(301, "/blog");
    res.setHeader("Cache-Control", LANDING_CACHE);
    res.type("text/html").send(renderBlogPostHTML(post));
  });

  app.get("/website-erstellen/:industry", (req, res) => {
    const ind = SEO_INDUSTRIES[req.params.industry];
    if (!ind) return res.redirect(301, "/website-erstellen");
    res.setHeader("Cache-Control", LANDING_CACHE);
    res.type("text/html").send(generateLandingPageHTML(ind));
  });

  app.get("/website-erstellen/:industry/:city", (req, res) => {
    const ind = SEO_INDUSTRIES[req.params.industry];
    if (!ind) return res.redirect(301, "/website-erstellen");
    const city = DE_CITIES.find(c => c.slug === req.params.city);
    // Unbekannte Stadt = eine der 39 abgeschalteten Städte-Seiten (oder ein
    // Tippfehler). Vorher wurde hier die Branchenseite unter der Städte-URL
    // ausgeliefert – also ein Duplikat mit Status 200. Jetzt sauber 301 auf das
    // Original, damit Google die alten URLs konsolidiert statt sie zu behalten.
    if (!city) return res.redirect(301, `/website-erstellen/${ind.slug}`);
    res.setHeader("Cache-Control", LANDING_CACHE);
    res.type("text/html").send(generateLandingPageHTML(ind, city));
  });

  // ── Dev-Seed-Routen (Nur Entwicklung) ───────────────────────────────────────
  registerStudioDevSeed(app);
  registerDashboardDevSeed(app);

  // ── SSR-Inseln-Bundle (statisch) ────────────────────────────────────────────
  // Muss vor registerSsrRoutes() stehen: /islands/<name>.<hash>.js wird von
  // renderSiteHtml() (server/ssr/renderSite.tsx, über getIslandsBundlePath())
  // als <script src> eingebettet, sobald Features aktiv sind — dieser
  // Static-Mount liefert die Datei aus. distPath spiegelt server/_core/
  // static.ts (dev: dist/public relativ zum Repo-Root, prod: public neben
  // dem gebundelten Server).
  // Finding M1: der Dateiname trägt seit scripts/build-islands.mjs einen
  // Content-Hash (site-islands.<hash>.js) — bei einem neuen Build ändert
  // sich der Dateiname, alte URLs zeigen also nie versehentlich auf einen
  // neuen Inhalt. Deshalb hier `immutable: true` + 1 Jahr Cache, analog zu
  // den gehashten Vite-Assets in server/_core/static.ts.
  const islandsDistPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public", "islands")
      : path.resolve(import.meta.dirname, "public", "islands");
  app.use(
    "/islands",
    express.static(islandsDistPath, { maxAge: "365d", immutable: true })
  );

  // ── SSR-Routen (Dev-Preview + Kundenseiten-SSR hinter SSR_SITES-Flag) ───────
  // MUSS vor injectMetaTags registriert werden: injectMetaTags ruft nie next()
  // (jede /site/:slug-Anfrage endet dort), d.h. registriert man SSR danach,
  // feuert die SSR-Middleware in Produktion nie für /site/:slug. SSR bekommt
  // hier "first refusal" – lehnt sie ab (next()), greift injectMetaTags wie
  // bisher. Muss außerdem vor dem SPA-Fallback (Vite-Middleware in dev,
  // serveStatic()'s `app.use("*", ...)` in prod, server/_core/static.ts)
  // stehen, damit sie überhaupt greifen kann, bevor jede Route auf
  // index.html fällt.
  registerSsrRoutes(app);

  // /site/:slug – inject business-specific meta tags into index.html (production only)
  // In dev mode, Vite handles this route and the SPA works fine without server-side meta
  if (process.env.NODE_ENV !== "development") {
    const distPath = path.resolve(import.meta.dirname, "public");
    const indexHtmlPath = path.resolve(distPath, "index.html");

    // ── Startseite: Prerender in #root ───────────────────────────────────────
    // `/` lieferte bisher nur <div id="root"></div> – für Crawler ohne
    // JS-Rendering also eine leere Seite. Hier wird der Landingpage-Inhalt als
    // statisches HTML hineingeschrieben; React ersetzt ihn beim Mounten.
    // Das FAQ-Schema kommt aus shared/faq.ts, damit es nicht wieder vom
    // sichtbaren Inhalt abweicht.
    let homeHtmlCache: string | null = null;
    app.get("/", (_req, res) => {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      try {
        if (homeHtmlCache === null) {
          if (!fs.existsSync(indexHtmlPath)) {
            console.error("[SEO] index.html fehlt:", indexHtmlPath);
            return res.status(500).send("Server error");
          }
          homeHtmlCache = fs
            .readFileSync(indexHtmlPath, "utf-8")
            .replace(
              '<div id="root"></div>',
              `<div id="root">${generateHomePrerender()}</div>`
            )
            .replace(
              "</head>",
              `<script type="application/ld+json">${buildHomeFaqSchema()}</script>\n  </head>`
            );
        }
        res.type("text/html").send(homeHtmlCache);
      } catch (err) {
        console.error("[SEO] Home-Prerender fehlgeschlagen:", err);
        if (fs.existsSync(indexHtmlPath)) return res.sendFile(indexHtmlPath);
        res.status(500).send("Server error");
      }
    });

    // ── Statische SPA-Routen: eigene Metas statt Homepage-Duplikat ──────────
    // Audit 2026-08-30, Punkt 2: /impressum, /datenschutz und /start waren
    // mit Title + Description der Startseite indexiert (SPA-Fallback).
    // Private/Funnel-Routen bekommen zusätzlich noindex.
    const spaRouteMeta = (opts: {
      title: string;
      description: string;
      canonicalPath?: string;
      noindex?: boolean;
    }) => {
      let cached: string | null = null;
      return (_req: express.Request, res: express.Response) => {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        try {
          if (cached === null) {
            if (!fs.existsSync(indexHtmlPath)) {
              return res.status(500).send("Server error");
            }
            const tags = [
              `<title>${escapeHtml(opts.title)}</title>`,
              `<meta name="description" content="${escapeHtml(opts.description)}">`,
              opts.canonicalPath
                ? `<link rel="canonical" href="https://pageblitz.de${opts.canonicalPath}">`
                : "",
              opts.noindex ? `<meta name="robots" content="noindex">` : "",
            ]
              .filter(Boolean)
              .join("\n    ");
            cached = fs
              .readFileSync(indexHtmlPath, "utf-8")
              .replace(/<title>[^<]*<\/title>/, "")
              .replace(/<meta name="description"[^>]*>/i, "")
              .replace(/<link rel="canonical"[^>]*>/i, "")
              // Basis-HTML trägt ein "index, follow"-Tag — raus, damit bei
              // noindex-Routen nicht zwei widersprüchliche Tags stehen.
              .replace(/<meta name="robots"[^>]*>/i, "")
              .replace("</head>", `${tags}\n  </head>`);
          }
          res.type("text/html").send(cached);
        } catch (err) {
          console.error("[SEO] SPA-Routen-Meta fehlgeschlagen:", err);
          if (fs.existsSync(indexHtmlPath)) return res.sendFile(indexHtmlPath);
          res.status(500).send("Server error");
        }
      };
    };
    app.get(
      "/impressum",
      spaRouteMeta({
        title: "Impressum | Pageblitz",
        description:
          "Impressum und Anbieterkennzeichnung von Pageblitz — KI-Websites für Kleinunternehmen.",
        canonicalPath: "/impressum",
      })
    );
    app.get(
      "/datenschutz",
      spaRouteMeta({
        title: "Datenschutzerklärung | Pageblitz",
        description:
          "Datenschutzerklärung von Pageblitz: Welche Daten wir verarbeiten, wofür und wie lange — DSGVO-konform, Hosting in Deutschland.",
        canonicalPath: "/datenschutz",
      })
    );
    app.get(
      "/start",
      spaRouteMeta({
        title: "Website jetzt erstellen — in 3 Minuten | Pageblitz",
        description:
          "Starte jetzt: Firmenname oder Google-Profil eingeben und in ca. 3 Minuten eine fertige Website-Vorschau erhalten. Kostenlos ansehen.",
        canonicalPath: "/start",
      })
    );
    for (const [route, title] of [
      ["/login", "Anmelden | Pageblitz"],
      ["/admin-login", "Admin | Pageblitz"],
      ["/my-website", "Meine Website | Pageblitz"],
      ["/my-account", "Mein Konto | Pageblitz"],
      ["/welcome-back", "Willkommen zurück | Pageblitz"],
      ["/design-review", "Design-Review | Pageblitz"],
    ] as const) {
      app.get(
        route,
        spaRouteMeta({
          title,
          description: "Interner Bereich von Pageblitz.",
          noindex: true,
        })
      );
    }

    const injectMetaTags = async (
      req: express.Request,
      res: express.Response
    ) => {
      // index.html darf NICHT lange gecached werden – sonst zeigt der Browser
      // nach einem Deploy alte chunk-Hashes, die nicht mehr existieren →
      // "SyntaxError: Unexpected token '<'" + Bilder/Layouts laden nicht.
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      try {
        const slug = req.params.slug;
        // Interne Demo-Seiten nie indexieren (Audit 2026-08-30, Punkt 3).
        if (slug?.startsWith("admin-demo-")) {
          res.setHeader("X-Robots-Tag", "noindex");
        }
        if (!slug || !fs.existsSync(indexHtmlPath)) {
          return res.sendFile(indexHtmlPath);
        }
        const row = await getWebsiteBySlugWithBusiness(slug);
        if (!row) {
          return res.sendFile(indexHtmlPath);
        }
        const { website, business } = row;
        const name = business?.name ?? slug;
        const city = extractCity(business?.address);
        const websiteData = website.websiteData as any;
        const aboutText: string =
          websiteData?.about?.text ?? websiteData?.hero?.subtitle ?? "";
        const description = aboutText
          ? aboutText.slice(0, 155).replace(/\s+\S*$/, "") +
            (aboutText.length > 155 ? "…" : "")
          : `Professionelle Website von ${name}${city ? " in " + city : ""}.`;

        const localBusinessSchema = buildLocalBusinessSchema(business, website);
        const schemaTag = localBusinessSchema
          ? `<script type="application/ld+json">${localBusinessSchema}</script>`
          : "";

        const metaTags = `
    <title>${escapeHtml(name)}${city ? " – " + escapeHtml(city) : ""} | Pageblitz</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:title" content="${escapeHtml(name)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <link rel="canonical" href="https://pageblitz.de/site/${slug}">
    ${schemaTag}`;

        const html = fs
          .readFileSync(indexHtmlPath, "utf-8")
          // Remove default title, description and canonical so injected ones take sole precedence
          .replace(/<title>[^<]*<\/title>/, "")
          .replace(/<meta name="description"[^>]*>/i, "")
          .replace(/<link rel="canonical"[^>]*>/i, "")
          .replace("</head>", `${metaTags}\n  </head>`);
        res.type("text/html").send(html);
      } catch (err) {
        console.error("[SEO] meta injection error:", err);
        if (fs.existsSync(indexHtmlPath)) res.sendFile(indexHtmlPath);
        else res.status(500).send("Server error");
      }
    };

    app.get("/site/:slug", injectMetaTags);
    app.get("/site/:slug/impressum", injectMetaTags);
    app.get("/site/:slug/datenschutz", injectMetaTags);
  }
  // ── End SEO Routes ──────────────────────────────────────────────────────────

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);

    // Recover orphaned generation jobs from previous process. Jobs in
    // status='processing' can never resume across a restart (the worker
    // was an in-memory async function), so mark them failed → user sees
    // a clean error instead of an endless progress bar.
    import("../db")
      .then(({ failOrphanGenerationJobs }) => failOrphanGenerationJobs())
      .then(n => {
        if (n > 0)
          console.log(
            `[Startup] Marked ${n} orphan generation job(s) as failed.`
          );
      })
      .catch(e =>
        console.error("[Startup] failOrphanGenerationJobs error:", e)
      );

    // Start automated outreach pipeline scheduler
    import("../outreachPipeline")
      .then(({ startPipelineScheduler }) => {
        startPipelineScheduler();
      })
      .catch(e => console.error("[Pipeline] Failed to start:", e));

    // Start lifecycle-email worker (sendet drip mails + löscht abgelaufene Entwürfe)
    import("./lifecycleWorker")
      .then(({ startLifecycleWorker }) => {
        startLifecycleWorker();
      })
      .catch(e => console.error("[LifecycleWorker] Failed to start:", e));
  });
}

startServer().catch(console.error);
