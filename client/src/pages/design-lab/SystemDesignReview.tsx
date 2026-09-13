import { useEffect, useState } from "react";
import { getFixture } from "@shared/siteContract/fixtures";
import {
  PACK_IDS,
  type PackId,
  type WebsiteDataV2,
} from "@shared/siteContract/types";
import { getPackPool } from "@shared/stylePacks";
import {
  compositionFingerprint,
  withArtDirection,
} from "@shared/stylePacks/artDirection";
import { pickArtTheme } from "@shared/stylePacks/artThemes";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import "@/components/site/packs";
import { packFontHrefs } from "@/lib/packFonts";
import { referenceDocument } from "./references";
import "./design-lab.css";

export function salonVariations(): WebsiteDataV2[] {
  const pool = getPackPool("Friseur");
  const occupied = new Set<string>();
  return Array.from({ length: 12 }, (_, i) => {
    const stylePackId = pool[i % pool.length];
    const businessName = `Salon Beispiel ${i + 1}`;
    let data = withArtDirection(
      {
        ...referenceDocument("salon"),
        stylePackId,
        businessName,
        businessCategory: "Friseur",
        ...pickArtTheme(stylePackId, businessName),
      },
      occupied
    );
    occupied.add(compositionFingerprint(stylePackId, data.designProfile!));
    return data;
  });
}
function scenario(data: WebsiteDataV2, mode: string): WebsiteDataV2 {
  if (mode === "albums")
    return {
      ...data,
      sections: data.sections.map(s =>
        s.type === "gallery"
          ? {
              ...s,
              albums: s.images.map((image, i) => ({
                title: `Album ${i + 1}`,
                images: [image],
              })),
            }
          : s
      ),
    };
  if (mode === "long")
    return {
      ...data,
      businessName: "Gemeinschaftspraxis und Beratungszentrum am Stadtpark",
      sections: data.sections.map(s =>
        s.type === "hero"
          ? {
              ...s,
              headline:
                "Persönliche Beratung und sorgfältige Begleitung für die Menschen in unserer Region",
              ctaText: "Jetzt ein persönliches Beratungsgespräch vereinbaren",
            }
          : s
      ),
    };
  if (mode === "no-images")
    return {
      ...data,
      sections: data.sections
        .filter(s => s.type !== "gallery")
        .map(s =>
          s.type === "hero" || s.type === "about"
            ? { ...s, imageUrl: undefined }
            : s
        ),
    };
  if (mode === "sparse")
    return {
      ...data,
      sections: data.sections
        .filter(s => s.type === "hero" || s.type === "contact")
        .map(s =>
          s.type === "hero"
            ? { ...s, subheadline: undefined, imageUrl: undefined }
            : s
        ),
    };
  return data;
}
export default function SystemDesignReview() {
  const q = new URLSearchParams(location.search);
  const initial = q.get("pack") as PackId;
  const [pack, setPack] = useState<PackId>(
    PACK_IDS.includes(initial) ? initial : "gusto"
  );
  const [variant, setVariant] = useState(Number(q.get("variant") ?? -1));
  const [replay, setReplay] = useState(0);
  const [mode, setMode] = useState(q.get("case") ?? "full");
  const salon = q.has("salon")
    ? Math.max(0, Math.min(11, Number(q.get("salon")) || 0))
    : undefined;
  let data =
    salon === undefined
      ? withArtDirection(scenario(getFixture(pack, "full"), mode))
      : salonVariations()[salon];
  if (salon === undefined && variant >= 0)
    data = {
      ...data,
      ...pickArtTheme(pack, `${data.businessName}|Kunde ${variant + 1}`),
    };
  useEffect(() => {
    const links = packFontHrefs(data.stylePackId, data.fontPairId).map(href => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach(l => l.remove());
  }, [data.stylePackId, data.fontPairId]);
  return (
    <div className="design-lab">
      {q.get("frame") !== "1" && (
        <div className="lab-toolbar">
          <strong>
            Pageblitz <span>Systemprüfung · 20 Packs</span>
          </strong>
          <label>
            Design{" "}
            <select
              aria-label="Design"
              value={pack}
              onChange={e => setPack(e.target.value as PackId)}
            >
              {PACK_IDS.map(id => (
                <option key={id}>{id}</option>
              ))}
            </select>
          </label>
          <label>
            Inhalt{" "}
            <select
              aria-label="Testfall"
              value={mode}
              onChange={e => setMode(e.target.value)}
            >
              <option value="full">Vollständig</option>
              <option value="albums">Galerie mit Alben</option>
              <option value="long">Lange Namen und Texte</option>
              <option value="no-images">Ohne Bilder</option>
              <option value="sparse">Wenig Inhalt</option>
            </select>
          </label>
          <label>
            Farbe &amp; Typo{" "}
            <select
              aria-label="Kundenvariante"
              value={variant}
              onChange={e => setVariant(Number(e.target.value))}
            >
              <option value={-1}>Referenzpalette</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  Kunde {i + 1}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => setReplay(n => n + 1)}>
            Animation erneut
          </button>
          <a href="/design-system?salons=1">12 Salon-Varianten</a>
          <a href="/design-lab">Referenzentwürfe</a>
        </div>
      )}
      {q.has("salons") ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))",
            gap: 20,
            padding: 20,
          }}
        >
          {salonVariations().map((doc, i) => (
            <div key={i}>
              <p style={{ padding: 10, fontSize: 13 }}>
                {i + 1}. {doc.stylePackId} · {doc.designProfile?.composition}{" "}
                <a href={`/design-system?salon=${i}`}>Öffnen ↗</a>
              </p>
              <iframe
                title={`Salon-Variante ${i + 1}`}
                src={`/design-system?frame=1&salon=${i}`}
                style={{ width: "100%", height: 700, border: 0 }}
              />
            </div>
          ))}
        </div>
      ) : (
        <SiteRenderer
          key={`${pack}:${variant}:${mode}:${replay}`}
          data={data}
          islandsMode="preview"
          site={{ showBranding: false }}
        />
      )}
    </div>
  );
}
