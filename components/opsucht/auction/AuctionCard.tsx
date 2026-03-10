'use client'
import {Page} from "@/lib/utils/types";
import {formatMoney, getAmountBids, getItemIcon, getItemImage, isDesired} from "@/lib/utils/auction/auction";
import {ReactNode, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import "@/components/css/auction/auction.css";
import UserPageButton from "@/components/opsucht/auction/UserPageButton";

type AuctionMode = "active" | "expired";

function AuctionCard({
                         auction,
                         auctionSellerName,
                         mode
                     }: {
    auction: Page;
    auctionSellerName: ReactNode;
    mode: AuctionMode;
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

    const {endText, isExpired, endedAtText} = useMemo(() => {
        const milliToEnd = new Date(endDate).getTime() - now;
        const endedAt = new Date(endDate);
        const formattedEndedAt = new Intl.DateTimeFormat("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(endedAt);

        if (milliToEnd <= 0) {
            return {
                endText: "Beendet",
                isExpired: true,
                endedAtText: formattedEndedAt,
            };
        }

        const secToEnd = Math.floor(milliToEnd / 1000);

        const seconds = secToEnd % 60;
        const minutes = Math.floor(secToEnd / 60) % 60;
        const hours = Math.floor(secToEnd / 3600) % 24;
        const days = Math.floor(secToEnd / 86400);

        let endText: string;

        if (days > 0) {
            endText = `${days}d ${hours}h`;
        } else if (hours > 0) {
            endText = `${hours}h ${minutes}m`;
        } else {
            endText = `${minutes}m ${seconds}s`;
        }

        return {
            endText,
            isExpired: false,
            endedAtText: formattedEndedAt,
        };
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

                <p className="auction-seller">
                    Verkäufer: <UserPageButton name={auctionSellerName} uuid={auction.seller}/>
                </p>
                <div className="price-row">
                    <p>Preis: {formatMoney(currentPrice) ?? "N/A"}</p>
                    <img src="/custom-items/money.svg" alt="Icon" width="24" height="24"/>
                </div>

                {mode === "expired" && isExpired ? (
                    <p className="yellow-text">Beendet am: {endedAtText}</p>
                ) : isExpired ? (
                    <p className="red-text">Beendet</p>
                ) : (
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
                }
            >
                Informationen
            </button>
        </div>
    )
        ;
}

export default AuctionCard
