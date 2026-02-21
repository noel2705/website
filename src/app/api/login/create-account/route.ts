import { db } from "@/lib/db"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
    try {
        const { mc_name, password } = await req.json()

        if (!mc_name || !password) {
            return new Response(JSON.stringify({ error: "Fehlende Daten" }), { status: 400 })
        }

        if (password.length < 6) {
            return new Response(JSON.stringify({ error: "Passwort zu kurz" }), { status: 400 })
        }

        const existingUser = await db.oneOrNone("SELECT mc_uuid FROM users WHERE mc_name = $1", [mc_name])
        if (existingUser) {
            return new Response(JSON.stringify({ error: "Du hast bereits einen Account!" }), { status: 400 })
        }

        const resUuid = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mc_name}`)
        if (!resUuid.ok) {
            return new Response(JSON.stringify({ error: "Spieler nicht gefunden" }), { status: 404 })
        }
        const playerData = await resUuid.json()
        const mc_uuid = playerData.id

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.none(
            "INSERT INTO users (mc_uuid, mc_name, password, verified, created_at) VALUES ($1, $2, $3, $4, $5)",
            [mc_uuid, mc_name, hashedPassword, true, new Date()]
        )

        await db.none(
            'INSERT INTO shards ("mc_uuid", "totalShards", "shardsGoal", "tradeHistory") VALUES ($1, $2, $3, $4)',
            [mc_uuid, 0, 0, []]
        )
        return new Response(JSON.stringify({ success: true }), { status: 200 })

    } catch (err: any) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message || "Server Error" }), { status: 500 })
    }
}