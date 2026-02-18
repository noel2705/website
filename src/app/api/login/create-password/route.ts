import bcrypt from "bcrypt"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(req: Request) {
    const { mc_uuid, password } = await req.json()

    if (!password || password.length < 6) {
        return new Response("Passwort zu kurz", { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await supabaseServer
        .from("users")
        .update({ password_hash: hashed })
        .eq("mc_uuid", mc_uuid)

    return new Response(JSON.stringify({ success: true }))
}
