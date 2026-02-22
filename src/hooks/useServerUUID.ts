import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function getUUID(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("token");
    if (!cookie || !cookie.value) return null;

    try {
        const payload = verifyJWT(cookie.value);
        return payload.sub as string;
    } catch {
        return null;
    }
}