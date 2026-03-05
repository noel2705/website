'use client'

import { useEffect, useState } from "react"
import { getMeCached } from "@/lib/utils/meClient"

export function isLogin() {
    const [uuid, setUuid] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUuid() {
            const data = await getMeCached()
            setUuid(data?.uuid ?? null)
            setLoading(false)
        }

        fetchUuid()
    }, [])

    return { uuid, loading }
}



