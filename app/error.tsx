"use client";

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <div className="status-screen">
            <div className="status-card">
                <h2>Ups, da ist etwas schiefgelaufen.</h2>
                <p>{error.message || "Bitte versuche es erneut."}</p>
                <div className="status-actions">
                    <button onClick={reset} className="app-button">Erneut versuchen</button>
                </div>
            </div>
        </div>
    );
}
