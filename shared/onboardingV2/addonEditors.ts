/**
 * Mapping gebuchter Extras → Studio-Editor. Die Checkliste hält Extras als
 * Unterpunkte unter „Extras"; ein Klick öffnet nicht den Kauf-Toggle, sondern
 * das Panel, in dem der Inhalt gepflegt wird (Galerie → Fotos, Speisekarte →
 * Angebot, Team → Extras-Editor, …).
 */
import { ADDON_KEYS, type AddOnKey } from "../pricing";
import type { WebsiteDataV2 } from "../siteContract/types";
import type { ChecklistItemId } from "./checklist";

export interface AddonEditorSpec {
  /** Checklisten-Panel, das den Inhalt dieses Extras trägt. */
  panel: ChecklistItemId;
  /** Vorschau-Anker nach dem Öffnen. */
  previewAnchor: string;
  /**
   * Scroll-Ziel im Extras-Panel (`#pb-addon-editor-*`). `null`, wenn ein
   * anderes Panel (Fotos/Angebot) geöffnet wird.
   */
  editorDomId: string | null;
  hint: string;
}

export const ADDON_EDITORS: Record<AddOnKey, AddonEditorSpec> = {
  gallery: {
    panel: "photos",
    previewAnchor: "galerie",
    editorDomId: null,
    hint: "Fotos hochladen, löschen und sortieren",
  },
  menu: {
    panel: "offer",
    previewAnchor: "speisekarte",
    editorDomId: null,
    hint: "Gerichte, Kategorien und Preise pflegen",
  },
  pricelist: {
    panel: "offer",
    previewAnchor: "preisliste",
    editorDomId: null,
    hint: "Leistungen und Preise pflegen",
  },
  team: {
    panel: "addons",
    previewAnchor: "team",
    editorDomId: "pb-addon-editor-team",
    hint: "Mitglieder mit Foto und Rolle pflegen",
  },
  subpages: {
    panel: "addons",
    previewAnchor: "leistungen",
    editorDomId: "pb-addon-editor-subpages",
    hint: "Unterseiten anlegen, sortieren und befüllen",
  },
  contactForm: {
    panel: "addons",
    previewAnchor: "kontakt",
    editorDomId: "pb-addon-editor-contactForm",
    hint: "Überschrift anpassen — Felder im Kundenbereich",
  },
  aiChat: {
    panel: "addons",
    previewAnchor: "kontakt",
    editorDomId: "pb-addon-editor-aiChat",
    hint: "Begrüßung anpassen — Wissen im Kundenbereich",
  },
  booking: {
    panel: "addons",
    previewAnchor: "kontakt",
    editorDomId: "pb-addon-editor-booking",
    hint: "Zeiten und Dauer stellst du im Kundenbereich ein",
  },
};

export function isAddOnKey(value: string): value is AddOnKey {
  return (ADDON_KEYS as readonly string[]).includes(value);
}

export interface AddonContentContext {
  chatWelcomeMessage?: string | null;
}

/**
 * Ob der Inhalt des gebuchten Extras schon gepflegt ist — für den
 * Unterpunkt-Status in der Studio-Checkliste (Erledigt vs. Bearbeiten).
 * Unabhängig vom Kauf-Flag: Aufrufer filtern vorher auf gebuchte Keys.
 */
export function addonContentDone(
  key: AddOnKey,
  doc: WebsiteDataV2 | null,
  extras: AddonContentContext = {}
): boolean {
  if (!doc) {
    return key === "aiChat"
      ? Boolean(extras.chatWelcomeMessage?.trim())
      : false;
  }
  switch (key) {
    case "gallery": {
      const section = doc.sections.find(s => s.type === "gallery");
      return !!section && section.images.length > 0;
    }
    case "menu": {
      const section = doc.sections.find(s => s.type === "menu");
      return !!section && section.categories.some(c => c.items.length > 0);
    }
    case "pricelist": {
      const section = doc.sections.find(s => s.type === "pricelist");
      return !!section && section.categories.some(c => c.items.length > 0);
    }
    case "team": {
      const section = doc.sections.find(s => s.type === "team");
      return !!section && section.members.some(m => m.name.trim().length > 0);
    }
    case "subpages":
      return (doc.pages?.length ?? 0) > 0;
    case "contactForm":
      return doc.sections.some(s => s.type === "contact");
    case "aiChat":
      return Boolean(extras.chatWelcomeMessage?.trim());
    case "booking":
      // Zeiten liegen im Kundenbereich, nicht im Studio-Dokument — gebucht
      // reicht als „bereit zum Einstellen", nicht als inhaltlich erledigt.
      return false;
  }
}
