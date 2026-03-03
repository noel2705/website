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

        const expired = auctions.filter(
            (a) =>
                a?.uid &&
                a?.endTime &&
                new Date(a.endTime).getTime() <= now.getTime()
        );

        const result = await db.tx(async (t) => {
            await t.none(`
                CREATE TABLE IF NOT EXISTS expired_auctions (
                                                                uid TEXT PRIMARY KEY,
                                                                end_time TIMESTAMPTZ NOT NULL,
                                                                payload JSONB NOT NULL
                )
            `);

            for (const auction of expired) {
                await t.none(
                    `
                        INSERT INTO expired_auctions (uid, end_time, payload)
                        VALUES ($1, $2::timestamptz, $3::jsonb)
                            ON CONFLICT (uid) DO NOTHING
                    `,
                    [
                        auction.uid,
                        auction.endTime,
                        JSON.stringify(auction),
                    ]
                );
            }

            return { saved: expired.length };
        });

        return NextResponse.json(result);
    } catch (err) {
        console.error("Fehler:", err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        );
    }
}