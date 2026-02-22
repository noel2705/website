import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

    try {
        const payload = verifyJWT(token) as { sub: string };

        const user = await db.oneOrNone(
            "SELECT mc_uuid, permissions FROM users WHERE mc_uuid = $1",
            [payload.sub]
        );

        if (!user) {
            return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
        }

        return NextResponse.json({
            uuid: user.mc_uuid,
            permissions: user.permissions || []
        });
    } catch {
        return NextResponse.json({ error: "Ungültiger Token" }, { status: 401 });
    }
}