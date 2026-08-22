import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Hashed assets (JS/CSS with content hash in filename) → immutable, 1 year
  app.use("/assets", express.static(path.join(distPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  }));

  // All other static files (index.html, favicon, etc.) → short cache
  app.use(express.static(distPath, {
    maxAge: "5m",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    const indexFile = path.resolve(distPath, "index.html");

    // Vorher bekam JEDER unbekannte Pfad index.html mit Status 200 – auch
    // /gibtsnicht-xyz oder /og-image.jpg. Für Google sind das Soft-404s: Die
    // Seiten sehen gültig aus, haben aber keinen Inhalt. Das kostet Crawl-Budget
    // und drückt die wahrgenommene Qualität der Domain.
    // Jetzt: unbekannter Pfad → echter 404. index.html geht trotzdem raus, damit
    // der Nutzer die gestaltete NotFound-Seite der App sieht statt nackten Texts.
    if (!isCustomerSiteHost(req.hostname) && !isKnownSpaRoute(req.originalUrl)) {
      return res.status(404).sendFile(indexFile);
    }
    res.sendFile(indexFile);
  });
}

/**
 * Auf Kunden-Subdomains (kunde.pageblitz.de) rendert die App unter *jedem* Pfad
 * die Kundenseite – siehe getCustomerSubdomain() in client/src/App.tsx. Dort
 * darf also nicht pauschal 404 gesetzt werden.
 */
const RESERVED_SUBDOMAINS = ["www", "api", "analytics", "admin", "mail", "ftp"];

function isCustomerSiteHost(hostname: string): boolean {
  const match = /^([a-z0-9][a-z0-9-]*)\.pageblitz\.de$/.exec(hostname);
  return match !== null && !RESERVED_SUBDOMAINS.includes(match[1]);
}

/** Muss mit den Routen in client/src/App.tsx übereinstimmen. */
const SPA_ROUTES: RegExp[] = [
  /^\/$/,
  /^\/(impressum|datenschutz|start|welcome-back|login|admin-login|my-website|my-account|variant-preview)$/,
  /^\/admin(\/.*)?$/,
  /^\/preview\/[^/]+(\/onboarding)?$/,
  /^\/site\/[^/]+(\/(impressum|datenschutz))?$/,
  /^\/websites\/\d+\/onboarding$/,
  /^\/layout-preview\/[^/]+$/,
  // Studio (v2 Onboarding/Editor) — Direktaufruf/Reload muss von der SPA
  // bedient werden statt einem 404, siehe client/src/App.tsx "/onboarding/:token".
  /^\/onboarding\/[^/]+$/,
];

/** Pure, testbare Variante von isKnownSpaRoute — nimmt bereits einen reinen Pfad (ohne Query). */
export function isSpaRoute(pathname: string): boolean {
  const normalized = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return SPA_ROUTES.some((route) => route.test(normalized));
}

function isKnownSpaRoute(originalUrl: string): boolean {
  return isSpaRoute(originalUrl);
}
