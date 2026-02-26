// /lib/actions/auth.ts
'use server'

import { User } from "@/lib/models/User";
import MinecraftNameResolver from "@/lib/utils/minecraftNameResolver";
import bcrypt from "bcrypt";
import { createJWT } from "@/lib/utils/jwt";
import { cookies } from "next/headers";
import { db } from "@/lib/utils/db";
import {normalizeUUID} from "@/lib/utils/auction";

export async function loginUser(mc_name: string, password: string) {
    try {
        const mc_uuid = await new MinecraftNameResolver().getUUID(mc_name);

        if (!mc_uuid) {
            return { error: "Minecraft-Name nicht gefunden" };
        }

        const userData: User[] = await db.any(
            "SELECT mc_uuid, password FROM users WHERE mc_uuid = $1",
            [mc_uuid]
        );

        if (userData.length === 0) {
            return { error: "Du hast noch keinen Account!" };
        }

        const user = userData[0];
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return { error: "Falsches Passwort" };
        }

        const token = createJWT({ sub: user.mc_uuid });
        const cookieStore = await cookies();

        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Serverfehler beim Login" };
    }
}

export async function registerUser(mc_name: string, password: string) {
    try {
        if (!mc_name || !password) {
            return { error: "Fehlende Daten" }
        }

        if (password.length < 6) {
            return { error: "Passwort zu kurz (mind. 6 Zeichen)" }
        }

        const resolver = new MinecraftNameResolver()
        const mc_uuid = await resolver.getUUID(mc_name)

        if (!mc_uuid) {
            return { error: "Minecraft-Name nicht gefunden" }
        }

        const existingUser = await db.oneOrNone(
            "SELECT mc_uuid FROM users WHERE mc_uuid = $1",
            [mc_uuid]
        )

        if (existingUser) {
            return { error: "Du hast bereits einen Account!" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.none(
            "INSERT INTO users (mc_uuid, mc_name, password, verified, created_at) VALUES ($1, $2, $3, $4, $5)",
            [mc_uuid, mc_name, hashedPassword, true, new Date()]
        )

        await db.none(
            'INSERT INTO shards ("mc_uuid", "totalShards", "shardsGoal", "tradeHistory") VALUES ($1, $2, $3, $4)',
            [mc_uuid, 0, 0, []]
        )

        return { success: true }

    } catch (e) {
        console.error(e)
        return { error: "Serverfehler bei der Registrierung" }
    }
}

export async function checkUserPassword(mc_name: string, password: string) {
    try {
        if (!mc_name || !password) {
            return { error: "Fehlende Daten" }
        }

        const user = await db.oneOrNone(
            "SELECT password FROM users WHERE mc_name = $1",
            [mc_name]
        )

        if (!user) {
            return { error: "Benutzer nicht gefunden" }
        }

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return { error: "Falsches Passwort" }
        }

        return { success: true }

    } catch (e) {
        console.error(e)
        return { error: "Serverfehler bei Passwortprüfung" }
    }
}

export async function verifyMinecraftAccount(mc_name: string, code: string) {
    try {
        if (!mc_name || !code) {
            return { error: "Fehlende Daten" }
        }

        const resUuid = await fetch(
            `https://api.mojang.com/users/profiles/minecraft/${mc_name}`
        )


        if (!resUuid.ok) {
            return { error: "Spieler nicht gefunden" }
        }

        const { id: uuid } = await resUuid.json()

        const resAH = await fetch("https://api.opsucht.net/auctions/active")

        const auctions = await resAH.json()

        const found = auctions.find(
            (a: any) =>
                normalizeUUID(a.seller) === normalizeUUID(uuid) &&
                (a.item.displayName?.trim() || "") === code.trim()
        )

        return { verified: Boolean(found)}

    } catch (e) {
        console.error(e)
        return { error: "Serverfehler bei der Verifizierung" }
    }
}

export async function setUserPassword(mc_uuid: string, password: string) {
    try {
        if (!mc_uuid || !password) {
            return { error: "Fehlende Daten" }
        }

        if (password.length < 6) {
            return { error: "Passwort zu kurz" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await db.result(
            "UPDATE users SET password = $1 WHERE mc_uuid = $2",
            [hashedPassword, mc_uuid]
        )

        if (result.rowCount === 0) {
            return { error: "Benutzer nicht gefunden" }
        }

        return { success: true }

    } catch (e) {
        console.error(e)
        return { error: "Serverfehler beim Passwort setzen" }
    }
}

