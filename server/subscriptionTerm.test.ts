import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  ensurePortalConfiguration,
  findBaseItem,
  handleInvoicePaid,
  invoicePaidPeriod,
  invoiceSubscriptionId,
  mapStripeStatus,
  previewCancellation,
  portalConfigurationParams,
  requestCancellation,
  resetPortalConfigCache,
  resolveTermStart,
  stripeScheduledEnd,
  subscriptionMetadataFor,
  subscriptionPeriodEnd,
  switchToYearly,
  syncCancellationFromStripe,
  withdrawCancellation,
  SubscriptionActionError,
} from "./subscriptionTerm";

const t = (iso: string) => Math.floor(Date.parse(iso) / 1000);
const TRIAL_END = t("2027-01-31T12:00:00Z");
const TERM_END = t("2028-01-31T12:00:00Z");
const NEXT_TERM_END = t("2029-01-31T12:00:00Z");

function row(overrides: Record<string, unknown> = {}): any {
  return {
    id: 9,
    websiteId: 42,
    userId: 7,
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    status: "active",
    plan: "base",
    billingInterval: "yearly",
    addOns: {},
    currentPeriodEnd: null,
    termStartedAt: TRIAL_END,
    currentTermEnd: TERM_END,
    billingAnchorAt: TRIAL_END,
    b2bConfirmedAt: null,
    cancelRequestedAt: null,
    cancelEffectiveAt: null,
    checkoutEmail: "kunde@x.de",
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function invoice(
  start: number,
  end: number,
  overrides: Record<string, unknown> = {}
) {
  return {
    amount_paid: 1990,
    subscription: "sub_1",
    lines: { data: [{ period: { start, end } }] },
    ...overrides,
  };
}

describe("Lesehilfen", () => {
  test("invoiceSubscriptionId: alt, clover, Position", () => {
    expect(invoiceSubscriptionId({ subscription: "sub_a" })).toBe("sub_a");
    expect(invoiceSubscriptionId({ subscription: { id: "sub_b" } })).toBe(
      "sub_b"
    );
    expect(
      invoiceSubscriptionId({
        parent: { subscription_details: { subscription: "sub_c" } },
      })
    ).toBe("sub_c");
    expect(
      invoiceSubscriptionId({
        lines: {
          data: [
            {
              parent: { subscription_item_details: { subscription: "sub_d" } },
            },
          ],
        },
      })
    ).toBe("sub_d");
    expect(invoiceSubscriptionId({})).toBeNull();
  });

  test("invoicePaidPeriod ignoriert Prorations", () => {
    expect(
      invoicePaidPeriod({
        lines: {
          data: [
            { proration: true, period: { start: 1, end: 999 } },
            { period: { start: 100, end: 200 } },
            { period: { start: 100, end: 200 } },
          ],
        },
      })
    ).toEqual({ start: 100, end: 200 });
    expect(invoicePaidPeriod({ lines: { data: [] } })).toBeNull();
  });

  test("subscriptionPeriodEnd / stripeScheduledEnd / mapStripeStatus", () => {
    expect(subscriptionPeriodEnd({ current_period_end: 5 })).toBe(5);
    expect(
      subscriptionPeriodEnd({ items: { data: [{ current_period_end: 7 }] } })
    ).toBe(7);
    expect(stripeScheduledEnd({ cancel_at: 9 })).toBe(9);
    expect(
      stripeScheduledEnd({ cancel_at_period_end: true, current_period_end: 5 })
    ).toBe(5);
    expect(stripeScheduledEnd({ cancel_at: null })).toBeNull();
    expect(mapStripeStatus({ status: "active" })).toBe("active");
    expect(mapStripeStatus({ status: "active", cancel_at: 9 })).toBe(
      "canceling"
    );
    expect(
      mapStripeStatus({
        status: "trialing",
        cancel_at_period_end: true,
        current_period_end: 3,
      })
    ).toBe("canceling");
    expect(mapStripeStatus({ status: "trialing" })).toBe("trialing");
    expect(mapStripeStatus({ status: "past_due" })).toBe("past_due");
    expect(mapStripeStatus({ status: "incomplete_expired" })).toBe("canceled");
  });

  test("subscriptionMetadataFor", () => {
    expect(subscriptionMetadataFor("yearly")).toEqual({
      tariff: "yearly",
      termMonths: "12",
    });
    expect(subscriptionMetadataFor("monthly")).toEqual({
      tariff: "monthly",
      termMonths: "0",
    });
  });

  test("resolveTermStart: Zeile → Metadaten → Anker; ausstehender Wechsel → null", () => {
    expect(resolveTermStart({ termStartedAt: 5 }, {})).toBe(5);
    expect(
      resolveTermStart(
        { termStartedAt: null },
        { metadata: { termStartedAt: "6" } }
      )
    ).toBe(6);
    expect(
      resolveTermStart({ termStartedAt: null }, { billing_cycle_anchor: 7 })
    ).toBe(7);
    expect(
      resolveTermStart(
        { termStartedAt: null },
        { billing_cycle_anchor: 7, metadata: { tariffSwitchedAt: "1" } }
      )
    ).toBeNull();
  });
});

describe("handleInvoicePaid", () => {
  function deps(record: any) {
    return {
      getSubscriptionByStripeId: vi.fn().mockResolvedValue(record),
      updateSubscription: vi.fn().mockResolvedValue(undefined),
      stripe: {
        subscriptions: {
          retrieve: vi
            .fn()
            .mockResolvedValue({ billing_cycle_anchor: TRIAL_END }),
          update: vi.fn().mockResolvedValue({}),
        },
      },
    };
  }

  test("Tarifwechsel: Laufzeitbeginn am gekappten 28.02. → Ende auf Stripe-Grenze 29.02.2028 (Anker 31.01.)", async () => {
    const d = deps(
      row({ termStartedAt: null, currentTermEnd: null, billingAnchorAt: null })
    );
    const start = t("2027-02-28T12:00:00Z");
    expect(
      await handleInvoicePaid(invoice(start, t("2027-03-31T12:00:00Z")), d)
    ).toBe("term_started");
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        termStartedAt: start,
        billingAnchorAt: TRIAL_END,
        currentTermEnd: t("2028-02-29T12:00:00Z"),
      })
    );
  });

  test("0-€-Rechnung (Testbeginn) wird ignoriert", async () => {
    const d = deps(row({ termStartedAt: null, currentTermEnd: null }));
    expect(
      await handleInvoicePaid({ ...invoice(1, 2), amount_paid: 0 }, d)
    ).toBe("ignored");
    expect(d.updateSubscription).not.toHaveBeenCalled();
  });

  test("erste Zahlung nach dem Test startet die Laufzeit (Anker 31.01. → Ende 31.01. Folgejahr)", async () => {
    const d = deps(row({ termStartedAt: null, currentTermEnd: null }));
    const outcome = await handleInvoicePaid(
      invoice(TRIAL_END, t("2027-02-28T12:00:00Z")),
      d
    );
    expect(outcome).toBe("term_started");
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        termStartedAt: TRIAL_END,
        currentTermEnd: TERM_END,
        currentPeriodEnd: t("2027-02-28T12:00:00Z"),
      })
    );
    expect(d.stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      metadata: { termStartedAt: String(TRIAL_END) },
    });
  });

  test("Stripe-Metadatenfehler bricht den Laufzeitstart nicht ab", async () => {
    const d = deps(row({ termStartedAt: null, currentTermEnd: null }));
    d.stripe.subscriptions.update.mockRejectedValue(new Error("stripe down"));
    expect(
      await handleInvoicePaid(invoice(TRIAL_END, TRIAL_END + 100), d)
    ).toBe("term_started");
    expect(d.updateSubscription).toHaveBeenCalled();
  });

  test("Zahlung mitten in der Laufzeit ändert die Laufzeit nicht", async () => {
    const d = deps(row());
    expect(
      await handleInvoicePaid(
        invoice(t("2027-06-30T12:00:00Z"), t("2027-07-31T12:00:00Z")),
        d
      )
    ).toBe("term_unchanged");
    expect(d.updateSubscription.mock.calls[0][1]).not.toHaveProperty(
      "currentTermEnd"
    );
  });

  test("Zahlung ab Laufzeitende rollt um 12 Monate", async () => {
    const d = deps(row());
    expect(
      await handleInvoicePaid(invoice(TERM_END, t("2028-02-29T12:00:00Z")), d)
    ).toBe("term_rolled");
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ currentTermEnd: NEXT_TERM_END })
    );
  });

  test("Kündigung zum Laufzeitende blockiert das Rollen", async () => {
    const d = deps(row({ cancelEffectiveAt: TERM_END, cancelRequestedAt: 1 }));
    expect(await handleInvoicePaid(invoice(TERM_END, TERM_END + 100), d)).toBe(
      "roll_blocked_by_cancel"
    );
    expect(d.updateSubscription.mock.calls[0][1]).not.toHaveProperty(
      "currentTermEnd"
    );
  });

  test("Kündigung zum NÄCHSTEN Laufzeitende (spät gekündigt) → Laufzeit rollt", async () => {
    const d = deps(
      row({ cancelEffectiveAt: NEXT_TERM_END, cancelRequestedAt: 1 })
    );
    expect(await handleInvoicePaid(invoice(TERM_END, TERM_END + 100), d)).toBe(
      "term_rolled"
    );
  });

  test("Monatstarif: nur Abrechnungsende, keine Laufzeit", async () => {
    const d = deps(
      row({
        billingInterval: "monthly",
        termStartedAt: null,
        currentTermEnd: null,
      })
    );
    expect(await handleInvoicePaid(invoice(10, 20), d)).toBe("period_only");
    expect(d.updateSubscription.mock.calls[0][1]).not.toHaveProperty(
      "termStartedAt"
    );
  });
});

