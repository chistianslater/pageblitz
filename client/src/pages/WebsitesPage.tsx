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
import { Globe, Eye, Loader2, Wand2, ExternalLink, Mail, Building2, Star, RefreshCw, Sparkles, AlertTriangle, ShoppingCart, CreditCard, Trash2, XCircle, CheckCircle, Clock, TrendingDown, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

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

  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const generateMutation = trpc.website.generate.useMutation({
    onSuccess: () => {
      toast.success("Website erfolgreich generiert!");
      setGeneratingId(null);
      utils.website.list.invalidate();
      utils.business.list.invalidate();
      utils.stats.dashboard.invalidate();
    },
    onError: (err) => {
      toast.error("Generierung fehlgeschlagen: " + err.message);
      setGeneratingId(null);
    },
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
                    <TableHead>Lead-Typ</TableHead>
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
                        <BusinessLeadTypeBadge hasWebsite={!!b.hasWebsite} leadType={b.leadType} website={b.website} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setGeneratingId(b.id);
                              generateMutation.mutate({ businessId: b.id });
                            }}
                            disabled={generatingId !== null}
                          >
                            {generatingId === b.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Wand2 className="h-4 w-4 mr-2" />
                            )}
                            Website generieren
                          </Button>
                          <DeleteBusinessDialog business={b} />
                        </div>
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
                          <CheckoutDialog website={w} />
                          <ActivateWebsiteButton website={w} />
                          <TestSubscriptionButton website={w} />
                          <RegenerateDialog website={w} />
                          <OutreachDialog website={w} />
                          <DeleteWebsiteDialog website={w} />
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

