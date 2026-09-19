import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Filter,
  MapPin,
  PhoneCall,
  Printer,
  QrCode,
  Send,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KartenErzeugen from "./postkarten/KartenErzeugen";

const datum = (d: Date | string | null) =>
  d
    ? new Date(d).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "—";

function Gruppentabelle({
  titel,
  icon,
  zeilen,
}: {
  titel: string;
  icon: React.ReactNode;
  zeilen: {
    name: string;
    versendet: number;
    gescannt: number;
    scans: number;
    quote: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {titel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-left">
              <th className="font-medium pb-2">Name</th>
              <th className="font-medium pb-2 text-right">Versendet</th>
              <th className="font-medium pb-2 text-right">Gescannt</th>
              <th className="font-medium pb-2 text-right">Quote</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map(z => (
              <tr key={z.name} className="border-t">
                <td className="py-2">{z.name}</td>
                <td className="py-2 text-right tabular-nums">{z.versendet}</td>
                <td className="py-2 text-right tabular-nums">{z.gescannt}</td>
                <td className="py-2 text-right tabular-nums font-medium">
                  {z.quote} %
                </td>
              </tr>
            ))}
            {zeilen.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-muted-foreground">
                  Noch keine Karten erfasst.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

type Druckstatus = "geplant" | "verschickt" | "storniert";
type Stufe = "beauftragt" | "gescannt" | "design" | "email" | "gekauft";

const DRUCK_LABEL: Record<Druckstatus, string> = {
  geplant: "geplant",
  verschickt: "verschickt",
  storniert: "storniert",
};

/**
 * Höchste erreichte Stufe je Karte — spiegelt `trichterStufe` auf dem Server
 * (server/postkarten/auswertung.ts), damit die Zeile ohne zweiten Abruf
 * weiß, was als Nächstes zu tun ist.
 */
function stufeVon(k: {
  status: string;
  druckstatus: Druckstatus | null;
  websiteStatus: string | null;
  hatEmail: boolean;
  designBestaetigt: boolean;
  scans: number;
}): Stufe | null {
  if (k.status !== "versendet" || k.druckstatus === "storniert") return null;
  if (k.websiteStatus === "sold" || k.websiteStatus === "active")
    return "gekauft";
  if (k.hatEmail) return "email";
  if (k.designBestaetigt) return "design";
  if (k.scans > 0) return "gescannt";
  return "beauftragt";
}

/** Was mit diesem Salon als Nächstes zu tun ist — die Spalte zum Nachfassen. */
const NAECHSTER_SCHRITT: Record<Stufe, { text: string; nachfassen: boolean }> =
  {
    beauftragt: { text: "Karte unterwegs / noch nicht geöffnet", nachfassen: false },
    gescannt: { text: "Hat geschaut, kein Design gewählt", nachfassen: true },
    design: { text: "Design gewählt, keine E-Mail", nachfassen: true },
    email: { text: "E-Mail da, noch nicht gekauft — anrufen", nachfassen: true },
    gekauft: { text: "Kunde ✓", nachfassen: false },
  };

function Trichter({
  stufen,
}: {
  stufen: { stufe: string; label: string; anzahl: number; quote: number }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Trichter der Aktion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {stufen.map(s => (
            <li key={s.stufe} className="grid grid-cols-[10rem_1fr_5rem] items-center gap-3 text-sm">
              <span>{s.label}</span>
              <span className="h-3 rounded-full bg-muted overflow-hidden">
                <span
                  className="block h-full rounded-full bg-foreground/80"
                  style={{ width: `${s.quote}%` }}
                />
              </span>
              <span className="text-right tabular-nums">
                <strong>{s.anzahl}</strong>{" "}
                <span className="text-muted-foreground">({s.quote} %)</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Direkt aus der Datenbank, unabhängig von Cookie-Einwilligungen.
          Stornierte, zurückgestellte und Entwurfs-Karten zählen nicht mit.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Übersicht der Postkarten-Aktion (Betreiber-Wunsch 2026-09-19): Trichter
 * beauftragt → gescannt → Design → E-Mail → gekauft, Druckstatus aus dem
 * HeyMail-Konto (von Hand gepflegt — HeyMail bietet per API keine
 * Status-Abfrage) und je Salon der nächste Schritt zum Nachfassen. Die
 * Gruppierung nach Stadt/Textvariante bleibt darunter.
 */
function Auswertung() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.postkarten.uebersicht.useQuery();
  const setzen = trpc.postkarten.druckstatusSetzen.useMutation({
    onSuccess: () => utils.postkarten.uebersicht.invalidate(),
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const karten = data?.karten ?? [];
  const beauftragt = karten.filter(k => k.status === "versendet");
  const zaehle = (d: Druckstatus) =>
    beauftragt.filter(k => k.druckstatus === d).length;

  return (
    <div className="space-y-6">
      <Trichter stufen={data?.trichter ?? []} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Printer className="h-4 w-4" />
            Druckstatus bei HeyMail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            {beauftragt.length} beauftragt: {zaehle("geplant")} geplant,{" "}
            {zaehle("verschickt")} verschickt, {zaehle("storniert")} storniert.
          </p>
          <p className="text-muted-foreground">
            HeyMail bietet keine automatische Status-Abfrage. Den Stand aus
            dem HeyMail-Konto hier nachziehen — für alle auf einmal oder je
            Karte in der Tabelle.
          </p>
          <div className="flex flex-wrap gap-2">
            {(["geplant", "verschickt", "storniert"] as const).map(d => (
              <Button
                key={d}
                variant="outline"
                size="sm"
                disabled={setzen.isPending || beauftragt.length === 0}
                onClick={() => {
                  if (
                    d === "storniert" &&
                    !window.confirm(
                      `Wirklich alle ${beauftragt.length} beauftragten Karten als storniert markieren?`
                    )
                  )
                    return;
                  setzen.mutate({
                    ids: beauftragt.map(k => k.id),
                    druckstatus: d,
                  });
                }}
              >
                Alle als „{DRUCK_LABEL[d]}"
              </Button>
            ))}
          </div>
          {setzen.error && (
            <p role="alert" className="text-destructive">
              {setzen.error.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4" />
            Je Salon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="font-medium pb-2">Code</th>
                  <th className="font-medium pb-2">Betrieb</th>
                  <th className="font-medium pb-2">Stadt</th>
                  <th className="font-medium pb-2">Druck</th>
                  <th className="font-medium pb-2 text-right">Aufrufe</th>
                  <th className="font-medium pb-2">Letzter Scan</th>
                  <th className="font-medium pb-2">Nächster Schritt</th>
                </tr>
              </thead>
              <tbody>
                {karten.map(k => {
                  const stufe = stufeVon(k);
                  const schritt = stufe ? NAECHSTER_SCHRITT[stufe] : null;
                  return (
                    <tr key={k.id} className="border-t align-top">
                      <td className="py-2 font-mono font-medium">{k.code}</td>
                      <td className="py-2">{k.betrieb}</td>
                      <td className="py-2">{k.city ?? "—"}</td>
                      <td className="py-2">
                        {k.status === "versendet" ? (
                          <select
                            aria-label={`Druckstatus ${k.betrieb}`}
                            className="rounded-md border bg-background px-2 py-1"
                            value={k.druckstatus ?? ""}
                            disabled={setzen.isPending}
                            onChange={e =>
                              setzen.mutate({
                                ids: [k.id],
                                druckstatus: e.target.value as Druckstatus,
                              })
                            }
                          >
                            {k.druckstatus === null && (
                              <option value="">— wählen —</option>
                            )}
                            <option value="geplant">geplant</option>
                            <option value="verschickt">verschickt</option>
                            <option value="storniert">storniert</option>
                          </select>
                        ) : (
                          <span className="text-muted-foreground">
                            {k.status === "zurueckgestellt"
                              ? "zurückgestellt"
                              : "Entwurf"}
                          </span>
                        )}
                        {k.sentAt && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            <Send className="inline h-3 w-3 mr-1" />
                            beauftragt {datum(k.sentAt)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {k.scans}
                      </td>
                      <td className="py-2">{datum(k.letzterScan)}</td>
                      <td className="py-2">
                        {schritt ? (
                          <span
                            className={
                              schritt.nachfassen
                                ? "font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {schritt.nachfassen && (
                              <PhoneCall className="inline h-3 w-3 mr-1" />
                            )}
                            {schritt.text}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {karten.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-3 text-muted-foreground">
                      Noch keine Karten erzeugt.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Gruppentabelle
          titel="Nach Stadt"
          icon={<MapPin className="h-4 w-4" />}
          zeilen={data?.nachStadt ?? []}
        />
        <Gruppentabelle
          titel="Nach Textvariante"
          icon={<Type className="h-4 w-4" />}
          zeilen={data?.nachVariante ?? []}
        />
      </div>
    </div>
  );
}

export default function PostkartenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          Postkarten
        </h1>
        <p className="text-muted-foreground mt-1">
          Wer scannt, wer wählt ein Design, wer kauft — und wen du anrufen
          solltest.
        </p>
      </div>

      {/* Übersicht zuerst (2026-09-19): Die Karten sind beauftragt, jetzt
          zählt, wer scannt, wählt und kauft. */}
      <Tabs defaultValue="auswertung">
        <TabsList>
          <TabsTrigger value="auswertung">Übersicht</TabsTrigger>
          <TabsTrigger value="erzeugen">Karten erzeugen</TabsTrigger>
        </TabsList>
        <TabsContent value="erzeugen" className="mt-4">
          <KartenErzeugen />
        </TabsContent>
        <TabsContent value="auswertung" className="mt-4">
          <Auswertung />
        </TabsContent>
      </Tabs>
    </div>
  );
}