describe("requestCancellation", () => {
  function deps(stripeSub: any, now: number) {
    return {
      updateSubscription: vi.fn().mockResolvedValue(undefined),
      stripe: {
        subscriptions: {
          retrieve: vi.fn().mockResolvedValue(stripeSub),
          update: vi.fn().mockResolvedValue({}),
        },
      },
      now: () => now,
    };
  }

  test("Jahrestarif, rechtzeitig → cancel_at Laufzeitende, ohne Proration", async () => {
    const d = deps(
      { status: "active", current_period_end: t("2027-05-31T12:00:00Z") },
      t("2027-05-10T08:00:00Z")
    );
    const result = await requestCancellation(row(), d);
    expect(result).toEqual({
      mode: "cancel_at",
      endsAt: TERM_END,
      reason: "term_end",
    });
    expect(d.stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      cancel_at: TERM_END,
      proration_behavior: "none",
    });
    // erst unsere Zeile, dann Stripe
    expect(d.updateSubscription.mock.invocationCallOrder[0]).toBeLessThan(
      d.stripe.subscriptions.update.mock.invocationCallOrder[0]
    );
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        status: "canceling",
        cancelRequestedAt: t("2027-05-10T08:00:00Z"),
        cancelEffectiveAt: TERM_END,
      })
    );
  });

  test("Jahrestarif im letzten Monat → nächstes Laufzeitende", async () => {
    const d = deps({ status: "active" }, t("2028-01-10T08:00:00Z"));
    const result = await requestCancellation(row(), d);
    expect(result.endsAt).toBe(NEXT_TERM_END);
    expect(result.reason).toBe("next_term_end");
  });

  test("Testtage → cancel_at_period_end (kostenlos zum Testende)", async () => {
    const d = deps(
      { status: "trialing", current_period_end: TRIAL_END },
      t("2027-01-27T08:00:00Z")
    );
    const result = await requestCancellation(
      row({ status: "trialing", termStartedAt: null, currentTermEnd: null }),
      d
    );
    expect(result).toEqual({
      mode: "period_end",
      endsAt: TRIAL_END,
      reason: "trial",
    });
    expect(d.stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      cancel_at_period_end: true,
    });
  });

  test("Monatstarif → Ende des Abrechnungsmonats", async () => {
    const end = t("2027-06-30T12:00:00Z");
    const d = deps(
      { status: "active", current_period_end: end },
      t("2027-06-10T08:00:00Z")
    );
    const result = await requestCancellation(
      row({
        billingInterval: "monthly",
        termStartedAt: null,
        currentTermEnd: null,
      }),
      d
    );
    expect(result).toEqual({
      mode: "period_end",
      endsAt: end,
      reason: "monthly",
    });
  });

  test("Laufzeitbeginn fehlt in der Zeile → aus Stripe-Anker, wird nachgetragen", async () => {
    const d = deps(
      { status: "active", billing_cycle_anchor: TRIAL_END },
      t("2027-05-10T08:00:00Z")
    );
    const result = await requestCancellation(
      row({ termStartedAt: null, currentTermEnd: null }),
      d
    );
    expect(result.endsAt).toBe(TERM_END);
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ termStartedAt: TRIAL_END })
    );
  });

  test("Wechsel Monat→Jahr noch nicht wirksam → Ende zum Abrechnungsmonat", async () => {
    const end = t("2027-06-30T12:00:00Z");
    const d = deps(
      {
        status: "active",
        current_period_end: end,
        billing_cycle_anchor: TRIAL_END,
        metadata: { tariffSwitchedAt: "123" },
      },
      t("2027-06-10T08:00:00Z")
    );
    const result = await requestCancellation(
      row({ termStartedAt: null, currentTermEnd: null }),
      d
    );
    expect(result).toEqual({
      mode: "period_end",
      endsAt: end,
      reason: "monthly",
    });
  });

  test("Stripe-Fehler → Zeile wird zurückgesetzt, Fehler durchgereicht", async () => {
    const d = deps({ status: "active" }, t("2027-05-10T08:00:00Z"));
    d.stripe.subscriptions.update.mockRejectedValue(new Error("stripe down"));
    await expect(requestCancellation(row(), d)).rejects.toThrow("stripe down");
    expect(d.updateSubscription).toHaveBeenLastCalledWith(
      9,
      expect.objectContaining({
        status: "active",
        cancelRequestedAt: null,
        cancelEffectiveAt: null,
      })
    );
  });

  test("bereits gekündigt / nicht aktiv / ohne Stripe → SubscriptionActionError", async () => {
    const d = deps({ status: "active" }, 0);
    await expect(
      requestCancellation(row({ cancelEffectiveAt: TERM_END }), d)
    ).rejects.toBeInstanceOf(SubscriptionActionError);
    await expect(
      requestCancellation(row({ status: "canceled" }), d)
    ).rejects.toBeInstanceOf(SubscriptionActionError);
    await expect(
      requestCancellation(row({ stripeSubscriptionId: null }), d)
    ).rejects.toBeInstanceOf(SubscriptionActionError);
    expect(d.stripe.subscriptions.update).not.toHaveBeenCalled();
  });
});

