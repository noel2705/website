"use client";

import { useState, useEffect } from "react";
import { IUser, buildUser } from "@/lib/utils/userTypes";
import type { UserSettings } from "@/lib/utils/userSettings";
import { getMeCached } from "@/lib/utils/meClient";

export function useSessionUser() {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchUser() {
            const data = await getMeCached();
            if (!mounted) return;

            if (data) {
                const normalized = {
                    ...data,
                    settings: (data.settings ?? null) as Partial<UserSettings> | null,
                };
                setUser(buildUser(normalized));
            } else {
                setUser(null);
            }

            setLoading(false);
        }

        void fetchUser();

        return () => { mounted = false };
    }, []);

    return { user, loading };
}

export const getSessionUser = useSessionUser;
