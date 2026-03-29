'use client';

import { useEffect, useMemo, useState } from "react";
import type { Page } from "@/lib/utils/types";
import { formatMoney } from "@/lib/utils/auction/auction";
import UserPageButton from "@/components/opsucht/auction/UserPageButton";
import { getLastItemTrades, type LastItemTrade } from "@/lib/utils/auction/auction.server";
import MinecraftNameResolver from "@/lib/utils/minecraftNameResolver";

type ViewMode = "buyer" | "seller";

type Props = {
    auction: Page;
};

export default function LastAuctionTrades({ auction }: Props) {
    const [trades, setTrades] = useState<LastItemTrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("buyer");
    const [nameMap, setNameMap] = useState<Record<string, string>>({});

    const itemName = useMemo(
        () => auction.item.displayName ?? auction.item.material,
        [auction]
    );
    const resolver = useMemo(
        () =>
            new MinecraftNameResolver({
                storageProvider: typeof window !== "undefined" ? localStorage : undefined,
            }),
        []
    );

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const load = async () => {
            try {
                const data = await getLastItemTrades(itemName, 10);
                if (mounted) setTrades(data);
            } catch {
                if (mounted) setTrades([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, [itemName]);

    useEffect(() => {
        let mounted = true;
        const uuids = Array.from(
            new Set(trades.flatMap((trade) => [trade.buyer, trade.seller]).filter(Boolean))
        );
        if (uuids.length === 0) {
            setNameMap({});
            return () => {
                mounted = false;
            };
        }

        resolver.getNames(uuids).then((names) => {
            if (mounted) setNameMap(names);
        });

        return () => {
            mounted = false;
        };
    }, [resolver, trades]);

    const formatTradeDate = (value: string) =>
        new Intl.DateTimeFormat("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));

    return (
        <div className="last-trades">
            <div className="last-trades-header">
                <h2>Letzte Trades</h2>
                <span className="trade-switch-label trade-switch-label-center">
                    {viewMode === "buyer" ? "Käufer" : "Verkäufer"}
                </span>
                <div className="trade-switch-wrap">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={viewMode === "seller"}
                            onChange={() =>
                                setViewMode((prev) => (prev === "buyer" ? "seller" : "buyer"))
                            }
                            aria-label="Käufer oder Verkäufer"
                        />
                        <span className="slider round" aria-hidden="true"></span>
                    </label>
                </div>
            </div>
            <div className="last-trades-list">
                {loading && <span className="trade-empty">Wird geladen...</span>}
                {!loading && trades.length === 0 && (
                    <span className="trade-empty">Keine Trades gefunden.</span>
                )}
                {!loading &&
                    trades.map((trade) => {
                        const buyerName = nameMap[trade.buyer] ?? "Lädt..";
                        const sellerName = nameMap[trade.seller] ?? "Lädt..";
                        const displayName = viewMode === "buyer" ? buyerName : sellerName;
                        const displayUuid = viewMode === "buyer" ? trade.buyer : trade.seller;
                        const avatarName = displayName || "steve";

                        return (
                            <div key={trade.uid} className="trade-row">
                                <div className="trade-user">
                                    <img
                                        src={`https://minotar.net/helm/${encodeURIComponent(
                                            avatarName
                                        )}/100.png`}
                                        alt=""
                                        className="trade-avatar"
                                    />
                                    <UserPageButton name={displayName} uuid={displayUuid} />
                                </div>
                                <span className="trade-price">{formatMoney(trade.price)}</span>
                                <span className="trade-date">{formatTradeDate(trade.endTime)}</span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
