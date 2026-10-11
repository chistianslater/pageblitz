import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { coversToday } from "../../artDirection/heroFacts";
import { menuVisible } from "../../artDirection/entryGastro";
import { useSystem } from "../SystemContext";
import { formatPrice, hasSection, useSlot } from "../shared";
import {
  WerkstoffChapter,
  chapterTitle,
  type WerkstoffSection,
} from "./sections";
import { processMode, stepTime } from "./offerData";

/**
 * Angebot nach Systemblatt (Anker Hollis): Leistungen als Liste mit
 * Tinte-Linien und Oxid-Pfeil, Ablauf als Riesenziffern 1·2·3 (mit Foto aus
 * der Galerie, wenn eins frei ist) oder als Tageszeitleiste (Northdock),
 * Preise/Speisekarte als begrenzte Wochentafel in Signal, Zahlen als
 * Ziffernzeile. Preise nur, wenn das Dokument sie nennt; Platzhalter nur in
 * der Vorschau.
 */

type Props<T extends WerkstoffSection["type"]> = {
  section: Extract<WerkstoffSection, { type: T }>;
  sections: readonly WerkstoffSection[];
};

type Link = SectionOf<"services">["link"];

export function SectionLink({ link }: { link: Link }) {
  if (!link) return null;
  return (
    <p className="ws-more">
      <a className="ws-link" href={link.href}>
        {link.text}
      </a>
    </p>
  );
}

/** Gestrichelte Karte „Nur in deiner Vorschau" — nie auf der Live-Seite. */
export function PreviewCard({ title, text }: { title: string; text: string }) {
  return (
    <aside className="ws-slot" aria-label={title}>
      <p className="ws-data">Nur in deiner Vorschau</p>
      <h3 className="ws-slot-title">{title}</h3>
      {text && <p className="ws-slot-text">{text}</p>}
    </aside>
  );
}

/* ── Leistungen ──────────────────────────────────────────────────────── */

export function WerkstoffServices({ section, sections }: Props<"services">) {
  const { blueprint } = useSystem();
  const priceSlot = useSlot("pricelist", sections);
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.services}
      name="services"
      title={chapterTitle("services", section.headline, blueprint)}
      intro={section.intro}
      display
    >
      <ul className="ws-list">
        {section.items.map((item, i) => (
          <li key={`${item.title}-${i}`}>
            <h3 className="ws-list-title">{rich(item.title)}</h3>
            <span className="ws-list-arrow" aria-hidden="true">
              →
            </span>
            {item.description && (
              <p className="ws-list-text">{rich(item.description)}</p>
            )}
            {item.price?.trim() && (
              <span className="ws-data ws-list-meta">
                {formatPrice(item.price)}
              </span>
            )}
          </li>
        ))}
      </ul>
      <SectionLink link={section.link} />
      {priceSlot !== undefined && (
        <PreviewCard title="Deine Preise" text={priceSlot} />
      )}
    </WerkstoffChapter>
  );
}

/* ── Ablauf ──────────────────────────────────────────────────────────── */

function Numbers({ steps }: { steps: SectionOf<"process">["steps"] }) {
  return (
    <ol className="ws-steps">
      {steps.map((s, i) => (
        <li className="ws-step" key={`${s.title}-${i}`}>
          <span className="ws-step-no" aria-hidden="true">
            {i + 1}
          </span>
          <h3 className="ws-step-title">{rich(s.title)}</h3>
          {s.text && <p className="ws-step-text">{rich(s.text)}</p>}
        </li>
      ))}
    </ol>
  );
}

/** Tageszeitleiste: wischbar (scroll-snap), kein Autoplay, Tastatur scrollt. */
function DayTrack({ steps }: { steps: SectionOf<"process">["steps"] }) {
  return (
    <div className="ws-wrap">
      <div
        className="ws-day"
        role="region"
        aria-label="Tagesablauf"
        // Scrollbarer Bereich: mit der Tastatur erreichbar (Pfeiltasten).
        tabIndex={0}
      >
        <ol className="ws-day-track">
          {steps.map((s, i) => {
            const t = stepTime(s.title)!;
            return (
              <li className="ws-day-card" key={`${s.title}-${i}`}>
                {t.label ? (
                  <>
                    <p className="ws-day-time">{t.time}</p>
                    <h3 className="ws-day-label">{rich(t.label)}</h3>
                  </>
                ) : (
                  <h3 className="ws-day-time">{t.time}</h3>
                )}
                {s.text && <p className="ws-day-text">{rich(s.text)}</p>}
              </li>
            );
          })}
        </ol>
      </div>
      {steps.length > 2 && (
        <p className="ws-data ws-day-hint" aria-hidden="true">
          Wischen für den ganzen Tag →
        </p>
      )}
    </div>
  );
}

