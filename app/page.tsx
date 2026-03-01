import React from 'react';
import Link from "next/link";

import './globals.css'

export default function Home() {
    return (
        <main>
            <section className="app-panel" style={{ padding: "1.2rem" }}>
                <h1 className="app-title">OPDash Plattform</h1>
                <p className="app-muted">
                    Auktionsmarkt, Shard-Tools und Dashboard-Funktionen in einem einheitlichen Theme.
                </p>
                <div className="status-actions" style={{ marginTop: "0.9rem", justifyContent: "flex-start" }}>
                    <Link href="/opsucht/auction" className="status-link">Zu den Auktionen</Link>
                    <Link href="/opsucht/market" className="status-link">Zum Market</Link>
                    <Link href="/dashboard" className="status-link">Zum Dashboard</Link>
                </div>
            </section>
        </main>
    );
}
