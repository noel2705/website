import { NextResponse } from "next/server";
import { db } from "@/lib/utils/db";
import { ensureExpiredAuctionsV2Table } from "@/lib/utils/auction/db";

export async function POST() {
    try {
        await ensureExpiredAuctionsV2Table(db);
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: (err as Error).message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return POST();
}
