/**
 * Vorschau-Leiste für den Postkarten-Funnel (2026-09-05).
 *
 * Der QR-Code auf der Postkarte führt bewusst NICHT ins Studio, sondern auf
 * die fertige Seite selbst: Die Karte verspricht „deine Website ist fertig",
 * ein Editor mit Panels würde genau dieses Versprechen brechen. Diese
 * schmale Leiste liegt über der Seite und ist der einzige Weg weiter.
 *
 * Sie erscheint nur im obersten Fenster. Das Studio, das Design-Gate und die
 * Stil-Miniaturen betten dieselbe Route als iframe ein — dort bleibt sie
 * verborgen, ohne dass der Client etwas mitschicken muss.
 */
export interface PreviewCta {
  businessName: string;
  /** Ziel im Studio, üblicherweise /onboarding/<token>. */
  studioHref: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function previewCtaTag(cta: PreviewCta | null | undefined): string {
  if (!cta) return "";
  const name = esc(cta.businessName);
  const href = esc(cta.studioHref);
  return `<div id="pb-preview-cta" hidden role="complementary" aria-label="Hinweis von Pageblitz">
<style>
#pb-preview-cta{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;
display:flex;align-items:center;justify-content:space-between;gap:16px;
padding:12px 16px calc(12px + env(safe-area-inset-bottom));
background:#0b0b0d;color:#f5f2ea;box-shadow:0 -10px 30px rgba(0,0,0,.28);
font:500 15px/1.35 "Space Grotesk",system-ui,-apple-system,sans-serif}
/* Muss VOR den anderen Regeln greifen: die ID-Regel display:flex hat
   hoehere Spezifitaet als die Browser-Regel [hidden]{display:none} —
   ohne diese Zeile blieb die Leiste im Studio-iframe sichtbar. */
#pb-preview-cta[hidden]{display:none}
#pb-preview-cta p{margin:0;min-width:0}
#pb-preview-cta b{display:block;font-weight:700}
#pb-preview-cta small{display:block;color:#a9a79f;font-size:13px;font-weight:400}
#pb-preview-cta a{flex:none;background:#ccff00;color:#0b0b0d;text-decoration:none;
font-weight:700;padding:11px 18px;border-radius:999px;white-space:nowrap}
@media(max-width:520px){#pb-preview-cta{font-size:14px}
#pb-preview-cta a{padding:10px 14px;font-size:14px}}
</style>
<p><b>Ein Vorschlag für ${name}</b><small>Von Pageblitz gebaut — noch nicht veröffentlicht.</small></p>
<a href="${href}">Website übernehmen</a>
</div>
<script>if (window.top === window.self){var b=document.getElementById("pb-preview-cta");if(b)b.hidden=false;}</script>`;
}
