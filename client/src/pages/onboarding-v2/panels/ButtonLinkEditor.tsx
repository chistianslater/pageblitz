import React, { useState } from "react";
import {
  BUTTON_TEXT_MAX,
  normalizeButtonHref,
  type ButtonLink,
} from "@shared/onboardingV2/buttonLink";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import { SECTION_ANCHORS } from "@/components/site/engine";

interface ButtonLinkEditorProps {
  idPrefix: string;
  /** Beschriftung der Checkbox, z. B. „Button unter der Speisekarte". */
  label: string;
  value: ButtonLink | undefined;
  onChange: (value: ButtonLink | undefined) => void;
  /** Vorschlag beim Einschalten, z. B. „Online bestellen". */
  defaultText: string;
  /** Vorschlag für die Adresse, z. B. die hinterlegte Website. */
  suggestedHref?: string;
}

/**
 * Button mit freiem Ziel (2026-09-26): Webadresse, Telefonnummer oder
 * Anker. Das Eingabefeld zeigt, was der Kunde tippt; im Patch landet die
 * ergänzte Adresse (`normalizeButtonHref`). Unfertige Eingaben gehen roh in
 * den Patch — die Validierung des Panels hält dann das Speichern auf.
 */
export function ButtonLinkEditor({
  idPrefix,
  label,
  value,
  onChange,
  defaultText,
  suggestedHref,
}: ButtonLinkEditorProps) {
  const [rawHref, setRawHref] = useState(value?.href ?? "");
  const enabled = value !== undefined;

  const emit = (text: string, raw: string) => {
    onChange({ text, href: normalizeButtonHref(raw) ?? raw.trim() });
  };

  const toggle = (on: boolean) => {
    if (!on) {
      onChange(undefined);
      return;
    }
    const raw = rawHref || suggestedHref || "";
    setRawHref(raw);
    emit(value?.text ?? defaultText, raw);
  };

  const hrefValid = !enabled || normalizeButtonHref(rawHref) !== null;

  return (
    <div className="pb-studio-field">
      <label className="pb-studio-checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => toggle(e.target.checked)}
        />
        {label}
      </label>
      {enabled && (
        <>
          <label htmlFor={`${idPrefix}-text`}>Button-Text</label>
          <input
            id={`${idPrefix}-text`}
            type="text"
            className="pb-studio-input"
            maxLength={BUTTON_TEXT_MAX}
            value={value.text}
            aria-invalid={value.text.trim() === "" ? "true" : undefined}
            onChange={e => emit(e.target.value, rawHref)}
          />
          <label htmlFor={`${idPrefix}-href`}>Ziel des Buttons</label>
          <input
            id={`${idPrefix}-href`}
            type="text"
            inputMode="url"
            className="pb-studio-input"
            placeholder="z. B. www.lieferando.de/… oder 02871 123456"
            value={rawHref}
            aria-invalid={hrefValid ? undefined : "true"}
            onChange={e => {
              setRawHref(e.target.value);
              emit(value.text, e.target.value);
            }}
          />
          <span className="pb-studio-field-hint">
            Webadresse (öffnet in neuem Tab) oder Telefonnummer (ruft an).
          </span>
        </>
      )}
    </div>
  );
}

/** Sektionen, zu denen ein Button sinnvoll springen kann — mit Klartext. */
const JUMP_LABELS: Partial<Record<keyof typeof SECTION_ANCHORS, string>> = {
  contact: "Zum Kontaktbereich",
  menu: "Zur Speisekarte",
  pricelist: "Zur Preisliste",
  services: "Zu den Leistungen",
  about: "Zu „Über uns“",
  gallery: "Zur Galerie",
  team: "Zum Team",
  faq: "Zu den Fragen",
};

export interface ButtonTargetOption {
  href: string;
  label: string;
}

/** Sprungziele der Seite plus „Anrufen", wenn eine Nummer hinterlegt ist. */
export function buttonTargetOptions(doc: WebsiteDataV2): ButtonTargetOption[] {
  const options: ButtonTargetOption[] = [];
  for (const section of doc.sections) {
    const label = JUMP_LABELS[section.type];
    if (label)
      options.push({ href: `#${SECTION_ANCHORS[section.type]}`, label });
  }
  const contact = doc.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const tel = contact?.phone ? normalizeButtonHref(contact.phone) : null;
  if (tel?.startsWith("tel:")) {
    options.push({ href: tel, label: `Anrufen (${contact!.phone})` });
  }
  return options;
}

const CUSTOM = "__eigene__";

interface ButtonTargetFieldProps {
  idPrefix: string;
  doc: WebsiteDataV2;
  /** Aktuelles Ziel; undefined = Pack-Standard (Kontaktbereich). */
  value: string | undefined;
  onChange: (href: string) => void;
  onFocus?: () => void;
}

/**
 * Ziel des Hero-Buttons (2026-09-26): Sprung auf der Seite, Anrufen oder eine
 * eigene Webadresse (Bestellplattform, Buchungstool). Eine unfertige
 * Adresse wird nicht übernommen — das Feld zeigt sie als ungültig.
 */
export function ButtonTargetField({
  idPrefix,
  doc,
  value,
  onChange,
  onFocus,
}: ButtonTargetFieldProps) {
  const options = buttonTargetOptions(doc);
  const current = value ?? "#kontakt";
  const known = options.some(o => o.href === current);
  const [custom, setCustom] = useState(!known);
  const [raw, setRaw] = useState(known ? "" : current);
  const rawValid = normalizeButtonHref(raw) !== null;

  return (
    <div className="pb-studio-field">
      <label htmlFor={`${idPrefix}-select`}>Ziel des Buttons</label>
      <select
        id={`${idPrefix}-select`}
        className="pb-studio-input"
        value={custom ? CUSTOM : current}
        onFocus={onFocus}
        onChange={e => {
          if (e.target.value === CUSTOM) {
            setCustom(true);
            return;
          }
          setCustom(false);
          onChange(e.target.value);
        }}
      >
        {options.map(option => (
          <option key={option.href} value={option.href}>
            {option.label}
          </option>
        ))}
        <option value={CUSTOM}>Eigene Webadresse …</option>
      </select>
      {custom && (
        <>
          <input
            id={`${idPrefix}-custom`}
            type="text"
            inputMode="url"
            className="pb-studio-input"
            aria-label="Eigene Webadresse des Buttons"
            placeholder="z. B. www.lieferando.de/…"
            value={raw}
            aria-invalid={raw && !rawValid ? "true" : undefined}
            onFocus={onFocus}
            onChange={e => {
              setRaw(e.target.value);
              const href = normalizeButtonHref(e.target.value);
              if (href) onChange(href);
            }}
          />
          <span className="pb-studio-field-hint">
            Öffnet in einem neuen Tab, z. B. eure Bestell- oder
            Buchungsplattform.
          </span>
        </>
      )}
    </div>
  );
}
