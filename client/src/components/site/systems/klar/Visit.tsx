import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { rich } from "../../richText";
import { telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import { addressLine, mailHref, mapsHref } from "../shared";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import { entryVariant, hoursLabel, klarActions, type Action } from "./facts";
import { hoursRows } from "./hours";
import { KlarHoursCard } from "./HoursCard";
import { Icon, wayIcon } from "./icons";
import { KlarChapter, type KlarSection } from "./sections";

/**
 * Besuch nach Systemblatt 9–11: Fragen als <details> mit Plus-Kachel
 * (erste offen), Sprechzeiten-Karte mit „heute" neben der Anfahrt —
 * ruhige Kartenkachel ohne Einbettung (keine Drittanbieter-Anfrage),
 * Adresse, Zugang nur aus Daten, „Route planen". Aufruf als tiefes Band
 * mit denselben Wegen wie der Einstieg (klarActions).
 */

export function KlarFaq({ section }: { section: SectionOf<"faq"> }) {
  return (
    <KlarChapter type="faq" own={section.headline}>
      <div className="kl-faqs">
        {section.items.map((item, i) => (
          <details
            className="kl-faq-item"
            key={`${item.question}-${i}`}
            open={i === 0 || undefined}
          >
            <summary>
              <span className="kl-faq-q">{item.question}</span>
              <span className="kl-faq-sign" aria-hidden="true">
                <Icon name="plus" />
              </span>
            </summary>
            <div className="kl-faq-a">
              <p>{rich(item.answer)}</p>
            </div>
          </details>
        ))}
      </div>
    </KlarChapter>
  );
}

/** Generische Überschriften: dann trägt die Klar-Wortwahl. */
const GENERIC_TITLE = /^(kontakt|contact)$/i;

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

export function KlarContact({
  section,
  sections,
}: {
  section: SectionOf<"contact">;
  sections: readonly KlarSection[];
}) {
  const { data, blueprint, now, contactIsland } = useSystem();
  const own =
    section.headline && !GENERIC_TITLE.test(section.headline.trim())
      ? section.headline
      : undefined;
  // Steht die Zeiten-Tabelle schon als Bild im Einstieg, nicht noch einmal.
  const hero = sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const rows =
    hero && entryVariant(data, hero) === "hours"
      ? []
      : hoursRows(section.openingHours, now);
  const address = addressLine(section);
  const route = address ? mapsHref(address) : undefined;
  const phone = section.phone?.trim();
  const tel = telHref(phone);
  const email = section.email?.trim();
  const mail = mailHref(email);
  const access = data.amenities?.wheelchair === true;
  const area = blueprint.serviceArea && section.city?.trim();
  return (
    <KlarChapter type="contact" own={own}>
      <div className={rows.length ? "kl-visit" : "kl-visit kl-visit--solo"}>
        {rows.length > 0 && (
          <KlarHoursCard
            id="kontakt-zeiten"
            label={hoursLabel(blueprint)}
            rows={rows}
          />
        )}
        <div className="kl-place">
          {address && (
            <div className="kl-map" aria-hidden="true">
              <span className="kl-map-park" />
              <span className="kl-map-pin">
                <Icon name="pin" />
              </span>
            </div>
          )}
          <div className="kl-place-body">
            {address && <p className="kl-place-addr">{address}</p>}
            {(access || area) && (
              <ul className="kl-place-acc">
                {access && (
                  <li>
                    <Icon name="wheelchair" />
                    Barrierefreier Zugang
                  </li>
                )}
                {area && (
                  <li>
                    <Icon name="pin" />
                    Einsatzgebiet: {area} und Umgebung
                  </li>
                )}
              </ul>
            )}
            {(tel || mail || route) && (
              <div className="kl-place-ways" {...SYS_ACTIONS}>
                {tel && phone && (
                  <a className="kl-way" href={tel}>
                    <Icon name="phone" />
                    {phone}
                  </a>
                )}
                {mail && email && (
                  <a className="kl-way" href={mail}>
                    <Icon name="mail" />
                    {email}
                  </a>
                )}
                {route && (
                  <a className="kl-btn kl-btn--s" href={route} {...EXTERNAL}>
                    <Icon name="route" />
                    Route planen
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Formular = Kontakt-Insel (SiteIslands, data-target="#kontakt");
          hier nur ihr Titel — und nur, wenn sie rendert. */}
      {contactIsland && <h3 className="kl-form-title">Nachricht schreiben</h3>}
    </KlarChapter>
  );
}

/**
 * Aufruf: großer Satz auf der tiefen Fläche, Hauptknopf hell. Ziel: eigener
 * Link des Abschnitts, sonst der Termin-Weg aus klarActions (nur sichtbare
 * Abschnitte, auf Unterseiten mit Präfix zur Startseite) — nie ein Anker
 * auf einen ausgeblendeten Kontakt. Daneben der zweite Weg (Nummer bzw.
 * Route), wie im Einstieg.
 */
export function KlarCta({
  section,
  anchorPrefix,
}: {
  section: SectionOf<"cta">;
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const ways = klarActions(data, blueprint, anchorPrefix);
  const href = section.ctaHref ?? ways.primary?.href;
  const primary: Action | undefined = href
    ? { label: section.ctaText, href }
    : undefined;
  const second =
    section.ctaHref && ways.phone?.href !== section.ctaHref
      ? ways.phone
      : ways.second;
  return (
    <KlarChapter
      type="cta"
      title={section.headline}
      className="kl-band"
      titleClass="kl-band-title"
    >
      {primary && (
        <div className="kl-band-actions" {...SYS_ACTIONS}>
          <a className="kl-btn kl-btn--p" href={primary.href}>
            {primary.label}
            <span className="kl-btn-ic">
              <Icon name={wayIcon(primary.href)} />
            </span>
          </a>
          {second && second.href !== primary.href && (
            <a className="kl-btn kl-btn--s" href={second.href}>
              <Icon name={wayIcon(second.href)} />
              {second.label}
            </a>
          )}
        </div>
      )}
    </KlarChapter>
  );
}
