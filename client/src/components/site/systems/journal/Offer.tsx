import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { menuVisible } from "../shared/heroFacts";
import { useSystem } from "../SystemContext";
import { chapterIndex, hasSection as has, useSlot, newTabIfMaps } from "../shared";
import {
  JournalChapter,
  chapterLabel,
  formatPrice,
  sectionClass,
  type JournalSection,
} from "./sections";

/**
 * Angebot nach Systemblatt („Leistungen als Preisliste"): Titel links in
 * h3, Preis rechts nur, wenn das Dokument einen nennt, Beschreibung klein
 * darunter, Haarlinien zwischen den Zeilen. Gruppen-Kicker („DAMEN") nur,
 * wo die Daten Gruppen haben (Preisliste, Speisekarte). Ab 64rem sitzt der
 * Kapitelkopf links (sticky), die Liste rechts zweispaltig.
 *
 * Erfunden wird nichts: Platzhalter für Preise, Speisekarte und Team
 * erscheinen nur in der Vorschau, solange der Abschnitt fehlt — Text aus
 * dem Bauplan, wie in artDirection/entrySections.tsx.
 */

type P<T extends JournalSection["type"]> = {
  section: Extract<JournalSection, { type: T }>;
  sections: readonly JournalSection[];
};

type Link = SectionOf<"services">["link"];

function SectionLink({ link }: { link: Link }) {
  if (!link) return null;
  return (
    <p className="jr-links jr-section-links">
      <a className="jr-link" href={link.href} {...newTabIfMaps(link.href)}>
        {link.text}
      </a>
    </p>
  );
}

