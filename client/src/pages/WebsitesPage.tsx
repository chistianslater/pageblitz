import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Eye, Loader2, Wand2, ExternalLink, Mail, Building2, Star } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  preview: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  sold: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels: Record<string, string> = {
  preview: "Preview",
  sold: "Verkauft",
  active: "Aktiv",
  inactive: "Inaktiv",
};

export default function WebsitesPage() {
  const utils = trpc.useUtils();
  const { data: businessData, isLoading: bizLoading } = trpc.business.list.useQuery({ limit: 100, offset: 0 });
  const { data: websiteData, isLoading: webLoading } = trpc.website.list.useQuery({ limit: 100, offset: 0 });

  const generateMutation = trpc.website.generate.useMutation({
    onSuccess: (data) => {
      toast.success("Website erfolgreich generiert!");
      utils.website.list.invalidate();
      utils.business.list.invalidate();
      utils.stats.dashboard.invalidate();
    },
    onError: (err) => toast.error("Generierung fehlgeschlagen: " + err.message),
  });

  const handleGenerate = (businessId: number) => {
    generateMutation.mutate({ businessId });
  };

  const businessesWithoutWebsite = businessData?.businesses?.filter(b => {
    return !websiteData?.websites?.some(w => w.businessId === b.id);
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Websites
        </h1>
        <p className="text-muted-foreground mt-1">
          Verwalte generierte Websites und erstelle neue.
        </p>
      </div>

      {businessesWithoutWebsite.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Unternehmen ohne Website ({businessesWithoutWebsite.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Branche</TableHead>
                    <TableHead>Bewertung</TableHead>
                    <TableHead>Hat Website</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessesWithoutWebsite.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.address}</div>
                      </TableCell>
                      <TableCell className="text-sm">{b.category || "–"}</TableCell>
                      <TableCell>
                        {b.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-sm">{String(b.rating)}</span>
                          </div>
                        ) : "–"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={b.hasWebsite ? "text-emerald-400" : "text-red-400"}>
                          {b.hasWebsite ? "Ja" : "Nein"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleGenerate(b.id)}
                          disabled={generateMutation.isPending}
                        >
                          {generateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Wand2 className="h-4 w-4 mr-2" />
                          )}
                          Website generieren
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Generierte Websites ({websiteData?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {webLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : websiteData?.websites?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Noch keine Websites generiert.</p>
              <p className="text-sm mt-1">Suche zuerst Unternehmen und generiere dann Websites.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Branche</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {websiteData?.websites?.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell>
                        <div className="font-medium">{w.business?.name || "Unbekannt"}</div>
                        <div className="text-xs text-muted-foreground">{w.slug}</div>
                      </TableCell>
                      <TableCell className="text-sm">{w.industry || "–"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[w.status] || ""}>
                          {statusLabels[w.status] || w.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/preview/${w.previewToken}`} target="_blank" rel="noopener">
                              <Eye className="h-3 w-3 mr-1" /> Preview
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/site/${w.slug}`} target="_blank" rel="noopener">
                              <ExternalLink className="h-3 w-3 mr-1" /> Live
                            </a>
                          </Button>
                          <OutreachDialog website={w} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OutreachDialog({ website }: { website: any }) {
  const [email, setEmail] = useState(website.business?.email || "");
  const [subject, setSubject] = useState(`Ihre neue Website ist fertig – ${website.business?.name}`);
  const [body, setBody] = useState(
    `Sehr geehrte Damen und Herren,\n\nwir haben eine professionelle Website für ${website.business?.name || "Ihr Unternehmen"} erstellt.\n\nSchauen Sie sich die Vorschau hier an:\n${window.location.origin}/preview/${website.previewToken}\n\nBei Interesse können Sie die Website direkt aktivieren.\n\nMit freundlichen Grüßen\nIhr Pageblitz Team`
  );

  const sendMutation = trpc.outreach.send.useMutation({
    onSuccess: () => toast.success("E-Mail erfolgreich gesendet!"),
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-3 w-3 mr-1" /> E-Mail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Outreach E-Mail senden</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Empfänger E-Mail</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Betreff</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Nachricht</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!email) { toast.error("E-Mail-Adresse erforderlich"); return; }
              sendMutation.mutate({
                businessId: website.businessId,
                websiteId: website.id,
                recipientEmail: email,
                subject,
                body,
              });
            }}
            disabled={sendMutation.isPending}
          >
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            E-Mail senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