describe("withdrawCancellation", () => {
  test("cancel_at wird entfernt, Zeile zurück auf aktiv", async () => {
    const d = {
      updateSubscription: vi.fn(),
      stripe: {
        subscriptions: {
          retrieve: vi
            .fn()
            .mockResolvedValue({ status: "active", cancel_at: TERM_END }),
          update: vi.fn().mockResolvedValue({}),
        },
      },
      now: () => t("2027-06-01T00:00:00Z"),
    };
    await withdrawCancellation(
      row({
        status: "canceling",
        cancelRequestedAt: 1,
        cancelEffectiveAt: TERM_END,
      }),
      d
    );
    expect(d.stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      cancel_at: "",
    });
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        status: "active",
        cancelRequestedAt: null,
        cancelEffectiveAt: null,
      })
    );
  });

  test("Testtage: cancel_at_period_end zurück auf false", async () => {
    const d = {
      updateSubscription: vi.fn(),
      stripe: {
        subscriptions: {
          retrieve: vi
            .fn()
            .mockResolvedValue({
              status: "trialing",
              cancel_at_period_end: true,
            }),
          update: vi.fn().mockResolvedValue({}),
        },
      },
      now: () => TRIAL_END - 100,
    };
    await withdrawCancellation(
      row({
        status: "canceling",
        cancelRequestedAt: 1,
        cancelEffectiveAt: TRIAL_END,
      }),
      d
    );
    expect(d.stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      cancel_at_period_end: false,
    });
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ status: "trialing" })
    );
  });

  test("nicht gekündigt → Fehler", async () => {
    const d = {
      updateSubscription: vi.fn(),
      stripe: { subscriptions: { retrieve: vi.fn(), update: vi.fn() } },
    };
    await expect(withdrawCancellation(row(), d)).rejects.toBeInstanceOf(
      SubscriptionActionError
    );
  });
});