/** Gestrichelte Karte „Nur in deiner Vorschau" — nie auf der Live-Seite. */
function PreviewCard({
  title,
  text,
  faces = false,
}: {
  title: string;
  text: string;
  faces?: boolean;
}) {
  return (
    <aside className="jr-slot" aria-label={title}>
      <div className="jr-slot-copy">
        <p className="jr-kicker">Nur in deiner Vorschau</p>
        <h3>{title}</h3>
        {text && <p>{text}</p>}
      </div>
      {faces && (
        <span className="jr-slot-faces" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </aside>
  );
}

function Row({
  title,
  price,
  description,
}: {
  title: string;
  price?: string;
  description?: string;
}) {
  return (
    <li className="jr-row">
      <h3>{rich(title)}</h3>
      {price && <span className="jr-price">{formatPrice(price)}</span>}
      {description && <p>{rich(description)}</p>}
    </li>
  );
}

export function JournalServices({ section, sections }: P<"services">) {
  const { blueprint } = useSystem();
  const index = chapterIndex(sections, "services");
  const id = SECTION_ANCHORS.services;
  const priceSlot = useSlot("pricelist", sections);
  return (
    <>
      <section
        id={id}
        className={sectionClass("services", index)}
        aria-labelledby={`${id}-titel`}
      >
        <div className="jr-wrap jr-split">
          <div className="jr-split-head">
            <JournalChapter
              id={id}
              index={index}
              label={chapterLabel("services", blueprint)}
              title={section.headline || chapterLabel("services", blueprint)}
              intro={section.intro}
            />
            <SectionLink link={section.link} />
          </div>
          <div className="jr-split-body">
            <ul className="jr-rows jr-rows--flat">
              {section.items.map(item => (
                <Row
                  key={item.title}
                  title={item.title}
                  price={item.price}
                  description={item.description}
                />
              ))}
            </ul>
            {priceSlot !== undefined && (
              <PreviewCard title="Deine Preise" text={priceSlot} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

type Priced = SectionOf<"pricelist"> | SectionOf<"menu">;

function PricedSection({
  section,
  sections,
  fallback,
}: {
  section: Priced;
  sections: readonly JournalSection[];
  fallback: string;
}) {
  const { blueprint } = useSystem();
  const type = section.type;
  const index = chapterIndex(sections, type);
  const id = SECTION_ANCHORS[type];
  const label = chapterLabel(type, blueprint);
  // Nicht „jr-menu": so heißt das Menü im Kopf (Chrome.tsx, Menü-Script).
  const name = type === "menu" ? "speisekarte" : type;
  return (
    <section
      id={id}
      className={sectionClass(name, index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap jr-split">
        <div className="jr-split-head">
          <JournalChapter
            id={id}
            index={index}
            label={label}
            title={section.headline || blueprint.headlines[type] || fallback}
          />
          <SectionLink link={section.link} />
        </div>
        <div className="jr-split-body jr-groups">
          {section.categories.map(category => (
            <div className="jr-group-block" key={category.name}>
              <h3 className="jr-kicker jr-group">{category.name}</h3>
              <ul className="jr-rows">
                {category.items.map(item => (
                  <Row
                    key={item.name}
                    title={item.name}
                    price={item.price}
                    description={item.description}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JournalPricelist({ section, sections }: P<"pricelist">) {
  return (
    <PricedSection section={section} sections={sections} fallback="Preise" />
  );
}

export function JournalMenu({ section, sections }: P<"menu">) {
  return (
    <PricedSection
      section={section}
      sections={sections}
      fallback="Speisekarte"
    />
  );
}

export function JournalProcess({ section, sections }: P<"process">) {
  const { blueprint } = useSystem();
  const index = chapterIndex(sections, "process");
  const id = SECTION_ANCHORS.process;
  return (
    <section
      id={id}
      className={sectionClass("process", index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap">
        <JournalChapter
          id={id}
          index={index}
          label={chapterLabel("process", blueprint)}
          title={section.headline ?? "So läuft's ab"}
        />
        <ol className="jr-steps" data-count={section.steps.length}>
          {section.steps.map((step, i) => (
            <li key={step.title} className="jr-step">
              <span className="jr-step-no" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{rich(step.title)}</h3>
                {step.text && <p>{rich(step.text)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function JournalTeam({ section, sections }: P<"team">) {
  const { blueprint } = useSystem();
  const index = chapterIndex(sections, "team");
  const id = SECTION_ANCHORS.team;
  // Porträts nur, wenn jedes Mitglied eins hat — sonst Namenszeilen.
  const portraits = section.members.every(m => m.imageUrl);
  return (
    <section
      id={id}
      className={sectionClass("team", index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap jr-split">
        <div className="jr-split-head">
          <JournalChapter
            id={id}
            index={index}
            label={chapterLabel("team", blueprint)}
            title={section.headline || blueprint.headlines.team || "Team"}
          />
        </div>
        <div className="jr-split-body">
          {portraits ? (
            <ul className="jr-team-grid">
              {section.members.map(member => (
                <li key={member.name}>
                  <figure>
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      width={800}
                      height={1000}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>
                      <h3>{member.name}</h3>
                      {member.role && (
                        <span className="jr-kicker">{member.role}</span>
                      )}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="jr-rows">
              {section.members.map(member => (
                <li className="jr-row" key={member.name}>
                  <h3>{member.name}</h3>
                  {member.role && <p>{member.role}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function JournalMenuSlot({
  sections,
}: {
  sections: readonly JournalSection[];
}) {
  const { data, preview, blueprint } = useSystem();
  // Wie entryGastro.menuPlaceholderShown: echte Karte = Abschnitt + Extra.
  const real = menuVisible(data) && has(sections, "menu");
  if (!preview || !blueprint.placeholders.includes("menu") || real) return null;
  return (
    <section id={SECTION_ANCHORS.menu} className="jr-section jr-slot-section">
      <div className="jr-wrap">
        <PreviewCard
          title={blueprint.headlines.menu ?? "Speisekarte"}
          text={blueprint.placeholderText.menu ?? ""}
        />
      </div>
    </section>
  );
}

export function JournalTeamSlot({
  sections,
}: {
  sections: readonly JournalSection[];
}) {
  const text = useSlot("team", sections);
  if (text === undefined) return null;
  return (
    <section id={SECTION_ANCHORS.team} className="jr-section jr-slot-section">
      <div className="jr-wrap">
        <PreviewCard title="Euer Team" text={text} faces />
      </div>
    </section>
  );
}
