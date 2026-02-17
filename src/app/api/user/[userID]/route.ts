import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userID: string }> }
) {
    try {
        const { userID } = await context.params;

        const { data, error } = await supabaseServer
            .from("JobData")
            .select("*")
            .eq("mc_uuid", userID);

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { error: "Unexpected error" },
            { status: 500 }
        );
    }
}
