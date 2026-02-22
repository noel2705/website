import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import AuctionView from "@/components/opsucht/auction/AuctionView";
import {formatUUID} from "@/lib/auction";

export default async function DashboardAuctions() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const payload = verifyJWT(token);
    const uuid = payload.sub as string;

    return <AuctionView userID={formatUUID(uuid)} />;
}