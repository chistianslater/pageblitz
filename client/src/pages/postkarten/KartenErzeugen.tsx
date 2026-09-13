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
import { Camera, FileText, Image, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Zustand =
  | "versendet"
  | "zurueckgestellt"
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
  zurueckgestellt: { text: "zurückgestellt", variante: "secondary" },
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

/**
 * Anschrift direkt in der Zeile nachtragen. Gespeichert wird nur, was der
 * Server zerlegen kann — die Fehlermeldung nennt die Form, statt „ungültig"
 * zu sagen.
 */
function AnschriftNachtragen({
  businessId,
  anschrift,
  gespeichert,
}: {
  businessId: number;
  anschrift: string;
  gespeichert: () => Promise<void>;
}) {
  const [wert, setWert] = useState(anschrift);
  const speichern = trpc.postkarten.anschrift.useMutation();

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Input
        className="h-8 w-72 text-xs"
        value={wert}
        placeholder="Osterstraße 25, 46397 Bocholt, Deutschland"
        onChange={e => setWert(e.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={speichern.isPending || wert.trim().length < 5}
        onClick={async () => {
          try {
            const { empfaenger } = await speichern.mutateAsync({
              businessId,
              anschrift: wert,
            });
            toast.success(
              `Gespeichert: ${empfaenger.street} ${empfaenger.houseNumber}, ${empfaenger.zip} ${empfaenger.city}`
            );
            await gespeichert();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      >
        Anschrift speichern
      </Button>
    </div>
  );
}

/**
 * Aktionen je Zeile: aus der Kampagne nehmen, zurückholen, Seite löschen.
 *
 * Zurückstellen ist der normale Weg — die Zeile bleibt mit Begründung
 * stehen, und beim nächsten Durchgang ist zu sehen, dass der Betrieb dran
 * war. Löschen ist für Seiten, die gar nicht hätten entstehen sollen: Danach
 * ist auch die Buchführung weg.
 */
function ZeilenAktionen({
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

export default function KartenErzeugen() {
  const [filter, setFilter] = useState({ branche: "", stadt: "", suche: "" });
  const [entwurf, setEntwurf] = useState(filter);
  const [ausgewaehlt, setAusgewaehlt] = useState<number[]>([]);
  const [variante, setVariante] = useState("ungefragt");
  const [lauf, setLauf] = useState<Lauf | null>(null);
  const [versandDialog, setVersandDialog] = useState(false);
  const [bestaetigung, setBestaetigung] = useState("");
  /**
   * Vorlage je Lauf. HeyMail antwortete am 13.09. auf die eingebaute ID mit
   * „Could not find template" — Vorlagen gehoeren zum Konto und wechseln.
   * Der Wert bleibt im Browser stehen, damit er nicht bei jedem Lauf neu
   * eingetippt werden muss.
   */
  const [templateId, setTemplateId] = useState(() => {
    try {
      return localStorage.getItem("pb-heymail-template") ?? "";
    } catch {
      return "";
    }
  });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.postkarten.kandidaten.useQuery(filter);
  const { data: varianten } = trpc.postkarten.varianten.useQuery();
  const { data: einstellungen } = trpc.postkarten.einstellungen.useQuery();
  const motiv = trpc.postkarten.motiv.useMutation();
  const vorschau = trpc.postkarten.vorschau.useMutation();
  const beauftragen = trpc.postkarten.beauftragen.useMutation();

  const zeilen = useMemo(() => data?.zeilen ?? [], [data]);
  // „Offen" heisst: macht noch Arbeit. Versendet und zurueckgestellt sind
  // beide erledigt — nur aus verschiedenen Gruenden.
  const offen = useMemo(
    () =>
      zeilen.filter(
        z => z.zustand !== "versendet" && z.zustand !== "zurueckgestellt"
      ),
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
            // Der Filter ist die Kampagne — deshalb steht hier ihr Stand in
            // einem Satz, statt dass er sich aus sechs Zahlen ergibt.
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                {zaehler.versendet} von {zaehler.gesamt} erledigt ·{" "}
                {zaehler.offen} offen
                {zaehler.zurueckgestellt > 0 &&
                  ` · ${zaehler.zurueckgestellt} zurückgestellt`}
              </p>
              <p className="text-muted-foreground">
                Davon offen: {zaehler.ohneMotiv} ohne Motiv · {zaehler.veraltet}{" "}
                mit veraltetem Motiv · {zaehler.bereit} bereit zum Beauftragen ·{" "}
                {zaehler.blockiert} ohne Anschrift oder Vorschau-Link
              </p>
            </div>
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
            <Input
              className="w-72"
              placeholder={
                einstellungen
                  ? `HeyMail-Vorlage (Standard: ${einstellungen.templateId.slice(0, 8)}…)`
                  : "HeyMail-Vorlage"
              }
              value={templateId}
              disabled={laeuft}
              onChange={e => {
                setTemplateId(e.target.value);
                // Im Browser merken: Die ID gehoert zum Konto, nicht zum
                // einzelnen Lauf — sie jedes Mal neu zu tippen waere Unsinn.
                try {
                  localStorage.setItem("pb-heymail-template", e.target.value);
                } catch {
                  // Privates Fenster o. Ä. — dann eben nur für diesen Lauf.
                }
              }}
            />
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
                    ...(templateId.trim()
                      ? { templateId: templateId.trim() }
                      : {}),
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
                    <th className="pb-2 font-medium">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {zeilen.map(z => (
                    <tr key={z.businessId} className="border-t align-top">
                      <td className="py-2">
                        <Checkbox
                          checked={ausgewaehlt.includes(z.businessId)}
                          disabled={
                            laeuft ||
                            z.zustand === "versendet" ||
                            z.zustand === "zurueckgestellt"
                          }
                          onCheckedChange={() => umschalten(z.businessId)}
                        />
                      </td>
                      <td className="py-2">
                        <div className="font-medium">{z.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {z.hinweis}
                        </div>
                        {z.zustand === "ohne-anschrift" && (
                          // Der einzige Zustand, den kein Knopf loest: Google
                          // hat keine oder eine unbrauchbare Adresse
                          // geliefert. Hier eintragen statt in der Datenbank.
                          <AnschriftNachtragen
                            businessId={z.businessId}
                            anschrift={z.anschrift ?? ""}
                            gespeichert={async () => {
                              await utils.postkarten.kandidaten.invalidate();
                            }}
                          />
                        )}
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
                      <td className="py-2">
                        <ZeilenAktionen
                          businessId={z.businessId}
                          name={z.name}
                          zustand={z.zustand as Zustand}
                          fertig={async () => {
                            await utils.postkarten.kandidaten.invalidate();
                            await utils.postkarten.uebersicht.invalidate();
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  {zeilen.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-3 text-muted-foreground">
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
                      ...(templateId.trim()
                        ? { templateId: templateId.trim() }
                        : {}),
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
