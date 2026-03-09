'use client'

import "./dashboard.css"
import Link from "next/link"
import LogOutButton from "@/components/buttons/LogOutButton"
import NotLoggedIn from "@/components/icon/NotLogined"
import Loading from "@/app/loading"
import {usePathname} from "next/navigation"
import {getSessionUser} from "@/hooks/useUser"

const NAV_ITEMS = [
    {href: "/dashboard/auctions", label: "Auktionen"},
    {href: "/dashboard/settings", label: "Einstellungen"},
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const {user, loading} = getSessionUser()
    const pathname = usePathname()

    const isAdmin = user?.hasPermission("dashboard.view.admin")

    if (loading) return <Loading/>

    if (!user) {
        return <NotLoggedIn/>
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-head">
                    <h2 className="sidebar-title">Dashboard</h2>
                    <p className="sidebar-subtitle">Hier ist dein persönliches Dashboard.</p>
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
                </div>
            </aside>

            <main className="dashboard-content">
                {children}
            </main>
        </div>
    )
}
