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
} from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
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

            // Create subscription record
            const subscriptionId = typeof session.subscription === "string"
              ? session.subscription
              : (session.subscription as any)?.id || null;

            const userId = parseInt(session.metadata?.userId || "0") || 0;
            await createSubscription({
              websiteId,
              userId,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
              status: "active",
              plan: "base",
              addOns: session.metadata?.addOns ? JSON.parse(session.metadata.addOns) : {},
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
              const newStatus = subscription.status === "active" ? "active"
                : subscription.status === "past_due" ? "past_due"
                : "canceled";
              await updateSubscription(sub.id, { status: newStatus, updatedAt: Date.now() });
              if (newStatus === "active") {
                await updateWebsite(sub.websiteId, { status: "active" });
              }
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
