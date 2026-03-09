'use client'
import { useEffect } from "react"
import ThemeProvider from "@/components/theme/ThemeProvider"
import NavigationBar from "@/components/NavigationBar"

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        const blockKeys = (e: KeyboardEvent) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
                (e.ctrlKey && e.key === "u")
            ) {
                e.preventDefault()
            }
        }

        const blockContext = (e: MouseEvent) => e.preventDefault()

        document.addEventListener("keydown", blockKeys)
        document.addEventListener("contextmenu", blockContext)

        return () => {
            document.removeEventListener("keydown", blockKeys)
            document.removeEventListener("contextmenu", blockContext)
        }
    }, [])

    return (
        <body>
        <ThemeProvider>
            <NavigationBar />
            {children}
        </ThemeProvider>
        </body>
    )
}