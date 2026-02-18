import bcrypt from "bcrypt"
import { createJWT } from "@/lib/jwt"
import { cookies } from "next/headers"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(req: Request) {
    const { mc_name, password } = await req.json()

    const { data: user } = await supabaseServer
        .from("users")
        .select("*")
        .eq("mc_name", mc_name)
        .single()


    if (!user || !user.password_hash) {
        return new Response("User nicht gefunden", { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
        return new Response("Falsches Passwort", { status: 401 })
    }

    const token = createJWT({ sub: user.mc_uuid })

    const cookieStore = await cookies()

    cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    })

    return new Response(JSON.stringify({ success: true }))
}
