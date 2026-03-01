import AuctionView from "@/components/opsucht/auction/AuctionView";

export default async function AuctionPage({
                                              params,
                                          }: {
    params: { userID: string };
}) {
    const { userID } = await params;
    return (
        <div className="app-shell">
            <AuctionView userID={userID} />
        </div>
    );
}
