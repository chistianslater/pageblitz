import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, QrCode, Send, Type } from "lucide-react";

const datum = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

function Gruppentabelle({
  titel,
  icon,
  zeilen,
}: {
  titel: string;
  icon: React.ReactNode;
  zeilen: { name: string; versendet: number; gescannt: number; scans: number; quote: number }[];
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
                <td className="py-2 text-right tabular-nums font-medium">{z.quote} %</td>
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

export default function PostkartenPage() {
  const { data, isLoading } = trpc.postkarten.uebersicht.useQuery();

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const karten = data?.karten ?? [];
  const versendet = karten.filter(k => k.status === "versendet").length;
  const gescannt = karten.filter(k => k.scans > 0).length;

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
          {karten.length} Karten, davon {versendet} versendet und {gescannt} mindestens einmal geöffnet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Gruppentabelle titel="Nach Stadt" icon={<MapPin className="h-4 w-4" />} zeilen={data?.nachStadt ?? []} />
        <Gruppentabelle titel="Nach Textvariante" icon={<Type className="h-4 w-4" />} zeilen={data?.nachVariante ?? []} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4" />
            Einzelne Karten
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
                  <th className="font-medium pb-2">Variante</th>
                  <th className="font-medium pb-2">Versendet</th>
                  <th className="font-medium pb-2 text-right">Aufrufe</th>
                  <th className="font-medium pb-2">Erster Scan</th>
                </tr>
              </thead>
              <tbody>
                {karten.map(k => (
                  <tr key={k.id} className="border-t">
                    <td className="py-2 font-mono font-medium">{k.code}</td>
                    <td className="py-2">{k.betrieb}</td>
                    <td className="py-2">{k.city ?? "—"}</td>
                    <td className="py-2">{k.textVariant ?? "—"}</td>
                    <td className="py-2">
                      {k.status === "versendet" ? (
                        <span className="inline-flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          {datum(k.sentAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Entwurf</span>
                      )}
                    </td>
                    <td className="py-2 text-right tabular-nums">{k.scans}</td>
                    <td className="py-2">{datum(k.ersterScan)}</td>
                  </tr>
                ))}
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
    </div>
  );
}
