'use client'

import "./dashboard.css"
import Link from "next/link"
import LogOutButton from "@/components/dashboard/LogOutButton"
import {isLogin} from "@/hooks/useUserUUID"
import NotLoggedIn from "@/components/icon/NotLogined";
import Loading from "@/app/loading";
import {useEffect} from "react";
import {getSessionUser} from "@/hooks/useUser";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    const {uuid, loading} = isLogin()

    const isAdmin = getSessionUser().user?.hasPermission("dashboard.view.admin")
    if (loading) return <Loading/>

    if (!uuid) {
        return <NotLoggedIn/>

    }


    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2 className="sidebar-title">Dashboard</h2>

                <nav className="sidebar-nav">
                    <Link href="/dashboard/auctions" className="sidebar-link">
                        📦 Auktionen
                    </Link>

                    <Link href="/dashboard/shards" className="sidebar-link">
                        🧩 Shards
                    </Link>


                    <Link href="/dashboard/settings" className="sidebar-link">
                        ⚙️ Einstellungen
                    </Link>

                    {isAdmin && <Link href="/dashboard/admin" className="sidebar-link">
                        👤 Administration
                    </Link>
                    }
                </nav>

                <div className="sidebar-footer">
                    <LogOutButton/>
                </div>
            </aside>

            <main className="dashboard-content">
                {children}
            </main>
        </div>
    )
}