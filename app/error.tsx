"use client";
import {useRouter} from "next/navigation";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error;
    reset: () => void;
}) {
    const router = useRouter();

    return (
        <div className="status-screen">
            <div className="status-card">
                <h2>Ups, da ist etwas schiefgelaufen.</h2>
                <p>Bitte Probiere es erneut, oder melde dich im Discord falls der Fehler standhaft bleibt. </p>
                <p>Error:</p>
                <p>{error.message || "Bitte versuche es erneut."}</p>
                <div className="status-actions">
                    <button onClick={reset} className="app-button">Erneut versuchen</button>
                </div>
                <br/>
                <button onClick={() => router.back} className="app-button">
                    Zurück
                </button>
            </div>
        </div>
    );
}
