'use client';

export default function NotLoggedIn() {
    return (
        <div className="not-logged-in">
            <div className="card">
                <h1>🔒 Du bist nicht eingeloggt</h1>
                <p>Bitte melde dich an, um auf diese Seite zugreifen zu können.</p>
                <a href="/login" className="login-button">Jetzt anmelden</a>
            </div>

            <style jsx global>{`
                /* HTML und Body auf volle Höhe + kein Scrollen */
                html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
            `}</style>

            <style jsx>{`
                .not-logged-in {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    width: 100%;
                    background: linear-gradient(135deg, #a25858, #0000ff);
                    font-family: 'Arial', sans-serif;
                }

                .card {
                    background-color: #5d5959;
                    padding: 40px 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(255, 0, 0, 0.2);
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                }

                .card h1 {
                    font-size: 24px;
                    margin-bottom: 16px;
                    color: #ffffff;
                }

                .card p {
                    font-size: 16px;
                    margin-bottom: 24px;
                    color: #ffffff;
                }

                .login-button {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white;
                    font-weight: bold;
                    padding: 12px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    transition: background-color 0.3s;
                }

                .login-button:hover {
                    background-color: #1e40af;
                }
            `}</style>
        </div>
    );
}