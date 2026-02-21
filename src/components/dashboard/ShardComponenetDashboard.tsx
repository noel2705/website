"use client";
import { useRouter } from "next/navigation";

export default function ShardComponenetDashboard({ uuid }: { uuid: string }) {
    const router = useRouter();

    return (
        <div className="p-4">
            <button onClick={() => router.push(`/opsucht/shards/${uuid}`)}>
                Shard Manager
            </button>
        </div>
    );
}