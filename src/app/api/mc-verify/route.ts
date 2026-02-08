import { supabaseServer } from '@/lib/supabaseServer'

const normalizeUUID = (id: string) => id.replace(/-/g, '').toLowerCase()

export async function POST(req: Request) {
    try {
        const { mc_name, code } = await req.json()
        if (!mc_name || !code) return new Response(JSON.stringify({ error: 'Fehlende Daten' }), { status: 400 })

        const resUuid = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mc_name}`)
        if (!resUuid.ok) return new Response(JSON.stringify({ error: 'Spieler nicht gefunden' }), { status: 400 })
        const playerData = await resUuid.json()
        const uuid = playerData.id

        const resAH = await fetch('https://api.opsucht.net/auctions/active')
        if (!resAH.ok) return new Response(JSON.stringify({ error: 'Auktionshaus API fehlerhaft' }), { status: 500 })
        const auctions = await resAH.json()

        const found = auctions.find((a: any) => {
            const sellerUUID = normalizeUUID(a.seller)
            const itemName = a.item.displayName?.trim() || ''
            return sellerUUID === normalizeUUID(uuid) && itemName === code.trim()
        })

        if (!found) return new Response(JSON.stringify({ verified: false }), { status: 200 })

        await supabaseServer.from('users').upsert({
            mc_uuid: uuid,
            mc_name,
            verified: true,
            updated_at: new Date().toISOString()
        })

        return new Response(JSON.stringify({ verified: true }), { status: 200 })
    } catch (err: any) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message || 'Server Error' }), { status: 500 })
    }
}
