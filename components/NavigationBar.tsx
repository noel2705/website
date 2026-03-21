'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./css/NavigationBar.css";
import UserIcon from "./icon/UserIcon";
import {usePathname} from "next/navigation";

export default function NavigationBar() {
    const pathname = usePathname()



    return (
        <nav className="navbar">
            <ul className="list">
                <li><NavLink
                    href="/opsucht/auction" pathname={pathname}>Auktionen</NavLink></li>
                <li><NavLink href="/opsucht/market" pathname={pathname}>Market</NavLink></li>
                <li><NavLink href="/opsucht/shards" pathname={pathname}>Shards</NavLink></li>
                    <li><NavLink href={`/opdash-mod`} pathname={pathname}>OPHub-MOD</NavLink></li>
            </ul>

            <div className="right">
                <UserIcon pathname={pathname} />
            </div>
        </nav>
    );
}

function NavLink({ href, pathname, children }: { href: string; pathname: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            prefetch={false}
            onClick={() => {
                if (href !== "/opsucht/auction") return;
                if (typeof window === "undefined") return;
                window.history.replaceState(null, "", href);
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }}
            className={`link ${pathname.startsWith(href) ? "active" : ""}`}
        >
            {children}
        </Link>
    );
}
