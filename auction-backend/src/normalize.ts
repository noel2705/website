import type { Item, Page } from "./types.js";

const toString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const toBids = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value).reduce<Record<string, number>>((acc, [key, raw]) => {
    const amount = toNumber(raw, Number.NaN);
    if (Number.isFinite(amount)) acc[key] = amount;
    return acc;
  }, {});
};

export const normalizeItem = (value: unknown): Item => {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const material = toString(source.material, "BARRIER");
  const displayName = toString(source.displayName, material);

  return {
    material,
    icon: toString(source.icon, ""),
    amount: toNumber(source.amount, 1),
    displayName,
    lore: toStringArray(source.lore),
    enchantments:
      source.enchantments && typeof source.enchantments === "object" && !Array.isArray(source.enchantments)
        ? Object.entries(source.enchantments as Record<string, unknown>).reduce<Record<string, number>>(
            (acc, [key, raw]) => {
              const level = toNumber(raw, Number.NaN);
              if (Number.isFinite(level)) acc[key] = level;
              return acc;
            },
            {},
          )
        : {},
  };
};

export const normalizeAuction = (value: unknown): Page => {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const bids = toBids(source.bids);
  const highestBidder =
    toString(source.highestBidder) || Object.entries(bids).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  return {
    uid: toString(source.uid),
    seller: toString(source.seller),
    item: normalizeItem(source.item),
    category: toString(source.category, "sub_other"),
    startBid: toNumber(source.startBid, 0),
    currentBid: toNumber(source.currentBid, toNumber(source.startBid, 0)),
    highestBidder,
    bids,
    startTime: toString(source.startTime),
    endTime: toString(source.endTime),
  };
};

export const normalizeAuctions = (value: unknown): Page[] => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeAuction).filter((entry) => Boolean(entry.uid));
};
