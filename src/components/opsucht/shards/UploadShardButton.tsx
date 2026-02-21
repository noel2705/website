'use client'
import { useState } from "react"
import "./css/UploadShardButton.css"

export default function UploadShardButton({ onUploadSuccess }: { onUploadSuccess: () => void }) {
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setLoading(true)
        setMessage("")

        try {
            const resUUID = await fetch("/api/me")
            const dataUUID = await resUUID.json()
            const uuid = dataUUID.mc_uuid || dataUUID.uuid
            if (!uuid) {
                setMessage("Keine UUID gefunden")
                setLoading(false)
                return
            }

            const text = await file.text()
            const data = JSON.parse(text)

            if (!data.tradeHistory || data.totalShards === undefined || data.shardsGoal === undefined) {
                setMessage("Ungültige Datei: fehlende Felder")
                setLoading(false)
                return
            }

            const res = await fetch("/api/shards/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID: uuid,
                    tradeHistory: data.tradeHistory,
                    totalShards: data.totalShards,
                    shardsGoal: data.shardsGoal
                })
            })

            const result = await res.json()

            if (result.success) {
                setMessage("Shard-Daten erfolgreich importiert ✅")
                onUploadSuccess()
            } else {
                setMessage("Fehler beim Speichern ❌")
            }
        } catch (err) {
            console.error(err)
            setMessage("Fehler beim Lesen oder Parsen der Datei ❌")
        }

        setLoading(false)
    }

    return (
        <div className="upload-shard-container">
            <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={loading}
            />
            {loading && <p>Lade Daten…</p>}
            {message && <p>{message}</p>}
        </div>
    )
}