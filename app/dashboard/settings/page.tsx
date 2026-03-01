
import LogOutButton from "@/components/buttons/LogOutButton";
import DeleteAccountButton from "@/components/buttons/DeleteAccountButton";

export default function DashboardSettings() {
    return (
        <div className="dashboard-page dashboard-stack">
            <section className="dashboard-panel">
                <h1>Einstellungen</h1>

                <LogOutButton/>
                <DeleteAccountButton/>
            </section>
        </div>
    )
}
