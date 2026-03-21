type LoadingProps = {
    text?: string;
};

export default function Loading({ text }: LoadingProps) {
    return (
        <div className="status-screen">
            <div className="status-card app-loader">
                <div className="app-spinner"></div>
                <p>{text ?? "Lädt... Bitte habe etwas Geduld."}</p>
            </div>
        </div>
    );
}