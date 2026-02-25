import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Eye, Loader2, Wand2, ExternalLink, Mail, Building2, Star, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
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
  const { data: businessData } = trpc.business.list.useQuery({ limit: 100, offset: 0 });
  const { data: websiteData, isLoading: webLoading } = trpc.website.list.useQuery({ limit: 100, offset: 0 });

  const generateMutation = trpc.website.generate.useMutation({
    onSuccess: () => {
      toast.success("Website erfolgreich generiert!");
      utils.website.list.invalidate();
      utils.business.list.invalidate();
      utils.stats.dashboard.invalidate();
    },
    onError: (err) => toast.error("Generierung fehlgeschlagen: " + err.message),
  });

  const businessesWithoutWebsite = businessData?.businesses?.filter(b => {
    return !websiteData?.websites?.some((w: any) => w.businessId === b.id);
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
                          onClick={() => generateMutation.mutate({ businessId: b.id })}
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
                          <RegenerateDialog website={w} />
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

function RegenerateDialog({ website }: { website: any }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [generateAiImage, setGenerateAiImage] = useState(false);

  const regenerateMutation = trpc.website.regenerate.useMutation({
    onSuccess: (data) => {
      toast.success("Website erfolgreich neu generiert! Neuer Preview-Link ist aktiv.", {
        action: {
          label: "Preview öffnen",
          onClick: () => window.open(`/preview/${data.previewToken}`, "_blank"),
        },
        duration: 6000,
      });
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
      setOpen(false);
    },
    onError: (err) => toast.error("Regenerierung fehlgeschlagen: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Neu generieren
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-400" />
            Website neu generieren
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Die KI erstellt komplett neue Texte, einen anderen Slogan, andere Testimonials und ein neues Layout-Design für{" "}
            <span className="font-medium text-foreground">{website.business?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">
              Der bisherige Preview-Link wird ungültig. Ein neuer Link wird generiert.
            </p>
          </div>

          {/* AI Image option */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <div>
                <Label htmlFor="ai-image-regen" className="text-sm font-medium cursor-pointer">
                  KI-Bild generieren
                </Label>
                <p className="text-xs text-muted-foreground">Erstellt ein einzigartiges Hero-Bild via KI</p>
              </div>
            </div>
            <Switch
              id="ai-image-regen"
              checked={generateAiImage}
              onCheckedChange={setGenerateAiImage}
            />
          </div>

          {/* What changes */}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">Was sich ändert:</p>
            <ul className="space-y-1 pl-2">
              {["Alle Texte & Überschriften", "Slogan & Beschreibung", "Testimonials & FAQ", "Farbschema & Layout-Stil", "Hero-Bild (Unsplash-Auswahl)", "Preview-Token & URL"].map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-blue-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={regenerateMutation.isPending}>
            Abbrechen
          </Button>
          <Button
            onClick={() => regenerateMutation.mutate({ websiteId: website.id, generateAiImage })}
            disabled={regenerateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {regenerateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                KI generiert…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Jetzt neu generieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
