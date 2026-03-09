import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/utils/db"
import {
    forbiddenResponse,
    getAuthUserFromRequest,
    hasPermission,
    unauthorizedResponse
} from "@/lib/api/security";

type DbUserRow = {
    mc_uuid: string;
    mc_name: string;
    verified: boolean;
    created_at: string;
    permissions: string | null;
    visit_count: number | null;
    login_streak: number | null;
};

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUserFromRequest(req);
        if (!authUser) return unauthorizedResponse();
        if (!hasPermission(authUser, "view.admin.panel")) return forbiddenResponse();

        const result = await db.query(`
            SELECT
                u.mc_uuid,
                u.mc_name,
                u.verified,
                u.created_at,
                u.permissions,
                ud.visit_count,
                ud.login_streak
            FROM users u
                     LEFT JOIN user_data ud ON u.mc_uuid = ud.mc_uuid
            ORDER BY u.created_at DESC
        `)

        const rowsFromQuery = (result as { rows?: unknown }).rows;
        const data: DbUserRow[] = Array.isArray(rowsFromQuery)
            ? (rowsFromQuery as DbUserRow[])
            : Array.isArray(result)
                ? (result as DbUserRow[])
                : [];

        const users = data.map(u => ({
                mc_uuid: u.mc_uuid,
                mc_name: u.mc_name,
                verified: u.verified,
                created_at: u.created_at,

                permissions: u.permissions
                    ? u.permissions.replace(/[{}"]/g, "").split(",").map((p: string) => p.trim())
                    : [],

                user_data: u.visit_count !== null
                    ? {
                        visit_count: u.visit_count,
                        login_streak: u.login_streak
                    }
                    : null
            }))

        return NextResponse.json(users)

    } catch (err) {
        console.error("DB Query Error:", err)
        return NextResponse.json(
            { error: "DB Fehler", detail: (err as Error).message },
            { status: 500 }
        )
    }
}
