import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/utils/db";

export async function GET(req: NextRequest) {
    try {
        await db.none(`
            CREATE TABLE IF NOT EXISTS expired_auctions (
                uid TEXT PRIMARY KEY,
                end_time TIMESTAMPTZ NOT NULL,
                payload JSONB NOT NULL
            )
        `);

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
        const hasExpiredAt = await db.one<{ exists: boolean }>(
            `
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'expired_auctions'
                      AND column_name = 'expired_at'
                ) AS exists
            `
        );
        const timeColumn = hasExpiredAt.exists ? "expired_at" : "end_time";

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
                ? limit === null
                    ? await db.any(
                        `
                            SELECT payload, ${timeColumn} AS cursor_time
                            FROM expired_auctions
                            WHERE payload->>'category' = $1
                              AND ($2::timestamptz IS NULL OR ${timeColumn} >= $2::timestamptz)
                              AND (
                                  $3::text IS NULL
                                  OR LOWER(COALESCE(payload->'item'->>'displayName', '')) LIKE '%' || $3 || '%'
                                  OR LOWER(COALESCE(payload->'item'->>'material', '')) LIKE '%' || $3 || '%'
                              )
                            ORDER BY ${timeColumn} DESC
                          `,
                        [category, sinceExpiredAt, searchQuery]
                    )
                    : await db.any(
                        `
                            SELECT payload, ${timeColumn} AS cursor_time
                            FROM expired_auctions
                            WHERE payload->>'category' = $1
                              AND ($2::timestamptz IS NULL OR ${timeColumn} >= $2::timestamptz)
                              AND (
                                  $3::text IS NULL
                                  OR LOWER(COALESCE(payload->'item'->>'displayName', '')) LIKE '%' || $3 || '%'
                                  OR LOWER(COALESCE(payload->'item'->>'material', '')) LIKE '%' || $3 || '%'
                              )
                            ORDER BY ${timeColumn} DESC
                            LIMIT $4
                          `,
                        [category, sinceExpiredAt, searchQuery, limit]
                    )
                : limit === null
                    ? await db.any(
                        `
                            SELECT payload, ${timeColumn} AS cursor_time
                            FROM expired_auctions
                            WHERE ($1::timestamptz IS NULL OR ${timeColumn} >= $1::timestamptz)
                              AND (
                                  $2::text IS NULL
                                  OR LOWER(COALESCE(payload->'item'->>'displayName', '')) LIKE '%' || $2 || '%'
                                  OR LOWER(COALESCE(payload->'item'->>'material', '')) LIKE '%' || $2 || '%'
                              )
                            ORDER BY ${timeColumn} DESC
                          `,
                        [sinceExpiredAt, searchQuery]
                    )
                    : await db.any(
                        `
                            SELECT payload, ${timeColumn} AS cursor_time
                            FROM expired_auctions
                            WHERE ($1::timestamptz IS NULL OR ${timeColumn} >= $1::timestamptz)
                              AND (
                                  $2::text IS NULL
                                  OR LOWER(COALESCE(payload->'item'->>'displayName', '')) LIKE '%' || $2 || '%'
                                  OR LOWER(COALESCE(payload->'item'->>'material', '')) LIKE '%' || $2 || '%'
                              )
                            ORDER BY ${timeColumn} DESC
                            LIMIT $3
                          `,
                        [sinceExpiredAt, searchQuery, limit]
                    );

        const totalCountRow =
            category && category !== "*"
                ? await db.one<{ count: string }>(
                    `
                        SELECT COUNT(*)::text AS count
                        FROM expired_auctions
                        WHERE payload->>'category' = $1
                          AND (
                              $2::text IS NULL
                              OR LOWER(COALESCE(payload->'item'->>'displayName', '')) LIKE '%' || $2 || '%'
                              OR LOWER(COALESCE(payload->'item'->>'material', '')) LIKE '%' || $2 || '%'
                          )
                      `,
                    [category, searchQuery]
                )
                : await db.one<{ count: string }>(
                    `
                        SELECT COUNT(*)::text AS count
                        FROM expired_auctions
                        WHERE (
                            $1::text IS NULL
                            OR LOWER(COALESCE(payload->'item'->>'displayName', '')) LIKE '%' || $1 || '%'
                            OR LOWER(COALESCE(payload->'item'->>'material', '')) LIKE '%' || $1 || '%'
                        )
                      `
                    ,
                    [searchQuery]
                );

        const totalCount = Number(totalCountRow.count);

        return NextResponse.json({
            items: rows.map((row: { payload: unknown }) => row.payload),
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
