import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import {
  coversToday,
  isPlaceholderHours,
  shortHours,
  telHref,
  whatsappHref,
} from "../shared/heroFacts";
import { useSystem } from "../SystemContext";
import { addressLine, contactOf, mailHref, mapsHref } from "../shared";
import { todayStatus } from "./facts";
import {
  WerkstoffChapter,
  chapterTitle,
  type WerkstoffSection,
} from "./sections";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import { telLabel } from "../shared/contact";

/**
 * Gut zu wissen und Besuch nach Systemblatt (Abschnitt 09, 11–13): Fragen
 * als <details> mit eckigem Plus (erste offen), Telefon-Link darüber, wenn
 * der Kontakt eins nennt. Besuch: helle Zeiten-Karte mit Tinte-Rahmen,
 * Stand oben in Klartext, Heute-Zeile mit Oxid-Kante; daneben Adresse,
 * Telefon, E-Mail, Anrufen-Knopf und eine ruhige Kartenfläche ohne
 * Einbettung (ein Tab-Halt, keine Drittanbieter-Anfrage). Platzhalter-Zeiten
 * erscheinen nie; ohne Adresse keine Karte; der Formular-Titel nur, wenn
 * die Kontakt-Insel wirklich rendert.
 */

type Props<T extends WerkstoffSection["type"]> = {
  section: Extract<WerkstoffSection, { type: T }>;
  sections: readonly WerkstoffSection[];
};

export function WerkstoffFaq({ section, sections }: Props<"faq">) {
  const { blueprint } = useSystem();
  const phone = contactOf(sections)?.phone?.trim();
  const tel = telHref(phone);
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.faq}
      name="faq"
      title={chapterTitle("faq", section.headline, blueprint)}
    >
      {tel && (
        <p className="ws-faq-call">
          <a className="ws-link" href={tel}>
            {phone} anrufen
          </a>
        </p>
      )}
      <div className="ws-faq-list">
        {section.items.map((item, i) => (
          <details
            className="ws-faq-item"
            key={`${item.question}-${i}`}
            open={i === 0 || undefined}
          >
            <summary>
              <span className="ws-faq-q">{rich(item.question)}</span>
              <span className="ws-faq-sign" aria-hidden="true" />
            </summary>
            <p className="ws-faq-a">{rich(item.answer)}</p>
          </details>
        ))}
      </div>
    </WerkstoffChapter>
  );
}

const CLOSED = /geschlossen|closed|ruhetag/i;
/** Generische Überschriften: dann trägt die Werkstoff-Wortwahl. */
const GENERIC_TITLE = /^(kontakt|contact)$/i;

function HoursCard({
  hours,
  label,
  contact,
}: {
  hours: { day: string; hours: string }[];
  label: string;
  contact: SectionOf<"contact">;
}) {
  const { now } = useSystem();
  const status = todayStatus(contact.openingHours, now);
  return (
    <div className="ws-hours-card">
      {status && (
        <p className="ws-hours-status">
          {!/geschlossen/.test(status.line) && (
            <span className="ws-dot" aria-hidden="true" />
          )}
          {status.line}
        </p>
      )}
      <dl className="ws-hours" aria-label={label}>
        {hours.map((entry, i) => {
          const today = coversToday(entry.day, now);
          return (
            <div
              key={`${entry.day}-${i}`}
              className={
                today ? "ws-hours-row ws-hours-row--today" : "ws-hours-row"
              }
            >
              <dt>
                {entry.day}
                {today && <span className="ws-today"> heute</span>}
              </dt>
              <dd>
                {CLOSED.test(entry.hours)
                  ? "geschlossen"
                  : shortHours(entry.hours)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function WerkstoffContact({ section }: Props<"contact">) {
  const { data, blueprint, contactIsland } = useSystem();
  const inquiry = blueprint.contactMode === "inquiry";
  const raw = section.openingHours ?? [];
  const hours = isPlaceholderHours(raw) ? [] : raw;
  const own =
    section.headline && !GENERIC_TITLE.test(section.headline.trim())
      ? section.headline
      : undefined;
  const address = addressLine(section);
  const route = address ? mapsHref(address) : undefined;
  const routeLabel = inquiry ? "Anfahrt" : "Route planen";
  const phone = section.phone?.trim();
  const tel = telHref(phone);
  const whatsapp = whatsappHref(section.phone);
  const mail = mailHref(section.email);
  const inquiryHref =
    mailHref(
      section.email,
      `Anfrage über die Website – ${data.businessName}`
    ) ?? tel;
  const external = { target: "_blank", rel: "noopener noreferrer" } as const;
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.contact}
      name="contact"
      title={chapterTitle("contact", own, blueprint)}
    >
      <div className="ws-visit">
        {hours.length > 0 && (
          <HoursCard
            hours={hours}
            label={blueprint.hoursLabel ?? "Öffnungszeiten"}
            contact={section}
          />
        )}
        <div className="ws-visit-reach" {...SYS_ACTIONS}>
          {address && <p className="ws-visit-address">{address}</p>}
          {(tel || mail || whatsapp) && (
            <p className="ws-visit-links">
              {tel && (
                <a className="ws-link" href={tel}>
                  {phone}
                </a>
              )}
              {mail && section.email && (
                <a className="ws-link" href={mail}>
                  {section.email.trim()}
                </a>
              )}
              {whatsapp && (
                <a className="ws-link" href={whatsapp} {...external}>
                  WhatsApp
                </a>
              )}
            </p>
          )}
          {blueprint.serviceArea && section.city && (
            <p className="ws-visit-area">
              Einsatzgebiet: {section.city} und Umgebung
            </p>
          )}
          {(tel || (inquiry && inquiryHref)) && (
            <p className="ws-visit-actions">
              {inquiry && inquiryHref && (
                <a className="ws-btn" href={inquiryHref}>
                  {telLabel(blueprint.ctaText ?? "Anfrage senden", inquiryHref)}
                </a>
              )}
              {tel && (
                <a className={inquiry ? "ws-btn2" : "ws-btn"} href={tel}>
                  Anrufen
                </a>
              )}
            </p>
          )}
          {route && (
            <a
              className="ws-map"
              href={route}
              aria-label={`${routeLabel}: ${address}`}
              {...external}
            >
              <span className="ws-map-dot" aria-hidden="true" />
              <span className="ws-map-label" aria-hidden="true">
                {routeLabel}
              </span>
            </a>
          )}
        </div>
      </div>
      {/* Formular = Kontakt-Insel (SiteIslands, data-target="#kontakt");
          hier nur ihr Titel — und nur, wenn sie rendert. */}
      {contactIsland && <h3 className="ws-form-title">Nachricht schreiben</h3>}
    </WerkstoffChapter>
  );
}
