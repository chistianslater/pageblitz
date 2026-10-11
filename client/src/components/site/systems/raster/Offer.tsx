import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { menuVisible } from "../../artDirection/entryGastro";
import { useSystem } from "../SystemContext";
import { formatPrice, hasSection, useSlot } from "../shared";
import {
  RasterChapter,
  chapterLabel,
  useChapterNo,
  type RasterSection,
} from "./sections";

/**
 * Preise, Speisekarte und Team im Raster: Tabellen mit Haarlinien — Titel
 * links, Preis rechts (nur, wenn das Dokument einen nennt), Beschreibung
 * klein darunter. Platzhalter wie Journal: nur in der Vorschau und nur,
 * wenn der Bauplan sie vorsieht und der Abschnitt fehlt.
 */

type Link = SectionOf<"services">["link"];

export function SectionLink({ link }: { link: Link }) {
  if (!link) return null;
  return (
    <p>
      <a className="rs-link" href={link.href}>
        {link.text}
      </a>
    </p>
  );
}

/** Gestrichelte Karte „Nur in deiner Vorschau" — nie auf der Live-Seite. */
export function PreviewCard({
  title,
  text,
  faces = false,
}: {
  title: string;
  text: string;
  faces?: boolean;
}) {
  return (
    <aside className="rs-slot" aria-label={title}>
      <p className="rs-kicker">Nur in deiner Vorschau</p>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {faces && (
        <span className="rs-slot-faces" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </aside>
  );
}

/** Tabellenzeile: Titel links, Preis bzw. Nebenangabe rechts. */
export function TableRow({
  title,
  price,
  aside,
  description,
}: {
  title: string;
  price?: string;
  aside?: string;
  description?: string;
}) {
  return (
    <li className="rs-trow">
      <span className="rs-trow-title">{rich(title)}</span>
      {price && <span className="rs-price">{formatPrice(price)}</span>}
      {!price && aside && <span className="rs-trow-aside">{aside}</span>}
      {description && <p className="rs-trow-desc">{rich(description)}</p>}
    </li>
  );
}

type Priced = SectionOf<"pricelist"> | SectionOf<"menu">;

export function RasterPriced({
  section,
  sections,
}: {
  section: Priced;
  sections: readonly RasterSection[];
}) {
  const { blueprint } = useSystem();
  const type = section.type;
  const label = chapterLabel(type, blueprint);
  return (
    <RasterChapter
      id={SECTION_ANCHORS[type]}
      // Nicht „rs-menu": so heißt das Menü im Kopf.
      name={type === "menu" ? "speisekarte" : type}
      no={useChapterNo(sections, type)}
      label={label}
      title={section.headline || blueprint.headlines[type]}
      full
    >
      <div className="rs-groups">
        {section.categories
          .filter(c => c.items.length > 0)
          .map(category => (
            <div key={category.name}>
              <h3 className="rs-group-h">{category.name}</h3>
              <ul className="rs-table">
                {category.items.map(item => (
                  <TableRow
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
      <SectionLink link={section.link} />
    </RasterChapter>
  );
}

/** Team als Namenszeilen (Rolle rechts); Porträts folgen mit R5. */
export function RasterTeam({
  section,
  sections,
}: {
  section: SectionOf<"team">;
  sections: readonly RasterSection[];
}) {
  const { blueprint } = useSystem();
  return (
    <RasterChapter
      id={SECTION_ANCHORS.team}
      name="team"
      no={useChapterNo(sections, "team")}
      label={chapterLabel("team", blueprint)}
      title={section.headline || blueprint.headlines.team}
      full
    >
      <ul className="rs-table">
        {section.members.map(member => (
          <TableRow key={member.name} title={member.name} aside={member.role} />
        ))}
      </ul>
    </RasterChapter>
  );
}

/** Platzhalter als eigener (unnummerierter) Abschnitt im Kapitel-Raster. */
function SlotSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rs-slot-section">
      <div className="rs-wrap rs-g12">
        <div className="rs-body rs-body--full">{children}</div>
      </div>
    </section>
  );
}

export function RasterMenuSlot({
  sections,
}: {
  sections: readonly RasterSection[];
}) {
  const { data, preview, blueprint } = useSystem();
  // Wie Journal: echte Karte = Abschnitt + Extra.
  const real = menuVisible(data) && hasSection(sections, "menu");
  if (!preview || !blueprint.placeholders.includes("menu") || real) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.menu}>
      <PreviewCard
        title={blueprint.headlines.menu ?? "Speisekarte"}
        text={blueprint.placeholderText.menu ?? ""}
      />
    </SlotSection>
  );
}

export function RasterTeamSlot({
  sections,
}: {
  sections: readonly RasterSection[];
}) {
  const text = useSlot("team", sections);
  if (text === undefined) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.team}>
      <PreviewCard title="Euer Team" text={text} faces />
    </SlotSection>
  );
}
