import { useState, useEffect } from "react";
import { IUser, buildUser } from "@/lib/utils/userTypes";
import { getMeCached } from "@/lib/utils/meClient";

export function getSessionUser() {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchUser() {
            const data = await getMeCached();
            if (!mounted) return;

            if (data) {
                setUser(buildUser(data));
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
