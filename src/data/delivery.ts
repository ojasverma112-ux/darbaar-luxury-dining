// Delivery zones for Delhi Darbaar — postcode-based pricing.
// Source: pricing table provided by the restaurant.

export interface DeliveryZone {
  /** 4-digit Dutch postcodes covered by this zone */
  postcodes: string[];
  /** Minimum order amount in EUR */
  minOrder: number;
  /** Standard delivery fee in EUR */
  fee: number;
  /** If set, fee becomes 0 when subtotal >= freeAbove */
  freeAbove?: number;
  /** Friendly area name */
  area: string;
}

export const deliveryZones: DeliveryZone[] = [
  {
    area: "Hilversum centrum",
    postcodes: ["1211", "1212", "1213", "1214", "1215", "1216", "1217"],
    minOrder: 20,
    fee: 2.5,
    freeAbove: 40,
  },
  {
    area: "Hilversum 1218",
    postcodes: ["1218"],
    minOrder: 35,
    fee: 6.5,
  },
  {
    area: "Hilversum zuid",
    postcodes: ["1221", "1222", "1223"],
    minOrder: 20,
    fee: 2.5,
    freeAbove: 40,
  },
  {
    area: "Loosdrecht 1231",
    postcodes: ["1231"],
    minOrder: 35,
    fee: 2.95,
  },
  {
    area: "Kortenhoef / 's-Graveland",
    postcodes: ["1241", "1243"],
    minOrder: 35,
    fee: 5.5,
  },
  {
    area: "Laren",
    postcodes: ["1251"],
    minOrder: 35,
    fee: 4.95,
  },
  {
    area: "Blaricum",
    postcodes: ["1261"],
    minOrder: 35,
    fee: 7.5,
  },
  {
    area: "Huizen",
    postcodes: ["1271", "1272", "1273", "1274", "1275", "1276", "1277"],
    minOrder: 35,
    fee: 9.5,
  },
  {
    area: "Bussum",
    postcodes: ["1401", "1402", "1403", "1404", "1405", "1406"],
    minOrder: 35,
    fee: 5.5,
  },
  {
    area: "Naarden",
    postcodes: ["1411", "1412"],
    minOrder: 35,
    fee: 4.95,
  },
  {
    area: "Hollandsche Rading",
    postcodes: ["3739"],
    minOrder: 35,
    fee: 4.95,
  },
  {
    area: "Maartensdijk e.o.",
    postcodes: ["3741", "3742", "3743", "3744"],
    minOrder: 35,
    fee: 8.5,
  },
];

export interface DeliveryQuote {
  ok: boolean;
  zone?: DeliveryZone;
  fee: number;
  minOrder: number;
  reason?: "invalid" | "out-of-area" | "below-minimum";
}

/** Normalise any user input like "1211 KH", "1211kh", "1211" → "1211" */
export const normalizePostcode = (raw: string): string =>
  raw.replace(/\s+/g, "").slice(0, 4);

export const findZone = (postcode: string): DeliveryZone | undefined => {
  const code = normalizePostcode(postcode);
  if (!/^\d{4}$/.test(code)) return undefined;
  return deliveryZones.find((z) => z.postcodes.includes(code));
};

export const quoteDelivery = (postcode: string, subtotal: number): DeliveryQuote => {
  const code = normalizePostcode(postcode);
  if (!/^\d{4}$/.test(code)) {
    return { ok: false, fee: 0, minOrder: 0, reason: "invalid" };
  }
  const zone = findZone(code);
  if (!zone) {
    return { ok: false, fee: 0, minOrder: 0, reason: "out-of-area" };
  }
  const fee = zone.freeAbove && subtotal >= zone.freeAbove ? 0 : zone.fee;
  if (subtotal < zone.minOrder) {
    return { ok: false, zone, fee, minOrder: zone.minOrder, reason: "below-minimum" };
  }
  return { ok: true, zone, fee, minOrder: zone.minOrder };
};
