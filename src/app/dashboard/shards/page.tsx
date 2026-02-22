'use client'

import { useEffect, useState } from "react"
import "./shardManager.css"
import ShardTopBar from "@/components/opsucht/shards/ShardTopBar"
import ShardHistoryChart from "@/components/opsucht/shards/ShardHistoryChart"
import UploadShardButton from "@/components/opsucht/shards/UploadShardButton"
import CurrentShardCourse from "@/components/opsucht/shards/CurrentShardCourse"
import NotLoggedIn from "@/components/icon/NotLogined";
import { isLogin } from '@/hooks/useUserUUID';
import {getSessionUser} from "@/hooks/useUser";
import NoPermission from "@/components/icon/NoPermission";

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const { uuid, loading } = isLogin()
    const { user} = getSessionUser();


    if (loading) {
        return <p>Lädt...</p>
    }

    if(!uuid){
        return <NotLoggedIn></NotLoggedIn>
    }

    const hasShardAccess =
        user?.hasPermission("view_shards_panel") ||
        user?.hasPermission("beta_access")

    if (!hasShardAccess) {
        return (
            <NoPermission
                title="🧪 Beta Feature"
                message="Dieser Bereich ist aktuell noch nicht für dich freigeschaltet."
                backHref="/dashboard"
            />
        )
    }
    return (
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <ShardTopBar refreshKey={refreshKey} />

            <div style={{
                display: "flex",
                gap: "20px",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap"
            }}>
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <ShardHistoryChart refreshKey={refreshKey} />
                </div>

                <div style={{ flex: 1, minWidth: "250px" }}>
                    <UploadShardButton onUploadSuccess={() => setRefreshKey(v => v + 1)} />
                </div>

                <div style={{ flex: 1, minWidth: "250px" }}>
                    <CurrentShardCourse />
                </div>
            </div>
        </div>
    )
}