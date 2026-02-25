'use client'
import {useState, useEffect} from 'react'
import './login.css'

import {loginUser, verifyMinecraftAccount, registerUser, checkUserPassword} from '@/lib/login/auth'
import {generateCode} from "@/lib/login/utils";

export default function LoginModul() {
    const [mcName, setMcName] = useState('')
    const [step, setStep] = useState('Register')
    const [code, setCode] = useState('')
    const [status, setStatus] = useState('')
    const [polling, setPolling] = useState<NodeJS.Timer | null>(null)
    const [verified, setVerified] = useState(false)
    const [registerMode, setRegisterMode] = useState(true)
    const [password, setPassword] = useState('')
    const [hasPassword, setHasPassword] = useState(false)

    useEffect(() => {

        switch (step) {
            case 'Register':

                break;

            case "anvil":
                setCode(generateCode())
        }
    }, [step]);


    useEffect(() => {
        if (!status) return
        const timeout = setTimeout(() => setStatus(''), 3000)
        return () => clearTimeout(timeout)
    }, [status])
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
            if (polling) { //@ts-ignore
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

    const createAccountHandler = async () => {
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
        <div>
            {registerMode ? (
                <div className="container">

                    {step === 'Register' && <div>
                        <h1>Registrieren</h1>
                        <input type={"text"} id={"mcNameInput"} placeholder={"Minecraft Name"} value={mcName ?? ""}
                               onChange={e => setMcName(e.target.value)}/>
                        <button onClick={e => {
                            if (mcName.trim() == "") {
                                setStatus("Du musst einen Namen angeben!")
                                return
                            }
                            setStatus("")
                            setStep("anvil")
                        }}>Minecraft Name Verifizieren
                        </button>
                    </div>

                    }

                    {step === "anvil" && (
                        <div>
                            <h1>Minecraft Verifizierung</h1>
                            <p>Erstelle ein Item mit diesem Code und bennee es im Amboss um: </p>

                            <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"}}>
                                <p className="code-text" style={{margin: 0, userSelect: "all"}}>{code}</p>


                                <span
                                    style={{cursor: "pointer"}}
                                    onClick={() => {
                                        navigator.clipboard.writeText(code)
                                            .then(() => setStatus("✅ Code in die Zwischenablage kopiert!"))
                                            .catch(() => setStatus("❌ Fehler beim Kopieren!"));
                                    }}
                                    title="Code kopieren"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={2} stroke="currentColor" width={24} height={24}>
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7h8M8 11h8M8 15h8M5 7h.01M5 11h.01M5 15h.01M21 7h-1.5a2.5 2.5 0 00-2.5-2.5H7a2.5 2.5 0 00-2.5 2.5H3v14h18V7z"/>
        </svg>
      </span>


                            </div>
                            <br></br>
                            <img src={"/login/anvil.png"} alt="Amboss in Minecraft"/>
                            <button onClick={e => setStep("item-auction")}>Weiter</button>
                            <br></br>
                            <button onClick={() => setStep("Register")}>Zurück</button>
                        </div>
                    )}

                    {step === "item-auction" && <div>

                        <h1>Item Verifizieren</h1>



                    </div>}
                    <h2 className={"status"}>{status}</h2>
                    <br></br>

                    <h3 onClick={e => setRegisterMode(false)}>Du hast bereits einen Account?</h3>
                </div>
            ) : (
                <div className="container">
                    <h1>Login</h1>


                    <h3 onClick={e => setRegisterMode(true)}>Du hast noch keinen Account?</h3>

                    <br></br>

                    <h2 className={"status"}>{status}</h2>

                </div>
            )}


        </div>
    )
}