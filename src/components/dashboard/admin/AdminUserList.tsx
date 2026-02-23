'use client'

import { useEffect, useState } from "react"
import { permissionsList, Permission, ROLE_PRESETS } from "@/lib/permissions"

// User-Typ
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

    // Alle Permissions importiert
    const ALL_PERMISSIONS: Permission[] = permissionsList as unknown as Permission[]

    // Fetch Users
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

    if (loading) return <p>Lädt Benutzer...</p>

    // Permission togglen
    const togglePermission = (perm: Permission) => {
        setSelectedPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        )
    }

    // Rollen preset anwenden
    const applyRolePreset = (role: string) => {
        const perms = ROLE_PRESETS[role] || []
        setSelectedPermissions(perms)
    }

    // Speichern
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
        <div style={{ padding: "20px" }}>
            <h2>Benutzerverwaltung</h2>

            <div className="user-grid">
                {users.map(u => (
                    <div key={u.mc_uuid} className="user-card">
                        <button
                            className="edit-button"
                            onClick={() => {
                                setEditingUser(u.mc_uuid)
                                setSelectedPermissions([...u.permissions])
                            }}
                        >
                            Bearbeiten
                        </button>

                        <h3>{u.mc_name}</h3>
                        <p>UUID: {u.mc_uuid}</p>
                        <p>Verifiziert: {u.verified ? "✅" : "❌"}</p>

                        <div className="permission-list">
                            {u.permissions.map(p => (
                                <span key={p} className="permission-badge">{p}</span>
                            ))}
                        </div>

                        {editingUser === u.mc_uuid && (
                            <div style={{ marginTop: "8px" }}>
                                {/* Rollen Presets */}
                                <div style={{ marginBottom: "6px" }}>
                                    {Object.keys(ROLE_PRESETS).map(role => (
                                        <button
                                            key={role}
                                            onClick={() => applyRolePreset(role)}
                                            style={{
                                                marginRight: "6px",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>

                                {/* Einzelne Permissions */}
                                {ALL_PERMISSIONS.map(p => (
                                    <label key={p} className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(p)}
                                            onChange={() => togglePermission(p)}
                                        />
                                        {p}
                                    </label>
                                ))}

                                <button
                                    style={{
                                        marginTop: "6px",
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
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

            {/* Styles */}
            <style jsx>{`
                .user-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .user-card {
                    border: 1px solid #444;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    position: relative;
                }
                .permission-badge {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    margin: 2px 2px 2px 0;
                }
                .edit-button {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background-color: #ff9800;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .edit-button:hover { background-color: #e68a00; }
                .permission-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 8px;
                }
                .permission-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #444;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                }
                @media (prefers-color-scheme: light) {
                    .user-card { background-color: #f5f5f5; color: #111; border: 1px solid #ccc; }
                    .permission-checkbox { background: #ddd; color: #111; }
                }
            `}</style>
        </div>
    )
}