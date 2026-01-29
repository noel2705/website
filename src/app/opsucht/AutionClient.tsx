'use client'

import React, {useEffect, useState, useMemo} from 'react'
import {Item, Page} from "@/app/opsucht/page";



const AuctionClient = ({ auction }: { auction: Page[] }) => {
    const [category, setCategory] = useState('*')
        const [now, setNow] = useState(Date.now())
    const [sortBy, setSortBy] = useState<"endTimeAsc" | "endTimeDesc" | "currentBidAsc" | "currentBidDesc">("endTimeAsc");
    const [search, setSearch] = useState("");


    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now())
        }, 1000)


        return() => clearInterval(interval)
    }, [])







    const filtered = auction.filter(a => {
        if (category === '*') return true
        return a.category === category
    })

    const sortedFiltered = [...filtered].sort((a, b) => {
        switch(sortBy) {
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

    const searched = sortedFiltered.filter(a => {
        const name =
            (a.item.displayName || a.item.material).toLowerCase();

        return name.includes(search.toLowerCase());
    });


    const getFormatedSummary = (value: number) => {
        if(value < 1000) return value + '';

        if(value < 1000000){
            return `${(value / 1000).toLocaleString("de-de", {maximumFractionDigits: 3})}K`
        }

        if(value < 1000000000){
            return `${(value / 1000000).toLocaleString("de-de", {maximumFractionDigits: 3})}M`
        } else {
            return `${(value / 1000000000).toLocaleString("de-de", {maximumFractionDigits: 3})}Mrd`
        }

    }

    const sumMoney = useMemo(() => {
        const sum = searched.reduce(
            (total, a) => total + a.currentBid,
            0
        );

        return getFormatedSummary(sum);
    }, [searched]);




    const getItemIcon = (item: Item): string => {
        if (item.icon && item.icon.trim() !== "") {
            return item.icon;
        }

        const normalized = item.displayName
            .toLowerCase()
            .replace(/[´’']/g, "")
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        return `/custom-items/${normalized}.png`;
    };



    return (
        <>
            <div className={"top-bar"}>
            <select
                className={"categorySwitcher"}
                value={category}
                onChange={e => setCategory(e.target.value)}
            >
                <option value="*">Alle</option>
                <option value="custom_items">Custom Items</option>
                <option value="op_items">OP-Items</option>
                <option value="tools">Werkzeuge</option>
                <option value="armor">Rüstung</option>
                <option value="spawn_eggs">Spawneier</option>
                <option value="other">Sonstiges</option>
            </select>

                <select
                    className="categorySwitcher"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                >
                    <option value="currentBidDesc">Teuerste zuerst</option>
                    <option value="currentBidAsc">Billigste zuerst</option>
                    <option value="endTimeAsc">Endet zuerst</option>
                    <option value="endTimeDesc">Endet zuletzt</option>
                </select>


                <h2 className={"sumMoney"}>{sumMoney}</h2>


                <input
                    className={"searchBar"}
                    type="text"
                    placeholder="Item suchen…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />


            </div>

            <div className="auction-grid">
                {searched.map((a, id) => {
                    const remainingSeconds = Number(getRemainingSeconds(a));

                    return (
                        <div
                            key={id}
                            className={`auction-card ${remainingSeconds < 120 ? "ending-soon-card" : ""}`}
                        >
                            <div className="auction-header">
                                <img
                                    loading={"lazy"}
                                    src={getItemIcon(a.item)}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "/custom-items/default.png";
                                    }}
                                    alt={a.item.displayName || a.item.material}
                                    className="auction-icon"
                                />

                                <div className="auction-title">
                                    <p lang={"de"}>{a.item.displayName || a.item.material}</p>
                                    {a.item.amount > 1 && <p className="muted">Menge: {a.item.amount}</p>}
                                </div>
                            </div>

                            <div className="auction-info-box">
                                <p>Start: {a.startBid?.toLocaleString('de-de', { minimumFractionDigits: 2 })}</p>
                                <p>Aktuell: {a.currentBid?.toLocaleString('de-de', { minimumFractionDigits: 2 })}</p>
                                <p>Endet in: {getRemainingTime(a)}</p>
                            </div>

                            <button className="use-client-btn">Informationen</button>
                        </div>
                    )
                })}
            </div>




        </>
    )
}

const getRemainingTime  = (a: Page) => {
    const end = new Date(a.endTime).getTime()
    const now = Date.now()

    const diff = end - now
    if(diff < 0 ) return "Beendet";

    const totalSeconds = Math.floor(diff / 1000)

    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
    }

    return `${minutes}m ${seconds}s`

}

const getRemainingSeconds = (a: Page): string => {
    const end = new Date(a.endTime).getTime()
    const now = Date.now()

    const diff = end - now
    const totalSeconds = Math.floor(diff / 1000)

    return totalSeconds.toString()
}

export default AuctionClient
