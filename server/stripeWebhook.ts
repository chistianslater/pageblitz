/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events from Stripe.
 */
import express, { type Express } from "express";
import Stripe from "stripe";
import {
  createOnboarding,
  getOnboardingByWebsiteId,
  getWebsiteById,
  updateWebsite,
  createSubscription,
  updateSubscription,
  getSubscriptionByStripeId,
  getUserByEmail,
} from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

// Separate client with older API version for subscription data that needs current_period_end
const stripeCompat = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

export function registerStripeWebhook(app: Express) {
  // MUST use express.raw() BEFORE express.json() for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      try {
        if (!sig || !webhookSecret) {
          console.error("[Webhook] Missing signature or webhook secret");
          return res.status(400).json({ error: "Missing signature" });
        }
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      console.log(`[Webhook] Event: ${event.type} (${event.id})`);

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const websiteId = parseInt(session.metadata?.websiteId || "0");
            if (!websiteId) break;

            const website = await getWebsiteById(websiteId);
            if (!website) break;

            // Parse addOns and billingInterval from metadata
            const rawAddOns = session.metadata?.addOns ? JSON.parse(session.metadata.addOns) : {};
            const billingInterval: "monthly" | "yearly" =
              session.metadata?.billingInterval === "monthly" ? "monthly" : "yearly";

            // Normalize addOns – support both old and new format
            const addOns = {
              contactForm: rawAddOns.contactForm ?? rawAddOns.features?.contactForm ?? false,
              gallery:     rawAddOns.gallery     ?? rawAddOns.features?.gallery     ?? false,
              menu:        rawAddOns.menu        ?? rawAddOns.features?.menu        ?? false,
              pricelist:   rawAddOns.pricelist   ?? rawAddOns.features?.pricelist   ?? false,
            };

            // Create subscription record
            const subscriptionId = typeof session.subscription === "string"
              ? session.subscription
              : (session.subscription as any)?.id || null;

            // Fetch currentPeriodEnd from Stripe subscription (use compat client for period fields)
            let currentPeriodEnd: number | undefined;
            if (subscriptionId) {
              try {
                const stripeSub = await stripeCompat.subscriptions.retrieve(subscriptionId);
                currentPeriodEnd = (stripeSub as any).current_period_end;
              } catch (e) {
                console.warn("[Webhook] Could not fetch subscription period end:", e);
              }
            }

            // Resolve userId: prefer metadata, fallback to customer_email lookup
            let userId = parseInt(session.metadata?.userId || "0") || 0;
            if (userId === 0 && session.customer_email) {
              const userByEmail = await getUserByEmail(session.customer_email);
              if (userByEmail) {
                userId = userByEmail.id;
                console.log(`[Webhook] Resolved userId ${userId} from customer_email ${session.customer_email}`);
              }
            }

            // Determine actual status from Stripe (trial vs. immediately active)
            let subStatus: "active" | "trialing" = "active";
            if (subscriptionId) {
              try {
                const stripeSub = await stripeCompat.subscriptions.retrieve(subscriptionId);
                if ((stripeSub as any).status === "trialing") subStatus = "trialing";
              } catch (_) {}
            }

            await createSubscription({
              websiteId,
              userId,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
              status: subStatus,
              plan: "base",
              billingInterval,
              addOns,
              currentPeriodEnd,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            // Start onboarding if not already started
            const existingOnboarding = await getOnboardingByWebsiteId(websiteId);
            if (!existingOnboarding) {
              await createOnboarding({
                websiteId,
                status: "in_progress",
                stepCurrent: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }

            // Mark website as sold/pending onboarding
            await updateWebsite(websiteId, {
              status: "sold",
              onboardingStatus: "pending",
            });

            console.log(`[Webhook] Checkout completed for website ${websiteId}`);
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const sub = await getSubscriptionByStripeId(subscription.id);
            if (sub) {
              await updateSubscription(sub.id, { status: "canceled", updatedAt: Date.now() });
              await updateWebsite(sub.websiteId, { status: "inactive" });
              console.log(`[Webhook] Subscription cancelled for website ${sub.websiteId}`);
            }
            break;
          }

          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const sub = await getSubscriptionByStripeId(subscription.id);
            if (sub) {
              // current_period_end not available in newer API — fetch via compat client
              let periodEnd: number | undefined;
              let cancelAtPeriodEnd = false;
              try {
                const freshSub = await stripeCompat.subscriptions.retrieve(subscription.id);
                periodEnd = (freshSub as any).current_period_end;
                cancelAtPeriodEnd = (freshSub as any).cancel_at_period_end === true;
              } catch (_) {}

              // Map Stripe status to local status
              // If cancel_at_period_end is set, the subscription is still running but scheduled to cancel
              let newStatus: string;
              if (subscription.status === "active" && cancelAtPeriodEnd) {
                newStatus = "canceling"; // running until period end, then gets deleted
              } else if (subscription.status === "active") {
                newStatus = "active";
              } else if (subscription.status === "trialing") {
                newStatus = "trialing";
              } else if (subscription.status === "past_due") {
                newStatus = "past_due";
              } else {
                newStatus = "canceled";
              }

              await updateSubscription(sub.id, {
                status: newStatus as any,
                ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
                updatedAt: Date.now(),
              });

              // Website stays active while subscription is still running (canceling = still paid)
              if (newStatus === "active" || newStatus === "canceling" || newStatus === "trialing") {
                await updateWebsite(sub.websiteId, { status: "active", captureStatus: "converted" });
              }

              console.log(`[Webhook] Subscription updated for website ${sub.websiteId}: ${newStatus}${cancelAtPeriodEnd ? " (cancel_at_period_end)" : ""}`);
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;
            if (subscriptionId) {
              const sub = await getSubscriptionByStripeId(subscriptionId);
              if (sub) {
                await updateSubscription(sub.id, { status: "past_due", updatedAt: Date.now() });
                console.log(`[Webhook] Payment failed for website ${sub.websiteId}`);
              }
            }
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (err: any) {
        console.error("[Webhook] Error processing event:", err.message);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
}
