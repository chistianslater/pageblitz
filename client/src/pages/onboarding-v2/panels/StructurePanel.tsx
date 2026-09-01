import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { SectionType, WebsiteDataV2 } from "@shared/siteContract/types";
import {
  HIDEABLE_SECTION_TYPES,
  SECTION_LABELS,
} from "@shared/onboardingV2/aiEdit";
import { SECTION_ANCHORS } from "@/components/site/engine";
import { PanelFrame } from "./PanelFrame";

/**
 * Struktur-Editor (Backlog 21b, 2026-09-01, Betreiber: „links Anfasser …
 * das war eigentlich optimal"): Sektionen der Startseite per Drag & Drop
 * oder Pfeilen umsortieren und per Auge ausblenden. Nutzt exakt dieselbe
 * Server-Mechanik wie der KI-Chat (hiddenSections/sectionOrder als
 * Ersatzlisten, onboardingV2.updateStructure) — jede Änderung wird sofort
 * gespeichert, die Vorschau lädt neu.
 *
 * Regeln: hero bleibt fix oben (nicht verschieb-/ausblendbar), contact
 * bleibt sichtbar (nicht in HIDEABLE_SECTION_TYPES), notice ist ein
 * Banner über der Navigation und taucht hier nicht auf.
 */
const FIXED_TOP: readonly SectionType[] = ["hero"];
const EXCLUDED: readonly SectionType[] = ["notice"];

interface Row {
  type: SectionType;
  hidden: boolean;
}

function rowsFromDoc(doc: WebsiteDataV2): Row[] {
  const present = doc.sections.map(s => s.type);
  // Set<string>: sectionOrder erlaubt schema-seitig auch "pageHeader" —
  // der Filter wirft es hier ohnehin raus (gleiches Muster wie routerAi).
  const presentSet = new Set<string>(present);
  const order = (doc.sectionOrder ?? []).filter((t): t is Row["type"] =>
    presentSet.has(t)
  );
  const rest = present.filter(t => !order.includes(t));
  const sorted = [...order, ...rest];
  const hidden = new Set(doc.hiddenSections ?? []);
  return sorted
    .filter(t => !EXCLUDED.includes(t))
    .map(t => ({ type: t, hidden: hidden.has(t) }));
}

const hideable = new Set<string>(HIDEABLE_SECTION_TYPES);

export function StructurePanel({
  token,
  doc,
  onApplied,
  onClose,
  onPreviewFocus,
}: {
  token: string;
  doc: WebsiteDataV2;
  onApplied: () => void;
  onClose: () => void;
  onPreviewFocus?: (anchor: string) => void;
}) {
  const [rows, setRows] = useState<Row[]>(() => rowsFromDoc(doc));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // Server-Refetch nachziehen (z. B. nach KI-Chat-Änderung bei offenem Panel).
  useEffect(() => {
    setRows(rowsFromDoc(doc));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const update = trpc.onboardingV2.updateStructure.useMutation();

  const save = (next: Row[]) => {
    setRows(next);
    update.mutate(
      {
        token,
        // notice behält seine Position: ausgeklammerte Typen wieder
        // einreihen (vorn — der Banner rendert ohnehin über allem).
        sectionOrder: [
          ...doc.sections.map(s => s.type).filter(t => EXCLUDED.includes(t)),
          ...next.map(r => r.type),
        ],
        hiddenSections: next
          .filter(r => r.hidden)
          .map(r => r.type)
          .filter((t): t is (typeof HIDEABLE_SECTION_TYPES)[number] =>
            hideable.has(t)
          ),
      },
      { onSuccess: onApplied }
    );
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    // hero bleibt oben: Position 0 ist tabu, solange hero existiert.
    const heroAt = rows.findIndex(r => FIXED_TOP.includes(r.type));
    if (heroAt === 0 && (from === 0 || to === 0)) return;
    const next = [...rows];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    save(next);
  };

  const toggleHidden = (index: number) => {
    const next = rows.map((r, i) =>
      i === index ? { ...r, hidden: !r.hidden } : r
    );
    save(next);
  };

  const isFixed = (row: Row) => FIXED_TOP.includes(row.type);
  const busy = update.isPending;

  return (
    <PanelFrame
      step="Werkzeug"
      title="Struktur"
      panelId="structure"
      onClose={onClose}
      intro="Ziehe Sektionen am Anfasser in eine neue Reihenfolge oder blende sie mit dem Auge aus — jede Änderung wird sofort übernommen."
      footer={
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          onClick={onClose}
        >
          Schließen
        </button>
      }
    >
      <ul className="pb-structure-list" aria-label="Sektionen der Startseite">
        {rows.map((row, index) => (
          <li
            key={row.type}
            className="pb-structure-row"
            data-hidden={row.hidden || undefined}
            data-dragging={dragIndex === index || undefined}
            draggable={!isFixed(row)}
            onDragStart={e => {
              if (isFixed(row)) return;
              setDragIndex(index);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={e => {
              if (dragIndex === null || dragIndex === index) return;
              e.preventDefault();
            }}
            onDrop={e => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== index) {
                move(dragIndex, index);
              }
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <span
              className="pb-structure-grip"
              aria-hidden="true"
              data-disabled={isFixed(row) || undefined}
            >
              <GripVertical />
            </span>
            <button
              type="button"
              className="pb-structure-label"
              title="In der Vorschau anzeigen"
              onClick={() => onPreviewFocus?.(SECTION_ANCHORS[row.type])}
            >
              {SECTION_LABELS[row.type]}
              {isFixed(row) && (
                <span className="pb-structure-note">bleibt oben</span>
              )}
            </button>
            <span className="pb-structure-actions">
              <button
                type="button"
                aria-label={`${SECTION_LABELS[row.type]} nach oben`}
                disabled={busy || isFixed(row) || index <= 1}
                onClick={() => move(index, index - 1)}
              >
                <ChevronUp />
              </button>
              <button
                type="button"
                aria-label={`${SECTION_LABELS[row.type]} nach unten`}
                disabled={busy || isFixed(row) || index === rows.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ChevronDown />
              </button>
              {hideable.has(row.type) ? (
                <button
                  type="button"
                  aria-pressed={row.hidden}
                  aria-label={
                    row.hidden
                      ? `${SECTION_LABELS[row.type]} einblenden`
                      : `${SECTION_LABELS[row.type]} ausblenden`
                  }
                  disabled={busy}
                  onClick={() => toggleHidden(index)}
                >
                  {row.hidden ? <EyeOff /> : <Eye />}
                </button>
              ) : (
                <span className="pb-structure-spacer" aria-hidden="true" />
              )}
            </span>
          </li>
        ))}
      </ul>
      {update.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {update.error.message}
        </p>
      )}
    </PanelFrame>
  );
}
