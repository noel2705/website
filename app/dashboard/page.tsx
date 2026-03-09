'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import UserName from "@/components/opsucht/auction/UserName";
import { getSessionUser } from "@/hooks/useUser";

export default function Dashboard() {
    const router = useRouter();
    const { user, loading } = getSessionUser();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading) return <div>Lade...</div>;
    if (!user?.uuid) return null;

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <h1>Willkommen, <UserName uuid={user.uuid} />!</h1>
                <h3>
                    Nutze die Navigation, um Auktionen und deine Einstellungen schnell zu verwalten.
                </h3>

                <h3>Deine Login Streak: {user.loginStreak}</h3>
                <h3>Beste Login Streak: {user.bestLoginStreak}</h3>
            </section>
        </div>
    );
}