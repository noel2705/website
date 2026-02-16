import {supabaseServer} from "@/lib/supabaseServer";

export default async function UserPage({
                                                   params,
                                               }: {
    params: Promise<{ userID: string }>;
}) {
    const {userID} = await params;
    const data: User = await getUser(userID);

    return (
        <>
            <h1>{data.goal}</h1>
            <p>UID: {data.uid}</p>
        </>
    );
}

async function getUser(uid: string): Promise<User> {

    const data = await supabaseServer.from("JobData").select("*").eq("mc_uid", uid).single()

    return data as unknown as User;
}

interface User {
    uid: string;
    totalMoney: number;
    todaysMoney: number;
    goal: number;
    todayShards: number;
}