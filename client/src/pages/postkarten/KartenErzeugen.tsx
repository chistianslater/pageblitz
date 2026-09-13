/**
 * Karten erzeugen und beauftragen (Betreiber-Wunsch 2026-09-13).
 *
 * Bisher lief das ueber zwei Skripte und eine CSV auf dem Server. Der Teil,
 * der dabei immer im Kopf des Betreibers lag: Nach einer Neugenerierung der
 * Kampagnenseiten sind die Motive von gestern — die Karte wuerbe mit einem
 * Stand, den es nicht mehr gibt. Deshalb steht hier je Zeile, woran es
 * liegt, und „Motiv veraltet" ist ein eigener Zustand, kein Gefuehl.
 *
 * Die Laeufe gehen bewusst einzeln und nacheinander durch (eine Aufnahme
 * dauert ein paar Sekunden): So bleibt jede Anfrage kurz, ein Fehler trifft
 * genau einen Betrieb, und der Fortschritt ist zu sehen, statt dass ein
 * Sammelaufruf minutenlang schweigt.
 */
import React, { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, FileText, Image, Send } from "lucide-react";
import { toast } from "sonner";

type Zustand =
  | "versendet"
  | "bereit"
  | "motiv-veraltet"
  | "ohne-motiv"
  | "ohne-anschrift"
  | "ohne-vorschau";

const ZUSTAND_TEXT: Record<
  Zustand,
  {
    text: string;
    variante: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  bereit: { text: "bereit", variante: "default" },
  "motiv-veraltet": { text: "Motiv veraltet", variante: "destructive" },
  "ohne-motiv": { text: "ohne Motiv", variante: "secondary" },
  "ohne-anschrift": { text: "Anschrift fehlt", variante: "outline" },
  "ohne-vorschau": { text: "kein Vorschau-Link", variante: "outline" },
  versendet: { text: "versendet", variante: "outline" },
};

