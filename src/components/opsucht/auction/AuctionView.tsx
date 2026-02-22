import React from 'react';
import { getActiveAuction, isHighestBidder } from "@/lib/auction";
import AuctionCard from "@/components/opsucht/auction/AuctionCard";
import UserName from "@/components/opsucht/auction/UserName";
import "./css/userAuctions.css";

export default async function AuctionView({ userID }: { userID: string }) {
    const userAuctions = await getActiveAuction(userID);

    const eigeneAuktionen = userAuctions.filter(a => a.seller === userID);
    const gebote = userAuctions.filter(a => a.bids && userID in a.bids);

    return (
        <div className="user-auctions-container">

            <h1>
                Auktionsprofil: <UserName uuid={userID} />
            </h1>

            {eigeneAuktionen.length === 0 && gebote.length === 0 && (
                <p className="no-auctions">
                    Keine aktiven Auktionen oder Gebote gefunden.
                </p>
            )}

            {eigeneAuktionen.length > 0 && (
                <section>
                    <h2 className="own-auction">Eigene Auktionen</h2>

                    <div className="auction-grid">
                        {eigeneAuktionen.map(a => (
                            <AuctionCard
                                key={a.uid}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller} />}
                            />
                        ))}
                    </div>
                </section>
            )}

            {gebote.length > 0 && (
                <section>
                    <h2 className="bid-auction">Gebote</h2>

                    <div className="auction-grid">
                        {gebote.map(async a => {
                            const highest = await isHighestBidder(a, userID);

                            return (
                                <div key={a.uid} className="auction-wrapper">
                                    <AuctionCard
                                        auction={a}
                                        auctionSellerName={<UserName uuid={a.seller} />}
                                    />

                                    <div className="bid-status">
                                        <span className={highest ? "highest" : "outbid"}>
                                            {highest ? "Höchstbietender" : "Überboten"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

        </div>
    );
}