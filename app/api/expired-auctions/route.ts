import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/utils/db";

export async function GET(req: NextRequest) {
    try {
        const uid = req.nextUrl.searchParams.get("uid");
        const category = req.nextUrl.searchParams.get("category");
        const limitRaw = req.nextUrl.searchParams.get("limit");

        const limitNum = Number(limitRaw ?? "200");
        const limit = Number.isFinite(limitNum)
            ? Math.max(1, Math.min(500, limitNum))
            : 200;

        if (uid) {
            const row = await db.oneOrNone(
                `
                SELECT payload
                FROM expired_auctions
                WHERE uid = $1
                `,
                [uid]
            );

            if (!row) {
                return NextResponse.json(null);
            }

            return NextResponse.json(row.payload);
        }

        const rows =
            category && category !== "*"
                ? await db.any(
                    `
                        SELECT payload
                        FROM expired_auctions
                        WHERE payload->>'category' = $1
                        ORDER BY end_time DESC
                        LIMIT $2
                      `,
                    [category, limit]
                )
                : await db.any(
                    `
                        SELECT payload
                        FROM expired_auctions
                        ORDER BY end_time DESC
                        LIMIT $1
                      `,
                    [limit]
                );

        return NextResponse.json(
            rows.map((row: { payload: unknown }) => row.payload)
        );
    } catch (err) {
        console.error("Fehler beim Laden abgelaufener Auktionen:", err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        );
    }
}