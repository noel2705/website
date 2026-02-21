"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./css/NavigationBar.css";
import UserIcon from "./UserIcon";

export default function NavigationBar() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <ul className="list">
                <li><NavLink href="/opsucht/auction" pathname={pathname}>Auktionen</NavLink></li>
                <li><NavLink href="/opsucht/market" pathname={pathname}>Market</NavLink></li>
                <li><NavLink href="/opsucht/shard" pathname={pathname}>Shard</NavLink></li>
            </ul>

            <div className="right">
             <UserIcon></UserIcon>
            </div>
        </nav>
    );
}

// @ts-ignore
function NavLink({ href, pathname, children }) {
    return (
        <Link
            href={href}
            className={`link ${pathname.startsWith(href) ? "active" : ""}`}
        >
            {children}
        </Link>
    );
}
