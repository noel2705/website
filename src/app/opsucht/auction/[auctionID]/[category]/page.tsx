import fetch from "node-fetch";
import {Page} from "@/app/opsucht/auction/types";

export default async function AuctionItemPage({
                                                  params,
                                              }: {
    params: Promise<{ auctionID: string, category: string }>;
}) {
    const {auctionID, category} = await params;

    const data: Page[] = await getAuctionItem(auctionID, category);

    return (
        <>
            {data.map(a => (
                <div key={a.uid}>
                    <h3>{a.item.displayName}</h3>
                    <p>Verkäufer: {a.seller}</p>
                    <p>Aktuelles Gebot: {a.currentBid}€</p>
                </div>
            ))}
        </>
    );
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