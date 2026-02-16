'use client';
import { useRouter } from "next/navigation";
import '@/components/css/components.css';
export default function BackButton() {
    const router = useRouter();

    return (
        <button
            className="backButton"
            onClick={() => router.push("/opsucht/auction")}
        >
            Zurück
        </button>
    );
}
