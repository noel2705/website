import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/utils/jwt";
import { db } from "@/lib/utils/db";
import { getUserSettings } from "@/lib/utils/userSettings.server";

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

type UserStats = {
    visit_count: number | string | null;
    login_streak: number | string | null;
    best_login_streak: number | string | null;
};

let userDataSchemaReady = false;
let userDataSchemaPromise: Promise<void> | null = null;

function toNumber(value: number | string | null | undefined): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

async function ensureUserDataSchema(): Promise<void> {
    if (userDataSchemaReady) return;
    if (userDataSchemaPromise) return userDataSchemaPromise;

    userDataSchemaPromise = (async () => {
        await db.none(`
            CREATE TABLE IF NOT EXISTS user_data (
                mc_uuid TEXT PRIMARY KEY,
                login_streak NUMERIC DEFAULT 0,
                visit_count NUMERIC DEFAULT 0
            )
        `);

        await db.none(`
            ALTER TABLE user_data
            ADD COLUMN IF NOT EXISTS last_visit_date DATE
        `);

        await db.none(`
            ALTER TABLE user_data
            ADD COLUMN IF NOT EXISTS best_login_streak NUMERIC DEFAULT 0
        `);

        await db.none(`
            ALTER TABLE user_data
            ADD COLUMN IF NOT EXISTS last_streak_date DATE
        `);

        userDataSchemaReady = true;
    })()
        .catch(() => {
        })
        .finally(() => {
            userDataSchemaPromise = null;
        });

    return userDataSchemaPromise;
}

async function updateDailyUserStats(mcUUID: string): Promise<{
    visitCount: number;
    loginStreak: number;
    bestLoginStreak: number;
} | null> {
    try {
        const stats = await db.one<UserStats>(
            `
                INSERT INTO user_data (mc_uuid, login_streak, visit_count, best_login_streak, last_visit_date, last_streak_date)
                VALUES ($1, 1, 1, 1, CURRENT_DATE, CURRENT_DATE)
                ON CONFLICT (mc_uuid)
                    DO UPDATE SET
                        visit_count = COALESCE(user_data.visit_count, 0) + 1,
                        login_streak = CASE
                                           WHEN user_data.last_streak_date = CURRENT_DATE THEN COALESCE(user_data.login_streak, 0)
                                           WHEN user_data.last_streak_date = CURRENT_DATE - 1
                                               THEN COALESCE(user_data.login_streak, 0) + 1
                                           ELSE 1
                            END,
                        best_login_streak = GREATEST(
                                COALESCE(user_data.best_login_streak, 0),
                                CASE
                                    WHEN user_data.last_streak_date = CURRENT_DATE THEN COALESCE(user_data.login_streak, 0)
                                    WHEN user_data.last_streak_date = CURRENT_DATE - 1
                                        THEN COALESCE(user_data.login_streak, 0) + 1
                                    ELSE 1
                                END
                                            ),
                        last_visit_date = CURRENT_DATE,
                        last_streak_date = CASE
                                               WHEN user_data.last_streak_date = CURRENT_DATE THEN user_data.last_streak_date
                                               ELSE CURRENT_DATE
                            END
                RETURNING visit_count, login_streak, best_login_streak
            `,
            [mcUUID]
        );

        return {
            visitCount: toNumber(stats.visit_count),
            loginStreak: toNumber(stats.login_streak),
            bestLoginStreak: toNumber(stats.best_login_streak),
        };
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

    try {
        const payload = verifyJWT(token) as { sub: string };

        const user = await db.oneOrNone(
            "SELECT mc_uuid, permissions, mc_name,  password FROM users WHERE mc_uuid = $1",
            [payload.sub]
        );

        if (!user) {
            return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
        }

        await ensureUserDataSchema();
        const stats = await updateDailyUserStats(user.mc_uuid);
        const settings = await getUserSettings(user.mc_uuid);

        return NextResponse.json({
            uuid: user.mc_uuid,
            name: user.mc_name,
            permissions: normalizePermissions(user.permissions),
            password: user.password,
            visitCount: stats?.visitCount ?? null,
            loginStreak: stats?.loginStreak ?? null,
            bestLoginStreak: stats?.bestLoginStreak ?? null,
            settings
        });
    } catch {
        return NextResponse.json({ error: "Ungültiger Token" }, { status: 401 });
    }
}
