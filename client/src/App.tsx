import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import PageblitzCookieBanner from "./components/PageblitzCookieBanner";
import { initConsent } from "./lib/consent";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import WebsitesPage from "./pages/WebsitesPage";
import OutreachPage from "./pages/OutreachPage";
import StatsPage from "./pages/StatsPage";
import TemplatesPage from "./pages/TemplatesPage";
import LeadsPage from "./pages/LeadsPage";
import PreviewPage from "./pages/PreviewPage";
import SitePage from "./pages/SitePage";
import OnboardingWizard from "./pages/OnboardingWizard";
import OnboardingChat from "./pages/OnboardingChat";
import LegalPage from "./pages/LegalPage";
import StartPage from "./pages/StartPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import AccountPage from "./pages/AccountPage";
import LayoutOverviewPage from "./pages/LayoutOverviewPage";
import LayoutPreviewStandalone from "./pages/LayoutPreviewStandalone";
import LoginPage from "./pages/LoginPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import PageblitzImpressum from "./pages/PageblitzImpressum";
import PageblitzDatenschutz from "./pages/PageblitzDatenschutz";
import { AdminRoute, CustomerRoute } from "./components/ProtectedRoute";

function AdminRouter() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <Switch>
          <Route path="/admin" component={Home} />
          <Route path="/admin/search" component={SearchPage} />
          <Route path="/admin/websites" component={WebsitesPage} />
          <Route path="/admin/outreach" component={OutreachPage} />
          <Route path="/admin/stats" component={StatsPage} />
          <Route path="/admin/templates" component={TemplatesPage} />
          <Route path="/admin/leads" component={LeadsPage} />
          <Route path="/admin/layouts" component={LayoutOverviewPage} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
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

  return (
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
  );
}

/**
 * Lädt ggf. bereits erteilte Tracking-Einwilligungen beim App-Start
 * und blendet den Cookie-Banner auf PageBlitz-eigenen Seiten ein.
 * Auf Kunden-Websites (/site/:slug) wird der Banner nicht gezeigt –
 * dort hat der Betreiber seinen eigenen CookieBanner.
 */
function AppContent() {
  const [location] = useLocation();

  // Bestehende Einwilligung beim ersten Render nachladen
  useEffect(() => {
    initConsent();
  }, []);

  // Kunden-Website-Routen: kein PageBlitz-Banner (auch bei Subdomain-Zugriff)
  const isCustomerSite = location.startsWith("/site/") || !!getCustomerSubdomain();

  return (
    <>
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
