import { Redirect, Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { BrandMark } from "@/components/landing/primitives";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  initConsent,
  trackMetaPageView,
  hasMarketingConsent,
} from "./lib/consent";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import { AdminRoute, CustomerRoute } from "./components/ProtectedRoute";

// ── App-Shell-Teile, die "/" nicht für den ersten Paint braucht (B6 Task 8) ──
// Toaster (sonner, ~34 kB unminifiziert) wird nur von Dashboard/Studio/Admin
// per `toast()` gefüttert — die Landingpage zeigt nie einen Toast. Das Cookie-
// Banner blendet sich ohnehin erst nach dem Mount ein; NotFound und die beiden
// Rechtstexte (Datenschutz allein ~28 kB) waren eager im Entry und damit auf
// JEDER Route mit dabei. Alle vier laden jetzt als eigene Chunks — der Entry-
// Chunk von "/" ist ausschließlich Bootstrap + Landing.
const Toaster = lazy(() =>
  import("@/components/ui/sonner").then(m => ({ default: m.Toaster }))
);
const PageblitzCookieBanner = lazy(
  () => import("./components/PageblitzCookieBanner")
);
const NotFound = lazy(() => import("@/pages/NotFound"));
const PageblitzImpressum = lazy(() => import("./pages/PageblitzImpressum"));
const PageblitzDatenschutz = lazy(() => import("./pages/PageblitzDatenschutz"));

