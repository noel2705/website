export default function DatenschutzPage() {
  return (
      <main>
        <section className="app-panel legal-panel">
          <h1 className="app-title">Datenschutzerklärung</h1>
          <p className="app-muted">Stand: 09.03.2026</p>

          <h2>1. Verantwortlicher</h2>
          <p>
            Betreiber dieser Website:<br />
            nospighost, Fabian260108<br />
            Kontakt: nospighost oder Fabian260108 auf Discord
          </p>

          <h2>2. Welche Daten werden verarbeitet?</h2>
          <p>
            Bei der Registrierung und Nutzung der Website werden folgende Daten verarbeitet:
          </p>
          <ul>
            <li>Minecraft-Konto: Name, UUID, Passwort, Erstellungszeitpunkt, Berechtigungen</li>
            <li>Nutzungsstatistiken: Besuchszähler, aktuelle und beste Login-Streak</li>
            <li>Shard-Daten: Trade-Historie, Gesamtzahl der Shards, Shards-Ziel</li>
            <li>Gemerkt Auktionen: markierte Auktionen</li>
          </ul>
          <p>
            Zusätzlich werden Cookies und Browser-Speicher verwendet:
          </p>
          <ul>
            <li>Login-Cookie: <code>token</code> (httpOnly, 7 Tage)</li>
            <li>Browser-Storage: Theme, Auktionsfilter/-cache, UUID→Name Cache</li>
          </ul>

          <h2>3. Zweck der Datenverarbeitung</h2>
          <p>
            Die Daten werden zur Bereitstellung der Website, Verwaltung der Nutzerkonten, Personalisierung der Benutzeroberfläche und zur technischen Sicherheit verarbeitet.
          </p>

          <h2>4. Externe Dienste</h2>
          <p>
            Folgende Dienste/Empfänger werden genutzt:
          </p>
          <ul>
            <li>Hosting: Vercel Inc., USA</li>
            <li>APIs: Mojang, Ashcon, Minetools, mc-api.io, api.opsucht.net/auctions, api.opsucht.net/market, api.opsucht.net/merchant/rates </li>
          </ul>
          <p>Die Nutzung dieser Dienste kann eine Datenübertragung in die USA beinhalten.</p>

          <h2>5. Speicherdauer</h2>
          <p>
            Daten wie UUID, Minecraft-Name, Nutzungsstatistiken, Shard-Daten, markierte Auktionen und Cookies werden gespeichert, solange das Nutzerkonto aktiv ist oder gesetzliche Vorgaben es erfordern.
            Logfiles (Per Discord) werden regelmäßig gelöscht.
          </p>

          <h2>6. Rechte der Nutzer</h2>
          <p>
            Nutzer haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung ihrer Daten. Anfragen können über Discord gestellt werden.
          </p>

          <p className="legal-backlink">
            <a href="/">Zur Startseite</a>
          </p>
        </section>
      </main>
  );
}