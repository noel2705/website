'use server';

import { IUser } from "@/lib/utils/userTypes";
import { db } from "@/lib/utils/db";

export async function isAuctionMarked(
    user: IUser | null,
    auctionID: string
): Promise<boolean> {

    if (!user) return false;

    const sql = `
        SELECT auctions
        FROM auctions
        WHERE mc_uuid = $1
    `;

    const res = await db?.oneOrNone(sql, [user.uuid]);

    return !!res;
}