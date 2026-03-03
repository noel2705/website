import { NextResponse } from "next/server";
import { db } from "@/lib/utils/db";

type Auction = {
    uid: string;
    endTime: string;
    [key: string]: unknown;
};

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

        const auctions: Auction[] = await response.json();

        if (!Array.isArray(auctions)) {
            return NextResponse.json(
                { error: "Ungültige API-Antwort" },
                { status: 502 }
            );
        }

        const now = new Date();
        const saveThreshold = 60_000;


        const toSave = auctions.filter(
            (a) =>
                a?.uid &&
                a?.endTime &&
                new Date(a.endTime).getTime() <= now.getTime() + saveThreshold
        );

        const result = await db.tx(async (t) => {
            await t.none(`
                CREATE TABLE IF NOT EXISTS expired_auctions (
                    uid TEXT PRIMARY KEY,
                    end_time TIMESTAMPTZ NOT NULL,
                    payload JSONB NOT NULL
                )
            `);
            await t.none(`
                ALTER TABLE expired_auctions
                ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ
            `);
            await t.none(`
                UPDATE expired_auctions
                SET expired_at = end_time
                WHERE expired_at IS NULL
            `);

            for (const auction of toSave) {
                await t.none(
                    `
                        INSERT INTO expired_auctions (uid, end_time, payload, expired_at)
                        VALUES ($1, $2::timestamptz, $3::jsonb, NOW())
                        ON CONFLICT (uid) DO NOTHING
                    `,
                    [auction.uid, auction.endTime, JSON.stringify(auction)]
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
