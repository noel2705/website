import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
    const { data: auctions, error } = await supabaseServer
        .from('expired_auctions')
        .select('*');

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const clean = auctions?.map(a => ({
        ...a,
        bids: a.extra?.bids ?? {},
        highestBidder: a.extra?.highestBidder ?? null,
    }));

    return new Response(JSON.stringify(clean ?? []));
}
