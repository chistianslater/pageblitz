import type { PackId, WebsiteDataV2 } from "../siteContract/types";
import {
  designSeed,
  type DesignProfile,
  type DesignProfileInput,
} from "../siteContract/designProfile";

/** New generation and unversioned documents use revision 2; explicit 1 preserves the reference renderer. */
export const CURRENT_DESIGN_REVISION = 2 as const;
export function artPalette(pack: PackId): Record<string, string> {
  if (pack === "gusto")
    return {
      canvas: "#192019",
      surface: "#21291f",
      ink: "#f2e9d7",
      muted: "#bdbba9",
      line: "#505746",
      accent: "#e0bc80",
    };
  if (pack === "salon-noir")
    return {
      canvas: "#eae7e9",
      surface: "#e2dce1",
      ink: "#29252e",
      muted: "#62585e",
      line: "#c5bcc2",
      accent: "#51434b",
    };
  if (pack === "raster")
    return {
      canvas: "#f7f8f7",
      surface: "#edf0ed",
      ink: "#18201e",
      muted: "#515b57",
      line: "#cbd2ce",
      accent: "#255747",
    };
  return {};
}
export const ART_COMPOSITIONS = [
  "editorial",
  "portrait",
  "panorama",
  "statement",
] as const;
export type ArtComposition = (typeof ART_COMPOSITIONS)[number];
type Direction = {
  composition: ArtComposition;
  texture: "paper" | "linen" | "none";
  emphasis: "quiet" | "expressive";
};

/** Every existing pack keeps its own body layouts, palette and typography.
 * This table sets an intentional entry composition and surface treatment.
 */
export const ART_DIRECTIONS: Record<PackId, Direction> = {
  werkbank: {
    composition: "editorial",
    texture: "paper",
    emphasis: "expressive",
  },
  kanzlei: { composition: "editorial", texture: "paper", emphasis: "quiet" },
  morgenlicht: { composition: "portrait", texture: "linen", emphasis: "quiet" },
  gusto: { composition: "editorial", texture: "paper", emphasis: "expressive" },
  patina: { composition: "panorama", texture: "paper", emphasis: "quiet" },
  "salon-noir": {
    composition: "portrait",
    texture: "linen",
    emphasis: "expressive",
  },
  marktplatz: {
    composition: "statement",
    texture: "paper",
    emphasis: "expressive",
  },
  landgut: { composition: "panorama", texture: "paper", emphasis: "quiet" },
  atelier: { composition: "portrait", texture: "none", emphasis: "expressive" },
  klarwerk: { composition: "editorial", texture: "none", emphasis: "quiet" },
  verve: { composition: "statement", texture: "none", emphasis: "expressive" },
  zunft: { composition: "editorial", texture: "paper", emphasis: "quiet" },
  schimmer: { composition: "portrait", texture: "linen", emphasis: "quiet" },
  fundament: { composition: "editorial", texture: "paper", emphasis: "quiet" },
  karat: { composition: "portrait", texture: "none", emphasis: "quiet" },
  plakat: {
    composition: "statement",
    texture: "paper",
    emphasis: "expressive",
  },
  raster: { composition: "panorama", texture: "paper", emphasis: "quiet" },
  strom: { composition: "editorial", texture: "none", emphasis: "expressive" },
  riviera: { composition: "panorama", texture: "linen", emphasis: "quiet" },
  ernte: { composition: "editorial", texture: "paper", emphasis: "expressive" },
};

const RECIPES: Record<ArtComposition, Omit<DesignProfile, "seed">> = {
  editorial: {
    version: 1,
    heroLayout: "split",
    servicesLayout: "list",
    aboutLayout: "image-right",
    galleryLayout: "mosaic",
    density: "airy",
    imageTreatment: "natural",
  },
  portrait: {
    version: 1,
    heroLayout: "split",
    servicesLayout: "featured",
    aboutLayout: "image-left",
    galleryLayout: "filmstrip",
    density: "airy",
    imageTreatment: "framed",
  },
  panorama: {
    version: 1,
    heroLayout: "image-first",
    servicesLayout: "list",
    aboutLayout: "image-right",
    galleryLayout: "mosaic",
    density: "airy",
    imageTreatment: "bleed",
  },
  statement: {
    version: 1,
    heroLayout: "centered",
    servicesLayout: "grid",
    aboutLayout: "image-left",
    galleryLayout: "grid",
    density: "airy",
    imageTreatment: "natural",
  },
};

