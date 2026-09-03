import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getBusinessById } from "../db";
import { getConstitution, getFontPair } from "../../shared/stylePacks";
import {
  buildCustomWorldOverrides,
  getColorWorld,
  getColorWorlds,
} from "../../shared/stylePacks/colorWorlds";
import {
  deriveDesignProfile,
  type DesignProfile,
} from "../../shared/siteContract/designProfile";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  AiChatHistorySchema,
  SECTION_LABELS,
  type AiThemePatch,
} from "../../shared/onboardingV2/aiEdit";
import { applyTheme } from "./applyPatch";
import {
  assertAiEditQuota,
  proposeAiEdit,
  storeProposal,
  takeProposal,
  takeProposalEntry,
} from "./aiEdit";
import { loadStudioWebsite } from "./ownership";
import { chatLabel } from "./versions";
import {
  assertNotGenerating,
  persistDoc,
  requireDoc,
  tokenInput,
} from "./state";

const PROPOSAL_EXPIRED_MESSAGE =
  "Der Vorschlag ist abgelaufen — bitte erneut anfragen.";

/**
 * KI-Chat-Prozeduren des Studios ("Was soll anders sein?", Spec §5).
 * `aiEdit` persistiert NIE selbst — bei einem Inhalts-Vorschlag wird das neue
 * Dokument nur server-seitig zwischengespeichert (TTL 10 min, siehe
 * `./aiEdit`) und erst durch den expliziten `applyAiEdit`-Aufruf über
 * `persistDoc` geschrieben.
 */

/**
 * Wendet einen Theme-Patch des KI-Assistenten über dieselben Mechaniken an
 * wie der Theme-Editor (applyTheme) und liefert eine deutsche
 * Änderungsliste für die Chat-Karte. Unbekannte Farbwelt/Schriftpaar-IDs
 * werden übersprungen statt den ganzen Patch zu verwerfen.
 */
