import { Page } from "@/app/opsucht/auction/types";
import AuctionItemPage from "@/components/opsucht/auction/AuctionItemPage";

export default async function MainPage({
                                           params,
                                       }: {
    params: { auctionID: string; category: string };
}) {
    const { auctionID, category } = await params;

    const data: Page[] = await getAuctionItem(auctionID, category);

    return <AuctionItemPage data={data} auctionID={auctionID} />;
}

async function getAuctionItem(uid: string, category: string): Promise<Page[]> {
    const url = `https://api.opsucht.net/auctions/active?category=${category}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Auktionen: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("API hat kein Array zurückgegeben");
    }

    return data.filter((item: Page) => item.uid === uid);
}
