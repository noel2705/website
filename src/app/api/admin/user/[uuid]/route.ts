// app/api/admin/users/[uuid]/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(req: Request, context: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await context.params; // await params hier
    const body = await req.json();

    if (!Array.isArray(body.permissions)) throw new Error("permissions must be an array");

    const permissionsString = `{${body.permissions.join(",")}}`;

    await db.query(
        `UPDATE users SET permissions = $1 WHERE mc_uuid = $2`,
        [permissionsString, uuid]
    );

    return NextResponse.json({ success: true });
}
