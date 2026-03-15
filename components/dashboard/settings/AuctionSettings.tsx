"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_AUCTION_CARD_SETTINGS, AuctionCardSettings } from "@/lib/utils/userSettings";
import { useSessionUser } from "@/hooks/useUser";

type SaveState = "idle" | "saving" | "saved" | "error";

const SETTING_LABELS: Array<{ key: keyof AuctionCardSettings; label: string; hint: string }> = [
    { key: "showImage", label: "Item-Bild", hint: "Bild der Auktion anzeigen." },
    { key: "showDesiredBadge", label: "Begehrt-Icon", hint: "Badge bei beliebten Auktionen." },
    { key: "showDisplayName", label: "Displayname", hint: "Item-Displayname anzeigen." },
    { key: "showMaterial", label: "Material", hint: "Item Material anzeigen." },
    { key: "showAmount", label: "Menge", hint: "Item-Anzahl anzeigen." },
    { key: "showSeller", label: "Verkäufer", hint: "Verkäufername anzeigen." },
    { key: "showPrice", label: "Preis", hint: "Aktuelles Gebot anzeigen." },
    { key: "showEndTime", label: "Endzeit", hint: "Countdown bzw. Enddatum anzeigen." },
    { key: "showBids", label: "Gebote", hint: "Anzahl Gebote anzeigen." },
    { key: "showCategory", label: "Kategorie", hint: "Auktionskategorie anzeigen." },
];

export default function AuctionSettings() {
    const { user, loading } = useSessionUser();
    const canEdit = user?.hasPermission("settings.auctions.edit") ?? false;
    const [settings, setSettings] = useState<AuctionCardSettings>(DEFAULT_AUCTION_CARD_SETTINGS);
    const [initialSettings, setInitialSettings] = useState<AuctionCardSettings>(DEFAULT_AUCTION_CARD_SETTINGS);
    const [status, setStatus] = useState<SaveState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [needsInit, setNeedsInit] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

    const sortedSettings = useMemo(() => SETTING_LABELS, []);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            setLoaded(true);
            return;
        }

        let active = true;
        const load = async () => {
            try {
                const res = await fetch("/api/user-settings", { cache: "no-store" });
                if (!active) return;

                if (res.status === 409) {
                    setNeedsInit(true);
                    setLoaded(true);
                    return;
                }

                if (!res.ok) {
                    throw new Error("Settings konnten nicht geladen werden.");
                }

                const data = await res.json();
                const next = (data?.settings?.auctionCard ?? DEFAULT_AUCTION_CARD_SETTINGS) as AuctionCardSettings;
                setSettings(next);
                setInitialSettings(next);
                setDirty(false);
                setNeedsInit(false);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoaded(true);
            }
        };

        void load();
        return () => {
            active = false;
        };
    }, [loading, user]);

    const saveSettings = async () => {
        if (!loaded || !canEdit || !user) return;
        if (!dirty) return;
        if (lastSavedAt && Date.now() - lastSavedAt < 2000) {
            setStatus("error");
            setError("Bitte 2 Sekunden zwischen den SpeichervorgÃ¤ngen warten.");
            return;
        }

        try {
            setStatus("saving");
            setError(null);
            const res = await fetch("/api/user-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: { auctionCard: settings } }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error ?? "Speichern fehlgeschlagen.");
            }

            setStatus("saved");
            setInitialSettings(settings);
            setDirty(false);
            setLastSavedAt(Date.now());
            setTimeout(() => setStatus("idle"), 1500);
        } catch (err) {
            setStatus("error");
            setError((err as Error).message);
        }
    };

    const toggleSetting = (key: keyof AuctionCardSettings) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            setDirty(JSON.stringify(next) !== JSON.stringify(initialSettings));
            return next;
        });
    };

    const resetDefaults = () => {
        setSettings(DEFAULT_AUCTION_CARD_SETTINGS);
        setDirty(JSON.stringify(DEFAULT_AUCTION_CARD_SETTINGS) !== JSON.stringify(initialSettings));
    };

    const initTable = async () => {
        setError(null);
        try {
            const res = await fetch("/api/init-user-settings", { method: "POST" });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error ?? "Init fehlgeschlagen.");
            }
            setNeedsInit(false);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <section className="dashboard-panel">
            <div className="settings-head">
                <div>
                    <h2>Auktionen</h2>
                    <p>Lege fest, welche Felder auf Auktionskarten sichtbar sind.</p>
                </div>
                <div className="settings-actions">
                    <button
                        type="button"
                        className="settings-primary"
                        onClick={saveSettings}
                        disabled={!canEdit || !dirty || (lastSavedAt ? Date.now() - lastSavedAt < 2000 : false)}
                        title={!dirty ? "Keine Änderungen" : "Einstellungen speichern"}
                    >
                        Speichern
                    </button>
                    <button
                        type="button"
                        className="settings-reset"
                        onClick={resetDefaults}
                        disabled={!canEdit}
                    >
                        Zurücksetzen
                    </button>
                </div>
            </div>

            {needsInit && (
                <div className="settings-warning">
                    <p>Die Settings-Tabelle ist noch nicht initialisiert.</p>
                    <button type="button" className="settings-primary" onClick={initTable}>
                        Init ausführen
                    </button>
                </div>
            )}

            {!user && !loading && (
                <p className="dashboard-note">Bitte einloggen, um Einstellungen zu speichern.</p>
            )}

            {user && !canEdit && (
                <p className="dashboard-note">Dir fehlt die Berechtigung, diese Einstellungen zu Ã¤ndern.</p>
            )}

            <div className="auction-settings-grid">
                {sortedSettings.map((entry) => (
                    <label key={entry.key} className={`auction-setting${settings[entry.key] ? " active" : ""}`}>
                        <span className="setting-label">{entry.label}</span>
                        <span className="setting-hint">{entry.hint}</span>
                        <input
                            type="checkbox"
                            checked={settings[entry.key]}
                            onChange={() => toggleSetting(entry.key)}
                            disabled={!canEdit}
                        />
                        <span className="setting-toggle" aria-hidden="true" />
                    </label>
                ))}
            </div>

            {status !== "idle" && (
                <p className={`settings-status ${status}`}>
                    {status === "saving" && "Speichern..."}
                    {status === "saved" && "Gespeichert"}
                    {status === "error" && "Fehler beim Speichern"}
                </p>
            )}

            {lastSavedAt && (
                <p className="dashboard-note">
                    Zuletzt gespeichert: {new Date(lastSavedAt).toLocaleTimeString("de-DE")}
                </p>
            )}

            {error && <p className="settings-error">{error}</p>}
        </section>
    );
}
