'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./css/NavigationBar.css";
import UserIcon from "./icon/UserIcon";

export default function NavigationBar() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <ul className="list">
                <li><NavLink href="/opsucht/auction" pathname={pathname}>Auktionen</NavLink></li>
                <li><NavLink href="/opsucht/market" pathname={pathname}>Market</NavLink></li>
                    <li><NavLink href={`/opdash-mod`} pathname={pathname}>OPDASH-MOD</NavLink></li>
            </ul>

            <div className="right">
                <UserIcon pathname={pathname} />
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
