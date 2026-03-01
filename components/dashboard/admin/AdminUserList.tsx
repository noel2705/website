'use client'

import { useEffect, useState } from "react"
import { permissionsList, Permission, ROLE_PRESETS } from "@/lib/permissions"
import "@/components/css/admin.css"

type User = {
    mc_uuid: string
    mc_name: string
    verified: boolean
    created_at: string
    permissions: Permission[]
}

export default function AdminUserList() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState<string | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([])

    const ALL_PERMISSIONS: Permission[] = permissionsList as unknown as Permission[]

    useEffect(() => {
        fetch("/api/admin/getAllUsers")
            .then(res => res.json())
            .then((data: User[]) => {
                setUsers(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("FETCH ERROR:", err)
                setLoading(false)
            })
    }, [])

    if (loading) return <p className="admin-loading">Laedt Benutzer...</p>

    const togglePermission = (perm: Permission) => {
        setSelectedPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        )
    }

    const applyRolePreset = (role: string) => {
        const perms = ROLE_PRESETS[role] || []
        setSelectedPermissions(perms)
    }

    const savePermissions = async (uuid: string) => {
        try {
            const res = await fetch(`/api/admin/user/${uuid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permissions: selectedPermissions })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.detail || "Fehler beim Speichern")

            setUsers(users.map(u => u.mc_uuid === uuid ? { ...u, permissions: selectedPermissions } : u))
            setEditingUser(null)
        } catch (err) {
            console.error("Save Error:", err)
        }
    }

    return (
        <div className="admin-panel">
            <h2>Benutzerverwaltung</h2>

            <div className="admin-user-grid">
                {users.map(u => (
                    <div key={u.mc_uuid} className="admin-user-card">
                        <button
                            className="admin-edit-button"
                            onClick={() => {
                                setEditingUser(u.mc_uuid)
                                setSelectedPermissions([...u.permissions])
                            }}
                        >
                            Bearbeiten
                        </button>

                        <h3>{u.mc_name}</h3>
                        <p>UUID: {u.mc_uuid}</p>
                        <p>Verifiziert: {u.verified ? "Ja" : "Nein"}</p>

                        <div className="admin-permission-list">
                            {u.permissions.map(p => (
                                <span key={p} className="admin-permission-badge">{p}</span>
                            ))}
                        </div>

                        {editingUser === u.mc_uuid && (
                            <div className="admin-edit-area">
                                <div className="admin-role-row">
                                    {Object.keys(ROLE_PRESETS).map(role => (
                                        <button
                                            key={role}
                                            onClick={() => applyRolePreset(role)}
                                            className="admin-role-button"
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>

                                <div className="admin-checkbox-grid">
                                    {ALL_PERMISSIONS.map(p => (
                                        <label key={p} className="admin-permission-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(p)}
                                                onChange={() => togglePermission(p)}
                                            />
                                            {p}
                                        </label>
                                    ))}
                                </div>

                                <button
                                    className="admin-save-button"
                                    onClick={() => savePermissions(u.mc_uuid)}
                                >
                                    Speichern
                                </button>
                            </div>
                        )}

                        <p>Erstellt: {new Date(u.created_at).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
