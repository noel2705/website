'use client'

import { useEffect, useState } from "react";
import MinecraftNameResolver from "@/lib/minecraftNameResolver";

export default function UserName({ uuid }: { uuid: string }) {
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const resolver = new MinecraftNameResolver();
            const n = await resolver.getName(uuid);
            if (mounted) setName(n);
        };

        load();

        return () => {
            mounted = false;
        };
    }, [uuid]);

    return <>{name ?? "..."}</>;
}
