import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export default async function Dashboard() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/login")
    }

    try {
        const payload = verifyJWT(token!)

        return <div>Willkommen, du bist eingeloggt!</div>
    } catch (err) {
        // Token ungültig → Login
        redirect("/login")
    }
}