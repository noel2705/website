'use client'

import { useState, useEffect } from 'react'
import './login.css'

export default function LoginPage() {
    const [mcName, setMcName] = useState('')
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
        try {
            const res = await fetch('/api/login/mc-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mc_name: mcName, code }),
            })

            if (!res.ok) {
                const text = await res.text()
                console.error("Server hat kein JSON zurückgegeben:", text)
                setStatus(`❌ Fehler bei Verifizierung`)
                return
            }


            const data = await res.json()



            if (data.verified) {
                setVerified(true)
                setStatus('✅ Du wurdest verifiziert! Du kannst nun einen Account erstellen.')
                if (polling) { // @ts-ignore
                    clearInterval(polling)
                    setPolling(null)
                }
            } else {
                setStatus('⏳ Warten auf Item im Auktionshaus …')
            }
        } catch (err: any) {
            setStatus(`❌ ${err.message}`)
            if (polling) { // @ts-ignore
                clearInterval(polling)
                setPolling(null)
            }
        }
    }

    const startPolling = () => {
        if (verified || polling) return
        const interval = setInterval(checkVerification, 5000)
        setPolling(interval)
    }

    useEffect(() => {
        return () => {
            if (polling) { // @ts-ignore
                clearInterval(polling)
            }
        }
    }, [polling])



    const createAccount = async () => {
        if (!verified) {
            setStatus('❌ Du musst dich zuerst verifizieren!')
            return
        }

        try {
            const res = await fetch('/api/login/create-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mc_name: mcName, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                setStatus(`❌ ${data.error}`)
                return
            }

            setStatus('✅ Account erstellt! Du kannst dich jetzt einloggen.')
            setHasPassword(true)
        } catch (err: any) {
            setStatus(`❌ ${err.message}`)
        }
    }

    const loginHandler = async () => {
        setStatus('⏳ Login läuft...')
        try {
            const res = await fetch('/api/login/check-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mc_name: mcName, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                setStatus(`❌ ${data.error}`)
                return
            }
            setStatus('✅ Login erfolgreich!')
            window.location.href = '/dashboard'
        } catch (err: any) {
            setStatus(`❌ ${err.message}`)
        }
    }

    return (
        <>
            {registerMode && !verified ? (
                <div className="login-container">
                    <h1>Minecraft Register</h1>
                    {!code ? (
                        <>
                            <input placeholder="Minecraft Name" value={mcName} onChange={e => setMcName(e.target.value)} />
                            <button onClick={generateCode}>Code generieren</button>
                            <button onClick={() => setRegisterMode(false)}>Du hast bereits einen Account?</button>
                        </>
                    ) : (
                        <>
                            <h2>{code}</h2>
                            <button onClick={() => { checkVerification(); startPolling(); }}>
                                Verifizieren & starten
                            </button>
                            <br />
                            <button onClick={() => {
                                if (polling) { // @ts-ignore
                                    clearInterval(polling)
                                }
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
                    <input placeholder="Minecraft Name" value={mcName} onChange={e => setMcName(e.target.value)} />
                    {!hasPassword && verified ? (
                        <>
                            <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />
                            <button onClick={createAccount}>Account erstellen</button>
                        </>
                    ) : (
                        <>
                            <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />
                            <button onClick={loginHandler}>Login</button>
                        </>
                    )}
                    {!verified && <button onClick={() => setRegisterMode(true)}>Du hast noch keinen Account?</button>}
                    {status && <p className="status">{status}</p>}
                </div>
            )}
        </>
    )
}