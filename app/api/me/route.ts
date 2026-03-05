import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/utils/jwt";
import { db } from "@/lib/utils/db";

function normalizePermissions(input: unknown): string[] {
    if (Array.isArray(input)) {
        return input
            .map((value) => String(value).trim())
            .filter(Boolean);
    }

    if (typeof input !== "string") return [];

    const raw = input.trim();
    if (!raw) return [];

    if (raw.startsWith("[") && raw.endsWith("]")) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((value) => String(value).trim())
                    .filter(Boolean);
            }
        } catch {
            // Fall through to Postgres-array parser below.
        }
    }

    const pgArray = raw.startsWith("{") && raw.endsWith("}")
        ? raw.slice(1, -1)
        : raw;

    return pgArray
        .split(",")
        .map((value) => value.trim().replace(/^"(.*)"$/, "$1"))
        .filter(Boolean);
}

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
            permissions: normalizePermissions(user.permissions)
        });
    } catch {
        return NextResponse.json({ error: "Ungültiger Token" }, { status: 401 });
    }
}
