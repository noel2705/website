import { supabaseServer } from "@/lib/supabaseServer";





export async function GET(
    request: Request,
    { params }: { params: { userID: string } }
) {

    const { userID } =  params;

    const { data, error } = await supabaseServer
        .from("JobData")
        .select("*")
        .eq("mc_uuid", userID);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(data);

    return Response.json(data);
}
