'use server'
import {verifyJWT} from "../utils/jwt"
import {cookies} from "next/headers";
import {db} from "@/lib/utils/db";
import {tables} from "@/lib/utils/db";
import { sendDiscordWebhook } from "@/lib/utils/discordWebhook";

export async function logoutUser() {
    try {
        const cookieStore = await cookies()

        cookieStore.set("token", "", {
            maxAge: 0,
            path: "/",
        })

        return {success: true}
    } catch (e) {
        console.error(e)
        return {error: "Logout fehlgeschlagen" + e}
    }
}


export async function checkLoginStatus() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) return {loggedIn: false}

        verifyJWT(token)

        return {loggedIn: true}
    } catch {
        return {loggedIn: false}
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

export async function deleteUserAccount(uuid: string) {

    try {
        if (!uuid) return { error: "Fehlende Daten" }

        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value
        if (!token) return { error: "Nicht eingeloggt" }

        const payload = verifyJWT(token) as { sub?: string }
        if (!payload?.sub || payload.sub !== uuid) return { error: "Nicht autorisiert" }

        const user = await db.oneOrNone<{ mc_name: string | null }>(
            "SELECT mc_name FROM users WHERE mc_uuid = $1",
            [uuid]
        )

        const orderedTables = [...tables.filter((t) => t !== "users"), "users"]

        await db.tx(async (t) => {
            for (const table of orderedTables) {
                const sql = `DELETE FROM ${table} WHERE mc_uuid = $1`
                await t.none(sql, [uuid])
            }
        })

        void sendDiscordWebhook({
            title: "Account gelöscht",
            color: 0xef4444,
            fields: [
                { name: "Name", value: user?.mc_name ?? "Unbekannt" },
                { name: "UUID", value: uuid },
                { name: "Uhrzeit", value: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) },
            ]
        })

        cookieStore.set("token", "", { maxAge: 0, path: "/" })

        return {success: true}
    } catch (err) {
        console.error(err)
        return {error: "Fehler beim Löschen des Accounts melde dich bitte im Discord!"}
    }


}
