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
  // Einstiege nach den Referenzen vom 2026-10-05 (Larry King, Roberta's,
  // Monte, Lamanna's): „stage" = Foto vollflächig, Name groß, Bewertung
  // groß; „colorfield" = Pack-Farbe flächig mit gestapelten Fotokarten.
  // Nur neue Generierungen bekommen sie (withEntryComposition) — kein Pack
  // hat sie als Standard, bestehende Seiten behalten ihre Komposition.
  "stage",
  "colorfield",
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
  stage: {
    version: 1,
    heroLayout: "banner",
    servicesLayout: "list",
    aboutLayout: "image-right",
    galleryLayout: "mosaic",
    density: "airy",
    imageTreatment: "bleed",
  },
  colorfield: {
    version: 1,
    heroLayout: "collage",
    servicesLayout: "list",
    aboutLayout: "image-left",
    galleryLayout: "grid",
    density: "airy",
    imageTreatment: "framed",
  },
};

/**
 * Jedes Pack hat seine eigene Fassung der Einstiege (2026-10-06): Ohne sie
 * zeigte die Design-Auswahl im Onboarding drei Alternativen mit derselben
 * Komposition — nur Farbe und Schrift wechselten. Die Zuordnung ist so
 * gerechnet, dass die Packs, die die Auswahl je Branche nebeneinander zeigt
 * (variantCandidates), verschiedene Fassungen tragen. Einzige unvermeidbare
 * Doppelung bei drei Fassungen: schimmer/patina (Barbershop, Runde 2).
 */
const ENTRY_VARIANT: Record<PackId, 0 | 1 | 2> = {
  werkbank: 0,
  "salon-noir": 0,
  landgut: 0,
  klarwerk: 0,
  strom: 0,
  patina: 1,
  gusto: 1,
  kanzlei: 1,
  plakat: 1,
  schimmer: 1,
  verve: 1,
  karat: 1,
  ernte: 1,
  fundament: 2,
  marktplatz: 2,
  morgenlicht: 2,
  riviera: 2,
  zunft: 2,
  atelier: 2,
  raster: 2,
};
const STAGE_VARIANTS = ["split", "center", "bottom"] as const;
const COLORFIELD_VARIANTS = ["arch", "stack", "duo"] as const;
export type StageVariant = (typeof STAGE_VARIANTS)[number];
export type ColorfieldVariant = (typeof COLORFIELD_VARIANTS)[number];

/** Index der Fassung: gespeicherte Wahl vor Pack-Standard. */
export function entryVariantIndex(pack: PackId, stored?: number): 0 | 1 | 2 {
  return stored === 0 || stored === 1 || stored === 2
    ? stored
    : (ENTRY_VARIANT[pack] ?? 2);
}

/** Fassung des Einstiegs für ein Pack: bottom/center/split bzw. duo/arch/stack. */
export function entryVariant(
  pack: PackId,
  composition: "stage" | "colorfield",
  stored?: number
): StageVariant | ColorfieldVariant {
  const index = entryVariantIndex(pack, stored);
  return composition === "stage"
    ? STAGE_VARIANTS[index]
    : COLORFIELD_VARIANTS[index];
}

/** Ab dieser Breite trägt ein Querformat-Foto die volle Bühne. */
export const STAGE_MIN_WIDTH = 1000;
/** Breite/Höhe, ab der ein Foto als Querformat gilt. */
export const STAGE_MIN_RATIO = 1.25;

export type EntryPhotos = {
  /** Das Hero-Foto ist ein großes Querformat (gemessen bei der Generierung). */
  heroLandscape: boolean;
  /** Zahl der echten Fotos neben dem Hero-Bild (Über uns, Galerie). */
  extraPhotos: number;
};

/**
 * Wählt den Einstieg nach dem Material: Ein großes Querformat bekommt die
 * Bühne, Hochformat-Handyfotos (der Normalfall bei Google-Profilen) die
 * Farbfläche mit zwei Fotokarten. Ohne Hero-Foto bleibt die Typo-Komposition.
 */
export function withEntryComposition(
  profile: DesignProfile,
  photos: EntryPhotos
): DesignProfile {
  if (profile.composition === "statement") return profile;
  const composition: ArtComposition | undefined = photos.heroLandscape
    ? "stage"
    : photos.extraPhotos >= 1
      ? "colorfield"
      : undefined;
  if (!composition) return profile;
  const recipe = RECIPES[composition];
  return {
    ...profile,
    composition,
    heroLayout: recipe.heroLayout,
    aboutLayout: recipe.aboutLayout,
    imageTreatment: recipe.imageTreatment,
    heroLayoutMobile: recipe.heroLayout,
  };
}

/**
 * Designwechsel im Studio leitet das Profil neu ab. Der Einstieg hängt aber
 * an den Fotos, nicht am Pack — er überlebt den Wechsel.
 */
