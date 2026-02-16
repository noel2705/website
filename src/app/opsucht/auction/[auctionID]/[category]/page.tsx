import fetch from "node-fetch";
import {Page} from "@/app/opsucht/auction/types";
import BackButton from "@/components/opsucht/auction/BackButton";
import "./auctionItem.css";
import {formatEndTime, formatMoney, getAmountBids} from "@/lib/auction";
import EndTimeCard from "@/components/opsucht/auction/EndTimeCard";


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

                    <div className="info-bar">
                        <BackButton />

                        <span>{getAmountBids(a.bids)} Gebote</span>
                        <span>Aktuell: {formatMoney(a.currentBid)}</span>
                        <span>Start: {formatMoney(a.startBid)}</span>

                        <div className="time">
                            <EndTimeCard endTime={a.endTime} />
                        </div>
                    </div>



                </div>
            ))}
        </>
    )
        ;
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