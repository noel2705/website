'use server'
import { verifyJWT } from "../utils/jwt"
import {cookies} from "next/headers";

export async function logoutUser() {
    try {
        const cookieStore = await cookies()

        cookieStore.set("token", "", {
            maxAge: 0,
            path: "/",
        })

        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Logout fehlgeschlagen" + e}
    }
}


export async function checkLoginStatus() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) return { loggedIn: false }

        verifyJWT(token)

        return { loggedIn: true }
    } catch {
        return { loggedIn: false }
    }
}



export async function getAuthUser() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value
        if (!token) return null

        const payload = verifyJWT(token)
        return payload.sub
    } catch {
        return null
    }
}