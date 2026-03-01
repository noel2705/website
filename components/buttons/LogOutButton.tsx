'use client'
import {logoutUser} from "@/lib/user/userManagement";

export default function LogOutButton() {
    async function handleLogout() {
        try {
           const response = await logoutUser()
            if (response.error) {
                console.error("Logout fehlgeschlagen")
            } else {
                window.location.href = "/login"
            }
        } catch (error) {
            console.error("Fehler beim Logout:", error)
        }
    }

    return (
        <button onClick={handleLogout} className="app-button app-button-danger">
            Log Out
        </button>
    )
}
