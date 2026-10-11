import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { formatPrice, useSlot } from "../shared";
import { RasterFigures } from "./Figures";
import { PreviewCard, SectionLink, TableRow } from "./Offer";
import { bandPlan, bandTitle, fitBandName } from "./offerData";
import {
  RasterChapter,
  chapterLabel,
  useChapterNo,
  type RasterSection,
} from "./sections";

/**
 * Leistungen als Bänder (Systemblatt 7/8/11): Kapitelkopf „01 Leistungen",
 * darunter je Leistung ein Band über die volle Breite — Nummer und Preis
 * (nur aus den Daten) oben, Name in `figure`/Versal auf das längste Wort
 * eingepasst unten, Erklärung in onDeep 72 %. Die Bänder stapeln sich per
 * `position: sticky` (reines CSS, keine Scroll-Übernahme); ein einzelnes
 * Band steht still. Über sechs Leistungen: der Rest als Liste darunter.
 * Danach folgt die Zahlenzeile als eigenes Kapitel.
 */

type Service = SectionOf<"services">["items"][number];

function Band({
  item,
  index,
  photo,
}: {
  item: Service;
  index: number;
  photo?: string;
}) {
  const fit = fitBandName(item.title);
  const name = bandTitle(item.title);
  const variant = photo
    ? "rs-band--photo"
    : index % 2 === 1
      ? "rs-band--alt"
      : "rs-band--plain";
  return (
    <li className={`rs-band ${variant}`}>
      {photo && (
        <>
          {/* Galeriefotos haben keine bekannten Maße: width/height nur gegen
              Layout-Sprünge; das Bild füllt das Band per object-fit:cover. */}
          <img
            className="rs-band-img"
            src={photo}
            alt=""
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
          />
          <span className="rs-band-scrim" aria-hidden="true" />
        </>
      )}
      <div className="rs-band-in rs-wrap">
        <p className="rs-band-top">
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          {item.price && (
            <span className="rs-band-price">{formatPrice(item.price)}</span>
          )}
        </p>
        <div className="rs-band-text">
          <h3
            className={
              name.manual
                ? "rs-band-name rs-band-name--fuge"
                : fit.hyphenate
                  ? "rs-band-name rs-band-name--long"
                  : "rs-band-name"
            }
            style={
              {
                "--rs-fit": fit.widthEm.toFixed(3),
                ...(name.manual
                  ? { "--rs-fit-part": name.partEm.toFixed(3) }
                  : {}),
              } as React.CSSProperties
            }
          >
            {rich(name.text)}
          </h3>
          {item.description && (
            <p className="rs-band-desc">{rich(item.description)}</p>
          )}
        </div>
      </div>
    </li>
  );
}

export function RasterServices({
  section,
  sections,
}: {
  section: SectionOf<"services">;
  sections: readonly RasterSection[];
}) {
  const { blueprint } = useSystem();
  const plan = bandPlan(section, sections);
  const priceSlot = useSlot("pricelist", sections);
  const hasAfter = plan.rest.length > 0 || priceSlot !== undefined;
  const after = (
    <>
      <ol
        className={[
          "rs-bands",
          plan.single && "rs-bands--one",
          plan.flowNarrow && "rs-bands--flow",
          plan.flowWide && "rs-bands--flow-wide",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {plan.bands.map((item, i) => (
          <Band
            key={`${item.title}-${i}`}
            item={item}
            index={i}
            photo={plan.photos?.[i]}
          />
        ))}
      </ol>
      {hasAfter && (
        <div className="rs-wrap rs-g12 rs-band-after">
          <div className="rs-body rs-body--full">
            {plan.rest.length > 0 && (
              <div>
                <h3 className="rs-group-h">Weitere Leistungen</h3>
                <ul className="rs-table">
                  {plan.rest.map((item, i) => (
                    <TableRow
                      key={`${item.title}-${i}`}
                      title={item.title}
                      price={item.price}
                      description={item.description}
                    />
                  ))}
                </ul>
              </div>
            )}
            {priceSlot !== undefined && (
              <PreviewCard title="Deine Preise" text={priceSlot} />
            )}
          </div>
        </div>
      )}
    </>
  );
  return (
    <>
      <RasterChapter
        id={SECTION_ANCHORS.services}
        name="services"
        className={
          hasAfter ? "rs-sec--bands" : "rs-sec--bands rs-sec--bands-end"
        }
        no={useChapterNo(sections, "services")}
        label={chapterLabel("services", blueprint)}
        title={section.headline}
        intro={section.intro}
        after={after}
      >
        <SectionLink link={section.link} />
      </RasterChapter>
      <RasterFigures sections={sections} />
    </>
  );
}