export function keepEntryComposition(
  previous: DesignProfile | undefined,
  next: DesignProfile
): DesignProfile {
  const composition = previous?.composition;
  if (composition !== "stage" && composition !== "colorfield") return next;
  return {
    ...next,
    composition,
    heroLayout: previous!.heroLayout,
    heroLayoutMobile: previous!.heroLayoutMobile,
    aboutLayout: previous!.aboutLayout,
    imageTreatment: previous!.imageTreatment,
  };
}

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
  // Photos enable the pack's spatial composition; text-only businesses get
  // deliberate type. Die Komposition steht damit fest — und mit ihr Hero,
  // Bildwirkung und Ueber-uns-Aufbau, die in RECIPES an ihr haengen.
  const composition = hero?.imageUrl ? direction.composition : "statement";
  const base = RECIPES[composition];
  // Variiert wird nur der Rhythmus (Leistungen und Galerie), nie die
  // Silhouette.
  //
  // Vorher drehte der Rezept-Zaehler auch die Komposition durch: der erste
  // Betrieb einer Branche in einer Stadt bekam das Pack-Design, jeder
  // folgende ein anderes Grundschema samt anderem Hero. Bei einem
  // Kampagnenstapel sah damit etwa jede fuenfte Seite aus wie das Motiv auf
  // der Postkarte — der Rest war eine andere Gestaltung (Betreiber-Befund
  // 2026-09-13). Der Zweck des Zaehlers bleibt: zehn Salons in einer Stadt
  // sollen keine zehn identischen Seiten bekommen. Er greift jetzt eine
  // Ebene tiefer, wo Unterschiede auffallen, ohne das Design zu wechseln.
  const ALTERNATIVE_RHYTHMS = [
    { servicesLayout: "featured", galleryLayout: "filmstrip" },
    { servicesLayout: "grid", galleryLayout: "grid" },
    { servicesLayout: "list", galleryLayout: "mosaic" },
    { servicesLayout: "featured", galleryLayout: "grid" },
    { servicesLayout: "grid", galleryLayout: "filmstrip" },
  ] as const satisfies ReadonlyArray<
    Pick<DesignProfile, "servicesLayout" | "galleryLayout">
  >;
  // Der Pack-Rhythmus zuerst, danach die Abwandlungen — und die Doppelung
  // heraus: je nach Pack ist einer der Alternativen genau der Pack-Rhythmus
  // (portrait ist "featured/filmstrip", editorial "list/mosaic"). Ohne den
  // Filter bekaemen der erste und zweite Betrieb einer Stadt dieselbe Seite.
  const packRhythm = {
    servicesLayout: base.servicesLayout,
    galleryLayout: base.galleryLayout,
  };
  const RHYTHMS = [
    packRhythm,
    ...ALTERNATIVE_RHYTHMS.filter(
      r =>
        r.servicesLayout !== packRhythm.servicesLayout ||
        r.galleryLayout !== packRhythm.galleryLayout
    ),
  ];
  let fallback: DesignProfile | undefined;
  const offset = Math.abs(Math.trunc(recipeOffset)) % RHYTHMS.length;
  const ordered = [...RHYTHMS.slice(offset), ...RHYTHMS.slice(0, offset)];
  for (const rhythm of ordered) {
    const profile: DesignProfile = {
      ...base,
      composition,
      seed,
      // Viele Leistungen sprengen jede andere Anordnung — das entscheidet
      // der Inhalt, nicht der Rhythmus.
      servicesLayout:
        (services?.items?.length ?? 0) > 6 ? "grid" : rhythm.servicesLayout,
      galleryLayout: rhythm.galleryLayout,
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

export type AlternativeLook = { entryVariant: 0 | 1 | 2; fontPairId: string };

/**
 * Look je Alternative in der Design-Auswahl (2026-10-06, Betreiber: „für den
 * Kunden nicht wirklich als krasse Alternative erkennbar"). Die gezeigten
 * Alternativen bekommen die beiden Fassungen, die die aktive Seite nicht
 * hat, und je ein Schriftpaar aus der Liste ihres Packs, das weder die
 * aktive Seite noch die andere Alternative trägt. Vorschau und Auswahl
 * nutzen denselben Look — gezeigt ist, was gewählt wird.
 */
export function alternativeLooks(
  active: { pack: PackId; entryVariant?: number; fontPairId?: string },
  alternatives: PackId[],
  fontPairsOf: (pack: PackId) => readonly string[]
): Partial<Record<PackId, AlternativeLook>> {
  const activeIndex = entryVariantIndex(active.pack, active.entryVariant);
  const free = ([0, 1, 2] as const).filter(i => i !== activeIndex);
  const usedFonts = new Set(active.fontPairId ? [active.fontPairId] : []);
  const looks: Partial<Record<PackId, AlternativeLook>> = {};
  alternatives
    .filter(pack => pack !== active.pack)
    .forEach((pack, k) => {
      const fonts = fontPairsOf(pack);
      const fontPairId =
        fonts.find(font => !usedFonts.has(font)) ?? fonts[0] ?? "modern";
      usedFonts.add(fontPairId);
      looks[pack] = { entryVariant: free[k % free.length], fontPairId };
    });
  return looks;
}
