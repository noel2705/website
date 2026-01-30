"use client";

import React, {useEffect, useState, useMemo} from "react";
import {Item, Page} from "./types";

import "./auction.css";
import {useSearchParams} from "next/dist/client/components/navigation";

class MinecraftNameResolver {
    private cache: Record<string, string> = {};

    async getName(uuid: string): Promise<string> {
        if (this.cache[uuid]) return this.cache[uuid];

        try {
            const cleanUuid = uuid.replace(/-/g, "");
            const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${cleanUuid}`);
            if (!res.ok) throw new Error("Failed fetch");
            const data = await res.json();
            const name = data.username || "Unbekannt";
            this.cache[uuid] = name;
            return name;
        } catch {
            this.cache[uuid] = "Unbekannt";
            return "Unbekannt";
        }
    }
    async getNames(uuids: string[]): Promise<Record<string, string>> {
        const result: Record<string, string> = {};
        const toFetch: string[] = [];

        uuids.forEach(uuid => {
            if (this.cache[uuid]) result[uuid] = this.cache[uuid];
            else toFetch.push(uuid);
        });

        await Promise.all(
            toFetch.map(async uuid => {
                result[uuid] = await this.getName(uuid);
            })
        );

        return result;
    }

}



const AuctionClient = ({auction}: { auction: Page[] }) => {
    const [category, setCategory] = useState("*");
    const [now, setNow] = useState(Date.now());
    const [sortBy, setSortBy] = useState<"endTimeAsc" | "endTimeDesc" | "currentBidAsc" | "currentBidDesc">("currentBidDesc");
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState<Page | null>(null);
    const resolver = useMemo(() => new MinecraftNameResolver(), []);
    const [bidNames, setBidNames] = useState<Record<string, string>>({});


    const searchParams = useSearchParams()

    const foo = searchParams.get('foo')
    const object = JSON.parse(window.atob(foo) || '{}');

    const object2 = {
        bar: "foo",
        foo: ["foo", "bar"]
    }
    const base64 = window.btoa(JSON.stringify(object2))

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(prev => prev + 1000);
        }, 1000);
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [selectedItem]);


    useEffect(() => {
        if (!selectedItem) return;

        const uuids = Object.keys(selectedItem.bids);
        resolver.getNames(uuids).then(setBidNames);
    }, [selectedItem, resolver]);


    const filtered = auction.filter((a) => (category === "*" ? true : a.category === category));

    const sortedFiltered = [...filtered].sort((a, b) => {
        switch (sortBy) {
            case "endTimeAsc":
                return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
            case "endTimeDesc":
                return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
            case "currentBidAsc":
                return a.currentBid - b.currentBid;
            case "currentBidDesc":
                return b.currentBid - a.currentBid;
            default:
                return 0;
        }
    });

    const searched = sortedFiltered.filter((a) =>
        (a.item.displayName || a.item.material).toLowerCase().includes(search.toLowerCase())
    );

    const getFormatedSummary = (value: number) => {
        if (value < 1000) return value + "";
        if (value < 1000000) return `${(value / 1000).toLocaleString("de-de", {maximumFractionDigits: 3})}K`;
        if (value < 1000000000) return `${(value / 1000000).toLocaleString("de-de", {maximumFractionDigits: 3})}M`;
        return `${(value / 1000000000).toLocaleString("de-de", {maximumFractionDigits: 3})}Mrd`;
    };

    const sumMoney = useMemo(() => searched.reduce((total, a) => total + a.currentBid, 0), [searched]);

    const getItemIcon = (item: Item) => {
        if (item.icon && item.icon.trim() !== "") return item.icon;
        const normalized = item.displayName?.toLowerCase().
        replace(/[´’']/g, "").
        replace(/\s+/g, "_").
        replace(/[^a-z0-9_]/g, "") || "";
        return `/custom-items/${normalized}.png`;
    };

    const handleInfoClick = (item: Page) => setSelectedItem(item);
    const closeModal = () => setSelectedItem(null);

    const getRemainingTime = (a: Page) => {
        const diff = new Date(a.endTime).getTime() - Date.now();
        if (diff < 0) return "Beendet";

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // @ts-ignore


    return (
        <>
            <div className="top-bar">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="*">Alle</option>
                    <option value="custom_items">Custom Items</option>
                    <option value="op_items">OP-Items</option>
                    <option value="tools">Werkzeuge</option>
                    <option value="armor">Rüstung</option>
                    <option value="spawn_eggs">Spawneier</option>
                    <option value="other">Sonstiges</option>
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <option value="currentBidDesc">Teuerste zuerst</option>
                    <option value="currentBidAsc">Billigste zuerst</option>
                    <option value="endTimeAsc">Endet zuerst</option>
                    <option value="endTimeDesc">Endet zuletzt</option>
                </select>

                <h2 className="sumMoney">{getFormatedSummary(sumMoney)}</h2>

                <input
                    className={"searchBar"}
                    type="text"
                    placeholder="Item suchen…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="auction-grid">
                {searched.map((a, id) => (
                    <div key={id}
                         className={`auction-card ${Number(a.endTime) - Date.now() < 120000 ? "ending-soon-card" : ""}`}>
                        <div className="auction-header">
                            <img
                                loading="lazy"
                                src={getItemIcon(a.item)}
                                alt={a.item.displayName || a.item.material}
                                className="auction-icon"
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "/custom-items/default.png";
                                }}
                            />

                            <div className="auction-title" >
                                <p>{a.item.displayName || a.item.material}</p>
                                {a.item.amount > 1 && <p className="muted">Menge: {a.item.amount}</p>}
                            </div>
                        </div>

                        <div className="auction-info-box">
                            <p>Start: {a.startBid?.toLocaleString("de-DE")}</p>
                            <p>Aktuell: {a.currentBid?.toLocaleString("de-DE")}</p>
                            <p>Endet in: {getRemainingTime(a)}</p>
                        </div>

                        <button className={"use-client-btn"} onClick={() => handleInfoClick(a)}>Informationen</button>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <img
                            loading="lazy"
                            src={getItemIcon(selectedItem.item)}
                            alt={selectedItem.item.displayName || selectedItem.item.material}
                            className="auction-icon"
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/custom-items/default.png";
                            }}
                        />

                        <h2>{selectedItem.item.displayName || selectedItem.item.material}</h2>
                        <p>Menge: {selectedItem.item.amount}</p>
                        <p>Startpreis: {selectedItem.startBid?.toLocaleString("de-DE")}</p>
                        <p>Aktuell: {selectedItem.currentBid?.toLocaleString("de-DE")}</p>
                        <p>Endet in: {getRemainingTime(selectedItem)}</p>

                        {selectedItem?.bids && Object.entries(selectedItem.bids).length > 0 && (
                            <ul>
                                {Object.entries(selectedItem.bids)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([uuid, bid], i) => (
                                        <li key={i}>
                                            <span className="bid-name">{bidNames[uuid] || uuid}</span>
                                            <span className="bid-amount">
                                    {bid.toLocaleString("de-DE")}
                                                <img loading={"lazy"} src="/custom-items/money.svg" alt="Coin" className="bid-icon"/>
                                </span>
                                        </li>
                                    ))}
                            </ul>
                        )}

                        <button onClick={closeModal}>Schließen</button>
                    </div>
                </div>
            )}



        </>
    );
};


export default AuctionClient;
