import {User} from "@/lib/models/User";
import MinecraftNameResolver from "@/lib/minecraftNameResolver";
import bcrypt from "bcrypt";
import {createJWT} from "@/lib/jwt";
import {cookies} from "next/headers";
import {db} from "@/lib/db";

export async function POST(req: Request) {
    const { mc_name, password } = await req.json()

    const mc_uuid = await new MinecraftNameResolver().getUUID(mc_name)

    if (!mc_uuid) {
        return Response.json({ error: "Minecraft-Name nicht gefunden" }, { status: 404 })
    }

    const userData: User[] = await db.any(
        "SELECT mc_uuid, password FROM users WHERE mc_uuid = $1",
        [mc_uuid]
    )

    if (userData.length === 0) {
        return Response.json({ error: "Du hast noch keinen Account!" }, { status: 404 })
    }

    const user = userData[0]

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
        return Response.json({ error: "Falsches Passwort" }, { status: 401 })
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