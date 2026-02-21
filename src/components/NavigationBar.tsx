'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./css/NavigationBar.css";
import UserIcon from "./icon/UserIcon";

export default function NavigationBar() {
    const pathname = usePathname();
    const [uuid, setUuid] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUuid() {
            try {
                const res = await fetch("/api/me");
                if (!res.ok) throw new Error("Fehler beim Abrufen der UUID");
                const data = await res.json();
                setUuid(data.uuid);
            } catch (err) {
                console.error(err);
            }
        }

        fetchUuid();
    }, []);

    return (
        <nav className="navbar">
            <ul className="list">
                <li><NavLink href="/opsucht/auction" pathname={pathname}>Auktionen</NavLink></li>
                <li><NavLink href="/opsucht/market" pathname={pathname}>Market</NavLink></li>
                    <li><NavLink href={`/opsucht/shards/${uuid}`} pathname={pathname}>Shard</NavLink></li>
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