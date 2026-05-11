/**
 * Centralized conversion tracking for Google Ads + GA4.
 *
 * Google Ads Conversion IDs — create these in Google Ads:
 *   Tools → Conversions → New Conversion Action → Website
 *   Each gets its own send_to label.
 *
 * IMPORTANT: After deploying, create the matching Conversion Actions
 * in Google Ads with these exact send_to labels, then set:
 *   - email_submitted → Primary (Include in Conversions: YES)
 *   - trial_started → Primary (Include in Conversions: YES)
 *   - onboarding_started → Secondary (Include in Conversions: NO)
 *   - website_published → Secondary (Include in Conversions: NO)
 */

const ADS_ID = "AW-16545728698";

// These conversion labels need to be created in Google Ads.
// For now we use the existing label for all; replace each once
// you create the individual Conversion Actions in Google Ads.
const CONVERSION_LABELS: Record<string, string> = {
  onboarding_started: "24hCCMT9wI8cELqRz9E9",  // Existing — demote to Secondary
  email_submitted:    "24hCCMT9wI8cELqRz9E9",  // TODO: Replace with new label from Google Ads
  trial_started:      "24hCCMT9wI8cELqRz9E9",  // TODO: Replace with new label from Google Ads
  website_published:  "24hCCMT9wI8cELqRz9E9",  // TODO: Replace with new label from Google Ads
  subscription_paid:  "24hCCMT9wI8cELqRz9E9",  // TODO: Replace with new label from Google Ads
};

const CONVERSION_VALUES: Record<string, number> = {
  onboarding_started: 1,
  email_submitted:    5,
  trial_started:      50,
  website_published:  10,
  subscription_paid:  240,
};

type ConversionEvent =
  | "onboarding_started"
  | "email_submitted"
  | "trial_started"
  | "website_published"
  | "subscription_paid";

export function trackConversion(event: ConversionEvent): void {
  const g = (window as any).gtag;
  if (typeof g !== "function") return;

  const label = CONVERSION_LABELS[event];
  const value = CONVERSION_VALUES[event] || 0;

  // GA4 custom event (for GA4 reporting + potential import to Google Ads)
  g("event", event, {
    event_category: "conversion",
    value,
    currency: "EUR",
  });

  // Google Ads conversion tag (for direct Ads tracking)
  if (label) {
    g("event", "conversion", {
      send_to: `${ADS_ID}/${label}`,
      value,
      currency: "EUR",
    });
  }
}

export function trackFunnelStep(stepName: string, stepIndex: number): void {
  const g = (window as any).gtag;
  if (typeof g !== "function") return;

  g("event", "onboarding_step", {
    step_name: stepName,
    step_index: stepIndex,
  });
}
