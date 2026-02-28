import React from 'react';
import {getActiveAuction, isHighestBidder} from "@/lib/utils/auction";
import AuctionCard from "@/components/opsucht/auction/AuctionCard";
import UserName from "@/components/opsucht/auction/UserName";
import "../../css/auction/userAuctions.css";
import StarBorder from "@/components/icon/animated/StartBorder";
import {getMarkedAuctions} from "@/lib/utils/auction.server";
import {EventEmitter} from 'events';
import {Page} from "@/app/opsucht/auction/types";
import BackButton from "@/components/buttons/BackButton";

export default async function AuctionView({userID}: { userID: string }) {
    const emitter = new EventEmitter();
    EventEmitter.setMaxListeners(EventEmitter.getMaxListeners(emitter) + 2);
    const userAuctions = await getActiveAuction(userID);
    const eigeneAuktionen = userAuctions.filter(a => a.seller === userID);
    const gebote = userAuctions.filter(a => a.bids && userID in a.bids);
    const markedAuctions: Page[] = await getMarkedAuctions(userID);


    return (
        <div className="user-auctions-container">


            <div className="header-container" style={{ position: "relative" }}>
                <BackButton />
                <StarBorder
                    as="h1"
                    className="star-title-center"
                    color="cyan"
                    speed="5s"
                >
                    Auktionsprofil: <UserName uuid={userID}/>
                </StarBorder>
            </div>


            {eigeneAuktionen.length === 0 && gebote.length === 0 && markedAuctions.length == 0 && (
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
                                auctionSellerName={<UserName uuid={a.seller}/>}
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
                                        auctionSellerName={<UserName uuid={a.seller}/>}
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


            {markedAuctions.length > 0 && (
                <section>
                    <h2 className="own-auction">Makierte Auktionen</h2>

                    <div className="auction-grid">
                        {markedAuctions.map(a => (
                            <AuctionCard
                                key={a.uid}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller}/>}
                            />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}
