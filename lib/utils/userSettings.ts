export type AuctionCardSettings = {
    showImage: boolean;
    showDesiredBadge: boolean;
    showDisplayName: boolean;
    showMaterial: boolean;
    showAmount: boolean;
    showSeller: boolean;
    showPrice: boolean;
    showEndTime: boolean;
    showBids: boolean;
    showCategory: boolean;
};

export type UserSettings = {
    auctionCard: AuctionCardSettings;
};

export const DEFAULT_AUCTION_CARD_SETTINGS: AuctionCardSettings = {
    showImage: true,
    showDesiredBadge: true,
    showDisplayName: true,
    showMaterial: false,
    showAmount: false,
    showSeller: true,
    showPrice: true,
    showEndTime: true,
    showBids: true,
    showCategory: false,
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
    auctionCard: DEFAULT_AUCTION_CARD_SETTINGS,
};

const normalizeBoolean = (value: unknown, fallback: boolean) =>
    typeof value === "boolean" ? value : fallback;

export function mergeAuctionCardSettings(
    input?: Partial<AuctionCardSettings> | null
): AuctionCardSettings {
    const raw = input ?? {};
    return {
        showImage: normalizeBoolean(raw.showImage, DEFAULT_AUCTION_CARD_SETTINGS.showImage),
        showDesiredBadge: normalizeBoolean(raw.showDesiredBadge, DEFAULT_AUCTION_CARD_SETTINGS.showDesiredBadge),
        showDisplayName: normalizeBoolean(raw.showDisplayName, DEFAULT_AUCTION_CARD_SETTINGS.showDisplayName),
        showMaterial: normalizeBoolean(raw.showMaterial, DEFAULT_AUCTION_CARD_SETTINGS.showMaterial),
        showAmount: normalizeBoolean(raw.showAmount, DEFAULT_AUCTION_CARD_SETTINGS.showAmount),
        showSeller: normalizeBoolean(raw.showSeller, DEFAULT_AUCTION_CARD_SETTINGS.showSeller),
        showPrice: normalizeBoolean(raw.showPrice, DEFAULT_AUCTION_CARD_SETTINGS.showPrice),
        showEndTime: normalizeBoolean(raw.showEndTime, DEFAULT_AUCTION_CARD_SETTINGS.showEndTime),
        showBids: normalizeBoolean(raw.showBids, DEFAULT_AUCTION_CARD_SETTINGS.showBids),
        showCategory: normalizeBoolean(raw.showCategory, DEFAULT_AUCTION_CARD_SETTINGS.showCategory),
    };
}

export function mergeUserSettings(input?: Partial<UserSettings> | null): UserSettings {
    const raw = input ?? {};
    return {
        auctionCard: mergeAuctionCardSettings(raw.auctionCard),
    };
}
