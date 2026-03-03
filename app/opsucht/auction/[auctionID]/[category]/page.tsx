import { Page } from "@/lib/utils/types";
import AuctionItemPage from "@/components/opsucht/auction/AuctionItemPage";

export default async function MainPage({
                                           params,
                                       }: {
    params: { auctionID: string; category: string };
}) {
    const { auctionID, category } = await params;

    const data: Page[] = await getAuctionItem(auctionID, category);

    return (
        <div className="app-shell">
            <AuctionItemPage data={data} auctionID={auctionID} />
        </div>
    );
}

import { db } from "@/lib/utils/db";

async function getAuctionItem(uid: string, category: string): Promise<Page[]> {
    // 1️⃣ Aktive Auktionen prüfen
    const activeUrl = `https://api.opsucht.net/auctions/active?category=${category}`;
    const activeResponse = await fetch(activeUrl, { cache: "no-store" });

    if (!activeResponse.ok) {
        throw new Error(
            `Fehler beim Abrufen der aktiven Auktionen: ${activeResponse.status}`
        );
    }

    const activeData = await activeResponse.json();

    if (!Array.isArray(activeData)) {
        throw new Error("API hat kein Array zurückgegeben");
    }

    const foundActive = activeData.filter((item: Page) => item.uid === uid);

    if (foundActive.length > 0) {
        return foundActive;
    }

    const expired = await db.oneOrNone(
        `
        SELECT payload
        FROM expired_auctions
        WHERE uid = $1
        `,
        [uid]
    );

    if (!expired) {
        return [];
    }

    return [expired.payload];
}