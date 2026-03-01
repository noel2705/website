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

    const uuid = await getUUID();
    if (!uuid) redirect("/login");

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <h1>Willkommen, <UserName uuid={uuid}/>!</h1>
                <h3>
                    Nutze die Navigation links, um Auktionen, Shards und deine Einstellungen schnell zu verwalten.
                </h3>
            </section>
        </div>
    );
}
