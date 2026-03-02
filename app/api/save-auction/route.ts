import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            return NextResponse.json(
                { error: 'Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY' },
                { status: 500 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        const res = await fetch('https://api.opsucht.net/auctions/active')
        const auctions = await res.json()

        const expired = auctions.filter(
            (a: any) => new Date(a.endTime).getTime() < Date.now()
        )

        if (expired.length === 0) {
            return NextResponse.json({ saved: 0 })
        }

        const { data, error } = await supabase
            .from('expired_auctions')
            .insert(expired)

        if (error) throw error



        // @ts-ignore
        console.log('Gespeichert:', data.length)

        // @ts-ignore
        return NextResponse.json({ saved: data.length })
    } catch (err) {
        console.error('Fehler beim Speichern abgelaufener Auktionen:', err)
        return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
}
