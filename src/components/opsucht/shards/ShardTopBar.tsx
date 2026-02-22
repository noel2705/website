'use client'
import "@/app/dashboard/shards/shardManager.css"
import { useEffect, useState } from "react"
import {formatMoney} from "@/lib/auction";

export default function ShardTopBar({ refreshKey }: { refreshKey: number }) {
    const [currentShards, setCurrentShards] = useState<number | null>(null)
    const [targetShards, setTargetShards] = useState<number | null>(null)

    const fetchData = async () => {
        try {
            const resUUID = await fetch("/api/me")
            const dataUUID = await resUUID.json()
            const uuid = dataUUID.mc_uuid || dataUUID.uuid
            if (!uuid) return console.error("Keine UUID gefunden")

            const resShards = await fetch(`/api/shards/${uuid}`)
            const dataShards = await resShards.json()

            const user = dataShards.user
            if (!user) return console.error("Kein user-Objekt in API")

            const total = Number(user.totalShards)
            const goal = Number(user.shardsGoal)

            setCurrentShards(isNaN(total) ? 0 : total)
            setTargetShards(isNaN(goal) ? 0 : goal)
        } catch (err) {
            console.error("Fehler beim Abrufen der Shard-Daten:", err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [refreshKey])

    if (currentShards === null || targetShards === null) {
        return <div className="top-bar">Lade Shard-Daten…</div>
    }

    return (
        <div className="top-bar">
            <h2>Shards: {formatMoney(currentShards)}</h2>
            <h2>Ziel: {formatMoney(targetShards)}</h2>
        </div>
    )
}