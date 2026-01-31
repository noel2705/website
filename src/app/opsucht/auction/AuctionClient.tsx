'use client';
import React, {useState, useEffect} from 'react';
import {Page,Item} from './types';
import "./auction.css";
import {useRouter} from 'next/navigation';
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

interface Props {
    initialAuction: Page[];
}


export default function AuctionClient({initialAuction}: Props) {
    const [auction, setAuction] = useState<Page[]>(initialAuction);
    const [showAuction, setShowAuction] = useState<Page[]>();
    const [category, setCategory] = useState(sessionStorage.getItem("category") || "*");
    const [searchBar, setSearchbar] = useState(sessionStorage.getItem("searchBar") || "");
    const [refresh, setRefresh] = useState(Date.now)
    const [orderBy, setOrderby] = useState(sessionStorage.getItem("orderBy") || "moneyDesc");
    const router = useRouter()
    const fetchAuctions = async (cat: string) => {
        const url =
            cat === "*"
                ? 'https://api.opsucht.net/auctions/active'
                : `https://api.opsucht.net/auctions/active?category=${cat}`;
        const res = await fetch(url);
        const data: Page[] = await res.json();
        setAuction(data);
        sortByAttributes(data);
    };


    const sortByAttributes = (data: Page[]) => {
        setShowAuction(data.toSorted((a, b) => {
            switch (orderBy) {
                case "timeDesc": {
                    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
                }
                case "timeAsc": {
                    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
                }

                case "moneyAsc": {
                    return a.currentBid - b.currentBid;
                }

                case "moneyDesc": {
                    return b.currentBid - a.currentBid;
                }

                case "bitAmountDesc": {
                    return getAmountBids(b.bids) - getAmountBids(a.bids);
                }

                case "bitAmontAsc" :{
                    return getAmountBids(a.bids) - getAmountBids(b.bids);
                }
            }

            return 0;
        }))
    }

    useEffect(() => {
        sortByAttributes(auction);
        sessionStorage.setItem("orderBy", orderBy);
    }, [orderBy]);

    useEffect(() => {
        sessionStorage.setItem("category", category);
        void fetchAuctions(category);
    }, [category]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRefresh(prev => prev + 1000);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            void fetchAuctions(category);
        }, 10000)
        return () => clearInterval(interval)
    })

    useEffect(() => {
        sessionStorage.setItem("searchBar", searchBar);
        setShowAuction(auction.filter(a => {
            return (a.item.displayName ?? a.item.material).toLowerCase().includes(searchBar.toLowerCase())
        }))
    }, [searchBar]);
    return (
        <>
            <div className="search-row">
                <input
                    type="text"
                    placeholder="Item suchen (z.B. Netherite, Schwert, Beacon …)"
                    value={searchBar}
                    onChange={e => setSearchbar(e.target.value)}
                />
            </div>


            <div className="auction-toolbar">


                <div className="categorySwitcher">
                    <button
                        onClick={() => setCategory("*")}
                        className={category === "*" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/nether_star.png"/>
                        Alles
                    </button>

                    <button
                        onClick={() => setCategory("custom_items")}
                        className={category === "custom_items" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/netherite_ingot.png"/>
                        Custom Items
                    </button>

                    <button
                        onClick={() => setCategory("tools")}
                        className={category === "tools" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/iron_sword.png"/>
                        Werkzeuge
                    </button>

                    <button
                        onClick={() => setCategory("armor")}
                        className={category === "armor" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/iron_chestplate.png"/>
                        Rüstung
                    </button>

                    <button
                        onClick={() => setCategory("op_items")}
                        className={category === "op_items" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/beacon.png"/>
                        OP Items
                    </button>

                    <button
                        onClick={() => setCategory("spawn_eggs")}
                        className={category === "spawn_eggs" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/blaze_spawn_egg.png"/>
                        Spawn Eggs
                    </button>

                    <button
                        onClick={() => setCategory("other")}
                        className={category === "other" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/ender_chest.png"/>
                        Sonstiges
                    </button>


                </div>

                <div className="sort">
                    <select value={orderBy} onChange={e => setOrderby(e.target.value)}>
                        <option value="moneyDesc">Preis: Groß → Klein</option>
                        <option value="moneyAsc">Preis: Klein → Groß</option>
                        <option value="timeDesc">Endet bald</option>
                        <option value="timeAsc">Endet zuletzt</option>
                        <option value="bitAmountDesc">Meiste Gebote</option>
                        <option value="bitAmontAsc">Wenigste Gebote</option>
                    </select>
                </div>
            </div>


            <div className="auction-grid">
                {showAuction?.map(a => (
                    <AuctionCard key={a.uid} auction={a} router={router}/>
                ))}
            </div>
        </>
    );
}

const formatEndDate = (a: string) => {
    const milliToEnd = new Date(a).getTime() - Date.now()

    if (milliToEnd < 0) {
        return "Beendet"
    }
    const secToEnd = Math.floor(milliToEnd / 1000);
    const seconds = secToEnd % 60;

    const minToEnd = Math.floor(secToEnd / 60);
    const minutes = minToEnd % 60;

    const hourToEnd = Math.floor(minToEnd / 60);


    return `${hourToEnd}h ${minutes}m ${seconds}s`

}


const formatMoney = (money: number) => {
    if (money < 1000) return money.toLocaleString('en-us', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    if (money < 1000000) return (money / 1000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "K"
    if (money < 1000000000) return (money / 1000000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "M"
    if (money < 1000000000000) return (money / 1000000000).toLocaleString('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "Mrd"
}

function getAmountBids(bids: Record<string, number>) {
    return Object.keys(bids).length
}


function AuctionCard({auction, router}: { auction: Page, router: AppRouterInstance }) {
    const itemName = auction.item.displayName ?? auction.item.material;
    const currentPrice = auction.currentBid;
    const startPrice = auction.startBid;
    const img = getItemImage(auction)
    const endDate = auction.endTime;
    const amountBids = getAmountBids(auction.bids);
    return (
        <div className="auction-card">
            <img onError={(e => {
                e.currentTarget.src = `https://img.mc-api.io/${auction.item.material.toLowerCase()}.png`
            })} loading={"lazy"} src={img}/>
            <h2 className="auction-title">{itemName}</h2>
            <div className="auction-details">
                <div className="price-row">
                    <p>Preis: {formatMoney(currentPrice) ?? "N/A"}</p>
                    <img src="/custom-items/money.svg" alt="Icon" width="24" height="24"/>
                </div>
                {formatEndDate(endDate) === "Beendet" && <p className={"red-text"}> {formatEndDate(endDate)}</p>}
                {formatEndDate(endDate) !== "Beendet" && <p> Endet in: {formatEndDate(endDate)}</p>}
                <p className={amountBids > 0 ? "green-text" : ""}>
                    Gebote: {amountBids}
                </p>
            </div>

            <button className="auction-button"
                    onClick={() => router.push(`/opsucht/item?data=${window.btoa(JSON.stringify(auction))}`)
                    }>Informationen
            </button>
        </div>
    );
}


const getItemImage = (auction: Page) => {
    return auction.item.icon ?? getItemIcon(auction.item);
}

const getItemIcon = (item: Item) => {
    if (item.icon && item.icon.trim() !== "") return item.icon;
    const normalized = item.displayName?.toLowerCase().replace(/[´’']/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "";
    return `/custom-items/${normalized}.png`;
};
