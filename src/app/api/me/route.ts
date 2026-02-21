import { NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/jwt"

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    try {
        const payload = verifyJWT(token)
        return NextResponse.json({ uuid: payload.sub })
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
}