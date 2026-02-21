import bcrypt from "bcrypt"
import { db } from "@/lib/db"

export async function POST(req: Request) {
    try {
        const { mc_uuid, password } = await req.json()
        if (!mc_uuid || !password) return new Response(JSON.stringify({ error: "Fehlende Daten" }), { status: 400 })
        if (password.length < 6) return new Response(JSON.stringify({ error: "Passwort zu kurz" }), { status: 400 })

        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await db.result("UPDATE users SET password = $1 WHERE mc_uuid = $2", [hashedPassword, mc_uuid])

        if (result.rowCount === 0) return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), { status: 404 })

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (err: any) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message || "Server Error" }), { status: 500 })
    }
}