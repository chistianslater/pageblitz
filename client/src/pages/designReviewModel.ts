import { PACK_IDS } from "@shared/siteContract/packIds";
import type { PackId } from "@shared/siteContract/types";
import type { LayoutViewport } from "@shared/siteContract/designProfile";
import {
  PREVIEW_LAYOUT_SECTIONS,
  type LayoutOverlay,
  type PreviewLayoutField,
} from "./onboarding-v2/previewLayoutChrome";

export type Verdict = "pending" | "approved" | "changes";
export type Review = { verdict: Verdict; note: string };
export type Reviews = Partial<Record<PackId, Review>>;

export type PackLayoutEntry = {
  desktop?: LayoutOverlay;
  mobile?: LayoutOverlay;
};
export type PackLayoutMap = Partial<Record<PackId, PackLayoutEntry>>;

export const REVIEW_STORAGE_KEY = "pageblitz_design_reviews_v1";
export const LAYOUT_STORAGE_KEY = "pageblitz_design_review_layouts_v1";

export const VERDICT_LABELS: Record<Verdict, string> = {
  pending: "Unbewertet",
  approved: "Passt",
  changes: "Korrektur",
};

const FIELD_SHORT: Record<PreviewLayoutField, string> = {
  heroLayout: "Hero",
  servicesLayout: "Leistungen",
  aboutLayout: "Über uns",
  galleryLayout: "Galerie",
};

const LEGACY_LAYOUT_VALUES: Partial<
  Record<PreviewLayoutField, readonly string[]>
> = {
  heroLayout: ["compact"],
};

const LEGACY_LAYOUT_LABELS: Record<string, string> = {
  compact: "Kompakt",
};

function overlayEmpty(overlay: LayoutOverlay | undefined): boolean {
  return !overlay || Object.keys(overlay).length === 0;
}

export function parseLayoutOverlay(raw: unknown): LayoutOverlay {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const overlay: LayoutOverlay = {};
  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const value = source[section.field];
    const allowed = [
      ...section.options.map(option => option.value),
      ...(LEGACY_LAYOUT_VALUES[section.field] ?? []),
    ];
    if (typeof value === "string" && allowed.includes(value)) {
      overlay[section.field] = value;
    }
  }
  return overlay;
}

export function parsePackLayoutEntry(raw: unknown): PackLayoutEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  if ("desktop" in source || "mobile" in source) {
    const entry: PackLayoutEntry = {};
    const desktop = parseLayoutOverlay(source.desktop);
    const mobile = parseLayoutOverlay(source.mobile);
    if (!overlayEmpty(desktop)) entry.desktop = desktop;
    if (!overlayEmpty(mobile)) entry.mobile = mobile;
    return Object.keys(entry).length > 0 ? entry : null;
  }
  const overlay = parseLayoutOverlay(raw);
  if (overlayEmpty(overlay)) return null;
  return { desktop: overlay };
}

export function parsePackLayoutMap(raw: unknown): PackLayoutMap {
  if (!raw || typeof raw !== "object") return {};
  const result: PackLayoutMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!(PACK_IDS as readonly string[]).includes(key)) continue;
    const entry = parsePackLayoutEntry(value);
    if (entry) result[key as PackId] = entry;
  }
  return result;
}

export function describeLayoutOverlay(
  overlay: LayoutOverlay | undefined
): string {
  if (!overlay) return "";
  return PREVIEW_LAYOUT_SECTIONS.flatMap(section => {
    const value = overlay[section.field];
    if (!value) return [];
    const label =
      section.options.find(option => option.value === value)?.label ??
      LEGACY_LAYOUT_LABELS[value] ??
      value;
    return [`${FIELD_SHORT[section.field]}: ${label}`];
  }).join(" · ");
}

export function describePackLayouts(
  entry: PackLayoutEntry | undefined
): string {
  if (!entry) return "";
  const desktop = describeLayoutOverlay(entry.desktop);
  const mobile = describeLayoutOverlay(entry.mobile);
  return [
    desktop ? `Desktop: ${desktop}` : null,
    mobile ? `Mobil: ${mobile}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function layoutEntryHasAny(entry: PackLayoutEntry | undefined): boolean {
  return Boolean(entry && (entry.desktop || entry.mobile));
}

export function patchPackLayoutEntry(
  current: PackLayoutEntry | undefined,
  viewport: LayoutViewport,
  overlay: LayoutOverlay
): PackLayoutEntry | undefined {
  const next: PackLayoutEntry = { ...(current ?? {}) };
  if (overlayEmpty(overlay)) delete next[viewport];
  else next[viewport] = overlay;
  return layoutEntryHasAny(next) ? next : undefined;
}

export function formatReviewExport(input: {
  packs: readonly { id: PackId; name: string }[];
  reviewFor: (id: PackId) => Review;
  layouts: PackLayoutMap;
  pendingCount: number;
}): string {
  const entries = input.packs
    .map((pack, index) => {
      const review = input.reviewFor(pack.id);
      const entry = input.layouts[pack.id];
      const desktop = describeLayoutOverlay(entry?.desktop);
      const mobile = describeLayoutOverlay(entry?.mobile);
      if (
        review.verdict === "pending" &&
        !review.note.trim() &&
        !desktop &&
        !mobile
      ) {
        return null;
      }
      return [
        `${String(index + 1).padStart(2, "0")} · ${pack.name} · ${VERDICT_LABELS[review.verdict]}`,
        desktop ? `Desktop: ${desktop}` : null,
        mobile ? `Mobil: ${mobile}` : null,
        review.note.trim() || (desktop || mobile ? null : "Keine Anmerkung."),
      ]
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean);
  return [
    "PAGEBLITZ DESIGN-REVIEW",
    `Geprüft: ${input.packs.length - input.pendingCount}/${input.packs.length}`,
    "",
    entries.join("\n\n"),
  ].join("\n");
}
