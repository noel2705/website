import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/utils/db";
import { verifyJWT } from "@/lib/utils/jwt";

type AuthUser = {
    uuid: string;
    permissions: string[];
};

function normalizePermissions(input: unknown): string[] {
    if (Array.isArray(input)) {
        return input.map((value) => String(value).trim()).filter(Boolean);
    }

    if (typeof input !== "string") return [];

    const raw = input.trim();
    if (!raw) return [];

    if (raw.startsWith("[") && raw.endsWith("]")) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map((value) => String(value).trim()).filter(Boolean);
            }
        } catch {
            return [];
        }
    }

    const pgArray = raw.startsWith("{") && raw.endsWith("}") ? raw.slice(1, -1) : raw;
    return pgArray
        .split(",")
        .map((value) => value.trim().replace(/^"(.*)"$/, "$1"))
        .filter(Boolean);
}

export function hasPermission(user: AuthUser, permission: string): boolean {
    if (user.permissions.includes("admin.role")) return true;
    return user.permissions.includes(permission);
}

export async function getAuthUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    try {
        const payload = verifyJWT(token) as { sub: string };
        const user = await db.oneOrNone("SELECT mc_uuid, permissions FROM users WHERE mc_uuid = $1", [payload.sub]);
        if (!user) return null;

        return {
            uuid: user.mc_uuid,
            permissions: normalizePermissions(user.permissions),
        };
    } catch {
        return null;
    }
}

export function unauthorizedResponse(message = "Nicht autorisiert") {
    return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Kein Zugriff") {
    return NextResponse.json({ error: message }, { status: 403 });
}

export function assertInternalApiKey(req: NextRequest): NextResponse | null {
    const configuredKey = process.env.INTERNAL_API_KEY;
    if (!configuredKey) {
        return NextResponse.json(
            { error: "Server-Konfiguration fehlt: INTERNAL_API_KEY" },
            { status: 500 }
        );
    }

    const headerKey = req.headers.get("x-api-key");
    const bearer = req.headers.get("authorization");
    const bearerKey = bearer?.startsWith("Bearer ") ? bearer.slice("Bearer ".length).trim() : null;
    const supplied = headerKey ?? bearerKey;

    if (!supplied || supplied !== configuredKey) {
        return NextResponse.json({ error: "Ungültiger API Key" }, { status: 401 });
    }

    return null;
}
