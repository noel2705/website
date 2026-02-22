'use client';
import { useState, useEffect } from "react";
import { IUser, buildUser } from "@/lib/userTypes";

export function getSessionUser() {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchUser() {
            try {
                const res = await fetch("/api/me");
                if (!res.ok) throw new Error("Nicht eingeloggt");
                const data = await res.json();
                if (mounted) setUser(buildUser(data));
            } catch {
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchUser();

        return () => { mounted = false };
    }, []);

    return { user, loading };
}