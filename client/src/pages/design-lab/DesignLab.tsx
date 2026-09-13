import { useEffect, useState } from "react";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import "@/components/site/packs/raster";
import "@/components/site/packs/gusto";
import "@/components/site/packs/salon-noir";
import { packFontHrefs } from "@/lib/packFonts";
import { ReferenceSite } from "./ReferenceSite";
import { referenceDocument, references, type ReferenceId } from "./references";
import "./design-lab.css";
import "./refinement.css";
import "./surface-details.css";

/** Development-only review surface. No customer documents or pack defaults are mutated. */
export default function DesignLab() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("reference");
  const initial: ReferenceId =
    raw && Object.hasOwn(references, raw)
      ? (raw as ReferenceId)
      : "architecture";
  const [id, setId] = useState<ReferenceId>(initial);
  const [before, setBefore] = useState(params.get("before") === "1");
  const embedded = params.get("frame") === "1";
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const old = document.title;
    document.title = `${references[id].name} · Pageblitz Designlabor`;
    return () => {
      document.title = old;
    };
  }, [id]);
  useEffect(() => {
    if (!before) return;
    const links = packFontHrefs(references[id].pack).map(href => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach(link => link.remove());
  }, [id, before]);
  function select(next: ReferenceId) {
    setId(next);
    window.scrollTo(0, 0);
  }
  return (
    <div className="design-lab">
      {!embedded && (
        <div className="lab-toolbar">
          <strong>
            Pageblitz <span>Designlabor</span>
          </strong>
          <div role="group" aria-label="Referenzbranche">
            {(Object.keys(references) as ReferenceId[]).map(key => (
              <button
                key={key}
                aria-pressed={id === key}
                onClick={() => select(key)}
              >
                {references[key].category}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Darstellung">
            <button aria-pressed={!before} onClick={() => setBefore(false)}>
              Neuer Entwurf
            </button>
            <button aria-pressed={before} onClick={() => setBefore(true)}>
              Bisheriges Pack
            </button>
            <button aria-pressed={mobile} onClick={() => setMobile(!mobile)}>
              Mobilansicht
            </button>
          </div>
        </div>
      )}
      {mobile && !embedded ? (
        <div className="lab-mobile">
          <iframe
            title={`${references[id].category} Mobilvorschau`}
            src={`/design-lab?frame=1&reference=${id}&before=${before ? 1 : 0}`}
          />
        </div>
      ) : before ? (
        <SiteRenderer
          data={referenceDocument(id)}
          islandsMode="preview"
          site={{ showBranding: false }}
        />
      ) : (
        <ReferenceSite key={id} id={id} />
      )}
    </div>
  );
}
