'use client'

import {useState} from "react"
import "./shardManager.css"
import ShardTopBar from "@/components/opsucht/shards/ShardTopBar"
import ShardHistoryChart from "@/components/opsucht/shards/ShardHistoryChart"
import UploadShardButton from "@/components/opsucht/shards/UploadShardButton"
import CurrentShardCourse from "@/components/opsucht/shards/CurrentShardCourse"
import NotLoggedIn from "@/components/icon/NotLogined"
import {getSessionUser} from "@/hooks/useUser"
import NoPermission from "@/components/icon/NoPermission"
import ShardCalculator from "@/components/opsucht/shards/ShardCalculator"

export default function DashboardShards() {
    const [refreshKey, setRefreshKey] = useState(0)
    const {user, loading} = getSessionUser()
    const filePath = "C:\\Users\\<name>\\AppData\\Roaming\\.minecraft\\labymod-neo\\modpacks\\<modPackName>\\fabric\\1.21.4\\config"

    if (loading) {
        return <p className="shards-loading">Laedt Shard-Daten...</p>
    }

    if (!user) {
        return <NotLoggedIn/>
    }

    const hasShardAccess =
        user?.hasPermission("view.shards.panel") ||
        user?.hasPermission("beta.access")

    if (!hasShardAccess) {
        return (
            <NoPermission
                title="Beta Feature"
                message="Dieser Bereich ist aktuell noch nicht für dich freigeschaltet."
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
                    <div className="shards-filepath-help">
                        <UploadShardButton onUploadSuccess={() => setRefreshKey(v => v + 1)}/>
                        <p className="shards-filepath-title">Datei-Pfad Hilfe</p>
                        <p className="shards-filepath-text">Du findest die Exportdatei in diesem Ordner:</p>
                        <code className="shards-filepath-code">{filePath}</code>
                        <p className="shards-filepath-text">
                            Ersetze <code>&lt;name&gt;</code> und <code>&lt;modPackName&gt;</code> mit deinen echten
                            Werten auf deinem PC, oder suche nach "opdash.json" in deinem PC
                        </p>
                    </div>
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
