'use client';
import NoPermission from "@/components/icon/NoPermission";
import {getSessionUser} from "@/hooks/useUser";
import AdminUserList from "@/components/dashboard/admin/AdminUserList";

export default function AdminContent() {
    const {user, loading} = getSessionUser();

    if (loading) return <p>Lade…</p>;
    if (!user || !user.hasPermission("view.admin.panel")) return <NoPermission
        title="🧪 Admin Zugriff  "
        message="Du hast keinen Zugriff auf das Admin-Panel. Bitte wende dich an den Entwickler, um Zugriff zu erhalten."
        backHref="/dashboard"
    />;

    return (
        <AdminUserList></AdminUserList>
    );
}