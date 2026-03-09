import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/utils/db"
import {
    forbiddenResponse,
    getAuthUserFromRequest,
    unauthorizedResponse
} from "@/lib/api/security";

export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUserFromRequest(req);
        if (!authUser) return unauthorizedResponse();

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

        if (userID !== authUser.uuid && !authUser.permissions.includes("admin.role")) {
            return forbiddenResponse("Du darfst nur deine eigenen Shard-Daten importieren");
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
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unbekannter Fehler";
        console.error("Fehler beim Speichern der Shards:", errorMessage)
        return NextResponse.json(
            { success: false, error: errorMessage },
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
