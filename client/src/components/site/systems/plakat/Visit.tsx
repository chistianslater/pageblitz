import React from "react";
import { rich } from "../../richText";
import {
  coversToday,
  isPlaceholderHours,
  shortHours,
  telHref,
  whatsappHref,
} from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import { addressLine, contactOf, mailHref, mapsHref } from "../shared";
import { PlakatChapter, chapterTitle, type PlakatSection } from "./sections";
import { lateFigure } from "./offerData";
import type { Field } from "./rhythm";
import { SYS_ACTIONS } from "../shared/dockAutoHide";

/**
 * Fragen und Vorbeikommen nach Systemblatt (Bausteine „Fragen", „Zeiten
 * mit Heute"): Fragen als <details> mit Plus im Kreis (erste offen,
 * invertiert). Zeiten als Pillen-Zeilen, heute als Tinte-Pille mit
 * Signal-Etikett „Heute"; späte Schließzeit nach Mitternacht als riesige
 * Ziffer. Daneben Adresse, Telefon, E-Mail, Knöpfe und eine ruhige
 * Kartenfläche ohne Einbettung (Link zur Route, keine Drittanbieter-
 * Anfrage). Platzhalter-Zeiten erscheinen nie; ohne Adresse keine Karte;
 * der Formular-Titel nur, wenn die Kontakt-Insel wirklich rendert.
 */

type Props<T extends PlakatSection["type"]> = {
  section: Extract<PlakatSection, { type: T }>;
  sections: readonly PlakatSection[];
  field: Field;
};

export function PlakatFaq({ section, sections, field }: Props<"faq">) {
  const { blueprint } = useSystem();
  const phone = contactOf(sections)?.phone?.trim();
  const tel = telHref(phone);
  return (
    <PlakatChapter
      type="faq"
      field={field}
      title={chapterTitle("faq", section.headline, blueprint)}
    >
      <div className="pk-faqs">
        {section.items.map((item, i) => (
          <details
            className="pk-faq-item"
            key={`${item.question}-${i}`}
            open={i === 0 || undefined}
          >
            <summary>
              <span className="pk-faq-q">{rich(item.question)}</span>
              <span className="pk-faq-sign" aria-hidden="true" />
            </summary>
            <p className="pk-faq-a">{rich(item.answer)}</p>
          </details>
        ))}
      </div>
      {tel && (
        <p className="pk-faq-call">
          Noch was offen?{" "}
          <a className="pk-ul" href={tel}>
            {phone} anrufen
          </a>
        </p>
      )}
    </PlakatChapter>
  );
}

const CLOSED = /geschlossen|closed|ruhetag/i;
/** Generische Überschriften: dann trägt die Plakat-Wortwahl. */
const GENERIC_TITLE = /^(kontakt|contact)$/i;

function Hours({
  hours,
  label,
}: {
  hours: { day: string; hours: string }[];
  label: string;
}) {
  const { now } = useSystem();
  return (
    <ul className="pk-hours" aria-label={label}>
      {hours.map((entry, i) => {
        const today = coversToday(entry.day, now);
        return (
          <li
            key={`${entry.day}-${i}`}
            className={
              today ? "pk-hours-row pk-hours-row--today" : "pk-hours-row"
            }
          >
            <span className="pk-hours-day">
              {entry.day}
              {today && (
                <>
                  {" "}
                  <em className="pk-today">Heute</em>
                </>
              )}
            </span>
            <span className="pk-hours-time">
              {CLOSED.test(entry.hours)
                ? "geschlossen"
                : shortHours(entry.hours)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function PlakatContact({ section, field }: Props<"contact">) {
  const { data, blueprint, contactIsland } = useSystem();
  const inquiry = blueprint.contactMode === "inquiry";
  const raw = section.openingHours ?? [];
  const hours = isPlaceholderHours(raw) ? [] : raw;
  const late = hours.length ? lateFigure(hours) : undefined;
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
    <PlakatChapter
      type="contact"
      field={field}
      title={chapterTitle("contact", own, blueprint)}
    >
      <div className={hours.length ? "pk-visit" : "pk-visit pk-visit--solo"}>
        {hours.length > 0 && (
          <div className="pk-visit-hours">
            {late && (
              <p className="pk-late">
                <span className="pk-sr">Spätestens offen bis </span>
                {late}
                <span className="pk-sr"> Uhr</span>
              </p>
            )}
            <Hours
              hours={hours}
              label={blueprint.hoursLabel ?? "Öffnungszeiten"}
            />
          </div>
        )}
        <div className="pk-visit-reach" {...SYS_ACTIONS}>
          {address && <p className="pk-visit-address">{address}</p>}
          {tel && (
            <p>
              <a className="pk-ul pk-visit-tel" href={tel}>
                {phone}
              </a>
            </p>
          )}
          {mail && section.email && (
            <p>
              <a className="pk-visit-mail" href={mail}>
                {section.email.trim()}
              </a>
            </p>
          )}
          {whatsapp && (
            <p>
              <a className="pk-visit-mail" href={whatsapp} {...external}>
                WhatsApp
              </a>
            </p>
          )}
          {blueprint.serviceArea && section.city && (
            <p className="pk-visit-area">
              Einsatzgebiet: {section.city} und Umgebung
            </p>
          )}
          {(tel || (inquiry && inquiryHref)) && (
            <p className="pk-visit-actions">
              {inquiry && inquiryHref && (
                <a className="pk-btn" href={inquiryHref}>
                  {blueprint.ctaText ?? "Anfrage senden"}
                  <i aria-hidden="true">→</i>
                </a>
              )}
              {tel &&
                (inquiry ? (
                  <a className="pk-btn2" href={tel}>
                    Anrufen
                  </a>
                ) : (
                  <a className="pk-btn" href={tel}>
                    Anrufen
                    <i aria-hidden="true">→</i>
                  </a>
                ))}
            </p>
          )}
          {route && (
            <a
              className="pk-map"
              href={route}
              aria-label={`${routeLabel}: ${address}`}
              {...external}
            >
              <span className="pk-map-dot" aria-hidden="true" />
              <span className="pk-map-label" aria-hidden="true">
                {routeLabel}
              </span>
            </a>
          )}
        </div>
      </div>
      {/* Formular = Kontakt-Insel (SiteIslands, data-target="#kontakt");
          hier nur ihr Titel — und nur, wenn sie rendert. */}
      {contactIsland && <h3 className="pk-form-title">Nachricht schreiben</h3>}
    </PlakatChapter>
  );
}
