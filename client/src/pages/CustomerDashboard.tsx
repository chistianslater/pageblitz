import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import HelpWidget from "@/components/HelpWidget";
import { trackConversion } from "@/lib/tracking";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Loader2,
  Globe,
  ExternalLink,
  Phone,
  Mail,
  Settings,
  User,
  Sparkles,
  ChevronDown,
  MessageSquare,
  BarChart2,
  Users,
  MousePointerClick,
  Clock,
  CalendarDays,
  Layers,
  Trash2,
} from "lucide-react";
import { AddonsTab } from "@/pages/dashboard/AddonsTab";
import { ChatLeadsTab } from "@/pages/dashboard/ChatLeadsTab";
import { AppointmentsTab } from "@/pages/dashboard/AppointmentsTab";
import { PreviewTab } from "@/pages/dashboard/PreviewTab";
import "./dashboard/customer.css";

// ── Types ───────────────────────────────────────────
type Tab =
  | "preview"
  | "addons"
  | "analytics"
  | "submissions"
  | "domain"
  | "leads"
  | "appointments"
  | "settings";

// ── Helpers ───────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: {
      label: "Aktiv",
      cls: "bg-lp-accent/10 text-lp-accent border-lp-accent/30",
    },
    preview: {
      label: "Vorschau",
      cls: "bg-lp-accent/10 text-lp-accent border-lp-accent/40",
    },
    sold: {
      label: "Verkauft",
      cls: "bg-lp-accent/10 text-lp-accent border-lp-accent/40",
    },
    inactive: {
      label: "Inaktiv",
      cls: "bg-lp-canvas text-lp-muted border-lp-line",
    },
  };
  const { label, cls } = map[status] || {
    label: status,
    cls: "bg-lp-canvas text-lp-muted border-lp-line",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ── Setup Step Chip ───────────────────────────────────
function StepChip({
  done,
  label,
  onClick,
}: {
  done: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={done ? undefined : onClick}
      disabled={done}
      className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ${
        done
          ? "border-lp-accent/30 text-lp-accent bg-lp-accent/10 cursor-default"
          : "border-lp-line text-lp-ink bg-lp-surface hover:bg-lp-canvas cursor-pointer"
      }`}
    >
      {done ? "✓" : "○"} {label}
    </button>
  );
}

// ── Main Component ────────────────────────────────────
export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search).get(
      "tab"
    ) as Tab | null;
    const valid: Tab[] = [
      "preview",
      "settings",
      "addons",
      "domain",
      "submissions",
      "leads",
      "appointments",
      "analytics",
    ];
    return p && valid.includes(p) ? p : "preview";
  });
  const [previewKey, setPreviewKey] = useState(0);
  const {
    data: myWebsites,
    isLoading,
    refetch,
  } = trpc.customer.getMyWebsites.useQuery(undefined, { enabled: !!user });
  const ensureAdminDemoMutation =
    trpc.customer.ensureAdminDemoWebsite.useMutation({
      onSuccess: async result => {
        setSelectedWebsiteId(result.websiteId);
        await refetch();
        toast.success(
          result.created
            ? "Deine Kundenbackend-Demo ist bereit."
            : "Kundenbackend-Demo geöffnet."
        );
      },
      onError: error => {
        toast.error(`Demo konnte nicht angelegt werden: ${error.message}`);
      },
    });

  const { data: onboardingData, isError: onboardingDataError } =
    trpc.customer.getOnboardingData.useQuery(
      { websiteId: selectedWebsiteId || myWebsites?.[0]?.website.id || 0 },
      {
        enabled: !!selectedWebsiteId || !!myWebsites?.[0]?.website.id,
        retry: false,
      }
    );

  const activeWebsiteId = myWebsites?.[0]?.website.id;
  const { data: analyticsStats, isLoading: analyticsLoading } =
    trpc.customer.getAnalytics.useQuery(
      { websiteId: selectedWebsiteId || activeWebsiteId || 0 },
      {
        enabled:
          !!(selectedWebsiteId || activeWebsiteId) && activeTab === "analytics",
      }
    );

  const [showArchivedSubmissions, setShowArchivedSubmissions] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    refetch: refetchSubmissions,
  } = trpc.customer.getSubmissions.useQuery(
    {
      websiteId: selectedWebsiteId || activeWebsiteId || 0,
      includeArchived: showArchivedSubmissions,
    },
    { enabled: !!(selectedWebsiteId || activeWebsiteId) }
  );

  const markReadMutation = trpc.customer.markSubmissionRead.useMutation({
    onSuccess: () => refetchSubmissions(),
  });

  const archiveMutation = trpc.customer.archiveSubmission.useMutation({
    onSuccess: () => refetchSubmissions(),
    onError: () => toast.error("Fehler beim Archivieren."),
  });

  const deleteMutation = trpc.customer.deleteSubmission.useMutation({
    onSuccess: () => {
      setDeleteConfirmId(null);
      refetchSubmissions();
    },
    onError: () => toast.error("Fehler beim Löschen."),
  });

  const [contactEmailInput, setContactEmailInput] = useState("");
  const [contactEmailSaved, setContactEmailSaved] = useState(false);
  const contactEmailRef = useRef<HTMLInputElement>(null);
  const updateContactEmailMutation =
    trpc.customer.updateContactEmail.useMutation({
      onSuccess: () => {
        setContactEmailSaved(true);
        setTimeout(() => setContactEmailSaved(false), 2500);
        refetch();
      },
      onError: (err: any) => {
        toast.error("Fehler beim Speichern: " + err.message);
      },
    });

  const updateShowBrandingMutation =
    trpc.customer.updateShowBranding.useMutation({
      onSuccess: () => {
        refetch();
        toast.success("Einstellung gespeichert");
      },
      onError: (err: any) => {
        toast.error("Fehler beim Speichern: " + err.message);
      },
    });

  const handleUpdate = () => {
    refetch();
    setPreviewKey(k => k + 1);
  };

  // ── useEffect + Setup-Hooks MÜSSEN vor allen Early-Returns stehen ───────
  const _selectedEntry =
    myWebsites?.find(e => e.website.id === selectedWebsiteId) ||
    myWebsites?.[0];
  const storedContactEmailEarly = (_selectedEntry?.website as any)
    ?.contactEmail as string | null | undefined;
  useEffect(() => {
    setContactEmailInput(storedContactEmailEarly ?? "");
  }, [storedContactEmailEarly]);

  // Falls aktiver Tab durch deaktiviertes Add-on wegfällt → zurück zu Add-ons
  // MUSS vor Early-Returns stehen (Rules of Hooks)
  const _addOnAiChatEarly = !!(_selectedEntry?.website as any)?.addOnAiChat;
  const _addOnBookingEarly = !!(_selectedEntry?.website as any)?.addOnBooking;
  useEffect(() => {
    if (activeTab === "leads" && !_addOnAiChatEarly) setActiveTab("addons");
    if (activeTab === "appointments" && !_addOnBookingEarly)
      setActiveTab("addons");
  }, [activeTab, _addOnAiChatEarly, _addOnBookingEarly]);

  // ── Setup-Flow State ──────────────────────────────────────────────────────
  const _isCheckoutSuccess =
    new URLSearchParams(window.location.search).get("checkout") === "success";
  const [setupOpen, setSetupOpen] = useState(() => _isCheckoutSuccess);

  // Google Ads Conversion: Kauf nach Stripe-Checkout
  useEffect(() => {
    if (_isCheckoutSuccess) {
      trackConversion("purchase");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [setupStepIdx, setSetupStepIdx] = useState(0);
  const [slugInput, setSlugInput] = useState("");
  const [showDomainHint, setShowDomainHint] = useState(false);
  const [domainTabSlugInput, setDomainTabSlugInput] = useState("");
  const [domainTabSlugSaved, setDomainTabSlugSaved] = useState(false);
  const [showCustomDomainInfo, setShowCustomDomainInfo] = useState(false);

  const _activeWebsiteIdForSetup = _selectedEntry?.website.id ?? 0;
  const updateSlugMutation = trpc.customer.updateSlug.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const setLiveMutation = trpc.customer.setLive.useMutation({
    onSuccess: () => {
      refetch();
      setSetupOpen(false);
    },
  });
  const { data: slugCheck, isFetching: slugChecking } =
    trpc.customer.checkSlugAvailability.useQuery(
      { slug: slugInput, websiteId: _activeWebsiteIdForSetup },
      { enabled: slugInput.length >= 3 }
    );
  const { data: domainSlugCheck, isFetching: domainSlugChecking } =
    trpc.customer.checkSlugAvailability.useQuery(
      { slug: domainTabSlugInput, websiteId: _activeWebsiteIdForSetup },
      {
        enabled:
          domainTabSlugInput.length >= 3 &&
          domainTabSlugInput !== _selectedEntry?.website?.slug,
      }
    );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-lp-canvas pb-dash flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lp-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-lp-canvas pb-dash flex items-center justify-center">
        <div className="text-center text-lp-ink max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lp-accent to-lp-ink flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-lp-ink" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Meine Website</h1>
          <p className="text-lp-muted mb-6">
            Melde dich an, um deine Website zu verwalten.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 bg-lp-accent hover:bg-lp-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Anmelden
          </a>
        </div>
      </div>
    );
  }

  if (!myWebsites || myWebsites.length === 0) {
    const isAdmin = user.role === "admin";
    return (
      <div className="min-h-screen bg-lp-canvas pb-dash flex items-center justify-center">
        <div className="text-center text-lp-ink max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-lp-canvas flex items-center justify-center mx-auto mb-6">
            {isAdmin ? (
              <Sparkles className="w-8 h-8 text-lp-accent" />
            ) : (
              <Globe className="w-8 h-8 text-lp-muted" />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-3">
            {isAdmin ? "Kundenbackend testen" : "Keine Website gefunden"}
          </h1>
          <p className="text-lp-muted mb-6">
            {isAdmin
              ? "Lege eine isolierte Demo-Website für deinen Admin-Account an. Du kannst danach alle Kundenfunktionen ausprobieren, ohne echte Kundendaten zu verändern."
              : "Du hast noch keine aktive Website. Erstelle jetzt deine erste Website!"}
          </p>
          {isAdmin ? (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => ensureAdminDemoMutation.mutate()}
                disabled={ensureAdminDemoMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-lp-accent px-6 py-3 font-medium text-white transition-colors hover:bg-lp-accent/90 disabled:cursor-wait disabled:opacity-60"
              >
                {ensureAdminDemoMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {ensureAdminDemoMutation.isPending
                  ? "Demo wird vorbereitet…"
                  : "Demo-Website anlegen"}
              </button>
              <a
                href="/admin"
                className="text-sm text-lp-muted underline underline-offset-4 hover:text-lp-ink"
              >
                Zurück zum Adminbereich
              </a>
            </div>
          ) : (
            <a
              href="/start"
              className="inline-flex items-center gap-2 bg-lp-accent hover:bg-lp-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Website gratis erstellen
            </a>
          )}
        </div>
      </div>
    );
  }

  const selectedEntry =
    myWebsites.find(e => e.website.id === selectedWebsiteId) || myWebsites[0];
  const { website, business, subscription } = selectedEntry;
  const websiteData = website.websiteData as any;
  const isAdminDemo = subscription?.plan === "admin-demo";
  // Null-Guard (Final-Review Minor, Abschluss-Fixwelle B): previewToken kann
  // fehlen (z. B. nach manueller DB-Korrektur) — ohne Guard rendern die
  // Studio-Links `/onboarding/undefined` statt eines funktionierenden Links
  // oder eines Hinweises.
  const previewToken =
    ((website as any).previewToken as string | null | undefined) ?? null;
  // Sync contactEmail – useEffect is above early returns to satisfy Rules of Hooks
  const storedContactEmail = (website as any).contactEmail as
    | string
    | null
    | undefined;

  // ── Setup-Flow Status ─────────────────────────────────
  const addOns = (subscription?.addOns ?? {}) as Record<string, boolean>;
  const slugDone = !website.slug.startsWith("preview-");
  const emailDone = !addOns.contactForm || !!(website as any).contactEmail;
  // v2 legt Impressum/Datenschutz unter websiteData.legal.* ab, v1-Bestand
  // (falls noch vorhanden) top-level — siehe Cutover-Spec §1.6.
  const legalDone =
    (!!websiteData?.legal?.impressumHtml &&
      !!websiteData?.legal?.datenschutzHtml) ||
    (!!websiteData?.impressumHtml && !!websiteData?.datenschutzHtml);
  const liveDone = website.status === "active";
  const allDone = slugDone && emailDone && legalDone && liveDone;

  // Initialise slugInput when setupOpen opens for step 0
  function slugifyFE(text: string): string {
    return text
      .toLowerCase()
      .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] || m)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }
  const suggestedSlug = slugifyFE(business?.name || "");

  const openSetupStep = (idx: number) => {
    if (idx === 0 && !slugInput) setSlugInput(suggestedSlug);
    setSetupStepIdx(idx);
    setSetupOpen(true);
  };

  const unreadCount = submissionsData?.unreadCount ?? 0;

  const aiChatEnabled = !!(website as any).addOnAiChat;
  const bookingEnabled = !!(website as any).addOnBooking;

  const tabs: {
    id: Tab;
    label: string;
    icon: ReactNode;
    badge?: number;
  }[] = [
    { id: "preview", label: "Vorschau", icon: <Globe className="w-4 h-4" /> },
    {
      id: "settings",
      label: "Einstellungen",
      icon: <Settings className="w-4 h-4" />,
    },
    { id: "addons", label: "Add-ons", icon: <Sparkles className="w-4 h-4" /> },
    { id: "domain", label: "Domain", icon: <Globe className="w-4 h-4" /> },
    {
      id: "submissions",
      label: "Anfragen",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadCount,
    },
    ...(aiChatEnabled
      ? [
          {
            id: "leads" as Tab,
            label: "Chat-Leads",
            icon: <Users className="w-4 h-4" />,
          },
        ]
      : []),
    ...(bookingEnabled
      ? [
          {
            id: "appointments" as Tab,
            label: "Termine",
            icon: <CalendarDays className="w-4 h-4" />,
          },
        ]
      : []),
    {
      id: "analytics",
      label: "Statistiken",
      icon: <BarChart2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-lp-canvas text-lp-ink pb-dash">
      {/* Header */}
      <header className="border-b border-lp-line bg-lp-surface/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="pb-dash-mark" aria-hidden="true">
              ↯
            </div>
            <div>
              <h1 className="text-lp-ink font-bold text-lg leading-tight">
                Meine Website
              </h1>
              <p className="text-lp-muted text-xs">
                Verwalte und bearbeite deine Website
              </p>
            </div>
          </div>
          {myWebsites.length > 1 && (
            <select
              value={selectedWebsiteId || myWebsites[0].website.id}
              onChange={e => setSelectedWebsiteId(Number(e.target.value))}
              className="bg-lp-canvas text-lp-ink text-sm px-3 py-2 rounded-lg border border-lp-line outline-none"
            >
              {myWebsites.map(e => (
                <option key={e.website.id} value={e.website.id}>
                  {e.business?.name || e.website.slug}
                </option>
              ))}
            </select>
          )}
          <StatusBadge status={website.status} />
          {website.status === "active" && (
            <a
              href={`https://${website.slug}.pageblitz.de`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-lp-accent hover:bg-lp-accent/90 text-white text-sm px-4 py-2 rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Website öffnen
            </a>
          )}
          {previewToken ? (
            <a
              href={`/onboarding/${previewToken}`}
              className="flex items-center gap-2 bg-lp-accent hover:bg-lp-accent/90 text-white text-sm px-4 py-2 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Im Studio bearbeiten
            </a>
          ) : (
            <span
              title="Kein Studio-Zugang gefunden — bitte Support kontaktieren."
              className="flex items-center gap-2 bg-lp-canvas text-lp-muted text-sm px-4 py-2 rounded-xl cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Studio nicht verfügbar
            </span>
          )}
          <a
            href="/my-account"
            className="flex items-center gap-2 bg-lp-canvas hover:bg-lp-canvas text-lp-ink text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <User className="w-4 h-4" />
            Mein Konto
          </a>
        </div>
      </header>

      {isAdminDemo && (
        <div className="border-b border-amber-400/30 bg-amber-400/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
            <p className="text-sm text-amber-900">
              <strong>Admin-Demo:</strong> Diese Website ist deine isolierte
              Testumgebung. Änderungen betreffen keine Kunden.
            </p>
            <a
              href="/admin"
              className="text-sm font-medium text-amber-800 underline underline-offset-4 hover:text-lp-ink"
            >
              Zurück zum Adminbereich
            </a>
          </div>
        </div>
      )}

      {/* ── Setup-Checkliste Banner (sticky, direkt unter dem Header) ── */}
      {!allDone && !setupOpen && (
        <div className="sticky top-[65px] z-10 bg-lp-accent/10 backdrop-blur-sm border-b border-lp-accent/20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 mr-1">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-lp-ink text-xs font-semibold">
                Website einrichten
              </span>
            </div>
            <div className="w-px h-4 bg-lp-accent/30" />
            <StepChip
              done={slugDone}
              label="Subdomain"
              onClick={() => openSetupStep(0)}
            />
            {addOns.contactForm && (
              <StepChip
                done={emailDone}
                label="Kontakt-E-Mail"
                onClick={() => openSetupStep(1)}
              />
            )}
            <StepChip
              done={legalDone}
              label="Impressum & Datenschutz"
              onClick={() => openSetupStep(addOns.contactForm ? 2 : 1)}
            />
            <StepChip
              done={liveDone}
              label="Live schalten"
              onClick={() => openSetupStep(addOns.contactForm ? 3 : 2)}
            />
            <button
              onClick={() =>
                openSetupStep(
                  !slugDone
                    ? 0
                    : addOns.contactForm && !emailDone
                      ? 1
                      : !legalDone
                        ? addOns.contactForm
                          ? 2
                          : 1
                        : addOns.contactForm
                          ? 3
                          : 2
                )
              }
              className="ml-auto text-xs bg-lp-accent text-white hover:bg-lp-accent/90 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Einrichten →
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tab Navigation (icon + label, scrollable) */}
      <div className="lg:hidden border-b border-lp-line bg-lp-surface overflow-x-auto scrollbar-hide">
        <div className="flex px-2 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.history.replaceState(null, "", `?tab=${tab.id}`);
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-lp-accent border-lp-accent"
                  : "text-lp-muted border-transparent hover:text-lp-ink"
              }`}
            >
              <span className="[&>svg]:w-4 [&>svg]:h-4">{tab.icon}</span>
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute mt-[-2px] ml-3 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-lp-ink text-[9px] font-bold leading-none">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: sidebar (desktop) + content */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <nav className="hidden lg:flex flex-col w-52 flex-shrink-0 bg-lp-surface border-r border-lp-line min-h-[calc(100vh-120px)]">
          <div className="p-3 space-y-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.replaceState(null, "", `?tab=${tab.id}`);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-lp-accent/10 text-lp-accent"
                    : "text-lp-muted hover:text-lp-ink hover:bg-lp-surface"
                }`}
              >
                {tab.icon}
                <span className="flex-1">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-rose-500 text-lp-ink text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0 px-4 lg:px-6 py-4 lg:py-6">
          {/* Preview Tab */}
          {activeTab === "preview" &&
            (previewToken ? (
              <PreviewTab
                slug={website.slug}
                status={website.status}
                previewToken={previewToken}
                reloadKey={previewKey}
              />
            ) : (
              <div className="bg-lp-surface border border-lp-line rounded-2xl p-5 text-lp-muted text-sm">
                Kein Studio-Zugang gefunden — bitte Support kontaktieren.
              </div>
            ))}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Kontaktdaten — Telefon/E-Mail/Adresse sind Website-Inhalt
                  (websiteData.sections[type=contact]) und gehören ins Studio;
                  es gibt (noch) kein Studio-Panel dafür (bekannte Lücke, siehe
                  Task-4-Bericht) — die alte Karte hier schrieb v1-Felder auf
                  der `business`-Tabelle, die v2-Websites nie gelesen haben. */}

              {/* Pageblitz Branding */}
              {subscription && (
                <div className="bg-lp-surface border border-lp-line rounded-2xl p-5">
                  <h2 className="text-lp-ink font-semibold flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-lp-muted" />
                    Pageblitz-Branding
                  </h2>
                  <p className="text-lp-muted text-xs mb-4">
                    Steuere, ob ein kleiner Hinweis auf Pageblitz im Footer
                    deiner Website erscheint.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={(website as any).showBranding !== false}
                        onChange={e => {
                          updateShowBrandingMutation.mutate({
                            websiteId: website.id,
                            showBranding: e.target.checked,
                          });
                        }}
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${(website as any).showBranding !== false ? "bg-lp-accent" : "bg-lp-line"}`}
                        onClick={() => {
                          const current =
                            (website as any).showBranding !== false;
                          updateShowBrandingMutation.mutate({
                            websiteId: website.id,
                            showBranding: !current,
                          });
                        }}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${(website as any).showBranding !== false ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-lp-ink text-sm font-medium">
                        Pageblitz-Branding im Footer anzeigen
                      </span>
                      <p className="text-lp-muted text-xs mt-0.5">
                        Zeigt einen kleinen "Erstellt mit Pageblitz"-Link im
                        Footer deiner Website.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Add-ons Tab */}
          {activeTab === "addons" && (
            <div className="bg-lp-surface border border-lp-line rounded-2xl p-5">
              <h2 className="text-lp-ink font-semibold flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-lp-accent" />
                Add-ons
              </h2>
              {!previewToken ? (
                <div className="text-lp-muted text-sm">
                  Kein Studio-Zugang gefunden — bitte Support kontaktieren.
                </div>
              ) : onboardingData !== undefined || onboardingDataError ? (
                <AddonsTab
                  websiteId={website.id}
                  website={website}
                  onboarding={onboardingData ?? null}
                  previewToken={previewToken}
                  onUpdate={handleUpdate}
                  purchasedAddOns={
                    (subscription?.addOns ?? {}) as Record<string, boolean>
                  }
                  businessEmail={business?.email}
                />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-lp-muted" />
                </div>
              )}
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === "leads" && (
            <ChatLeadsTab
              websiteId={website.id}
              website={website}
              onGoToAddons={() => setActiveTab("addons")}
            />
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <AppointmentsTab
              websiteId={website.id}
              onGoToAddons={() => setActiveTab("addons")}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-lp-accent" />
                </div>
              ) : analyticsStats ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Seitenaufrufe",
                        value: analyticsStats.pageviews.toLocaleString("de-DE"),
                        icon: (
                          <MousePointerClick className="w-5 h-5 text-lp-accent" />
                        ),
                        color: "text-lp-accent",
                      },
                      {
                        label: "Besucher",
                        value: analyticsStats.visitors.toLocaleString("de-DE"),
                        icon: <Users className="w-5 h-5 text-lp-accent" />,
                        color: "text-lp-accent",
                      },
                      {
                        label: "Absprungrate",
                        value: `${analyticsStats.bounceRate} %`,
                        icon: <BarChart2 className="w-5 h-5 text-amber-400" />,
                        color: "text-amber-400",
                      },
                      {
                        label: "Ø Verweildauer",
                        value: `${Math.floor(analyticsStats.avgDuration / 60)}:${String(analyticsStats.avgDuration % 60).padStart(2, "0")} Min`,
                        icon: <Clock className="w-5 h-5 text-green-400" />,
                        color: "text-green-400",
                      },
                    ].map(stat => (
                      <div
                        key={stat.label}
                        className="bg-lp-surface border border-lp-line rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {stat.icon}
                          <span className="text-lp-muted text-xs font-medium uppercase tracking-wider">
                            {stat.label}
                          </span>
                        </div>
                        <div className={`text-3xl font-bold ${stat.color}`}>
                          {stat.value}
                        </div>
                        <div className="text-lp-muted text-xs mt-1">
                          Letzte 30 Tage
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-lp-surface border border-lp-line rounded-2xl p-5">
                    <p className="text-lp-muted text-sm">
                      Diese Statistiken werden von{" "}
                      <span className="text-lp-ink font-medium">
                        Umami Analytics
                      </span>{" "}
                      erfasst – cookielos, DSGVO-konform, keine persönlichen
                      Daten.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-lp-surface border border-lp-line rounded-2xl p-10 text-center">
                  <BarChart2 className="w-12 h-12 text-lp-muted mx-auto mb-4" />
                  <h3 className="text-lp-ink font-semibold mb-2">
                    Noch keine Statistiken verfügbar
                  </h3>
                  <p className="text-lp-muted text-sm max-w-sm mx-auto">
                    Analytics werden aktiviert, sobald deine Website live ist
                    und die ersten Besucher kommen.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Domain Tab */}
          {activeTab === "domain" && website && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lp-ink text-lg font-semibold">
                  Domain & Adresse
                </h2>
                <p className="text-lp-muted text-sm mt-0.5">
                  Verwalte die Web-Adresse deiner Website.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subdomain */}
                <div className="bg-lp-surface border border-lp-line rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-lp-accent/15 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-lp-accent" />
                    </div>
                    <div>
                      <p className="text-lp-ink text-sm font-semibold">
                        Pageblitz-Subdomain
                      </p>
                      <p className="text-lp-muted text-xs">
                        Kostenlos inklusive
                      </p>
                    </div>
                  </div>

                  {/* Current URL display */}
                  <div className="flex items-center gap-2 bg-lp-canvas rounded-xl px-4 py-2.5 border border-lp-line">
                    <Globe className="w-3.5 h-3.5 text-lp-muted shrink-0" />
                    <a
                      href={`https://${website.slug}.pageblitz.de`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lp-accent hover:text-lp-accent text-sm font-mono transition-colors truncate"
                    >
                      {website.slug}.pageblitz.de
                    </a>
                    <ExternalLink className="w-3.5 h-3.5 text-lp-muted ml-auto shrink-0" />
                  </div>

                  {/* Slug change */}
                  <div className="space-y-2">
                    <label className="text-lp-muted text-xs font-medium uppercase tracking-wide">
                      Subdomain ändern
                    </label>
                    <div className="flex items-center gap-2 bg-lp-canvas border border-lp-line rounded-xl px-4 py-3 focus-within:border-lp-accent transition-colors">
                      <input
                        type="text"
                        value={domainTabSlugInput || website.slug}
                        onChange={e => {
                          setDomainTabSlugSaved(false);
                          setDomainTabSlugInput(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "")
                              .replace(/^-+/, "")
                          );
                        }}
                        className="flex-1 bg-transparent text-lp-ink outline-none text-sm font-mono"
                      />
                      <span className="text-lp-muted text-sm whitespace-nowrap">
                        .pageblitz.de
                      </span>
                    </div>
                    {domainTabSlugInput.length >= 3 &&
                      domainTabSlugInput !== website.slug && (
                        <p
                          className={`text-xs flex items-center gap-1.5 ${
                            domainSlugChecking
                              ? "text-lp-muted"
                              : domainSlugCheck?.available
                                ? "text-lp-accent"
                                : "text-red-400"
                          }`}
                        >
                          {domainSlugChecking
                            ? "⏳ Prüfe Verfügbarkeit..."
                            : domainSlugCheck?.available
                              ? "✓ Verfügbar"
                              : "✗ Bereits vergeben"}
                        </p>
                      )}
                    {domainTabSlugSaved && (
                      <p className="text-xs text-lp-accent flex items-center gap-1">
                        ✓ Subdomain gespeichert
                      </p>
                    )}
                    <button
                      disabled={
                        !domainTabSlugInput ||
                        domainTabSlugInput === website.slug ||
                        domainTabSlugInput.length < 3 ||
                        (!domainSlugCheck?.available &&
                          domainTabSlugInput !== website.slug) ||
                        domainSlugChecking ||
                        updateSlugMutation.isPending
                      }
                      onClick={async () => {
                        await updateSlugMutation.mutateAsync({
                          websiteId: website.id,
                          slug: domainTabSlugInput,
                        });
                        setDomainTabSlugSaved(true);
                        toast.success("Subdomain gespeichert");
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-lp-accent hover:bg-lp-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-lp-ink transition-colors"
                    >
                      {updateSlugMutation.isPending
                        ? "Speichern..."
                        : "Subdomain speichern"}
                    </button>
                  </div>
                </div>

                {/* Custom Domain */}
                <div className="bg-lp-surface border border-lp-line rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowCustomDomainInfo(v => !v)}
                    className="w-full flex items-center gap-3 p-5 text-left hover:bg-lp-canvas transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-lp-accent/15 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4 text-lp-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lp-ink text-sm font-semibold">
                        Eigene Domain verbinden
                      </p>
                      <p className="text-lp-muted text-xs">
                        z.B. www.mein-unternehmen.de
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-lp-muted transition-transform ${showCustomDomainInfo ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showCustomDomainInfo && (
                    <div className="px-5 pb-5 space-y-3 border-t border-lp-line pt-4">
                      <p className="text-lp-ink/80 text-sm">
                        Setze diesen CNAME-Eintrag bei deinem Domain-Anbieter
                        (IONOS, Strato, GoDaddy, etc.):
                      </p>
                      <div className="space-y-2 bg-lp-canvas rounded-xl p-4">
                        {[
                          { label: "Typ", value: "CNAME" },
                          { label: "Name", value: "www" },
                          { label: "Ziel", value: "pageblitz.de" },
                          { label: "TTL", value: "3600" },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between"
                          >
                            <span className="text-lp-muted text-xs w-12">
                              {label}
                            </span>
                            <span className="text-lp-ink text-xs font-mono bg-lp-surface px-3 py-1 rounded-lg">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-amber-300 text-xs">
                          ⏱ DNS-Änderungen können bis zu 24 Stunden dauern, bis
                          sie wirksam sind.
                        </p>
                      </div>
                      <p className="text-lp-muted text-xs">
                        Nach dem Setzen des CNAME-Eintrags melde dich beim
                        Support — wir schalten die Domain für dich frei.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* end grid */}
            </div>
          )}

          {/* Submissions (Anfragen) Tab */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lp-ink text-lg font-semibold">
                    {showArchivedSubmissions
                      ? "Archivierte Anfragen"
                      : "Kontaktanfragen"}
                  </h2>
                  <p className="text-lp-muted text-sm mt-0.5">
                    {submissionsData?.submissions.length ?? 0}{" "}
                    {showArchivedSubmissions ? "archivierte" : "aktive"}{" "}
                    Anfragen
                    {!showArchivedSubmissions && unreadCount > 0 && (
                      <span className="ml-2 text-rose-400 font-medium">
                        · {unreadCount} ungelesen
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Archive toggle */}
                  <button
                    onClick={() => setShowArchivedSubmissions(v => !v)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      showArchivedSubmissions
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                        : "bg-lp-surface border-lp-line text-lp-muted hover:text-lp-ink hover:border-lp-ink/30"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {showArchivedSubmissions ? "Aktive anzeigen" : "Archiv"}
                  </button>
                  {/* Custom recipient email */}
                  {!showArchivedSubmissions && (
                    <div className="flex items-center gap-2 bg-lp-surface border border-lp-line rounded-xl px-3 py-2">
                      <Mail className="w-4 h-4 text-lp-muted shrink-0" />
                      <input
                        type="email"
                        value={contactEmailInput}
                        onChange={e => setContactEmailInput(e.target.value)}
                        placeholder={
                          business?.email || "Empfänger-E-Mail eintragen..."
                        }
                        className="bg-transparent text-sm text-lp-ink placeholder:text-lp-muted outline-none w-48"
                      />
                      <button
                        onClick={() =>
                          updateContactEmailMutation.mutate({
                            websiteId: website.id,
                            contactEmail: contactEmailInput,
                          })
                        }
                        disabled={updateContactEmailMutation.isPending}
                        className="text-xs font-medium text-lp-accent hover:text-lp-accent transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        {contactEmailSaved ? "✓ Gespeichert" : "Speichern"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {submissionsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-lp-accent" />
                </div>
              ) : !submissionsData?.submissions.length ? (
                <div className="bg-lp-surface border border-lp-line rounded-2xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-lp-muted mx-auto mb-4" />
                  <h3 className="text-lp-ink font-semibold mb-2">
                    {showArchivedSubmissions
                      ? "Keine archivierten Anfragen"
                      : "Noch keine Anfragen"}
                  </h3>
                  <p className="text-lp-muted text-sm max-w-sm mx-auto">
                    {showArchivedSubmissions
                      ? "Archivierte Anfragen erscheinen hier."
                      : "Wenn Besucher das Kontaktformular auf deiner Website ausfüllen, erscheinen die Anfragen hier."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionsData.submissions.map(sub => {
                    const isUnread = !sub.readAt;
                    const isDeleting = deleteConfirmId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        className={`bg-lp-surface border rounded-2xl p-5 transition-colors ${
                          showArchivedSubmissions
                            ? "border-lp-line/70 opacity-75"
                            : isUnread
                              ? "border-lp-accent/40 bg-lp-surface"
                              : "border-lp-line"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              {isUnread && !showArchivedSubmissions && (
                                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                              )}
                              <span className="text-lp-ink font-semibold truncate">
                                {sub.name}
                              </span>
                              <span className="text-lp-muted text-xs shrink-0">
                                {new Date(sub.createdAt).toLocaleDateString(
                                  "de-DE",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 mb-3">
                              <a
                                href={`mailto:${sub.email}`}
                                className="flex items-center gap-1.5 text-lp-accent hover:text-lp-accent text-sm transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                {sub.email}
                              </a>
                              {sub.phone && (
                                <a
                                  href={`tel:${sub.phone}`}
                                  className="flex items-center gap-1.5 text-lp-muted hover:text-lp-ink text-sm transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  {sub.phone}
                                </a>
                              )}
                            </div>
                            <p className="text-lp-ink/80 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                              {sub.message}
                            </p>
                            {typeof sub.customFields === "object" &&
                            sub.customFields &&
                            !Array.isArray(sub.customFields)
                              ? Object.entries(
                                  sub.customFields as Record<string, unknown>
                                ).map(([label, value]) =>
                                  String(value ?? "").trim() ? (
                                    <p
                                      key={label}
                                      className="mt-2 text-xs text-lp-muted"
                                    >
                                      <span className="font-medium text-lp-ink">
                                        {label}:
                                      </span>{" "}
                                      {String(value)}
                                    </p>
                                  ) : null
                                )
                              : null}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {!showArchivedSubmissions ? (
                              <>
                                <a
                                  href={`mailto:${sub.email}?subject=Re: Kontaktanfrage`}
                                  className="flex items-center gap-1.5 bg-lp-accent hover:bg-lp-accent/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                  Antworten
                                </a>
                                {isUnread && (
                                  <button
                                    onClick={() =>
                                      markReadMutation.mutate({
                                        submissionId: sub.id,
                                      })
                                    }
                                    className="text-lp-muted hover:text-lp-ink/80 text-xs transition-colors"
                                  >
                                    Als gelesen markieren
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    archiveMutation.mutate({
                                      submissionId: sub.id,
                                      archive: true,
                                    })
                                  }
                                  disabled={archiveMutation.isPending}
                                  className="flex items-center gap-1 text-lp-muted hover:text-amber-400 text-xs transition-colors disabled:opacity-40"
                                  title="Archivieren"
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  Archivieren
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    archiveMutation.mutate({
                                      submissionId: sub.id,
                                      archive: false,
                                    })
                                  }
                                  disabled={archiveMutation.isPending}
                                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors disabled:opacity-40"
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  Wiederherstellen
                                </button>
                                {isDeleting ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-lp-muted">
                                      Sicher?
                                    </span>
                                    <button
                                      onClick={() =>
                                        deleteMutation.mutate({
                                          submissionId: sub.id,
                                        })
                                      }
                                      disabled={deleteMutation.isPending}
                                      className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
                                    >
                                      Ja, löschen
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="text-xs text-lp-muted hover:text-lp-ink/80 transition-colors"
                                    >
                                      Abbrechen
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(sub.id)}
                                    className="flex items-center gap-1 text-lp-muted hover:text-red-400 text-xs transition-colors"
                                    title="Endgültig löschen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Löschen
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {/* end flex-1 content */}
      </div>
      {/* end flex row (sidebar + content) */}

      {/* ── Setup-Modal ── */}
      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lp-ink/50 backdrop-blur-sm">
          <div className="bg-lp-surface border border-lp-line rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-lp-line">
              <div>
                <h2 className="text-lp-ink font-bold text-lg">
                  Website einrichten
                </h2>
                <p className="text-lp-muted text-sm mt-0.5">
                  Schritt {setupStepIdx + 1} von {addOns.contactForm ? 4 : 3}
                </p>
              </div>
              <button
                onClick={() => setSetupOpen(false)}
                className="text-lp-muted hover:text-lp-ink transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Step 0 – Subdomain wählen */}
            {setupStepIdx === 0 && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🌐</div>
                  <h3 className="text-lp-ink font-semibold text-lg">
                    Deine Website-Adresse
                  </h3>
                  <p className="text-lp-muted text-sm mt-1">
                    Wähle eine einfache, einprägsame Adresse für deine Website.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-lp-muted text-xs font-medium uppercase tracking-wide">
                    Subdomain
                  </label>
                  <div className="flex items-center gap-2 bg-lp-canvas border border-lp-line rounded-xl px-4 py-3 focus-within:border-lp-accent transition-colors">
                    <input
                      type="text"
                      value={slugInput}
                      onChange={e =>
                        setSlugInput(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                            .replace(/^-+/, "")
                        )
                      }
                      placeholder={suggestedSlug || "mein-unternehmen"}
                      className="flex-1 bg-transparent text-lp-ink outline-none text-sm"
                      autoFocus
                    />
                    <span className="text-lp-muted text-sm whitespace-nowrap">
                      .pageblitz.de
                    </span>
                  </div>
                  {slugInput.length >= 3 && (
                    <p
                      className={`text-xs flex items-center gap-1.5 ${
                        slugChecking
                          ? "text-lp-muted"
                          : slugCheck?.available
                            ? "text-lp-accent"
                            : "text-red-400"
                      }`}
                    >
                      {slugChecking
                        ? "⏳ Prüfe Verfügbarkeit..."
                        : slugCheck?.available
                          ? "✓ Verfügbar"
                          : "✗ Bereits vergeben – anderen Namen wählen"}
                    </p>
                  )}
                  {slugInput.length > 0 && slugInput.length < 3 && (
                    <p className="text-xs text-lp-muted">
                      Mindestens 3 Zeichen
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSetupOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm text-lp-muted hover:text-lp-ink border border-lp-line hover:border-lp-ink/40 transition-colors"
                  >
                    Später
                  </button>
                  <button
                    disabled={
                      !slugCheck?.available ||
                      slugInput.length < 3 ||
                      updateSlugMutation.isPending
                    }
                    onClick={async () => {
                      await updateSlugMutation.mutateAsync({
                        websiteId: website.id,
                        slug: slugInput,
                      });
                      setSetupStepIdx(1);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-lp-accent hover:bg-lp-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-lp-ink transition-colors"
                  >
                    {updateSlugMutation.isPending
                      ? "Speichern..."
                      : "Übernehmen →"}
                  </button>
                </div>
                {/* Eigene Domain – subtiler Accordion-Hinweis */}
                <div className="border-t border-lp-line pt-3 mt-1">
                  <button
                    onClick={() => setShowDomainHint(v => !v)}
                    className="flex items-center gap-2 text-xs text-lp-muted hover:text-lp-ink/80 transition-colors w-full text-left"
                  >
                    <span>🔗</span>
                    <span>
                      Du hast bereits eine Domain? So verbindest du sie
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 ml-auto transition-transform ${showDomainHint ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showDomainHint && (
                    <div className="mt-3 bg-lp-canvas rounded-xl p-4 space-y-2">
                      <p className="text-lp-ink/80 text-xs font-medium mb-2">
                        CNAME-Eintrag bei deinem DNS-Anbieter setzen:
                      </p>
                      {[
                        { label: "Typ", value: "CNAME" },
                        { label: "Name", value: "www" },
                        { label: "Ziel", value: "pageblitz.de" },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between bg-lp-surface rounded-lg px-3 py-1.5"
                        >
                          <span className="text-lp-muted text-xs">{label}</span>
                          <span className="text-lp-ink text-xs font-mono">
                            {value}
                          </span>
                        </div>
                      ))}
                      <p className="text-lp-muted text-xs text-center pt-1">
                        DNS-Änderungen können bis zu 24h dauern
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1 – Kontakt-E-Mail (nur wenn contactForm Add-on) */}
            {setupStepIdx === 1 && addOns.contactForm && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">📧</div>
                  <h3 className="text-lp-ink font-semibold text-lg">
                    Kontaktformular-E-Mail
                  </h3>
                  <p className="text-lp-muted text-sm mt-1">
                    Wohin sollen Kundenanfragen aus deinem Kontaktformular
                    gesendet werden?
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-lp-muted text-xs font-medium uppercase tracking-wide">
                    Empfänger-E-Mail
                  </label>
                  <input
                    ref={contactEmailRef}
                    type="email"
                    defaultValue={contactEmailInput}
                    onChange={e => setContactEmailInput(e.target.value)}
                    onInput={e =>
                      setContactEmailInput((e.target as HTMLInputElement).value)
                    }
                    placeholder="deine@email.de"
                    className="w-full bg-lp-canvas border border-lp-line rounded-xl px-4 py-3 text-lp-ink text-sm outline-none focus:border-lp-accent transition-colors"
                    autoComplete="off"
                    autoFocus
                    id="setup-contact-email"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSetupStepIdx(2)}
                    className="flex-1 py-2.5 rounded-xl text-sm text-lp-muted hover:text-lp-ink border border-lp-line hover:border-lp-ink/40 transition-colors"
                  >
                    Überspringen
                  </button>
                  <button
                    disabled={updateContactEmailMutation.isPending}
                    onClick={async () => {
                      const val =
                        contactEmailRef.current?.value || contactEmailInput;
                      if (!val.trim()) {
                        toast.error("Bitte eine E-Mail-Adresse eingeben.");
                        return;
                      }
                      try {
                        await updateContactEmailMutation.mutateAsync({
                          websiteId: website.id,
                          contactEmail: val.trim(),
                        });
                        setContactEmailInput(val.trim());
                        setSetupStepIdx(2);
                      } catch {
                        /* onError handler shows toast */
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-lp-accent hover:bg-lp-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-lp-ink transition-colors"
                  >
                    {updateContactEmailMutation.isPending
                      ? "Speichern..."
                      : "Speichern →"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 (contactForm) / Step 1 (no contactForm) – Impressum & Datenschutz */}
            {setupStepIdx === (addOns.contactForm ? 2 : 1) && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-lp-ink font-semibold text-lg">
                    Impressum & Datenschutz
                  </h3>
                  <p className="text-lp-muted text-sm mt-1">
                    Gesetzlich vorgeschrieben. Gib den Namen des Inhabers an –
                    dauert 30 Sekunden.
                  </p>
                </div>
                {legalDone ? (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <span className="text-lp-accent text-xl">✓</span>
                    <div>
                      <p className="text-lp-accent text-sm font-medium">
                        Impressum & Datenschutz hinterlegt
                      </p>
                      <p className="text-lp-muted text-xs mt-0.5">
                        Erreichbar unter /impressum und /datenschutz
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-lp-muted text-sm">
                      Die Impressum-Angaben trägst du im Studio ein — dort
                      erscheinen Impressum und Datenschutzerklärung sofort in
                      der Vorschau.
                    </p>
                    {previewToken ? (
                      <a
                        href={`/onboarding/${previewToken}?panel=legal`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-lp-accent hover:bg-lp-accent/90 text-white transition-colors"
                      >
                        Im Studio ausfüllen →
                      </a>
                    ) : (
                      <p className="text-lp-muted text-xs">
                        Kein Studio-Zugang gefunden — bitte Support
                        kontaktieren.
                      </p>
                    )}
                    <button
                      onClick={() => refetch()}
                      className="w-full py-2 rounded-xl text-sm text-lp-muted hover:text-lp-ink border border-lp-line hover:border-lp-ink/40 transition-colors"
                    >
                      Ich hab's erledigt – aktualisieren
                    </button>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  {legalDone && (
                    <button
                      onClick={() =>
                        setSetupStepIdx(addOns.contactForm ? 3 : 2)
                      }
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-lp-accent hover:bg-lp-accent/90 text-white transition-colors"
                    >
                      Weiter →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Final Step – Live schalten */}
            {setupStepIdx === (addOns.contactForm ? 3 : 2) && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-lp-ink font-semibold text-lg">
                    Deine Website ist bereit!
                  </h3>
                  <p className="text-lp-muted text-sm mt-1">
                    Schalte deine Website jetzt live. Sie wird öffentlich
                    erreichbar unter:
                  </p>
                  <p className="text-lp-accent text-sm font-mono mt-2">
                    {website.slug}.pageblitz.de
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Subdomain", done: slugDone },
                    ...(addOns.contactForm
                      ? [{ label: "Kontakt-E-Mail", done: emailDone }]
                      : []),
                    { label: "Impressum & Datenschutz", done: legalDone },
                  ].map(({ label, done }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 text-sm ${done ? "text-lp-accent" : "text-amber-400"}`}
                    >
                      <span>{done ? "✓" : "⚠"}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                {!legalDone && (
                  <p className="text-amber-400 text-xs text-center bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                    ⚠ Impressum & Datenschutz fehlen noch – bitte erst
                    generieren (vorheriger Schritt)
                  </p>
                )}
                <button
                  disabled={setLiveMutation.isPending || !legalDone}
                  onClick={() =>
                    setLiveMutation.mutateAsync({ websiteId: website.id })
                  }
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-lp-ink transition-all shadow-lg shadow-emerald-900/30"
                >
                  {setLiveMutation.isPending
                    ? "Wird live geschaltet..."
                    : "⚡ Website jetzt live schalten"}
                </button>
              </div>
            )}

            {/* Step-Dots */}
            <div className="flex justify-center gap-2 pb-4">
              {Array.from({ length: addOns.contactForm ? 4 : 3 }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === setupStepIdx
                        ? "bg-blue-400 w-4"
                        : i < setupStepIdx
                          ? "bg-emerald-400"
                          : "bg-lp-line"
                    }`}
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}
      <HelpWidget />
    </div>
  );
}
