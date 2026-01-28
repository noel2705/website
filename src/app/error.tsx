"use client";

export default function Error({



                                  error,
                                  reset,
                              }: {
    error: Error;
    reset: () => void;
}) {


    const styles = {
        container: {
            height: "100vh",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
        },
        button: {
            padding: "10px 16px",
            cursor: "pointer",
        },
    };


    return (
        <div style={styles.container}>
            <h2>Ups 😵‍💫</h2>
            <p>Etwas ist schiefgelaufen.</p>

            <button onClick={reset} style={styles.button}>
                Erneut versuchen
            </button>
        </div>
    );
}
