/**
 * Trichter je Versuchsarm (Welle 2, 2026-10-13): Welle 1 als
 * Vergleichszeile oben, darunter die Batches. Jede Zelle zeigt Anzahl und
 * Anteil an den beauftragten Karten des Arms — bei fünf Karten je Batch
 * ist eine Karte 20 %; die Prozente sind ein Hinweis, kein Beweis.
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export interface Arm {
  schluessel: string;
  welle: string;
  batch: string | null;
  layout: string;
  textVariant: string;
  versendet: number;
  trichter: { stufe: string; label: string; anzahl: number; quote: number }[];
}

export default function VersuchsarmTabelle({ arme }: { arme: Arm[] }) {
  const stufen = arme[0]?.trichter ?? [];
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="h-4 w-4" />
          Nach Welle und Batch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">Welle</th>
                <th className="pb-2 font-medium">Batch</th>
                <th className="pb-2 font-medium">Layout</th>
                <th className="pb-2 font-medium">Text</th>
                {stufen.map(s => (
                  <th key={s.stufe} className="pb-2 text-right font-medium">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {arme.map(a => (
                <tr key={a.schluessel} className="border-t">
                  <td className="py-2">
                    {a.welle}
                    {a.welle === "welle-1" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (Vergleich)
                      </span>
                    )}
                  </td>
                  <td className="py-2 font-medium">{a.batch ?? "—"}</td>
                  <td className="py-2">{a.layout}</td>
                  <td className="py-2">{a.textVariant}</td>
                  {a.trichter.map(s => (
                    <td key={s.stufe} className="py-2 text-right tabular-nums">
                      <strong>{s.anzahl}</strong>
                      {s.stufe !== "beauftragt" && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({s.quote} %)
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {arme.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-3 text-muted-foreground">
                    Noch keine Karten erfasst.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Prozent = Anteil an den beauftragten Karten des Arms. Eine erste
          Karte, die durch einen Nachfass abgelöst und selbst nie gescannt
          wurde, bekommt Fortschritte im Studio nicht gutgeschrieben — die
          zählen für den Nachfass.
        </p>
      </CardContent>
    </Card>
  );
}
