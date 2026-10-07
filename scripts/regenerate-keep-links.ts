/**
 * Bestehende Seiten mit den Branchen-Bauplänen neu erzeugen, ohne Adresse,
 * Vorschau-Link, Status oder Designrichtung zu ändern (2026-10-07).
 *
 *   npx tsx -r dotenv/config scripts/regenerate-keep-links.ts 504 613
 */
import { appRouter } from "../server/routers";

const ids = process.argv.slice(2).map(Number).filter(Number.isFinite);
if (ids.length === 0) throw new Error("Mindestens eine Website-ID angeben");

const caller = appRouter.createCaller({
  user: { id: 0, role: "admin", email: "skript@pageblitz.de" },
  req: { protocol: "https", headers: {} },
  res: {},
} as never);

for (const websiteId of ids) {
  try {
    const result = await caller.website.regenerate({
      websiteId,
      keepLinks: true,
    });
    console.log(`✓ ${websiteId} ${result.slug} (${result.packId})`);
  } catch (err) {
    console.log(`✗ ${websiteId}: ${(err as Error).message.slice(0, 160)}`);
  }
}
process.exit(0);
