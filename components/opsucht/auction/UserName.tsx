'use client'

import { useEffect, useState } from "react";
import MinecraftNameResolver from "@/lib/utils/minecraftNameResolver";

export default function UserName({ uuid }: { uuid: string }) {
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const resolver = new MinecraftNameResolver({
            storageProvider: typeof window !== "undefined" ? localStorage : undefined,
        });

        const load = async () => {
            const n = await resolver.getName(uuid);
            if (mounted) setName(n);
        };

        load();

        return () => {
            mounted = false;
        };
    }, [uuid]);

    return <>{name ?? "wird geladen…"}</>;
}
