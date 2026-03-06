"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="de">
            <body>
                <div className="status-screen">
                    <div className="status-card">
                        <h2>Schwerer Fehler</h2>
                        <p>{error.message || "Unerwarteter Fehler."}</p>
                        <button onClick={() => reset()} className="app-button">
                            Erneut versuchen
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
