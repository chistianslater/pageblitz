import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { nameOf } from "./facts";

/** Einstieg (Grundform W2): genau ein h1 mit dem Anzeigenamen. */
export function WerkstoffEntry({ hero }: { hero: SectionOf<"hero"> }) {
  const { data } = useSystem();
  return (
    <section
      id={SECTION_ANCHORS.hero}
      className="ws-entry"
      aria-labelledby="start-titel"
    >
      <div className="ws-wrap">
        <h1 id="start-titel" className="ws-entry-name">
          {nameOf(data)}
        </h1>
        <p className="ws-entry-lede">{rich(hero.headline)}</p>
      </div>
    </section>
  );
}
