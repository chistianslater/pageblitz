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
import { handleCheckoutCompleted } from "./stripeWebhookHandlers";

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
        console.log(
          "[Webhook] Test event detected, returning verification response"
        );
        return res.json({ verified: true });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session, {
              createOnboarding,
              getOnboardingByWebsiteId,
              getWebsiteById,
              updateWebsite,
              createSubscription,
              getUserByEmail,
              stripeCompat,
            });
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const sub = await getSubscriptionByStripeId(subscription.id);
            if (sub) {
              await updateSubscription(sub.id, {
                status: "canceled",
                updatedAt: Date.now(),
              });
              await updateWebsite(sub.websiteId, { status: "inactive" });
              console.log(
                `[Webhook] Subscription cancelled for website ${sub.websiteId}`
              );
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
                const freshSub = await stripeCompat.subscriptions.retrieve(
                  subscription.id
                );
                periodEnd = (freshSub as any).current_period_end;
                cancelAtPeriodEnd =
                  (freshSub as any).cancel_at_period_end === true;
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

              if (
                newStatus === "active" ||
                newStatus === "canceling" ||
                newStatus === "trialing"
              ) {
                const website = await getWebsiteById(sub.websiteId);
                if (website?.customerEmail) {
                  await updateWebsite(sub.websiteId, {
                    status: "active",
                    captureStatus: "converted",
                  });
                } else {
                  console.warn(
                    `[Webhook] Skipping activation for website ${sub.websiteId}: no customerEmail`
                  );
                }
              }

              console.log(
                `[Webhook] Subscription updated for website ${sub.websiteId}: ${newStatus}${cancelAtPeriodEnd ? " (cancel_at_period_end)" : ""}`
              );
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            const subscriptionId =
              typeof invoice.subscription === "string"
                ? invoice.subscription
                : null;
            if (subscriptionId) {
              const sub = await getSubscriptionByStripeId(subscriptionId);
              if (sub) {
                await updateSubscription(sub.id, {
                  status: "past_due",
                  updatedAt: Date.now(),
                });
                console.log(
                  `[Webhook] Payment failed for website ${sub.websiteId}`
                );
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