describe("switchToYearly", () => {
  const items = [
    {
      id: "si_base",
      price: { id: "price_adhoc", unit_amount: 2490, product: "prod_base" },
    },
    {
      id: "si_gal",
      price: { id: "price_gallery", unit_amount: 390, product: "prod_g" },
    },
  ];

  test("findBaseItem: Basis-Position eindeutig, Add-ons ausgeschlossen", () => {
    expect(
      findBaseItem(items, { STRIPE_PRICE_ADDON_GALLERY: "price_gallery" })?.id
    ).toBe("si_base");
    expect(findBaseItem([], {})).toBeNull();
    expect(
      findBaseItem([items[0], { ...items[0], id: "si_2" }], {})
    ).toBeNull();
  });

  test("Basis auf Jahrespreis ohne Proration, Metadaten tariff=yearly, Laufzeit startet mit nächster Zahlung", async () => {
    const d = {
      updateSubscription: vi.fn(),
      stripe: {
        subscriptions: {
          retrieve: vi
            .fn()
            .mockResolvedValue({ status: "active", items: { data: items } }),
          update: vi.fn().mockResolvedValue({}),
        },
      },
      now: () => 1000,
      env: {},
    };
    await switchToYearly(
      row({
        billingInterval: "monthly",
        termStartedAt: null,
        currentTermEnd: null,
      }),
      d
    );
    expect(d.stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      items: [
        {
          id: "si_base",
          price_data: {
            currency: "eur",
            product: "prod_base",
            unit_amount: 1990,
            recurring: { interval: "month" },
            tax_behavior: "inclusive",
          },
        },
      ],
      proration_behavior: "none",
      metadata: {
        tariff: "yearly",
        termMonths: "12",
        tariffSwitchedAt: "1000",
      },
    });
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        billingInterval: "yearly",
        termStartedAt: null,
        currentTermEnd: null,
      })
    );
  });

  test("Tarifwechsel setzt den Steuersatz an Basis-Position und Subscription (Bruttobetrag 19,90 € bleibt)", async () => {
    const d = {
      updateSubscription: vi.fn(),
      stripe: {
        subscriptions: {
          retrieve: vi
            .fn()
            .mockResolvedValue({ status: "active", items: { data: items } }),
          update: vi.fn().mockResolvedValue({}),
        },
      },
      now: () => 1000,
      env: { STRIPE_TAX_RATE_ID: "txr_ust19" },
    };
    await switchToYearly(
      row({ billingInterval: "monthly", termStartedAt: null, currentTermEnd: null }),
      d
    );
    const params = d.stripe.subscriptions.update.mock.calls[0][1];
    expect(params.default_tax_rates).toEqual(["txr_ust19"]);
    expect(params.items[0].tax_rates).toEqual(["txr_ust19"]);
    expect(params.items[0].price_data.unit_amount).toBe(1990);
    expect(params.items[0].price_data.tax_behavior).toBe("inclusive");
  });

  test("bereits Jahrestarif / gekündigt → Fehler, kein Stripe-Write", async () => {
    const d = {
      updateSubscription: vi.fn(),
      stripe: { subscriptions: { retrieve: vi.fn(), update: vi.fn() } },
    };
    await expect(switchToYearly(row(), d)).rejects.toBeInstanceOf(
      SubscriptionActionError
    );
    await expect(
      switchToYearly(
        row({
          billingInterval: "monthly",
          cancelEffectiveAt: 5,
          status: "canceling",
        }),
        d
      )
    ).rejects.toBeInstanceOf(SubscriptionActionError);
    expect(d.stripe.subscriptions.update).not.toHaveBeenCalled();
  });
});

