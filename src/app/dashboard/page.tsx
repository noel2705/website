import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import LogOutButton from "@/components/dashboard/LogOutButton";
import DashBoardAuctions from "@/components/dashboard/DashBoardAuctions";
import "./dashboard.css";
import ShardComponenetDashboard from "@/components/dashboard/ShardComponenetDashboard";

export default async function Dashboard() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("token");

    if (!cookie || !cookie.value) {
        redirect("/login");
    }

    const token = cookie.value;

    try {
        const payload = verifyJWT(token);
        const uuid = payload.sub as string;

        return (
            <div>
                <div className={"category-container"}>
                    <DashBoardAuctions uuid={uuid} />
                    <ShardComponenetDashboard uuid={uuid}/>

                </div>
                <LogOutButton />
            </div>
        );
    } catch (err) {
        console.error(err);
        redirect("/login");
    }
}