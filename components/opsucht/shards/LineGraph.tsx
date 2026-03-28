import { Line } from 'react-chartjs-2'
import "../../css/shard/LineGraph.css"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { useEffect, useState } from "react";


ChartJS.register(CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export const LineGraph = () => {
    const [data, setData] = useState<any>({ datasets: [] })
    const [error, setError] = useState<string | null>(null)
    const [hiddenLabels, setHiddenLabels] = useState<Set<string>>(new Set())

    const toLabel = (source: string) => {
        const match = source.match(/item_name='([^']+)'/)
        if (match) {
            try {
                const parsed = JSON.parse(match[1])
                if (parsed?.text && typeof parsed.text === "string" && parsed.text.trim().length > 0) {
                    return parsed.text
                }
                if (Array.isArray(parsed?.extra)) {
                    const extraText = parsed.extra
                        .map((entry: any) => (typeof entry?.text === "string" ? entry.text : ""))
                        .join("")
                        .trim()
                    if (extraText.length > 0) return extraText
                }
            } catch {
                return source
            }
        }
        return source
    }

    const ICON_MAP: Record<string, string> = {
        "Holzbündel": "/custom-items/holzbndel.png",
        "Gräbergemisch": "https://i.postimg.cc/x8Jt4M99/grabergemisch.png",
        "Steinplatten": "/custom-items/steinplatten.png",
        "diamond_block": "https://img.mc-api.io/diamond_block.png",
        "netherite_ingot": "https://img.mc-api.io/netherite_ingot.png",
    }

    const toIcon = (source: string, label: string) => ICON_MAP[source] ?? ICON_MAP[label] ?? "/custom-items/default.png"

    useEffect(() => {

        const getHistory = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_AUCTION_BACKEND_URL ?? ""
                const url = base.endsWith("/") ? `${base}api/shardrates` : `${base}/api/shardrates`

                const res = await fetch(url)

                if (!res.ok) {
                    setError("Ein Fehler ist aufgetreten")
                    return
                }

                const rows = await res.json()
                if (!Array.isArray(rows)) {
                    setError("Ungueltige Daten")
                    return
                }

                const series: Record<string, { x: string; y: number }[]> = {}

                rows
                    .slice()
                    .sort((a: any, b: any) => {
                        const aTime = a?.savedAt ? new Date(a.savedAt).getTime() : 0
                        const bTime = b?.savedAt ? new Date(b.savedAt).getTime() : 0
                        return aTime - bTime
                    })
                    .forEach((row: any) => {
                        const savedAt = row?.savedAt ? new Date(row.savedAt).toLocaleString() : null
                        const rate = row?.rate
                        if (!savedAt || !Array.isArray(rate)) return

                        rate.forEach((entry: any) => {
                            if (!entry || typeof entry.source !== "string") return
                            if (typeof entry.exchangeRate !== "number") return

                            if (!series[entry.source]) series[entry.source] = []
                            series[entry.source].push({ x: savedAt, y: entry.exchangeRate })
                        })
                    })

                const datasets = Object.entries(series).map(([label, points], index) => ({
                    label: toLabel(label),
                    data: points,
                    borderColor: `hsl(${(index * 47) % 360} 70% 55%)`,
                    backgroundColor: `hsla(${(index * 47) % 360} 70% 55% / 0.2)`,
                    tension: 0.3,
                    fill: true,
                    icon: toIcon(label, toLabel(label)),
                }))

                setData({ datasets })
                setHiddenLabels(new Set())
                setError(null)
            } catch (err) {
                console.error(err)
                setError("Ein Fehler ist aufgetreten")
            }
        }

        getHistory()
    }, []);

    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                display: false
            },
            title: {
                display: true,
                text: "Shard Kursverlauf",
                position: 'top',
                color: '#ffffff'
            }
        }
    } as const

    const toggleLabel = (label: string) => {
        setHiddenLabels((prev) => {
            const next = new Set(prev)
            if (next.has(label)) {
                next.delete(label)
            } else {
                next.add(label)
            }
            return next
        })
    }

    const datasets = Array.isArray(data?.datasets)
        ? data.datasets.map((dataset: any) => ({
            ...dataset,
            hidden: hiddenLabels.has(dataset.label),
        }))
        : []

    const handleIconError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const target = event.currentTarget
        if (target.dataset.fallbackApplied === "1") return
        target.dataset.fallbackApplied = "1"
        target.src = "/custom-items/default.png"
    }


    return <>
        {error ? <p>{error}</p> : (
            <>
                <div className="chart-legend-buttons">
                    {datasets.map((dataset: any) => (
                        <button
                            key={dataset.label}
                            type="button"
                            onClick={() => toggleLabel(dataset.label)}
                            className={hiddenLabels.has(dataset.label) ? "inactive" : "active"}
                            style={{ borderColor: dataset.borderColor }}
                        >
                            <span className="legend-icon">
                                <img
                                    src={dataset.icon ?? "/custom-items/default.png"}
                                    alt=""
                                    onError={handleIconError}
                                    decoding="async"
                                />
                            </span>
                            {dataset.label}
                        </button>
                    ))}
                </div>
                <Line options={options} data={{ datasets }} />
            </>
        )}
    </>
}
