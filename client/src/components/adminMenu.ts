import {
  BarChart3,
  Bug,
  Building2,
  Globe,
  LayoutDashboard,
  Mail,
  MailCheck,
  MessageCircle,
  Palette,
  QrCode,
  Search,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

/**
 * Navigation des Admin-Dashboards (DashboardLayout). „Design-Review" führt
 * aus dem Dashboard auf die interne System-Übersicht `/design-review`
 * (eigene Seite außerhalb von /admin, ebenfalls hinter dem Admin-Login;
 * Betreiber-Wunsch 2026-10-13).
 */
export const ADMIN_MENU = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Search, label: "GMB-Suche", path: "/admin/search" },
  { icon: Building2, label: "Businesses", path: "/admin/businesses" },
  { icon: Globe, label: "Websites", path: "/admin/websites" },
  { icon: TrendingUp, label: "Lead-Funnel", path: "/admin/leads" },
  { icon: Mail, label: "Outreach", path: "/admin/outreach" },
  { icon: MailCheck, label: "Lifecycle-Mails", path: "/admin/lifecycle" },
  { icon: QrCode, label: "Postkarten", path: "/admin/postkarten" },
  { icon: Users, label: "Nutzer", path: "/admin/users" },
  { icon: BarChart3, label: "Statistiken", path: "/admin/stats" },
  { icon: Zap, label: "Pipeline", path: "/admin/pipeline" },
  { icon: MessageCircle, label: "Support-Chats", path: "/admin/support-chats" },
  { icon: Bug, label: "Errors", path: "/admin/errors" },
  { icon: Palette, label: "Design-Review", path: "/design-review" },
] as const;
