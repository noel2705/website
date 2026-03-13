'use client'
import {deleteUserAccount} from "@/lib/user/userManagement";
import {getSessionUser} from "@/hooks/useUser";
import NotLoggedIn from "@/components/icon/NotLogined";
import {useState} from "react";

export default function DeleteAccountButton() {
    const {user, loading} = getSessionUser()
    const [status, setStatus] = useState("Drücke noch 3 mal, um den Account zu löschen.")
    const [pressCount, setPressCount] = useState(1);
    if (loading) {
        return <button disabled className="app-button app-button-danger">Lädt...</button>
    }

    if (!user) return <NotLoggedIn/>

    async function handleDelete() {
        try {
            if (pressCount <= 2) {
                setPressCount(prevState => prevState + 1);
                setStatus("Drücke noch " + (3 - pressCount) + " mal, um den Account zu löschen.")
                return;
            }
            if (!user) return console.error("Kein eingeloggter Benutzer gefunden.")
            const deleteResponse = await deleteUserAccount(user.uuid)
            if (deleteResponse?.error) {
                console.error("Fehler beim Löschen des Accounts:", deleteResponse?.error)
            } else {
                window.location.href = "/login"
            }


        } catch (error) {
            console.error("Fehler beim Logout:", error)
        }
    }

    return (
        <>
            <button onClick={handleDelete} className="app-button app-button-danger">
                Account Löschen
            </button>
            <h1>{status}</h1>

        </>
    )
}