export function applyAiTheme(
  doc: WebsiteDataV2,
  theme: AiThemePatch
): { next: WebsiteDataV2; summary: string[] } {
  const summary: string[] = [];
  const packId = doc.stylePackId as PackId;

  // Sichtbarkeit + Reihenfolge (2026-08-30): VOR applyTheme aufs Dokument,
  // damit dessen abschließendes Zod-Parse alles gemeinsam validiert. Beide
  // Listen werden auf tatsächlich vorhandene Sektionstypen gefiltert und
  // dedupliziert — die KI kann nichts verstecken/ordnen, was es nicht gibt.
  let base = doc;
  // Set<string>: sectionOrder erlaubt schema-seitig auch "pageHeader"
  // (SECTION_TYPES) — der Filter wirft es hier ohnehin raus.
  const presentTypes = new Set<string>(doc.sections.map(s => s.type));
  if (theme.hiddenSections !== undefined) {
    const hidden = Array.from(new Set(theme.hiddenSections)).filter(t =>
      presentTypes.has(t)
    );
    const before = new Set(doc.hiddenSections ?? []);
    const after = new Set<string>(hidden);
    for (const t of hidden) {
      if (!before.has(t)) summary.push(`„${SECTION_LABELS[t]}“ ausgeblendet`);
    }
    for (const t of before) {
      if (!after.has(t))
        summary.push(`„${SECTION_LABELS[t]}“ wieder eingeblendet`);
    }
    base = { ...base };
    if (hidden.length > 0) base.hiddenSections = hidden;
    else delete base.hiddenSections;
  }
  if (theme.hiddenElements !== undefined) {
    // Einzeln ausgeblendete Elemente („Bild weg, Text breiter") leben im
    // designProfile — hier nur die Summary; der Patch läuft unten über die
    // wantsProfileChange-Mechanik mit.
    const beforeEl = new Set(doc.designProfile?.hiddenElements ?? []);
    const afterEl = new Set(theme.hiddenElements);
    const elLabels: Record<string, string> = {
      "hero-media": "Hero-Bild",
      "about-media": "Über-uns-Bild",
    };
    for (const el of afterEl) {
      if (!beforeEl.has(el))
        summary.push(
          `${elLabels[el] ?? el} ausgeblendet — Text nutzt die volle Breite`
        );
    }
    for (const el of beforeEl) {
      if (!afterEl.has(el))
        summary.push(`${elLabels[el] ?? el} wieder eingeblendet`);
    }
  }
  if (theme.hiddenDecorations !== undefined) {
    // Deko granular (Backlog 13d): gleiche Mechanik wie hiddenElements.
    const beforeDeco = new Set(doc.designProfile?.hiddenDecorations ?? []);
    const afterDeco = new Set(theme.hiddenDecorations);
    const decoLabels: Record<string, string> = {
      blobs: "Farbflächen",
      dots: "Punktraster",
      sprigs: "Zweig-Illustrationen",
      ornaments: "Ornamente",
    };
    for (const grp of afterDeco) {
      if (!beforeDeco.has(grp))
        summary.push(`${decoLabels[grp] ?? grp} ausgeblendet`);
    }
    for (const grp of beforeDeco) {
      if (!afterDeco.has(grp))
        summary.push(`${decoLabels[grp] ?? grp} wieder eingeblendet`);
    }
  }
  if (theme.sectionOrder !== undefined) {
    const order = Array.from(new Set(theme.sectionOrder)).filter(t =>
      presentTypes.has(t)
    );
    base = { ...base };
    if (order.length > 0) {
      base.sectionOrder = order;
      summary.push(
        `Reihenfolge angepasst: ${order.map(t => SECTION_LABELS[t]).join(" → ")}`
      );
    } else {
      delete base.sectionOrder;
      summary.push("Reihenfolge auf Standard zurückgesetzt");
    }
  }

  let worldOverrides: Record<string, string> | null | undefined;
  if (theme.colorWorldBase !== undefined) {
    worldOverrides = buildCustomWorldOverrides(packId, theme.colorWorldBase);
    summary.push(`Grundfarbe auf ${theme.colorWorldBase} gestellt`);
  } else if (theme.colorWorldId !== undefined) {
    if (theme.colorWorldId === null || theme.colorWorldId === "original") {
      worldOverrides = null;
      summary.push("Farbwelt auf Original zurückgesetzt");
    } else {
      const world = getColorWorld(packId, theme.colorWorldId);
      if (world) {
        worldOverrides = world.overrides;
        summary.push(`Farbwelt „${world.name}“ aktiviert`);
      }
    }
  }

  let fontPairId: string | null | undefined;
  if (theme.fontPairId !== undefined) {
    if (theme.fontPairId === null) {
      fontPairId = null;
      summary.push("Schriften auf die Richtungs-Standards zurückgesetzt");
    } else {
      const pair = getFontPair(theme.fontPairId);
      if (pair) {
        fontPairId = pair.id;
        summary.push(`Schriftpaar „${pair.label}“ gewählt`);
      }
    }
  }

  if (theme.accent !== undefined) {
    summary.push(
      theme.accent === null
        ? "Akzentfarbe auf die Richtungsfarbe zurückgesetzt"
        : `Akzentfarbe auf ${theme.accent} gestellt`
    );
  }

  const layoutKeys = [
    "heroLayout",
    "servicesLayout",
    "aboutLayout",
    "galleryLayout",
    "testimonialsLayout",
    "contactLayout",
    "density",
    "imageTreatment",
    "decorations",
    "hiddenElements",
    "hiddenDecorations",
  ] as const;
  const layoutLabels: Record<(typeof layoutKeys)[number], string> = {
    heroLayout: "Hero-Layout",
    servicesLayout: "Leistungen-Layout",
    aboutLayout: "Über-uns-Layout",
    galleryLayout: "Galerie-Layout",
    testimonialsLayout: "Bewertungen-Layout",
    contactLayout: "Kontakt-Layout",
    density: "Abstände",
    imageTreatment: "Bildwirkung",
    decorations: "Schmuck-Illustrationen",
    // Summary läuft separat (Einzelelemente mit deutschen Namen).
    hiddenElements: "Ausgeblendete Elemente",
    hiddenDecorations: "Ausgeblendete Deko-Gruppen",
  };
  const wantsProfileChange = layoutKeys.some(key => theme[key] !== undefined);
  let designProfile: DesignProfile | undefined;
  if (wantsProfileChange) {
    const base =
      doc.designProfile ??
      deriveDesignProfile({
        stylePackId: packId,
        businessName: doc.businessName,
        businessCategory: doc.businessCategory,
        sections: doc.sections,
      });
    const merged: DesignProfile = { ...base };
    for (const key of layoutKeys) {
      const value = theme[key];
      if (value !== undefined) {
        (merged as unknown as Record<string, unknown>)[key] = value;
        if (key === "hiddenElements" || key === "hiddenDecorations") continue; // Summary lief oben separat.
        summary.push(
          key === "decorations"
            ? value === "off"
              ? "Schmuck-Illustrationen ausgeblendet"
              : "Schmuck-Illustrationen wieder eingeblendet"
            : `${layoutLabels[key]}: ${value}`
        );
      }
    }
    designProfile = merged;
  }

  const next = applyTheme(base, {
    accent: theme.accent,
    fontPairId,
    designProfile,
    worldOverrides,
  });
  return { next, summary };
}