// ── Lazy-loaded pages (not needed on first paint) ─────────────────────────────
// StartPage/SitePage/LegalPage waren bis Task 6 eager importiert und zwangen
// dadurch JEDE Route (auch "/admin", "/onboarding/:token", ...) dazu, ihren
// Code mitzuladen. lazy() gibt jeder dieser Routen ihren eigenen Chunk.
// LandingPage bleibt bewusst eager: ein erster Messversuch mit lazy(Landing)
// zeigte eine deutliche LCP-Regression auf "/" (Lighthouse mobil 3,2 s →
// 5,6 s, Task-6-Bericht) — React.lazy() fügt für "/" selbst eine zusätzliche
// Netzwerk-Rundreise ein (Entry laden+parsen+ausführen, ERST DANACH wird der
// dynamische import() der Landing-Chunk-URL überhaupt entdeckt; Vite kann für
// client-seitig zur Laufzeit gewählte lazy()-Routen kein modulepreload in die
// statische index.html schreiben). Für "/" selbst bringt lazy(Landing) also
// keinen Netto-Vorteil (die Route braucht den Chunk ohnehin sofort), nur den
// Nachteil der zusätzlichen Rundreise — anders als bei Start/Site/Legal, die
// auf "/" gar nicht gebraucht werden.
// B6 Task 8 hat die Alternative "lazy(Landing) + <link rel=modulepreload>"
// geprüft und verworfen: Vite kann den gehashten Landing-Chunk nicht in die
// statische index.html preloaden (nur ein eigenes Build-Plugin könnte den
// Hash eintragen), und der Gewinn wäre null — "/" braucht den Chunk sofort,
// der Entry-Chunk besteht seit Task 8 ohnehin nur noch aus Bootstrap
// (tRPC/react-query/superjson/wouter) + Landing (~51 kB gzip), alles andere
// (Toaster, Cookie-Banner, NotFound, Rechtstexte, Chat-Widget) lädt lazy.
const StartPage = lazy(() => import("./pages/StartPage"));
const SitePage = lazy(() => import("./pages/SitePage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const Home = lazy(() => import("./pages/Home"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const WebsitesPage = lazy(() => import("./pages/WebsitesPage"));
const OutreachPage = lazy(() => import("./pages/OutreachPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));
const SupportChatsPage = lazy(() => import("./pages/SupportChatsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const CustomerLoginPage = lazy(() => import("./pages/CustomerLoginPage"));
const BusinessesPage = lazy(() => import("./pages/BusinessesPage"));
const WelcomeBack = lazy(() => import("./pages/WelcomeBack"));
const ErrorsPage = lazy(() => import("./pages/ErrorsPage"));
const LifecyclePage = lazy(() => import("./pages/LifecyclePage"));
const DesignReviewPage = lazy(() => import("./pages/DesignReviewPage"));
const StudioPage = lazy(() => import("./pages/onboarding-v2/StudioPage"));
const LegacyWebsiteRedirect = lazy(
  () => import("./pages/onboarding-v2/LegacyWebsiteRedirect")
);

function PageLoader({ inline = false }: { inline?: boolean }) {
  // Nachtschicht-Preloader (2026-08-30): pulsierender P-Blitz auf Kohle —
  // gleiche Welt wie Landing/Studio statt des alten hellen Kastens.
  return (
    <div
      className={`lp ${inline ? "min-h-64" : "fixed inset-0 min-h-screen"} flex items-center justify-center bg-lp-canvas p-6 text-lp-ink`}
      role="status"
      aria-label="Pageblitz wird geladen"
    >
      <div className="flex flex-col items-center">
        <span className="pb-loader-bolt" aria-hidden="true">
          <BrandMark className="h-14 w-auto text-lp-volt" />
        </span>
        <p className="lp-kicker mt-6">Einen Moment</p>
      </div>
    </div>
  );
}

// AdminSwitch lives INSIDE DashboardLayout and reads useLocation() itself.
// This guarantees the Suspense key={location} update happens within the same
// render tree as the location subscriber – no prop-threading through lazy
// DashboardLayout that might swallow the update.
function AdminSwitch() {
  const [location] = useLocation();
  return (
    <Suspense
      key={location}
      fallback={<PageLoader inline />}
    >
      <Switch>
        <Route path="/admin" component={Home} />
        <Route path="/admin/search" component={SearchPage} />
        <Route path="/admin/websites" component={WebsitesPage} />
        <Route path="/admin/outreach" component={OutreachPage} />
        <Route path="/admin/stats" component={StatsPage} />
        <Route path="/admin/leads" component={LeadsPage} />
        <Route path="/admin/businesses" component={BusinessesPage} />
        <Route path="/admin/users" component={UsersPage} />
        <Route path="/admin/pipeline" component={PipelinePage} />
        <Route path="/admin/support-chats" component={SupportChatsPage} />
        <Route path="/admin/errors" component={ErrorsPage} />
        <Route path="/admin/lifecycle" component={LifecyclePage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AdminRouter() {
  // DashboardLayout is wrapped in its own Suspense (no key) so it loads once
  // and stays mounted across admin sub-navigations. AdminSwitch inside
  // DashboardLayout reads useLocation() itself and owns the key={location}
  // Suspense – avoids prop-threading issues with lazy-loaded DashboardLayout.
  return (
    <AdminRoute>
      <Suspense fallback={<PageLoader />}>
        <DashboardLayout>
          <AdminSwitch />
        </DashboardLayout>
      </Suspense>
    </AdminRoute>
  );
}

// Reserved subdomains that should NOT be treated as customer sites
const RESERVED_SUBDOMAINS = ["www", "api", "analytics", "admin", "mail", "ftp"];

function getCustomerSubdomain(): string | null {
  const hostname = window.location.hostname;
  const match = hostname.match(/^([a-z0-9][a-z0-9-]*)\.pageblitz\.de$/);
  if (!match) return null;
  const sub = match[1];
  return RESERVED_SUBDOMAINS.includes(sub) ? null : sub;
}

function Router() {
  // Direct location subscription ensures this component re-renders on every
  // navigation – without it the Switch may not update if AppContent's cascade
  // gets deferred/batched by React 18 concurrent mode.
  const [location] = useLocation();
  void location; // used for reactivity only

  // Subdomain routing: schau-horch.pageblitz.de → render site directly
  // SitePage/LegalPage sind lazy() (Task 6) → Suspense-Boundary nötig, sonst
  // wirft React "component suspended while rendering, but no fallback".
  const customerSlug = getCustomerSubdomain();
  if (customerSlug) {
    return (
      <Suspense key={location} fallback={<PageLoader />}>
        <Switch>
          <Route path="/impressum">
            {() => <LegalPage forceSlug={customerSlug} />}
          </Route>
          <Route path="/datenschutz">
            {() => <LegalPage forceSlug={customerSlug} />}
          </Route>
          {/* Unterseiten-Add-on (Plan B6, Task 3): ein einzelnes Segment
              hinter der Subdomain-Root ist entweder die Startseite ("/",
              page === undefined) oder eine Unterseite ("/<slug>"). Die
              tatsächliche Existenz der Page prüft SitePage selbst
              (pageForPathname) und rendert sonst einen 404-Platzhalter. */}
          <Route path="/:page?">
            {params => (
              <SitePage forceSlug={customerSlug} pageSlug={params.page} />
            )}
          </Route>
          {/* Fallback für tiefer verschachtelte, garantiert ungültige Pfade
              (z. B. "/a/b") — rendert wie vor Task 3 die Startseite statt
              eines leeren Screens. */}
          <Route>{() => <SitePage forceSlug={customerSlug} />}</Route>
        </Switch>
      </Suspense>
    );
  }

  // Admin routes are rendered outside the key={location} Suspense so that
  // DashboardLayout stays mounted across sub-navigations (no sidebar flicker).
  // AdminRouter handles its own internal key={location} for page content only.
  if (location.startsWith("/admin") && !location.startsWith("/admin-login")) {
    return <AdminRouter />;
  }

  // key={location} forces Suspense to unmount/remount on every navigation.
  // Without it React 18 concurrent mode keeps the OLD page visible while
  // the new lazy component loads → URL changes but screen stays the same.
  return (
    <Suspense key={location} fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/impressum" component={PageblitzImpressum} />
        <Route path="/datenschutz" component={PageblitzDatenschutz} />
        <Route path="/start" component={StartPage} />
        {/* Interne Pack-Galerie — seit 2026-08-31 nur für Admins
            (Betreiber: „auf jeden Fall hinter Admin-Login"). */}
        <Route path="/design-review">
          {() => (
            <AdminRoute>
              <DesignReviewPage />
            </AdminRoute>
          )}
        </Route>
        <Route path="/welcome-back" component={WelcomeBack} />
        {/* /preview/:token wird serverseitig (302) auf /onboarding/:token weitergeleitet
            (siehe server/ssr/routes.ts, registerSsrRoutes) — läuft nie hier ein,
            eine SPA-Route bräuchte es nicht (Task 3, Cutover-Redirects). */}
        <Route path="/site/:slug">
          {params => <SitePage key={params.slug} />}
        </Route>
        <Route path="/site/:slug/impressum">
          {params => <LegalPage key={params.slug} />}
        </Route>
        <Route path="/site/:slug/datenschutz">
          {params => <LegalPage key={params.slug} />}
        </Route>
        {/* Unterseiten-Add-on (Plan B6, Task 3): muss NACH den beiden
            Legal-Routen stehen, sonst würde dieses generische Muster
            "impressum"/"datenschutz" auch abfangen (wouter matcht die erste
            passende Route in Deklarationsreihenfolge). */}
        <Route path="/site/:slug/:page">
          {params => (
            <SitePage
              key={`${params.slug}-${params.page}`}
              pageSlug={params.page}
            />
          )}
        </Route>
        {/* Legacy-Chat-Onboarding → Studio (Task 3, Cutover-Redirects) */}
        <Route path="/preview/:token/onboarding">
          {params => <Redirect to={`/onboarding/${params.token}`} />}
        </Route>
        <Route path="/websites/:id/onboarding">
          {params => <LegacyWebsiteRedirect id={parseInt(params.id || "0")} />}
        </Route>
        <Route path="/onboarding/:token">
          {params => <StudioPage token={params.token} />}
        </Route>
        <Route path="/my-website">
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        </Route>
        <Route path="/my-account">
          <CustomerRoute>
            <AccountPage />
          </CustomerRoute>
        </Route>
        <Route path="/login" component={CustomerLoginPage} />
        <Route path="/admin-login" component={LoginPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

/**
 * Lädt ggf. bereits erteilte Tracking-Einwilligungen beim App-Start
 * und blendet den Cookie-Banner auf PageBlitz-eigenen Seiten ein.
 * Auf Kunden-Websites (/site/:slug) wird der Banner nicht gezeigt –
 * dort hat der Betreiber seinen eigenen CookieBanner.
 */
/** Scrollt bei jedem Routenwechsel sofort nach oben (verhindert "Seite lädt nicht"-Bug) */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    // Direct property assignment is universally compatible (incl. iOS Safari,
    // which silently ignores behavior:"instant" and never resets the scroll).
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // legacy WebKit / iOS fallback
    window.scrollTo(0, 0); // virtual viewport fallback (iOS Safari)
  }, [location]);
  return null;
}

function AppContent() {
  const [location] = useLocation();

  // Bestehende Einwilligung beim ersten Render nachladen
  useEffect(() => {
    initConsent();
  }, []);

  // Meta Pixel PageView bei jedem SPA-Routenwechsel feuern
  useEffect(() => {
    if (hasMarketingConsent()) {
      trackMetaPageView();
    }
  }, [location]);

  // Kunden-Website-Routen: kein PageBlitz-Banner (auch bei Subdomain-Zugriff)
  const isCustomerSite =
    location.startsWith("/site/") || !!getCustomerSubdomain();

  return (
    <>
      <ScrollToTop />
      <Router />
      {!isCustomerSite && (
        <Suspense fallback={null}>
          <PageblitzCookieBanner />
        </Suspense>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      {/* Token-Switch 2026-08-25: Die App startet nicht mehr im dunklen
          Template-Theme — die Studio-Palette (Papier/Grün) gilt jetzt
          global. toggleTheme wird nirgends aufgerufen, der .dark-Block in
          index.css ist damit toter Bestand und greift nie. */}
      <ThemeProvider defaultTheme="light">
        {/* Lazy (s. o.): eigener Suspense-Rahmen ohne Fallback, damit ein
            noch ladender Toaster-Chunk nie den Seiteninhalt durch den
            PageLoader ersetzt. */}
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
