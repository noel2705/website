'use client';
import React, {useState, useEffect, useMemo} from 'react';
import {Page, Item} from './types';
import "./auction.css";
import {useRouter} from 'next/navigation';
import {getAmountBids} from "@/lib/auction";
import AuctionCard from "@/components/opsucht/AuctionCard";
import MinecraftNameResolver from "@/lib/minecraftNameResolver";

interface Props {
    initialAuction: Page[];
}


const encodeBase64 = (obj: any) => {
    return btoa(
        encodeURIComponent(JSON.stringify(obj))
            .replace(/%([0-9A-F]{2})/g, (_, p1) =>
                String.fromCharCode(parseInt(p1, 16))
            )
    );
};


export default function AuctionClient({initialAuction}: Props) {

    const itemsPerLoad = 16;
    const [isExpiredMode, setIsExpiredMode] = useState(false);
    const [renderCount, setRenderCount] = useState(itemsPerLoad);
    const [auction, setAuction] = useState<Page[]>(initialAuction);
    const [sellerNames, setSellerNames] = useState<Record<string, string>>({})
    const resolver = new MinecraftNameResolver();
    const [showAuction, setShowAuction] = useState<Page[]>();
    const fetchAuctions = async (cat: string) => {
        let data: Page[] = [];
        if (!isExpiredMode) {
            const url =
                cat === "*"
                    ? 'https://api.opsucht.net/auctions/active'
                    : `https://api.opsucht.net/auctions/active?category=${cat}`;
            const res = await fetch(url);
            data = await res.json();

        } else {
            const res = await fetch('/api/expired-auctions');
            data = await res.json();

        }

        setAuction(data);
        sortAuctions(data);
        const rawNames = [...new Set(data.map(e => e.seller))];
        const resNames = await getSellerName(rawNames);
        setSellerNames(resNames);

    };



    const getSellerName = async (uids: string[]) => {
        return resolver.getNames(uids);
    };

    const [category, setCategory] = useState("*");
    const [searchBar, setSearchbar] = useState("");
    const [orderBy, setOrderby] = useState("moneyDesc");

    useEffect(() => {
        const storedCategory = sessionStorage?.getItem("category") || "*";
        const storedSearchBar = sessionStorage?.getItem("searchBar") || '';
        const storedOrderBy = sessionStorage?.getItem("orderBy") || 'moneyDesc';

        if (storedCategory != category) setCategory(storedCategory);
        if (storedSearchBar != storedSearchBar) setSearchbar(storedSearchBar);
        if (storedOrderBy != storedOrderBy) setOrderby(storedOrderBy);
    }, []);


    const sortAuctions = (auctionData: Page[]) => {
        let filtered: Page[] = Array.isArray(auctionData) ? auctionData : [];


        if (searchBar.trim() !== '') {
            filtered = filtered.filter(a =>
                (a.item.displayName ?? a.item.material)
                    .toLowerCase()
                    .includes(searchBar.toLowerCase())
            )
        }


        const sorted = [...filtered].sort((a, b) => {
            switch (orderBy) {
                case "timeDesc":
                    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
                case "timeAsc":
                    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
                case "moneyAsc":
                    return a.currentBid - b.currentBid
                case "moneyDesc":
                    return b.currentBid - a.currentBid
                case "bitAmountDesc":
                    return getAmountBids(b.bids) - getAmountBids(a.bids)
                case "bitAmontAsc":
                    return getAmountBids(a.bids) - getAmountBids(b.bids)
                default:
                    return 0
            }
        });


        setShowAuction(sorted)
    }


    useEffect(() => {
        sortAuctions(auction);
        sessionStorage.setItem("orderBy", orderBy);
    }, [orderBy]);

    useEffect(() => {
        sessionStorage.setItem("category", category);
        void fetchAuctions(category);
    }, [isExpiredMode, category]);





    useEffect(() => {
        const sentinel = document.getElementById('scroll-sentinel');
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setRenderCount(prev =>
                        Math.min(prev + itemsPerLoad, showAuction?.length ?? 0)
                    );
                }
            },
            {
                root: null,
                rootMargin: '300px',
                threshold: 0
            }
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [showAuction]);



    useEffect(() => {
        const interval = setInterval(() => {
            void fetchAuctions(category);
        }, 10000);

        return () => clearInterval(interval);
    }, [category, isExpiredMode]);
    useEffect(() => {
        sessionStorage.setItem("searchBar", searchBar);
        sortAuctions(auction);
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

                <div className="toggle-auctions">
                    <button
                        onClick={() => setIsExpiredMode(prev => !prev)}
                        className={isExpiredMode ? "active" : ""}
                    >
                        {isExpiredMode ? "Abgelaufene Auktionen" : "Aktive Auktionen"}
                    </button>
                </div>


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
                        onClick={() => setCategory("tools_armor")}
                        className={category === "tools_armor" ? "active" : ""}
                    >
                        <img src="https://img.mc-api.io/iron_sword.png"/>
                        Werkzeuge & Rüstung
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


                <div className={"auction-toolbar-rarity"}>

                    <div className={"raritySwitcher"}>


                    </div>

                </div>


                <div className={"auction-toolbar-rarity"}>

                    <div className="categorySwitcher">


                        <div className="sort">
                            <select value={orderBy} onChange={e => setOrderby(e.target.value)}>
                                <option value="moneyDesc">Preis: Groß → Klein</option>
                                <option value="moneyAsc">Preis: Klein → Groß</option>
                                <option value="timeDesc">Endet bald</option>
                                <option value="timeAsc">Neuste</option>
                                <option value="bitAmountDesc">Meiste Gebote</option>
                                <option value="bitAmontAsc">Wenigste Gebote</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>


            <div className="auction-grid">
                {showAuction?.slice(0, renderCount).map(a => (
                    <AuctionCard key={a.uid} auction={a} auctionSellerName={sellerNames[a.seller]}/>
                ))}
            </div>

            <div id="scroll-sentinel" style={{ height: 1 }} />

        </>
    );




}

