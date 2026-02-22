'use client'

import { useEffect, useState } from "react"

export function isLogin() {
    const [uuid, setUuid] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUuid() {
            try {
                const res = await fetch("/api/me")
                if (!res.ok) throw new Error("Nicht eingeloggt")
                const data = await res.json()
                setUuid(data.uuid)
            } catch {
                setUuid(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUuid()
    }, [])

    return { uuid, loading }
}



