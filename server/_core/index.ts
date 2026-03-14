import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerAdminAuthRoutes } from "./adminAuth";
import { registerGoogleAuthRoutes } from "./googleAuth";
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
  buildSitemapXml,
  buildLocalBusinessSchema,
  extractCity,
  escapeHtml,
} from "../seo/metaInjection";
import { listActiveWebsites, getWebsiteBySlugWithBusiness } from "../db";

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
  const server = createServer(app);
  // Stripe webhook MUST be registered BEFORE express.json() for signature verification
  registerStripeWebhook(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Google OAuth for customer authentication
  registerGoogleAuthRoutes(app);
  // Simple password login for self-hosted admin
  registerAdminAuthRoutes(app);
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
    res.type("text/plain").send(
      "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://pageblitz.de/sitemap.xml"
    );
  });

  // Dynamic sitemap.xml – includes all active customer websites + landing pages
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const activeWebsites = await listActiveWebsites();
      const landingPageUrls = Object.values(SEO_INDUSTRIES).flatMap((ind) => [
        { loc: `https://pageblitz.de/website-erstellen/${ind.slug}`, priority: "0.8", changefreq: "monthly" },
        ...DE_CITIES.map((city) => ({
          loc: `https://pageblitz.de/website-erstellen/${ind.slug}/${city.slug}`,
          priority: "0.6",
          changefreq: "monthly",
        })),
      ]);
      const urls = [
        { loc: "https://pageblitz.de/", priority: "1.0", changefreq: "weekly" },
        { loc: "https://pageblitz.de/website-erstellen", priority: "0.9", changefreq: "monthly" },
        ...landingPageUrls,
        ...activeWebsites.map((w) => ({
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
  app.get("/website-erstellen", (_req, res) => {
    res.type("text/html").send(generateOverviewHTML());
  });

  app.get("/website-erstellen/:industry", (req, res) => {
    const ind = SEO_INDUSTRIES[req.params.industry];
    if (!ind) return res.redirect(301, "/website-erstellen");
    res.type("text/html").send(generateLandingPageHTML(ind));
  });

  app.get("/website-erstellen/:industry/:city", (req, res) => {
    const ind = SEO_INDUSTRIES[req.params.industry];
    const city = DE_CITIES.find((c) => c.slug === req.params.city);
    if (!ind) return res.redirect(301, "/website-erstellen");
    res.type("text/html").send(generateLandingPageHTML(ind, city));
  });

  // /site/:slug – inject business-specific meta tags into index.html (production only)
  // In dev mode, Vite handles this route and the SPA works fine without server-side meta
  if (process.env.NODE_ENV !== "development") {
    const distPath = path.resolve(import.meta.dirname, "public");
    const indexHtmlPath = path.resolve(distPath, "index.html");

    const injectMetaTags = async (req: express.Request, res: express.Response) => {
      try {
        const slug = req.params.slug;
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
        const websiteData = (website.websiteData as any);
        const aboutText: string = websiteData?.about?.text ?? websiteData?.hero?.subtitle ?? "";
        const description = aboutText
          ? aboutText.slice(0, 155).replace(/\s+\S*$/, "") + (aboutText.length > 155 ? "…" : "")
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

        const html = fs.readFileSync(indexHtmlPath, "utf-8").replace("</head>", `${metaTags}\n  </head>`);
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
  });
}

startServer().catch(console.error);