describe("syncCancellationFromStripe", () => {
  function deps(record: any) {
    return {
      getSubscriptionByStripeId: vi.fn().mockResolvedValue(record),
      updateSubscription: vi.fn(),
      stripe: { subscriptions: { update: vi.fn().mockResolvedValue({}) } },
      now: () => t("2027-05-10T08:00:00Z"),
    };
  }

  test("keine Kündigung, keine gespeicherte → nichts", async () => {
    const d = deps(row());
    expect(
      await syncCancellationFromStripe({ id: "sub_1", status: "active" }, d)
    ).toBe("none");
    expect(d.updateSubscription).not.toHaveBeenCalled();
  });

  test("Kündigung zurückgenommen (z. B. im Dashboard) → Felder geleert", async () => {
    const d = deps(row({ cancelRequestedAt: 1, cancelEffectiveAt: TERM_END }));
    expect(
      await syncCancellationFromStripe({ id: "sub_1", status: "active" }, d)
    ).toBe("cleared");
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        cancelRequestedAt: null,
        cancelEffectiveAt: null,
      })
    );
  });

  test("Portal-Kündigung zum Monatsende im Jahrestarif → cancel_at auf Laufzeitende", async () => {
    const d = deps(row());
    const outcome = await syncCancellationFromStripe(
      {
        id: "sub_1",
        status: "active",
        cancel_at_period_end: true,
        current_period_end: t("2027-05-31T12:00:00Z"),
        canceled_at: t("2027-05-09T10:00:00Z"),
      },
      d
    );
    expect(outcome).toBe("reapplied");
    expect(d.stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      cancel_at: TERM_END,
      proration_behavior: "none",
    });
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        cancelRequestedAt: t("2027-05-09T10:00:00Z"),
        cancelEffectiveAt: TERM_END,
      })
    );
  });

  test("eigene Kündigung, Stripe stimmt überein → akzeptiert, kein Write", async () => {
    const d = deps(row({ cancelRequestedAt: 5, cancelEffectiveAt: TERM_END }));
    expect(
      await syncCancellationFromStripe(
        { id: "sub_1", status: "active", cancel_at: TERM_END },
        d
      )
    ).toBe("accepted");
    expect(d.stripe.subscriptions.update).not.toHaveBeenCalled();
    expect(d.updateSubscription).not.toHaveBeenCalled();
  });

  test("Kulanz: metadata.cancelOverride=1 → Stripe-Ende wird übernommen", async () => {
    const d = deps(row());
    const end = t("2027-05-31T12:00:00Z");
    expect(
      await syncCancellationFromStripe(
        {
          id: "sub_1",
          status: "active",
          cancel_at: end,
          metadata: { cancelOverride: "1" },
        },
        d
      )
    ).toBe("accepted");
    expect(d.stripe.subscriptions.update).not.toHaveBeenCalled();
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ cancelEffectiveAt: end })
    );
  });

  test("Monatstarif: Portal-Kündigung wird übernommen", async () => {
    const d = deps(row({ billingInterval: "monthly", termStartedAt: null }));
    const end = t("2027-05-31T12:00:00Z");
    expect(
      await syncCancellationFromStripe(
        {
          id: "sub_1",
          status: "active",
          cancel_at_period_end: true,
          current_period_end: end,
        },
        d
      )
    ).toBe("accepted");
    expect(d.stripe.subscriptions.update).not.toHaveBeenCalled();
  });
});

