'use client'
import { useState, useEffect, useRef } from 'react'
import './css/login.css'

import { loginUser, verifyMinecraftAccount, registerUser, checkUserPassword } from '@/lib/login/auth'
import { generateCode } from "@/lib/login/utils";

export default function LoginModul() {
    const [mcName, setMcName] = useState('')
    const [step, setStep] = useState('Register')
    const [code, setCode] = useState('')
    const [status, setStatus] = useState('')
    const [verified, setVerified] = useState(false)
    const [registerMode, setRegisterMode] = useState(true)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [hasPassword, setHasPassword] = useState(false)

    const polling = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        switch (step) {
            case 'Register':
                break
            case "anvil":
                setCode(generateCode())
                break
            case "verifying":
                setStatus("Beginne mit der Verifikation!")
                startPolling()
                break

            case "createPassword":

                setStatus("")

                break;
        }
    }, [step])


    useEffect(() => {

        setStatus("")
    }, [registerMode]);



    useEffect(() => {
        return () => {
            if (polling.current) clearInterval(polling.current)
        }
    }, [])

    const checkVerification = async () => {
        if (verified) return;

        setStatus("⏳ Prüfe Auktionshaus…");

        const res = await verifyMinecraftAccount(mcName, code);

        if (res.error) {
            setStatus(`❌ ${res.error}`);
            return;
        }

        if (res?.verified) {
            setVerified(true);
            setStatus("✅ Du wurdest verifiziert!");
            if (polling.current) {
                clearInterval(polling.current)
                polling.current = null
            }
            return
        } else {
            setStatus("⏳ Warten auf Item im Auktionshaus …");
        }
    };

    const startPolling = () => {
        if (verified || polling.current) return
        polling.current = setInterval(checkVerification, 5000)
    }

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

        setStatus('✅ Account erstellt!')
        const loginRes =  await loginUser(mcName, password)
        if(loginRes.error){
            setStatus(`Fehler beim Login ${loginRes.error}`)
        }

        setStatus("Erfolgreich Eingeloggt!")

        window.location.href="/dashboard"
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
                            if (mcName.trim() === "") {
                                setStatus("Du musst einen Namen angeben!")
                                return
                            }
                            setStatus("")
                            setStep("anvil")
                        }}>Minecraft Name Verifizieren
                        </button>
                    </div>}

                    {step === "anvil" && (
                        <div>
                            <h1>Minecraft Verifizierung</h1>
                            <p>Nehme ein Item und nenne es im Amboss so um: </p>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                <p className="code-text" style={{ margin: 0, userSelect: "all" }}>{code}</p>
                                <span
                                    style={{ cursor: "pointer" }}
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
                            <br/>
                            <img  src={"/login/anvil.png"} alt="Amboss in Minecraft"/>
                            <button onClick={() => setStep("item-auction")}>Weiter</button>
                            <br/>
                            <button onClick={() => setStep("Register")}>Zurück</button>
                        </div>
                    )}

                    {step === "item-auction" && <div>
                        <h1>Auktionshaus</h1>
                        <p>Stelle das Item, welches du gerade erstellt hast ins Auktionshaus</p>
                        <p>Dauer: 5 Minuten | Startgebot: 1$ </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                            <img src={"/login/auction_1.png"} loading={"lazy"} style={{ maxWidth: "200px" }} />
                            <img src={"/login/auction_2.png"} loading={"lazy"} style={{ maxWidth: "200px" }} />
                        </div>

                        <button onClick={() => setStep("verifying")}>Verifizierung Starten</button>
                        <br/>
                        <button onClick={() => setStep("anvil")}>Zurück</button>
                    </div>}

                    {step === "verifying" && <div>
                        <h1>Dies kann einen Augenblick dauern...</h1>

                        <p id="verifying-status" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "1.2rem" }}>
                            {status}
                            {!verified && <span className="spinner">🔄</span>}
                        </p>

                        {verified && <button onClick={() => setStep("createPassword")}>Weiter</button>}
                    </div>}

                    {step === 'createPassword' && <div>
                        <p>Password:</p>
                        <input id={"passwordInput"} type={"password"} value={password} onChange={e => setPassword(e.target.value)} />
                        <p>wiederholen</p>
                        <input id={"passwordConfirm"} type={"password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

                        <button onClick={() => {
                            if (confirmPassword !== password) {
                                setStatus("Diese Passwörter stimmen nicht überein")
                                return
                            }
                            createAccountHandler()
                        }}>Account Erstellen</button>

                        <h2 className={"status"}>{status}</h2>
                    </div>}

                    <br></br>
                    <h3 onClick={() => setRegisterMode(false)}>Du hast bereits einen Account?</h3>
                </div>
            ) : (
                <div className="container">
                    <h1>Login</h1>

                    <input type={"text"} id={"mcNameInput"} placeholder={"Minecraft Name"} value={mcName ?? ""}
                               onChange={e => setMcName(e.target.value)}/>
                    <input type={"password"} id={"passwordInput"} placeholder={"Passwort"} value={password}
                               onChange={e => setPassword(e.target.value)}/>

                    <button onClick={loginHandler}>Login</button>

                    <br/>
                    <br/>
                    <h3 onClick={() => setRegisterMode(true)}>Du hast noch keinen Account?</h3>

                    <h2 className={"status"}>{status}</h2>
                </div>
            )}
        </div>
    )
}