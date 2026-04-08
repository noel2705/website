'use client'

import {useEffect, useState} from "react"
import "../../css/shard/CurrentShardCourse.css"

interface Rate {
    source: string
    target: string
    exchangeRate: number
}

enum defaultvalues {
    diamond = 8,
    netherite = 60,
    stoneSlabs = 15,
    graveyardMix = 20,
    woodBundle = 20,
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
        if (source.includes("diamond")) return rate < defaultvalues.diamond ? "rate-red" : "rate-green"
        if (source.includes("netherite")) return rate < defaultvalues.netherite ? "rate-red" : "rate-green"
        if (source.includes("Steinplatten")) return rate < defaultvalues.stoneSlabs ? "rate-red" : "rate-green"
        if (source.includes("Holzbündel")) return rate < defaultvalues.woodBundle ? "rate-red" : "rate-green"
        if (source.includes("Gräbergemisch")) return rate < defaultvalues.graveyardMix ? "rate-red" : "rate-green"

        return "rate-green"
    }

    function getPercent(source: string, rate: number) {
        let defaultValue = 1

        if (source.includes("diamond")) defaultValue = defaultvalues.diamond
        else if (source.includes("netherite")) defaultValue = defaultvalues.netherite
        else if (source.includes("Steinplatten")) defaultValue = defaultvalues.stoneSlabs
        else if (source.includes("Holzbündel")) defaultValue = defaultvalues.woodBundle
        else if (source.includes("Gräbergemisch")) defaultValue = defaultvalues.graveyardMix

        const percent = ((rate - defaultValue) / defaultValue) * 100

        return percent.toFixed(2)
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
                                OPShards     &rarr;
                            </span>

                            <span>
                                <span className={`rate-value ${rateClass}`}>
                                    {getPercent(rate.source, rate.exchangeRate)}
                                </span>{" "}
                             %
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
