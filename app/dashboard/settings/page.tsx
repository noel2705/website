
import LogOutButton from "@/components/buttons/LogOutButton";
import DeleteAccountButton from "@/components/buttons/DeleteAccountButton";
import ThemeSettings from "@/components/dashboard/settings/ThemeSettings";
import AuctionSettings from "@/components/dashboard/settings/AuctionSettings";

export default function DashboardSettings() {
    return (
        <div className="dashboard-page dashboard-stack">
            <ThemeSettings/>
            <AuctionSettings/>

            <section className="dashboard-panel">
                <h1>Einstellungen</h1>

                <LogOutButton/>
                <DeleteAccountButton/>
            </section>
        </div>
    )
}
