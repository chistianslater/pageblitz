import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export type Zustand =
  | "versendet"
  | "zurueckgestellt"
  | "bereit"
  | "motiv-veraltet"
  | "ohne-motiv"
  | "ohne-anschrift"
  | "ohne-vorschau";

/**
 * Aktionen je Zeile: aus der Kampagne nehmen, zurückholen, Seite löschen.
 *
 * Zurückstellen ist der normale Weg — die Zeile bleibt mit Begründung
 * stehen, und beim nächsten Durchgang ist zu sehen, dass der Betrieb dran
 * war. Löschen ist für Seiten, die gar nicht hätten entstehen sollen: Danach
 * ist auch die Buchführung weg.
 */
export default function ZeilenAktionen({
  businessId,
  name,
  zustand,
  fertig,
}: {
  businessId: number;
  name: string;
  zustand: Zustand;
  fertig: () => Promise<void>;
}) {
  const [loeschenOffen, setLoeschenOffen] = useState(false);
  const zurueckstellen = trpc.postkarten.zurueckstellen.useMutation();
  const wiederAufnehmen = trpc.postkarten.wiederAufnehmen.useMutation();
  const seiteLoeschen = trpc.postkarten.seiteLoeschen.useMutation();

  if (zustand === "versendet") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  async function ruf(
    arbeit: () => Promise<unknown>,
    erfolg: string
  ): Promise<void> {
    try {
      await arbeit();
      toast.success(erfolg);
      await fertig();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {zustand === "zurueckgestellt" ? (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          disabled={wiederAufnehmen.isPending}
          onClick={() =>
            ruf(
              () => wiederAufnehmen.mutateAsync({ businessId }),
              `${name} ist wieder in der Kampagne.`
            )
          }
        >
          Wieder aufnehmen
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          disabled={zurueckstellen.isPending}
          onClick={() =>
            ruf(
              () => zurueckstellen.mutateAsync({ businessId }),
              `${name} zurückgestellt — bleibt in der Liste.`
            )
          }
        >
          Zurückstellen
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs text-destructive"
        onClick={() => setLoeschenOffen(true)}
      >
        <Trash2 className="h-3 w-3" />
        Seite löschen
      </Button>

      <Dialog open={loeschenOffen} onOpenChange={setLoeschenOffen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vorschau-Seite von {name} löschen</DialogTitle>
            <DialogDescription>
              Die Seite und alles, was daran hängt, sind danach weg — auch der
              Eintrag in dieser Liste. Für „fällt aus der Kampagne" ist
              <strong> Zurückstellen </strong>
              das bessere Werkzeug: Der Betrieb bleibt mit Begründung stehen,
              und du siehst beim nächsten Durchgang, dass er schon dran war.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoeschenOffen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              disabled={seiteLoeschen.isPending}
              onClick={async () => {
                setLoeschenOffen(false);
                await ruf(
                  () =>
                    seiteLoeschen.mutateAsync({
                      businessId,
                      bestaetigung: "LOESCHEN",
                    }),
                  `Seite von ${name} gelöscht.`
                );
              }}
            >
              Endgültig löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

