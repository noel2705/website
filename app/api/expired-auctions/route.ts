import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/utils/db";
import { normalizeAuction } from "@/lib/utils/auction/normalize";
import { ensureExpiredAuctionsV2Table } from "@/lib/utils/auction/db";

export async function GET(req: NextRequest) {
    try {
        await ensureExpiredAuctionsV2Table(db);

        const uid = req.nextUrl.searchParams.get("uid");
        const category = req.nextUrl.searchParams.get("category");
        const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
        const searchQuery = q.length > 0 ? q : null;
        const limitRaw = req.nextUrl.searchParams.get("limit");
        const sinceExpiredRaw = req.nextUrl.searchParams.get("sinceExpiredAt");
        const sinceExpiredAt =
            sinceExpiredRaw && !Number.isNaN(new Date(sinceExpiredRaw).getTime())
                ? sinceExpiredRaw
                : null;

        const isAllLimit = (limitRaw ?? "").toLowerCase() === "all";
        const limitNum = Number(limitRaw ?? "350");
        const limit = isAllLimit
            ? null
            : Number.isFinite(limitNum)
                ? Math.max(1, Math.min(500, limitNum))
                : 200;

        if (uid) {
            const row = await db.oneOrNone(
                `
                    SELECT payload
                    FROM expired_auctions_v2
                    WHERE uid = $1
                `,
                [uid]
            );

            if (!row) {
                return NextResponse.json(null);
            }

            return NextResponse.json(normalizeAuction(row.payload));
        }

        const rows =
            category && category !== "*"
                ? limit === null
                    ? await db.any(
                        `
                            SELECT payload, expired_at AS cursor_time
                            FROM expired_auctions_v2
                            WHERE category = $1
                              AND ($2::timestamptz IS NULL OR expired_at >= $2::timestamptz)
                              AND (
                                  $3::text IS NULL
                                  OR LOWER(display_name) LIKE '%' || $3 || '%'
                                  OR LOWER(material) LIKE '%' || $3 || '%'
                              )
                            ORDER BY expired_at DESC
                        `,
                        [category, sinceExpiredAt, searchQuery]
                    )
                    : await db.any(
                        `
                            SELECT payload, expired_at AS cursor_time
                            FROM expired_auctions_v2
                            WHERE category = $1
                              AND ($2::timestamptz IS NULL OR expired_at >= $2::timestamptz)
                              AND (
                                  $3::text IS NULL
                                  OR LOWER(display_name) LIKE '%' || $3 || '%'
                                  OR LOWER(material) LIKE '%' || $3 || '%'
                              )
                            ORDER BY expired_at DESC
                            LIMIT $4
                        `,
                        [category, sinceExpiredAt, searchQuery, limit]
                    )
                : limit === null
                    ? await db.any(
                        `
                            SELECT payload, expired_at AS cursor_time
                            FROM expired_auctions_v2
                            WHERE ($1::timestamptz IS NULL OR expired_at >= $1::timestamptz)
                              AND (
                                  $2::text IS NULL
                                  OR LOWER(display_name) LIKE '%' || $2 || '%'
                                  OR LOWER(material) LIKE '%' || $2 || '%'
                              )
                            ORDER BY expired_at DESC
                        `,
                        [sinceExpiredAt, searchQuery]
                    )
                    : await db.any(
                        `
                            SELECT payload, expired_at AS cursor_time
                            FROM expired_auctions_v2
                            WHERE ($1::timestamptz IS NULL OR expired_at >= $1::timestamptz)
                              AND (
                                  $2::text IS NULL
                                  OR LOWER(display_name) LIKE '%' || $2 || '%'
                                  OR LOWER(material) LIKE '%' || $2 || '%'
                              )
                            ORDER BY expired_at DESC
                            LIMIT $3
                        `,
                        [sinceExpiredAt, searchQuery, limit]
                    );

        const totalCountRow =
            category && category !== "*"
                ? await db.one<{ count: string }>(
                    `
                        SELECT COUNT(*)::text AS count
                        FROM expired_auctions_v2
                        WHERE category = $1
                          AND (
                              $2::text IS NULL
                              OR LOWER(display_name) LIKE '%' || $2 || '%'
                              OR LOWER(material) LIKE '%' || $2 || '%'
                          )
                    `,
                    [category, searchQuery]
                )
                : await db.one<{ count: string }>(
                    `
                        SELECT COUNT(*)::text AS count
                        FROM expired_auctions_v2
                        WHERE (
                            $1::text IS NULL
                            OR LOWER(display_name) LIKE '%' || $1 || '%'
                            OR LOWER(material) LIKE '%' || $1 || '%'
                        )
                    `,
                    [searchQuery]
                );

        const totalCount = Number(totalCountRow.count);

        return NextResponse.json({
            items: rows.map((row: { payload: unknown }) => normalizeAuction(row.payload)),
            newestExpiredAt:
                rows.length > 0
                    ? rows[0].cursor_time instanceof Date
                        ? rows[0].cursor_time.toISOString()
                        : new Date(rows[0].cursor_time).toISOString()
                    : null,
            totalCount: Number.isFinite(totalCount) ? totalCount : null,
        });
    } catch (err) {
        console.error("Fehler beim Laden abgelaufener Auktionen:", err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        );
    }
}
