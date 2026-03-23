'use client'

import Link from "next/link";
import { getSessionUser } from "@/hooks/useUser";

export default function UserIcon({ pathname }: { pathname: string }) {
    const { user, loading } = getSessionUser();
    const href = user ? "/dashboard" : "/login";
    const isActive = pathname === href || pathname.startsWith(href + "/");

    if (loading) {
        return <span className="link">...</span>;
    }

    return (
        <Link
            href={href}
            prefetch={false}
            className={`link ${isActive ? "active" : ""}`}
        >
            {user ? (
                <img
                    src={`https://minotar.net/helm/${user?.name ?? "steve"}/100.png`}
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full"
                />
            ) : (
                "👤"
            )}
        </Link>
    );
}
