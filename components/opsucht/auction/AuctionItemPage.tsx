'use client';

import type {Page} from "@/lib/utils/types";
import BackButton from "@/components/buttons/BackButton";
import "../../css/auction/auctionItem.css";
import {formatMoney, getItemImage} from "@/lib/utils/auction/auction";
import EndTimeCard from "@/components/opsucht/auction/EndTimeCard";
import PriceChart from "@/components/opsucht/auction/PriceChart";
import ReloadButton from "@/components/buttons/ReloadButton";
import UserPageButton from "@/components/opsucht/auction/UserPageButton";
import UserName from "@/components/opsucht/auction/UserName";
import {getSessionUser} from "@/hooks/useUser";
import {useEffect, useState} from "react";
import {
    getAverageItemPrice,
    isAuctionMarked,
    setAuctionMarked,
    unmarkAuction
} from "@/lib/utils/auction/auction.server";
import ColoredLore from "@/components/opsucht/auction/ColoredLore";

export default function AuctionItemPage({
                                            data,
                                            auctionID,
                                            onBack,
                                        }: {
    data: Page[];
    auctionID: string;
    onBack?: () => void;
}) {
    const {user, loading} = getSessionUser();
    const [isMarked, setIsMarked] = useState(false);
    const [averageItemPrice, setAverageItemPrice] = useState<number | null | undefined>(undefined);

    useEffect(() => {
        async function loadMarked() {
            if (!user) return;

            const res = await isAuctionMarked(user, auctionID);
            setIsMarked(res);
        }

        loadMarked();
    }, [user, auctionID]);

    useEffect(() => {
        async function loadAverageItemPrice() {
            if (!data || data.length === 0) return;

            const itemName = data[0].item.displayName ?? data[0].item.material;

            const price = await getAverageItemPrice(itemName);
            setAverageItemPrice(price);
        }

        loadAverageItemPrice();
    }, [data]);


    if (loading) return null;

    return (
        <>
            {data.map((a) => {
                const bidsSorted = Object.entries(a.bids).sort((a, b) => b[1] - a[1]);

                return (
                    <div key={a.uid} className="auction-container">
                        <ReloadButton/>

                        <div className="info-name">
                            <img
                                onError={(e) => {
                                    e.currentTarget.src = `https://img.mc-api.io/${a.item.material.toLowerCase()}.png`;
                                }}
                                src={getItemImage(a)} alt="" className="item-icon"/>
                            <h2>{a.item.displayName ?? a.item.material}</h2>
                            <img
                                onError={(e) => {
                                    e.currentTarget.src = `https://img.mc-api.io/${a.item.material.toLowerCase()}.png`;
                                }}
                                src={getItemImage(a)} alt="" className="item-icon"/>
                        </div>

                        <div className="info-bar">
                            {onBack ? (
                                <button className="backButton" onClick={onBack}>
                                    Zurück
                                </button>
                            ) : (
                                <BackButton/>
                            )}
                            <span>{bidsSorted.length} Gebote</span>
                            <span>Aktuell: {formatMoney(a.currentBid)}</span>
                            <button
                                onClick={() => {
                                    if (isMarked) {
                                        unmarkAuction(user, auctionID).then(() => setIsMarked(false));
                                    } else {
                                        setAuctionMarked(user, auctionID).then(() => setIsMarked(true));
                                    }
                                }}
                            >
                                ´ {isMarked && !user ? "Gemerkt" : "Merken"}
                            </button>
                            <span>Start: {formatMoney(a.startBid)}</span>

                            <span>
  Durchschnitts Preis: {averageItemPrice === undefined
                                ? "Wird geladen..."
                                : averageItemPrice === null
                                    ? "Keine Bekannt"
                                    : formatMoney(averageItemPrice)}
</span>
                            <div className="time">
                                <EndTimeCard endTime={a.endTime}/>
                            </div>
                        </div>

                        <div className="lower-section">
                            <div className="price-card">
                                <PriceChart bids={a.bids}/>
                            </div>

                            <div className="side-wrapper">
                                {(a.item.lore?.length || Object.keys(a.item.enchantments || {}).length) > 0 && (
                                    <div className="side-panel">
                                        {a.item.lore?.length > 0 && (
                                            <div>
                                                <h3>Lore</h3>
                                                <ColoredLore loreLines={a.item.lore}/>
                                            </div>
                                        )}

                                        {a.item.enchantments && Object.keys(a.item.enchantments).length > 0 && (
                                            <div style={{marginTop: 14}}>
                                                <h3>Enchantments</h3>
                                                <ul>
                                                    {Object.entries(a.item.enchantments).map(([key, level]) => (
                                                        <li key={key}>
                                                            {key.replace("minecraft:", "").replace(/_/g, " ")} {level}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {bidsSorted.length > 0 ? (
                            <div className="bids-panel">
                                <h3>Bieterliste</h3>
                                <ul className="bids-list">
                                    {bidsSorted.map(([uuid, amount], index) => (
                                        <li key={uuid}>
                                            <span className="rank">#{index + 1}</span>
                                            <UserPageButton name={<UserName uuid={uuid}/>} uuid={uuid}/>
                                            <span className="price">{formatMoney(amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bids-panel">
                                <ul className="bids-list">
                                    <h1>Keine Aktiven Bieter</h1>
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}
