"use client";
import { useRouter } from "next/navigation";

export default function DashBoardAuctions({ uuid }: { uuid: string }) {
    const router = useRouter();

    return (
        <div className="p-4">
            <button onClick={() => router.push(`/opsucht/auction/user/${uuid}`)}>
                Auktionsprofil
            </button>
        </div>
    );
}