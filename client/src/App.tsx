import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/start" component={StartPage} />
      <Route path="/preview/:token" component={PreviewPage} />
      <Route path="/site/:slug" component={SitePage} />
      <Route path="/site/:slug/impressum" component={LegalPage} />
      <Route path="/site/:slug/datenschutz" component={LegalPage} />
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
