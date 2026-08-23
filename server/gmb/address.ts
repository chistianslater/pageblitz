/**
 * Deterministischer Adress-Parser für GMB-Places (Plan B7, Task 1).
 *
 * Zerlegt eine Google-Adresse in street/zip/city — bevorzugt aus den
 * strukturierten `address_components`, sonst per Regex aus der
 * `formatted_address`. Damit landet die echte GMB-Stadt (z. B. "Bocholt")
 * in den Generierungs-Fakten statt einer halluzinierten (§0 der B7-Spec:
 * Hero-Subline "…In München." für einen Betrieb in Bocholt).
 */

export type GmbAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type ParsedGmbAddress = {
  street?: string;
  zip?: string;
  city?: string;
};

/** "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland" → street/zip/city */
const FORMATTED_ADDRESS_RE = /(.+?),?\s*(\d{5})\s+([^,]+)/;

function findComponent(
  components: GmbAddressComponent[],
  type: string
): string | undefined {
  return components.find(c => c.types.includes(type))?.long_name;
}

export function parseGmbAddress(
  addressComponents?: GmbAddressComponent[] | null,
  formattedAddress?: string | null
): ParsedGmbAddress {
  const result: ParsedGmbAddress = {};

  if (addressComponents?.length) {
    const route = findComponent(addressComponents, "route");
    const streetNumber = findComponent(addressComponents, "street_number");
    if (route) {
      result.street = streetNumber ? `${route} ${streetNumber}` : route;
    }
    const zip = findComponent(addressComponents, "postal_code");
    if (zip) result.zip = zip;
    const city =
      findComponent(addressComponents, "locality") ??
      findComponent(addressComponents, "postal_town") ??
      findComponent(addressComponents, "sublocality") ??
      findComponent(addressComponents, "administrative_area_level_3");
    if (city) result.city = city;
  }

  // Fehlende Teile per Regex aus der formatted_address ergänzen
  if (formattedAddress && (!result.street || !result.zip || !result.city)) {
    const match = formattedAddress.match(FORMATTED_ADDRESS_RE);
    if (match) {
      if (!result.street) result.street = match[1].trim();
      if (!result.zip) result.zip = match[2];
      if (!result.city) result.city = match[3].trim();
    }
  }

  return result;
}
