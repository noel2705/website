"use client";
import Link from "next/link";
import {getSessionUser} from "@/hooks/useUser";

export default function UserIcon({pathname}: { pathname: string }) {



    const { user, loading } = getSessionUser();

    if (loading) return null;

    const loggedIn = !!user;

    const href = loggedIn ? "/dashboard" : "/login";
    const isActive = pathname === href || pathname.startsWith(href + "/");

    return (
        <>
            <Link
                href={href}
                className={`link ${isActive ? "active" : ""}`}
            >
                {loggedIn ? "Dein Profil" : "👤"}
            </Link>



        </>
    );
}