/** Ignore color/font changes: a recolored composition still looks like a duplicate. */
export function compositionFingerprint(
  pack: string,
  profile: DesignProfile
): string {
  return [
    pack,
    profile.composition ?? "legacy",
    profile.heroLayout,
    profile.servicesLayout,
    profile.aboutLayout,
    profile.galleryLayout,
  ].join("|");
}

export function deriveArtDirectedProfile(
  input: DesignProfileInput & { stylePackId: PackId },
  occupied: ReadonlySet<string> = new Set(),
  recipeOffset = 0
): DesignProfile {
  const direction = ART_DIRECTIONS[input.stylePackId];
  const hero = input.sections.find(s => s.type === "hero");
  const services = input.sections.find(s => s.type === "services");
  const seed = designSeed(
    `${input.businessName}|${input.businessCategory ?? ""}|${input.stylePackId}`
  );
  // Photos enable spatial/portrait layouts; text-only businesses get deliberate type.
  const candidates = hero?.imageUrl
    ? [
        direction.composition,
        ...ART_COMPOSITIONS.filter(c => c !== direction.composition),
      ]
    : ["statement" as const];
  // Keep the pack's primary direction first. Only spread to an alternative when
  // an existing composition is occupied. Further cycles vary service/gallery rhythm.
  let fallback: DesignProfile | undefined;
  const choices = Array.from({ length: 3 }, (_, cycle) =>
    candidates.map(composition => ({ cycle, composition }))
  ).flat();
  const offset = Math.abs(Math.trunc(recipeOffset)) % choices.length;
  const ordered = [...choices.slice(offset), ...choices.slice(0, offset)];
  for (const { cycle, composition } of ordered) {
    const base = RECIPES[composition];
    const profile: DesignProfile = {
      ...base,
      composition,
      seed,
      servicesLayout:
        (services?.items?.length ?? 0) > 6
          ? "grid"
          : cycle === 1
            ? "featured"
            : cycle === 2
              ? "grid"
              : base.servicesLayout,
      galleryLayout:
        cycle === 1 ? "filmstrip" : cycle === 2 ? "grid" : base.galleryLayout,
      heroLayoutMobile: hero?.imageUrl ? "split" : "centered",
      servicesLayoutMobile: "list",
      galleryLayoutMobile: "grid",
    };
    fallback ??= profile;
    if (!occupied.has(compositionFingerprint(input.stylePackId, profile)))
      return profile;
  }
  return fallback!;
}

export function artComposition(data: WebsiteDataV2): ArtComposition {
  return (
    data.designProfile?.composition ??
    ART_DIRECTIONS[data.stylePackId].composition
  );
}

/** Ranking is constrained to eligible designs. Context never changes business facts. */
export function rankArtDirections(
  pool: readonly PackId[],
  context = ""
): PackId[] {
  const signals: Partial<Record<PackId, RegExp>> = {
    "salon-noir": /boutique|exklusiv|luxus|luxury|premium|balayage/i,
    schimmer: /wellness|pflege|entspann|beauty|kosmetik/i,
    morgenlicht: /familien|familie|kinder|persönlich|gesundheit/i,
    patina: /tradition|handgemacht|gemütlich|historisch/i,
    landgut: /natur|regional|landhaus|garten|nachhaltig/i,
    gusto: /italien|trattoria|pasta|wein|küche/i,
    verve: /urban|sport|fitness|dynamisch|barber/i,
    raster: /architektur|minimal|raum|präzision/i,
    werkbank: /werkstatt|handwerk|schreiner|holz/i,
    klarwerk: /software|digital|technologie|it-service/i,
    fundament: /beratung|sicherheit|immobilien|finanzen/i,
  };
  const matches = pool.filter(id => signals[id]?.test(context));
  return matches.length ? matches : [...pool];
}

export function withArtDirection(
  data: WebsiteDataV2,
  occupied: ReadonlySet<string> = new Set()
): WebsiteDataV2 {
  return {
    ...data,
    designRevision: CURRENT_DESIGN_REVISION,
    designProfile: deriveArtDirectedProfile(data, occupied),
  };
}
