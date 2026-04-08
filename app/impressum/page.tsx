'use client'

import "./impressum.css"
import { getSessionUser } from "@/hooks/useUser"


export default function Page() {
    return (
        <div className="legal-container">
            <div className="legal-card">
                <h1>Impressum</h1>


                    <section>
                        <h2>Kontakt</h2>

                        <p>
                            <br />
                            E-Mail: nospighost@gmail.com<br />
                            Discord: nospighost
                        </p>
                    </section>




                <section>
                    <h2>Hosting</h2>
                    <p>
                        Diese Website wird gehostet bei Vercel
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
