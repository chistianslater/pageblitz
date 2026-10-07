/**
 * Nur die Fotos bestehender Seiten erneuern (2026-10-07): Seiten ohne oder
 * mit wenigen eigenen Google-Fotos trugen Stockbilder aus dem alten festen
 * Satz — vier Friseure dasselbe Titelbild. Eigene Fotos bleiben vorn,
 * Unsplash füllt je Betrieb unterschiedlich auf. Texte, Design und Links
 * bleiben; die alte Fassung liegt im Verlauf („Stand vor Fotowechsel").
 *
 *   npx tsx -r dotenv/config scripts/refresh-photos.ts 571 574 578
 */
import {
  getBusinessById,
  getWebsiteById,
  insertWebsiteVersion,
  updateWebsite,
} from "../server/db";
import { withStagePhoto } from "../server/generationV2/heroPhoto";
import { resolveIndustryFamily } from "../server/generationV2/industryFamily";
import { unsplashFill } from "../server/generationV2/unsplashFill";
import { assertV2SafeWrite } from "../server/v2WriteGuard";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../shared/siteContract/types";

const TARGET_PHOTOS = 9;
const FILL_RESERVE = 3;
const MIN_GALLERY = 3;
const OWN_PHOTO = /https?:\/\/[^"\s]+\/gmb-[^"\s]+/g;

type Section = WebsiteDataV2["sections"][number];
type GalleryImage = { url: string; alt: string; caption?: string };

function galleryImages(
  doc: WebsiteDataV2,
  urls: string[]
): GalleryImage[] {
  const old = doc.sections.find(s => s.type === "gallery") as
    | { images: GalleryImage[] }
    | undefined;
  return urls.map(
    (url, i) =>
      old?.images.find(img => img.url === url) ?? {
        url,
        alt: `${doc.businessName} – Eindruck ${i + 1}`,
      }
  );
}

function withPhotos(
  doc: WebsiteDataV2,
  hero: string | undefined,
  about: string | undefined,
  gallery: string[]
): Section[] {
  const images = galleryImages(doc, gallery);
  const sections = doc.sections.map((section): Section => {
    if (section.type === "hero" && hero) return { ...section, imageUrl: hero };
    if (section.type === "about" && about)
      return { ...section, imageUrl: about };
    if (section.type === "gallery" && images.length >= MIN_GALLERY)
      return { ...section, images };
    return section;
  });
  if (
    images.length < MIN_GALLERY ||
    sections.some(s => s.type === "gallery")
  )
    return sections;
  // Galerie fehlte (zu wenig Fotos bei der Erzeugung) — vor Bewertungen/Kontakt.
  const at = sections.findIndex(
    s => s.type === "testimonials" || s.type === "contact"
  );
  const added = { type: "gallery", images } as Section;
  return at < 0
    ? [...sections, added]
    : [...sections.slice(0, at), added, ...sections.slice(at)];
}

async function refresh(websiteId: number): Promise<string> {
  const website = await getWebsiteById(websiteId);
  const parsed = WebsiteDataV2Schema.safeParse(website?.websiteData);
  if (!website || !parsed.success) return `✗ ${websiteId}: keine v2-Seite`;
  const doc = parsed.data;
  const business = await getBusinessById(website.businessId);
  const category = business?.category || website.industry || "";
  const own = Array.from(
    new Set(JSON.stringify(doc.sections).match(OWN_PHOTO) ?? [])
  );
  const family =
    doc.blueprintFamily ?? resolveIndustryFamily(category, doc.businessName);
  const fill = await unsplashFill(
    category,
    family,
    Math.max(0, TARGET_PHOTOS - own.length) + FILL_RESERVE,
    {},
    doc.businessName
  );
  if (fill.urls.length === 0)
    return `✗ ${websiteId}: Unsplash lieferte nichts (${category})`;

  const pool = Array.from(new Set([...own, ...fill.urls]));
  const images = await withStagePhoto(
    { hero: pool[0], about: pool[1], gallery: pool },
    {},
    category
  );
  const sections = withPhotos(
    doc,
    images.hero,
    images.about,
    (images.gallery ?? []).slice(0, TARGET_PHOTOS)
  );
  const json = JSON.stringify(sections);
  const credits = fill.credits.filter(c => json.includes(c.match));
  const next = WebsiteDataV2Schema.parse({
    ...doc,
    sections,
    photoCredits: credits.length ? credits : undefined,
  });

  await insertWebsiteVersion({
    websiteId,
    trigger: "generation",
    label: "Stand vor Fotowechsel",
    doc: website.websiteData,
  });
  assertV2SafeWrite(website.websiteData, next);
  await updateWebsite(websiteId, { websiteData: next as any });
  return `✓ ${websiteId} ${doc.businessName} (${category}): ${own.length} eigene + ${credits.length} Unsplash`;
}

const ids = process.argv.slice(2).map(Number).filter(Number.isFinite);
if (ids.length === 0) {
  console.error("Website-IDs angeben, z. B. 571 574");
  process.exit(1);
}
for (const id of ids) {
  try {
    console.log(await refresh(id));
  } catch (err) {
    console.log(`✗ ${id}: ${(err as Error).message.slice(0, 200)}`);
  }
}
process.exit(0);
