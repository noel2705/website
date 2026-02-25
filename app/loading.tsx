export default function Loading() {
    const styles = {
        container: {
            height: "100vh",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
        },
        spinner: {
            width: "40px",
            height: "40px",
            border: "4px solid #ccc",
            borderTop: "4px solid #00ffff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.spinner}></div>
            <p>Lädt… Bitte habe etwas Geduld!</p>
        </div>
    );
}
