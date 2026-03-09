'use client'

import React from "react"

type LockedSectionProps = {
    locked?: boolean
    children: React.ReactNode
    message?: string
}

export default function LockedSection({ locked = false, children, message }: LockedSectionProps) {

    return (
        <div style={{ position: "relative" }}>

            {children}

            {locked && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        backdropFilter: "blur(2px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        zIndex: 10,
                        color: "white",
                        fontWeight: 600
                    }}
                >

                    {message || "Für dieses Feature muss du dich anmelden!"}
                </div>
            )}

        </div>
    )
}