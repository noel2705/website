import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import { createJWT } from "@/lib/jwt"

export async function POST(req: Request) {
    try {
        const { mc_name, password } = await req.json()
        if (!mc_name || !password)
            return new Response(JSON.stringify({ error: "Fehlende Daten" }), { status: 400 })

        const user = await db.oneOrNone(
            "SELECT password, mc_uuid FROM users WHERE mc_name = $1",
            [mc_name]
        )
        if (!user)
            return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), { status: 404 })

        const match = await bcrypt.compare(password, user.password)
        if (!match)
            return new Response(JSON.stringify({ error: "Falsches Passwort" }), { status: 401 })

        const token = createJWT({ sub: user.mc_uuid })

        return new Response(JSON.stringify({ success: true, mc_uuid: user.mc_uuid }), {
            status: 200,
            headers: {
                "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
                "Content-Type": "application/json",
            },
        })
    } catch (err: any) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message || "Server Error" }), { status: 500 })
    }
}