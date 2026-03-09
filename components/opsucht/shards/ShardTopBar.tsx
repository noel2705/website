'use client'
import "@/app/opsucht/shards/shardManager.css"
import { useEffect, useState } from "react"
import { formatMoney } from "@/lib/utils/auction/auction"

export default function ShardTopBar({
                                        refreshKey,
                                        user
                                    }: {
    refreshKey: number
    user: any
}) {

    const [currentShards, setCurrentShards] = useState<number | null>(null)
    const [targetShards, setTargetShards] = useState<number | null>(null)

    const fetchData = async () => {
        if (!user) return

        try {
            const uuid = user.uuid
            if (!uuid) return

            const resShards = await fetch(`/api/shards/${uuid}`)
            const dataShards = await resShards.json()

            const apiUser = dataShards.user
            if (!apiUser) return

            const total = Number(apiUser.totalShards)
            const goal = Number(apiUser.shardsGoal)

            setCurrentShards(isNaN(total) ? 0 : total)
            setTargetShards(isNaN(goal) ? 0 : goal)

        } catch (err) {
            console.error("Fehler beim Abrufen der Shard-Daten:", err)
        }
    }

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [refreshKey, user])

    if (!user) {
        return <div className="top-bar">ㅤ</div>
    }

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