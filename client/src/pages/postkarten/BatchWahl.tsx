/**
 * Welle, Batch, Layout und Text für einen Lauf (Welle 2, 2026-10-13).
 *
 * Ein Batch ist eine Vorgabe: Wer „B" wählt, bekommt Layout und Text von B
 * eingesetzt. Beides bleibt änderbar — aber ein Widerspruch steht rot
 * daneben, und der Server lehnt ihn ab. Sonst misst ein Batch etwas
 * anderes, als sein Name sagt.
 */
import React from "react";
import {
  batchVorgabe,
  batchWiderspruch,
  LAYOUT_LABEL,
  POSTKARTEN_LAYOUTS,
  WELLE_2,
  WELLE_2_BATCHES,
  type PostkartenLayout,
} from "@shared/postkartenWelle";
import { Input } from "@/components/ui/input";

export interface Zuordnung {
  welle: string;
  /** "" = ohne Batch (freier Lauf wie in Welle 1). */
  batch: "" | "A" | "B" | "C" | "D";
  layout: PostkartenLayout;
  variante: string;
}

export const ZUORDNUNG_START: Zuordnung = {
  welle: WELLE_2,
  batch: "",
  layout: "standard",
  variante: "ungefragt",
};

/** Was an den Server geht — leere Felder fallen weg. */
export function zuordnungFuerServer(z: Zuordnung) {
  return {
    ...(z.welle.trim() ? { welle: z.welle.trim() } : {}),
    ...(z.batch ? { batch: z.batch } : {}),
    layout: z.layout,
  };
}

export function BatchWahl({
  wert,
  aendern,
  varianten,
  gesperrt,
  brancheVorschlagen,
}: {
  wert: Zuordnung;
  aendern: (z: Zuordnung) => void;
  varianten: { id: string; headline: string }[];
  gesperrt: boolean;
  /** Setzt den Branchenfilter auf die Branche des Batches. */
  brancheVorschlagen: (branche: string) => void;
}) {
  const widerspruch = batchWiderspruch({
    batch: wert.batch || null,
    layout: wert.layout,
    textVariant: wert.variante,
  });

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="text-sm font-medium">Welle und Batch</div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Welle"
          className="h-9 w-28"
          value={wert.welle}
          disabled={gesperrt}
          onChange={e => aendern({ ...wert, welle: e.target.value })}
        />
        <select
          aria-label="Batch"
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={wert.batch}
          disabled={gesperrt}
          onChange={e => {
            const vorgabe = batchVorgabe(e.target.value);
            if (!vorgabe) {
              aendern({ ...wert, batch: "" });
              return;
            }
            aendern({
              ...wert,
              batch: vorgabe.batch,
              layout: vorgabe.layout,
              variante: vorgabe.textVariant,
            });
            brancheVorschlagen(vorgabe.branche);
          }}
        >
          <option value="">ohne Batch</option>
          {WELLE_2_BATCHES.map(b => (
            <option key={b.batch} value={b.batch}>
              {b.batch} — {b.titel} ({b.variable})
            </option>
          ))}
        </select>
        <select
          aria-label="Layout"
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={wert.layout}
          disabled={gesperrt}
          onChange={e =>
            aendern({ ...wert, layout: e.target.value as PostkartenLayout })
          }
        >
          {POSTKARTEN_LAYOUTS.map(l => (
            <option key={l} value={l}>
              {LAYOUT_LABEL[l]}
            </option>
          ))}
        </select>
        <select
          aria-label="Textvariante"
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={wert.variante}
          disabled={gesperrt}
          onChange={e => aendern({ ...wert, variante: e.target.value })}
        >
          {varianten.map(v => (
            <option key={v.id} value={v.id}>
              {v.id} — {v.headline}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        Gilt für Motiv, Vorschau und Auftrag der ausgewählten Zeilen und wird
        an der Karte gespeichert.
        {wert.batch === "D" &&
          " Batch D: Karten zuerst unten unter „Nachfass“ anlegen, dann hier wie gewohnt Motiv, Vorschau, Auftrag."}
      </p>
      {widerspruch && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {widerspruch}
        </p>
      )}
    </div>
  );
}
