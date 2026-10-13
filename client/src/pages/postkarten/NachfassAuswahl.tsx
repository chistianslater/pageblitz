/**
 * Nachfass für Welle 2, Batch D (2026-10-13): Salons der ersten Welle, die
 * nie gescannt haben, bekommen eine zweite Karte.
 *
 * Die Liste zeigt ALLE Karten der ersten Welle mit dem Grund, warum sie
 * (nicht) in Frage kommen. Vorausgewählt ist der Vorschlag des Servers —
 * fünf, reihum über die Städte, nach Kurzcode. „Anlegen" erzeugt nur neue
 * Kartenzeilen mit neuem Code; verschickt wird nichts.
 */
import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function NachfassAuswahl({
  angelegt,
}: {
  angelegt: () => Promise<void>;
}) {
  const { data } = trpc.postkarten.nachfassListe.useQuery();
  const anlegen = trpc.postkarten.nachfassAnlegen.useMutation();
  const utils = trpc.useUtils();
  const [gewaehlt, setGewaehlt] = useState<number[]>([]);

  useEffect(() => {
    if (data) setGewaehlt(data.vorschlag);
  }, [data]);

  const zeilen = data?.zeilen ?? [];
  const berechtigt = zeilen.filter(z => z.sperre === null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <RotateCcw className="h-4 w-4" />
          Nachfass (Welle 2 · Batch D)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {berechtigt.length} von {zeilen.length} Karten der ersten Welle kommen
          in Frage (versendet, nie gescannt, keine Testkarte, Seite nicht
          gekauft). Vorgeschlagen: fünf, reihum über die Städte. Die alte Karte
          bleibt unverändert; die neue bekommt einen eigenen Code.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="w-8 pb-2" />
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium">Betrieb</th>
                <th className="pb-2 font-medium">Stadt</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map(z => (
                <tr key={z.karteId} className="border-t">
                  <td className="py-1.5">
                    <Checkbox
                      checked={gewaehlt.includes(z.karteId)}
                      disabled={z.sperre !== null || anlegen.isPending}
                      onCheckedChange={() =>
                        setGewaehlt(alt =>
                          alt.includes(z.karteId)
                            ? alt.filter(id => id !== z.karteId)
                            : [...alt, z.karteId]
                        )
                      }
                    />
                  </td>
                  <td className="py-1.5 font-mono">{z.code}</td>
                  <td className="py-1.5">{z.betrieb}</td>
                  <td className="py-1.5">{z.city ?? "—"}</td>
                  <td className="py-1.5">
                    {z.sperre ? (
                      <span className="text-muted-foreground">{z.sperre}</span>
                    ) : z.vorgeschlagen ? (
                      <Badge>Vorschlag</Badge>
                    ) : (
                      <span>möglich</span>
                    )}
                  </td>
                </tr>
              ))}
              {zeilen.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-muted-foreground">
                    Keine Karten der ersten Welle gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Button
          size="sm"
          disabled={gewaehlt.length === 0 || anlegen.isPending}
          onClick={async () => {
            try {
              const { angelegt: neu } = await anlegen.mutateAsync({
                karteIds: gewaehlt,
              });
              toast.success(
                `${neu.length} Nachfass-Karten angelegt: ${neu.map(n => `${n.betrieb} (${n.code})`).join(", ")}`
              );
              await utils.postkarten.nachfassListe.invalidate();
              await angelegt();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          Nachfass-Karten anlegen ({gewaehlt.length})
        </Button>
      </CardContent>
    </Card>
  );
}
