type DbExecutor = {
  none: (query: string) => Promise<unknown>;
};

export async function ensureExpiredAuctionsV2Table(db: DbExecutor) {
  await db.none(`
    CREATE TABLE IF NOT EXISTS expired_auctions_v2 (
      uid TEXT PRIMARY KEY,
      seller TEXT NOT NULL,
      category TEXT NOT NULL,
      material TEXT NOT NULL,
      icon TEXT NOT NULL,
      amount INTEGER NOT NULL,
      display_name TEXT NOT NULL,
      lore JSONB NOT NULL,
      enchantments JSONB NOT NULL,
      start_bid BIGINT NOT NULL,
      current_bid BIGINT NOT NULL,
      highest_bidder TEXT NOT NULL,
      bids JSONB NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      expired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload JSONB NOT NULL
    )
  `);

  await db.none(`
    CREATE INDEX IF NOT EXISTS idx_expired_auctions_v2_category
    ON expired_auctions_v2 (category)
  `);

  await db.none(`
    CREATE INDEX IF NOT EXISTS idx_expired_auctions_v2_expired_at
    ON expired_auctions_v2 (expired_at DESC)
  `);

  await db.none(`
    CREATE INDEX IF NOT EXISTS idx_expired_auctions_v2_bids
    ON expired_auctions_v2 USING GIN (bids)
  `);
}
