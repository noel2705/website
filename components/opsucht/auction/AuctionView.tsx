import React from 'react';
import {formatMoney, getActiveAuction, getExpiredAuctions, getExpiredBidAuctions} from "@/lib/utils/auction/auction";
import UserName from "@/components/opsucht/auction/UserName";
import "../../css/auction/userAuctions.css";
import StarBorder from "@/components/icon/animated/StartBorder";
import {getMarkedAuctions} from "@/lib/utils/auction/auction.server";
import {EventEmitter} from 'events';
import {Page} from "@/lib/utils/types";
import BackButton from "@/components/buttons/BackButton";
import AuctionCard from "@/components/opsucht/auction/AuctionCard";
import {getUserSettings} from "@/lib/utils/userSettings.server";

export default async function AuctionView({
                                              userID, isDashBoardView
                                          }: {
    userID: string,
    isDashBoardView: boolean
}) {
    const emitter = new EventEmitter();
    EventEmitter.setMaxListeners(EventEmitter.getMaxListeners(emitter) + 2);
    const activeAuctions = await getActiveAuction(userID);
    const eigeneAuktionen = activeAuctions.filter(a => a.seller === userID);
    const expiredAuctions = await getExpiredAuctions(userID);
    let expiredBuyedAuctions = await getExpiredBidAuctions(userID);
    const gebote = activeAuctions.filter(a => a.bids && userID in a.bids);
    const settings = await getUserSettings(userID);
    const auctionCardSettings = settings.auctionCard;

    expiredBuyedAuctions = expiredBuyedAuctions.filter(a => {
        const highestBid = Math.max(...Object.values(a.bids));
        return a.bids[userID] === highestBid;
    });

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

        expiredAuctions.forEach(a => {
            if (a.bids && a.bids[userID]) {
                const allBidValues = Object.values(a.bids);
                const highestBid = Math.max(...allBidValues);

                if (a.bids[userID] === highestBid) {
                    money += a.bids[userID];
                }
            }
        });

        expiredBuyedAuctions.forEach(a => {
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

            <div className="auction-profile-hero">
                <div className="auction-profile-summary">
                    <h2>Übersicht</h2>
                    <p>Alle aktiven, abgelaufenen und markierten Auktionen im Blick.</p>
                </div>
                <div className="auction-stats-grid">
                    <div className="auction-stat-card">
                        <span className="stat-label">Eigene Auktionen</span>
                        <span className="stat-value">{eigeneAuktionen.length}</span>
                    </div>
                    <div className="auction-stat-card">
                        <span className="stat-label">Gebote</span>
                        <span className="stat-value">{gebote.length}</span>
                    </div>
                    <div className="auction-stat-card">
                        <span className="stat-label">Abgelaufen</span>
                        <span className="stat-value">{expiredAuctions.length}</span>
                    </div>
                    <div className="auction-stat-card">
                        <span className="stat-label">Merkliste</span>
                        <span className="stat-value">{markedAuctions.length}</span>
                    </div>
                    <div className="auction-stat-card">
                        <span className="stat-label">Ausgegeben</span>
                        <span className="stat-value">{formatMoney(moneySpent())}</span>
                    </div>
                    <div className="auction-stat-card">
                        <span className="stat-label">Verdient</span>
                        <span className="stat-value">{formatMoney(earnedMoney())}</span>
                    </div>
                </div>
            </div>


            {eigeneAuktionen.length === 0 && expiredBuyedAuctions.length === 0 && expiredAuctions.length === 0&& gebote.length === 0 && markedAuctions.length == 0 && (
                <p className="no-auctions">
                    Keine aktiven Auktionen oder Gebote gefunden.
                </p>
            )}


            {eigeneAuktionen.length > 0 && <section>
                <h2 className="own-auction">Eigene Auktionen</h2>

                <div className="auction-grid">
                    {eigeneAuktionen.map(a => (
                        <AuctionCard
                            key={a.uid}
                            mode={"active"}
                            auction={a}
                            auctionSellerName={<UserName uuid={a.seller}/>}
                            settings={auctionCardSettings}
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
                            settings={auctionCardSettings}
                        />
                    ))}
                </div>
            </section>}

            {expiredBuyedAuctions.length > 0 && <section>
                <h2 className="own-auction">Gekaufte Auktionen</h2>

                <div className="auction-grid">
                    {expiredBuyedAuctions.map(a => (
                        <AuctionCard
                            key={a.uid}
                            mode={"expired"}
                            auction={a}
                            auctionSellerName={<UserName uuid={a.seller}/>}
                            settings={auctionCardSettings}
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
                            settings={auctionCardSettings}
                        />
                    ))}
                </div>
            </section>

            }


            {markedExpiredAuctions.length > 0 && isDashBoardView && <section>
                <h2 className="own-auction">Abgelaufene Makierte Auktionen</h2>

                <div className="auction-grid">
                    {markedExpiredAuctions.map(a => (
                        <AuctionCard
                            key={a.uid}
                            mode={"expired"}
                            auction={a}
                            auctionSellerName={<UserName uuid={a.seller}/>}
                            settings={auctionCardSettings}
                        />
                    ))}
                </div>
            </section>

            }

            {activeMarkedAuctions.length > 0 && isDashBoardView && <section>
                <h2 className="own-auction">Makierte Auktionen</h2>

                <div className="auction-grid">
                    {activeMarkedAuctions.map(a => (
                        <AuctionCard
                            key={a.uid}
                            mode={"expired"}
                            auction={a}
                            auctionSellerName={<UserName uuid={a.seller}/>}
                            settings={auctionCardSettings}
                        />
                    ))}
                </div>
            </section>

            }


        </div>
    );
}
