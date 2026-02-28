import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MapPin, Phone, Globe, Star, Save, Loader2, CheckCircle, XCircle, Building2, AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());

  const searchMutation = trpc.search.gmb.useMutation({
    onSuccess: (data) => {
      setResults(data.results);
      toast.success(`${data.total} Unternehmen gefunden`);
    },
    onError: (err) => toast.error("Suche fehlgeschlagen: " + err.message),
  });

  const saveMutation = trpc.search.saveResults.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.saved} Unternehmen gespeichert`);
      setSelectedResults(new Set());
    },
    onError: (err) => toast.error("Speichern fehlgeschlagen: " + err.message),
  });

  const handleSearch = () => {
    if (!query.trim() || !region.trim()) {
      toast.error("Bitte Nische und Region eingeben");
      return;
    }
    searchMutation.mutate({ query: query.trim(), region: region.trim() });
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selectedResults);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedResults(next);
  };

  const selectAllWithoutWebsite = () => {
    const next = new Set<number>();
    results.forEach((r, i) => { if (!r.hasWebsite) next.add(i); });
    setSelectedResults(next);
  };

  const handleSave = () => {
    const selected = results.filter((_, i) => selectedResults.has(i));
    if (selected.length === 0) { toast.error("Keine Unternehmen ausgewählt"); return; }
    saveMutation.mutate({ results: selected, searchQuery: query, searchRegion: region });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          GMB-Suche
        </h1>
        <p className="text-muted-foreground mt-1">
          Finde lokale Unternehmen ohne Website über Google Maps.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            Unternehmen suchen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1.5 block">Nische / Branche</label>
              <Input
                placeholder="z.B. Friseur, Handwerker, Restaurant..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1.5 block">Region / Stadt</label>
              <Input
                placeholder="z.B. Berlin, München, Hamburg..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={searchMutation.isPending} className="w-full sm:w-auto">
                {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Suchen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Ergebnisse ({results.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllWithoutWebsite}>
                  Ohne Website auswählen
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending || selectedResults.size === 0}>
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {selectedResults.size} speichern
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Bewertung</TableHead>
                    <TableHead>Website / Lead-Typ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, i) => (
                    <TableRow
                      key={r.placeId}
                      className={`cursor-pointer transition-colors ${selectedResults.has(i) ? "bg-primary/10" : "hover:bg-muted/20"}`}
                      onClick={() => toggleSelect(i)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedResults.has(i)}
                          onChange={() => toggleSelect(i)}
                          className="rounded border-border"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[200px]">{r.address || "–"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {r.phone || "–"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-sm">{r.rating}</span>
                            <span className="text-xs text-muted-foreground">({r.reviewCount})</span>
                          </div>
                        ) : "–"}
                      </TableCell>
                      <TableCell>
                        <LeadTypeBadge hasWebsite={r.hasWebsite} leadType={r.leadType} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type LeadType = "no_website" | "outdated_website" | "poor_website" | "unknown";

function LeadTypeBadge({ hasWebsite, leadType }: { hasWebsite: boolean; leadType?: LeadType }) {
  if (!hasWebsite || leadType === "no_website") {
    return (
      <Badge variant="outline" className="text-red-400 border-red-400/30 gap-1">
        <XCircle className="h-3 w-3" /> Keine Website
      </Badge>
    );
  }
  if (leadType === "outdated_website") {
    return (
      <Badge variant="outline" className="text-amber-400 border-amber-400/30 gap-1">
        <Clock className="h-3 w-3" /> Veraltete Website
      </Badge>
    );
  }
  if (leadType === "poor_website") {
    return (
      <Badge variant="outline" className="text-orange-400 border-orange-400/30 gap-1">
        <TrendingDown className="h-3 w-3" /> Schlechte Website
      </Badge>
    );
  }
  // hasWebsite but leadType === "unknown" – not yet analyzed
  return (
    <div className="flex flex-col gap-1">
      <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 gap-1">
        <CheckCircle className="h-3 w-3" /> Hat Website
      </Badge>
      <span className="text-xs text-muted-foreground">Noch nicht analysiert</span>
    </div>
  );
}
