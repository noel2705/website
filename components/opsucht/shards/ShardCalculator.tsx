'use client'
import { useEffect, useState } from "react"
import "../../css/shard/ShardCalculator.css"

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
    const [result, setResult] = useState(0)

    useEffect(() => {
        fetch("https://api.opsucht.net/merchant/rates")
            .then(res => res.json())
            .then(data => setRates(data))
            .catch(console.error)
    }, [])
    const ITEM_MAP: Record<string, string> = {
        "diamond_block": "Diamond Block",
        "netherite_ingot": "Netherite Ingot",
        "minecraft:paper[item_name='{\"extra\":[{\"bold\":true,\"color\":\"#926428\",\"italic\":false,\"obfuscated\":false,\"strikethrough\":false,\"text\":\"Holzbündel\",\"underlined\":false}],\"text\":\"\"}',custom_model_data=625,custom_name='{\"extra\":[{\"bold\":true,\"color\":\"#926428\",\"italic\":false,\"obfuscated\":false,\"strikethrough\":false,\"text\":\"Holzbündel\",\"underlined\":false}],\"text\":\"\"}']":
            "Holzbündel",
        "minecraft:paper[item_name='{\"extra\":[{\"bold\":true,\"color\":\"gray\",\"italic\":false,\"obfuscated\":false,\"strikethrough\":false,\"text\":\"Gräbergemisch\",\"underlined\":false}],\"text\":\"\"}',custom_model_data=626,custom_name='{\"extra\":[{\"bold\":true,\"color\":\"gray\",\"italic\":false,\"obfuscated\":false,\"strikethrough\":false,\"text\":\"Gräbergemisch\",\"underlined\":false}],\"text\":\"\"}']":
            "Gräbergemisch"
    };

    useEffect(() => {
        const rate = rates.find(r => r.source === item)
        if (!rate || value <= 0) return setResult(0)

        if (mode === "itemsToShards") {
            setResult(Number((value * rate.exchangeRate).toFixed(2)))
        } else {
            setResult(Number((value / rate.exchangeRate).toFixed(2)))
        }
    }, [item, mode, value, rates])

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

                <select className={"item-change"} value={item} onChange={e => setItem(e.target.value)}>
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
                    onChange={e => setValue(Number(e.target.value))}
                    placeholder={mode === "itemsToShards" ? "z.B. 64" : "z.B. 500"}
                />

                <div className="calc-result">
                    {mode === "itemsToShards" ? "Ergibt:" : "Benötigt:"}
                    <strong>
                        {result} {mode === "itemsToShards" ? "Shards" : "Items"}
                    </strong>
                </div>
            </div>
        </div>
    )
}