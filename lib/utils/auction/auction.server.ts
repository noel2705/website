'use server';

import { IUser } from "@/lib/utils/userTypes";
import { db } from "@/lib/utils/db";
import {Page} from "@/lib/utils/types";
import { normalizeAuction, normalizeAuctions } from "@/lib/utils/auction/normalize";


export async function isAuctionMarked(
    user: IUser | null,
    auctionID: string
): Promise<boolean> {

    if (!user) return false;

    const sql = `
        SELECT markedauctions @> $2::jsonb AS marked
        FROM auctions
        WHERE mc_uuid = $1
    `;

    const res = await db?.oneOrNone(sql, [
        user.uuid,
        JSON.stringify([auctionID])
    ]);

    return res?.marked ?? false;
}


export async function setAuctionMarked(
    user: IUser | null,
    auctionID: string
): Promise<void> {

    if (!user) return;

    const sql = `
        INSERT INTO auctions (mc_uuid, markedauctions)
        VALUES ($1, $2::jsonb)
            ON CONFLICT (mc_uuid)
    DO UPDATE SET markedauctions =
                       CASE
                       WHEN auctions.markedauctions @> EXCLUDED.markedauctions THEN auctions.markedauctions
                       ELSE auctions.markedauctions || EXCLUDED.markedauctions
        END
    `;

    await db?.none(sql, [
        user.uuid,
        JSON.stringify([auctionID])
    ]);
}
export async function getAverageItemPrice(itemName: string): Promise<number | null> {
    const sql = `
        SELECT AVG(current_bid) as avg
        FROM expired_auctions_v2
        WHERE LOWER(TRIM(display_name)) = LOWER(TRIM($1))
          AND bids <> '{}'::jsonb
    `;

    const result = await db?.oneOrNone(sql, [itemName]);

    if (!result || result.avg === null) return null;


    return Number(result.avg);
}

export async function unmarkAuction(
    user: IUser | null,
    auctionID: string
): Promise<void> {

    if (!user) return;

    const sql = `
        UPDATE auctions
        SET markedauctions = markedauctions - $1
        WHERE mc_uuid = $2
    `;

    await db?.none(sql, [auctionID, user.uuid]);
}


 async function getMarkedAuctionIDs(userID: string): Promise<string[]> {
    const sql = `
        SELECT markedauctions
        FROM auctions
        WHERE mc_uuid = $1
    `;

    const res = await db?.oneOrNone(sql, [userID]);

    return res?.markedauctions ?? [];
}


 async function getAllActiveAuctions(): Promise<Page[]> {
    const url = "https://api.opsucht.net/auctions/active";

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch auctions");

    return normalizeAuctions(await res.json());
}

async function getExpiredAuctionsByIDs(auctionIDs: string[]): Promise<Page[]> {
    if (auctionIDs.length === 0) return [];

    const sql = `
        SELECT payload
        FROM expired_auctions_v2
        WHERE uid = ANY($1::text[])
    `;

    const rows = await db?.any(sql, [auctionIDs]);
    return (rows ?? []).map((row: { payload: unknown }) => normalizeAuction(row.payload));
}


export async function getMarkedAuctions(userID: string): Promise<Page[]> {
    const markedIDs = await getMarkedAuctionIDs(userID);
    if (markedIDs.length === 0) return [];

    const allAuctions = await getAllActiveAuctions();
    const activeByID = new Map(allAuctions.map((auction) => [auction.uid, auction]));

    const missingIDs = markedIDs.filter((id) => !activeByID.has(id));
    const expiredAuctions = await getExpiredAuctionsByIDs(missingIDs);
    const expiredByID = new Map(expiredAuctions.map((auction) => [auction.uid, auction]));

    const markedAuctions = markedIDs
        .map((id) => activeByID.get(id) ?? expiredByID.get(id))
        .filter((auction): auction is Page => Boolean(auction));

    return markedAuctions;
}
