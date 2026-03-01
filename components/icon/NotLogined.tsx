'use client';

export default function NotLoggedIn() {
    return (
        <div className="status-screen">
            <div className="status-card">
                <h1>Du bist nicht eingeloggt</h1>
                <p>Bitte melde dich an, um auf diese Seite zugreifen zu koennen.</p>
                <div className="status-actions">
                    <a href="/login" className="status-link">Jetzt anmelden</a>
                </div>
            </div>
        </div>
    );
}
