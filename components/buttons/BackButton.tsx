'use client';
import { useRouter } from "next/navigation";
import '@/components/css/components.css';

export default function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push("/opsucht/auction");
        }
    };

    return (
        <button className="backButton" onClick={handleBack}>
            Zurück
        </button>
    );
}