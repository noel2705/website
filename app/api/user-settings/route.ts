import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/utils/jwt";
import { db } from "@/lib/utils/db";
import { getUserSettings, saveUserSettings, userSettingsTableExists } from "@/lib/utils/userSettings.server";
import { mergeUserSettings, UserSettings } from "@/lib/utils/userSettings";

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
            return [];
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

async function getAuthUser(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload = verifyJWT(token) as { sub: string };
    const user = await db.oneOrNone<{ mc_uuid: string; permissions: unknown }>(
        "SELECT mc_uuid, permissions FROM users WHERE mc_uuid = $1",
        [payload.sub]
    );

    if (!user) return null;

    return {
        uuid: user.mc_uuid,
        permissions: normalizePermissions(user.permissions),
    };
}

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) {
            return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
        }

        const exists = await userSettingsTableExists();
        if (!exists) {
            return NextResponse.json(
                { error: "Settings table nicht initialisiert", needsInit: true },
                { status: 409 }
            );
        }

        const settings = await getUserSettings(authUser.uuid);
        return NextResponse.json({ settings });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) {
            return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
        }

        const canEdit =
            authUser.permissions.includes("settings.auctions.edit") ||
            authUser.permissions.includes("admin.role");

        if (!canEdit) {
            return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
        }

        const exists = await userSettingsTableExists();
        if (!exists) {
            return NextResponse.json(
                { error: "Settings table nicht initialisiert", needsInit: true },
                { status: 409 }
            );
        }

        const lastUpdate = await db.oneOrNone<{ updated_at: string }>(
            "SELECT updated_at FROM user_settings WHERE mc_uuid = $1",
            [authUser.uuid]
        );

        if (lastUpdate?.updated_at) {
            const last = new Date(lastUpdate.updated_at).getTime();
            const now = Date.now();
            if (now - last < 2000) {
                return NextResponse.json(
                    { error: "Bitte nicht so schnell speichern.", retryAfterMs: 2000 },
                    { status: 429 }
                );
            }
        }

        const body = await req.json();
        const incoming = (body?.settings ?? body) as Partial<UserSettings> | null;
        const merged = mergeUserSettings(incoming ?? {});
        const settings = await saveUserSettings(authUser.uuid, merged);

        return NextResponse.json({ settings });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
