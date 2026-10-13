/**
 * Fingerabdruck der Kundenseiten (2026-10-13, Plan „Packs entfernen", Task 1).
 *
 * Rendert Seiten per `renderSiteHtml` und schreibt je Seite einen
 * SHA-256 über Status + HTML. Nur lesen, deterministisch (fester Zeitpunkt,
 * fester Origin, Bundle-Dateinamen normalisiert). Dient als Beleg, dass das
 * SSR-HTML der sechs Designsysteme beim Aufräumen byte-gleich bleibt.
 *
 *   npx tsx scripts/seiten-fingerabdruck.ts --beispiele --fixtures --aus basis
 *   npx tsx scripts/seiten-fingerabdruck.ts --datei live.json --aus basis
 *   npx tsx scripts/seiten-fingerabdruck.ts --vergleich a.json b.json
 *
 * Mengen:
 *   --beispiele        jedes SHOWCASES-Beispiel × 6 Systeme × (3 Paletten +
 *                      ohne Palette), Startseite.
 *   --fixtures         Testkit-Fixtures (full|minimal|features) × 6 Systeme
 *                      × 3 Paletten × (/, /impressum, /datenschutz, jede
 *                      Unterseite) × (live, preview), mit slug „demo" und
 *                      Begrüßungstext für den Chat.
 *   --datei <json>     Live-Dokumente aus einem Export: Array aus
 *                      `{ id, websiteData }` (websiteData als Objekt oder
 *                      JSON-Text); je id Start-, Rechts- und Unterseiten.
 *
 * Ausgabe: `<ordner>/<aus>-beispiele.json`, `-fixtures.json`, `-live.json`
 * (Ordner per `--ordner`, Standard .superpowers/sdd/2026-10-13-packs-entfernen/baseline).
 * `--vergleich` listet abweichende/fehlende Schlüssel, Exit 1 bei Abweichung.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { renderSiteHtml } from "../server/ssr/renderSite";
import {
  SHOWCASES,
  systemShowcaseDoc,
} from "../shared/stylePacks/blueprintShowcase";
import { RELEASED_SYSTEMS, getSystem } from "../shared/designSystems/registry";
import { withDesignSystem } from "../shared/designSystems/apply";
import { getFixture } from "../shared/siteContract/fixtures";
import type { DesignSystemId } from "../shared/designSystems/types";
import type { PackId, WebsiteDataV2 } from "../shared/siteContract/types";

const NOW = new Date("2026-08-19T10:00:00+02:00");
const ORIGIN = "https://pageblitz.de";
const DEFAULT_DIR = ".superpowers/sdd/2026-10-13-packs-entfernen/baseline";
/** Fixtures, die die sechs System-Testkits verwenden. */
const TESTKIT_FIXTURES: readonly PackId[] = ["salon-noir", "werkbank", "gusto"];
const FIXTURE_KINDS = ["full", "minimal", "features"] as const;
const BUNDLE_PATH = /\/islands\/site-(islands|motion)(?:\.[^"]*)?\.js/g;

type Prints = Record<string, string>;
type RenderOpts = Parameters<typeof renderSiteHtml>[1];

function fingerprint(
  doc: WebsiteDataV2,
  opts: Omit<RenderOpts, "origin" | "now">
): string {
  const { html, status } = renderSiteHtml(doc, {
    origin: ORIGIN,
    now: NOW,
    ...opts,
  });
  const normalized = html.replace(BUNDLE_PATH, "/islands/site-$1.BUNDLE.js");
  return createHash("sha256").update(`${status}\n${normalized}`).digest("hex");
}

function paletteIds(system: DesignSystemId): string[] {
  return (getSystem(system)?.palettes ?? []).map(p => p.id);
}

function pathsOf(doc: WebsiteDataV2): string[] {
  const pages = (doc.pages ?? []).map(p => `/${p.slug}`);
  return ["/", "/impressum", "/datenschutz", ...pages];
}

function beispiele(): Prints {
  const out: Prints = {};
  for (const showcase of SHOWCASES) {
    for (const system of RELEASED_SYSTEMS) {
      for (const palette of [undefined, ...paletteIds(system)]) {
        const doc = systemShowcaseDoc(showcase, system, palette);
        const key = `beispiel/${showcase.id}/${system}/${palette ?? "ohne"}`;
        out[key] = fingerprint(doc, {
          pathname: "/",
          islandsMode: "preview",
          slug: "demo",
        });
      }
    }
  }
  return out;
}

function fixtures(): Prints {
  const out: Prints = {};
  for (const key of TESTKIT_FIXTURES) {
    for (const kind of FIXTURE_KINDS) {
      for (const system of RELEASED_SYSTEMS) {
        for (const palette of paletteIds(system)) {
          const doc = withDesignSystem(getFixture(key, kind), system, palette);
          for (const pathname of pathsOf(doc)) {
            for (const mode of ["live", "preview"] as const) {
              const k = `fixture/${key}/${kind}/${system}/${palette}${pathname}#${mode}`;
              out[k] = fingerprint(doc, {
                pathname,
                slug: "demo",
                site: { chatWelcomeMessage: "Willkommen in der Demo!" },
                ...(mode === "preview"
                  ? { islandsMode: "preview" as const }
                  : {}),
              });
            }
          }
        }
      }
    }
  }
  return out;
}

function live(file: string): Prints {
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as {
    id: number | string;
    websiteData: string | WebsiteDataV2;
  }[];
  if (!Array.isArray(rows))
    throw new Error(`${file}: erwartet ein Array aus { id, websiteData }`);
  const out: Prints = {};
  for (const row of rows) {
    const doc =
      typeof row.websiteData === "string"
        ? (JSON.parse(row.websiteData) as WebsiteDataV2)
        : row.websiteData;
    for (const pathname of pathsOf(doc)) {
      out[`live/${row.id}${pathname}`] = fingerprint(doc, {
        pathname,
        slug: String(row.id),
      });
    }
  }
  return out;
}

function sorted(prints: Prints): Prints {
  return Object.fromEntries(
    Object.entries(prints).sort(([a], [b]) => a.localeCompare(b))
  );
}

function write(dir: string, name: string, prints: Prints): void {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  fs.writeFileSync(file, `${JSON.stringify(sorted(prints), null, 2)}\n`);
  console.log(`${file}: ${Object.keys(prints).length} Seiten`);
}

function compare(a: string, b: string): number {
  const left = JSON.parse(fs.readFileSync(a, "utf8")) as Prints;
  const right = JSON.parse(fs.readFileSync(b, "utf8")) as Prints;
  const keys = [
    ...new Set([...Object.keys(left), ...Object.keys(right)]),
  ].sort();
  let diffs = 0;
  for (const key of keys) {
    if (!(key in left)) console.log(`nur in ${b}: ${key}`);
    else if (!(key in right)) console.log(`nur in ${a}: ${key}`);
    else if (left[key] !== right[key]) console.log(`abweichend: ${key}`);
    else continue;
    diffs++;
  }
  console.log(`${keys.length} Schlüssel, ${diffs} Abweichungen`);
  return diffs === 0 ? 0 : 1;
}

function main(argv: string[]): number {
  const flags = new Set<string>();
  const values: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--beispiele" || arg === "--fixtures") flags.add(arg);
    else if (arg === "--datei" || arg === "--aus" || arg === "--ordner") {
      const value = argv[++i];
      if (!value) throw new Error(`${arg} braucht einen Wert`);
      values[arg] = value;
    } else if (arg === "--vergleich") flags.add(arg);
    else if (!arg.startsWith("--") && flags.has("--vergleich")) rest.push(arg);
    else throw new Error(`Unbekanntes Argument: ${arg}`);
  }
  if (flags.has("--vergleich")) {
    if (rest.length !== 2) throw new Error("--vergleich braucht zwei Dateien");
    return compare(rest[0], rest[1]);
  }
  const prefix = values["--aus"];
  if (!prefix) throw new Error("--aus <name> fehlt");
  const dir = values["--ordner"] ?? DEFAULT_DIR;
  if (flags.has("--beispiele"))
    write(dir, `${prefix}-beispiele.json`, beispiele());
  if (flags.has("--fixtures"))
    write(dir, `${prefix}-fixtures.json`, fixtures());
  if (values["--datei"])
    write(dir, `${prefix}-live.json`, live(values["--datei"]));
  if (
    !flags.has("--beispiele") &&
    !flags.has("--fixtures") &&
    !values["--datei"]
  )
    throw new Error("Keine Menge gewählt (--beispiele, --fixtures, --datei)");
  return 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 2;
}
