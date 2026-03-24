import { db } from "./db";
import { getPlayerProfile, isBedrock } from "./minecraftNameResolver";

let mcNamesTableReady = false;
let mcNamesTablePromise: Promise<void> | null = null;

async function ensureMcNamesTable(): Promise<void> {
    if (mcNamesTableReady) return;
    if (mcNamesTablePromise) return mcNamesTablePromise;

    mcNamesTablePromise = db.none(`
        CREATE TABLE IF NOT EXISTS mc_names (
            uuid TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    `)
        .then(() => {
            mcNamesTableReady = true;
        })
        .finally(() => {
            mcNamesTablePromise = null;
        });

    return mcNamesTablePromise;
}

async function fetchJavaName(uuid: string, retry = 2): Promise<string> {
    for (let attempt = 0; attempt <= retry; attempt++) {
        if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 150));
        } else {
            await new Promise((r) => setTimeout(r, 400 * attempt));
        }

        try {
            const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${uuid}`);

            if (!res.ok) {
                if (attempt < retry) {
                    continue;
                }
                throw new Error(`Java-API Fehler ${res.status}`);
            }

            const data = await res.json();
            return data.username || "User nicht gefunden";
        } catch {
            if (attempt < retry) {
                continue;
            }

            if (isBedrock(uuid)) {
                const profile = await getPlayerProfile(uuid);
                return profile.name;
            }
            return "Fehler beim Laden";
        }
    }

    if (isBedrock(uuid)) {
        const profile = await getPlayerProfile(uuid);
        return profile.name;
    }
    return "Fehler beim Laden";
}

async function resolveExternalName(uuid: string): Promise<string> {
    if (isBedrock(uuid)) {
        const profile = await getPlayerProfile(uuid);
        return profile.name;
    }
    return fetchJavaName(uuid);
}

export async function resolveMinecraftName(uuid: string): Promise<string> {
    await ensureMcNamesTable();

    const row = await db.oneOrNone<{ name: string | null }>(
        "SELECT name FROM mc_names WHERE uuid = $1",
        [uuid]
    );

    if (row?.name) {
        return row.name;
    }

    const resolvedName = await resolveExternalName(uuid);

    await db.none(
        "INSERT INTO mc_names (uuid, name) VALUES ($1, $2) ON CONFLICT (uuid) DO UPDATE SET name = EXCLUDED.name",
        [uuid, resolvedName]
    );

    return resolvedName;
}
