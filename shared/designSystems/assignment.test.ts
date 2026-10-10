import { describe, expect, test } from "vitest";
import { BLUEPRINT_IDS, isBarberShop } from "../stylePacks/blueprints";
import { systemsFor, systemsForDoc } from "./assignment";

describe("Zuordnung Branche → System", () => {
  test.each(BLUEPRINT_IDS.map(id => [id]))("%s: drei verschiedene Systeme", id => {
    expect(new Set(systemsFor(id)).size).toBe(3);
  });
  test("Spec-Tabelle", () => {
    expect(systemsFor("beauty")).toEqual(["journal", "nacht", "plakat"]);
    expect(systemsFor("beauty", { barber: true })).toEqual(["plakat", "nacht", "raster"]);
    expect(systemsFor("trade")).toEqual(["werkstoff", "raster", "plakat"]);
    expect(systemsFor("gastro", { gastroKind: "restaurant" })).toEqual(["nacht", "journal", "werkstoff"]);
    expect(systemsFor("gastro", { gastroKind: "imbiss" })).toEqual(["plakat", "werkstoff", "raster"]);
    expect(systemsFor("gastro", { gastroKind: "cafe" })).toEqual(["werkstoff", "journal", "plakat"]);
    expect(systemsFor("health")).toEqual(["klar", "journal", "raster"]);
    expect(systemsFor("advice")).toEqual(["raster", "klar", "journal"]);
    expect(systemsFor("retail")).toEqual(["werkstoff", "journal", "plakat"]);
    expect(systemsFor("auto")).toEqual(["raster", "plakat", "nacht"]);
    expect(systemsFor("courses")).toEqual(["plakat", "klar", "raster"]);
    expect(systemsFor("stay")).toEqual(["journal", "nacht", "werkstoff"]);
    expect(systemsFor("creative")).toEqual(["journal", "raster", "plakat"]);
    expect(systemsFor("urgent")).toEqual(["raster", "klar", "plakat"]);
    expect(systemsFor("industry")).toEqual(["raster", "werkstoff", "klar"]);
    expect(systemsFor("standard")).toEqual(["raster", "journal", "klar"]);
  });
  test("Barbershop über den Namen erkannt", () => {
    expect(isBarberShop("Friseursalon", "Kante Barbershop")).toBe(true);
    expect(isBarberShop("Friseursalon", "Salon Lindner")).toBe(false);
    expect(systemsForDoc({ businessCategory: "Friseursalon", businessName: "Kante Barbershop", blueprintFamily: "beauty" })[0]).toBe("plakat");
  });
  test("Gastro ohne erkennbare Unterart → Restaurant-Zeile", () => {
    expect(systemsFor("gastro")).toEqual(["nacht", "journal", "werkstoff"]);
  });
});
