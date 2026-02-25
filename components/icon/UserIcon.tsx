"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserIcon({ pathname }: { pathname: string }) {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkLogin() {
            try {
                const logged = await isLoggedIn();
                setLoggedIn(logged);
            } catch {
                setLoggedIn(false);
            }
        }

        checkLogin();
    }, []);

    async function isLoggedIn() {
        try {
            const res = await fetch("/api/check-login");
            const data = await res.json();
            return data.loggedIn;
        } catch {
            return false;
        }
    }

    if (loggedIn === null) return null;

    const href = loggedIn ? "/dashboard" : "/login";
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
    <Link
        href={href}
        className={`link ${isActive ? "active" : ""}`}
    >
        {loggedIn ? "Dein Profil" : "👤"}
    </Link>
    );
}