describe("ensurePortalConfiguration", () => {
  beforeEach(() => resetPortalConfigCache());

  function client(existing: any[] = []) {
    return {
      billingPortal: {
        configurations: {
          list: vi.fn().mockResolvedValue({ data: existing }),
          create: vi.fn().mockResolvedValue({ id: "bpc_new" }),
        },
      },
    };
  }

  test("Env-ID hat Vorrang, kein API-Aufruf", async () => {
    const c = client();
    expect(
      await ensurePortalConfiguration(c, {
        STRIPE_PORTAL_CONFIGURATION_ID: "bpc_env",
      })
    ).toBe("bpc_env");
    expect(c.billingPortal.configurations.list).not.toHaveBeenCalled();
  });

  test("bestehende markierte Konfiguration wird wiederverwendet", async () => {
    const c = client([
      { id: "bpc_other", metadata: {} },
      { id: "bpc_ours", metadata: { pageblitz: "pageblitz-laufzeit-v1" } },
    ]);
    expect(await ensurePortalConfiguration(c, {})).toBe("bpc_ours");
    expect(c.billingPortal.configurations.create).not.toHaveBeenCalled();
  });

  test("sonst neu angelegt — Kündigen und Tarifwechsel aus, einmal je Prozess", async () => {
    const c = client();
    expect(await ensurePortalConfiguration(c, {})).toBe("bpc_new");
    expect(await ensurePortalConfiguration(c, {})).toBe("bpc_new");
    expect(c.billingPortal.configurations.create).toHaveBeenCalledTimes(1);
    const params = c.billingPortal.configurations.create.mock.calls[0][0];
    expect(params).toEqual(portalConfigurationParams());
    expect(params.features.subscription_cancel).toEqual({ enabled: false });
    expect(params.features.subscription_update).toEqual({ enabled: false });
    expect(params.features.payment_method_update).toEqual({ enabled: true });
  });
});

