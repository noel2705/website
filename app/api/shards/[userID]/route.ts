import { db } from "@/lib/utils/db"
import { NextRequest, NextResponse } from "next/server"
import {
    forbiddenResponse,
    getAuthUserFromRequest,
    unauthorizedResponse
} from "@/lib/api/security";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userID: string }> }
) {
    const { userID } = await context.params
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) return unauthorizedResponse();

    if (authUser.uuid !== userID && !authUser.permissions.includes("admin.role")) {
        return forbiddenResponse("Kein Zugriff auf fremde Shard-Daten");
    }

    try {
        const userData = await db.oneOrNone(
            'SELECT * FROM shards WHERE mc_uuid = $1',
            [userID]
        )

        if (!userData) {
            return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 })
        }

        return NextResponse.json({ user: userData })
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unbekannter Fehler";
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
