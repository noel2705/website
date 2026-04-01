'use client'
import { useEffect, useMemo, useState } from "react"
import "../../css/shard/ShardCalculator.css"
import { formatShards } from "@/lib/utils/auction/auction"

type Mode = "itemsToShards" | "shardsToItems"

interface Rate {
    source: string
    exchangeRate: number
}

export default function ShardCalculator() {
    const [rates, setRates] = useState<Rate[]>([])
    const [item, setItem] = useState("diamond_block")
    const [mode, setMode] = useState<Mode>("itemsToShards")
    const [value, setValue] = useState(0)

    useEffect(() => {
        fetch("https://api.opsucht.net/merchant/rates")
            .then((res) => res.json())
            .then((data) => setRates(data))
            .catch(console.error)
    }, [])

    const ITEM_MAP: Record<string, string> = {
        "diamond_block": "Diamond Block",
        "netherite_ingot": "Netherite Ingot",
        "minecraft:paper[custom_name={extra: [{bold: 1b, color: \"gray\", italic: 0b, obfuscated: 0b, strikethrough: 0b, text: \"Gräbergemisch\", underlined: 0b}], text: \"\"},custom_model_data={floats: [626.0f]},item_name={extra: [{bold: 1b, color: \"gray\", italic: 0b, obfuscated: 0b, strikethrough: 0b, text: \"Gräbergemisch\", underlined: 0b}], text: \"\"}]":
            "Gräbergemisch",
        "minecraft:paper[custom_name={extra: [{bold: 1b, color: \"#926428\", italic: 0b, obfuscated: 0b, strikethrough: 0b, text: \"Holzbündel\", underlined: 0b}], text: \"\"},custom_model_data={floats: [625.0f]},item_name={extra: [{bold: 1b, color: \"#926428\", italic: 0b, obfuscated: 0b, strikethrough: 0b, text: \"Holzbündel\", underlined: 0b}], text: \"\"}]":
            "Holzbündel",
        "minecraft:paper[custom_name={extra: [{bold: 1b, color: \"white\", italic: 0b, obfuscated: 0b, strikethrough: 0b, text: \"Steinplatten\", underlined: 0b}], text: \"\"},custom_model_data={floats: [635.0f]},item_name={extra: [{bold: 1b, color: \"white\", italic: 0b, obfuscated: 0b, strikethrough: 0b, text: \"Steinplatten\", underlined: 0b}], text: \"\"}]":
            "Steinplatten",
    }

    const calculatedValue = useMemo(() => {
        const rate = rates.find((r) => r.source === item)
        if (!rate || value <= 0) return 0

        if (mode === "itemsToShards") {
            return Number((value * rate.exchangeRate).toFixed(2))
        }

        return Number((value / rate.exchangeRate).toFixed(2))
    }, [item, mode, value, rates])

    const displayValue =
        mode === "itemsToShards"
            ? formatShards(calculatedValue)
            : String(calculatedValue)

    return (
        <div className="shard-calculator-wrapper left-align">
            <div className="shard-calculator-card">
                <h2>🧮 Shard Rechner</h2>

                <div className="mode-switch">
                    <button
                        className={mode === "itemsToShards" ? "active" : ""}
                        onClick={() => setMode("itemsToShards")}
                    >
                        Items → Shards
                    </button>
                    <button
                        className={mode === "shardsToItems" ? "active" : ""}
                        onClick={() => setMode("shardsToItems")}
                    >
                        Shards → Items
                    </button>
                </div>

                <label>Item</label>

                <select className={"item-change"} value={item} onChange={(e) => setItem(e.target.value)}>
                    {Object.entries(ITEM_MAP).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>

                <label>
                    {mode === "itemsToShards" ? "Item Anzahl" : "Shard Anzahl"}
                </label>

                <input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    placeholder={mode === "itemsToShards" ? "z.B. 64" : "z.B. 500"}
                />

                <div className="calc-result">
                    {mode === "itemsToShards" ? "Ergibt:" : "Benötigt:"}
                    <strong>
                        {displayValue} {mode === "itemsToShards" ? "Shards" : "Items"}
                    </strong>
                </div>
            </div>
        </div>
    )
}
