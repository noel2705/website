'use client'

import Link from "next/link";
import { useState } from "react";

type ShowcaseItem = {
    title: string;
    src: string;
    alt: string;
    description: string;
};

const showcaseItems: ShowcaseItem[] = [
    {
        title: "Shard Berechner",
        src: "/opdash/opdash_2.png",
        alt: "Shard Berechner view",
        description: "Berechne die Shard Anzahl deiner Items, mit dem Aktuellem Kurs",
    },
    {
        title: "Calculator Detail",
        src: "/opdash/opdash_5.png",
        alt: "Shard Calculator detail view",
        description: "Der Rechner der deine Items in Shards umgerechnet",
    },
    {
        title: "Shard Overlay",
        src: "/opdash/opdash_3.png",
        alt: "Shard overlay in game",
        description: "Überblick deiner Aktuellen Shards, und was sie potenziell in Geld zum Kauf oder Verkaufen Wert wären",
    },
    {
        title: "Schnell-Text",
        src: "/opdash/opdash_4.png",
        alt: "Quick text menu",
        description: "Du hast zu viele Hotkeys? Das ist die Lösung. Nur ein Knopfdruck und du sendest deine Werbung, oder führst einen Befehl aus",
    },
    {
        title: "Trade History",
        src: "/opdash/opdash.png",
        alt: "Trade history in OPDash",
        description: "Das Mod Features, welches mit dieser Website genutzt werden kann. Lade einfach deine Datei hoch und habe deine Trades in einem Diagramm im Blick"
    },
    {
        title: "Overview HUD",
        src: "/opdash/opdash_hud.png",
        alt: "Feature overview HUD",
        description: "Ingame Übersicht aller Features",
    },
];

export default function OPDashMod() {
    const [activeImage, setActiveImage] = useState<ShowcaseItem | null>(null);

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
                {showcaseItems.map((item, index) => (
                    <div
                        className={`opdash-card ${index >= showcaseItems.length - 2 ? "opdash-card-featured" : ""}`}
                        key={item.src}
                    >
                        <h2>{item.title}</h2>
                        <button
                            type="button"
                            className="opdash-image-button"
                            onClick={() => setActiveImage(item)}
                        >
                            <img src={item.src} alt={item.alt} loading="lazy" />
                        </button>
                        <p>{item.description}</p>
                    </div>
                ))}
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

            {activeImage && (
                <div className="opdash-lightbox" onClick={() => setActiveImage(null)}>
                    <div className="opdash-lightbox-card" onClick={(event) => event.stopPropagation()}>
                        <button
                            type="button"
                            className="opdash-lightbox-close"
                            onClick={() => setActiveImage(null)}
                        >
                            Schliessen
                        </button>
                        <img src={activeImage.src} alt={activeImage.alt} className="opdash-lightbox-image" />
                        <h3>{activeImage.title}</h3>
                        <p>{activeImage.description}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
