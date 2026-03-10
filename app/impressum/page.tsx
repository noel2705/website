import "./impressum.css"
export default function Page() {
    return (
        <div className="legal-container">
            <div className="legal-card">
                <h1>Impressum</h1>


                <section>
                    <h2>Kontakt</h2>
                    <p>
                        E-Mail: nospighost@gmail.com<br />
                        Discord: nospighost
                    </p>
                </section>

                <section>
                    <h2>Verantwortlich für den Inhalt</h2>
                    <p>
                        nospighost<br />
                    </p>
                </section>

                <section>
                    <h2>Hosting</h2>
                    <p>
                        Diese Website wird gehostet bei Vercel Inc.
                    </p>
                </section>

                <section>
                    <h2>Probleme?</h2>
                    <p>
                        Melde dich per Discord bei mir<br />
                    </p>
                </section>
            </div>
        </div>
    );
}
