'use server';

import { IUser } from "@/lib/utils/userTypes";
import { db } from "@/lib/utils/db";
import {Page} from "@/app/opsucht/auction/types";


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

    const data: Page[] = await res.json();
    return data;
}


export async function getMarkedAuctions(userID: string): Promise<Page[]> {
    const markedIDs = await getMarkedAuctionIDs(userID);
    const allAuctions = await getAllActiveAuctions();

    const markedAuctions = allAuctions.filter(auction => markedIDs.includes(auction.uid));

    return markedAuctions;
}