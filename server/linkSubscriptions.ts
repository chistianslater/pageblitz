import * as db from "./db";

/**
 * Bindet verwaiste Abos (Stripe-Webhook hat `userId = 0` gesetzt, weil der
 * Käufer beim Checkout kein Konto hatte) an ein Konto, sobald der Inhaber
 * sich mit derselben E-Mail wie beim Checkout (`subscriptions.checkoutEmail`
 * — unveränderlich, siehe Finding I1) einloggt oder registriert.
 *
 * Idempotent: Nach dem Binden ist `userId` nicht mehr 0, ein erneuter
 * Aufruf mit derselben E-Mail findet dann keine Treffer mehr und gibt 0
 * zurück.
 *
 * @returns Anzahl der gebundenen Abos.
 */
export async function linkOrphanSubscriptionsToUser(
  userId: number,
  email: string
): Promise<number> {
  const orphanSubscriptions =
    await db.listOrphanSubscriptionsByCheckoutEmail(email);

  for (const subscription of orphanSubscriptions) {
    await db.updateSubscription(subscription.id, { userId });
  }

  return orphanSubscriptions.length;
}
