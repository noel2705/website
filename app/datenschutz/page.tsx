export default function DatenschutzPage() {
  return (
      <main>
        <section className="app-panel legal-panel">
          <h1 className="app-title">Datenschutzerklärung</h1>
          <p className="app-muted">Stand: 01.03.2026</p>

          <h2>1. Verantwortlicher</h2>
          <p>
            Betreiber dieser Website:<br />
            nospighost, Fabian260108<br />
            Kontakt: nospighost oder Fabian260108 auf Discord
          </p>

          <h2>2. Welche Daten werden verarbeitet?</h2>
          <p>
            Bei der Registrierung wird ausschließlich der angegebene Minecraft-Name gespeichert,
            um ein Nutzerkonto bereitzustellen.
          </p>


          <h2>3. Zweck der Datenverarbeitung</h2>
          <p>
            Die Datenverarbeitung erfolgt zur Bereitstellung der Website, zur technischen Sicherheit
            sowie zur Verwaltung der Nutzerkonten.
          </p>

          <h2>4. Hosting</h2>
          <p>
            Diese Website wird bei Vercel Inc., USA, gehostet. Dabei werden technisch notwendige
            Server-Logfiles verarbeitet. Es können Daten in die USA übertragen werden.
          </p>

          <h2>5. Speicherdauer</h2>
          <p>
            Der Minecraft-Name und UUID wird gespeichert, solange das Nutzerkonto besteht.
            Server-Logfiles werden automatisch nach kurzer Zeit gelöscht.
          </p>

          <h2>6. Rechte der Nutzer</h2>
          <p>
            Nutzer haben das Recht auf Auskunft, Berichtigung und Löschung ihrer gespeicherten Daten. Dazu per Discord Melden
          </p>

          <p className="legal-backlink">
            <a href="/">Zur Startseite</a>
          </p>
        </section>
      </main>
  );
}