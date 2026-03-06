import { NextResponse } from "next/server";
import { db } from "@/lib/utils/db";
import { normalizeAuction, normalizeAuctions } from "@/lib/utils/auction/normalize";
import { ensureExpiredAuctionsV2Table } from "@/lib/utils/auction/db";

export async function GET() {
    try {
        const response = await fetch("https://api.opsucht.net/auctions/active", {
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `API Fehler: ${response.status}` },
                { status: 502 }
            );
        }

        const auctions = normalizeAuctions(await response.json());
        const now = new Date();
        const saveThreshold = 60_000;

        const toSave = auctions.filter(
            (a) =>
                a.uid &&
                a.endTime &&
                new Date(a.endTime).getTime() <= now.getTime() + saveThreshold
        );

        const result = await db.tx(async (t) => {
            await ensureExpiredAuctionsV2Table(t);

            for (const rawAuction of toSave) {
                const auction = normalizeAuction(rawAuction);
                await t.none(
                    `
                        INSERT INTO expired_auctions_v2 (
                            uid, seller, category, material, icon, amount, display_name,
                            lore, enchantments, start_bid, current_bid, highest_bidder,
                            bids, start_time, end_time, expired_at, payload
                        )
                        VALUES (
                            $1, $2, $3, $4, $5, $6, $7,
                            $8::jsonb, $9::jsonb, $10, $11, $12,
                            $13::jsonb, $14::timestamptz, $15::timestamptz, NOW(), $16::jsonb
                        )
                        ON CONFLICT (uid) DO UPDATE SET
                            seller = EXCLUDED.seller,
                            category = EXCLUDED.category,
                            material = EXCLUDED.material,
                            icon = EXCLUDED.icon,
                            amount = EXCLUDED.amount,
                            display_name = EXCLUDED.display_name,
                            lore = EXCLUDED.lore,
                            enchantments = EXCLUDED.enchantments,
                            start_bid = EXCLUDED.start_bid,
                            current_bid = EXCLUDED.current_bid,
                            highest_bidder = EXCLUDED.highest_bidder,
                            bids = EXCLUDED.bids,
                            start_time = EXCLUDED.start_time,
                            end_time = EXCLUDED.end_time,
                            payload = EXCLUDED.payload
                    `,
                    [
                        auction.uid,
                        auction.seller,
                        auction.category,
                        auction.item.material,
                        auction.item.icon,
                        auction.item.amount,
                        auction.item.displayName ?? auction.item.material,
                        JSON.stringify(auction.item.lore ?? []),
                        JSON.stringify(auction.item.enchantments ?? {}),
                        auction.startBid,
                        auction.currentBid,
                        auction.highestBidder,
                        JSON.stringify(auction.bids ?? {}),
                        auction.startTime,
                        auction.endTime,
                        JSON.stringify(auction),
                    ]
                );
            }

            return { saved: toSave.length };
        });

        return NextResponse.json(result);
    } catch (err) {
        console.error("Fehler beim Speichern:", err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        );
    }
}
