'use client'

import {useState} from "react"
import "./shardManager.css"
import ShardTopBar from "@/components/opsucht/shards/ShardTopBar"
import ShardHistoryChart from "@/components/opsucht/shards/ShardHistoryChart"
import UploadShardButton from "@/components/opsucht/shards/UploadShardButton"
import CurrentShardCourse from "@/components/opsucht/shards/CurrentShardCourse"
import NotLoggedIn from "@/components/icon/NotLogined"
import {isLogin} from '@/hooks/useUserUUID'
import {getSessionUser} from "@/hooks/useUser"
import NoPermission from "@/components/icon/NoPermission"
import ShardCalculator from "@/components/opsucht/shards/ShardCalculator"

export default function DashboardShards() {
    const [refreshKey, setRefreshKey] = useState(0)
    const {uuid, loading} = isLogin()
    const {user} = getSessionUser()

    if (loading) {
        return <p className="shards-loading">Laedt Shard-Daten...</p>
    }

    if (!uuid) {
        return <NotLoggedIn/>
    }

    const hasShardAccess =
        user?.hasPermission("view.shards.panel") ||
        user?.hasPermission("beta.access")

    if (!hasShardAccess) {
        return (
            <NoPermission
                title="Beta Feature"
                message="Dieser Bereich ist aktuell noch nicht fuer dich freigeschaltet."
                backHref="/dashboard"
            />
        )
    }

    return (
        <div className="dashboard-shards-page">
            <ShardTopBar refreshKey={refreshKey}/>

            <div className="shards-grid">
                <section className="shards-card shards-card-chart">
                    <ShardHistoryChart refreshKey={refreshKey}/>
                </section>

                <section className="shards-card shards-card-upload">
                    <UploadShardButton onUploadSuccess={() => setRefreshKey(v => v + 1)}/>
                </section>

                <section className="shards-card shards-card-rates">
                    <CurrentShardCourse/>
                </section>
            </div>

            {user?.hasPermission("view.shard.calculator") && (
                <section className="shards-card shards-card-calculator">
                    <ShardCalculator/>
                </section>
            )}
        </div>
    )
}
