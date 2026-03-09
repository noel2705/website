import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/utils/db";
import { ensureExpiredAuctionsV2Table } from "@/lib/utils/auction/db";
import { assertInternalApiKey } from "@/lib/api/security";

export async function POST(req: NextRequest) {
    try {
        const keyError = assertInternalApiKey(req);
        if (keyError) return keyError;

        await ensureExpiredAuctionsV2Table(db);
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: (err as Error).message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    return POST(req);
}
