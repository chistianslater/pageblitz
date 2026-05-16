/**
 * Centralized conversion tracking for GA4 + Google Ads.
 *
 * GA4 Key Events (already configured in GA4 Property 528392894):
 *   - qualify_lead        → User submits email (mid-funnel)
 *   - close_convert_lead  → User starts trial / clicks checkout
 *   - purchase            → Successful payment
 *   - form_start          → Onboarding started (secondary signal)
 *   - onboarding_step     → Each step in the funnel (secondary signal)
 *
 * GA4 → Google Ads import:
 *   Import qualify_lead, close_convert_lead, purchase as Conversion Actions.
 *   Set qualify_lead as Primary (enough volume for Smart Bidding).
 *   Demote old "Registrierung" action to Secondary.
 *
 * Google Ads direct conversion tag (fallback):
 *   Also fires gtag('event','conversion',{send_to:...}) for direct tracking.
 *   Replace labels below once Conversion Actions exist in Google Ads.
 */

const ADS_ID = "AW-16545728698";

// Direct Google Ads conversion labels.
// Replace with individual labels from Google Ads Conversion Actions.
// Until then, the existing "Registrierung" label is used as fallback.
const ADS_LABELS: Record<string, string | null> = {
  form_start:         "24hCCMT9wI8cELqRz9E9",  // Existing "Registrierung" — demote to Secondary
  qualify_lead:       null,  // TODO: Create in Google Ads, paste label here
  close_convert_lead: null,  // TODO: Create in Google Ads, paste label here
  purchase:           null,  // TODO: Create in Google Ads, paste label here
};

const EVENT_VALUES: Record<string, number> = {
  form_start:         1,
  qualify_lead:       5,
  close_convert_lead: 50,
  purchase:           240,
};

type ConversionEvent =
  | "form_start"
  | "qualify_lead"
  | "close_convert_lead"
  | "purchase";

/**
 * Fire a conversion event to both GA4 and Google Ads.
 *
 * GA4: fires the event name directly (matches pre-configured Key Events).
 * Google Ads: fires gtag('event','conversion',{send_to:...}) if a label exists.
 */
export function trackConversion(event: ConversionEvent, customValue?: number): void {
  const g = (window as any).gtag;
  if (typeof g !== "function") return;

  const value = customValue ?? EVENT_VALUES[event] ?? 0;

  // GA4 event (matches Key Event names in GA4 property)
  g("event", event, {
    event_category: "conversion",
    value,
    currency: "EUR",
  });

  // Google Ads direct conversion tag (if label configured)
  const label = ADS_LABELS[event];
  if (label) {
    g("event", "conversion", {
      send_to: `${ADS_ID}/${label}`,
      value,
      currency: "EUR",
    });
  }
}

/**
 * Track individual onboarding step progression (GA4 only, secondary signal).
 */
export function trackFunnelStep(stepName: string, stepIndex: number): void {
  const g = (window as any).gtag;
  if (typeof g !== "function") return;

  g("event", "onboarding_step", {
    step_name: stepName,
    step_index: stepIndex,
  });
}
