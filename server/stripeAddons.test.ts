import { describe, expect, test, vi } from "vitest";
import {
  AddOnPriceConfigError,
  addOnsFromSubscriptionItems,
  resolveAddOnPriceIds,
  syncSubscriptionAddOns,
  type StripeAddOnsClient,
} from "./stripeAddons";

/** Vollständige Env: je Add-on eine Price-ID `price_<key>`. */
const fullEnv: NodeJS.ProcessEnv = {
  STRIPE_PRICE_ADDON_CONTACT_FORM: "price_contactForm",
  STRIPE_PRICE_ADDON_GALLERY: "price_gallery",
  STRIPE_PRICE_ADDON_MENU: "price_menu",
  STRIPE_PRICE_ADDON_PRICELIST: "price_pricelist",
  STRIPE_PRICE_ADDON_AI_CHAT: "price_aiChat",
  STRIPE_PRICE_ADDON_BOOKING: "price_booking",
  STRIPE_PRICE_ADDON_TEAM: "price_team",
  STRIPE_PRICE_ADDON_SUBPAGES: "price_subpages",
};

function fakeStripe(items: { id: string; price: { id: string } }[]): {
  stripe: StripeAddOnsClient;
  list: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
} {
  const list = vi.fn().mockResolvedValue({ data: items });
  const create = vi.fn().mockResolvedValue({ id: "si_new" });
  const del = vi.fn().mockResolvedValue({ deleted: true });
  return {
    stripe: { subscriptionItems: { list, create, del } } as StripeAddOnsClient,
    list,
    create,
    del,
  };
}

describe("resolveAddOnPriceIds", () => {
  test("liest je Add-on die Env-Variable STRIPE_PRICE_ADDON_<KEY>; fehlende/leere Werte werden ausgelassen", () => {
    expect(resolveAddOnPriceIds(fullEnv)).toEqual({
      contactForm: "price_contactForm",
      gallery: "price_gallery",
      menu: "price_menu",
      pricelist: "price_pricelist",
      aiChat: "price_aiChat",
      booking: "price_booking",
      team: "price_team",
      subpages: "price_subpages",
    });
    expect(
      resolveAddOnPriceIds({
        STRIPE_PRICE_ADDON_GALLERY: "price_gallery",
        STRIPE_PRICE_ADDON_TEAM: "   ",
      })
    ).toEqual({ gallery: "price_gallery" });
    expect(resolveAddOnPriceIds({})).toEqual({});
  });
});

describe("addOnsFromSubscriptionItems", () => {
  test("leitet je konfiguriertem Add-on true/false aus den Items ab; unkonfigurierte Keys fehlen (bleiben beim Aufrufer unverändert)", () => {
    const items = [
      { id: "si_base", price: { id: "price_base" } },
      { id: "si_g", price: { id: "price_gallery" } },
    ];
    expect(addOnsFromSubscriptionItems(items, fullEnv)).toEqual({
      contactForm: false,
      gallery: true,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: false,
      team: false,
      subpages: false,
    });
    expect(
      addOnsFromSubscriptionItems(items, {
        STRIPE_PRICE_ADDON_GALLERY: "price_gallery",
        STRIPE_PRICE_ADDON_TEAM: "price_team",
      })
    ).toEqual({ gallery: true, team: false });
    expect(addOnsFromSubscriptionItems(items, {})).toEqual({});
  });
});

describe("syncSubscriptionAddOns", () => {
  test("legt fehlende Items für gebuchte Add-ons an (proration create_prorations) und entfernt Items abgewählter Add-ons", async () => {
    const { stripe, list, create, del } = fakeStripe([
      { id: "si_base", price: { id: "price_base" } },
      { id: "si_team", price: { id: "price_team" } },
      { id: "si_gallery", price: { id: "price_gallery" } },
    ]);
    const result = await syncSubscriptionAddOns(
      "sub_1",
      { gallery: true, team: false, subpages: true },
      { stripe, env: fullEnv }
    );
    expect(list).toHaveBeenCalledWith({ subscription: "sub_1", limit: 100 });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      subscription: "sub_1",
      price: "price_subpages",
      quantity: 1,
      proration_behavior: "create_prorations",
    });
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith("si_team", {
      proration_behavior: "create_prorations",
    });
    expect(result).toEqual({ added: ["subpages"], removed: ["team"] });
  });

  test("keine Änderung nötig → kein create/del (idempotent)", async () => {
    const { stripe, create, del } = fakeStripe([
      { id: "si_gallery", price: { id: "price_gallery" } },
    ]);
    const result = await syncSubscriptionAddOns(
      "sub_1",
      { gallery: true, menu: false },
      { stripe, env: fullEnv }
    );
    expect(create).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
    expect(result).toEqual({ added: [], removed: [] });
  });

  test("nur übergebene Keys werden angefasst — andere Items bleiben (auch fremde, z. B. die Basis-Position)", async () => {
    const { stripe, del } = fakeStripe([
      { id: "si_base", price: { id: "price_base" } },
      { id: "si_gallery", price: { id: "price_gallery" } },
      { id: "si_team", price: { id: "price_team" } },
    ]);
    await syncSubscriptionAddOns(
      "sub_1",
      { team: false },
      { stripe, env: fullEnv }
    );
    expect(del).toHaveBeenCalledTimes(1);
    expect(del.mock.calls[0][0]).toBe("si_team");
  });

  test("gebuchtes Add-on ohne Env-Price-ID → AddOnPriceConfigError mit Add-on-Name und Env-Variable, KEIN Stripe-Write", async () => {
    const { stripe, create, del } = fakeStripe([]);
    await expect(
      syncSubscriptionAddOns(
        "sub_1",
        { gallery: true, team: true },
        { stripe, env: { STRIPE_PRICE_ADDON_GALLERY: "price_gallery" } }
      )
    ).rejects.toMatchObject({
      name: "AddOnPriceConfigError",
      key: "team",
      envKey: "STRIPE_PRICE_ADDON_TEAM",
    });
    await expect(
      syncSubscriptionAddOns("sub_1", { team: true }, { stripe, env: {} })
    ).rejects.toThrow(/Team.*STRIPE_PRICE_ADDON_TEAM/);
    // Konfigurationsfehler werden VOR dem ersten Write erkannt — sonst
    // stünde die Subscription halb aktualisiert da.
    expect(create).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
    expect(new AddOnPriceConfigError("team")).toBeInstanceOf(Error);
  });

  test("abgewähltes Add-on ohne Env-Price-ID ist kein Fehler (nichts zu entfernen, weil nicht identifizierbar)", async () => {
    const { stripe, del } = fakeStripe([
      { id: "si_unknown", price: { id: "price_adhoc" } },
    ]);
    await expect(
      syncSubscriptionAddOns("sub_1", { team: false }, { stripe, env: {} })
    ).resolves.toEqual({ added: [], removed: [] });
    expect(del).not.toHaveBeenCalled();
  });

  test("Stripe-Fehler werden durchgereicht (Aufrufer entscheidet: BAD_REQUEST, Flags unverändert)", async () => {
    const { stripe, create } = fakeStripe([]);
    create.mockRejectedValue(new Error("card_declined"));
    await expect(
      syncSubscriptionAddOns(
        "sub_1",
        { gallery: true },
        { stripe, env: fullEnv }
      )
    ).rejects.toThrow("card_declined");
  });
});
