// /lib/actions/auth.ts
'use server'

import MinecraftNameResolver from "@/lib/utils/minecraftNameResolver";
import bcrypt from "bcrypt";
import {createJWT} from "@/lib/utils/jwt";
import {cookies} from "next/headers";
import {db} from "@/lib/utils/db";
import {normalizeUUID} from "@/lib/utils/auction/auction";
import { normalizeAuctions } from "@/lib/utils/auction/normalize";
import {defaultPermissions} from "@/lib/permissions";
import { sendDiscordWebhook } from "@/lib/utils/discordWebhook";

function normalizePermissions(input: unknown): string[] {
    if (Array.isArray(input)) {
        return input.map((value) => String(value).trim()).filter(Boolean);
    }

    if (typeof input !== "string") return [];

    const raw = input.trim();
    if (!raw) return [];

    const pgArray = raw.startsWith("{") && raw.endsWith("}") ? raw.slice(1, -1) : raw;
    return pgArray.split(",").map((value) => value.trim().replace(/^"(.*)"$/, "$1")).filter(Boolean);
}

export async function loginUser(mc_name: string, password: string) {
    try {
        let mc_uuid: string | null = null;
        try {
            mc_uuid = await new MinecraftNameResolver({}).getUUID(mc_name);
        } catch(e){
            return {error: "Minecraft-API beim Login nicht erreichbar ||  =>  " + e};
        }

        if (!mc_uuid) {
            return {error: "Minecraft-Name nicht gefunden"};
        }

        let userData: Array<{
            mc_uuid: string;
            password: string;
            login_streak: number | string | null;
            best_login_streak: number | string | null;
        }> = [];
        try {
            userData = await db.any(
                `
                    SELECT
                        u.mc_uuid,
                        u.password,
                        ud.login_streak,
                        ud.best_login_streak
                    FROM users u
                    LEFT JOIN user_data ud ON ud.mc_uuid = u.mc_uuid
                    WHERE u.mc_uuid = $1
                `,
                [mc_uuid]
            );
        } catch {
            return {error: "Datenbankfehler beim Login"};
        }

        if (userData.length === 0) {
            return {error: "Du hast noch keinen Account!"};
        }

        const loginUser = userData[0];
        const valid = await bcrypt.compare(password, loginUser.password);

        if (!valid) {
            return {error: "Falsches Passwort"};
        }

        try {
            const token = createJWT({sub: loginUser.mc_uuid});
            const cookieStore = await cookies();

            cookieStore.set("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 32,
            });
        } catch {
            return {error: "Session konnte nicht erstellt werden"};
        }

        void sendDiscordWebhook({
            title: "Neuer Login",
            color: 0x22c55e,
            fields: [
                { name: "Name", value: mc_name || "unknown" },
                { name: "UUID", value: loginUser.mc_uuid || "unknown" },
                { name: "Login Streak", value: String(loginUser.login_streak ?? 0) },
                { name: "Uhrzeit", value: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) },
            ]
        });

        return {success: true};
    } catch (e) {
        console.error(e);
        return {error: "Unerwarteter Serverfehler beim Login"};
    }
}

export async function registerUser(mc_name: string, password: string) {
    try {
        if (!mc_name || !password) {
            return {error: "Fehlende Daten"}
        }

        if (password.length < 6) {
            return {error: "Passwort zu kurz (mind. 6 Zeichen)"}
        }

        const resolver = new MinecraftNameResolver({})
        const mc_uuid = await resolver.getUUID(mc_name)

        if (!mc_uuid) {
            return {error: "Minecraft-Name nicht gefunden"}
        }

        const existingUser = await db.oneOrNone(
            "SELECT mc_uuid FROM users WHERE mc_uuid = $1",
            [mc_uuid]
        )

        if (existingUser) {
            return {error: "Du hast bereits einen Account!"}
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.none(
            "INSERT INTO users (mc_uuid, mc_name, password, verified, created_at, permissions) VALUES ($1, $2, $3, $4, $5, $6)",
            [mc_uuid, mc_name, hashedPassword, true, new Date(), defaultPermissions]
        )

        await db.none(
            'INSERT INTO shards ("mc_uuid", "totalShards", "shardsGoal", "tradeHistory") VALUES ($1, $2, $3, $4::jsonb)',
            [mc_uuid, 0, 0, JSON.stringify([])]
        )

        void sendDiscordWebhook({
            title: "Neue Registrierung",
            color: 0x3b82f6,
            fields: [
                { name: "Minecraft Name", value: mc_name || "unknown", inline: true },
                { name: "UUID", value: mc_uuid || "unknown", inline: true },
                {
                    name: "Start-Permissions",
                    value: normalizePermissions(defaultPermissions).join(", ") || "keine"
                }
            ]
        });

        return {success: true}

    } catch (e) {
        console.error(e)
        return {error: "Serverfehler bei der Registrierung"}
    }
}

export async function checkUserPassword(mc_name: string, password: string) {
    try {
        if (!mc_name || !password) {
            return {error: "Fehlende Daten"}
        }

        const user = await db.oneOrNone(
            "SELECT password FROM users WHERE mc_name = $1",
            [mc_name]
        )

        if (!user) {
            return {error: "Benutzer nicht gefunden"}
        }

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return {error: "Falsches Passwort"}
        }

        return {success: true}

    } catch (e) {
        console.error(e)
        return {error: "Serverfehler bei Passwortprüfung"}
    }
}

export async function verifyMinecraftAccount(mc_name: string, code: string) {
    try {
        if (!mc_name || !code) {
            return {error: "Fehlende Daten"}
        }

        const stripMinecraftFormatting = (value: string) =>
            value.replace(/\u00a7[0-9A-FK-ORa-fk-or]/g, "");

        const resUuid = await fetch(
            `https://api.mojang.com/users/profiles/minecraft/${mc_name}`
        )

        if (!resUuid.ok) {
            return {error: "Spieler nicht gefunden"}
        }

        const {id: uuid} = await resUuid.json()


        const resAH = await fetch("https://api.opsucht.net/auctions/active")

        if (!resAH.ok) {
            return { error: "Auktionshaus API nicht erreichbar" };
        }

        const auctions = normalizeAuctions(await resAH.json());

        const found = auctions.find(
            (a: any) =>
                normalizeUUID(a.seller) === normalizeUUID(uuid) &&
                stripMinecraftFormatting(a.item.displayName?.trim() || "").trim() === stripMinecraftFormatting(code).trim()
        )


        return {verified: Boolean(found)}

    } catch (e) {
        console.error(e)
        return {error: "Serverfehler bei der Verifizierung () => " + e}
    }
}

export async function setUserPassword(mc_uuid: string, password: string) {
    try {
        if (!mc_uuid || !password) {
            return {error: "Fehlende Daten"}
        }

        if (password.length < 6) {
            return {error: "Passwort zu kurz"}
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await db.result(
            "UPDATE users SET password = $1 WHERE mc_uuid = $2",
            [hashedPassword, mc_uuid]
        )

        if (result.rowCount === 0) {
            return {error: "Benutzer nicht gefunden"}
        }

        return {success: true}

    } catch (e) {
        console.error(e)
        return {error: "Serverfehler beim Passwort setzen"}
    }
}
