import { db } from "@/lib/utils/db";
import { DEFAULT_USER_SETTINGS, mergeUserSettings, UserSettings } from "@/lib/utils/userSettings";

export async function userSettingsTableExists(): Promise<boolean> {
    const row = await db.oneOrNone<{ exists: string | null }>(
        "SELECT to_regclass('public.user_settings') AS exists"
    );
    return Boolean(row?.exists);
}

export async function getUserSettings(mcUuid: string): Promise<UserSettings> {
    const exists = await userSettingsTableExists();
    if (!exists) return DEFAULT_USER_SETTINGS;

    const row = await db.oneOrNone<{ settings: unknown }>(
        "SELECT settings FROM user_settings WHERE mc_uuid = $1",
        [mcUuid]
    );

    return mergeUserSettings(row?.settings as Partial<UserSettings>);
}

export async function saveUserSettings(
    mcUuid: string,
    settings: Partial<UserSettings>
): Promise<UserSettings> {
    const exists = await userSettingsTableExists();
    if (!exists) {
        throw new Error("Settings table not initialized");
    }

    const merged = mergeUserSettings(settings);

    await db.none(
        `
            INSERT INTO user_settings (mc_uuid, settings, created_at, updated_at)
            VALUES ($1, $2::jsonb, NOW(), NOW())
            ON CONFLICT (mc_uuid)
                DO UPDATE SET
                    settings = EXCLUDED.settings,
                    updated_at = NOW()
        `,
        [mcUuid, JSON.stringify(merged)]
    );

    return merged;
}
