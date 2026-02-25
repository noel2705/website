import { db } from "@/lib/utils/db"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    context: { params: Promise<{ userID: string }> }
) {
    const { userID } = await context.params

    try {
        const userData = await db.oneOrNone(
            'SELECT * FROM shards WHERE mc_uuid = $1',
            [userID]
        )

        if (!userData) {
            return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 })
        }

        return NextResponse.json({ user: userData })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}