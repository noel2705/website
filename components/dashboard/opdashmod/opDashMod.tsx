'use client'
import "@/components/css/opdashmod.css"
import Link from "next/link";

export default function OPDashMod() {
    return (
        <div className="opdash-container">

            <header className="opdash-header">
                <h1>OPDash-Mod</h1>
                <p className="opdash-info">
                    Mit Hilfe dieser Mod hast du eine Übersicht über deine Shard-Trades.
                    Berechne jederzeit den Wert deiner Items in Shards und behalte den Überblick
                    über Spielzeit, Shards und vieles mehr.
                </p>
            </header>

            <section className="opdash-grid">

                <div className="opdash-card">
                    <h2>Shard Calculator</h2>
                    <img src="/opdash/opdash_2.png" loading="lazy" />
                    <img src="/opdash/opdash_5.png" loading="lazy" />
                </div>

                <div className="opdash-card">
                    <h2>Shard Overlay</h2>
                    <img src="/opdash/opdash_3.png" loading="lazy" />
                    <p>
                        Übersicht deiner aktuellen Shards und potenzieller Verkaufs-
                        oder Kaufwerte.
                    </p>
                </div>

                <div className="opdash-card">
                    <h2>Hotkey & Werbung HUD</h2>
                    <img src="/opdash/opdash_4.png" loading="lazy" />
                    <p>
                        Öffne mit einem Klick ein Menü mit nützlichen Befehlen
                        und Schnelltexten.
                    </p>
                </div>

                <div className="opdash-card wide">
                    <h2>Shard Handelshistorie</h2>
                    <img src="/opdash/opdash.png" loading="lazy" />
                    <p>
                        Die Mod speichert alle Trades und erstellt eine Datei,
                        die du hier hochladen kannst.
                    </p>
                </div>

            </section>

            <div className="opdash-buttons">
                <Link className="opdash-link" href="/dashboard/shards">
                    Zu den Shard Features
                </Link>

                <Link
                    className="opdash-link highlight"
                    href="https://modrinth.com/mod/opdash"
                    target="_blank"
                >
                    Mod herunterladen
                </Link>
            </div>

        </div>
    )
}