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
import PreviewPage from "./pages/PreviewPage";
import SitePage from "./pages/SitePage";
import OnboardingWizard from "./pages/OnboardingWizard";
import OnboardingChat from "./pages/OnboardingChat";
import LegalPage from "./pages/LegalPage";
import StartPage from "./pages/StartPage";
import CustomerDashboard from "./pages/CustomerDashboard";

function AdminRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/admin" component={Home} />
        <Route path="/admin/search" component={SearchPage} />
        <Route path="/admin/websites" component={WebsitesPage} />
        <Route path="/admin/outreach" component={OutreachPage} />
        <Route path="/admin/stats" component={StatsPage} />
        <Route path="/admin/templates" component={TemplatesPage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
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
      <Route path="/my-website" component={CustomerDashboard} />
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
