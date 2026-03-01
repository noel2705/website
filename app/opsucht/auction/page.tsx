import AuctionClient from "./AuctionClient";
// @ts-ignore
import { Page } from "./types";

export default async function Page() {
    const res = await fetch("https://api.opsucht.net/auctions/active");
    const data: Page[] = await res.json();


    return (
        <div className="app-shell">
            <AuctionClient initialAuction={data} />
        </div>
    );
}