describe("Review-Fixes 2026-10-13", () => {
  function cdeps(stripeSub: any, now: number) {
    return {
      updateSubscription: vi.fn().mockResolvedValue(undefined),
      stripe: {
        subscriptions: {
          retrieve: vi.fn().mockResolvedValue(stripeSub),
          update: vi.fn().mockResolvedValue({}),
        },
      },
      now: () => now,
    };
  }

  test("past_due bleibt past_due beim Kündigen, Kündigungsfelder getrennt", async () => {
    const d = cdeps({ status: "past_due" }, t("2027-05-10T08:00:00Z"));
    await requestCancellation(row({ status: "past_due" }), d);
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        status: "past_due",
        cancelEffectiveAt: TERM_END,
      })
    );
  });

  test("past_due bleibt past_due beim Zurücknehmen", async () => {
    const d = cdeps(
      { status: "past_due", cancel_at: TERM_END },
      t("2027-05-10T08:00:00Z")
    );
    await withdrawCancellation(
      row({ status: "past_due", cancelRequestedAt: 1, cancelEffectiveAt: TERM_END }),
      d
    );
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ status: "past_due", cancelEffectiveAt: null })
    );
  });

  test("previewCancellation: ohne Laufzeitbeginn in der Zeile → Datum aus Stripe-Anker, schreibt nichts", async () => {
    const d = cdeps(
      { status: "active", billing_cycle_anchor: TRIAL_END },
      t("2027-05-10T08:00:00Z")
    );
    const result = await previewCancellation(
      row({ termStartedAt: null, currentTermEnd: null, billingAnchorAt: null }),
      d
    );
    expect(result).toEqual({ mode: "cancel_at", endsAt: TERM_END, reason: "term_end" });
    expect(d.updateSubscription).not.toHaveBeenCalled();
    expect(d.stripe.subscriptions.update).not.toHaveBeenCalled();
  });

  test("previewCancellation: ausstehender Wechsel → Ende Abrechnungsmonat", async () => {
    const end = t("2027-06-30T12:00:00Z");
    const d = cdeps(
      { status: "active", current_period_end: end, metadata: { tariffSwitchedAt: "1" } },
      t("2027-06-10T08:00:00Z")
    );
    expect(
      await previewCancellation(row({ termStartedAt: null, currentTermEnd: null }), d)
    ).toEqual({ mode: "period_end", endsAt: end, reason: "monthly" });
  });

  test("Kündigung nach Wechsel nutzt den Abrechnungsanker (29.02.)", async () => {
    const d = cdeps({ status: "active" }, t("2027-06-10T08:00:00Z"));
    const result = await requestCancellation(
      row({
        termStartedAt: t("2027-02-28T12:00:00Z"),
        currentTermEnd: null,
        billingAnchorAt: TRIAL_END,
      }),
      d
    );
    expect(result.endsAt).toBe(t("2028-02-29T12:00:00Z"));
  });

  test("Kulanz mit eigener Kündigung: früheres cancel_at gilt, Zeile zeigt echtes Ende", async () => {
    const early = t("2027-06-30T12:00:00Z");
    const d = {
      getSubscriptionByStripeId: vi
        .fn()
        .mockResolvedValue(row({ cancelRequestedAt: 5, cancelEffectiveAt: TERM_END })),
      updateSubscription: vi.fn(),
      stripe: { subscriptions: { update: vi.fn() } },
    };
    expect(
      await syncCancellationFromStripe(
        {
          id: "sub_1",
          status: "active",
          cancel_at: early,
          metadata: { cancelOverride: "1" },
        },
        d
      )
    ).toBe("accepted");
    expect(d.stripe.subscriptions.update).not.toHaveBeenCalled();
    expect(d.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ cancelEffectiveAt: early, cancelRequestedAt: 5 })
    );
  });
});
