'use client'

import { useState, useEffect } from 'react'
import './login.css'

import {loginUser, verifyMinecraftAccount} from '@/lib/login/auth'
import { registerUser } from '@/lib/login/auth'
import { checkUserPassword } from '@/lib/login/auth'

export default function LoginPage() {
    const [mcName, setMcName] = useState('')
    const [step, setStep] = useState(1)
    const [code, setCode] = useState('')
    const [status, setStatus] = useState('')
    const [polling, setPolling] = useState<NodeJS.Timer | null>(null)
    const [verified, setVerified] = useState(false)
    const [registerMode, setRegisterMode] = useState(true)
    const [password, setPassword] = useState('')
    const [hasPassword, setHasPassword] = useState(false)

    const generateCode = () => {
        const c = Math.random().toString(36).substring(2, 8).toUpperCase()
        setCode(c)
        setStatus('Code generiert! Stelle ein Item mit diesem Namen ins Auktionshaus.')
    }

    const checkVerification = async () => {
        if (verified) return

        const res = await verifyMinecraftAccount(mcName, code)

        if (res.error) {
            setStatus(`❌ ${res.error}`)
            return
        }

        if (res?.verified) {
            setVerified(true)
            setStatus('✅ Du wurdest verifiziert! Du kannst nun einen Account erstellen.')

            if (polling) {
                //@ts-ignore
                clearInterval(polling)
                setPolling(null)
            }
        } else {
            setStatus('⏳ Warten auf Item im Auktionshaus …')
        }
    }

    const startPolling = () => {
        if (verified || polling) return
        const interval = setInterval(checkVerification, 5000)
        setPolling(interval)
    }

    useEffect(() => {
        return () => {
            //@ts-ignore
            if (polling) clearInterval(polling)
        }
    }, [polling])

    const createAccount = async () => {
        if (!verified) {
            setStatus('❌ Du musst dich zuerst verifizieren!')
            return
        }

        const res = await registerUser(mcName, password)

        if (res?.error) {
            setStatus(`❌ ${res.error}`)
            return
        }

        setStatus('✅ Account erstellt! Du kannst dich jetzt einloggen.')
        setHasPassword(true)
    }

    const loginHandler = async () => {
        setStatus('⏳ Login läuft...')

        const check = await checkUserPassword(mcName, password)

        if (check?.error) {
            setStatus(`❌ ${check.error}`)
            return
        }

        const login = await loginUser(mcName, password)

        if (login?.error) {
            setStatus(`❌ ${login.error}`)
            return
        }

        setStatus('✅ Login erfolgreich!')
        window.location.href = '/dashboard'
    }

    return (
        <>
            {registerMode && !verified ? (
                <div className="login-container">
                    <h1>Minecraft Register</h1>

                    {!code ? (
                        <>
                            <input
                                placeholder="Minecraft Name"
                                value={mcName}
                                onChange={e => setMcName(e.target.value)}
                            />

                            <button onClick={generateCode}>Code generieren</button>
                            <button onClick={() => setRegisterMode(false)}>
                                Du hast bereits einen Account?
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>{code}</h2>

                            <button onClick={() => {
                                checkVerification()
                                startPolling()
                            }}>
                                Verifizieren & starten
                            </button>

                            <br />

                            <button onClick={() => {
                                //@ts-ignore
                                if (polling) clearInterval(polling)
                                setPolling(null)
                                setCode('')
                                setVerified(false)
                                setStatus('')
                            }}>
                                Abbrechen
                            </button>
                        </>
                    )}

                    {status && <p className="status">{status}</p>}
                </div>
            ) : (
                <div className="login-container">
                    <h1>User Login</h1>

                    <input
                        placeholder="Minecraft Name"
                        value={mcName}
                        onChange={e => setMcName(e.target.value)}
                    />

                    {!hasPassword && verified ? (
                        <>
                            <input
                                type="password"
                                placeholder="Passwort"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <button onClick={createAccount}>
                                Account erstellen
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="password"
                                placeholder="Passwort"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <button onClick={loginHandler}>
                                Login
                            </button>
                        </>
                    )}

                    {!verified && (
                        <button onClick={() => setRegisterMode(true)}>
                            Du hast noch keinen Account?
                        </button>
                    )}

                    {status && <p className="status">{status}</p>}
                </div>
            )}
        </>
    )
}