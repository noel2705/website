import express from "express";
import { db } from "./db.js";
import { ensureExpiredAuctionsV2Table } from "./auction-db.js";
import { normalizeAuction, normalizeAuctions } from "./normalize.js";

const app = express();
const port = Number(process.env.PORT ?? "3001");

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));

app.use((req: any, res: any, next: any) => {
  const origin = req.headers.origin;
  if (allowedOrigins.length === 0) {
    res.header("Access-Control-Allow-Origin", "*");
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

const getQueryString = (req: any, key: string): string | null => {
  const raw = req.query[key];
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return null;
};

const toIsoOrNull = (value: string | null): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const ensureShardRateHistoryTable = async (conn: any) => {
  await conn.none(`
    CREATE TABLE IF NOT EXISTS public."shardRateHistory" (
      rate jsonb NOT NULL,
      saved_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (saved_at)
    )
  `);
};


app.get("/health", (_req: any, res: any) => {
  res.json({ ok: true });
});

app.get("/api/auctions/init-db", async (_req: any, res: any) => {
  try {
    await ensureExpiredAuctionsV2Table(db);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

app.post("/api/auctions/init-db", async (_req: any, res: any) => {
  try {
    await ensureExpiredAuctionsV2Table(db);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

app.get("/api/save-auction", async (_req: any, res: any) => {
  try {
    const response = await fetch("https://api.opsucht.net/auctions/active", {
      cache: "no-store",
    });

    if (!response.ok) {
      res.status(502).json({ error: `API Fehler: ${response.status}` });
      return;
    }

    const auctions = normalizeAuctions(await response.json());
    const now = Date.now();
    const saveThresholdMs = 120_000;

    const toSave = auctions.filter((entry) => {
      if (!entry.uid || !entry.endTime) return false;
      return new Date(entry.endTime).getTime() <= now + saveThresholdMs;
    });

    const result = await db.tx(async (t: any) => {
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
          ],
        );
      }

      return { saved: toSave.length };
    });

    res.json(result);
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/save-shardrates", async (_req: any, res: any) => {
  try {
    const response = await fetch("https://api.opsucht.net/merchant/rates", {
      cache: "no-store",
    });

    if (!response.ok) {
      res.status(502).json({ error: `API Fehler: ${response.status}` });
      return;
    }

    const rates = await response.json();

    const bySource =
        Array.isArray(rates)
            ? Object.fromEntries(
                rates
                    .filter((entry: any) => entry && typeof entry.source === "string")
                    .map((entry: any) => [entry.source, entry.exchangeRate]),
            )
            : null;

    await ensureShardRateHistoryTable(db);

    await db.none(
      `
        INSERT INTO public."shardRateHistory" (rate)
        VALUES ($1::jsonb)
        ON CONFLICT (saved_at)
        DO UPDATE SET
          rate = EXCLUDED.rate,
          saved_at = NOW()
      `,
      [JSON.stringify(rates)],
    );

    res.json({
      ok: true,
      saved: true,
      count: Array.isArray(rates) ? rates.length : null,
      bySource,
    });
  } catch (err) {
    console.error("Fehler beim Speichern der Shard-Rates:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/shardrates", async (_req: any, res: any) => {
  try {
    await ensureShardRateHistoryTable(db);
    const rows = await db.any<{ rate: unknown; saved_at: string | Date }>(`
      SELECT rate, saved_at
      FROM public."shardRateHistory"
      ORDER BY saved_at DESC
    `);

    res.json(
      rows.map((row) => ({
        savedAt: row.saved_at instanceof Date ? row.saved_at.toISOString() : new Date(row.saved_at).toISOString(),
        rate: row.rate,
      })),
    );
  } catch (err) {
    console.error("Fehler beim Laden der Shard-Rates:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/expired-auctions", async (req: any, res: any) => {
  try {
    await ensureExpiredAuctionsV2Table(db);

    const uid = getQueryString(req, "uid");
    const category = getQueryString(req, "category");
    const sellerRaw = getQueryString(req, "seller");
    const seller = sellerRaw?.trim() ? sellerRaw.trim() : null;
    const bidderRaw = getQueryString(req, "bidder");
    const bidder = bidderRaw?.trim() ? bidderRaw.trim() : null;
    const q = getQueryString(req, "q")?.trim().toLowerCase() ?? "";
    const searchQuery = q.length > 0 ? q : null;
    const limitRaw = getQueryString(req, "limit");
    const sinceExpiredAt = toIsoOrNull(getQueryString(req, "sinceExpiredAt"));

    const isAllLimit = (limitRaw ?? "").toLowerCase() === "all";
    const limitNum = Number(limitRaw ?? "350");
    const limit = isAllLimit ? null : Number.isFinite(limitNum) ? Math.max(1, Math.min(500, limitNum)) : 200;

    if (uid) {
      const row = await db.oneOrNone<{ payload: unknown }>(
        `
          SELECT payload
          FROM expired_auctions_v2
          WHERE uid = $1
        `,
        [uid],
      );

      if (!row) {
        res.json(null);
        return;
      }

      res.json(normalizeAuction(row.payload));
      return;
    }

    const rows =
      category && category !== "*"
        ? limit === null
          ? await db.any<{ payload: unknown; cursor_time: string | Date }>(
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
                  AND ($4::text IS NULL OR seller = $4)
                  AND ($5::text IS NULL OR bids ? $5)
                ORDER BY expired_at DESC
              `,
              [category, sinceExpiredAt, searchQuery, seller, bidder],
            )
          : await db.any<{ payload: unknown; cursor_time: string | Date }>(
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
                  AND ($4::text IS NULL OR seller = $4)
                  AND ($5::text IS NULL OR bids ? $5)
                ORDER BY expired_at DESC
                LIMIT $6
              `,
              [category, sinceExpiredAt, searchQuery, seller, bidder, limit],
            )
        : limit === null
          ? await db.any<{ payload: unknown; cursor_time: string | Date }>(
              `
                SELECT payload, expired_at AS cursor_time
                FROM expired_auctions_v2
                WHERE ($1::timestamptz IS NULL OR expired_at >= $1::timestamptz)
                  AND (
                    $2::text IS NULL
                    OR LOWER(display_name) LIKE '%' || $2 || '%'
                    OR LOWER(material) LIKE '%' || $2 || '%'
                  )
                  AND ($3::text IS NULL OR seller = $3)
                  AND ($4::text IS NULL OR bids ? $4)
                ORDER BY expired_at DESC
              `,
              [sinceExpiredAt, searchQuery, seller, bidder],
            )
          : await db.any<{ payload: unknown; cursor_time: string | Date }>(
              `
                SELECT payload, expired_at AS cursor_time
                FROM expired_auctions_v2
                WHERE ($1::timestamptz IS NULL OR expired_at >= $1::timestamptz)
                  AND (
                    $2::text IS NULL
                    OR LOWER(display_name) LIKE '%' || $2 || '%'
                    OR LOWER(material) LIKE '%' || $2 || '%'
                  )
                  AND ($3::text IS NULL OR seller = $3)
                  AND ($4::text IS NULL OR bids ? $4)
                ORDER BY expired_at DESC
                LIMIT $5
              `,
              [sinceExpiredAt, searchQuery, seller, bidder, limit],
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
                AND ($3::text IS NULL OR seller = $3)
                AND ($4::text IS NULL OR bids ? $4)
            `,
            [category, searchQuery, seller, bidder],
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
              AND ($2::text IS NULL OR seller = $2)
              AND ($3::text IS NULL OR bids ? $3)
            `,
            [searchQuery, seller, bidder],
          );

    const totalCount = Number(totalCountRow.count);

    res.json({
      items: rows.map((row) => normalizeAuction(row.payload)),
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
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Auction backend laeuft auf Port ${port}`);
});
