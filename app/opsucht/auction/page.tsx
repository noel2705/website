"use client";
import AuctionClient from "./AuctionClient";
import {useEffect, useState} from "react";
import {normalizeAuction, normalizeAuctions} from "@/lib/utils/auction/normalize";
import AuctionItemPage from "@/components/opsucht/auction/AuctionItemPage";
import AuctionUserClientView from "@/components/opsucht/auction/AuctionUserClientView";
import type {Page} from "@/lib/utils/types";

export enum Modes {
    Auctions,
    AuctionView,
    AuctionItemPage,
    UserView
}

const EXPIRED_AUCTIONS_API_BASE =
    process.env.NEXT_PUBLIC_AUCTION_BACKEND_URL?.replace(/\/$/, "") ?? "";

export default  function Page() {
    const [data, setData] = useState<any>(null);
    const [showMode, setShowMode] = useState<Modes>(Modes.Auctions);
    const [selectedAuction, setSelectedAuction] = useState<Page | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);


    useEffect(() => {
        async function load() {
            const res = await fetch("https://api.opsucht.net/auctions/active");
            const json = await res.json();
            setData(normalizeAuctions(json));
        }

        load();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const getHashAuctionId = () => {
            const raw = window.location.hash.replace(/^#/, "");
            if (!raw) return null;
            const params = new URLSearchParams(raw);
            return params.get("auction");
        };

        const syncFromHash = async () => {
            const id = getHashAuctionId();
            const raw = window.location.hash.replace(/^#/, "");
            const params = new URLSearchParams(raw);
            const userId = params.get("user");

            if (id) {
                const list = Array.isArray(data) ? (data as Page[]) : [];
                const found = list.find((a) => a.uid === id);
                if (found) {
                    setSelectedAuction(found);
                    setSelectedUserId(null);
                    setShowMode(Modes.AuctionItemPage);
                    return;
                }

                const expiredBase = EXPIRED_AUCTIONS_API_BASE
                    ? `${EXPIRED_AUCTIONS_API_BASE}/api/expired-auctions`
                    : "/api/expired-auctions";
                try {
                    const res = await fetch(`${expiredBase}?uid=${encodeURIComponent(id)}`, {
                        cache: "no-store",
                    });
                    if (res.ok) {
                        const json = await res.json();
                        if (json) {
                            const normalized = normalizeAuction(json);
                            if (normalized?.uid) {
                                setSelectedAuction(normalized);
                                setSelectedUserId(null);
                                setShowMode(Modes.AuctionItemPage);
                                return;
                            }
                        }
                    }
                } catch {}
            }

            if (userId) {
                setSelectedAuction(null);
                setSelectedUserId(userId);
                setShowMode(Modes.UserView);
                return;
            }

            setSelectedAuction(null);
            setSelectedUserId(null);
            setShowMode(Modes.Auctions);
        };

        syncFromHash();
        window.addEventListener("hashchange", syncFromHash);
        return () => window.removeEventListener("hashchange", syncFromHash);
    }, [data]);

    return (
        <div className="app-shell">
            {showMode === Modes.Auctions && (
                <AuctionClient
                    initialAuction={data}
                    onSelectAuction={(auction) => {
                        setSelectedAuction(auction);
                        setSelectedUserId(null);
                        setShowMode(Modes.AuctionItemPage);
                        if (typeof window !== "undefined") {
                            window.location.hash = `auction=${encodeURIComponent(auction.uid)}`;
                        }
                    }}
                />
            )}

            {showMode === Modes.AuctionItemPage && (
                <AuctionItemPage
                    data={selectedAuction ? [selectedAuction] : []}
                    auctionID={selectedAuction?.uid ?? ""}
                    onBack={() => {
                        if (typeof window !== "undefined") {
                            if (window.history.length > 1) {
                                window.history.back();
                                return;
                            }
                            const cleanUrl = `${window.location.pathname}${window.location.search}`;
                            window.history.replaceState(null, "", cleanUrl);
                        }
                        setShowMode(Modes.Auctions);
                        setSelectedAuction(null);
                        setSelectedUserId(null);
                    }}
                />
            )}

            {showMode === Modes.UserView && selectedUserId && (
                <AuctionUserClientView
                    userID={selectedUserId}
                    isDashBoardView={false}
                    onSelectAuction={(auction) => {
                        setSelectedAuction(auction);
                        setSelectedUserId(null);
                        setShowMode(Modes.AuctionItemPage);
                        if (typeof window !== "undefined") {
                            window.location.hash = `auction=${encodeURIComponent(auction.uid)}`;
                        }
                    }}
                    onBack={() => {
                        if (typeof window !== "undefined") {
                            if (window.history.length > 1) {
                                window.history.back();
                                return;
                            }
                            const cleanUrl = `${window.location.pathname}${window.location.search}`;
                            window.history.replaceState(null, "", cleanUrl);
                        }
                        setShowMode(Modes.Auctions);
                        setSelectedUserId(null);
                    }}
                />
            )}
        </div>
    );
}
