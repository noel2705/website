import NoPermission from "@/components/icon/NoPermission";

export default function admin() {
    const isAdmin = false;
    return (
        <div>
            {isAdmin ? (
                <div>
                    <h1>Willkommen auf deinem Profil!</h1>
                    <p>Hier kannst du deine Informationen und Einstellungen verwalten.</p>
                </div>
                ) : (
                    <NoPermission />
                )
            }
        </div>
    );
}