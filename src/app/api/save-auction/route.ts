import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const res = await fetch('https://api.opsucht.net/auctions/active');
        const auctions = await res.json();

        const expired = auctions.filter(
            (a: any) => new Date(a.endTime).getTime() < Date.now()
        );

        for (const auction of expired) {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/save-auction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(auction),
            });
        }

        return NextResponse.json({ saved: expired.length });
    } catch (err) {
        console.error('Fehler beim Speichern abgelaufener Auktionen:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
