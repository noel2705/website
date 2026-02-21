import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            tradeHistory = [],
            totalShards = 0,
            shardsGoal = 0,
            userID
        } = body

        if (!userID) {
            return NextResponse.json(
                { success: false, error: "userID fehlt" },
                { status: 400 }
            )
        }

        await db.none(
            `
                INSERT INTO shards (mc_uuid, "totalShards", "shardsGoal", "tradeHistory")
                VALUES ($1, $2, $3, $4::jsonb)
                    ON CONFLICT (mc_uuid)
        DO UPDATE SET
                    "totalShards" = EXCLUDED."totalShards",
                                   "shardsGoal" = EXCLUDED."shardsGoal",
                                   "tradeHistory" = EXCLUDED."tradeHistory";
            `,
            [userID, totalShards, shardsGoal, JSON.stringify(tradeHistory)]
        )
        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error("Fehler beim Speichern der Shards:", err.message || err)
        return NextResponse.json(
            { success: false, error: err.message || "Unbekannter Fehler" },
            { status: 500 }
        )
    }
}

// Optional: GET für Debugging
export async function GET() {
    return NextResponse.json(
        { message: "Nur POST erlaubt für Import" },
        { status: 405 }
    )
}