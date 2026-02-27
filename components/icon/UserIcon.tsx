"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {getSessionUser} from "@/hooks/useUser";

export default function UserIcon({ pathname }: { pathname: string }) {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkLogin() {
            try {
                const {user, loading} = await getSessionUser()

                if(!user){
                    setLoggedIn(false)
                    return
                }
                setLoggedIn(true);
            } catch {
                setLoggedIn(false);
            }
        }

        checkLogin();
    }, []);



    if (loggedIn === null) return null;

    const href = loggedIn ? "/dashboard" : "/login";
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
    <Link
        href={href}
        className={`link ${isActive ? "active" : ""}`}
    >
        {!loggedIn ? "Dein Profil" : "👤"}
    </Link>
    );
}