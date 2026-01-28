'use client'

import React, {useEffect, useState} from 'react'



const AuctionClient = ({ auction }: { auction: Page[] }) => {
    const [category, setCategory] = useState('*')
    const [sumMoney, setSumMoney] = useState(0)
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now())
        }, 1000)




        return() => clearInterval(interval)
    }, [])


    useEffect(() => {
        const sumWithInitial = auction.filter(a => a.category === category || category === "*").map(a => a.currentBid).reduce(
            (before, currentValue) => before + currentValue,
            0,
        );

        setSumMoney(getFormatedSummary(sumWithInitial))
    }, [category])

    const filtered = auction.filter(a => {
        if (category === '*') return true
        return a.category === category
    })


    const getFormatedSummary = (value) => {
        if(value < 1000) return value;

        if(value < 1000000){
            return `${(value / 1000).toLocaleString("de-de", {maximumFractionDigits: 3})}K`
        }

        if(value < 1000000000){
            return `${(value / 1000000).toLocaleString("de-de", {maximumFractionDigits: 3})}M`
        } else {
            return `${(value / 1000000000).toLocaleString("de-de", {maximumFractionDigits: 3})}Mrd`
        }

    }

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
                <option value="other">Sonstiges</option>
            </select>

            <h2 className={"sumMoney"}>{sumMoney}</h2>

            </div>


            <div className="auction-grid">
                {filtered.map((a, id) => (
                    <div key={id} className="auction-card">
                        <img src={a.item.icon} alt={a.item.displayName} />

                        <p className="title">{a.item.displayName}</p>

                        {a.item.amount > 1 && (
                            <p className="muted">Menge: {a.item.amount}</p>
                        )}

                        <p className="start">
                            Start: {a.startBid?.toLocaleString('de-de', { minimumFractionDigits: 2 })}
                        </p>

                        <p className="current">
                            Aktuell: {a.currentBid?.toLocaleString('de-de', { minimumFractionDigits: 2 })}
                        </p>

                            <p>
                            Endet in: {getRemainingTime(a)}
                            </p>
                    </div>
                ))}
            </div>
        </>
    )
}

const getRemainingTime = (a: { endTime: string }) => {
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

export default AuctionClient
