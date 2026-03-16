import AuctionUserClientView from "@/components/opsucht/auction/AuctionUserClientView";

export default async function AuctionPage({
                                              params,
                                          }: {
    params: { userID: string };
}) {
    const { userID } = await params;
    return (
        <div className="app-shell">
            <AuctionUserClientView userID={userID} isDashBoardView={false} />
        </div>
    );
}
