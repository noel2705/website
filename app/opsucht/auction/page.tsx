import AuctionClient from "./AuctionClient";
import type { Page } from "../../../lib/utils/types";
import { normalizeAuctions } from "@/lib/utils/auction/normalize";


export default async function Page() {
    const res = await fetch("https://api.opsucht.net/auctions/active");
    const data: Page[] = normalizeAuctions(await res.json());


    return (
        <div className="app-shell">
            <AuctionClient initialAuction={data} />
        </div>
    );
}