export const aiProcedures = {
  aiEdit: publicProcedure
    .input(
      tokenInput.extend({
        message: z.string().min(3).max(500),
        // Unterseiten-Scope (Plan B6 Task 5): Slug der gerade in der
        // Vorschau gewählten Unterseite — Format wie PageSchema.slug; ob die
        // Seite existiert, prüft proposeAiEdit (BAD_REQUEST).
        pageSlug: z
          .string()
          .regex(/^[a-z0-9-]{2,40}$/)
          .optional(),
        // Rückfragen-Dialog (2026-08-30): vorherige Wortwechsel dieses
        // Wunschs (Wunsch → Rückfrage → Antwort) — nur vom Client gehalten,
        // nie persistiert.
        history: AiChatHistorySchema.optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      assertAiEditQuota(loaded.website.id);

      const business = await getBusinessById(loaded.website.businessId);
      const category = doc.businessCategory ?? business?.category ?? "";

      const result = await proposeAiEdit({
        doc,
        message: input.message,
        category,
        ...(input.pageSlug !== undefined ? { pageSlug: input.pageSlug } : {}),
        ...(input.history !== undefined ? { history: input.history } : {}),
      });

      if (result.kind === "content") {
        const proposalId = storeProposal(
          loaded.website.id,
          result.next,
          input.message
        );
        return {
          kind: "content" as const,
          proposalId,
          diff: result.diff,
        };
      }
      if (result.kind === "theme") {
        // Design-Patches werden SOFORT angewandt: jede Stellschraube ist im
        // Stil-Panel mit einem Klick revidierbar — ein Bestätigen-Zwang
        // würde den „KI passt es an“-Fluss nur bremsen.
        const { next, summary } = applyAiTheme(doc, result.theme);
        if (summary.length === 0) {
          return {
            kind: "reject" as const,
            reason:
              "Diesen Design-Wunsch konnte ich keiner Einstellung zuordnen — probiere es im Stil-Panel.",
          };
        }
        await persistDoc(input.token, loaded, next, {
          trigger: "chat",
          label: chatLabel(input.message),
        });
        return {
          kind: "theme" as const,
          reason: result.reason,
          summary,
        };
      }
      if (result.kind === "style") {
        return {
          kind: "style" as const,
          packId: result.packId,
          name: getConstitution(result.packId).name,
          reason: result.reason,
        };
      }
      if (result.kind === "question") {
        return { kind: "question" as const, question: result.question };
      }
      return { kind: "reject" as const, reason: result.reason };
    }),

  /** Übernimmt einen zuvor per aiEdit vorgeschlagenen Inhalt — Write-Guard über persistDoc, wie jede andere Studio-Mutation. */
  applyAiEdit: publicProcedure
    .input(tokenInput.extend({ proposalId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      // Gleiche Sperre wie requireDoc (aiEdit): kein Übernehmen in ein
      // Dokument, das der laufende Generierungs-Job gleich überschreibt.
      await assertNotGenerating(loaded.website.id);
      const proposal = takeProposalEntry(input.proposalId, loaded.website.id);
      if (!proposal) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: PROPOSAL_EXPIRED_MESSAGE,
        });
      }
      return persistDoc(input.token, loaded, proposal.next, {
        trigger: "chat",
        label: proposal.label ?? chatLabel(proposal.message),
      });
    }),

  /** Verwirft einen Vorschlag explizit (z. B. Klick auf "Verwerfen") — idempotent, kein Fehler bei bereits abgelaufenem/unbekanntem Vorschlag. */
  discardAiEdit: publicProcedure
    .input(tokenInput.extend({ proposalId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      takeProposal(input.proposalId, loaded.website.id);
      return { ok: true as const };
    }),
};
