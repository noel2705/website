// app/api/admin/users/[uuid]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/utils/db"
import {
    forbiddenResponse,
    getAuthUserFromRequest,
    hasPermission,
    unauthorizedResponse
} from "@/lib/api/security";
import { sendDiscordWebhook } from "@/lib/utils/discordWebhook";

type UserPermissionRow = {
    mc_uuid: string;
    mc_name: string;
    permissions: string | null;
};

function normalizePermissions(input: unknown): string[] {
    if (Array.isArray(input)) {
        return input.map((value) => String(value).trim()).filter(Boolean);
    }

    if (typeof input !== "string") return [];

    const raw = input.trim();
    if (!raw) return [];

    const pgArray = raw.startsWith("{") && raw.endsWith("}") ? raw.slice(1, -1) : raw;

    return pgArray
        .split(",")
        .map((value) => value.trim().replace(/^"(.*)"$/, "$1"))
        .filter(Boolean);
}

function buildPermissionDiff(oldPermissions: string[], newPermissions: string[]): string {
    const oldSet = new Set(oldPermissions);
    const newSet = new Set(newPermissions);

    const removed = oldPermissions.filter((permission) => !newSet.has(permission));
    const added = newPermissions.filter((permission) => !oldSet.has(permission));

    const lines = [
        ...removed.map((permission) => `- ${permission}`),
        ...added.map((permission) => `+ ${permission}`),
    ];

    if (!lines.length) return "Keine Änderung";
    return `\`\`\`diff\n${lines.join("\n")}\n\`\`\``;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ uuid: string }> }) {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return unauthorizedResponse();
    if (!hasPermission(authUser, "view.admin.panel")) return forbiddenResponse();

    const { uuid } = await context.params;
    const body = await req.json() as { permissions?: unknown };

    if (!Array.isArray(body.permissions)) throw new Error("permissions must be an array");

    const normalizedPermissions = body.permissions
        .map((value) => String(value).trim())
        .filter(Boolean);

    const permissionsString = `{${normalizedPermissions.join(",")}}`;

    const [targetUser, actorUser] = await Promise.all([
        db.oneOrNone<UserPermissionRow>(
            "SELECT mc_uuid, mc_name, permissions FROM users WHERE mc_uuid = $1",
            [uuid]
        ),
        db.oneOrNone<{ mc_name: string | null }>(
            "SELECT mc_name FROM users WHERE mc_uuid = $1",
            [authUser.uuid]
        )
    ]);

    const oldPermissions = normalizePermissions(targetUser?.permissions);

    await db.query(
        `UPDATE users SET permissions = $1 WHERE mc_uuid = $2`,
        [permissionsString, uuid]
    );

    await sendDiscordWebhook({
        title: "Berechtigung geändert",
        color: 0xf59e0b,
        fields: [
            { name: "Admin", value: actorUser?.mc_name ?? authUser.uuid, inline: true },
            { name: "Zieluser", value: targetUser?.mc_name ?? uuid, inline: true },
            { name: "UUID", value: uuid, inline: false },
            {
                name: "Änderungen",
                value: buildPermissionDiff(oldPermissions, normalizedPermissions),
                inline: false
            }
        ]
    });

    return NextResponse.json({ success: true });
}
