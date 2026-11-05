import { logOnboardingEventOnce } from "../db";
import {
  STUDIO_FUNNEL_EVENTS,
  type StudioFunnelEvent,
} from "../../shared/onboardingV2/funnel";

/** Funnel-Messung darf den Builder oder Checkout niemals blockieren. */
export async function recordStudioFunnelEvent(
  websiteId: number,
  event: StudioFunnelEvent
): Promise<void> {
  try {
    await logOnboardingEventOnce({
      websiteId,
      step: event,
      stepIndex: STUDIO_FUNNEL_EVENTS[event],
      event: "reached",
    });
  } catch (error) {
    console.warn(
      `[studio-funnel] ${event} konnte nicht gespeichert werden:`,
      error
    );
  }
}
