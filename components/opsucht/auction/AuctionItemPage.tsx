'use client';

import {Page} from "@/app/opsucht/auction/types";
import BackButton from "@/components/opsucht/auction/BackButton";
import "./css/auctionItem.css";
import {
    formatMoney,
    getItemIcon,
} from "@/lib/utils/auction";
import EndTimeCard from "@/components/opsucht/auction/EndTimeCard";
import PriceChart from "@/components/opsucht/auction/PriceChart";
import ReloadButton from "@/components/opsucht/auction/ReloadButton";
import AuctionExpired from "@/components/opsucht/auction/AuctionExpired";
import UserPageButton from "@/components/opsucht/auction/UserPageButton";
import UserName from "@/components/opsucht/auction/UserName";
import {getSessionUser} from "@/hooks/useUser";
import {useEffect, useState} from "react";
import {isAuctionMarked} from "@/lib/utils/auction.server";

export default function AuctionItemPage({
                                            data,
                                            auctionID,
                                        }: {
    data: Page[];
    auctionID: string;
}) {
    const {user, loading} = getSessionUser();
    const [isMarked, setIsMarked] = useState(false);
    const isExpired =
        data.length > 0 && new Date(data[0].endTime) < new Date();

    useEffect(() => {
        async function loadMarked() {
            if (!user) return;

            const res = await isAuctionMarked(user, auctionID);
            setIsMarked(res);
        }

        loadMarked();
    }, [user, auctionID]);

    if (loading) return null;

    return (
        <>
            {data.map((a) => {
                const bidsSorted = Object.entries(a.bids).sort(
                    (a, b) => b[1] - a[1]
                );

                return isExpired ? (
                    <AuctionExpired key={a.uid}/>
                ) : (
                    <div key={a.uid} className="auction-container">
                        <ReloadButton/>

                        <div className="info-name">
                            <img src={getItemIcon(a.item)} alt="" className="item-icon"/>
                            <h2>{a.item.displayName ?? a.item.material}</h2>
                            <img src={getItemIcon(a.item)} alt="" className="item-icon"/>
                        </div>

                        <div className="info-bar">
                            <BackButton/>
                            <span>{bidsSorted.length} Gebote</span>
                            <span>Aktuell: {formatMoney(a.currentBid)}</span>
                            <button onClick={e => {
                                setIsMarked(prev => !prev);

                            }}>{isMarked ? "Gemerkt" : "Merken"}</button>
                            <span>Start: {formatMoney(a.startBid)}</span>
                            <div className="time">
                                <EndTimeCard endTime={a.endTime}/>
                            </div>
                        </div>

                        <div className="lower-section">
                            <div className="price-card">
                                <PriceChart bids={a.bids}/>
                            </div>

                            <div className="side-wrapper">
                                {(a.item.lore?.length ||
                                        Object.keys(a.item.enchantments || {}).length) >
                                    0 && (
                                        <div className="side-panel">
                                            {a.item.lore?.length > 0 && (
                                                <div>
                                                    <h3>Lore</h3>
                                                    <ul>
                                                        {a.item.lore.map((line, i) => (
                                                            <li key={i}>{line}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {a.item.enchantments &&
                                                Object.keys(a.item.enchantments).length > 0 && (
                                                    <div style={{marginTop: 14}}>
                                                        <h3>Enchantments</h3>
                                                        <ul>
                                                            {Object.entries(a.item.enchantments).map(
                                                                ([key, level]) => (
                                                                    <li key={key}>
                                                                        {key
                                                                            .replace("minecraft:", "")
                                                                            .replace(/_/g, " ")}{" "}
                                                                        {level}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {bidsSorted.length > 0 && (
                            <div className="bids-panel">
                                <h3>Bieterliste</h3>
                                <ul className="bids-list">
                                    {bidsSorted.map(([uuid, amount], index) => (
                                        <li key={uuid}>
                                            <span className="rank">#{index + 1}</span>
                                            <UserPageButton
                                                name={<UserName uuid={uuid}/>}
                                                uuid={uuid}
                                            />
                                            <span className="price">
                        {formatMoney(amount)}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}