function CheckoutDialog({ website }: { website: any }) {
  const [open, setOpen] = useState(false);
  const [subpages, setSubpages] = useState(0);
  const [gallery, setGallery] = useState(false);
  const [contactForm, setContactForm] = useState(false);

  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      setOpen(false);
      toast.info("Weiterleitung zu Stripe...");
      window.open(data.url, "_blank");
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const totalMonthly = 79 + subpages * 9.9 + (gallery ? 4.9 : 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          disabled={website.status === "active"}
        >
          <CreditCard className="h-3 w-3 mr-1" />
          {website.status === "active" ? "Aktiv" : "Kaufen"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-400" />
            Website kaufen
          </DialogTitle>
          <DialogDescription>
            Wähle dein Paket für <span className="font-medium text-foreground">{website.business?.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Base Plan */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Basis-Paket</p>
                <p className="text-sm text-muted-foreground">1-seitige Website, Impressum & Datenschutz</p>
              </div>
              <span className="text-xl font-bold text-emerald-400">79€/Mo</span>
            </div>
          </div>

          {/* Add-ons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Add-ons</p>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <Label className="font-medium cursor-pointer">Unterseiten</Label>
                <p className="text-xs text-muted-foreground">+9,90€/Monat pro Seite</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSubpages(Math.max(0, subpages - 1))}>-</Button>
                <span className="w-6 text-center font-medium">{subpages}</span>
                <Button variant="outline" size="sm" onClick={() => setSubpages(subpages + 1)}>+</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <Label htmlFor="gallery-toggle" className="font-medium cursor-pointer">Bildergalerie</Label>
                <p className="text-xs text-muted-foreground">+4,90€/Monat</p>
              </div>
              <Switch id="gallery-toggle" checked={gallery} onCheckedChange={setGallery} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <Label htmlFor="form-toggle" className="font-medium cursor-pointer">Kontaktformular</Label>
                <p className="text-xs text-muted-foreground">Inklusive</p>
              </div>
              <Switch id="form-toggle" checked={contactForm} onCheckedChange={setContactForm} />
            </div>
          </div>

          {/* Total */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border flex justify-between items-center">
            <span className="font-semibold">Gesamt</span>
            <span className="text-2xl font-bold">{totalMonthly.toFixed(2).replace(".", ",")}€/Mo</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => checkoutMutation.mutate({ websiteId: website.id, addOns: { subpages, gallery, contactForm } })}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
            Jetzt kaufen
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

function DeleteWebsiteDialog({ website }: { website: any }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);

  const deleteMutation = trpc.website.delete.useMutation({
    onMutate: async () => {
      // Optimistic update: remove from list immediately
      await utils.website.list.cancel();
      const previous = utils.website.list.getData({ limit: 100, offset: 0 });
      utils.website.list.setData({ limit: 100, offset: 0 }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          websites: old.websites.filter((w: any) => w.id !== website.id),
          total: (old.total ?? 1) - 1,
        };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success(`Website "${website.business?.name || website.slug}" wurde gelöscht.`);
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
      setOpen(false);
    },
    onError: (err, _vars, ctx) => {
      // Rollback optimistic update
      if (ctx?.previous) {
        utils.website.list.setData({ limit: 100, offset: 0 }, ctx.previous);
      }
      toast.error("Löschen fehlgeschlagen: " + err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            Website löschen
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Möchtest du die Website für{" "}
            <span className="font-medium text-foreground">{website.business?.name || website.slug}</span>{" "}
            wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">
            Die Website, alle Onboarding-Daten und Abonnement-Informationen werden dauerhaft gelöscht.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate({ id: website.id })}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Endgültig löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestSubscriptionButton({ website }: { website: any }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const createTestSub = trpc.customer.createTestSubscription.useMutation({
    onSuccess: () => {
      utils.website.list.invalidate();
      toast.success("Test-Abo erstellt! Website ist jetzt unter /my-website sichtbar.");
    },
    onError: (err) => toast.error(err.message),
  });
  if (!user) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
      onClick={() => createTestSub.mutate({ websiteId: website.id, userId: user.id })}
      disabled={createTestSub.isPending}
      title="Verknüpft diese Website mit deinem Account (für Test-Zwecke)"
    >
      {createTestSub.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1" />}
      Test-Abo
    </Button>
  );
}

function ActivateWebsiteButton({ website }: { website: any }) {
  const utils = trpc.useUtils();
  const [loading, setLoading] = useState(false);
  const updateStatusMutation = trpc.website.updateStatus.useMutation({
    onSuccess: () => {
      utils.website.list.invalidate();
      toast.success("Website-Status aktualisiert");
    },
    onError: (err) => toast.error(err.message),
  });
  if (website.status === "active") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
        onClick={() => updateStatusMutation.mutate({ id: website.id, status: "preview" })}
        disabled={updateStatusMutation.isPending}
      >
        {updateStatusMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
        Deaktivieren
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
      onClick={() => updateStatusMutation.mutate({ id: website.id, status: "active" })}
      disabled={updateStatusMutation.isPending}
    >
      {updateStatusMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
      Aktivieren
    </Button>
  );
}

function DeleteBusinessDialog({ business }: { business: any }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);

  const deleteMutation = trpc.business.delete.useMutation({
    onMutate: async () => {
      await utils.business.list.cancel();
      const previous = utils.business.list.getData({ limit: 100, offset: 0 });
      utils.business.list.setData({ limit: 100, offset: 0 }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          businesses: old.businesses.filter((b: any) => b.id !== business.id),
          total: (old.total ?? 1) - 1,
        };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success(`Unternehmen "${business.name}" wurde gelöscht.`);
      utils.business.list.invalidate();
      utils.website.list.invalidate();
      utils.stats.dashboard.invalidate();
      setOpen(false);
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        utils.business.list.setData({ limit: 100, offset: 0 }, ctx.previous);
      }
      toast.error("Löschen fehlgeschlagen: " + err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            Unternehmen löschen
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Möchtest du <span className="font-medium text-foreground">{business.name}</span> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">
            Das Unternehmen und alle zugehörigen Websites, Onboarding-Daten und Abonnements werden dauerhaft gelöscht.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate({ id: business.id })}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Endgültig löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type LeadType = "no_website" | "outdated_website" | "poor_website" | "unknown";

function BusinessLeadTypeBadge({ hasWebsite, leadType, website }: { hasWebsite: boolean; leadType?: string | null; website?: string | null }) {
  const lt = leadType as LeadType | undefined;
  const link = website ? (
    <a
      href={website.startsWith("http") ? website : `https://${website}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-400 hover:underline truncate max-w-[160px] block mt-0.5"
    >
      {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  ) : null;

  if (!hasWebsite || lt === "no_website") {
    return (
      <Badge variant="outline" className="text-red-400 border-red-400/30 gap-1">
        <XCircle className="h-3 w-3" /> Keine Website
      </Badge>
    );
  }
  if (lt === "outdated_website") {
    return (
      <div>
        <Badge variant="outline" className="text-amber-400 border-amber-400/30 gap-1">
          <Clock className="h-3 w-3" /> Veraltete Website
        </Badge>
        {link}
      </div>
    );
  }
  if (lt === "poor_website") {
    return (
      <div>
        <Badge variant="outline" className="text-orange-400 border-orange-400/30 gap-1">
          <TrendingDown className="h-3 w-3" /> Schlechte Website
        </Badge>
        {link}
      </div>
    );
  }
  return (
    <div>
      <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 gap-1">
        <CheckCircle className="h-3 w-3" /> Hat Website
      </Badge>
      {link}
    </div>
  );
}
