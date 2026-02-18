import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) return null

    try {
        return verifyJWT(token)
    } catch {
        return null
    }
}
