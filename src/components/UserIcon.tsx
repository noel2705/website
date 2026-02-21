'use client'

import { useState, useEffect } from "react"
import Link from "next/link"

export default function UserIcon() {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null)



    useEffect(() => {
        async function checkLogin() {
            try {
                const logged = await isLoggedIn()
                setLoggedIn(logged)
            } catch {
                setLoggedIn(false)
            }
        }

        checkLogin()
    }, [])

    async function isLoggedIn() {
        try {
            const res = await fetch("/api/check-login")
            const data = await res.json()
            return data.loggedIn
        } catch {
            return false
        }
    }


    if (loggedIn === null) return null

    return (
        <>
            {loggedIn ? (
              <Link href={"/dashboard"} className="loginIcon">
                Dein Profil
              </Link>
            ) : (
                <Link href="/login" className="loginIcon">
                    👤
                </Link>
            )}
        </>
    )
}