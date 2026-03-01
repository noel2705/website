'use client'

type NoPermissionProps = {
    title?: string
    message?: string
    backHref?: string
}

export default function NoPermission({
    title = "Keine Berechtigung",
    message = "Du hast keine Rechte, diese Kategorie zu nutzen.",
    backHref = "/"
}: NoPermissionProps) {
    return (
        <div className="status-screen">
            <div className="status-card">
                <h1>{title}</h1>
                <p>{message}</p>
                <div className="status-actions">
                    <a href={backHref} className="status-link">Zurueck</a>
                </div>
            </div>
        </div>
    )
}
