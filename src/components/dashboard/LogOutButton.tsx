'use client'
export default function LogOutButton() {
    async function handleLogout() {
        try {
            const response = await fetch("/api/logout", {
                method: "POST",
            })

            if (response.ok) {
                window.location.href = "/login"
            } else {
                console.error("Logout fehlgeschlagen")
            }
        } catch (error) {
            console.error("Fehler beim Logout:", error)
        }
    }

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
            Log Out
        </button>
    )
}