export function WerkstoffProcess({
  section,
  photo,
}: Props<"process"> & { photo?: string }) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS.process;
  const title = chapterTitle("process", section.headline, blueprint);
  if (processMode(section) === "timeline")
    return (
      <WerkstoffChapter
        id={id}
        name="process"
        className="ws-process--day"
        title={title}
        after={<DayTrack steps={section.steps} />}
      />
    );
  if (!photo)
    return (
      <WerkstoffChapter id={id} name="process" title={title}>
        <Numbers steps={section.steps} />
      </WerkstoffChapter>
    );
  // Hollis: Foto links bzw. oben randlos, Text daneben.
  return (
    <section
      id={id}
      className="ws-sec ws-process ws-process--photo"
      aria-labelledby={`${id}-titel`}
    >
      <div className="ws-steps-grid">
        <div className="ws-steps-photo">
          {/* Galeriefoto, Maße unbekannt: width/height nur gegen Sprünge. */}
          <img
            src={photo}
            alt=""
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="ws-steps-body">
          <h2 className="ws-title" id={`${id}-titel`}>
            {rich(title)}
          </h2>
          <Numbers steps={section.steps} />
        </div>
      </div>
    </section>
  );
}

/* ── Wochentafel: Preise und Speisekarte ─────────────────────────────── */

/** Reiner Wochentag („Mi", „Mittwoch") — dann darf die Zeile „heute" tragen. */
const DAY_NAME =
  /^(mo|di|mi|do|fr|sa|so)(ntag|nstag|ttwoch|nnerstag|eitag|mstag|nnabend)?\.?$/i;

type Priced = SectionOf<"pricelist"> | SectionOf<"menu">;

export function WerkstoffPriced({ section }: { section: Priced }) {
  const { blueprint, now } = useSystem();
  const type = section.type;
  const id = SECTION_ANCHORS[type];
  const label = chapterTitle(type, undefined, blueprint);
  const title = chapterTitle(type, section.headline, blueprint);
  const categories = section.categories.filter(c => c.items.length > 0);
  const single = categories.length === 1;
  return (
    <section
      id={id}
      // Nicht „ws-menu": so heißt das Menü im Kopf.
      className={`ws-sec ws-${type === "menu" ? "speisekarte" : type}`}
      aria-labelledby={`${id}-titel`}
    >
      <div className="ws-wrap">
        <div className="ws-board">
          <p className="ws-data ws-board-label">
            {single ? categories[0].name : label}
          </p>
          <h2 className="ws-board-title" id={`${id}-titel`}>
            {rich(title)}
          </h2>
          {categories.map(category => (
            <div className="ws-board-group" key={category.name}>
              {!single && <h3 className="ws-data ws-board-cat">{category.name}</h3>}
              <ul className="ws-board-list">
                {category.items.map((item, i) => {
                  const today =
                    DAY_NAME.test(item.name.trim()) &&
                    coversToday(item.name.trim(), now);
                  return (
                    <li
                      key={`${item.name}-${i}`}
                      className={today ? "ws-board-row ws-board-row--today" : "ws-board-row"}
                    >
                      <span className="ws-board-name">{rich(item.name)}</span>
                      {today && <span className="ws-data ws-board-today">heute</span>}
                      {item.price?.trim() && (
                        <span className="ws-data ws-board-price">
                          {formatPrice(item.price)}
                        </span>
                      )}
                      {item.description && (
                        <p className="ws-board-desc">{rich(item.description)}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <SectionLink link={section.link} />
      </div>
    </section>
  );
}

/* ── Zahlen ──────────────────────────────────────────────────────────── */

export function WerkstoffStats({ section }: Props<"stats">) {
  const { blueprint } = useSystem();
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.stats}
      name="stats"
      title={chapterTitle("stats", section.headline, blueprint)}
    >
      <ul className="ws-figs">
        {section.items.map((item, i) => (
          <li key={`${item.value}-${i}`}>
            <span className="ws-fig-value">{item.value}</span>
            <span className="ws-data ws-fig-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </WerkstoffChapter>
  );
}

/* ── Vorschau-Platzhalter als eigene Abschnitte ──────────────────────── */

function SlotSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="ws-slot-section">
      <div className="ws-wrap">{children}</div>
    </section>
  );
}

export function WerkstoffMenuSlot({
  sections,
}: {
  sections: readonly WerkstoffSection[];
}) {
  const { data, preview, blueprint } = useSystem();
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

export function WerkstoffTeamSlot({
  sections,
}: {
  sections: readonly WerkstoffSection[];
}) {
  const text = useSlot("team", sections);
  if (text === undefined) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.team}>
      <PreviewCard title="Euer Team" text={text} />
    </SlotSection>
  );
}
