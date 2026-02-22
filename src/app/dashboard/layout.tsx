'use client'

import "./dashboard.css"
import Link from "next/link"
import LogOutButton from "@/components/dashboard/LogOutButton"
import { isLogin } from "@/hooks/useUserUUID"
import NotLoggedIn from "@/components/icon/NotLogined";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    const { uuid, loading } = isLogin()

    if (loading) {
        return <div className="dashboard-loading">Lädt...</div>
    }

    if (!uuid) {
        return <NotLoggedIn />
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

                    <Link href="/dashboard/admin" className="sidebar-link">
                        👤 Administration
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <LogOutButton />
                </div>
            </aside>

            <main className="dashboard-content">
                {children}
            </main>
        </div>
    )
}