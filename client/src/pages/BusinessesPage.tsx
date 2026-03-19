import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Globe,
  Phone,
  Search,
  XCircle,
  Clock,
  TrendingDown,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

type LeadType = "no_website" | "outdated_website" | "poor_website" | "unknown" | "all";

interface Business {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: string | null;
  leadType: LeadType | null;
  websiteAge: number | null;
  websiteScore: number | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractCity(address: string | null): string {
  if (!address) return "–";
  // German addresses: "Musterstraße 1, 12345 Berlin, Deutschland"
  // Try to find the city part after the postal code
  const match = address.match(/\d{5}\s+([^,]+)/);
  if (match) return match[1].trim();
  // Fallback: last meaningful segment before "Deutschland"
  const parts = address.split(",").map(p => p.trim()).filter(p => p !== "Deutschland");
  return parts[parts.length - 1] ?? "–";
}

function LeadTypeBadge({ leadType }: { leadType: LeadType | null }) {
  switch (leadType) {
    case "no_website":
      return (
        <Badge variant="destructive" className="gap-1 whitespace-nowrap">
          <XCircle className="h-3 w-3" />
          Keine Website
        </Badge>
      );
    case "outdated_website":
      return (
        <Badge className="gap-1 whitespace-nowrap bg-amber-500 hover:bg-amber-500 text-white">
          <Clock className="h-3 w-3" />
          Veraltete Website
        </Badge>
      );
    case "poor_website":
      return (
        <Badge className="gap-1 whitespace-nowrap bg-orange-500 hover:bg-orange-500 text-white">
          <TrendingDown className="h-3 w-3" />
          Schlechte Website
        </Badge>
      );
    case "unknown":
      return (
        <Badge variant="secondary" className="gap-1 whitespace-nowrap">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          Gute Website
        </Badge>
      );
    default:
      return <Badge variant="outline">–</Badge>;
  }
}

function WebsiteAgeBadge({ age }: { age: number | null }) {
  if (age === null) return <span className="text-muted-foreground text-sm">–</span>;
  const color = age > 4 ? "text-amber-500" : "text-green-500";
  return <span className={`text-sm font-medium ${color}`}>{age} {age === 1 ? "Jahr" : "Jahre"}</span>;
}

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-sm">–</span>;
  const color = score < 40 ? "bg-destructive" : score < 70 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-7 text-right">{score}</span>
    </div>
  );
}

function OutreachStatusBadge({ businessId, outreachMap }: { businessId: number; outreachMap: Map<number, string> }) {
  const status = outreachMap.get(businessId);
  if (!status) return <Badge variant="outline" className="text-muted-foreground">Nicht kontaktiert</Badge>;
  if (status === "replied") return <Badge className="bg-green-600 hover:bg-green-600 text-white">Geantwortet</Badge>;
  if (status === "opened") return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">Geöffnet</Badge>;
  return <Badge variant="secondary">Gesendet</Badge>;
}

// ── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards({
  stats,
  onFilter,
  activeFilter,
}: {
  stats: { noWebsite: number; outdated: number; poor: number; good: number; total: number } | undefined;
  onFilter: (type: LeadType) => void;
  activeFilter: LeadType;
}) {
  const cards = [
    { type: "no_website" as LeadType, label: "Keine Website", count: stats?.noWebsite ?? 0, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
    { type: "outdated_website" as LeadType, label: "Veraltete Website", count: stats?.outdated ?? 0, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    { type: "poor_website" as LeadType, label: "Schlechte Website", count: stats?.poor ?? 0, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
    { type: "unknown" as LeadType, label: "Gute Website", count: stats?.good ?? 0, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card
          key={card.type}
          className={`cursor-pointer border transition-all ${card.bg} ${activeFilter === card.type ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"}`}
          onClick={() => onFilter(activeFilter === card.type ? "all" : card.type)}
        >
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${card.color}`}>{card.count.toLocaleString("de-DE")}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{card.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BusinessesPage() {
  const [leadTypeFilter, setLeadTypeFilter] = useState<LeadType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const LIMIT = 50;

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout((window as any).__searchDebounce);
    (window as any).__searchDebounce = setTimeout(() => {
      setDebouncedSearch(value);
      setOffset(0);
    }, 300);
  };

  const { data: statsData } = trpc.business.stats.useQuery();

  const { data, isLoading } = trpc.business.list.useQuery({
    limit: LIMIT,
    offset,
    leadType: leadTypeFilter,
    search: debouncedSearch || undefined,
  });

  const businesses: Business[] = (data?.businesses ?? []) as Business[];
  const total = data?.total ?? 0;

  // Build a map of businessId → outreach status (best status wins)
  const outreachMap = useMemo<Map<number, string>>(() => new Map(), []);

  const handleFilterChange = (type: LeadType) => {
    setLeadTypeFilter(type);
    setOffset(0);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === businesses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(businesses.map(b => b.id)));
    }
  };

  const handleQueueForOutreach = () => {
    const count = selectedIds.size;
    toast.info(
      `Diese ${count} ${count === 1 ? "Unternehmen wird" : "Unternehmen werden"} beim nächsten Montag automatisch kontaktiert, sofern sie eine E-Mail-Adresse haben.`
    );
    setSelectedIds(new Set());
  };

  const hasMore = offset + LIMIT < total;
  const canGoBack = offset > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Businesses
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle gecrawlten Unternehmen mit Lead-Qualifizierung und Outreach-Status.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        stats={statsData}
        onFilter={handleFilterChange}
        activeFilter={leadTypeFilter}
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name oder Adresse suchen…"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={leadTypeFilter} onValueChange={v => handleFilterChange(v as LeadType)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Alle Lead-Typen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Lead-Typen</SelectItem>
            <SelectItem value="no_website">Keine Website</SelectItem>
            <SelectItem value="outdated_website">Veraltete Website</SelectItem>
            <SelectItem value="poor_website">Schlechte Website</SelectItem>
            <SelectItem value="unknown">Gute Website</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={selectedIds.size > 0 && selectedIds.size === businesses.length}
                  onChange={toggleSelectAll}
                  aria-label="Alle auswählen"
                />
              </TableHead>
              <TableHead>Name / Kategorie</TableHead>
              <TableHead>Stadt</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Lead-Typ</TableHead>
              <TableHead>Website-Alter</TableHead>
              <TableHead className="w-28">Score</TableHead>
              <TableHead>Outreach</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Lade Businesses…
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && businesses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Keine Unternehmen gefunden
                </TableCell>
              </TableRow>
            )}
            {businesses.map(b => (
              <TableRow key={b.id} className={selectedIds.has(b.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={selectedIds.has(b.id)}
                    onChange={() => toggleSelect(b.id)}
                    aria-label={`${b.name} auswählen`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{b.name}</div>
                  {b.category && (
                    <div className="text-xs text-muted-foreground mt-0.5">{b.category}</div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {extractCity(b.address)}
                </TableCell>
                <TableCell>
                  {b.phone ? (
                    <a
                      href={`tel:${b.phone}`}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[120px]">{b.phone}</span>
                    </a>
                  ) : b.email ? (
                    <a
                      href={`mailto:${b.email}`}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[120px]">{b.email}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">–</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <LeadTypeBadge leadType={b.leadType ?? null} />
                    {b.website && (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[160px]"
                      >
                        <Globe className="h-2.5 w-2.5 shrink-0" />
                        {b.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <WebsiteAgeBadge age={b.websiteAge} />
                </TableCell>
                <TableCell>
                  <ScoreBar score={b.websiteScore} />
                </TableCell>
                <TableCell>
                  <OutreachStatusBadge businessId={b.id} outreachMap={outreachMap} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total > 0
            ? `${offset + 1}–${Math.min(offset + LIMIT, total)} von ${total.toLocaleString("de-DE")} Unternehmen`
            : "Keine Unternehmen"}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            disabled={!canGoBack}
          >
            Zurück
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset + LIMIT)}
            disabled={!hasMore}
          >
            Weiter
          </Button>
        </div>
      </div>

      {/* Floating Outreach Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-4 bg-card border border-border rounded-xl shadow-2xl px-5 py-3">
            <span className="text-sm font-medium">
              {selectedIds.size} {selectedIds.size === 1 ? "ausgewählt" : "ausgewählt"}
            </span>
            <Button
              size="sm"
              onClick={handleQueueForOutreach}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              In Outreach-Warteschlange aufnehmen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
