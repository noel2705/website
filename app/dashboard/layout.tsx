'use client'

import "./dashboard.css"
import Link from "next/link"
import LogOutButton from "@/components/buttons/LogOutButton"
import {isLogin} from "@/hooks/useUserUUID"
import NotLoggedIn from "@/components/icon/NotLogined"
import Loading from "@/app/loading"
import {usePathname} from "next/navigation"
import {getSessionUser} from "@/hooks/useUser"

const NAV_ITEMS = [
    {href: "/dashboard/auctions", label: "Auktionen"},
    {href: "/dashboard/shards", label: "Shards"},
    {href: "/dashboard/settings", label: "Einstellungen"},
    {href: "/dashboard/opdash-mod", label: "OPDash-Mod"},
]

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    const {uuid, loading} = isLogin()
    const pathname = usePathname()

    const isAdmin = getSessionUser().user?.hasPermission("dashboard.view.admin")

    if (loading) return <Loading/>

    if (!uuid) {
        return <NotLoggedIn/>
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-head">
                    <h2 className="sidebar-title">Dashboard</h2>
                    <p className="sidebar-subtitle">Hier ist dein Persönliches Dashboard</p>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link${isActive ? " active" : ""}`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}

                    {isAdmin && (
                        <Link
                            href="/dashboard/admin"
                            className={`sidebar-link${pathname === "/dashboard/admin" ? " active" : ""}`}
                        >
                            Administration
                        </Link>
                    )}
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
