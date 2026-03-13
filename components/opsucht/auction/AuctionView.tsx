import React from 'react';
import {formatMoney, getActiveAuction} from "@/lib/utils/auction/auction";
import UserName from "@/components/opsucht/auction/UserName";
import "../../css/auction/userAuctions.css";
import StarBorder from "@/components/icon/animated/StartBorder";
import {getMarkedAuctions} from "@/lib/utils/auction/auction.server";
import {EventEmitter} from 'events';
import {Page} from "@/lib/utils/types";
import BackButton from "@/components/buttons/BackButton";

export default async function AuctionView({userID}: { userID: string }) {
    const emitter = new EventEmitter();
    EventEmitter.setMaxListeners(EventEmitter.getMaxListeners(emitter) + 2);
    const userAuctions = await getActiveAuction(userID);
    const eigeneAuktionen = userAuctions.filter(a => a.seller === userID);
    const gebote = userAuctions.filter(a => a.bids && userID in a.bids);
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
            if (a.bids && Object.keys(a.bids).length > 0) {
                money += Object.values(a.bids).reduce((sum, bid) => sum + bid, 0);
            }
        });



        return money;
    };
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


                <h3>Aktive Auktionen: {userAuctions.length} </h3>
                <h3>Abgelaufene Makierte Auktionen: {markedExpiredAuctions.length} </h3>
                <h3>Ausgegebenes Geld {formatMoney(moneySpent())}</h3>


            </div>


        </div>
    );
}
