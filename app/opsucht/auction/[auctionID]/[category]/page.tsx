import { Page } from "@/lib/utils/types";
import AuctionItemPage from "@/components/opsucht/auction/AuctionItemPage";
import { db } from "@/lib/utils/db";
import { normalizeAuction, normalizeAuctions } from "@/lib/utils/auction/normalize";

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

async function getAuctionItem(uid: string, category: string): Promise<Page[]> {
    const useCategory = category.startsWith("parent_") ? "" : `?category=${encodeURIComponent(category)}`;
    const activeUrl = `https://api.opsucht.net/auctions/active${useCategory}`;
    const activeResponse = await fetch(activeUrl, { cache: "no-store" });

    if (!activeResponse.ok) {
        throw new Error(
            `Fehler beim Abrufen der aktiven Auktionen: ${activeResponse.status}`
        );
    }

    const activeData = normalizeAuctions(await activeResponse.json());
    const foundActive = activeData.filter((item: Page) => item.uid === uid);

    if (foundActive.length > 0) {
        return foundActive;
    }

    const expired = await db.oneOrNone(
        `
        SELECT payload
        FROM expired_auctions_v2
        WHERE uid = $1
        `,
        [uid]
    );

    if (!expired) {
        return [];
    }

    return [normalizeAuction(expired.payload)];
}
