import LogOutButton from "@/components/buttons/LogOutButton";

export default function DashboardSettings() {
    return (
        <div className="dashboard-page dashboard-stack">
            <section className="dashboard-panel">
                <h1>Einstellungen</h1>
                <p>Hier kannst du deine Konto-Einstellungen und Session verwalten.</p>
                <LogOutButton/>
            </section>
        </div>
    )
}
