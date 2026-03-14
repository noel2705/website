import React from 'react';
import {formatMoney, getActiveAuction, getExpiredAuctions} from "@/lib/utils/auction/auction";
import UserName from "@/components/opsucht/auction/UserName";
import "../../css/auction/userAuctions.css";
import StarBorder from "@/components/icon/animated/StartBorder";
import {getMarkedAuctions} from "@/lib/utils/auction/auction.server";
import {EventEmitter} from 'events';
import {Page} from "@/lib/utils/types";
import BackButton from "@/components/buttons/BackButton";
import AuctionCard from "@/components/opsucht/auction/AuctionCard";

export default async function AuctionView({userID}: { userID: string }) {
    const emitter = new EventEmitter();
    EventEmitter.setMaxListeners(EventEmitter.getMaxListeners(emitter) + 2);
    const activeAuctions = await getActiveAuction(userID);
    const eigeneAuktionen = activeAuctions.filter(a => a.seller === userID);
    const expiredAuctions = await getExpiredAuctions(userID);
    const gebote = activeAuctions.filter(a => a.bids && userID in a.bids);


    const markedAuctions: Page[] = await getMarkedAuctions(userID);
    const activeMarkedAuctions = markedAuctions.filter(a => {
        const end = Date.parse(a.endTime);
        const now = Date.now();
        return end > now;
    });

    const markedExpiredAuctions = markedAuctions.filter(a => {
        const end = Date.parse(a.endTime);
        const now = Date.now();
        return end <= now;
    });

    const moneySpent = () => {
        let money: number = 0;

        gebote.forEach(a => {
            if (a.bids && a.bids[userID]) {
                const allBidValues = Object.values(a.bids);
                const highestBid = Math.max(...allBidValues);

                if (a.bids[userID] === highestBid) {
                    money += a.bids[userID];
                }
            }
        });


        return money;
    };

    const earnedMoney = () => {
        let money: number = 0;

        eigeneAuktionen.forEach(a => {
            const bids = Object.values(a.bids);
            if (bids.length > 0) {
                money += Math.max(...bids);
            }
        });

        expiredAuctions.forEach(a => {
            const bids = Object.values(a.bids);
            if (bids.length > 0) {
                money += Math.max(...bids);
            }
        });

        return money;
    }


    return (
        <div className="user-auctions-container">


            <div className="header-container" style={{position: "relative"}}>
                <BackButton/>
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


            <div className={"user-container"}>


                <h3>Aktive Auktionen: {eigeneAuktionen.length} </h3>
                <h3>Abgelaufene Auktionen: {expiredAuctions.length} </h3>
                <h3>Ausgegebenes Geld {formatMoney(moneySpent())}</h3>
                <h3>Verdientes Geld {formatMoney(earnedMoney())}</h3>


            </div>


            {eigeneAuktionen.length > 0 && <section>
                <h2 className="own-auction">Eigene Auktionen</h2>

                <div className="auction-grid">
                    {eigeneAuktionen.map(a => (
                        <AuctionCard
                            key={a.uid}
                            mode={"active"}
                            auction={a}
                            auctionSellerName={<UserName uuid={a.seller}/>}
                        />
                    ))}
                </div>
            </section>}


            {gebote.length > 0 && <section>
                <h2 className="own-auction">Gebote</h2>

                <div className="auction-grid">
                    {gebote.map(a => (
                        <AuctionCard
                            key={a.uid}
                            mode={"active"}
                            auction={a}
                            auctionSellerName={<UserName uuid={a.seller}/>}
                        />
                    ))}
                </div>
            </section>}


            {expiredAuctions.length > 0 && <section>
                <h2 className="own-auction">Abgelaufene Auktionen</h2>

                <div className="auction-grid">
                    {expiredAuctions.map(a => (
                        <AuctionCard
                            key={a.uid}
                            mode={"expired"}
                            auction={a}
                            auctionSellerName={<UserName uuid={a.seller}/>}
                        />
                    ))}
                </div>
            </section>

            }


        </div>
    );
}
