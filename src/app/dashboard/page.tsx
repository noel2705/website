import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"

export default async function Dashboard() {
    const user = await getUser()

    if (!user) {
        redirect("/login")
    }

    return <div>Willkommen {user.name}</div>
}
