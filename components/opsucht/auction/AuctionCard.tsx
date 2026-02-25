'use client'
import {Page} from "@/app/opsucht/auction/types";
import {formatMoney, getAmountBids, getItemIcon, getItemImage, isDesired} from "@/lib/utils/auction";
import {ReactNode, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import "@/app/opsucht/auction/auction.css";
function AuctionCard({
                                auction,
                                auctionSellerName
                            }: {
    auction: Page;
    auctionSellerName: ReactNode;
}) {
    const itemName = auction.item.displayName ?? auction.item.material;
    const currentPrice = auction.currentBid;
    const img = getItemImage(auction)
    const endDate = auction.endTime;
    const amountBids = getAmountBids(auction.bids);
    const isdesired = isDesired(auction);
    const router = useRouter();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const endText = useMemo(() => {
        const milliToEnd = new Date(endDate).getTime() - now;

        if (milliToEnd <= 0) {
            return "Beendet";
        }

        const secToEnd = Math.floor(milliToEnd / 1000);
        const seconds = secToEnd % 60;
        const minutes = Math.floor(secToEnd / 60) % 60;
        const hours = Math.floor(secToEnd / 3600);

        return `${hours}h ${minutes}m ${seconds}s`;
    }, [endDate, now]);

    return (
        <div className={`auction-card ${isdesired ? "desired" : ""}`}>


            <div className="item-image-container">
                <img
                    onError={(e) => {
                        e.currentTarget.src = `https://img.mc-api.io/${auction.item.material.toLowerCase()}.png`;
                    }}
                    loading="lazy"
                    src={img}
                    className="auction-item-img"
                    alt={itemName}
                />

                {isdesired && (
                    <img
                        src="/desired.jpg"
                        alt="Begehrt"
                        className="desired-icon"
                    />
                )}
            </div>
            <h2 className="auction-title">{itemName}</h2>

            <div className="auction-details">
                <p className={"auction-seller"}>Verkäufer: {auctionSellerName}</p>
                <div className="price-row">
                    <p>Preis: {formatMoney(currentPrice) ?? "N/A"}</p>
                    <img src="/custom-items/money.svg" alt="Icon" width="24" height="24"/>
                </div>




                {endText === "Beendet" && (
                    <p className={"red-text"}>{endText}</p>
                )}

                {endText !== "Beendet" && (
                    <p>Endet in: {endText}</p>
                )}

                <p className={amountBids > 0 ? "green-text" : ""}>
                    Gebote: {amountBids}
                </p>
            </div>

            <button
                className="auction-button"
                onClick={() =>
                    router.push(`/opsucht/auction/${auction.uid}/${auction.category}`)
                    //    router.push(`/opsucht/auction/item?data=${encodeBase64(auction)}`)
                }
            >
                Informationen
            </button>
        </div>
    )
        ;
}

export default AuctionCard