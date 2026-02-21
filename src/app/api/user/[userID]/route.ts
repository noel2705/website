import { NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
    params: { userID: string }
}

export async function GET(request: Request, { params }: Params) {
    const { userID } = await params

    try {
        const userData = await db.any('SELECT * FROM users WHERE mc_uuid = $1', userID)
        return NextResponse.json({ user: userData })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}