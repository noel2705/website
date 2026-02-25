'use client'

import { useEffect, useState } from "react";
import MinecraftNameResolver from "@/lib/utils/minecraftNameResolver";

const resolver = new MinecraftNameResolver();

export default function UserName({ uuid }: { uuid: string }) {
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

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