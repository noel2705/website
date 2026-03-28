export default function DatenschutzPage() {
  return (
    <section className="app-panel legal-panel">
      <h1 className="app-title">Datenschutzerklärung</h1>
      <p className="app-muted">Stand: 28.03.2026</p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Betreiber dieser Website:<br />
        nospighost<br />
        Kontakt: nospighost auf Discord
      </p>

      <h2>2. Welche Daten werden verarbeitet?</h2>
      <p>
        Bei der Registrierung und Nutzung der Website werden personenbezogene und technische Daten verarbeitet, die zur
        Bereitstellung der Funktionen, zur Sicherheit und zur Verbesserung des Angebots erforderlich sind. Dies umfasst
        insbesondere:
      </p>
      <ul>
        <li>Kontodaten und Profildaten (z. B. Nutzername/IDs)</li>
        <li>Nutzungs- und Interaktionsdaten (z. B. gesetzte Filter, Merkliste, Statistiken)</li>
        <li>Technische Daten (z. B. Geräte-/Browserinformationen, Fehler- und Logdaten)</li>
        <li>Sicherheits- und Authentifizierungsdaten (z. B. Session- oder Zugriffskennungen)</li>
      </ul>
      <p>
        Zusätzlich werden Cookies und lokale Speichermechanismen eingesetzt, um Anmeldung, Einstellungen und die
        Funktionsfähigkeit der Website zu gewährleisten.
      </p>

      <h2>3. Zweck der Datenverarbeitung</h2>
      <p>
        Die Daten werden zur Bereitstellung der Website, Verwaltung der Nutzerkonten, Personalisierung der
        Benutzeroberfläche, Fehleranalyse sowie zur technischen Sicherheit verarbeitet.
      </p>

      <h2>4. Externe Dienste</h2>
      <p>Folgende Dienste/Empfänger werden genutzt:</p>
      <ul>
        <li>Hosting: Vercel Inc., USA</li>
        <li>
          APIs: Mojang, Ashcon, Minetools, mc-api.io, api.opsucht.net/auctions, api.opsucht.net/market,
          api.opsucht.net/merchant/rates
        </li>
      </ul>
      <p>Die Nutzung dieser Dienste kann eine Datenübertragung in die USA beinhalten.</p>

      <h2>5. Speicherdauer</h2>
      <p>
        Daten werden so lange gespeichert, wie es für die Erbringung der Dienste erforderlich ist oder gesetzliche
        Vorgaben dies verlangen. Technische Protokolle werden regelmäßig gelöscht.
      </p>

      <h2>6. Rechte der Nutzer</h2>
      <p>
        Nutzer haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung ihrer Daten.
        Anfragen können über Discord gestellt werden.
      </p>

      <p className="legal-backlink">
        <a href="/">Zur Startseite</a>
      </p>
    </section>
  );
}
