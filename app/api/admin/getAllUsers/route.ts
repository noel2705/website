import { NextResponse } from "next/server"
import { db } from "@/lib/utils/db"

export async function GET() {
    try {
        const result = await db.query(`
            SELECT
                mc_uuid,
                mc_name,
                verified,
                created_at,
                permissions
            FROM users
            ORDER BY created_at DESC
        `)

        const data = (result as any).rows ?? result

        const users = Array.isArray(data)
            ? data.map(u => ({
                mc_uuid: u.mc_uuid,
                mc_name: u.mc_name,
                verified: u.verified,
                created_at: u.created_at,
                permissions: u.permissions
                    ? u.permissions.replace(/[{}"]/g, "").split(",").map((p: string) => p.trim())
                    : []
            }))
            : []

        return NextResponse.json(users)
    } catch (err) {
        console.error("DB Query Error:", err)
        return NextResponse.json({ error: "DB Fehler", detail: (err as Error).message }, { status: 500 })
    }
}