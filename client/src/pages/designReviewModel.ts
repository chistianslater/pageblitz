import { PACK_IDS } from "@shared/siteContract/packIds";
import type { PackId } from "@shared/siteContract/types";
import {
  PREVIEW_LAYOUT_SECTIONS,
  type LayoutOverlay,
  type PreviewLayoutField,
} from "./onboarding-v2/previewLayoutChrome";

export type Verdict = "pending" | "approved" | "changes";
export type Review = { verdict: Verdict; note: string };
export type Reviews = Partial<Record<PackId, Review>>;
export type PackLayoutMap = Partial<Record<PackId, LayoutOverlay>>;

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

export function parseLayoutOverlay(raw: unknown): LayoutOverlay {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const overlay: LayoutOverlay = {};
  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const value = source[section.field];
    if (
      typeof value === "string" &&
      section.options.some(option => option.value === value)
    ) {
      overlay[section.field] = value;
    }
  }
  return overlay;
}

export function parsePackLayoutMap(raw: unknown): PackLayoutMap {
  if (!raw || typeof raw !== "object") return {};
  const result: PackLayoutMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!(PACK_IDS as readonly string[]).includes(key)) continue;
    const overlay = parseLayoutOverlay(value);
    if (Object.keys(overlay).length > 0) result[key as PackId] = overlay;
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
      section.options.find(option => option.value === value)?.label ?? value;
    return [`${FIELD_SHORT[section.field]}: ${label}`];
  }).join(" · ");
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
      const layout = describeLayoutOverlay(input.layouts[pack.id]);
      if (review.verdict === "pending" && !review.note.trim() && !layout) {
        return null;
      }
      return [
        `${String(index + 1).padStart(2, "0")} · ${pack.name} · ${VERDICT_LABELS[review.verdict]}`,
        layout ? `Layout: ${layout}` : null,
        review.note.trim() || (layout ? null : "Keine Anmerkung."),
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
