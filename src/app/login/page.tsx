'use client'

import { useState, useEffect } from 'react'
import './login.css'

export default function LoginPage() {
    const [mcName, setMcName] = useState('')
    const [code, setCode] = useState('')
    const [status, setStatus] = useState('')
    const [polling, setPolling] = useState<NodeJS.Timer | null>(null)
    const [verified, setVerified] = useState(false)
    const generateCode = () => {
        const c = Math.random().toString(36).substring(2, 8).toUpperCase()
        setCode(c)
        setStatus('Code generiert! Stelle ein Item mit diesem Namen ins Auktionshaus.')
    }

    const checkVerification = async () => {
        if (verified) return

        try {
            const res = await fetch('/api/mc-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mc_name: mcName, code }),
            })
            const data = await res.json()

            if (data.verified) {
                setVerified(true)
                setStatus('✅ Spieler verifiziert!')
                if (polling) { // @ts-ignore
                    clearInterval(polling)
                }
            } else {
                setStatus('⏳ Warten auf Item im Auktionshaus …')
            }
        } catch (err: any) {
            setStatus(`❌ ${err.message}`)
            if (polling) { // @ts-ignore
                clearInterval(polling)
            }
        }
    }

    const startPolling = () => {
        if (verified) return
        if (polling) { // @ts-ignore
            clearInterval(polling)
        }
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

    return (
        <div className="login-container">
            <h1>Minecraft Login</h1>
            {!code ? (
                <>
                    <input
                        placeholder="Minecraft Name"
                        value={mcName}
                        onChange={e => setMcName(e.target.value)}
                    />
                    <button onClick={generateCode}>Code generieren</button>
                </>
            ) : (
                <>
                    <p>Stelle ein Item ins Auktionshaus mit Namen:</p>
                    <h2>{code}</h2>
                    <button onClick={() => { checkVerification(); startPolling() }}>
                        Verifizieren & Polling starten
                    </button>
                </>
            )}
            {status && <p className="status">{status}</p>}
        </div>
    )
}
