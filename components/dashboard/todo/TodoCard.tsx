'use client';
import {getSessionUser} from "@/hooks/useUser";
import Loading from "@/app/loading";
import NotLoggedIn from "@/components/icon/NotLogined";

export default function TodoCard() {
    const {user, loading} = getSessionUser();

    if (loading) return <Loading></Loading>;
    if (!user) return <NotLoggedIn/>;

    return (
        <div className="dashboard-simple-panel">
            <h2>Todo List</h2>
            <p className="dashboard-note">Hier kommen deine persoenlichen Aufgaben und Erinnerungen hin.</p>
        </div>
    );
}
