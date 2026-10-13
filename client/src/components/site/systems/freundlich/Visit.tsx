import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { rich } from "../../richText";
import { telHref } from "../shared/heroFacts";
import { hoursRows } from "../shared/hours";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  mailHref,
  mapsHref,
  newTabIfMaps,
  systemHref,
  telLabel,
} from "../shared";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import { tintOf } from "./content";
import { freundlichActions } from "./facts";
import { Icon, wayIcon } from "./icons";
import { FreundlichChapter, type Place } from "./sections";

/**
 * Besuch nach Systemblatt 8/13/14/17: „Gut zu wissen" als weiße Karten
 * zum Aufklappen (erste Frage offen, Pastellkachel mit Plus/Minus),
 * „Besuch uns" mit Zeiten auf tiefer Fläche („heute" als Text am
 * Wochentag — kein „jetzt geöffnet", Seiten liegen im Cache) und weißer
 * Kartenkachel ohne Einbettung (keine Drittanbieter-Anfrage): Adresse,
 * Telefon, E-Mail, „Route planen" im neuen Tab. Abschluss-Band auf
 * Pastell 4 mit Hauptweg und Telefonnummer.
 */

export function FreundlichFaq({
  section,
  place,
}: {
  section: SectionOf<"faq">;
  place: Place;
}) {
  if (section.items.length === 0) return null;
  return (
    <FreundlichChapter type="faq" own={section.headline} place={place}>
      <div className="fr-faq">
        {section.items.map((item, i) => (
          <details
            className="fr-q"
            key={`${item.question}-${i}`}
            {...(i === 0 ? { open: true } : {})}
          >
            <summary>
              <span className="fr-q-text">{rich(item.question)}</span>
              <span
                className={`fr-tile fr-tile--toggle fr-tint-${tintOf(i + 1)}`}
                aria-hidden="true"
              >
                <span className="fr-q-plus">
                  <Icon name="plus" />
                </span>
                <span className="fr-q-minus">
                  <Icon name="minus" />
                </span>
              </span>
            </summary>
            <p className="fr-q-answer">{rich(item.answer)}</p>
          </details>
        ))}
      </div>
    </FreundlichChapter>
  );
}

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Zeiten auf tiefer Fläche, heute hervorgehoben (Text „heute" + Fläche). */
function Hours({
  rows,
  title,
}: {
  rows: ReturnType<typeof hoursRows>;
  title: string;
}) {
  return (
    <div className="fr-hours">
      <h3 className="fr-hours-title" id="kontakt-zeiten">
        {title}
      </h3>
      <table className="fr-hours-table" aria-labelledby="kontakt-zeiten">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.label}-${i}`}
              className={r.today ? "fr-now" : r.closed ? "fr-zu" : undefined}
            >
              <th scope="row">{r.label}</th>
              <td className={r.spans ? "fr-hv" : "fr-hv fr-hv--text"}>
                {r.lines.map((l, k) => (
                  <span key={k}>{l}</span>
                ))}
                {r.today && <span className="fr-now-tag">heute</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * „Besuch uns": Zeiten (eigene h3) und Kartenkachel mit Anschrift (h3).
 * Ohne Zeiten nur die Kachel, ohne Anschrift und Wege nur die Zeiten.
 * Darunter — nur wenn die Kontakt-Insel rendert — ihr Titel; die Insel
 * hängt die Hydration an diese <section> (#kontakt).
 */
export function FreundlichContact({
  section,
  place,
}: {
  section: SectionOf<"contact">;
  place: Place;
}) {
  const { blueprint, now, contactIsland } = useSystem();
  const rows = hoursRows(section.openingHours, now);
  const address = addressLine(section);
  const route = address ? mapsHref(address) : undefined;
  const phone = section.phone?.trim();
  const tel = telHref(phone);
  const email = section.email?.trim();
  const mail = mailHref(email);
  const card = Boolean(address || tel || mail);
  const street = section.street?.trim();
  const town = [section.zip, section.city].filter(Boolean).join(" ").trim();
  return (
    <FreundlichChapter type="contact" own={section.headline} place={place}>
      {(rows.length > 0 || card) && (
        <div
          className={
            rows.length && card ? "fr-visit" : "fr-visit fr-visit--solo"
          }
        >
          {rows.length > 0 && (
            <Hours rows={rows} title={blueprint.hoursLabel ?? "Öffnungszeiten"} />
          )}
          {card && (
            <div className="fr-place">
              {address && (
                <div className="fr-map" aria-hidden="true">
                  <span className="fr-map-road" />
                  <span className="fr-map-blob" />
                  <span className="fr-map-pin">
                    <Icon name="pin" />
                  </span>
                </div>
              )}
              <div className="fr-place-body">
                {address && (
                  <h3 className="fr-place-adr">
                    {street}
                    {street && town && <br />}
                    {town}
                  </h3>
                )}
                <div className="fr-ways" {...SYS_ACTIONS}>
                  {tel && phone && (
                    <a className="fr-way" href={tel}>
                      <Icon name="phone" />
                      {phone}
                    </a>
                  )}
                  {mail && email && (
                    <a className="fr-way" href={mail}>
                      <Icon name="mail" />
                      {email}
                    </a>
                  )}
                  {route && (
                    <a className="fr-btn fr-btn--s" href={route} {...EXTERNAL}>
                      <Icon name="route" />
                      Route planen
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {contactIsland && <h3 className="fr-form-title">Nachricht schreiben</h3>}
    </FreundlichChapter>
  );
}

/**
 * Abschluss-Band (Systemblatt 13/14): Titel mittig in zwei Tönen, darunter
 * der Hauptknopf — eigenes Ziel, wenn es trägt (systemHref), sonst der
 * Hauptweg — und die Telefonnummer als Zweitknopf. Ruft der Hauptknopf
 * schon an, steht nur er („Anrufen").
 */
export function FreundlichCta({
  section,
  anchorPrefix,
  place,
}: {
  section: SectionOf<"cta">;
  anchorPrefix: string;
  place: Place;
}) {
  const { data, blueprint } = useSystem();
  const ways = freundlichActions(data, blueprint, anchorPrefix);
  const own = systemHref(section.ctaHref, data, anchorPrefix);
  const href = own ?? ways.primary?.href;
  const text = section.ctaText?.trim() || ways.primary?.label;
  const primary = href && text ? { href, label: telLabel(text, href) } : undefined;
  const phone = ways.phone && ways.phone.href !== primary?.href ? ways.phone : undefined;
  return (
    <FreundlichChapter
      type="cta"
      own={section.headline}
      place={place}
      layout="center"
    >
      {(primary || phone) && (
        <div className="fr-ctas fr-ctas--band" {...SYS_ACTIONS}>
          {primary && (
            <a
              className="fr-btn fr-btn--p"
              href={primary.href}
              {...newTabIfMaps(primary.href)}
            >
              <Icon name={wayIcon(primary.href)} />
              {primary.label}
            </a>
          )}
          {phone && (
            <a className="fr-btn fr-btn--s" href={phone.href}>
              <Icon name="phone" />
              {phone.label}
            </a>
          )}
        </div>
      )}
    </FreundlichChapter>
  );
}
