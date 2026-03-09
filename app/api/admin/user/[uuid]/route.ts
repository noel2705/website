// app/api/admin/users/[uuid]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/utils/db"
import {
    forbiddenResponse,
    getAuthUserFromRequest,
    hasPermission,
    unauthorizedResponse
} from "@/lib/api/security";

export async function PATCH(req: NextRequest, context: { params: Promise<{ uuid: string }> }) {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return unauthorizedResponse();
    if (!hasPermission(authUser, "view.admin.panel")) return forbiddenResponse();

    const { uuid } = await context.params;
    const body = await req.json();

    if (!Array.isArray(body.permissions)) throw new Error("permissions must be an array");

    const permissionsString = `{${body.permissions.join(",")}}`;

    await db.query(
        `UPDATE users SET permissions = $1 WHERE mc_uuid = $2`,
        [permissionsString, uuid]
    );

    return NextResponse.json({ success: true });
}
