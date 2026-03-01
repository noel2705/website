'use client'

import { useState } from "react"
import "../../../dashboard/shards/shardManager.css"
import ShardTopBar from "@/components/opsucht/shards/ShardTopBar"
import ShardHistoryChart from "@/components/opsucht/shards/ShardHistoryChart"
import UploadShardButton from "@/components/opsucht/shards/UploadShardButton"
import CurrentShardCourse from "@/components/opsucht/shards/CurrentShardCourse"
import NotLoggedIn from "@/components/icon/NotLogined";
import { isLogin } from '@/hooks/useUserUUID';

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const { uuid, loading } = isLogin()

    if (loading) return <p className="shards-loading">Laedt Shard-Daten...</p>

    if (!uuid) {
        return <NotLoggedIn></NotLoggedIn>
    }

    return (
        <div className="dashboard-shards-page">
            <ShardTopBar refreshKey={refreshKey} />

            <div className="shards-grid">
                <section className="shards-card shards-card-chart">
                    <ShardHistoryChart refreshKey={refreshKey} />
                </section>

                <section className="shards-card shards-card-upload">
                    <UploadShardButton onUploadSuccess={() => setRefreshKey(v => v + 1)} />
                </section>

                <section className="shards-card shards-card-rates">
                    <CurrentShardCourse />
                </section>
            </div>
        </div>
    )
}
