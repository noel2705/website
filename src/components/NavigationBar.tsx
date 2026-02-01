"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./css/NavigationBar.css";

export default function NavigationBar() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            {/* LINKS */}
            <ul className="list">
                <li><NavLink href="/opsucht/auction" pathname={pathname}>Auktionen</NavLink></li>
                <li><NavLink href="/opsucht/market" pathname={pathname}>Market</NavLink></li>
                <li><NavLink href="/opsucht/shard" pathname={pathname}>Shard</NavLink></li>
            </ul>

            <div className="right">
                <Link href="/login" className="loginIcon">
                    👤
                </Link>
            </div>
        </nav>
    );
}

// @ts-ignore
function NavLink({ href, pathname, children }) {
    return (
        <Link
            href={href}
            className={`link ${pathname === href ? "active" : ""}`}
        >
            {children}
        </Link>
    );
}
