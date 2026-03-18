import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import PageblitzCookieBanner from "./components/PageblitzCookieBanner";
import { initConsent, trackMetaPageView, hasMarketingConsent } from "./lib/consent";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import SitePage from "./pages/SitePage";
import LegalPage from "./pages/LegalPage";
import StartPage from "./pages/StartPage";
import PageblitzImpressum from "./pages/PageblitzImpressum";
import PageblitzDatenschutz from "./pages/PageblitzDatenschutz";
import { AdminRoute, CustomerRoute } from "./components/ProtectedRoute";

// ── Lazy-loaded pages (not needed on first paint) ─────────────────────────────
const DashboardLayout      = lazy(() => import("./components/DashboardLayout"));
const Home                 = lazy(() => import("./pages/Home"));
const SearchPage           = lazy(() => import("./pages/SearchPage"));
const WebsitesPage         = lazy(() => import("./pages/WebsitesPage"));
const OutreachPage         = lazy(() => import("./pages/OutreachPage"));
const StatsPage            = lazy(() => import("./pages/StatsPage"));
const LeadsPage            = lazy(() => import("./pages/LeadsPage"));
const PreviewPage          = lazy(() => import("./pages/PreviewPage"));
const OnboardingWizard     = lazy(() => import("./pages/OnboardingWizard"));
const OnboardingChat       = lazy(() => import("./pages/OnboardingChat"));
const CustomerDashboard    = lazy(() => import("./pages/CustomerDashboard"));
const AccountPage          = lazy(() => import("./pages/AccountPage"));
const LayoutOverviewPage   = lazy(() => import("./pages/LayoutOverviewPage"));
const LayoutPreviewStandalone = lazy(() => import("./pages/LayoutPreviewStandalone"));
const LoginPage            = lazy(() => import("./pages/LoginPage"));
const CustomerLoginPage    = lazy(() => import("./pages/CustomerLoginPage"));

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
      <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );
}

function AdminRouter() {
  return (
    <AdminRoute>
      <Suspense fallback={<PageLoader />}>
        <DashboardLayout>
          <Switch>
            <Route path="/admin" component={Home} />
            <Route path="/admin/search" component={SearchPage} />
            <Route path="/admin/websites" component={WebsitesPage} />
            <Route path="/admin/outreach" component={OutreachPage} />
            <Route path="/admin/stats" component={StatsPage} />
            <Route path="/admin/leads" component={LeadsPage} />
            <Route path="/admin/layouts" component={LayoutOverviewPage} />
            <Route component={NotFound} />
          </Switch>
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
  const customerSlug = getCustomerSubdomain();
  if (customerSlug) {
    return (
      <Switch>
        <Route path="/impressum">{() => <LegalPage forceSlug={customerSlug} />}</Route>
        <Route path="/datenschutz">{() => <LegalPage forceSlug={customerSlug} />}</Route>
        <Route>{() => <SitePage forceSlug={customerSlug} />}</Route>
      </Switch>
    );
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
        <Route path="/preview/:token" component={PreviewPage} />
        <Route path="/site/:slug">{(params) => <SitePage key={params.slug} />}</Route>
        <Route path="/site/:slug/impressum">{(params) => <LegalPage key={params.slug} />}</Route>
        <Route path="/site/:slug/datenschutz">{(params) => <LegalPage key={params.slug} />}</Route>
        <Route path="/preview/:token/onboarding">{(params) => <OnboardingChat previewToken={params.token} />}</Route>
        <Route path="/websites/:id/onboarding">{(params) => <OnboardingChat websiteId={parseInt(params.id || "0")} />}</Route>
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
        <Route path="/layout-preview/:key" component={LayoutPreviewStandalone} />
        <Route path="/admin">
          <AdminRouter />
        </Route>
        <Route path="/admin/:rest*">
          <AdminRouter />
        </Route>
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
    window.scrollTo(0, 0);       // virtual viewport fallback (iOS Safari)
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
  const isCustomerSite = location.startsWith("/site/") || !!getCustomerSubdomain();

  return (
    <>
      <ScrollToTop />
      <Router />
      {!isCustomerSite && <PageblitzCookieBanner />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
