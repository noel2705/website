import {Item, Page} from "@/app/opsucht/auction/types";
import {IUser} from "@/lib/utils/userTypes";
export function formatMoney(money: number) {
    if (money < 1000) return money.toLocaleString('en-us', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "$";
    if (money < 1000000) return (money / 1000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "K";
    if (money < 1000000000) return (money / 1000000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "M";
    if (money < 1000000000000) return (money / 1000000000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "Mrd";
    return (money / 1000000000000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "Bio";
}

export function getAmountBids(bids: Record<string, number>) {
    return Object.keys(bids).length;
}

export function getItemIcon(item: Item) {
    if (item.icon && item.icon.trim() !== "") return item.icon;
    const normalized = item.displayName?.toLowerCase().replace(/[´’']/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "";
    return `/custom-items/${normalized}.png`;
};


export function isDesired(auction: Page) {
    const totalBids = getAmountBids(auction.bids);
    const uniqueBidders = getAmountUniqueBidders(auction.bids);

    return totalBids > 5 && uniqueBidders >= 5;
}


export function getAmountUniqueBidders(bids: Record<string, number>) {
    return Object.keys(bids).length;
}

export function formatEndTime(endTime: string, currentTime: Date) {


    const now = Date.now();
    const milliToEnd = new Date(endTime).getTime() - now;

    if (milliToEnd <= 0) {
        return "Beendet";
    }

    const secToEnd = Math.floor(milliToEnd / 1000);
    const seconds = secToEnd % 60;
    const minutes = Math.floor(secToEnd / 60) % 60;
    const hours = Math.floor(secToEnd / 3600);

    return `${hours}h ${minutes}m ${seconds}s`;

}


export async function getActiveAuction(userUID: string) {
    const url = "https://api.opsucht.net/auctions/active"

    const res = await fetch(url)

    const data: Page[] = await res.json();

    return data.filter(value => userUID === value.seller || Object.keys(value.bids).some(bid => bid === userUID));
}


export const getItemImage = (auction: Page) => {
    return auction.item.icon ?? getItemIcon(auction.item);
}


export async function isHighestBidder(auction: any, userID: string): Promise<boolean> {
    if (!auction.bids) return false;

    const bids = Object.values(auction.bids) as number[];
    const highestBid = Math.max(...bids);
    return auction.bids[userID] === highestBid;
}


export const normalizeUUID = (id: string) => id.replace(/-/g, "").toLowerCase()

export const formatUUID = (uuid: string) =>
    uuid.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5")


