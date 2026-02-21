import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value
        if (!token) return new Response(JSON.stringify({ loggedIn: false }))

        verifyJWT(token)
        return new Response(JSON.stringify({ loggedIn: true }))
    } catch {
        return new Response(JSON.stringify({ loggedIn: false }))
    }
}