const datum = (d: Date | string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "—";

interface Lauf {
  titel: string;
  fertig: number;
  gesamt: number;
  fehler: string[];
}

export default function KartenErzeugen() {
  const [filter, setFilter] = useState({ branche: "", stadt: "", suche: "" });
  const [entwurf, setEntwurf] = useState(filter);
  const [ausgewaehlt, setAusgewaehlt] = useState<number[]>([]);
  const [variante, setVariante] = useState("ungefragt");
  const [lauf, setLauf] = useState<Lauf | null>(null);
  const [versandDialog, setVersandDialog] = useState(false);
  const [bestaetigung, setBestaetigung] = useState("");

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.postkarten.kandidaten.useQuery(filter);
  const { data: varianten } = trpc.postkarten.varianten.useQuery();
  const motiv = trpc.postkarten.motiv.useMutation();
  const vorschau = trpc.postkarten.vorschau.useMutation();
  const beauftragen = trpc.postkarten.beauftragen.useMutation();

  const zeilen = useMemo(() => data?.zeilen ?? [], [data]);
  const offen = useMemo(
    () => zeilen.filter(z => z.zustand !== "versendet"),
    [zeilen]
  );
  const auswahl = useMemo(
    () => zeilen.filter(z => ausgewaehlt.includes(z.businessId)),
    [zeilen, ausgewaehlt]
  );
  const laeuft = lauf !== null;

  function umschalten(businessId: number) {
    setAusgewaehlt(alt =>
      alt.includes(businessId)
        ? alt.filter(id => id !== businessId)
        : [...alt, businessId]
    );
  }

  /**
   * Ein Lauf ueber die Auswahl, ein Betrieb nach dem anderen. Fehler
   * beenden den Lauf nicht — sonst bliebe nach dem ersten kaputten Betrieb
   * der Rest liegen, und das ist genau der Teil, der funktioniert.
   */
  async function laufen(
    titel: string,
    ids: number[],
    schritt: (businessId: number) => Promise<void>
  ) {
    if (ids.length === 0) {
      toast.error("Nichts ausgewählt.");
      return;
    }
    const fehler: string[] = [];
    setLauf({ titel, fertig: 0, gesamt: ids.length, fehler });
    for (const [i, id] of ids.entries()) {
      const name = zeilen.find(z => z.businessId === id)?.name ?? `#${id}`;
      try {
        await schritt(id);
      } catch (err) {
        fehler.push(
          `${name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      setLauf({
        titel,
        fertig: i + 1,
        gesamt: ids.length,
        fehler: [...fehler],
      });
    }
    await utils.postkarten.kandidaten.invalidate();
    await utils.postkarten.uebersicht.invalidate();
    setLauf(null);
    if (fehler.length === 0) {
      toast.success(`${titel}: ${ids.length} erledigt.`);
    } else {
      toast.error(
        `${titel}: ${ids.length - fehler.length} von ${ids.length} erledigt. ${fehler[0]}`
      );
      // Die ganze Liste gehoert in die Konsole, nicht in einen Toast, der
      // nach vier Sekunden weg ist.
      console.warn(`[Postkarten] ${titel} — Fehler:\n${fehler.join("\n")}`);
    }
  }

  const zaehler = data?.zaehler;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Auswahl</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={e => {
              e.preventDefault();
              setFilter(entwurf);
              setAusgewaehlt([]);
            }}
          >
            <Input
              className="w-40"
              placeholder="Branche"
              value={entwurf.branche}
              onChange={e =>
                setEntwurf({ ...entwurf, branche: e.target.value })
              }
            />
            <Input
              className="w-40"
              placeholder="Stadt"
              value={entwurf.stadt}
              onChange={e => setEntwurf({ ...entwurf, stadt: e.target.value })}
            />
            <Input
              className="w-56"
              placeholder="Name oder Straße"
              value={entwurf.suche}
              onChange={e => setEntwurf({ ...entwurf, suche: e.target.value })}
            />
            <Button type="submit" variant="secondary">
              Filtern
            </Button>
          </form>

          {zaehler && (
            <p className="text-sm text-muted-foreground">
              {zaehler.gesamt} Vorschau-Seiten · {zaehler.bereit} bereit ·{" "}
              {zaehler.ohneMotiv} ohne Motiv · {zaehler.veraltet} mit veraltetem
              Motiv · {zaehler.versendet} versendet · {zaehler.blockiert}{" "}
              blockiert
            </p>
          )}
          {data?.abgeschnitten && (
            <p className="text-sm text-muted-foreground">
              Die Liste endet hier — es gibt mehr Betriebe, als angezeigt
              werden. Mit Branche oder Stadt eingrenzen.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={laeuft}
              onClick={() => setAusgewaehlt(offen.map(z => z.businessId))}
            >
              Alle offenen wählen ({offen.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={laeuft}
              onClick={() =>
                setAusgewaehlt(
                  zeilen
                    .filter(
                      z =>
                        z.zustand === "ohne-motiv" ||
                        z.zustand === "motiv-veraltet"
                    )
                    .map(z => z.businessId)
                )
              }
            >
              Nur ohne/veraltetes Motiv wählen
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={laeuft || ausgewaehlt.length === 0}
              onClick={() => setAusgewaehlt([])}
            >
              Auswahl leeren
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="text-sm text-muted-foreground">
              {ausgewaehlt.length} ausgewählt
            </span>
            <Button
              size="sm"
              disabled={laeuft || ausgewaehlt.length === 0}
              onClick={() =>
                laufen("Motive aufnehmen", ausgewaehlt, async businessId => {
                  await motiv.mutateAsync({ businessId });
                })
              }
            >
              <Camera className="h-4 w-4" />
              Motive aufnehmen
            </Button>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={variante}
              disabled={laeuft}
              onChange={e => setVariante(e.target.value)}
            >
              {(varianten ?? [{ id: "ungefragt", headline: "ungefragt" }]).map(
                v => (
                  <option key={v.id} value={v.id}>
                    {v.id} — {v.headline}
                  </option>
                )
              )}
            </select>
            <Button
              size="sm"
              variant="secondary"
              disabled={laeuft || ausgewaehlt.length === 0}
              onClick={() =>
                laufen("HeyMail-Vorschau", ausgewaehlt, async businessId => {
                  await vorschau.mutateAsync({
                    businessId,
                    variante: variante as "ungefragt",
                  });
                })
              }
            >
              <FileText className="h-4 w-4" />
              Vorschau erzeugen
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={
                laeuft || auswahl.filter(z => z.beauftragbar).length === 0
              }
              onClick={() => {
                setBestaetigung("");
                setVersandDialog(true);
              }}
            >
              <Send className="h-4 w-4" />
              Beauftragen ({auswahl.filter(z => z.beauftragbar).length})
            </Button>
          </div>

          {lauf && (
            <p className="text-sm">
              {lauf.titel}: {lauf.fertig} / {lauf.gesamt}
              {lauf.fehler.length > 0 && ` · ${lauf.fehler.length} Fehler`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Betriebe mit Vorschau-Seite
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="w-8 pb-2" />
                    <th className="pb-2 font-medium">Betrieb</th>
                    <th className="pb-2 font-medium">Stadt</th>
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium">Zustand</th>
                    <th className="pb-2 font-medium">Motiv</th>
                    <th className="pb-2 font-medium">Seite geändert</th>
                    <th className="pb-2 font-medium">Karte</th>
                  </tr>
                </thead>
                <tbody>
                  {zeilen.map(z => (
                    <tr key={z.businessId} className="border-t align-top">
                      <td className="py-2">
                        <Checkbox
                          checked={ausgewaehlt.includes(z.businessId)}
                          disabled={laeuft || z.zustand === "versendet"}
                          onCheckedChange={() => umschalten(z.businessId)}
                        />
                      </td>
                      <td className="py-2">
                        <div className="font-medium">{z.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {z.hinweis}
                        </div>
                      </td>
                      <td className="py-2">{z.stadt ?? "—"}</td>
                      <td className="py-2 font-mono">{z.code ?? "—"}</td>
                      <td className="py-2">
                        <Badge
                          variant={ZUSTAND_TEXT[z.zustand as Zustand].variante}
                        >
                          {ZUSTAND_TEXT[z.zustand as Zustand].text}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {z.bildUrl ? (
                          <a
                            className="inline-flex items-center gap-1 underline"
                            href={z.bildUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Image className="h-3 w-3" />
                            {datum(z.bildAt)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2">{datum(z.websiteUpdatedAt)}</td>
                      <td className="py-2">
                        {z.pdfUrl ? (
                          <a
                            className="underline"
                            href={z.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            PDF
                          </a>
                        ) : (
                          "—"
                        )}
                        {z.sentAt ? ` · raus ${datum(z.sentAt)}` : ""}
                      </td>
                    </tr>
                  ))}
                  {zeilen.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-3 text-muted-foreground">
                        Keine Vorschau-Seiten zu diesem Filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={versandDialog} onOpenChange={setVersandDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Karten drucken und verschicken</DialogTitle>
            <DialogDescription>
              {auswahl.filter(z => z.beauftragbar).length} Karten gehen als
              Druckauftrag zu HeyMail. Das kostet Porto und Druck und lässt sich
              nicht zurückholen. Karten, deren Motiv veraltet ist oder deren
              Anschrift fehlt, sind nicht dabei.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Zum Bestätigen <span className="font-mono">VERSENDEN</span>{" "}
              eintippen.
            </p>
            <Input
              value={bestaetigung}
              onChange={e => setBestaetigung(e.target.value)}
              placeholder="VERSENDEN"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVersandDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              disabled={bestaetigung !== "VERSENDEN"}
              onClick={async () => {
                setVersandDialog(false);
                await laufen(
                  "Karten beauftragt",
                  auswahl.filter(z => z.beauftragbar).map(z => z.businessId),
                  async businessId => {
                    await beauftragen.mutateAsync({
                      businessId,
                      variante: variante as "ungefragt",
                      bestaetigung: "VERSENDEN",
                    });
                  }
                );
                setAusgewaehlt([]);
              }}
            >
              Jetzt beauftragen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
