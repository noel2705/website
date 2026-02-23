'use client'
import "./css/ShardHistoryChart.css"
import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import {fetchFontFile} from "next/dist/compiled/@next/font/dist/google/fetch-font-file";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface TradeHistory {
    shards: number
    item: string
    amount: number
    timestamp: number
}

const COLORS = [
    "rgba(75,192,192,1)",
    "rgba(255,99,132,1)",
    "rgba(54,162,235,1)",
    "rgba(255,206,86,1)",
    "rgba(153,102,255,1)",
    "rgba(255,159,64,1)",
]

export default function ShardHistoryChart({ refreshKey }: { refreshKey: number }) {
    const [history, setHistory] = useState<TradeHistory[]>([])
    const [userID, setUserID] = useState<string | null>(null)
    const [filter, setFilter] = useState<"2h" | "24h" | "7d" | "14d" | "all">("all")

    useEffect(() => {
        const fetchUUID = async () => {
            try {
                const resUUID = await fetch("/api/me")
                const dataUUID = await resUUID.json()
                const uuid = dataUUID.mc_uuid || dataUUID.uuid
                if (!uuid) return console.error("Keine UUID gefunden")
                setUserID(uuid)
            } catch (err) {
                console.error("Fehler beim Abrufen der UUID:", err)
            }
        }
        fetchUUID()
    }, [])

    useEffect(() => {
        if (!userID) return

        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/shards/${userID}`)
                const data = await res.json()
                setHistory(data.user?.tradeHistory || [])
            } catch (err) {
                console.error("Fehler beim Laden der Shard-Historie:", err)
            }
        }

        fetchHistory()
    }, [userID, refreshKey])

    const filteredHistory = history.filter(h => {
        const now = Date.now()
        const ranges: Record<string, number> = {
            "2h": 2 * 60 * 60 * 1000,
            "24h": 24 * 60 * 60 * 1000,
            "7d": 7 * 24 * 60 * 60 * 1000,
            "14d": 14 * 24 * 60 * 60 * 1000,
        }

        return filter === "all" ? true : h.timestamp >= now - ranges[filter]
    })

    const items = Array.from(new Set(filteredHistory.map(h => h.item))).sort()
    const datasets = items.map((item, index) => ({
        label: item,
        data: filteredHistory
            .filter(h => h.item === item)
            .map(h => ({ x: new Date(h.timestamp).toLocaleString(), y: h.shards })),
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: COLORS[index % COLORS.length].replace("1)", "0.2)"),
        tension: 0.3,
        fill: true,
    }))

    const chartData = { datasets }

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" as const, labels: { color: "#ffffff" } },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const trade = filteredHistory.find(
                            h => h.item === context.dataset.label &&
                                new Date(h.timestamp).toLocaleString() === context.parsed.x
                        )
                        if (!trade) return `${context.parsed.y} Shards`
                        return `${trade.item}: ${trade.shards} Shards (${new Date(trade.timestamp).toLocaleString()})`
                    }
                }
            },
            title: { display: true, text: "Shard-Handelshistorie", color: "#ffffff" }
        },
        scales: {
            x: {
                title: { display: true, text: "Zeit", color: "#ffffff" },
                ticks: { color: "#ffffff" }
            },
            y: {
                title: { display: true, text: "Shards", color: "#ffffff" },
                ticks: { color: "#ffffff" }
            }
        }
    } as const

    return (
        <div className="shard-chart">
            <div className="filter-buttons">
                {["2h", "24h", "7d", "14d", "all"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={filter === f ? "active" : ""}
                    >
                        {{
                            "2h": "Letzte 2 Stunden",
                            "24h": "Letzte 24 Stunden",
                            "7d": "Letzte 7 Tage",
                            "14d": "Letzte 14 Tage",
                            "all": "Alle Trades"
                        }[f]}
                    </button>
                ))}
            </div>

            {filteredHistory.length > 0 ? (
                <Line data={chartData} options={options} />
            ) : (
                <p>Keine Handelsdaten vorhanden.</p>
            )}
        </div>
    )
}