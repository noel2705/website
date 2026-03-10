'use client'

type MeData = {
    uuid: string
    permissions: string[]
    visitCount: number
    password: string
    loginStreak: number
    bestLoginStreak: number
}

function normalizePermissions(input: unknown): string[] {
    if (Array.isArray(input)) {
        return input
            .map((value) => String(value).trim())
            .filter(Boolean)
    }

    if (typeof input !== "string") return []

    const raw = input.trim()
    if (!raw) return []

    if (raw.startsWith("{") && raw.endsWith("}")) {
        return raw
            .slice(1, -1)
            .split(",")
            .map((value) => value.trim().replace(/^"(.*)"$/, "$1"))
            .filter(Boolean)
    }

    if (raw.startsWith("[") && raw.endsWith("]")) {
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                return parsed
                    .map((value) => String(value).trim())
                    .filter(Boolean)
            }
        } catch {
            return []
        }
    }

    return []
}

let meCache: MeData | null | undefined
let meRequest: Promise<MeData | null> | null = null

export async function getMeCached(): Promise<MeData | null> {
    if (meCache !== undefined) return meCache
    if (meRequest) return meRequest

    meRequest = (async () => {
        try {
            const res = await fetch("/api/me")
            if (!res.ok) {
                meCache = null
                return null
            }

            const data = await res.json()
            const uuid = data?.uuid ?? data?.mc_uuid
            if (!uuid) {
                meCache = null
                return null
            }

            meCache = {
                uuid,
                bestLoginStreak: data.bestLoginStreak,
                password: data.password,
                visitCount: data.visitCount,
                loginStreak: data.loginStreak,
                permissions: normalizePermissions(data?.permissions)
            }
            return meCache
        } catch {
            meCache = null
            return null
        } finally {
            meRequest = null
        }
    })()

    return meRequest
}

export function clearMeCache() {
    meCache = undefined
    meRequest = null
}
