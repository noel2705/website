'use client'

import {useEffect, useState} from "react"
import "./shardManager.css"
import ShardTopBar from "@/components/opsucht/shards/ShardTopBar"
import ShardHistoryChart from "@/components/opsucht/shards/ShardHistoryChart"
import UploadShardButton from "@/components/opsucht/shards/UploadShardButton"
import CurrentShardCourse from "@/components/opsucht/shards/CurrentShardCourse"
import {getSessionUser} from "@/hooks/useUser"
import ShardCalculator from "@/components/opsucht/shards/ShardCalculator"
import LockedSection from "@/components/icon/LockedSection"

export default function Shards() {

    const [refreshKey, setRefreshKey] = useState(0)
    const {user, loading} = getSessionUser()

    const filePath = "C:\\Users\\<name>\\AppData\\Roaming\\.minecraft\\labymod-neo\\modpacks\\<modPackName>\\fabric\\1.21.4\\config"


    if (loading) {
        return <p className="shards-loading">Lädt Shard-Daten...</p>
    }

    const hasShardAccess =
        user?.hasPermission("view.shards.panel") ||
        user?.hasPermission("beta.access")




    return (
        <div className="dashboard-shards-page">

            <LockedSection locked={!user}>
                <ShardTopBar refreshKey={refreshKey} user={user}/>
            </LockedSection>

            <div className="shards-grid">

                <LockedSection locked={!hasShardAccess}>
                    <section className="shards-card shards-card-chart">
                        <ShardHistoryChart refreshKey={refreshKey}/>
                    </section>
                </LockedSection>

                <LockedSection locked={!hasShardAccess}>
                    <section className="shards-card shards-card-upload">
                        <div className="shards-filepath-help">
                            <UploadShardButton onUploadSuccess={() => setRefreshKey(v => v + 1)}/>
                            <p className="shards-filepath-title">Datei-Pfad Hilfe</p>
                            <p className="shards-filepath-text">
                                Du findest die Exportdatei in diesem Ordner:
                            </p>
                            <code className="shards-filepath-code">{filePath}</code>
                        </div>
                    </section>
                </LockedSection>

                <section className="shards-card shards-card-rates">
                    <CurrentShardCourse/>
                </section>

                <section className="shards-card shards-card-calculator">
                    <ShardCalculator/>
                </section>

            </div>





        </div>
    )
}