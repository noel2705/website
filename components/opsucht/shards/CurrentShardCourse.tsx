'use client'

import { useEffect, useState } from "react"
import "../../css/shard/CurrentShardCourse.css"

interface Rate {
    source: string
    target: string
    exchangeRate: number
}

const extractCustomItemName = (source: string) => {
    const nbtMatches = Array.from(source.matchAll(/text:\s*\"(.*?)\"/g))
    for (const match of nbtMatches) {
        const value = match[1]
        if (value && value.trim().length > 0) return value
    }

    const jsonMatches = Array.from(source.matchAll(/"text":"(.*?)"/g))
    for (const match of jsonMatches) {
        const value = match[1]
        if (value && value.trim().length > 0) return value
    }

    return source
}

export default function CurrentShardCourse() {
    const [rates, setRates] = useState<Rate[]>([])

    useEffect(() => {
        async function fetchRates() {
            try {
                const res = await fetch("https://api.opsucht.net/merchant/rates")
                const data: Rate[] = await res.json()
                setRates(data)
            } catch (err) {
                console.error("Fehler beim Laden der Kurse:", err)
            }
        }
        fetchRates()
    }, [])

    function extractName(source: string) {
        try {
            if (source.startsWith("minecraft:paper")) {
                return extractCustomItemName(source)
            }
            return source
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
        } catch {
            return source
        }
    }

    function getRateColor(source: string, rate: number) {
        if (source.includes("diamond")) return rate < 10 ? "rate-red" : "rate-green"
        if (source.includes("netherite")) return rate < 50 ? "rate-red" : "rate-green"
        if (source.includes("Steinplatten")) return rate < 15 ? "rate-red" : "rate-green"
        if (source.includes("Gräbergemisch") || source.includes("Holzbündel")) {
            return rate < 20 ? "rate-red" : "rate-green"
        }
        return "rate-green"
    }

    return (
        <div className="container">
            <h1 className="title">Aktuelle OPSHARDS-Kurse Pro items</h1>
            <div className="rate-list">
                {rates.map((rate, index) => {
                    const name = extractName(rate.source)
                    const rateClass = getRateColor(rate.source, rate.exchangeRate)
                    return (
                        <div key={index} className="rate-box">
                            <span className="rate-name">{name}</span>
                            <span>
                                <span className={`rate-value ${rateClass}`}>
                                    {rate.exchangeRate.toFixed(2)}
                                </span>{" "}
                                OPSHARDS
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
