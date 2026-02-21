import { db } from "@/lib/db"
import {normalizeUUID} from "@/lib/auction";


export async function POST(req: Request) {
    try {
        const { mc_name, code } = await req.json()
        if (!mc_name || !code)
            return new Response(JSON.stringify({ error: "Fehlende Daten" }), { status: 400 })

        const resUuid = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mc_name}`)
        if (!resUuid.ok)
            return new Response(JSON.stringify({ error: "Spieler nicht gefunden" }), { status: 400 })
        const { id: uuid } = await resUuid.json()

        const resAH = await fetch("https://api.opsucht.net/auctions/active")
        const auctions = await resAH.json()
        const found = auctions.find((a: any) => normalizeUUID(a.seller) === normalizeUUID(uuid) && (a.item.displayName?.trim() || "") === code.trim())

      if (!found) return new Response(JSON.stringify({ verified: false }), { status: 200 })


        return new Response(JSON.stringify({ verified: true }), { status: 200 })
    } catch (err: any) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message || "Server Error" }), { status: 500 })
    }
}