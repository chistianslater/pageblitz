/**
 * Entscheidungsrelevante Stationen des aktuellen Studios. Die IDs werden
 * ohne Freitext oder personenbezogene Daten in onboarding_events gespeichert.
 */
export const STUDIO_FUNNEL_EVENTS = {
  studio_ready: 0,
  studio_panel_style: 10,
  studio_panel_photos: 20,
  studio_panel_texts: 30,
  studio_panel_structure: 35,
  studio_panel_offer: 40,
  studio_panel_legal: 50,
  studio_panel_addons: 60,
  studio_panel_versions: 65,
  studio_panel_publish: 70,
  studio_email_saved: 80,
  studio_legal_saved: 90,
  studio_checkout_blocked_legal: 100,
  studio_checkout_blocked_email: 101,
  studio_checkout_blocked_b2b: 102,
  studio_checkout_created: 110,
  studio_checkout_cancelled: 111,
  studio_purchase_completed: 120,
} as const;

export type StudioFunnelEvent = keyof typeof STUDIO_FUNNEL_EVENTS;

export const STUDIO_FUNNEL_EVENT_IDS = Object.keys(STUDIO_FUNNEL_EVENTS) as [
  StudioFunnelEvent,
  ...StudioFunnelEvent[],
];
