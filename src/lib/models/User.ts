import { supabaseServer } from "@/lib/supabaseServer"

export class User {
    id: string
    mc_uuid: string
    mc_name: string
    verified: boolean

    constructor(data: any) {
        this.id = data.id
        this.mc_uuid = data.mc_uuid
        this.mc_name = data.mc_name
        this.verified = data.verified
    }

    static async getById(id: string): Promise<User | null> {
        const { data } = await supabaseServer
            .from("users")
            .select("*")
            .eq("id", id)
            .single()

        if (!data) return null

        return new User(data)
    }

    static async getByMcUUID(uuid: string): Promise<User | null> {
        const { data } = await supabaseServer
            .from("users")
            .select("*")
            .eq("mc_uuid", uuid)
            .single()

        if (!data) return null

        return new User(data)
    }


    getName() {
        return this.mc_name
    }

    async getActiveAuctions() {
        const res = await fetch("https://api.opsucht.net/auctions/active")
        const auctions = await res.json()

        return auctions.filter(
            (a: any) =>
                a.seller.replace(/-/g, "").toLowerCase() ===
                this.mc_uuid.replace(/-/g, "").toLowerCase()
        )
    }

    isVerified() {
        return this.verified
    }
}
