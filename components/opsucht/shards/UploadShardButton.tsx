'use client'

import { useState, useRef } from "react"
import Folder from "@/components/icon/animated/FolderIcon"
import "../../css/shard/UploadShardButton.css"

export default function UploadShardButton({ onUploadSuccess }: { onUploadSuccess: () => void }) {
    const [message, setMessage] = useState("Drücke auf den Ordner, um deine Shard-Daten zu importieren")
    const [loading, setLoading] = useState(false)
    const [folderOpen, setFolderOpen] = useState(false)
    const [folderKey, setFolderKey] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const fileDialogOpen = useRef(false)

    const resetFolder = (delay: number = 0) => {
        setTimeout(() => {
            setFolderOpen(false)
            setMessage("Drücke auf den Ordner, um deine Shard-Daten zu importieren")
            setFolderKey(prev => prev + 1)
        }, delay)
    }

    const handleFocusBack = () => {
        if (!fileDialogOpen.current) return

        fileDialogOpen.current = false
        window.removeEventListener("focus", handleFocusBack)

        if (!fileInputRef.current?.files?.length) {
            setMessage("Keine Datei ausgewählt ❌")
            resetFolder(2250)
        }
    }

    const handleClickFolder = () => {
        if (!fileInputRef.current) return

        fileInputRef.current.value = ""
        setFolderOpen(true)
        setMessage("Datei auswählen…")

        fileDialogOpen.current = true
        window.addEventListener("focus", handleFocusBack)

        fileInputRef.current.click()
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        fileDialogOpen.current = false
        window.removeEventListener("focus", handleFocusBack)

        const file = event.target.files?.[0]
        if (!file) return

        setLoading(true)
        setMessage("")

        try {
            const resUUID = await fetch("/api/me")
            const dataUUID = await resUUID.json()
            const uuid = dataUUID.mc_uuid || dataUUID.uuid

            if (!uuid) {
                setMessage("Fehler: Benutzer nicht erkannt ❌")
                resetFolder(2000)
                setLoading(false)
                return
            }

            const text = await file.text()
            const data = JSON.parse(text)

            if (!data.tradeHistory || data.totalShards === undefined || data.shardsGoal === undefined) {
                setMessage("Ungültige Datei. Hast du die richtige ausgewählt? ❌")
                resetFolder(2000)
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
                resetFolder(2200)
            } else {
                setMessage("Fehler beim Speichern ❌")
                resetFolder(2500)
            }
        } catch (err) {
            console.error(err)
            setMessage("Fehler beim Lesen oder Parsen der Datei ❌")
            resetFolder(2500)
        }

        setLoading(false)
    }

    return (
        <div className="upload-shard-container">
            <div className="folder-wrapper" onClick={handleClickFolder}>
                <Folder
                    key={folderKey}
                    size={0.75}
                    isOpen={folderOpen}
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={loading}
                />
            </div>

            {loading && <p className="upload-message">Lade Daten…</p>}
            {message && <p className="upload-message">{message}</p>}
        </div>
    )
}