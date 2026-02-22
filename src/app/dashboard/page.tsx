import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import "./dashboard.css";
import UserName from "@/components/opsucht/auction/UserName";
import {getUUID} from "@/hooks/useServerUUID";

export default async function Dashboard() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("token");
    if (!cookie || !cookie.value) {
        redirect("/login");
    }

    try {
        const uuid = await getUUID();
        if (!uuid) redirect("/login");

        return (
            <div className="dashboard-container">
                <h1>Willkommen <UserName uuid={uuid}/>!</h1>
                <h3>Dies ist dein Dashboard. Drücke auf die Felder auf deiner Linken seite, um auf die Funktionen
                    zuzugreifen</h3>
            </div>
        );
    } catch (err) {
        console.error(err);
        redirect("/login");
    }
}