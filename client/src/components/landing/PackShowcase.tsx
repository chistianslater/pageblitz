import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getConstitution } from "@shared/stylePacks";
import { PACK_IDS, type PackId } from "@shared/siteContract/types";

interface PackShowcaseProps {
  isDark: boolean;
}

/** Feste Anzeigereihenfolge — deckungsgleich mit `PACK_IDS` (siehe `shared/siteContract/schema.ts`). */
const PACK_ORDER: readonly PackId[] = PACK_IDS;

/** Akzentfarbe der Verfassung — trägt die tatsächliche Pack-Identität in die Karte (Punkt + Hover-Rahmen), statt einer generischen Deko-Farbe. */
function getAccentColor(packId: PackId): string {
  const accent = getConstitution(packId).palette.find(
    c => c.role === "accent"
  );
  return accent?.hex ?? "#a3e635";
}

interface PackCardProps {
  packId: PackId;
  index: number;
  isDark: boolean;
  animate: boolean;
}

function PackCard({ packId, index, isDark, animate }: PackCardProps) {
  const constitution = getConstitution(packId);
  const accent = getAccentColor(packId);
  const demoHref = `/demo/${packId}`;

  return (
    <motion.article
      aria-label={`${constitution.name}: ${constitution.essence}`}
      initial={animate ? { opacity: 0, y: 24 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 4) * 0.06, duration: 0.5 }}
      className={`group relative rounded-2xl border overflow-hidden transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-white/[0.03] hover:border-white/25"
          : "border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}
    >
      <div
        className="relative aspect-[16/10] overflow-hidden bg-white border-b"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}
      >
        <iframe
          src={demoHref}
          title={`Vorschau: ${constitution.name}`}
          tabIndex={-1}
          loading="lazy"
          className="absolute inset-0 pointer-events-none"
          style={{
            width: "400%",
            height: "400%",
            transform: "scale(0.25)",
            transformOrigin: "0 0",
            border: 0,
          }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${accent}` }}
          aria-hidden="true"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <span
            className={`text-xs font-mono tabular-nums ${isDark ? "text-white/30" : "text-gray-400"}`}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="w-3 h-3 rounded-full shrink-0 mt-1"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
        </div>
        <h4
          className={`font-semibold text-lg mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {constitution.name}
        </h4>
        <p
          className={`text-sm leading-relaxed mb-4 min-h-[2.5rem] ${isDark ? "text-white/50" : "text-gray-500"}`}
        >
          {constitution.essence}
        </p>
        <a
          href={demoHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
            isDark
              ? "text-lime-300 hover:text-lime-200"
              : "text-lime-700 hover:text-lime-600"
          }`}
        >
          Ansehen
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.article>
  );
}

/**
 * Zeigt alle 14 Style Packs als Grid — je Karte ein lazy iframe auf die
 * öffentliche Demo-Route `/demo/<pack>` (siehe `server/ssr/routes.ts`),
 * skaliert wie die Studio-Stil-Kandidaten-Thumbs (`StylePanel.tsx`/
 * `studio.css`: iframe 400%/400% + `scale(0.25)` in einem
 * Seitenverhältnis-Container statt einer clientseitigen Breitenmessung).
 * Ersetzt den alten v1-Showcase (`WebsiteShowcase`/`LivePreviewCard`), der
 * feste Demo-Daten aus `components/layouts/PremiumLayoutsV2` gerendert hat.
 */
export function PackShowcase({ isDark }: PackShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const animate = !prefersReducedMotion;

  return (
    <section id="showcase" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.h2
          initial={animate ? { opacity: 0, y: 20 } : undefined}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          className={`text-sm font-medium uppercase tracking-widest mb-3 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-400"}`}
        >
          14 Stilwelten
        </motion.h2>
        <motion.h3
          initial={animate ? { opacity: 0, y: 20 } : undefined}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Ein Look für jedes Handwerk.
        </motion.h3>
        <p
          className={`mt-4 max-w-xl text-base transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-500"}`}
        >
          Jedes Paket bringt eine eigene, fertig abgestimmte Optik mit —
          Typografie, Farben und Layout passend zur Branche. Du wählst den
          Stil, der zu dir passt, deine Inhalte bleiben gleich.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PACK_ORDER.map((packId, index) => (
          <PackCard
            key={packId}
            packId={packId}
            index={index}
            isDark={isDark}
            animate={animate}
          />
        ))}
      </div>
    </section>
  );
}
