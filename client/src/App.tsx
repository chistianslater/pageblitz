import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import WebsitesPage from "./pages/WebsitesPage";
import OutreachPage from "./pages/OutreachPage";
import StatsPage from "./pages/StatsPage";
import PreviewPage from "./pages/PreviewPage";
import SitePage from "./pages/SitePage";

function AdminRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={SearchPage} />
        <Route path="/websites" component={WebsitesPage} />
        <Route path="/outreach" component={OutreachPage} />
        <Route path="/stats" component={StatsPage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/preview/:token" component={PreviewPage} />
      <Route path="/site/:slug" component={SitePage} />
      <Route>
        <AdminRouter />
      </Route>
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
