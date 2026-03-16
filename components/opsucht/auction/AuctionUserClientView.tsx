'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/utils/auction/auction";
import UserName from "@/components/opsucht/auction/UserName";
import "../../css/auction/userAuctions.css";
import StarBorder from "@/components/icon/animated/StartBorder";
import AuctionCard from "@/components/opsucht/auction/AuctionCard";
import BackButton from "@/components/buttons/BackButton";
import { normalizeAuctions } from "@/lib/utils/auction/normalize";
import {
    AuctionCardSettings,
    DEFAULT_AUCTION_CARD_SETTINGS,
    mergeAuctionCardSettings,
} from "@/lib/utils/userSettings";
import type { Page } from "@/lib/utils/types";

type Props = {
    userID: string;
    isDashBoardView: boolean;
    onBack?: () => void;
    onSelectAuction?: (auction: Page) => void;
};

const EXPIRED_AUCTIONS_API_BASE =
    process.env.NEXT_PUBLIC_AUCTION_BACKEND_URL?.replace(/\/$/, "") ?? "";

export default function AuctionUserClientView({
    userID,
    isDashBoardView,
    onBack,
    onSelectAuction,
}: Props) {
    const [activeAuctions, setActiveAuctions] = useState<Page[]>([]);
    const [expiredAuctions, setExpiredAuctions] = useState<Page[]>([]);
    const [expiredBidAuctions, setExpiredBidAuctions] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const activeRes = await fetch("https://api.opsucht.net/auctions/active", {
                    cache: "no-store",
                });
                if (!activeRes.ok) throw new Error(`Aktive Auktionen: ${activeRes.status}`);
                const activeData = normalizeAuctions(await activeRes.json());
                const filteredActive = activeData.filter(
                    (value) =>
                        userID === value.seller ||
                        Object.keys(value.bids || {}).some((bid) => bid === userID)
                );

                const expiredBase = EXPIRED_AUCTIONS_API_BASE
                    ? `${EXPIRED_AUCTIONS_API_BASE}/api/expired-auctions`
                    : "/api/expired-auctions";

                const [expiredRes, expiredBidRes] = await Promise.all([
                    fetch(`${expiredBase}?seller=${encodeURIComponent(userID)}`, {
                        cache: "no-store",
                    }),
                    fetch(`${expiredBase}?bidder=${encodeURIComponent(userID)}`, {
                        cache: "no-store",
                    }),
                ]);

                if (!expiredRes.ok) {
                    throw new Error(`Abgelaufen (Seller): ${expiredRes.status}`);
                }
                if (!expiredBidRes.ok) {
                    throw new Error(`Abgelaufen (Bidder): ${expiredBidRes.status}`);
                }

                const expiredJson = await expiredRes.json();
                const expiredBidJson = await expiredBidRes.json();

                if (mounted) {
                    setActiveAuctions(filteredActive);
                    setExpiredAuctions(
                        normalizeAuctions(Array.isArray(expiredJson) ? expiredJson : expiredJson.items)
                    );
                    setExpiredBidAuctions(
                        normalizeAuctions(Array.isArray(expiredBidJson) ? expiredBidJson : expiredBidJson.items)
                    );
                }
            } catch (err) {
                if (mounted) setError((err as Error).message);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, [userID]);

    const auctionCardSettings = useMemo(
        () => mergeAuctionCardSettings(DEFAULT_AUCTION_CARD_SETTINGS),
        []
    );
    const markedAuctions: Page[] = [];

    const handleSelectAuction = useCallback(
        (auction: Page) => {
            if (onSelectAuction) {
                onSelectAuction(auction);
                return;
            }
            if (typeof window === "undefined") return;
            try {
                if (window.location.pathname !== "/opsucht/auction") {
                    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                    sessionStorage.setItem("auctionReturnTo", returnTo);
                }
            } catch {}
            const hash = `auction=${encodeURIComponent(auction.uid)}`;
            const target = `/opsucht/auction#${hash}`;
            if (window.location.pathname === "/opsucht/auction") {
                window.location.hash = hash;
            } else {
                window.location.href = target;
            }
        },
        [onSelectAuction]
    );

    const eigeneAuktionen = useMemo(
        () => activeAuctions.filter((a) => a.seller === userID),
        [activeAuctions, userID]
    );
    const gebote = useMemo(
        () => activeAuctions.filter((a) => a.bids && userID in a.bids),
        [activeAuctions, userID]
    );

    const expiredBuyedAuctions = useMemo(() => {
        return expiredBidAuctions.filter((a) => {
            const highestBid = Math.max(...Object.values(a.bids));
            return a.bids[userID] === highestBid;
        });
    }, [expiredBidAuctions, userID]);

    const activeMarkedAuctions = useMemo(() => {
        const now = Date.now();
        return markedAuctions.filter((a) => Date.parse(a.endTime) > now);
    }, [markedAuctions]);

    const markedExpiredAuctions = useMemo(() => {
        const now = Date.now();
        return markedAuctions.filter((a) => Date.parse(a.endTime) <= now);
    }, [markedAuctions]);

    const moneySpent = useMemo(() => {
        let money = 0;

        gebote.forEach((a) => {
            if (a.bids && a.bids[userID]) {
                const allBidValues = Object.values(a.bids);
                const highestBid = Math.max(...allBidValues);
                if (a.bids[userID] === highestBid) {
                    money += a.bids[userID];
                }
            }
        });

        expiredAuctions.forEach((a) => {
            if (a.bids && a.bids[userID]) {
                const allBidValues = Object.values(a.bids);
                const highestBid = Math.max(...allBidValues);
                if (a.bids[userID] === highestBid) {
                    money += a.bids[userID];
                }
            }
        });

        expiredBuyedAuctions.forEach((a) => {
            if (a.bids && a.bids[userID]) {
                const allBidValues = Object.values(a.bids);
                const highestBid = Math.max(...allBidValues);
                if (a.bids[userID] === highestBid) {
                    money += a.bids[userID];
                }
            }
        });

        return money;
    }, [gebote, expiredAuctions, expiredBuyedAuctions, userID]);

    const earnedMoney = useMemo(() => {
        let money = 0;

        eigeneAuktionen.forEach((a) => {
            const bids = Object.values(a.bids);
            if (bids.length > 0) {
                money += Math.max(...bids);
            }
        });

        expiredAuctions.forEach((a) => {
            const bids = Object.values(a.bids);
            if (bids.length > 0) {
                money += Math.max(...bids);
            }
        });

        return money;
    }, [eigeneAuktionen, expiredAuctions]);

    if (loading) {
        return <p>Lade Auktionsprofil...</p>;
    }

    if (error) {
        return <p>Fehler: {error}</p>;
    }

    return (
        <div className="user-auctions-container">
            <div className="header-container" style={{ position: "relative" }}>
                {onBack ? (
                    <button className="backButton" onClick={onBack}>
                        Zurück
                    </button>
                ) : (
                    <BackButton />
                )}
                <StarBorder as="h1" className="star-title-center" color="cyan" speed="5s">
                    Auktionsprofil: <UserName uuid={userID} />
                </StarBorder>
            </div>

            <div className="auction-profile-hero">
                <div className="auction-profile-summary">
                    <h2>Ãœbersicht</h2>
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
                        <span className="stat-value">{formatMoney(moneySpent)}</span>
                    </div>
                    <div className="auction-stat-card">
                        <span className="stat-label">Verdient</span>
                        <span className="stat-value">{formatMoney(earnedMoney)}</span>
                    </div>
                </div>
            </div>

            {eigeneAuktionen.length === 0 &&
                expiredBuyedAuctions.length === 0 &&
                expiredAuctions.length === 0 &&
                gebote.length === 0 &&
                markedAuctions.length === 0 && (
                    <p className="no-auctions">
                        Keine aktiven Auktionen oder Gebote gefunden.
                    </p>
                )}

            {eigeneAuktionen.length > 0 && (
                <section>
                    <h2 className="own-auction">Eigene Auktionen</h2>
                    <div className="auction-grid">
                        {eigeneAuktionen.map((a) => (
                            <AuctionCard
                                key={a.uid}
                                mode={"active"}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller} />}
                                settings={auctionCardSettings}
                                onSelectAuction={handleSelectAuction}
                            />
                        ))}
                    </div>
                </section>
            )}

            {gebote.length > 0 && (
                <section>
                    <h2 className="own-auction">Gebote</h2>
                    <div className="auction-grid">
                        {gebote.map((a) => (
                            <AuctionCard
                                key={a.uid}
                                mode={"active"}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller} />}
                                settings={auctionCardSettings}
                                onSelectAuction={handleSelectAuction}
                            />
                        ))}
                    </div>
                </section>
            )}

            {expiredBuyedAuctions.length > 0 && (
                <section>
                    <h2 className="own-auction">Gekaufte Auktionen</h2>
                    <div className="auction-grid">
                        {expiredBuyedAuctions.map((a) => (
                            <AuctionCard
                                key={a.uid}
                                mode={"expired"}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller} />}
                                settings={auctionCardSettings}
                                onSelectAuction={handleSelectAuction}
                            />
                        ))}
                    </div>
                </section>
            )}

            {expiredAuctions.length > 0 && (
                <section>
                    <h2 className="own-auction">Abgelaufene Auktionen</h2>
                    <div className="auction-grid">
                        {expiredAuctions.map((a) => (
                            <AuctionCard
                                key={a.uid}
                                mode={"expired"}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller} />}
                                settings={auctionCardSettings}
                                onSelectAuction={handleSelectAuction}
                            />
                        ))}
                    </div>
                </section>
            )}

            {markedExpiredAuctions.length > 0 && isDashBoardView && (
                <section>
                    <h2 className="own-auction">Abgelaufene Makierte Auktionen</h2>
                    <div className="auction-grid">
                        {markedExpiredAuctions.map((a) => (
                            <AuctionCard
                                key={a.uid}
                                mode={"expired"}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller} />}
                                settings={auctionCardSettings}
                                onSelectAuction={handleSelectAuction}
                            />
                        ))}
                    </div>
                </section>
            )}

            {activeMarkedAuctions.length > 0 && isDashBoardView && (
                <section>
                    <h2 className="own-auction">Makierte Auktionen</h2>
                    <div className="auction-grid">
                        {activeMarkedAuctions.map((a) => (
                            <AuctionCard
                                key={a.uid}
                                mode={"expired"}
                                auction={a}
                                auctionSellerName={<UserName uuid={a.seller} />}
                                settings={auctionCardSettings}
                                onSelectAuction={handleSelectAuction}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
